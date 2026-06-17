/**
 * ReadingPage Component
 *
 * 실시간 카메라 영상을 기반으로 독서 보조 기능을 제공하는 화면
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common'
import logoImage from '../assets/logo.png'
import ttsGuideImage from '../assets/tts.png'

const CAMERA_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  ACTIVE: 'active',
  DENIED: 'denied',
  UNSUPPORTED: 'unsupported',
  ERROR: 'error',
}

const CAMERA_MESSAGES = {
  [CAMERA_STATUS.IDLE]: '카메라를 시작하면 실시간 화면이 여기에 표시됩니다.',
  [CAMERA_STATUS.LOADING]: '카메라 권한을 확인하고 있어요.',
  [CAMERA_STATUS.DENIED]: '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 접근을 허용해주세요.',
  [CAMERA_STATUS.UNSUPPORTED]: '현재 브라우저에서는 카메라 기능을 지원하지 않습니다.',
  [CAMERA_STATUS.ERROR]: '카메라를 불러오지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해주세요.',
}

const detectedObjects = []

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
  const streamRef = useRef(null)
  const [cameraStatus, setCameraStatus] = useState(CAMERA_STATUS.IDLE)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraStatus(CAMERA_STATUS.IDLE)
  }, [])

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus(CAMERA_STATUS.UNSUPPORTED)
      return
    }

    setCameraStatus(CAMERA_STATUS.LOADING)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

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
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const isLoading = cameraStatus === CAMERA_STATUS.LOADING
  const isActive = cameraStatus === CAMERA_STATUS.ACTIVE
  const hasMessage = cameraStatus !== CAMERA_STATUS.ACTIVE
  const isFailStatus = cameraStatus === CAMERA_STATUS.DENIED
  const isWarningStatus = [CAMERA_STATUS.UNSUPPORTED, CAMERA_STATUS.ERROR].includes(cameraStatus)
  const overlayIcon = isFailStatus ? <CloseIcon /> : isWarningStatus ? <AlertIcon /> : <CameraIcon />

  const webcamStepStatus = isActive ? 'success' : isFailStatus ? 'fail' : 'warning'

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
          <ProgressStep label="객체 탐지" status="warning" />
          <span className="reading-step-line reading-step-line-warning" />
          <ProgressStep label="손끝 추적" status="warning" />
          <span className="reading-step-line reading-step-line-warning" />
          <ProgressStep label="TTS 음성 안내" status="warning" />
        </section>

        <section className="webcam-stage" aria-label="실시간 웹캠 화면">
          <div className={`webcam-frame ${isActive ? 'webcam-frame-active' : ''}`}>
            <video ref={videoRef} className="webcam-video" playsInline muted aria-label="실시간 카메라 영상" />

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

            {detectedObjects.map((object) => (
              <div
                key={object.id}
                className={`detection-box detection-box-${object.variant}`}
                style={object.style}
              >
                <span>{object.label}</span>
              </div>
            ))}
          </div>

          <aside className="webcam-control-panel" aria-label="카메라 제어">
            <p className="webcam-status">
              {isActive ? '카메라가 실행 중입니다.' : '데스크톱 브라우저에서 카메라 권한을 허용해주세요.'}
            </p>
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
          <p>웹캠으로 책과 교구를 비추면 AI가 인식 결과를 음성으로 안내합니다.</p>
          <Button variant="primary" size="md" icon={<ReplayIcon />} iconPosition="left">
            설명 다시 듣기
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default ReadingPage
