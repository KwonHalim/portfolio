// 환경변수 설정 관리
class Config {
    constructor() {
        console.log('Config 클래스 생성자 호출됨');
        this.loadEnvironmentVariables();
        this.loadEnvFromFile();
    }

    // .env 파일에서 환경변수 로드
    loadEnvFromFile() {
        // 간단한 fetch로 .env 파일 읽기
        fetch('./.env')
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    console.log('ℹ️ .env 파일을 찾을 수 없습니다. 기본값을 사용합니다.');
                    return null;
                }
            })
            .then(content => {
                if (content) {
                    this.parseEnvFile(content);
                    console.log('✅ .env 파일에서 환경변수를 로드했습니다.');
                    // 환경변수 다시 로드
                    this.loadEnvironmentVariables();
                }
            })
            .catch(error => {
                console.log('ℹ️ .env 파일을 찾을 수 없거나 로드할 수 없습니다. 기본값을 사용합니다.');
            });
    }

    // .env 파일 내용 파싱
    parseEnvFile(content) {
        const lines = content.split('\n');
        
        lines.forEach(line => {
            const cleanLine = line.trim();
            
            // 빈 줄이나 주석 라인 무시
            if (cleanLine === '' || cleanLine.startsWith('#')) {
                return;
            }
            
            // KEY=VALUE 형태 파싱
            const equalIndex = cleanLine.indexOf('=');
            if (equalIndex > 0) {
                const key = cleanLine.substring(0, equalIndex).trim();
                const value = cleanLine.substring(equalIndex + 1).trim();
                
                // 따옴표 제거
                const cleanValue = value.replace(/^["']|["']$/g, '');
                
                // window.__ENV__에 설정
                if (!window.__ENV__) {
                    window.__ENV__ = {};
                }
                window.__ENV__[key] = cleanValue;
                console.log(`📝 환경변수 설정: ${key} = ${cleanValue}`);
            }
        });
    }

    // 환경변수 가져오기
    getEnvVar(key, defaultValue = '') {
        // 브라우저 환경변수 접근 시도 (window.__ENV__ 형태)
        if (window.__ENV__ && window.__ENV__[key]) {
            return window.__ENV__[key];
        }
        
        // 기본값 반환
        return defaultValue;
    }

    loadEnvironmentVariables() {
        console.log('환경변수 로드 시작');
        // 환경변수 로드
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
console.log('config.js 실행됨 - 전역 설정 생성 시작');
window.appConfig = new Config();
console.log('전역 설정 생성 완료:', window.appConfig);

export default window.appConfig; 