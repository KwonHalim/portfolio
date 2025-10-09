# 🚀 Portfolio Project

> 최신 기술 스택을 활용하여 제작된 포트폴리오 웹사이트입니다.  
> 개발했던 여러 프로젝트들을 소개하는 부분과 저에 대해 물어볼 수 있는 챗봇이 있습니다.

---

## 🛠 Tech Stack

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### 🧩 Backend
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### 🤖 AI / LLM
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Langchain](https://img.shields.io/badge/Langchain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-8A2BE2?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)

### ⚙️ DevOps / Infra
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)


---

## 📝 프로젝트 개요

- **FrontEnd**: 순수 Vanilla JS를 사용하여 경량화 및 성능 최적화를 달성한 동적 웹사이트
- **Backend**: Spring Boot 기반의 안정적인 RESTful API 서버
- **AI**: LangChain과 RAG(Retrieval-Augmented Generation) 기술을 활용한 지능형 챗봇 서비스
- **DevOps**: GitHub Actions와 Docker를 이용한 완전 자동화된 CI/CD 파이프라인 구축

---

## 🏗 시스템 아키텍처

각 서비스는 독립적으로 개발, 배포 및 확장이 가능하여 유지보수성과 확장성에 신경썻습니다. 각 레포지토리에 들어가면 더 자세한 설명을 보실 수 있습니다.


---

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