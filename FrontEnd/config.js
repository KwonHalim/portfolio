// 1. index.html에 주입된 전역 환경 변수를 가져옵니다.
//    build.sh 스크립트가 localhost 또는 실제 도메인 주소를 여기에 넣어줍니다.
const env = window.__ENV__;

// 2. 각 API의 기본 URL을 상수로 정의합니다.
const API_BASE_URL = env.VITE_API_BASE_URL;
const AI_API_URL = env.VITE_AI_API_URL;

// 3. 다른 파일에서 import해서 사용할 최종 API 주소들을 '수출(export)' 합니다.
export const PROJECTS_API_URL = `${API_BASE_URL}/api/projects`;
export const ABOUT_API_URL = `${API_BASE_URL}/api/about/KwonHalim`;
export const TIMELINE_API_URL = `${API_BASE_URL}/api/timeline/KwonHalim`;
export const BACKEND_FEEDBACK_URL =  `${API_BASE_URL}/api/feedback`;
export const CHATBOT_API_URL = `${AI_API_URL}/chat/message`;
export const CHATBOT_FEEDBACK_URL = `${AI_API_URL}/chat/feedback`;
