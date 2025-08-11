// FrontEnd/config.js

window.appConfig = {
  // 환경 감지 함수는 개발/프로덕션 UI를 다르게 보여주는 등 다른 용도로 여전히 유용할 수 있습니다.
  isDevelopment: function() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  },

  // API URL 함수는 이제 플레이스홀더만 반환합니다.
  // 이 값은 build.sh 스크립트에 의해 실제 URL로 교체됩니다.
  getApiBaseUrl: function() {
    return "__VITE_API_BASE_URL__";
  },
  
  getAiApiUrl: function() {
    return "__VITE_AI_API_URL__";
  },
  
  // 아래 함수들은 getApiBaseUrl()의 반환 값에 의존하므로 수정할 필요가 없습니다.
  getProjectsApiUrl: function() {
    return `${this.getApiBaseUrl()}/api/projects`;
  },
  
  getProjectDetailApiUrl: function(projectId) {
    return `${this.getApiBaseUrl()}/api/projects/${projectId}`;
  },
  
  getAboutApiUrl: function() {
    return `${this.getApiBaseUrl()}/api/about/KwonHalim`;
  },
  
  getTimelineApiUrl: function() {
    return `${this.getApiBaseUrl()}/api/timeline/KwonHalim`;
  }
};