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
http://127.0.0.1:3000
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

## iPhone 카메라 테스트

### Frontend 화면에서 테스트

macOS 연속성 카메라 또는 iPhone 웹캠이 브라우저에 잡히면 독서 화면의 `카메라` 선택 박스에서 `iPhone`, `Continuity Camera` 항목을 선택할 수 있습니다.

1. iPhone과 MacBook을 같은 Apple ID로 로그인합니다.
2. iPhone의 Wi-Fi, Bluetooth를 켜고 MacBook 근처에 둡니다.
3. 브라우저에서 카메라 권한을 허용합니다.
4. 독서 화면에서 `카메라`를 `iPhone/휴대폰 자동 선택`으로 두거나, 목록에 보이는 iPhone 항목을 직접 선택한 뒤 `카메라 시작`을 누릅니다.

브라우저 권한을 허용하기 전에는 카메라 이름이 `카메라 1`처럼 보일 수 있습니다. 한 번 `카메라 시작`을 누른 뒤 권한을 허용하면 실제 장치명이 표시됩니다.

휴대폰 웹캠 장치를 기본으로 먼저 열고 싶으면 프론트엔드를 실행할 때 카메라 이름 키워드를 지정할 수 있습니다. Chrome의 `chrome://settings/content/camera`에 보이는 장치명 일부를 쉼표로 넣습니다.

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000 \
VITE_PREFERRED_CAMERA_KEYWORDS=iphone,camo,droidcam \
npm run dev
```

브라우저에 해당 카메라가 `Camo Camera`, `DroidCam`, `iPhone Camera`처럼 잡혀 있으면 선택 박스에서 직접 고르지 않아도 `카메라 시작` 시 해당 장치를 우선으로 엽니다.

### MacBook 화면에 휴대폰 카메라 띄우기

MacBook에서 실행 중인 프론트엔드 화면에 휴대폰 카메라 영상을 띄우려면, 휴대폰을 MacBook의 웹캠처럼 인식시키거나 휴대폰 카메라 앱이 영상 URL을 제공해야 합니다. 브라우저는 같은 Wi-Fi에 있는 휴대폰 카메라를 자동으로 가져올 수 없기 때문에 별도 연결 방식이 필요합니다.

가장 쉬운 방법은 iPhone의 macOS 연속성 카메라입니다.

1. iPhone과 MacBook을 같은 Apple ID로 로그인합니다.
2. iPhone의 Wi-Fi, Bluetooth를 켜고 MacBook 근처에 둡니다.
3. MacBook 브라우저에서 프론트엔드 독서 화면을 엽니다.
4. 브라우저에서 카메라 권한을 허용합니다.
5. 독서 화면의 `카메라` 선택 박스에서 `iPhone` 또는 `Continuity Camera` 항목을 선택하고 `카메라 시작`을 누릅니다.

Android이거나 연속성 카메라가 안 잡히는 경우에는 Camo, DroidCam, EpocCam 같은 앱으로 휴대폰을 MacBook 웹캠 장치로 등록한 뒤 같은 방식으로 선택합니다.

앱이 MacBook 웹캠 장치가 아니라 `http://.../video` 같은 영상 URL만 제공하는 경우에는 독서 화면에서 `스트림 URL` 모드를 선택한 뒤 URL을 입력합니다. 예를 들어 DroidCam/IP Webcam 앱이 `http://192.168.0.10:4747/video` 주소를 제공하면 그 주소를 입력하고 `카메라 시작`을 누릅니다.

기본으로 스트림 URL 모드를 열고 싶으면 프론트엔드를 아래처럼 실행합니다.

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000 \
VITE_CAMERA_STREAM_URL=http://192.168.0.10:4747/video \
npm run dev
```

이 방식은 브라우저 카메라 목록에 휴대폰이 안 보여도 노트북 화면에 휴대폰 영상을 띄울 수 있습니다. 다만 AI 인식을 위해 프론트엔드가 영상 프레임을 읽어야 하므로, 스트림 서버가 CORS를 허용하지 않으면 영상은 보이지만 `/api/interaction/detect`로 프레임을 보낼 수 없습니다. 이 경우에는 백엔드에서 해당 스트림 URL을 프록시하거나 직접 읽어서 AI 서버로 전달해야 합니다.

### 휴대폰 브라우저에서 직접 테스트

휴대폰에서 프론트엔드 화면을 직접 열고 휴대폰 카메라를 사용하는 방식도 가능합니다. 이 방식은 MacBook 화면에 휴대폰 영상을 띄우는 것이 아니라, 휴대폰 브라우저에서 서비스를 직접 실행하는 테스트 방법입니다. 이 경우 프론트엔드가 휴대폰 브라우저에서 실행되므로 API 주소는 `127.0.0.1`이 아니라 MacBook의 같은 Wi-Fi IP를 사용해야 합니다.

먼저 MacBook의 Wi-Fi IP를 확인합니다.

```bash
ipconfig getifaddr en0
```

예를 들어 MacBook IP가 `192.168.0.20`이면 서버를 아래처럼 실행합니다.

```bash
# AI 서버
python3 -m uvicorn server.main:app --host 0.0.0.0 --port 8001

# Backend 서버
AI_SERVER_URL=http://192.168.0.20:8001 \
AI_PREDICT_PATH=/predict \
AI_FRAME_FIELD_NAME=frame \
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend 서버
VITE_API_BASE_URL=http://192.168.0.20:8000 npm run dev -- --host 0.0.0.0
```

휴대폰에서는 같은 Wi-Fi에 연결한 뒤 아래 주소로 접속합니다.

```text
http://192.168.0.20:3000
```

단, iOS/Android 브라우저는 `getUserMedia` 카메라 접근을 보안 컨텍스트에서만 허용하는 경우가 많습니다. 휴대폰에서 `현재 브라우저에서는 카메라 기능을 지원하지 않습니다` 또는 HTTPS 안내가 표시되면, 브라우저가 HTTP 주소에서 카메라 API를 숨긴 상태입니다. 이 경우 프론트엔드를 HTTPS 주소로 열어야 합니다. 개발 중에는 ngrok, Cloudflare Tunnel, mkcert로 만든 로컬 HTTPS, 또는 배포된 HTTPS 주소를 사용합니다.

### YOLO 웹캠 스크립트에서 테스트

프론트엔드를 거치지 않고 AI-Data 쪽의 `scripts/yolo11_webcam.py`를 직접 실행하는 경우에는 붙여둔 실행 스크립트 기준으로 아래처럼 실행합니다.

```bash
CAMERA=phone PHONE_SOURCE=1 ./scripts/run_yolo11_webcam.sh
```

`PHONE_SOURCE=1`에서 iPhone 화면이 안 뜨면 OpenCV 카메라 인덱스가 다른 번호로 잡힌 것입니다. 아래처럼 번호를 바꿔가며 확인합니다.

```bash
CAMERA=phone PHONE_SOURCE=0 ./scripts/run_yolo11_webcam.sh
CAMERA=phone PHONE_SOURCE=1 ./scripts/run_yolo11_webcam.sh
CAMERA=phone PHONE_SOURCE=2 ./scripts/run_yolo11_webcam.sh
```

DroidCam, Camo, EpocCam처럼 휴대폰 앱이 영상 URL을 제공하는 방식이면 `CAMERA=url`을 사용합니다.

```bash
CAMERA=url PHONE_URL=http://192.168.0.10:4747/video ./scripts/run_yolo11_webcam.sh
```

## 라이선스

이 프로젝트는 MIT License를 따릅니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 확인하세요.
