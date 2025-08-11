// 환경 설정
window.appConfig = {
  // 환경 감지 함수
  isDevelopment: function() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('192.168.');
  },

  // API 기본 URL (환경에 따라 동적 설정)
  getApiBaseUrl: function() {
    // 환경변수가 명시적으로 설정되었을 때만 사용
    if (window.__ENV__ && window.__ENV__.VITE_API_BASE_URL && window.__ENV__.VITE_API_BASE_URL !== 'http://localhost:8080') {
      return window.__ENV__.VITE_API_BASE_URL;
    }
    
    // 기본값은 항상 localhost
    return 'http://localhost:8080';
  },
  
  // AI API URL (환경에 따라 동적 설정)
  getAiApiUrl: function() {
    // 환경변수가 명시적으로 설정되었을 때만 사용
    if (window.__ENV__ && window.__ENV__.VITE_AI_API_URL && window.__ENV__.VITE_AI_API_URL !== 'http://localhost:8000') {
      return window.__ENV__.VITE_AI_API_URL;
    }
    
    // 기본값은 항상 localhost
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
