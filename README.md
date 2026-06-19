# Fingertips Frontend

시각장애 아동을 위한 AI 그림책 보조 서비스의 프론트엔드입니다.

## Frontend 실행

```bash
cd /Users/yeooni/Desktop/oss/FE
npm install
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://127.0.0.1:5173
```

## 전체 연동 실행 순서

터미널을 3개 열고 아래 순서대로 실행합니다.

### 1. AI 서버

```bash
cd /Users/yeooni/Desktop/oss/AI-Data
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-server.txt
python3 -m uvicorn server.main:app --host 127.0.0.1 --port 8001
```

YOLO 모델 버전을 바꿔야 하면 실행할 때 경로만 바꿉니다.

```bash
YOLO_MODEL_PATH=artifacts/yolo11-v13/best.pt \
YOLO_DATA_YAML=artifacts/yolo11-v13/data.yaml \
python3 -m uvicorn server.main:app --host 127.0.0.1 --port 8001
```

### 2. Backend 서버

```bash
cd /Users/yeooni/Desktop/oss/BE
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
AI_SERVER_URL=http://127.0.0.1:8001 \
AI_PREDICT_PATH=/predict \
AI_FRAME_FIELD_NAME=frame \
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend 서버

```bash
cd /Users/yeooni/Desktop/oss/FE
npm install
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

## 확인용 API

백엔드와 AI 서버가 켜졌는지 확인합니다.

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8001/health
```

프론트엔드에서 카메라를 켜면 카메라 프레임이 백엔드의 `/api/interaction/detect`로 전송됩니다.

```text
Frontend -> Backend -> AI 서버 -> Backend -> Frontend
```

현재 TTS는 브라우저 기본 `speechSynthesis`를 사용합니다. 독서 화면에서 아이, 엄마, 아빠 음성 타입을 선택할 수 있습니다.
