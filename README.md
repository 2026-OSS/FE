# Fingertips Frontend

시각장애 아동을 위한 AI 그림책 보조 서비스 **Fingertips**의 Frontend 프로젝트입니다.

## 프로젝트 구조

```text
Frontend (React)
        ↓
Backend (FastAPI)
        ↓
AI Server (YOLO)
```

```text
Frontend → Backend → AI Server → Backend → Frontend
```

---

# 실행 순서

터미널 3개를 열고 아래 순서대로 실행합니다.

## 1. AI Server 실행

```bash
cd /Users/yeooni/Desktop/oss/AI-Data

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements-server.txt

python3 -m uvicorn server.main:app \
  --host 127.0.0.1 \
  --port 8001
```

### 다른 YOLO 모델 사용

```bash
YOLO_MODEL_PATH=artifacts/yolo11-v13/best.pt \
YOLO_DATA_YAML=artifacts/yolo11-v13/data.yaml \
python3 -m uvicorn server.main:app \
  --host 127.0.0.1 \
  --port 8001
```

---

## 2. Backend 실행

```bash
cd /Users/yeooni/Desktop/oss/BE

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

AI_SERVER_URL=http://127.0.0.1:8001 \
AI_PREDICT_PATH=/predict \
AI_FRAME_FIELD_NAME=frame \
python3 -m uvicorn app.main:app \
  --host 127.0.0.1 \
  --port 8000
```

---

## 3. Frontend 실행

```bash
cd /Users/yeooni/Desktop/oss/FE

npm install

VITE_API_BASE_URL=http://127.0.0.1:8000 \
npm run dev
```

접속 주소

```text
http://127.0.0.1:3000
```

---

# 서버 상태 확인

Backend

```bash
curl http://127.0.0.1:8000/health
```

AI Server

```bash
curl http://127.0.0.1:8001/health
```

정상 동작 시 상태 코드 200이 반환됩니다.

---

# TTS

현재 TTS는 브라우저 기본 음성 엔진인 `speechSynthesis`를 사용합니다.

독서 화면에서 다음 음성 타입을 선택할 수 있습니다.

* 아이
* 엄마
* 아빠

---

# 카메라 테스트

## 1. iPhone 연속성 카메라 사용

### 준비

1. iPhone과 MacBook을 같은 Apple ID로 로그인
2. Wi-Fi 및 Bluetooth 활성화
3. 두 기기를 가까운 위치에 배치
4. 브라우저 카메라 권한 허용

### 사용 방법

독서 화면에서

```text
카메라 → iPhone
```

또는

```text
카메라 → Continuity Camera
```

선택 후

```text
카메라 시작
```

버튼 클릭

---

## 휴대폰 카메라 우선 선택

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000 \
VITE_PREFERRED_CAMERA_KEYWORDS=iphone,camo,droidcam \
npm run dev
```

예시

* iPhone Camera
* Camo Camera
* DroidCam

---

# Android / 외부 카메라 앱 사용

지원 앱

* DroidCam
* Camo
* EpocCam

브라우저에 웹캠 장치로 등록되면 일반 카메라와 동일하게 선택 가능합니다.

---

# 스트림 URL 사용

카메라 장치 대신 영상 URL을 제공하는 경우

예시

```text
http://192.168.0.10:4747/video
```

독서 화면에서

```text
스트림 URL 모드
```

선택 후 URL 입력

---

### 기본 스트림 설정

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000 \
VITE_CAMERA_STREAM_URL=http://192.168.0.10:4747/video \
npm run dev
```

---

# 휴대폰 브라우저에서 직접 테스트

MacBook IP 확인

```bash
ipconfig getifaddr en0
```

예시

```text
192.168.0.20
```

---

## 서버 실행

### AI Server

```bash
python3 -m uvicorn server.main:app \
  --host 0.0.0.0 \
  --port 8001
```

### Backend

```bash
AI_SERVER_URL=http://192.168.0.20:8001 \
AI_PREDICT_PATH=/predict \
AI_FRAME_FIELD_NAME=frame \
python3 -m uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000
```

### Frontend

```bash
VITE_API_BASE_URL=http://192.168.0.20:8000 \
npm run dev -- --host 0.0.0.0
```

---

## 휴대폰 접속

```text
http://192.168.0.20:3000
```

---

### 주의사항

iOS/Android 브라우저는 보안 정책상 HTTP 환경에서 카메라 접근이 제한될 수 있습니다.

다음과 같은 경우 HTTPS 환경을 사용해야 합니다.

* 카메라 접근 불가
* getUserMedia 오류 발생
* "현재 브라우저에서는 카메라 기능을 지원하지 않습니다" 표시

권장 방법

* ngrok
* Cloudflare Tunnel
* mkcert
* HTTPS 배포 서버

---

# YOLO 웹캠 스크립트 테스트

Frontend를 거치지 않고 AI 모델만 테스트하는 경우

## 카메라 장치 사용

```bash
CAMERA=phone PHONE_SOURCE=1 \
./scripts/run_yolo11_webcam.sh
```

카메라가 보이지 않으면 인덱스를 변경합니다.

```bash
CAMERA=phone PHONE_SOURCE=0 \
./scripts/run_yolo11_webcam.sh

CAMERA=phone PHONE_SOURCE=1 \
./scripts/run_yolo11_webcam.sh

CAMERA=phone PHONE_SOURCE=2 \
./scripts/run_yolo11_webcam.sh
```

---

## URL 스트림 사용

```bash
CAMERA=url \
PHONE_URL=http://192.168.0.10:4747/video \
./scripts/run_yolo11_webcam.sh
```

---

# 기술 스택

* React
* Vite
* FastAPI
* YOLO11
* MediaPipe Hands
* Browser Speech Synthesis API
