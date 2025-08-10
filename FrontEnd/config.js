// 환경 설정
window.appConfig = {
  // API 기본 URL (환경에 따라 동적 설정)
  getApiBaseUrl: function() {
    // 환경변수가 있으면 사용, 없으면 기본값 사용
    if (window.__ENV__ && window.__ENV__.VITE_API_BASE_URL) {
      return window.__ENV__.VITE_API_BASE_URL;
    }
    // 개발 환경 기본값
    return 'http://localhost:8080';
  },
  
  // AI API URL (환경에 따라 동적 설정)
  getAiApiUrl: function() {
    if (window.__ENV__ && window.__ENV__.VITE_AI_API_URL) {
      return window.__ENV__.VITE_AI_API_URL;
    }
    // 개발 환경 기본값
    return 'http://localhost:8000';
  },
  
  // 프로젝트 API URL
  getProjectsApiUrl: function() {
    return `${this.getApiBaseUrl()}/api/projects`;
  },
  
  // About API URL
  getAboutApiUrl: function() {
    return `${this.getApiBaseUrl()}/api/about/KwonHalim`;
  },
  
  // 타임라인 API URL
  getTimelineApiUrl: function() {
    return `${this.getApiBaseUrl()}/api/timeline/KwonHalim`;
  }
};
