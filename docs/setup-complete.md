# 프론트엔드 프로젝트 구조 설정 완료

## 완료된 작업

### 1. 프로젝트 초기 설정

- React 18 + Vite 프로젝트 구성
- React Router 통합 (SPA 라우팅)
- Axios 설정 (API 호출용)

### 2. 디렉토리 구조 구축

```
src/
├── assets/              # 이미지, 아이콘, 로고 등 정적 리소스
├── components/
│   ├── common/          # Button, Card, AudioButton 등 재사용 컴포넌트
│   └── layout/          # Header, Navigation, Container 레이아웃 컴포넌트
├── pages/               # HomePage, GuidePage, ReadingPage 페이지
├── routes/              # 라우팅 설정
├── api/                 # API 클라이언트 (client.js, book.js, audio.js)
├── hooks/               # 커스텀 훅 (useAudio, useFetch)
├── constants/           # 앱 전역 상수
├── styles/              # 전역 스타일 및 CSS
├── utils/               # 유틸 함수들
├── App.jsx              # 메인 앱 컴포넌트
└── main.jsx             # 엔트리 포인트
```

### 3. 기본 컴포넌트 구현

- **Common Components**: Button, Card, AudioButton
- **Layout Components**: Header, Navigation, Container
- **Pages**: HomePage (소개), GuidePage (사용 설명서), ReadingPage (책 읽기)

### 4. API 구조 설정

- API 클라이언트 (axios 기반, 인터셉터 포함)
- Book API 모듈 (책, 페이지 관련)
- Audio API 모듈 (음성 안내 관련)

### 5. 커스텀 훅 작성

- `useAudio`: 음성 재생 관리
- `useFetch`: API 데이터 페칭

### 6. 설정 파일

- `vite.config.js`: Vite 빌드 설정
- `.eslintrc.json`: ESLint 코드 스타일 설정
- `.env.example`: 환경 변수 템플릿
- `package.json`: 의존성 관리

## 다음 단계

### 필수 작업

1. **의존성 설치**

   ```bash
   npm install
   ```

2. **개발 서버 실행**

   ```bash
   npm run dev
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   ```

### 권장 사항

1. **스타일링 보강**
   - Tailwind CSS 또는 CSS Module 추가
   - 페이지별 상세한 스타일 구현

2. **상태 관리**
   - Redux 또는 Zustand로 전역 상태 관리 추가
   - 사용자 선호도, 현재 책 정보 등 관리

3. **테스트 추가**
   - Jest + React Testing Library 설정
   - 컴포넌트 테스트 작성

4. **음성 기능 구현**
   - Web Audio API 또는 speech synthesis 통합
   - 백엔드 음성 API와 연동

5. **추가 페이지**
   - 설정 페이지
   - 북마크/즐겨찾기 페이지
   - 내 정보 페이지

## 주요 파일 설명

- `src/api/client.js`: Axios 인스턴스 및 기본 HTTP 메서드
- `src/api/book.js`: 그림책 관련 API 호출 함수
- `src/api/audio.js`: 음성 관련 API 호출 함수
- `src/hooks/useAudio.js`: 음성 재생 상태 관리
- `src/hooks/useFetch.js`: API 데이터 페칭 관리
- `src/routes/index.js`: 라우트 설정 정보

## 참고 링크

- [React 공식 문서](https://react.dev)
- [React Router 문서](https://reactrouter.com)
- [Vite 공식 문서](https://vitejs.dev)
- [Axios 공식 문서](https://axios-http.com)
