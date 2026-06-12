/**
 * ReadingPage Component
 * 
 * 실제 그림책을 읽는 메인 페이지
 * 그림 표시, 음성 안내, 페이지 넘기기 기능 포함
 */

import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function ReadingPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    setCurrentPage(currentPage + 1)
  }

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying)
    // TODO: 음성 재생 로직 구현
  }

  return (
    <div className="reading-page">
      <header className="reading-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← 홈으로
        </button>
        <h1>독서 중...</h1>
      </header>

      <main className="reading-main">
        <div className="book-container">
          <div className="book-image">
            <p>📖 Page {currentPage}</p>
            <p>그림책 이미지가 여기에 표시됩니다</p>
          </div>

          <div className="book-description">
            <p>현재 페이지에 대한 AI 음성 설명이 여기에 표시됩니다.</p>
          </div>
        </div>

        <div className="reading-controls">
          <button className="btn-control" onClick={handlePlayAudio}>
            {isPlaying ? '⏸️ 일시정지' : '🔊 음성 듣기'}
          </button>

          <div className="page-navigation">
            <button className="btn-nav" onClick={handlePrevious} disabled={currentPage === 1}>
              ← 이전 페이지
            </button>
            <span className="page-indicator">
              {currentPage} / 10
            </span>
            <button className="btn-nav" onClick={handleNext}>
              다음 페이지 →
            </button>
          </div>

          <button className="btn-control">
            ❤️ 북마크
          </button>
        </div>
      </main>
    </div>
  )
}

export default ReadingPage
