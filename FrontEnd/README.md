# Portfolio Frontend

이 프로젝트는 개인 포트폴리오 웹사이트의 프론트엔드입니다.

## 🚀 시작하기

### 백엔드 서버 실행
먼저 백엔드 서버를 실행해야 합니다:

```bash
cd Backend
./gradlew bootRun
```

백엔드 서버는 `http://localhost:8080`에서 실행됩니다.

### 프론트엔드 실행
프론트엔드를 실행하는 방법은 여러 가지가 있습니다:

#### 방법 1: Python HTTP 서버
```bash
cd FrontEnd
python3 -m http.server 8000
```

#### 방법 2: Live Server (VS Code 확장)
VS Code에서 Live Server 확장을 설치하고 `index.html` 파일을 우클릭하여 "Open with Live Server"를 선택합니다.

#### 방법 3: Node.js http-server
```bash
npm install -g http-server
cd FrontEnd
http-server
```

## 🔗 API 연결

이 프로젝트는 백엔드 API와 연결되어 동적으로 콘텐츠를 로드합니다.

### API 엔드포인트
- **프로필 정보**: `GET /api/about/KwonHalim`

### 연결된 데이터
- **페이지 제목**: `job_type` + `name`
- **사이드바 이름**: `name`
- **사이드바 직업**: `job_type`
- **About 섹션 제목**: `title`
- **About 텍스트**: `introduction`
- **Tech Stack**: `stack` 배열
- **Tech Stack 설명**: `description` 배열

### API 연결 테스트
API 연결을 테스트하려면 `test-api.html` 파일을 브라우저에서 열어보세요.

## 📁 프로젝트 구조

```
FrontEnd/
├── index.html              # 메인 페이지
├── test-api.html           # API 테스트 페이지
├── assets/                 # 정적 리소스
│   ├── images/            # 이미지 파일들
│   ├── css/               # CSS 파일들
│   └── js/                # JavaScript 파일들
└── src/
    ├── js/
    │   ├── api.js         # API 연결 로직
    │   ├── about.js       # About 페이지 로직
    │   ├── chatbot.js     # 챗봇 기능
    │   ├── navigation.js  # 네비게이션 로직
    │   ├── projects.js    # 프로젝트 페이지 로직
    │   ├── sidebar.js     # 사이드바 로직
    │   └── utils.js       # 유틸리티 함수들
    ├── styles/            # CSS 스타일 파일들
    └── components/        # 컴포넌트 파일들
```

## 🛠️ 기술 스택

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API

## 🔧 개발 환경 설정

1. 백엔드 서버가 실행 중인지 확인
2. 프론트엔드 서버 실행
3. 브라우저에서 `http://localhost:8000` (또는 해당 포트) 접속

## 📝 주의사항

- 백엔드 서버가 실행되지 않으면 기본값이 표시됩니다
- CORS 설정이 되어 있어야 API 호출이 가능합니다
- API 호출 실패 시 콘솔에 오류 메시지가 표시됩니다 
