# Frontend Structure

## 개요

본 프로젝트는 시각장애 아동을 위한 AI 그림책 독서 보조 서비스의 프론트엔드 구조를 정의한다.

프론트엔드는 사용자 인터페이스(UI), AI 서버 연동, 음성 안내 기능을 효율적으로 관리할 수 있도록 기능별로 분리하여 구성한다.

---

## 디렉터리 구조

```text
src/

├── assets/
├── components/
├── pages/
├── routes/
├── api/
├── hooks/
├── constants/
├── styles/
├── utils/

├── App.jsx
└── main.jsx
```

---

## assets

정적 리소스를 관리한다.

### 포함 항목

- 이미지
- 아이콘
- 로고
- 일러스트

예시

```text
assets/

├── logo.svg
├── monkey.png
└── flowerpot.png
```

---

## components

재사용 가능한 UI 컴포넌트를 관리한다.

### common

여러 페이지에서 공통으로 사용하는 컴포넌트

예시

- Button
- Card
- AudioButton

### layout

페이지 레이아웃 구성 요소

예시

- Header
- Navigation
- Container

---

## pages

라우팅 단위의 화면을 관리한다.

### 페이지

- HomePage
- GuidePage
- ReadingPage

예시

```text
pages/

├── HomePage.jsx
├── GuidePage.jsx
└── ReadingPage.jsx
```

---

## routes

React Router 설정을 관리한다.

예시

```text
routes/

└── AppRouter.jsx
```

### 라우트

```text
/
/guide
/reading
```

---

## api

AI 서버 및 백엔드 서버와의 통신을 관리한다.

### 기능

- 객체 인식 요청
- 손끝 위치 정보 요청
- 음성 안내 요청

예시

```text
api/

├── detectionApi.js
├── handApi.js
└── ttsApi.js
```

---

## hooks

재사용 가능한 Custom Hook을 관리한다.

### 기능

- 웹캠 제어
- 음성 재생
- AI 요청 상태 관리

예시

```text
hooks/

├── useCamera.js
├── useAudio.js
└── useDetection.js
```

---

## constants

상수 데이터를 관리한다.

### 포함 항목

- API 주소
- 라우트 경로
- 색상 팔레트
- 안내 문구

예시

```text
constants/

├── routes.js
├── colors.js
└── messages.js
```

---

## styles

전역 스타일을 관리한다.

### 포함 항목

- Global CSS
- 폰트 설정
- 색상 테마

예시

```text
styles/

├── global.css
└── theme.css
```

---

## utils

공통 유틸리티 함수를 관리한다.

### 기능

- 좌표 계산
- 데이터 변환
- 문자열 처리

예시

```text
utils/

├── coordinate.js
└── format.js
```

---

## 파일 작성 규칙

### 컴포넌트

PascalCase를 사용한다.

예시

```text
Button.jsx
AudioButton.jsx
HomePage.jsx
```

### Hook

use 접두사를 사용한다.

예시

```text
useCamera.js
useAudio.js
useDetection.js
```

### API

기능 단위로 분리한다.

예시

```text
detectionApi.js
ttsApi.js
```

---

## 개발 규칙

- 페이지와 컴포넌트를 분리하여 작성한다.
- 동일 기능은 재사용 가능한 컴포넌트로 구현한다.
- API 호출 로직은 api 폴더에서 관리한다.
- 웹캠 및 음성 관련 로직은 Hook으로 분리한다.
- 공통 상수는 constants 폴더에서 관리한다.
- ESLint 및 Prettier 규칙을 준수한다.

---

## 실행 방법

```bash
npm install
npm run dev
```
