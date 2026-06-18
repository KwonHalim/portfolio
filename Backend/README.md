# Backend API 서비스 (Spring Boot)

Spring Boot 3.5.3과 Java 21을 활용한 RESTful API 서비스입니다. 포트폴리오 정보를 관리하고 제공하는 백엔드 시스템입니다.

## 🏗️ 아키텍처

### 핵심 설계 원칙
- **RESTful API** 설계 원칙 준수
- **계층형 아키텍처** (Controller → Service → Repository)
- **표준화된 응답 형식**으로 일관성 보장
- **JPA/Hibernate** 기반 객체 관계 매핑

## 📁 프로젝트 구조

```
Backend/
├── src/main/java/portfolio/backend/
│   ├── config/           # 설정 클래스
│   ├── controller/       # REST API 컨트롤러
│   ├── dto/             # 데이터 전송 객체
│   ├── entity/          # JPA 엔티티
│   ├── exception/       # 예외 처리
│   ├── repository/      # 데이터 접근 계층
│   └── service/         # 비즈니스 로직
├── src/main/resources/  # 설정 파일
└── build.gradle        # Gradle 빌드 설정
```

## 🔧 핵심 컴포넌트

### 1. 엔티티 설계

#### 프로필 엔티티 (중심 엔티티)
```java
@Entity
public class Profile extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 기본 정보
    private String name, title, email, job;
    private String githubUrl, githubUsername;
    private LocalDate birthDate;
    private String location, profileImagePath, aboutText;
    
    // 관계 매핑
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL)
    @OrderBy("startDate ASC")
    private List<Education> education;
    
    @OneToMany(mappedBy = "profile")
    private List<Experience> experience;
    
    @OneToMany(mappedBy = "profile")
    private List<Project> project;
    
    @OneToMany(mappedBy = "profile")
    private List<ProfileTechnology> profileTechnologies;
}
```

#### 관계 엔티티들
- **Education**: 학력 정보
- **Experience**: 경력 정보  
- **Project**: 프로젝트 정보
- **Technology**: 기술 스택
- **Feedback**: 사용자 피드백

### 2. 표준화된 API 응답

```java
@JsonPropertyOrder({"timestamp", "code", "message", "result"})
public class ApiResponse<T> {
    private final LocalDateTime timestamp = LocalDateTime.now();
    private final int code;
    private final String message;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T result;
    
    // 정적 팩토리 메서드
    public static <T> ApiResponse<T> success(T result) {
        return new ApiResponse<>(HttpStatus.OK.value(), 
                               HttpStatus.OK.getReasonPhrase(), result);
    }
    
    public static <T> ApiResponse<T> error(ErrorStatus errorStatus) {
        return new ApiResponse<>(errorStatus.getHttpStatus().value(), 
                               errorStatus.getMessage(), null);
    }
}
```

### 3. 예외 처리 시스템

```java
// 커스텀 예외
public class RestApiException extends RuntimeException {
    private final ErrorStatus errorStatus;
}

// 전역 예외 처리
@RestControllerAdvice
public class ExceptionAdvice {
    @ExceptionHandler(RestApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleRestApiException(RestApiException e) {
        return ResponseEntity.status(e.getErrorStatus().getHttpStatus())
                           .body(ApiResponse.error(e.getErrorStatus()));
    }
}
```

## 🚀 주요 기능

### 1. 프로필 관리
- **개인 정보**: 이름, 직함, 이메일, 직무 등
- **소셜 링크**: GitHub, LinkedIn 등
- **자기소개**: 상세한 자기소개 텍스트

### 2. 타임라인 관리
- **학력 정보**: 학교, 전공, 졸업일 등
- **경력 정보**: 회사, 직책, 기간, 업무 내용 등
- **정렬 기능**: 시작일 기준 오름차순 정렬

### 3. 프로젝트 관리
- **프로젝트 상세**: 제목, 설명, 기술 스택, 이미지 등
- **이미지 관리**: 프로젝트 스크린샷 다중 업로드
- **기술 스택**: 프로젝트별 사용 기술 표시

### 4. 피드백 시스템
- **사용자 피드백**: 방문자 피드백 수집
- **세션 관리**: 채팅 세션별 피드백 연결
- **IP 추적**: Cloudflare IP 헤더 지원

## 🛠️ 기술 스택

### 핵심 프레임워크
- **Spring Boot 3.5.3**: 메인 프레임워크
- **Spring Data JPA**: 데이터 접근 계층
- **Spring Web**: REST API 구현
- **Spring Validation**: 데이터 검증
- **Spring Security**: 허용되지 않은 API 보호

### 데이터베이스
- **PostgreSQL**: 메인 관계형 데이터베이스
- **Hibernate**: ORM 프레임워크

### 개발 도구
- **Lombok**: 보일러플레이트 코드 제거
- **Gradle**: 빌드 도구
- **Java 21**: 최신 Java 버전

### 모니터링
- **Spring Actuator**: 애플리케이션 모니터링
- **Logback**: 구조화된 로깅

## 🔄 API 엔드포인트

### 프로필 정보
- `GET /api/about/{username}`: 사용자 프로필 정보 조회

### 타임라인
- `GET /api/timeline/{username}`: 학력/경력 타임라인 조회

### 프로젝트
- `GET /api/projects`: 프로젝트 목록 조회
- `GET /api/projects/{id}`: 프로젝트 상세 정보 조회

### 피드백
- `POST /api/feedback`: 사용자 피드백 제출

## 🎯 개발 철학

### 1. 일관성 (Consistency)
- **표준화된 응답**: 모든 API가 동일한 응답 형식 사용
- **명명 규칙**: 일관된 네이밍 컨벤션 적용
- **에러 처리**: 통일된 예외 처리 방식

### 2. 확장성 (Scalability)
- **계층 분리**: 관심사별 명확한 분리
- **인터페이스 기반**: 느슨한 결합으로 유연성 확보
- **모듈화**: 기능별 독립적인 모듈 설계

### 3. 유지보수성 (Maintainability)
- **Lombok 활용**: 반복 코드 최소화
- **명확한 구조**: 패키지별 역할 분담
- **문서화**: 코드 주석 및 API 문서

### 4. 성능 최적화
- **지연 로딩**: 필요시에만 데이터 로드
- **인덱싱**: 적절한 데이터베이스 인덱스 설정

## 📝 사용 예시

### 프로필 조회
```bash
GET /api/about/KwonHalim
```

**응답:**
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "code": 200,
  "message": "OK",
  "result": {
    "name": "권하림",
    "title": "Full Stack Developer",
    "email": "example@email.com",
    "job": "개발자",
    "aboutText": "안녕하세요...",
    "education": [...],
    "experience": [...],
    "projects": [...]
  }
}
```

### 피드백 제출
```bash
POST /api/feedback
Content-Type: application/json

{
  "session": "chat-session-id",
  "feedback": "매우 유용한 정보였습니다!"
}
```

## 🔮 향후 확장 계획

- **인증/인가**: JWT 기반 사용자 인증
- **파일 업로드**: 이미지 업로드 기능
- **캐싱**: Redis를 활용한 응답 캐싱
- **API 문서**: Swagger/OpenAPI 문서화
- **테스트**: 단위/통합 테스트 추가


(기존에는 MSA방식으로 AI서버와 분리 운영했으나, 하나의 서버로 통합)
