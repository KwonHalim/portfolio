# 🚀 Interactive Portfolio Project

> 최신 기술 스택을 활용하여 제작된 **인터랙티브 포트폴리오 웹사이트**입니다.  
> 단순히 결과물을 보여주는 것을 넘어, 사용자와 상호작용하는 AI 챗봇, 동적 데이터 로딩, 자동화된 CI/CD 파이프라인 등 개발자의 기술적 역량을 종합적으로 보여주는 데 중점을 두었습니다.

---

## 🛠 Tech Stack

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Backend
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### AI
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-RAG-green?style=for-the-badge)
![Redis](https://img.shields.io/badge/Redis-Semantic%20Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-VectorStore-blueviolet?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-Chat%20History-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

### DevOps
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-CDN-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

---

## 📝 프로젝트 개요

- **FrontEnd**: 순수 Vanilla JS를 사용하여 경량화 및 성능 최적화를 달성한 동적 웹사이트
- **Backend**: Spring Boot 기반의 안정적인 RESTful API 서버
- **AI**: LangChain과 RAG(Retrieval-Augmented Generation) 기술을 활용한 지능형 챗봇 서비스
- **DevOps**: GitHub Actions와 Docker를 이용한 완전 자동화된 CI/CD 파이프라인 구축

---

## 🏗 시스템 아키텍처

이 프로젝트는 명확하게 분리된 3개의 핵심 서비스(FrontEnd, Backend, AI)가 유기적으로 연동되는 **마이크로서비스 아키텍처(MSA)**를 기반으로 설계되었습니다.  
각 서비스는 독립적으로 개발, 배포 및 확장이 가능하여 유지보수성과 확장성을 극대화했습니다.

---

## 🔄 워크플로우

### 사용자 접속
- 사용자는 **Cloudflare**를 통해 프론트엔드 웹사이트에 접속합니다.

### 데이터 요청
- 프론트엔드(Vanilla JS)는 필요한 **프로필**, **프로젝트**, **타임라인** 등의 데이터를 백엔드(Spring Boot) API 서버에 **비동기적으로 요청**합니다.

### 데이터 응답
- 백엔드 서버는 **PostgreSQL** 데이터베이스에서 해당 정보를 조회하여 **표준화된 JSON** 형식으로 프론트엔드에 전달합니다.

### AI 챗봇 상호작용
1. 사용자가 챗봇에 질문 → **AI(FastAPI)** 서버로 전송
2. **Redis 시맨틱 캐시 확인** → 없으면 **벡터 변환 후 ChromaDB 검색(RAG)** 
3. 검색된 문서 + 질문을 **Google Gemini LLM**에 전달 → 최종 답변 생성
4. 대화 내용은 **MongoDB**에 저장하여 **채팅 히스토리 관리** ### 피드백 루프
- 사용자 피드백을 **ChromaDB**에 반영해 RAG 시스템 **정확도 점진 개선** ---

## ⚙️ DevOps

- **CI/CD 자동화**: `main` 브랜치에 코드가 푸시될 때마다 **GitHub Actions 워크플로우** 자동 트리거
- **버전 태깅**: `mathieudutour/github-tag-action`으로 자동 **시맨틱 버전 태그 생성** - **멀티플랫폼 Docker 빌드**: `docker/setup-qemu-action`, `docker/setup-buildx-action`으로 **ARM64/AMD64 동시 빌드** - **이미지 푸시**: 빌드된 이미지를 **DockerHub 레지스트리**에 푸시
- **서버 배포**: SSH를 통해 최신 이미지 pull → 기존 컨테이너 교체로 **무중단 배포**에 가까운 전략
- **프론트엔드 배포**: `build.sh`로 환경별 API URL 주입 → **Cloudflare Pages**로 정적 파일 배포

---

## 🧑‍💻 개발 환경 & 도구

- **커밋 컨벤션**: Conventional Commits + commitlint + husky
- **이슈 관리**: GitHub Issue Template(bug, feature, refactor)
- **로깅**: Loguru(AI), Logback(Backend)으로 구조화된 로그 기록