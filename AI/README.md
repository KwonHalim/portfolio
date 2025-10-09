# AI 챗봇 서비스 (RAG 기반)

FastAPI와 LangChain을 활용한 RAG(Retrieval-Augmented Generation) 기반 AI 챗봇 서비스입니다.

## 🏗️ 아키텍처

### 핵심 설계 원칙
- **전략 패턴**을 활용한 확장 가능한 설계
- **RAG 파이프라인** 기반 문서 처리
- **비동기 처리**로 고성능 구현

## 📁 프로젝트 구조

```
AI/
├── api_model/           # API 모델 및 DTO
├── config.py           # 설정 관리
├── container/          # 의존성 주입
├── database/           # 데이터베이스 레이어
│   ├── chat/          # 채팅 히스토리 관리
│   └── vector/        # 벡터 스토어 관리
├── exception/          # 예외 처리
├── routes/            # API 라우터
├── service/           # 비즈니스 로직
│   ├── chunk/         # 문서 청킹
│   ├── embedding/     # 임베딩 처리
│   ├── langchain/     # LangChain 통합
│   └── rag_service.py # RAG 메인 서비스
└── utils/             # 유틸리티
```

## 🔧 핵심 컴포넌트

### 1. 전략 패턴 기반 설계

#### 벡터 스토어 전략
```python
class VectorStoreStrategy(ABC):
    @abstractmethod
    def add_documents(self, chunks: List[Document]):
        pass
    
    @abstractmethod
    def query(self, query_text: str, k: int = 3):
        pass
```

**구현체:**
- `ChromaVector`: ChromaDB 기반 벡터 스토어
- `PGVectorStore`: PostgreSQL 기반 벡터 스토어

#### 청킹 전략
```python
class ChunkStrategy(ABC):
    @abstractmethod
    def split_documents(self, documents: List[Document]) -> List[Document]:
        pass
```

**구현체:**
- `RecursiveCharacterSplitter`: 재귀적 문자 분할
- `SemanticSplitter`: 의미 기반 분할

#### 임베딩 전략
```python
class EmbeddingStrategy(ABC):
    @abstractmethod
    def embed_documents(self, texts: List[str]):
        pass
```

**구현체:**
- `GoogleGeminiEmbedding`: Google Gemini 임베딩 모델

### 2. RAG 파이프라인

```python
class RAGService:
    def process(self, paragraph_data: str, qa_data: str):
        # 1. 문서 변환
        docs = self.data_processor.process_paragraphs(paragraphs_list)
        docs.extend(self.data_processor.process_qa_json(qa_data))
        
        # 2. 문서 청킹
        documents = self.chunk_service.split_documents(docs)
        
        # 3. 벡터 스토어 저장 (자동 임베딩)
        self.repository.add_documents(documents)
```

### 3. 데이터베이스 설계

#### 채팅 히스토리 (MongoDB)
- **전략 패턴**으로 다양한 저장소 지원
- `ChatStoreStrategy` 인터페이스 기반
- `LangchainMongoRepository` 구현체

#### 벡터 스토어 (ChromaDB)
- **자동 임베딩** 처리
- 유사도 검색 지원
- 메타데이터 기반 필터링

## 🚀 주요 기능

### 1. 문서 처리
- **TXT 파일**: 문단 단위로 자동 분할
- **Q&A 데이터**: JSON 형태로 구조화된 질의응답 처리
- **메타데이터**: 출처 식별 및 추적

### 2. 실시간 채팅
- **세션 관리**: 사용자별 대화 컨텍스트 유지
- **컨텍스트 검색**: 관련 문서 기반 응답 생성
- **히스토리 저장**: MongoDB에 대화 기록 보관

### 3. 벡터 검색
- **유사도 기반**: 코사인 유사도 계산
- **BM25**: 문서 용어 기반 검색
- **Top-K 검색**: 가장 관련성 높은 문서를 점수 계산에 의해 제공
- **점수 기반**: 신뢰도 점수 제공

## 🛠️ 기술 스택

### 핵심 프레임워크
- **FastAPI**: 고성능 비동기 웹 프레임워크
- **LangChain**: LLM 애플리케이션 프레임워크
- **Pydantic**: 데이터 검증 및 직렬화

### 데이터베이스
- **ChromaDB**: 벡터 데이터베이스
- **MongoDB**: 문서 데이터베이스 (채팅 히스토리)

### AI/ML
- **Google Gemini**: 임베딩 모델
- **LangChain Text Splitters**: 문서 분할
- **ChromaDB**: 벡터 유사도 검색

### 개발 도구
- **Loguru**: 구조화된 로깅
- **SQLAlchemy**: ORM (향후 확장용)

## 🔄 API 엔드포인트

### 문서 처리
- `POST /documents/upload`: 문서 업로드 및 벡터화
- `POST /documents/process`: 문서 처리 파이프라인 실행

### 채팅
- `POST /chat/send`: 메시지 전송 및 응답 생성
- `GET /chat/history`: 채팅 히스토리 조회

## 🎯 개발 철학

### 1. 확장성 (Scalability)
- **전략 패턴**: 새로운 벡터 스토어나 임베딩 모델 쉽게 추가
- **인터페이스 기반**: 느슨한 결합으로 유연성 확보
- **모듈화**: 각 컴포넌트의 독립성 보장

### 2. 성능 최적화
- **비동기 처리**: FastAPI의 비동기 특성 활용
- **자동 임베딩**: ChromaDB의 내장 임베딩 기능 활용
- **효율적인 검색**: 인덱싱과 캐싱 최적화
- **Reids Vector**: 유사한 질문은 Redis에서 바로 응답

### 3. 유지보수성
- **명확한 분리**: 관심사별 모듈 분리
- **타입 안전성**: Pydantic 모델 활용
- **구조화된 로깅**: 디버깅 및 모니터링 용이

## 📝 사용 예시

### 문서 업로드
```python
# 문단 데이터 처리
paragraph_data = "자기소개 내용..."
qa_data = '[{"question": "질문", "answer": "답변"}]'

# RAG 서비스로 처리
rag_service.process(paragraph_data, "profile.txt", qa_data, "qa.json")
```

### 채팅 응답
```python
# 사용자 메시지로 관련 문서 검색
query = "프로젝트 경험에 대해 알려주세요"
results = vector_store.query(query, k=3)

# 컨텍스트 기반 응답 생성
response = generate_response(query, results)
```

## 🔮 향후 확장 계획

- **다양한 벡터 스토어**: Pinecone, Weaviate 등 추가 지원
- **다중 임베딩 모델**: OpenAI, Cohere 등 다양한 모델 지원
- **실시간 스트리밍**: WebSocket 기반 실시간 응답