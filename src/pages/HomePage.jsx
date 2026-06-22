/**
 * HomePage Component
 * 
 * 사용자가 앱에 처음 접속했을 때 보이는 홈 페이지
 * 시작하기, 가이드 등의 주요 기능으로의 네비게이션 제공
 */

import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/common'
import heroImage from '../assets/home-hero.png'
import logoImage from '../assets/logo.png'

function ArrowIcon() {
  return (
    <svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.89715 1.12408C4.89715 0.503267 5.41394 0 6.05142 0H15.8457C16.4832 0 17 0.503267 17 1.12408V10.6622C17 11.283 16.4832 11.7863 15.8457 11.7863C15.2082 11.7863 14.6915 11.283 14.6915 10.6622V3.83784L1.97046 16.2261C1.51969 16.6651 0.788848 16.6651 0.338078 16.2261C-0.112693 15.7871 -0.112693 15.0754 0.338078 14.6364L13.0591 2.24816H6.05142C5.41394 2.24816 4.89715 1.74489 4.89715 1.12408Z"
        fill="currentColor"
      />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 30C18.5455 29.0256 16.9697 28.2692 15.2727 27.7308C13.5758 27.1923 11.8182 26.9231 10 26.9231C8.72727 26.9231 7.47727 27.0641 6.25 27.3462C5.02273 27.6282 3.84848 28.0256 2.72727 28.5385C2.09091 28.8205 1.47727 28.8077 0.886364 28.5C0.295455 28.1923 0 27.7436 0 27.1538V8.61539C0 8.33333 0.0833333 8.0641 0.25 7.80769C0.416667 7.55128 0.666667 7.35897 1 7.23077C2.39394 6.61539 3.84848 6.15385 5.36364 5.84615C6.87879 5.53846 8.42424 5.38462 10 5.38462C11.7576 5.38462 13.4773 5.57692 15.1591 5.96154C16.8409 6.34615 18.4545 6.92308 20 7.69231V26.3077C21.5455 25.4872 23.1667 24.8718 24.8636 24.4615C26.5606 24.0513 28.2727 23.8462 30 23.8462C31.0909 23.8462 32.1591 23.9231 33.2045 24.0769C34.25 24.2308 35.303 24.4615 36.3636 24.7692V6.30769C36.8182 6.4359 37.2652 6.57051 37.7045 6.71154C38.1439 6.85256 38.5758 7.02564 39 7.23077C39.3333 7.35897 39.5833 7.55128 39.75 7.80769C39.9167 8.0641 40 8.33333 40 8.61539V27.1538C40 27.7436 39.7045 28.1923 39.1136 28.5C38.5227 28.8077 37.9091 28.8205 37.2727 28.5385C36.1515 28.0256 34.9773 27.6282 33.75 27.3462C32.5227 27.0641 31.2727 26.9231 30 26.9231C28.1818 26.9231 26.4242 27.1923 24.7273 27.7308C23.0303 28.2692 21.4545 29.0256 20 30Z"
        fill="currentColor"
      />
    </svg>
  )
}

function TouchIcon() {
  return (
    <svg viewBox="0 0 28 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.6061 35C11.8519 35 11.1448 34.8333 10.4848 34.5C9.82492 34.1667 9.26599 33.6944 8.80808 33.0833L0 21.5417L0.767677 20.7083C1.3064 20.125 1.95286 19.7778 2.70707 19.6667C3.46128 19.5556 4.16162 19.7083 4.80808 20.125L7.79798 22V8.33333C7.79798 7.86111 7.95286 7.46528 8.26263 7.14583C8.57239 6.82639 8.95623 6.66667 9.41414 6.66667C9.87205 6.66667 10.2626 6.82639 10.5859 7.14583C10.9091 7.46528 11.0707 7.86111 11.0707 8.33333V28L7.15152 25.5L11.3535 31.0417C11.5152 31.2361 11.7037 31.3889 11.9192 31.5C12.1347 31.6111 12.3636 31.6667 12.6061 31.6667H21.5354C22.4242 31.6667 23.1852 31.3403 23.8182 30.6875C24.4512 30.0347 24.7677 29.25 24.7677 28.3333V21.6667C24.7677 21.1944 24.6128 20.7986 24.303 20.4792C23.9933 20.1597 23.6094 20 23.1515 20H14.303V16.6667H23.1515C24.4983 16.6667 25.6431 17.1528 26.5859 18.125C27.5286 19.0972 28 20.2778 28 21.6667V28.3333C28 30.1667 27.367 31.7361 26.101 33.0417C24.835 34.3472 23.3131 35 21.5354 35H12.6061Z"
        fill="currentColor"
      />
    </svg>
  )
}

function VoiceIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.4 14.4H8.8V11.2H6.4V14.4ZM10.4 17.6H12.8V8H10.4V17.6ZM14.8 20.8H17.2V4.8H14.8V20.8ZM19.2 17.6H21.6V8H19.2V17.6ZM23.2 14.4H25.6V11.2H23.2V14.4ZM0 32V3.2C0 2.32 0.313333 1.56667 0.94 0.94C1.56667 0.313333 2.32 0 3.2 0H28.8C29.68 0 30.4333 0.313333 31.06 0.94C31.6867 1.56667 32 2.32 32 3.2V22.4C32 23.28 31.6867 24.0333 31.06 24.66C30.4333 25.2867 29.68 25.6 28.8 25.6H6.4L0 32ZM5.04 22.4H28.8V3.2H3.2V24.2L5.04 22.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

const features = [
  {
    variant: 'primary',
    icon: <BookIcon />,
    title: '그림책 탐색',
    description: (
      <>
        촉각 그림책과 교구를
        <br />
        자유롭게 탐색해보세요.
      </>
    ),
  },
  {
    variant: 'secondary',
    icon: <TouchIcon />,
    title: '손끝 인식',
    description: '손끝으로 만지는 그림과 점자를 정확하게 인식합니다.',
  },
  {
    variant: 'accent',
    icon: <VoiceIcon />,
    title: '음성 안내',
    description: (
      <>
        AI가 내용을 음성으로 설명해
        <br />
        책 읽기를 도와줍니다.
      </>
    ),
  },
]

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-inner">
          <a className="home-brand" href="/" aria-label="Fingertips 홈">
            <img src={logoImage} alt="" />
            Fingertips
          </a>
        </div>
      </header>

      <main className="home-main">
        <section className="home-hero" aria-labelledby="home-hero-title">
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <h1 id="home-hero-title">
                <span>손끝으로 읽는</span>
                <strong>AI 그림책</strong>
              </h1>
              <div className="home-hero-description">
                <p className="home-hero-lead">시각장애 아동을 위한 독서 보조 서비스</p>
                <p>
                  그림, 점자, 촉각 교구를 손끝으로 만지면
                  <br />
                  AI가 음성으로 자세히 설명해줘요.
                </p>
              </div>
              <Button
                className="home-hero-button"
                size="lg"
                icon={<ArrowIcon />}
                onClick={() => navigate('/reading')}
              >
                독서 시작하기
              </Button>
            </div>

            <div className="home-hero-visual" aria-hidden="true">
              <img src={heroImage} alt="" />
            </div>
          </div>
        </section>

        <section className="home-features" aria-labelledby="home-features-title">
          <div className="home-section-heading">
            <p>주요 기능</p>
            <h2 id="home-features-title">With us, the world is at my fingertips.</h2>
          </div>

          <div className="home-feature-list">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="home-feature-card"
                variant={feature.variant}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
