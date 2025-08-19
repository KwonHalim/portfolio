# FrontEnd (Vanilla JavaScript)

프레임워크 없이 순수 HTML, CSS, JavaScript로 구현된 반응형 포트폴리오 웹사이트입니다.

## 🏗️ 아키텍처

### 핵심 설계 원칙
- **Vanilla JavaScript** 기반으로 번들 크기 최소화
- **모던 CSS** (Grid, Flexbox, Custom Properties) 활용
- **반응형 디자인**으로 모든 디바이스 지원
- **모듈화된 JavaScript** 구조

## 📁 프로젝트 구조

```
FrontEnd/
├── assets/              # 정적 리소스
│   ├── css/            # CSS 파일
│   ├── images/         # 이미지 파일
│   ├── js/             # JavaScript 파일
│   └── videos/         # 비디오 파일
├── src/
│   ├── components/     # HTML 컴포넌트
│   ├── js/            # JavaScript 모듈
│   ├── pages/         # 페이지 HTML
│   ├── styles/        # CSS 스타일
│   └── utils/         # 유틸리티
├── index.html         # 메인 페이지
└── build.sh          # 빌드 스크립트
```

## 🔧 핵심 컴포넌트

### 1. JavaScript 모듈 구조

#### API 통신 모듈 (`api.js`)
```javascript
// 표준화된 API 요청 헬퍼
async function fetchApi(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result; // 표준화된 응답 형식
}

// 프로필 데이터 로딩
async function loadProfileData() {
    const profileData = await fetchProfileData();
    updateUI(profileData);
}
```

#### AI 챗봇 모듈 (`chatbot.js`)
```javascript
// 실시간 채팅 기능
function sendMessage(message) {
    // 메시지 전송 및 응답 처리
    const chatData = {
        message: message,
        session_id: getChatSessionId()
    };
    
    fetch(`${AI_API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData)
    });
}

// 피드백 시스템
async function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText').value.trim();
    const feedbackData = {
        session: getChatSessionId(),
        feedback: feedbackText
    };
    
    await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
    });
}
```

#### 환경 설정 모듈 (`config.js`)
```javascript
window.appConfig = {
    // 환경 감지
    isDevelopment: function() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    },
    
    // API URL 관리 (빌드 시 교체)
    getApiBaseUrl: function() {
        return "__VITE_API_BASE_URL__";
    },
    
    getAiApiUrl: function() {
        return "__VITE_AI_API_URL__";
    }
};
```

### 2. CSS 디자인 시스템

#### CSS Custom Properties
```css
:root {
    /* 색상 팔레트 */
    --jet: hsl(0, 0%, 22%);
    --onyx: hsl(240, 1%, 17%);
    --eerie-black-1: hsl(240, 2%, 13%);
    --orange-yellow-crayola: hsl(45, 100%, 72%);
    
    /* 그라디언트 */
    --bg-gradient-onyx: linear-gradient(
        to bottom right, 
        hsl(240, 1%, 25%) 3%, 
        hsl(0, 0%, 19%) 97%
    );
    
    /* 타이포그래피 */
    --ff-poppins: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
    --fs-1: 24px;
    --fs-2: 18px;
    
    /* 그림자 */
    --shadow-1: -4px 8px 24px hsla(0, 0%, 0%, 0.25);
    --shadow-2: 0 16px 30px hsla(0, 0%, 0%, 0.25);
    
    /* 전환 효과 */
    --transition-1: 0.25s ease;
    --transition-2: 0.5s ease-in-out;
}
```

#### 반응형 레이아웃
```css
/* CSS Grid 기반 레이아웃 */
.container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: 15px;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
    .container {
        grid-template-columns: 300px 1fr;
        gap: 50px;
    }
}

/* 데스크톱 */
@media (min-width: 1024px) {
    .container {
        gap: 80px;
    }
}
```

## 🚀 주요 기능

### 1. 동적 데이터 로딩
- **API 통신**: 백엔드에서 실시간 데이터 가져오기
- **로딩 상태**: 사용자에게 피드백 제공
- **에러 처리**: 네트워크 오류 시 적절한 처리

### 2. AI 챗봇 통신
- **실시간 채팅**: WebSocket 기반 실시간 통신
- **세션 관리**: 사용자별 대화 컨텍스트 유지
- **피드백 시스템**: 사용자 피드백 수집

### 3. 반응형 네비게이션
- **모바일 메뉴**: 햄버거 메뉴로 모바일 최적화
- **스무스 스크롤**: 부드러운 페이지 전환
- **액티브 상태**: 현재 페이지 표시

### 4. 인터랙티브 요소
- **호버 효과**: 마우스 오버 시 시각적 피드백
- **애니메이션**: CSS 트랜지션과 키프레임
- **모달**: 피드백 모달 및 프로젝트 상세

## 🛠️ 기술 스택

### 핵심 기술
- **HTML5**: 시맨틱 마크업
- **CSS3**: 모던 CSS (Grid, Flexbox, Custom Properties)
- **Vanilla JavaScript**: ES6+ 문법 활용

### CSS 프레임워크
- **Custom CSS**: 프레임워크 없이 직접 구현
- **CSS Grid**: 레이아웃 시스템
- **Flexbox**: 요소 정렬 및 배치

### 개발 도구
- **Live Server**: 로컬 개발 서버
- **CSS Custom Properties**: 변수 기반 스타일링
- **ES6 Modules**: 모듈화된 JavaScript

## 🎨 디자인 시스템

### 1. 색상 팔레트
- **다크 테마**: 전문적이고 모던한 느낌
- **액센트 컬러**: 오렌지-옐로우 계열로 포인트
- **그라디언트**: 깊이감 있는 배경 효과

### 2. 타이포그래피
- **Poppins 폰트**: 현대적이고 가독성 좋은 폰트
- **계층적 크기**: 명확한 정보 계층 구조
- **반응형 폰트**: 디바이스별 최적화

### 3. 레이아웃
- **CSS Grid**: 메인 레이아웃 시스템
- **Flexbox**: 컴포넌트 내부 정렬
- **반응형 브레이크포인트**: 모바일 우선 접근

## 🔄 페이지 구조

### 1. 메인 페이지 (`index.html`)
- **사이드바**: 프로필 정보 및 네비게이션
- **메인 콘텐츠**: 동적 콘텐츠 영역
- **AI 챗봇**: 실시간 채팅 인터페이스

### 2. 서브 페이지들
- **About**: 자기소개 및 기술 스택
- **Resume**: 학력 및 경력 정보
- **Portfolio**: 프로젝트 갤러리
- **Blog**: 블로그 포스트 (향후 확장)
- **Contact**: 연락처 정보

## 🎯 개발 철학

### 1. 성능 최적화
- **번들 크기 최소화**: 프레임워크 없이 순수 기술 사용
- **빠른 로딩**: 최적화된 이미지 및 리소스
- **효율적인 CSS**: 불필요한 스타일 제거

### 2. 사용자 경험 (UX)
- **반응형 디자인**: 모든 디바이스에서 최적 경험
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원
- **직관적 인터페이스**: 명확한 정보 구조

### 3. 유지보수성
- **모듈화**: 기능별 JavaScript 파일 분리
- **CSS 변수**: 중앙화된 스타일 관리
- **명확한 네이밍**: 이해하기 쉬운 클래스명

### 4. 확장성
- **컴포넌트 기반**: 재사용 가능한 HTML 구조
- **환경 설정**: 개발/프로덕션 환경 분리
- **API 통신**: 표준화된 데이터 교환

## 📱 반응형 디자인

### 브레이크포인트
- **모바일**: 320px ~ 767px
- **태블릿**: 768px ~ 1023px
- **데스크톱**: 1024px 이상

### 적응형 요소
- **네비게이션**: 모바일에서는 햄버거 메뉴
- **레이아웃**: 화면 크기에 따른 그리드 변경
- **폰트 크기**: 디바이스별 최적화된 크기

## 🔮 향후 확장 계획

- **PWA 지원**: 오프라인 기능 및 앱 설치
- **다크/라이트 모드**: 테마 전환 기능
- **국제화**: 다국어 지원
- **성능 모니터링**: 사용자 행동 분석
- **SEO 최적화**: 검색 엔진 최적화 
