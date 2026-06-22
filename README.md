# Fingertips Frontend

## 1. 프로젝트 개요

Fingertips는 시각장애 아동이 그림책을 손끝으로 탐색하며 내용을 이해할 수 있도록 지원하는 AI 기반 그림책 보조 서비스이다.

사용자가 그림책 속 특정 영역을 손가락으로 가리키면, AI가 해당 영역의 객체와 페이지를 인식하고 적절한 음성 설명을 제공한다.

본 프로젝트는 전체 시스템 중 사용자 인터페이스(UI)와 카메라 입력, 음성 출력 기능을 담당하는 Frontend 애플리케이션이다.

---

## 2. 시스템 구성

전체 시스템은 Frontend, Backend, AI Server로 구성된다.

```text
Frontend (React)
        ↓
Backend (FastAPI)
        ↓
AI Server (YOLO11)
```

데이터 흐름은 다음과 같다.

```text
Frontend
    ↓
Backend
    ↓
AI Server
    ↓
Backend
    ↓
Frontend
```

### 처리 과정

1. 사용자가 카메라를 통해 그림책을 촬영한다.
2. Frontend가 이미지를 Backend로 전송한다.
3. Backend가 AI Server에 추론을 요청한다.
4. AI Server가 객체 탐지 및 페이지 분류를 수행한다.
5. 결과가 Backend를 거쳐 Frontend로 반환된다.
6. Frontend가 탐지 결과를 시각화하고 음성으로 안내한다.

---

## 3. 주요 기능

### 그림책 객체 인식

* YOLO11 기반 객체 탐지
* 그림책 객체 및 촉각 교구 인식
* 점자 및 텍스트 영역 탐지

### 손끝 상호작용

* MediaPipe Hands 기반 손끝 위치 추적
* 손끝과 객체 간 매칭
* 사용자가 가리킨 영역 설명 제공

### 음성 안내

* Browser Speech Synthesis API 활용
* 다양한 음성 스타일 제공

  * 아이
  * 엄마
  * 아빠

### 카메라 입력

* 웹캠 지원
* iPhone 연속성 카메라 지원
* Android 외부 카메라 앱 지원
* URL 기반 스트림 입력 지원

---

## 4. 실행 환경

### 개발 환경

| 항목            | 내용              |
| ------------- | --------------- |
| OS            | macOS           |
| Runtime       | Node.js         |
| Frontend      | React + Vite    |
| Backend       | FastAPI         |
| AI Model      | YOLO11          |
| Hand Tracking | MediaPipe Hands |

---

# 5. 실행 방법

본 프로젝트는 AI Server → Backend → Frontend 순으로 실행한다.

## 5.1 AI Server 실행

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

## 5.2 Backend 실행

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

## 5.3 Frontend 실행

```bash
cd /Users/yeooni/Desktop/oss/FE

npm install

VITE_API_BASE_URL=http://127.0.0.1:8000 \
npm run dev
```

브라우저 접속 주소

```text
http://127.0.0.1:3000
```

---

## 6. 시스템 상태 확인

### Backend 상태 확인

```bash
curl http://127.0.0.1:8000/health
```

### AI Server 상태 확인

```bash
curl http://127.0.0.1:8001/health
```

정상 동작 시 HTTP Status Code 200을 반환한다.

---

## 7. 테스트 환경

### 실험 환경 1

* 형광등이 켜진 실내 환경
* 일반 웹캠 사용

> 조명 반사로 인해 일부 객체 인식 성능 저하가 발생하였다.

### 실험 환경 2

* 직접 조명을 제거한 환경
* 동일 카메라 사용

> 형광등 반사가 감소하면서 객체 인식 성능이 향상되었다.

---

## 8. 화면 구성

### 홈 화면

> 프로젝트 소개 및 카메라 진입 화면

<img width="1258" height="736" alt="스크린샷 2026-06-22 오후 3 42 55" src="https://github.com/user-attachments/assets/5b37773c-3244-42ec-b86a-04a598168fda" />
<img width="1221" height="750" alt="스크린샷 2026-06-22 오후 3 43 02" src="https://github.com/user-attachments/assets/fe599ff1-2fd5-405e-8808-4eb3ba65fdfb" />

---

### 독서 화면 (객체 탐지 결과 & 손끝 위치 추적

> 실시간 카메라 영상 및 AI 인식 결과 표시
> YOLO11 기반 객체 탐지 결과 시각화
> MediaPipe Hands 기반 손끝 위치 표시

<img width="1232" height="767" alt="스크린샷 2026-06-22 오후 3 44 10" src="https://github.com/user-attachments/assets/62d265f5-7f3c-46ad-b490-e3097723adc8" />

---

## 9. 기술 스택

| 분야              | 기술                           |
| --------------- | ---------------------------- |
| Frontend        | React, Vite                  |
| Backend         | FastAPI                      |
| AI              | YOLO11                       |
| Hand Tracking   | MediaPipe Hands              |
| TTS             | Browser Speech Synthesis API |
| Dataset         | Roboflow                     |
| Version Control | GitHub                       |

---

## 10. 기대 효과

* 시각장애 아동의 그림책 접근성 향상
* 촉각 교구와 AI 음성 안내를 결합한 상호작용 제공
* 기존 오디오북의 일방향 정보 전달 한계 보완
* 사용자의 손끝 탐색 행동을 기반으로 한 능동적 독서 경험 제공
