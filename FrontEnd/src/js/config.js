// 환경변수 설정 관리
class Config {
    constructor() {
        this.loadEnvironmentVariables();
    }

    // 환경변수 가져오기 (기본값 사용)
    getEnvVar(key, defaultValue = '') {
        // 브라우저 환경변수 접근 시도 (window.__ENV__ 형태)
        if (window.__ENV__ && window.__ENV__[key]) {
            return window.__ENV__[key];
        }
        
        // 기본값 반환
        return defaultValue;
    }

    loadEnvironmentVariables() {
        // 환경변수 로드 (Vite 환경변수 또는 기본값 사용)
        this.apiBaseUrl = this.getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080');
        this.apiProjectsEndpoint = this.getEnvVar('VITE_API_PROJECTS_ENDPOINT', '/api/projects');
        this.aiApiUrl = this.getEnvVar('VITE_AI_API_URL', '');
        this.aiApiKey = this.getEnvVar('VITE_AI_API_KEY', '');
        this.appName = this.getEnvVar('VITE_APP_NAME', 'Portfolio Website');
        this.appVersion = this.getEnvVar('VITE_APP_VERSION', '1.0.0');

        // API URL 조합
        this.fullApiUrl = this.apiBaseUrl + this.apiProjectsEndpoint;

        console.log('환경변수 로드 완료:', {
            apiBaseUrl: this.apiBaseUrl,
            apiProjectsEndpoint: this.apiProjectsEndpoint,
            fullApiUrl: this.fullApiUrl,
            appName: this.appName,
            appVersion: this.appVersion
        });
    }

    // API URL 가져오기
    getApiUrl(endpoint = '') {
        return this.apiBaseUrl + endpoint;
    }

    // 프로젝트 API URL 가져오기
    getProjectsApiUrl() {
        return this.fullApiUrl;
    }

    // 특정 프로젝트 상세 API URL 가져오기
    getProjectDetailApiUrl(projectId) {
        return this.fullApiUrl + '/' + projectId;
    }

    // AI API 설정 가져오기
    getAiConfig() {
        return {
            url: this.aiApiUrl,
            key: this.aiApiKey
        };
    }

    // 개발 환경인지 확인
    isDevelopment() {
        return import.meta.env.DEV;
    }

    // 프로덕션 환경인지 확인
    isProduction() {
        return import.meta.env.PROD;
    }
}

// 전역 설정 인스턴스 생성
window.appConfig = new Config();

export default window.appConfig; 