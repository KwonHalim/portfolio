// 환경 설정 및 API URL 상수들
export const API_BASE_URL = window.__ENV__?.VITE_API_BASE_URL || 'http://localhost:8080';
export const AI_API_URL = window.__ENV__?.VITE_AI_API_URL || 'http://localhost:8000';

// 백엔드 API 엔드포인트
export const ABOUT_API_URL = `${API_BASE_URL}/api/profile/about`;
export const TIMELINE_API_URL = `${API_BASE_URL}/api/tech-stacks/KwonHalim`;
export const PROJECTS_API_URL = `${API_BASE_URL}/api/projects`;
export const BACKEND_FEEDBACK_URL = `${API_BASE_URL}/api/feedback`;

// AI 서비스 API 엔드포인트
export const CHATBOT_API_URL = `${AI_API_URL}/chat/message`;
export const CHATBOT_FEEDBACK_URL = `${AI_API_URL}/feedback`;

// 앱 설정
export const APP_NAME = window.__ENV__?.VITE_APP_NAME || 'Portfolio Website';
export const APP_VERSION = window.__ENV__?.VITE_APP_VERSION || '1.0.0';

// 디버그 모드
export const DEBUG_MODE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 로깅 함수
export const log = (message, data = null) => {
  if (DEBUG_MODE) {
    console.log(`[${APP_NAME}] ${message}`, data);
  }
};

// 에러 로깅 함수
export const logError = (message, error = null) => {
  if (DEBUG_MODE) {
    if (error) {
      console.error(`[${APP_NAME}] ${message}`, error);
    } else {
      console.error(`[${APP_NAME}] ${message}`);
    }
  }
};
