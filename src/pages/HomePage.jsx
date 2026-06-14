/**
 * HomePage Component
 * 
 * 사용자가 앱에 처음 접속했을 때 보이는 홈 페이지
 * 시작하기, 가이드 등의 주요 기능으로의 네비게이션 제공
 */

import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>AI 그림책 독서 보조 서비스</h1>
        <p>시각장애 아동을 위한 스마트 독서 경험</p>
      </header>

      <main className="home-main">
        <section className="feature-section">
          <h2>주요 기능</h2>
          <div className="feature-list">
            <div className="feature-item">
              <h3>🎨 그림책 보기</h3>
              <p>AI가 그림을 분석하여 상세한 설명을 제공합니다.</p>
            </div>
            <div className="feature-item">
              <h3>🔊 음성 안내</h3>
              <p>자동 음성 스토리텔링으로 부드러운 독서 환경을 제공합니다.</p>
            </div>
            <div className="feature-item">
              <h3>📚 학습 경험</h3>
              <p>상호작용적인 퀴즈와 활동으로 책의 내용을 더 깊이 이해해봅시다.</p>
            </div>
          </div>
        </section>

        <section className="action-section">
          <button className="btn btn-primary" onClick={() => navigate('/reading')}>
            책 읽으러 가기
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/guide')}>
            사용 가이드
          </button>
        </section>
      </main>
    </div>
  )
}

export default HomePage
