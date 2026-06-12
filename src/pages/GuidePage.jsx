/**
 * GuidePage Component
 * 
 * 앱 사용 방법을 설명하는 가이드 페이지
 */

import { useNavigate } from 'react-router-dom'

function GuidePage() {
  const navigate = useNavigate()

  return (
    <div className="guide-page">
      <header className="guide-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
        <h1>사용 가이드</h1>
      </header>

      <main className="guide-main">
        <section className="guide-section">
          <h2>1. 시작하기</h2>
          <p>홈 화면에서 &quot;책 읽으러 가기&quot; 버튼을 클릭하여 독서를 시작할 수 있습니다.</p>
        </section>

        <section className="guide-section">
          <h2>2. 음성 안내</h2>
          <p>
            스피커 아이콘을 누르면 현재 페이지의 내용을 음성으로 들을 수 있습니다.
            음성 속도는 환경설정에서 조절할 수 있습니다.
          </p>
        </section>

        <section className="guide-section">
          <h2>3. 페이지 넘기기</h2>
          <p>화면을 좌우로 스와이프하거나 화살표 버튼을 클릭하여 페이지를 넘길 수 있습니다.</p>
        </section>

        <section className="guide-section">
          <h2>4. 북마크</h2>
          <p>하트 아이콘을 클릭하여 즐겨찾기에 추가할 수 있습니다.</p>
        </section>
      </main>
    </div>
  )
}

export default GuidePage
