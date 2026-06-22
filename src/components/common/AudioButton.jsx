/**
 * AudioButton Component
 * 
 * 음성 재생 버튼 컴포넌트
 */

import { useState } from 'react'

function AudioButton({ audioUrl, children = '🔊 재생' }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handleClick = () => {
    setIsPlaying(!isPlaying)
    // TODO: 음성 재생 로직 구현
    if (!isPlaying) {
      console.log('재생:', audioUrl)
    } else {
      console.log('일시정지')
    }
  }

  return (
    <button className="audio-button" onClick={handleClick}>
      {isPlaying ? '⏸️ 일시정지' : children}
    </button>
  )
}

export default AudioButton
