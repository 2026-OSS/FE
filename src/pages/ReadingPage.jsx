/**
 * ReadingPage Component
 *
 * 실시간 카메라 영상을 기반으로 독서 보조 기능을 제공하는 화면
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { detectInteraction } from '../api/vision'
import { Button } from '../components/common'
import logoImage from '../assets/logo.png'
import ttsGuideImage from '../assets/tts.png'

const CAMERA_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  ACTIVE: 'active',
  DENIED: 'denied',
  INSECURE_CONTEXT: 'insecure-context',
  UNSUPPORTED: 'unsupported',
  ERROR: 'error',
}

const CAMERA_SOURCE = {
  DEVICE: 'device',
  STREAM: 'stream',
}

const CAMERA_MESSAGES = {
  [CAMERA_STATUS.IDLE]: '카메라를 시작하면 실시간 화면이 여기에 표시됩니다.',
  [CAMERA_STATUS.LOADING]: '카메라 권한을 확인하고 있어요.',
  [CAMERA_STATUS.DENIED]: '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 접근을 허용해주세요.',
  [CAMERA_STATUS.INSECURE_CONTEXT]: '휴대폰 브라우저에서는 HTTPS 주소로 접속해야 카메라를 사용할 수 있습니다.',
  [CAMERA_STATUS.UNSUPPORTED]: '현재 브라우저에서는 카메라 기능을 지원하지 않습니다.',
  [CAMERA_STATUS.ERROR]: '카메라를 불러오지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해주세요.',
}

const VISION_POLL_INTERVAL = 1200
const DEFAULT_VOICE_TYPE = import.meta.env.VITE_VOICE_TYPE || 'child'
const DEFAULT_CAMERA_STREAM_URL = import.meta.env.VITE_CAMERA_STREAM_URL || ''
const CUSTOM_CAMERA_KEYWORDS = (import.meta.env.VITE_PREFERRED_CAMERA_KEYWORDS || '')
  .split(',')
  .map((keyword) => keyword.trim().toLowerCase())
  .filter(Boolean)
const CAMERA_RESOLUTION = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
}
const IPHONE_CONTINUITY_CAMERA_KEYWORDS = [
  'iphone',
  'continuity',
  'continuity camera',
  '아이폰',
]
const PHONE_CAMERA_KEYWORDS = [
  'ipad',
  'android',
  'phone',
  'droidcam',
  'camo',
  'epoccam',
  'iriun',
  '휴대폰',
  '핸드폰',
  '폰',
]
const REAR_CAMERA_KEYWORDS = ['back', 'rear', 'environment', 'wide', 'ultra', '후면', '뒷면', '환경']
const FRONT_OR_BUILT_IN_CAMERA_KEYWORDS = ['front', 'user', 'facetime', 'built-in', 'macbook', '전면']
const VOICE_OPTIONS = [
  { value: 'child', label: '아이', pitch: 1.25, rate: 0.95 },
  { value: 'mom', label: '엄마', pitch: 1.05, rate: 0.92 },
  { value: 'dad', label: '아빠', pitch: 0.82, rate: 0.88 },
]

const KOREAN_VOICE_LANGUAGE_PREFIXES = ['ko', 'ko-kr']
const VOICE_NAME_KEYWORDS = {
  child: ['child', 'kid', 'young', 'girl', 'boy', '아이'],
  mom: ['mom', 'mother', 'female', 'woman', '엄마', '여성'],
  dad: ['dad', 'father', 'male', 'man', '아빠', '남성'],
}
const VOICE_FALLBACK_INDEX = {
  child: 0,
  mom: 1,
  dad: 2,
}
const RETRY_GUIDE_TEXTS = [
  '음, 아직 잘 모르겠어. 손끝으로 다시 천천히 가르켜 줘.',
  '음, 아직 잘 모르겠어. 손끝으로 다시 천천히 가리켜 줘.',
]
const BOOK_PAGE_COUNT = 3

const getVoiceOption = (voiceType) =>
  VOICE_OPTIONS.find((option) => option.value === voiceType) || VOICE_OPTIONS[0]

const normalizeVoiceName = (voice) => `${voice?.name || ''} ${voice?.voiceURI || ''}`.toLowerCase()

const isKoreanVoice = (voice) =>
  KOREAN_VOICE_LANGUAGE_PREFIXES.some((prefix) => voice?.lang?.toLowerCase().startsWith(prefix))

const getAvailableSpeechVoices = (voices) => {
  const koreanVoices = voices.filter(isKoreanVoice)
  return koreanVoices.length > 0 ? koreanVoices : voices
}

const getSpeechVoiceForType = (voices, voiceType) => {
  if (!voices.length) {
    return null
  }

  const availableVoices = getAvailableSpeechVoices(voices)
  const keywords = VOICE_NAME_KEYWORDS[voiceType] || []
  const matchedVoice = availableVoices.find((voice) =>
    keywords.some((keyword) => normalizeVoiceName(voice).includes(keyword)),
  )

  if (matchedVoice) {
    return matchedVoice
  }

  const fallbackIndex = VOICE_FALLBACK_INDEX[voiceType] ?? 0
  return availableVoices[Math.min(fallbackIndex, availableVoices.length - 1)] || availableVoices[0]
}

const isCameraSecureContext = () => window.isSecureContext || window.location.hostname === 'localhost'

const getPreferredCameraScore = (device) => {
  const label = device.label.toLowerCase()
  let score = 0

  CUSTOM_CAMERA_KEYWORDS.forEach((keyword) => {
    if (label.includes(keyword)) {
      score += 300
    }
  })

  IPHONE_CONTINUITY_CAMERA_KEYWORDS.forEach((keyword) => {
    if (label.includes(keyword)) {
      score += 200
    }
  })

  PHONE_CAMERA_KEYWORDS.forEach((keyword) => {
    if (label.includes(keyword)) {
      score += 100
    }
  })

  REAR_CAMERA_KEYWORDS.forEach((keyword) => {
    if (label.includes(keyword)) {
      score += 60
    }
  })

  FRONT_OR_BUILT_IN_CAMERA_KEYWORDS.forEach((keyword) => {
    if (label.includes(keyword)) {
      score -= 80
    }
  })

  return score
}

const stopStreamTracks = (stream) => {
  stream?.getTracks().forEach((track) => track.stop())
}

const getAvailableVideoDevices = async ({ requestPermission = false } = {}) => {
  const fallbackConstraints = {
    facingMode: { ideal: 'environment' },
    ...CAMERA_RESOLUTION,
  }

  if (!navigator.mediaDevices?.enumerateDevices) {
    return []
  }

  let permissionProbeStream = null

  try {
    let devices = await navigator.mediaDevices.enumerateDevices()
    const labelsAreHidden = devices
      .filter((device) => device.kind === 'videoinput')
      .some((device) => !device.label)

    if (requestPermission && labelsAreHidden) {
      permissionProbeStream = await navigator.mediaDevices.getUserMedia({
        video: fallbackConstraints,
        audio: false,
      })
      devices = await navigator.mediaDevices.enumerateDevices()
    }

    return devices.filter((device) => device.kind === 'videoinput' && device.deviceId)
  } finally {
    stopStreamTracks(permissionProbeStream)
  }
}

const getPreferredCameraDevice = (devices) =>
  devices
    .map((device, index) => ({
      device,
      index,
      score: getPreferredCameraScore(device),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.device

const getCameraDeviceLabel = (device, index) => device.label || `카메라 ${index + 1}`

const getCameraConstraints = (deviceId) => {
  const fallbackConstraints = {
    facingMode: { ideal: 'environment' },
    ...CAMERA_RESOLUTION,
  }

  if (!deviceId) {
    return fallbackConstraints
  }

  return {
    deviceId: { exact: deviceId },
    facingMode: { ideal: 'environment' },
    ...CAMERA_RESOLUTION,
  }
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const toFiniteNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const getNestedValue = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key]
    }
  }

  return null
}

const getPathValue = (source, path) =>
  path.split('.').reduce((current, key) => current?.[key], source)

const getFirstPathValue = (source, paths) => {
  for (const path of paths) {
    const value = getPathValue(source, path)

    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return null
}

const normalizeLabel = (label) => String(label || '').trim().toLowerCase()

const isRetryGuideText = (text) =>
  RETRY_GUIDE_TEXTS.some((guideText) => normalizeLabel(text) === normalizeLabel(guideText))

const getEffectiveTtsText = (text) => (isRetryGuideText(text) ? '' : text)

const getFrameSize = (source) => {
  const width = toFiniteNumber(
    getNestedValue(source, ['frameWidth', 'imageWidth', 'videoWidth', 'sourceWidth', 'width']),
  )
  const height = toFiniteNumber(
    getNestedValue(source, ['frameHeight', 'imageHeight', 'videoHeight', 'sourceHeight', 'height']),
  )

  return { width, height }
}

const mapPointToFrame = ({ x, y, sourceWidth, sourceHeight, frameWidth, frameHeight, mirrored = false }) => {
  if ([x, y, sourceWidth, sourceHeight, frameWidth, frameHeight].some((value) => !Number.isFinite(value))) {
    return null
  }

  const resolvedX = x <= 1 && y <= 1 ? x * sourceWidth : x
  const resolvedY = x <= 1 && y <= 1 ? y * sourceHeight : y
  const scale = Math.max(frameWidth / sourceWidth, frameHeight / sourceHeight)
  const displayedWidth = sourceWidth * scale
  const displayedHeight = sourceHeight * scale
  const offsetX = (frameWidth - displayedWidth) / 2
  const offsetY = (frameHeight - displayedHeight) / 2
  const mappedX = offsetX + resolvedX * scale
  const mappedY = offsetY + resolvedY * scale

  return {
    x: clamp(mirrored ? frameWidth - mappedX : mappedX, 0, frameWidth),
    y: clamp(mappedY, 0, frameHeight),
  }
}

const mapBoxToFrame = ({ box, sourceWidth, sourceHeight, frameWidth, frameHeight, mirrored = false }) => {
  const isBboxArray = Array.isArray(box) && box.length >= 4
  const x1 = isBboxArray ? toFiniteNumber(box[0]) : null
  const y1 = isBboxArray ? toFiniteNumber(box[1]) : null
  const x2 = isBboxArray ? toFiniteNumber(box[2]) : null
  const y2 = isBboxArray ? toFiniteNumber(box[3]) : null
  const x = isBboxArray ? x1 : toFiniteNumber(getNestedValue(box, ['x', 'left']))
  const y = isBboxArray ? y1 : toFiniteNumber(getNestedValue(box, ['y', 'top']))
  const width = isBboxArray ? x2 - x1 : toFiniteNumber(getNestedValue(box, ['width', 'w']))
  const height = isBboxArray ? y2 - y1 : toFiniteNumber(getNestedValue(box, ['height', 'h']))

  if ([x, y, width, height].some((value) => value === null)) {
    return null
  }

  const start = mapPointToFrame({ x, y, sourceWidth, sourceHeight, frameWidth, frameHeight, mirrored })
  const end = mapPointToFrame({
    x: x + width,
    y: y + height,
    sourceWidth,
    sourceHeight,
    frameWidth,
    frameHeight,
    mirrored,
  })

  if (!start || !end) {
    return null
  }

  const left = Math.min(start.x, end.x)
  const top = Math.min(start.y, end.y)

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${Math.abs(end.x - start.x)}px`,
    height: `${Math.abs(end.y - start.y)}px`,
  }
}

const normalizeFingerTip = (payload) => {
  const source =
    payload?.fingerTip ||
    payload?.fingertip ||
    payload?.finger ||
    payload?.hand?.fingerTip ||
    payload?.hand?.indexFingerTip ||
    payload?.hand ||
    payload?.result?.fingerTip ||
    payload?.result?.fingertip ||
    payload?.data?.fingerTip ||
    payload?.data?.fingertip ||
    null

  if (!source) {
    return null
  }

  const x = toFiniteNumber(getNestedValue(source, ['x', 'cx', 'centerX']))
  const y = toFiniteNumber(getNestedValue(source, ['y', 'cy', 'centerY']))
  const hasCoordinate = x !== null && y !== null
  const detected = getNestedValue(source, ['detected', 'isDetected', 'visible', 'tracked'])

  if (detected === false || !hasCoordinate) {
    return null
  }

  return {
    x,
    y,
    ...getFrameSize(source),
  }
}

const normalizeObjects = (payload) => {
  const objects =
    payload?.objects ||
    payload?.detectedObjects ||
    payload?.detections ||
    payload?.result?.objects ||
    payload?.result?.detectedObjects ||
    payload?.result?.detections ||
    payload?.data?.objects ||
    payload?.data?.detectedObjects ||
    payload?.data?.detections ||
    []

  if (!Array.isArray(objects)) {
    return []
  }

  return objects
    .map((object, index) => {
      const box = object?.bbox || object?.box || object?.boundingBox || object

      return {
        id: object?.id || `${object?.label || 'object'}-${index}`,
        label: object?.label || object?.name || '객체',
        confidence: toFiniteNumber(object?.confidence),
        variant: index % 2 === 0 ? 'primary' : 'accent',
        box,
        ...getFrameSize(object),
      }
    })
    .filter((object) => object.box)
}

const getVisionMessage = (payload) =>
  getFirstPathValue(payload, [
    'message',
    'result.message',
    'data.message',
    'statusMessage',
    'result.statusMessage',
    'data.statusMessage',
  ]) || ''

const getVisionTtsText = (payload) =>
  getFirstPathValue(payload, [
    'ttsText',
    'tts_text',
    'speechText',
    'spokenText',
    'description',
    'explanation',
    'result.ttsText',
    'result.tts_text',
    'result.speechText',
    'result.spokenText',
    'result.description',
    'result.explanation',
    'data.ttsText',
    'data.tts_text',
    'data.speechText',
    'data.spokenText',
    'data.description',
    'data.explanation',
  ]) || ''

const getMatchedObjectLabel = (payload) => {
  const value = getFirstPathValue(payload, [
    'object',
    'objectLabel',
    'match',
    'matchedObject.label',
    'matchedObject.name',
    'matchedObject',
    'targetObject',
    'targetObject.label',
    'targetObject.name',
    'result.object',
    'result.objectLabel',
    'result.match',
    'result.matchedObject.label',
    'result.matchedObject.name',
    'result.matchedObject',
    'result.targetObject',
    'result.targetObject.label',
    'result.targetObject.name',
    'data.object',
    'data.objectLabel',
    'data.match',
    'data.matchedObject.label',
    'data.matchedObject.name',
    'data.matchedObject',
    'data.targetObject',
    'data.targetObject.label',
    'data.targetObject.name',
  ])

  if (typeof value === 'boolean') {
    return null
  }

  if (value && typeof value === 'object') {
    return value.label || value.name || null
  }

  return value || null
}

const getVisionPageLabel = (payload) =>
  getFirstPathValue(payload, [
    'page',
    'pageLabel',
    'page_label',
    'result.page',
    'result.pageLabel',
    'result.page_label',
    'data.page',
    'data.pageLabel',
    'data.page_label',
  ])

const getInteractionMatched = (payload, matchedObjectLabel) => {
  const matched = getFirstPathValue(payload, [
    'matched',
    'isMatched',
    'result.matched',
    'result.isMatched',
    'data.matched',
    'data.isMatched',
  ])

  return matched === true || normalizeLabel(matched) === 'true' || Boolean(matchedObjectLabel)
}

const getInteractionStatusText = ({ isActive, objects, fingerTip, ttsText, message, matched, matchedObjectLabel }) => {
  if (getEffectiveTtsText(ttsText) || !isActive) {
    return ''
  }

  const labels = [...new Set(objects.map((object) => object.label).filter(Boolean))]
  const labelText = labels.length ? ` 감지한 객체: ${labels.slice(0, 3).join(', ')}.` : ''
  const normalizedMatchedObjectLabel = normalizeLabel(matchedObjectLabel)

  if (matched) {
    const objectText = normalizedMatchedObjectLabel
      ? ` 손끝이 ${matchedObjectLabel}을 가리키고 있어요.`
      : ''

    return `찾았어.${objectText} 페이지 설명을 불러오지 못했어요.`
  }

  if (objects.length > 0 && fingerTip) {
    return `객체 ${objects.length}개와 손끝은 인식했지만, 손끝이 어떤 객체를 가리키는지 아직 연결하지 못했어요.${labelText}`
  }

  if (objects.length > 0) {
    return `객체 ${objects.length}개는 인식했지만, 손끝 위치를 아직 찾지 못했어요.${labelText}`
  }

  if (fingerTip) {
    return '손끝은 인식했지만, 설명할 객체를 아직 찾지 못했어요.'
  }

  return message || ''
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22.5" cy="22.5" r="22.5" fill="currentColor" />
      <path
        d="M19.6667 30L13 23.2584L14.6667 21.7416L19.6667 26.7978L31.3333 15L33 16.5169L19.6667 30Z"
        fill="white"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22.5" cy="22.5" r="22.5" fill="currentColor" />
      <path
        d="M16.4 30L15 28.6L20.6 23L15 17.4L16.4 16L22 21.6L27.6 16L29 17.4L23.4 23L29 28.6L27.6 30L22 24.4L16.4 30Z"
        fill="white"
      />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22.5" cy="22.5" r="22.5" fill="currentColor" />
      <path
        d="M22.5 31.5C21.95 31.5 21.4792 31.3042 21.0875 30.9125C20.6958 30.5208 20.5 30.05 20.5 29.5C20.5 28.95 20.6958 28.4792 21.0875 28.0875C21.4792 27.6958 21.95 27.5 22.5 27.5C23.05 27.5 23.5208 27.6958 23.9125 28.0875C24.3042 28.4792 24.5 28.95 24.5 29.5C24.5 30.05 24.3042 30.5208 23.9125 30.9125C23.5208 31.3042 23.05 31.5 22.5 31.5ZM20.5 25.5V13.5H24.5V25.5H20.5Z"
        fill="white"
      />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 6.5C4 5.67157 4.67157 5 5.5 5H8.2L9.4 3.4C9.68314 3.02248 10.1273 2.8 10.5999 2.8H13.4001C13.8727 2.8 14.3169 3.02248 14.6 3.4L15.8 5H18.5C19.3284 5 20 5.67157 20 6.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V6.5ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14Z"
        fill="currentColor"
      />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 7H17V17H7V7Z" fill="currentColor" />
    </svg>
  )
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 5C9.87827 5 7.97378 5.92978 6.67408 7.4H9V9.4H3.4V3.8H5.4V5.9102C7.04937 4.12032 9.40023 3 12 3C16.9706 3 21 7.02944 21 12H19C19 8.13401 15.866 5 12 5ZM5 12C5 15.866 8.13401 19 12 19C14.1217 19 16.0262 18.0702 17.3259 16.6H15V14.6H20.6V20.2H18.6V18.0898C16.9506 19.8797 14.5998 21 12 21C7.02944 21 3 16.9706 3 12H5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 5C9.87827 5 7.97378 5.92978 6.67408 7.4H9V9.4H3.4V3.8H5.4V5.9102C7.04937 4.12032 9.40023 3 12 3C15.6429 3 18.7798 5.16344 20.1939 8.27578L18.3734 9.1033C17.2736 6.68328 14.8334 5 12 5ZM5.62662 14.8967C6.72636 17.3167 9.16659 19 12 19C14.1217 19 16.0262 18.0702 17.3259 16.6H15V14.6H20.6V20.2H18.6V18.0898C16.9506 19.8797 14.5998 21 12 21C8.35706 21 5.22024 18.8366 3.80615 15.7242L5.62662 14.8967Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ProgressStep({ label, status }) {
  const icon = status === 'success' ? <CheckIcon /> : status === 'fail' ? <CloseIcon /> : <AlertIcon />

  return (
    <div className={`reading-step reading-step-${status}`}>
      <span className="reading-step-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="reading-step-label">{label}</span>
    </div>
  )
}

function ReadingPage() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamImageRef = useRef(null)
  const frameRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const lastSpokenTextRef = useRef('')
  const [voiceType, setVoiceType] = useState(getVoiceOption(DEFAULT_VOICE_TYPE).value)
  const [speechVoices, setSpeechVoices] = useState([])
  const [cameraStatus, setCameraStatus] = useState(CAMERA_STATUS.IDLE)
  const [cameraDevices, setCameraDevices] = useState([])
  const [selectedCameraId, setSelectedCameraId] = useState('')
  const [isRefreshingDevices, setIsRefreshingDevices] = useState(false)
  const [cameraSource, setCameraSource] = useState(
    DEFAULT_CAMERA_STREAM_URL ? CAMERA_SOURCE.STREAM : CAMERA_SOURCE.DEVICE,
  )
  const [cameraStreamUrl, setCameraStreamUrl] = useState(DEFAULT_CAMERA_STREAM_URL)
  const [visionStatus, setVisionStatus] = useState({
    isConnected: false,
    fingerTip: null,
    objects: [],
    result: null,
    message: '',
    ttsText: '',
    updatedAt: null,
  })
  const [lastFramePreview, setLastFramePreview] = useState({
    url: '',
    size: 0,
    width: 0,
    height: 0,
  })
  const [currentBookPage, setCurrentBookPage] = useState(1)
  const [pageTurnDirection, setPageTurnDirection] = useState('')

  const clearLastFramePreview = useCallback(() => {
    setLastFramePreview((current) => {
      if (current.url) {
        URL.revokeObjectURL(current.url)
      }

      return {
        url: '',
        size: 0,
        width: 0,
        height: 0,
      }
    })
  }, [])

  const stopCamera = useCallback(() => {
    stopStreamTracks(streamRef.current)
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (streamImageRef.current) {
      streamImageRef.current.removeAttribute('src')
    }

    setVisionStatus({
      isConnected: false,
      fingerTip: null,
      objects: [],
      result: null,
      message: '',
      ttsText: '',
      updatedAt: null,
    })
    clearLastFramePreview()
    setCameraStatus(CAMERA_STATUS.IDLE)
  }, [clearLastFramePreview])

  const refreshCameraDevices = useCallback(async (options) => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setCameraDevices([])
      return []
    }

    const devices = await getAvailableVideoDevices(options)
    setCameraDevices(devices)
    setSelectedCameraId((currentCameraId) => {
      if (currentCameraId && devices.some((device) => device.deviceId === currentCameraId)) {
        return currentCameraId
      }

      return getPreferredCameraDevice(devices)?.deviceId || devices[0]?.deviceId || ''
    })

    return devices
  }, [])

  const handleRefreshCameraDevices = useCallback(async () => {
    setIsRefreshingDevices(true)

    try {
      await refreshCameraDevices({ requestPermission: true })
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraStatus(CAMERA_STATUS.DENIED)
      } else {
        setCameraDevices([])
      }
    } finally {
      setIsRefreshingDevices(false)
    }
  }, [refreshCameraDevices])

  const startCamera = useCallback(async (cameraId = selectedCameraId) => {
    if (cameraSource === CAMERA_SOURCE.STREAM) {
      if (!cameraStreamUrl.trim()) {
        setCameraStatus(CAMERA_STATUS.ERROR)
        return
      }

      stopStreamTracks(streamRef.current)
      streamRef.current = null

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      setCameraStatus(CAMERA_STATUS.ACTIVE)
      return
    }

    if (!isCameraSecureContext()) {
      setCameraStatus(CAMERA_STATUS.INSECURE_CONTEXT)
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus(CAMERA_STATUS.UNSUPPORTED)
      return
    }

    setCameraStatus(CAMERA_STATUS.LOADING)

    try {
      stopStreamTracks(streamRef.current)
      streamRef.current = null

      const devices = await refreshCameraDevices({ requestPermission: true })
      const selectedDevice = devices.find((device) => device.deviceId === cameraId)
      const preferredDevice = selectedDevice || getPreferredCameraDevice(devices)
      const videoConstraints = getCameraConstraints(preferredDevice?.deviceId)
      let stream
      let openedPreferredDevice = false

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        })
        openedPreferredDevice = Boolean(videoConstraints.deviceId)
      } catch (error) {
        if (!videoConstraints.deviceId) {
          throw error
        }

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: videoConstraints.deviceId,
            },
            audio: false,
          })
          openedPreferredDevice = true
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              ...CAMERA_RESOLUTION,
            },
            audio: false,
          })
        }
      }

      if (openedPreferredDevice && preferredDevice?.deviceId) {
        setSelectedCameraId(preferredDevice.deviceId)
      }

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraStatus(CAMERA_STATUS.ACTIVE)
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraStatus(CAMERA_STATUS.DENIED)
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraStatus(CAMERA_STATUS.ERROR)
      } else {
        setCameraStatus(CAMERA_STATUS.ERROR)
      }
    }
  }, [cameraSource, cameraStreamUrl, refreshCameraDevices, selectedCameraId])

  const handleVoiceTypeChange = useCallback((nextVoiceType) => {
    lastSpokenTextRef.current = ''
    setVoiceType(nextVoiceType)
  }, [])

  const handleCameraSourceChange = useCallback((nextCameraSource) => {
    setCameraSource(nextCameraSource)
    setCameraStatus(CAMERA_STATUS.IDLE)
    setVisionStatus({
      isConnected: false,
      fingerTip: null,
      objects: [],
      result: null,
      message: '',
      ttsText: '',
      updatedAt: null,
    })
    clearLastFramePreview()
  }, [clearLastFramePreview])

  const handleCameraDeviceChange = useCallback(
    async (event) => {
      const nextCameraId = event.target.value
      setSelectedCameraId(nextCameraId)

      if (cameraStatus === CAMERA_STATUS.ACTIVE) {
        await startCamera(nextCameraId)
      }
    },
    [cameraStatus, startCamera],
  )

  const handleCameraStreamUrlChange = useCallback((event) => {
    setCameraStreamUrl(event.target.value)
  }, [])

  const handleBookPageChange = useCallback((nextPage) => {
    const normalizedNextPage = Math.min(Math.max(nextPage, 1), BOOK_PAGE_COUNT)

    if (normalizedNextPage === currentBookPage) {
      return
    }

    setPageTurnDirection(normalizedNextPage > currentBookPage ? 'next' : 'prev')
    setCurrentBookPage(normalizedNextPage)
  }, [currentBookPage])

  const handlePreviousBookPage = useCallback(() => {
    handleBookPageChange(currentBookPage - 1)
  }, [currentBookPage, handleBookPageChange])

  const handleNextBookPage = useCallback(() => {
    handleBookPageChange(currentBookPage + 1)
  }, [currentBookPage, handleBookPageChange])

  useEffect(() => {
    refreshCameraDevices({ requestPermission: false }).catch(() => {
      setCameraDevices([])
    })
  }, [refreshCameraDevices])

  useEffect(() => {
    if (!window.speechSynthesis) {
      return undefined
    }

    const syncVoices = () => {
      setSpeechVoices(window.speechSynthesis.getVoices())
    }

    syncVoices()

    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', syncVoices)
    } else {
      window.speechSynthesis.onvoiceschanged = syncVoices
    }

    return () => {
      if (typeof window.speechSynthesis.removeEventListener === 'function') {
        window.speechSynthesis.removeEventListener('voiceschanged', syncVoices)
      } else if (window.speechSynthesis.onvoiceschanged === syncVoices) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  useEffect(() => {
    if (!navigator.mediaDevices?.addEventListener) {
      return undefined
    }

    const handleDeviceChange = () => {
      refreshCameraDevices({ requestPermission: false }).catch(() => {
        setCameraDevices([])
      })
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [refreshCameraDevices])

  useEffect(() => {
    return () => {
      stopStreamTracks(streamRef.current)
      clearLastFramePreview()
    }
  }, [clearLastFramePreview])

  useEffect(() => {
    if (!pageTurnDirection) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setPageTurnDirection('')
    }, 520)

    return () => {
      window.clearTimeout(timer)
    }
  }, [pageTurnDirection])

  const captureCurrentFrame = useCallback(
    () =>
      new Promise((resolve, reject) => {
        const source = cameraSource === CAMERA_SOURCE.STREAM ? streamImageRef.current : videoRef.current
        const sourceWidth =
          cameraSource === CAMERA_SOURCE.STREAM ? source?.naturalWidth : source?.videoWidth
        const sourceHeight =
          cameraSource === CAMERA_SOURCE.STREAM ? source?.naturalHeight : source?.videoHeight

        if (!source || !sourceWidth || !sourceHeight) {
          resolve(null)
          return
        }

        const canvas = canvasRef.current || document.createElement('canvas')
        canvasRef.current = canvas
        canvas.width = sourceWidth
        canvas.height = sourceHeight

        const context = canvas.getContext('2d')
        if (!context) {
          resolve(null)
          return
        }

        try {
          context.drawImage(source, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => {
            if (!blob) {
              resolve(null)
              return
            }

            const previewUrl = URL.createObjectURL(blob)
            setLastFramePreview((current) => {
              if (current.url) {
                URL.revokeObjectURL(current.url)
              }

              return {
                url: previewUrl,
                size: blob.size,
                width: canvas.width,
                height: canvas.height,
              }
            })
            resolve(blob)
          }, 'image/jpeg', 0.82)
        } catch (error) {
          reject(error)
        }
      }),
    [cameraSource],
  )

  useEffect(() => {
    if (cameraStatus !== CAMERA_STATUS.ACTIVE) {
      return undefined
    }

    let isCancelled = false
    let pollTimer = null

    const pollReadingStatus = async () => {
      try {
        const frame = await captureCurrentFrame()

        if (!frame) {
          throw new Error('카메라 프레임을 캡처하지 못했습니다.')
        }

        const payload = await detectInteraction({
          frame,
          voiceType,
          page: `page${currentBookPage}`,
          pageNumber: currentBookPage,
        })

        if (isCancelled) {
          return
        }

        if (import.meta.env.DEV) {
          console.debug('[interaction/detect]', payload)
        }

        setVisionStatus({
          isConnected: true,
          fingerTip: normalizeFingerTip(payload),
          objects: normalizeObjects(payload),
          result: payload,
          message: getVisionMessage(payload),
          ttsText: getVisionTtsText(payload),
          updatedAt: Date.now(),
        })
      } catch (error) {
        if (!isCancelled) {
          const nextMessage =
            error.name === 'SecurityError'
              ? '스트림 영상은 표시되지만 브라우저 보안 정책 때문에 AI 인식용 프레임을 읽지 못했습니다.'
              : '백엔드 인식 결과를 기다리고 있습니다.'

          setVisionStatus((current) => ({
            ...current,
            isConnected: false,
            fingerTip: null,
            objects: [],
            message: nextMessage,
            ttsText: '',
            updatedAt: Date.now(),
          }))
        }
      } finally {
        if (!isCancelled) {
          pollTimer = window.setTimeout(pollReadingStatus, VISION_POLL_INTERVAL)
        }
      }
    }

    pollReadingStatus()

    return () => {
      isCancelled = true
      window.clearTimeout(pollTimer)
    }
  }, [cameraStatus, captureCurrentFrame, currentBookPage, voiceType])

  const speakText = useCallback((text, selectedVoiceType = voiceType) => {
    if (!text || !window.speechSynthesis) {
      return
    }

    window.speechSynthesis.cancel()
    const voiceOption = getVoiceOption(selectedVoiceType)
    const utterance = new SpeechSynthesisUtterance(text)
    const selectedSpeechVoice = getSpeechVoiceForType(speechVoices, selectedVoiceType)
    utterance.lang = 'ko-KR'
    if (selectedSpeechVoice) {
      utterance.voice = selectedSpeechVoice
    }
    utterance.pitch = voiceOption.pitch
    utterance.rate = voiceOption.rate
    window.speechSynthesis.speak(utterance)
  }, [speechVoices, voiceType])

  useEffect(() => {
    const effectiveTtsText = getEffectiveTtsText(visionStatus.ttsText)
    const matchedObjectLabel = getMatchedObjectLabel(visionStatus.result)
    const text = getInteractionStatusText({
      isActive: cameraStatus === CAMERA_STATUS.ACTIVE,
      objects: visionStatus.objects,
      fingerTip: visionStatus.fingerTip,
      ttsText: effectiveTtsText,
      message: visionStatus.message,
      matched: getInteractionMatched(visionStatus.result, matchedObjectLabel),
      matchedObjectLabel,
    }) || effectiveTtsText ||
      visionStatus.message ||
      '웹캠으로 책과 놀이도구를 비추면 AI가 인식 결과를 음성으로 안내합니다.'

    if (!text || text === lastSpokenTextRef.current) {
      return
    }

    lastSpokenTextRef.current = text
    speakText(text, voiceType)
  }, [
    cameraStatus,
    speakText,
    visionStatus.fingerTip,
    visionStatus.message,
    visionStatus.objects,
    visionStatus.result,
    visionStatus.ttsText,
    voiceType,
  ])

  const getVideoFrameSize = useCallback(
    (sourceWidth, sourceHeight) => {
      const frame = frameRef.current
      const video = videoRef.current
      const image = streamImageRef.current
      const source = cameraSource === CAMERA_SOURCE.STREAM ? image : video

      if (!frame || !source) {
        return null
      }

      const frameRect = frame.getBoundingClientRect()
      const width = sourceWidth || (cameraSource === CAMERA_SOURCE.STREAM ? image.naturalWidth : video.videoWidth)
      const height = sourceHeight || (cameraSource === CAMERA_SOURCE.STREAM ? image.naturalHeight : video.videoHeight)

      if (!frameRect.width || !frameRect.height || !width || !height) {
        return null
      }

      return {
        frameWidth: frameRect.width,
        frameHeight: frameRect.height,
        sourceWidth: width,
        sourceHeight: height,
      }
    },
    [cameraSource],
  )

  const fingerTipStyle = (() => {
    if (!visionStatus.fingerTip) {
      return null
    }

    const dimensions = getVideoFrameSize(visionStatus.fingerTip.width, visionStatus.fingerTip.height)

    if (!dimensions) {
      return null
    }

    const point = mapPointToFrame({
      x: visionStatus.fingerTip.x,
      y: visionStatus.fingerTip.y,
      ...dimensions,
    })

    if (!point) {
      return null
    }

    return {
      left: `${point.x}px`,
      top: `${point.y}px`,
    }
  })()

  const matchedObjectLabel = getMatchedObjectLabel(visionStatus.result)
  const pageLabel = getVisionPageLabel(visionStatus.result)
  const isInteractionMatched = getInteractionMatched(visionStatus.result, matchedObjectLabel)
  const normalizedMatchedObjectLabel = normalizeLabel(matchedObjectLabel)
  const matchedObjects = normalizedMatchedObjectLabel
    ? visionStatus.objects
        .filter((object) => normalizeLabel(object.label) === normalizedMatchedObjectLabel)
        .sort((left, right) => (right.confidence || 0) - (left.confidence || 0))
        .slice(0, 1)
    : visionStatus.objects

  const renderedObjects = matchedObjects
    .map((object) => {
      const dimensions = getVideoFrameSize(object.width, object.height)
      const style =
        dimensions &&
        mapBoxToFrame({
          box: object.box,
          ...dimensions,
        })

      return style ? { ...object, style } : null
    })
    .filter(Boolean)

  const isLoading = cameraStatus === CAMERA_STATUS.LOADING
  const isActive = cameraStatus === CAMERA_STATUS.ACTIVE
  const hasMessage = cameraStatus !== CAMERA_STATUS.ACTIVE
  const isFailStatus = cameraStatus === CAMERA_STATUS.DENIED
  const isWarningStatus = [CAMERA_STATUS.INSECURE_CONTEXT, CAMERA_STATUS.UNSUPPORTED, CAMERA_STATUS.ERROR].includes(cameraStatus)
  const overlayIcon = isFailStatus ? <CloseIcon /> : isWarningStatus ? <AlertIcon /> : <CameraIcon />
  const cameraControlMessage = isActive
    ? '카메라가 실행 중입니다.'
    : cameraStatus === CAMERA_STATUS.INSECURE_CONTEXT
      ? '휴대폰에서는 HTTPS 주소로 다시 접속한 뒤 카메라 권한을 허용해주세요.'
      : cameraSource === CAMERA_SOURCE.STREAM
        ? '휴대폰 카메라 앱의 스트림 URL을 입력한 뒤 카메라를 시작해주세요.'
        : '휴대폰 카메라를 연결한 뒤 브라우저에서 카메라 권한을 허용해주세요.'

  const webcamStepStatus = isActive ? 'success' : isFailStatus ? 'fail' : 'warning'
  const hasDetectedObjects = visionStatus.objects.length > 0
  const objectStepStatus = hasDetectedObjects ? 'success' : 'warning'
  const fingerStepStatus = visionStatus.fingerTip ? 'success' : 'warning'
  const effectiveTtsText = getEffectiveTtsText(visionStatus.ttsText)
  const objectLabelSummary = visionStatus.objects
    .map((object) => object.label)
    .filter(Boolean)
    .join(', ')
  const fingerTipSummary = visionStatus.fingerTip
    ? `x ${Math.round(visionStatus.fingerTip.x)}, y ${Math.round(visionStatus.fingerTip.y)}`
    : '없음'
  const serverTextSummary = visionStatus.ttsText || visionStatus.message || '없음'
  const lastFrameSummary = lastFramePreview.url
    ? `${lastFramePreview.width}x${lastFramePreview.height}, ${Math.round(lastFramePreview.size / 1024)}KB`
    : '없음'
  const interactionStatusText = getInteractionStatusText({
    isActive,
    objects: visionStatus.objects,
    fingerTip: visionStatus.fingerTip,
    ttsText: effectiveTtsText,
    message: visionStatus.message,
    matched: isInteractionMatched,
    matchedObjectLabel,
  })
  const resultText =
    effectiveTtsText ||
    interactionStatusText ||
    visionStatus.message ||
    '웹캠으로 책과 놀이도구를 비추면 AI가 인식 결과를 음성으로 안내합니다.'
  const hasTtsResponse = Boolean(effectiveTtsText)
  const ttsStepStatus = isActive && hasTtsResponse ? 'success' : 'warning'

  return (
    <div className="reading-page">
      <header className="reading-header">
        <div className="reading-header-inner">
          <button className="reading-brand" type="button" onClick={() => navigate('/')}>
            <img src={logoImage} alt="" />
            Fingertips
          </button>
        </div>
      </header>

      <main className="reading-main" aria-labelledby="reading-title">
        <h1 id="reading-title" className="sr-only">
          웹캠 인식 독서 화면
        </h1>

        <section className="reading-progress" aria-label="독서 보조 진행 상태">
          <ProgressStep label="웹캠 인식" status={webcamStepStatus} />
          <span className={`reading-step-line reading-step-line-${webcamStepStatus}`} />
          <ProgressStep label="객체 탐지" status={objectStepStatus} />
          <span className={`reading-step-line reading-step-line-${objectStepStatus}`} />
          <ProgressStep label="손끝 추적" status={fingerStepStatus} />
          <span className={`reading-step-line reading-step-line-${fingerStepStatus}`} />
          <ProgressStep label="TTS 음성 안내" status={ttsStepStatus} />
        </section>

        <section className="webcam-stage" aria-label="실시간 웹캠 화면">
          <div ref={frameRef} className={`webcam-frame ${isActive ? 'webcam-frame-active' : ''}`}>
            <video
              ref={videoRef}
              className={`webcam-video ${cameraSource === CAMERA_SOURCE.STREAM ? 'webcam-media-hidden' : ''}`}
              playsInline
              muted
              aria-label="실시간 카메라 영상"
            />
            <img
              ref={streamImageRef}
              className={`webcam-video ${cameraSource === CAMERA_SOURCE.STREAM ? '' : 'webcam-media-hidden'}`}
              src={cameraSource === CAMERA_SOURCE.STREAM && isActive ? cameraStreamUrl : undefined}
              alt=""
              onError={() => setCameraStatus(CAMERA_STATUS.ERROR)}
            />

            {isLoading && (
              <div className="webcam-overlay" role="status" aria-live="polite">
                <span className="webcam-loader" aria-hidden="true" />
                <p>{CAMERA_MESSAGES[cameraStatus]}</p>
              </div>
            )}

            {hasMessage && !isLoading && (
              <div
                className={`webcam-overlay ${isFailStatus ? 'webcam-overlay-fail' : ''} ${
                  isWarningStatus ? 'webcam-overlay-warning' : ''
                }`}
                role="status"
              >
                <span className="webcam-overlay-icon" aria-hidden="true">
                  {overlayIcon}
                </span>
                <p>{CAMERA_MESSAGES[cameraStatus]}</p>
              </div>
            )}

            <div
              className={`webcam-page-turner ${pageTurnDirection ? `webcam-page-turner-${pageTurnDirection}` : ''}`}
              aria-label="책 페이지 선택"
            >
              <div className="webcam-page-book" aria-hidden="true">
                <span className="webcam-page-sheet" />
              </div>
              <button
                className="webcam-page-button"
                type="button"
                onClick={handlePreviousBookPage}
                disabled={currentBookPage === 1}
                aria-label="이전 페이지"
              >
                ‹
              </button>
              <span className="webcam-page-label">page {currentBookPage}</span>
              <button
                className="webcam-page-button"
                type="button"
                onClick={handleNextBookPage}
                disabled={currentBookPage === BOOK_PAGE_COUNT}
                aria-label="다음 페이지"
              >
                ›
              </button>
            </div>

            {fingerTipStyle && (
              <div className="finger-pointer" style={fingerTipStyle} aria-label="감지된 손끝 위치">
                <span className="finger-pointer-dot" />
                <span className="finger-pointer-ring" />
              </div>
            )}

            {renderedObjects.map((object) => (
              <div
                key={object.id}
                className={`detection-box detection-box-${object.variant}`}
                style={object.style}
              />
            ))}
          </div>

          <aside className="webcam-control-panel" aria-label="카메라 제어">
            <p className="webcam-status">{cameraControlMessage}</p>
            {isActive && (
              <dl className="vision-debug-panel" aria-label="인식 디버그 정보">
                <div>
                  <dt>객체</dt>
                  <dd>{objectLabelSummary || '없음'}</dd>
                </div>
                <div>
                  <dt>손끝</dt>
                  <dd>{fingerTipSummary}</dd>
                </div>
                <div>
                  <dt>매칭</dt>
                  <dd>{isInteractionMatched ? matchedObjectLabel || '성공' : '없음'}</dd>
                </div>
                <div>
                  <dt>페이지</dt>
                  <dd>{pageLabel || '없음'}</dd>
                </div>
                <div>
                  <dt>서버 문구</dt>
                  <dd>{serverTextSummary}</dd>
                </div>
                <div>
                  <dt>전송</dt>
                  <dd>{lastFrameSummary}</dd>
                </div>
                {lastFramePreview.url && (
                  <div className="vision-debug-frame">
                    <dt>프레임</dt>
                    <dd>
                      <img src={lastFramePreview.url} alt="백엔드로 전송된 마지막 카메라 프레임" />
                    </dd>
                  </div>
                )}
              </dl>
            )}
            <div className="camera-source-selector" aria-label="카메라 입력 방식 선택">
              <button
                className={`camera-source-option ${cameraSource === CAMERA_SOURCE.DEVICE ? 'camera-source-option-active' : ''}`}
                type="button"
                onClick={() => handleCameraSourceChange(CAMERA_SOURCE.DEVICE)}
                disabled={isActive || isLoading}
                aria-pressed={cameraSource === CAMERA_SOURCE.DEVICE}
              >
                브라우저
              </button>
              <button
                className={`camera-source-option ${cameraSource === CAMERA_SOURCE.STREAM ? 'camera-source-option-active' : ''}`}
                type="button"
                onClick={() => handleCameraSourceChange(CAMERA_SOURCE.STREAM)}
                disabled={isActive || isLoading}
                aria-pressed={cameraSource === CAMERA_SOURCE.STREAM}
              >
                스트림 URL
              </button>
            </div>
            <label className="camera-selector">
              <span className="camera-selector-label">
                {cameraSource === CAMERA_SOURCE.STREAM ? '스트림 URL' : '카메라'}
              </span>
              {cameraSource === CAMERA_SOURCE.STREAM ? (
                <input
                  className="camera-selector-control"
                  type="url"
                  value={cameraStreamUrl}
                  onChange={handleCameraStreamUrlChange}
                  placeholder="http://192.168.0.10:4747/video"
                  disabled={isActive || isLoading}
                />
              ) : (
                <div className="camera-selector-row">
                  <select
                    className="camera-selector-control"
                    value={selectedCameraId}
                    onChange={handleCameraDeviceChange}
                    onFocus={refreshCameraDevices}
                    disabled={isLoading}
                  >
                    <option value="">기본 카메라</option>
                    {cameraDevices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {getCameraDeviceLabel(device, index)}
                      </option>
                    ))}
                  </select>
                  <button
                    className="camera-refresh-button"
                    type="button"
                    onClick={handleRefreshCameraDevices}
                    disabled={isLoading || isRefreshingDevices}
                    aria-label="카메라 목록 새로고침"
                    title="카메라 목록 새로고침"
                  >
                    <RefreshIcon />
                  </button>
                </div>
              )}
            </label>
            <div className="voice-selector" aria-label="TTS 음성 타입 선택">
              <p className="voice-selector-label">음성 타입</p>
              <div className="voice-selector-options">
                {VOICE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`voice-option ${voiceType === option.value ? 'voice-option-active' : ''}`}
                    type="button"
                    aria-pressed={voiceType === option.value}
                    onClick={() => handleVoiceTypeChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="webcam-actions">
              <Button
                variant="primary"
                size="md"
                icon={<CameraIcon />}
                iconPosition="left"
                isLoading={isLoading}
                onClick={startCamera}
                disabled={isActive}
              >
                카메라 시작
              </Button>
              <Button
                variant="accent"
                size="md"
                icon={<StopIcon />}
                iconPosition="left"
                onClick={stopCamera}
                disabled={!isActive && !isLoading}
              >
                카메라 종료
              </Button>
            </div>
          </aside>
        </section>
      </main>

      <footer className="reading-tts-bar">
        <div className="reading-tts-inner">
          <img className="reading-tts-guide-image" src={ttsGuideImage} alt="음성 안내 캐릭터" />
          <p>{resultText}</p>
          <Button
            variant="primary"
            size="md"
            icon={<ReplayIcon />}
            iconPosition="left"
            onClick={() => speakText(resultText)}
            disabled={!effectiveTtsText && !interactionStatusText && !visionStatus.message}
          >
            설명 다시 듣기
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default ReadingPage
