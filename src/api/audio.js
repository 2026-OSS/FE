import { post } from './client'

const DEFAULT_TTS_URL = '/api/tts'

export const generateTtsAudio = (text, voiceType = 'child') =>
  post(
    import.meta.env.VITE_TTS_ENDPOINT || DEFAULT_TTS_URL,
    {
      text,
      voiceType,
    },
    {
      responseType: 'blob',
      headers: {
        Accept: 'audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/flac,audio/pcm,application/octet-stream',
      },
    },
  )
