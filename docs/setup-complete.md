# 프론트엔드 프로젝트 구조 설정 완료

## 개요

본 프로젝트는 시각장애 아동을 위한 AI 그림책 독서 보조 서비스의 프론트엔드이다.

프론트엔드는 사용자 인터페이스, AI 서버 연동, 음성 안내 기능을 효율적으로 관리할 수 있도록 기능별로 분리하여 구성한다.

이 문서는 이슈 `#1 [DOCS] 프론트엔드 프로젝트 구조 설정`의 완료 내용을 정리한다.

## 완료된 작업

### 1. 프로젝트 초기 설정

- React 18 + Vite 프로젝트 구성
- React Router 통합
- Axios 설정
- ESLint 설정

### 2. 디렉터리 구조 구축

```text
src/
├── assets/              # 이미지, 아이콘, 로고 등 정적 리소스
├── components/
│   ├── common/          # Button, Card, AudioButton 등 재사용 컴포넌트
│   └── layout/          # Header, Navigation, Container 레이아웃 컴포넌트
├── pages/               # HomePage, GuidePage, ReadingPage 페이지
├── routes/              # 라우팅 설정
├── api/                 # API 클라이언트 및 서버 통신 모듈
├── hooks/               # 커스텀 Hook
├── constants/           # 앱 전역 상수
├── styles/              # 전역 스타일
├── utils/               # 공통 유틸 함수
├── App.jsx              # 메인 앱 컴포넌트
└── main.jsx             # 엔트리 포인트
```

### 3. 기본 화면 및 컴포넌트 구현

- Common Components: `Button`, `Card`, `AudioButton`
- Layout Components: `Header`, `Navigation`, `Container`
- Pages: `HomePage`, `GuidePage`, `ReadingPage`
- Routes: `/`, `/guide`, `/reading`

### 4. API 구조 설정

- `src/api/client.js`: Axios 인스턴스 및 기본 HTTP 메서드
- `src/api/book.js`: 그림책 관련 API 호출 함수
- `src/api/audio.js`: 음성 안내 관련 API 호출 함수

향후 객체 인식, 손끝 위치 정보, TTS 요청 등 AI 서버 연동 기능은 `api` 폴더에서 기능 단위로 분리하여 관리한다.

### 5. 커스텀 Hook 작성

- `src/hooks/useAudio.js`: 음성 재생 상태 관리
- `src/hooks/useFetch.js`: API 데이터 페칭 관리

향후 웹캠 제어, AI 요청 상태 관리 등 재사용 가능한 로직은 Hook으로 분리한다.

### 6. 설정 파일

- `vite.config.js`: Vite 빌드 설정
- `.eslintrc.json`: ESLint 코드 스타일 설정
- `.env`: 로컬 환경 변수 파일
- `package.json`: 의존성 및 실행 스크립트 관리

## 폴더별 역할

### assets

이미지, 아이콘, 로고, 일러스트 등 정적 리소스를 관리한다.

현재 포함 파일:

```text
assets/
├── home-hero.png
├── logo.png
└── tts.png
```

### components

재사용 가능한 UI 컴포넌트를 관리한다.

- `common`: 여러 페이지에서 공통으로 사용하는 컴포넌트
- `layout`: 페이지 레이아웃 구성 요소

### pages

라우팅 단위의 화면을 관리한다.

```text
pages/
├── GuidePage.jsx
├── HomePage.jsx
└── ReadingPage.jsx
```

### routes

React Router 설정을 관리한다.

```text
routes/
└── index.js
```

### api

AI 서버 및 백엔드 서버와의 통신을 관리한다. API 호출 로직은 페이지나 컴포넌트에 직접 작성하지 않고 이 폴더에서 관리한다.

### hooks

웹캠 제어, 음성 재생, API 요청 상태 관리 등 재사용 가능한 Custom Hook을 관리한다.

### constants

API 주소, 라우트 경로, 안내 문구 등 공통 상수 데이터를 관리한다.

### styles

전역 CSS, 폰트 설정, 색상 테마 등 공통 스타일을 관리한다.

### utils

좌표 계산, 데이터 변환, 문자열 처리 등 공통 유틸리티 함수를 관리한다.

## 파일 작성 규칙

### 컴포넌트

컴포넌트 파일은 PascalCase를 사용한다.

예시:

```text
Button.jsx
AudioButton.jsx
HomePage.jsx
```

### Hook

Hook 파일은 `use` 접두사를 사용한다.

예시:

```text
useAudio.js
useFetch.js
useDetection.js
```

### API

API 파일은 기능 단위로 분리한다.

예시:

```text
book.js
audio.js
detectionApi.js
ttsApi.js
```

## 개발 규칙

- 페이지와 컴포넌트를 분리하여 작성한다.
- 동일 기능은 재사용 가능한 컴포넌트로 구현한다.
- API 호출 로직은 `api` 폴더에서 관리한다.
- 웹캠 및 음성 관련 로직은 Hook으로 분리한다.
- 공통 상수는 `constants` 폴더에서 관리한다.
- ESLint 및 Prettier 규칙을 준수한다.

## 실행 방법

```bash
npm install
npm run dev
```

## 프로젝트 실행 확인

프로젝트는 Vite 개발 서버를 통해 실행한다.

주요 스크립트:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## 다음 단계

1. `.env.example` 파일을 추가하여 협업용 환경 변수 템플릿을 제공한다.
2. 웹캠 제어 Hook과 AI 인식 API 모듈을 추가한다.
3. 음성 안내 기능을 백엔드 TTS API 또는 Web Speech API와 연동한다.
4. 컴포넌트 테스트와 페이지 단위 테스트를 추가한다.

## 참고 링크

- [React 공식 문서](https://react.dev)
- [React Router 문서](https://reactrouter.com)
- [Vite 공식 문서](https://vitejs.dev)
- [Axios 공식 문서](https://axios-http.com)
