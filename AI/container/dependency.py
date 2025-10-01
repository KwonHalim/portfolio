from functools import lru_cache

import redis
from fastapi import Depends, Request
from fastapi import HTTPException
from fastapi.logger import logger
from langchain_community.llms.huggingface_endpoint import HuggingFaceEndpoint
from langchain_community.retrievers import BM25Retriever
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from redis.commands.search.field import TextField, VectorField
from redis.commands.search.index_definition import IndexDefinition, IndexType
from redis.lock import Lock

from config import settings
from database.chat.chat_strategy.chat_store_strategy import ChatStrategy
from database.chat.chat_strategy.langchain_mongo_repository import MongoChatStrategy
from database.chat.repository import ChatRepository
from database.vector.repository import VectorRepository
from database.vector.vector_strategy.chroma_vector import ChromaVector
from database.vector.vector_strategy.pg_vector_store import PGVectorStore
from database.vector.vector_strategy.vector_store_strategy import VectorStoreStrategy
from exception.model.exceptions import CustomException
from service.cache.cache_strategy import CacheStrategy
from service.cache.redis_semantic_cache import RedisSemanticCache
from service.chat_service import ChatService
from service.chunk.chunk_strategy.chunk_strategy import ChunkStrategy
from service.chunk.chunk_strategy.recursive_character_splitter import RecursiveCharacterSplitter
from service.chunk.service import ChunkService
from service.data.data_processor import DataProcessor
from service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy
from service.embedding.embedding_strategy.google_gemini_embedding import GoogleGeminiEmbedding
from service.embedding.service import EmbeddingService
from service.langchain.prompt import create_prompt
from service.rag_service import RAGService
from service.retriever.bm25_manager import BM25Manager
from service.retriever.document_retriever import DocumentRetriever


# ----------------------------------------------------------------
# 1. 전략 (Strategies) 및 모델 (LLM) 생성
# ----------------------------------------------------------------

@lru_cache
def get_chunk_strategy() -> ChunkStrategy:
    return RecursiveCharacterSplitter(chunk_size=500, chunk_overlap=100)

async def get_embedding_strategy() -> EmbeddingStrategy:
    return GoogleGeminiEmbedding(model_name=settings.EMBEDDING_MODEL, api_key=settings.GENAI_API_KEY)

def get_llm() -> BaseLanguageModel:
    """설정에 따라 적절한 LLM을 생성하여 반환합니다."""
    if settings.LLM_TYPE == "huggingface":
        if not settings.HUGGINGFACE_ENDPOINT_URL:
            raise ValueError("HuggingFace 모델을 사용하려면 HUGGINGFACE_ENDPOINT_URL이 필요합니다.")
        return HuggingFaceEndpoint(
            endpoint_url=settings.HUGGINGFACE_ENDPOINT_URL,
            huggingfacehub_api_token=settings.HUGGINGFACE_API_KEY,
            task="text-generation"
        )
    elif settings.LLM_TYPE == "google":
        return ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.GENAI_API_KEY
        )
    else:
        raise ValueError(f"지원하지 않는 LLM 타입입니다: {settings.LLM_TYPE}")

def get_redis() -> redis.Redis:
    return redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, decode_responses=False)


def get_chat_db_strategy() -> ChatStrategy:
    return MongoChatStrategy(mongo_uri=settings.MONGO_DB_URL)

async def get_vector_store_strategy(
    embedding_strategy: EmbeddingStrategy = Depends(get_embedding_strategy)
) -> VectorStoreStrategy:
    if settings.VECTOR_DB_TYPE == "pgvector":
        return PGVectorStore(connection_string=settings.PGVECTOR_DB_URL, embedding_strategy=embedding_strategy)
    elif settings.VECTOR_DB_TYPE == "chroma":
        return ChromaVector(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT, embedding_strategy=embedding_strategy)
    else:
        raise ValueError(f"지원하지 않는 DB 타입입니다: {settings.VECTOR_DB_TYPE}")


def get_cache_strategy(
        cache_client: redis.Redis = Depends(get_redis),
        embedding_model: EmbeddingStrategy = Depends(get_embedding_strategy)
) -> CacheStrategy:
    """
    설정에 따라 캐시 전략 객체를 생성하고, 필요한 인프라(인덱스)를 설정합니다.
    여러 워커가 동시에 인덱스를 생성하는 문제를 방지하기 위해 Lock을 사용합니다.
    """
    if settings.CACHE_TYPE == "redis_semantic":
        # 1. 인덱스 생성을 위한 정보 준비
        test_embedding = embedding_model.embed_query("test")
        embedding_dim = len(test_embedding)
        # 모델 임베딩을 자동으로 변환하기 위한 과정 Gemini embedding의 경우 3072이므로 3072입력하면 되듯이 간단한 임베딩 테스트를 통한 차원 확인

        index_name = "llm_rag_cache_idx"
        doc_prefix = "rag_cache:"
        # 레디스에 삽입할 인덱스의 이름과 키의 접두사를 미리 설정


        # 분산 락 설정
        lock_name = "llm_rag_cache_lock"
        try:
            with Lock(cache_client, lock_name, timeout=15): #Lock을 획득한 경우에만 캐시 생성이 가능
                # 2. 인덱스 존재 여부 확인 및 생성
                try:
                    cache_client.ft(index_name).info()
                #     llg_rag_cache_idx인덱스 정보를 요청한다.
                except redis.exceptions.ResponseError:
                    logger.info(f"--- Redis 시맨틱 캐시 인덱스 '{index_name}' 생성을 시작합니다.(캐시 인덱스 정보 존재하지 않음) ---")
                    schema = (
                        TextField("question", as_name="question"),
                        TextField("answer", as_name="answer"),
                        VectorField("question_vector", "HNSW", {
                            "TYPE": "FLOAT32",
                            "DIM": embedding_dim,
                            "DISTANCE_METRIC": "COSINE",
                        }),
                    )
                    # 스키마 정의
                    # question과 answer는 텍스트 필드, question_vector는 HNSW를 사용하는 알고리즘이라고 명시
                    # HNSW는 데이터를 찾는 데 사용되는 효율적 알고리즘
                    definition = IndexDefinition(prefix=[doc_prefix], index_type=IndexType.HASH)
                    # 해당 인덱스가 rag_cache: 로 시작하는 것만 관리하도록 한정
                    cache_client.ft(index_name).create_index(fields=schema, definition=definition)
                    logger.info(f"✅ Redis 시맨틱 캐시 인덱스 '{index_name}' 생성 완료")
        except Exception as e:
            logger.info(f"락 획득 또는 인덱스 생성 중 오류 발생: {e}")
            raise CustomException(status_code=501, message=str(e), reason="레디스 생성 오류", field="redis")

        # 3. 준비된 인프라를 바탕으로 캐시 전략 객체 반환
        return RedisSemanticCache(
            redis_client=cache_client,
            embedding_model=embedding_model,
            embedding_dim=embedding_dim,
            similarity_threshold = 0.97, #코사인 유사도 값
        )
    else:
        raise ValueError(f"지원하지 않는 캐시 타입입니다: {settings.CACHE_TYPE}")

# ----------------------------------------------------------------
# 2. 데이터 접근 계층 (Repository) 생성
# ----------------------------------------------------------------

async def get_vector_repository(
    vector_store_strategy: VectorStoreStrategy = Depends(get_vector_store_strategy)
) -> VectorRepository:
    return VectorRepository(vector_store_strategy=vector_store_strategy)

def get_chat_repository(
    chat_strategy: ChatStrategy = Depends(get_chat_db_strategy)
) -> ChatRepository:
    return ChatRepository(chat_strategy=chat_strategy)


# ----------------------------------------------------------------
# 3. 핵심 서비스 (Core Services) 생성
# ----------------------------------------------------------------

@lru_cache()
def get_data_processor() -> DataProcessor:
    return DataProcessor()

@lru_cache()
def get_chunk_service(
    chunk_strategy: ChunkStrategy = Depends(get_chunk_strategy)
) -> ChunkService:
    return ChunkService(chunk_strategy=chunk_strategy)

async def get_embedding_service(
    embedding_strategy: EmbeddingStrategy = Depends(get_embedding_strategy)
) -> EmbeddingService:
    return EmbeddingService(embedding_model=embedding_strategy)

def get_bm25_manager(request: Request) -> BM25Manager:
    """
    lifespan에서 생성된 싱글톤 BM25Manager 인스턴스를 반환합니다. BM25는 미리 생성하여 가져옵니다.
    """
    return request.app.state.bm25_manager


# ----------------------------------------------------------------
# 4. LangChain RAG 구성 요소 생성
# ----------------------------------------------------------------

async def get_bm25_retriever(
    bm25_manager: BM25Manager = Depends(get_bm25_manager)
) -> BM25Retriever:
    retriever = bm25_manager.retriever
    if retriever is None:
        # 문서가 없어 retriever가 생성되지 않았을 경우의 예외 처리
        raise HTTPException(
            status_code=503,
            detail="BM25 Retriever is not available. No documents are indexed."
        )
    return retriever



async def get_document_retriever(
    vector_repository: VectorRepository = Depends(get_vector_repository),
        bm25_manager: BM25Manager = Depends(get_bm25_manager)
) -> DocumentRetriever:
    return DocumentRetriever(vector_repository=vector_repository, bm25_manager=bm25_manager)

@lru_cache()
def get_prompt() -> ChatPromptTemplate:
    return create_prompt()


# ----------------------------------------------------------------
# 5. 최종 서비스 조립 (Final Services)
# ----------------------------------------------------------------

async def get_chat_service(
    retriever: DocumentRetriever = Depends(get_document_retriever),
    prompt: ChatPromptTemplate = Depends(get_prompt),
    llm: BaseLanguageModel = Depends(get_llm),
    chat_repository: ChatRepository = Depends(get_chat_repository),
    vector_repository: VectorRepository = Depends(get_vector_repository),
    cache_strategy: CacheStrategy = Depends(get_cache_strategy),
) -> ChatService:
    return ChatService(
        retriever=retriever,
        prompt=prompt,
        llm=llm,
        chat_repository=chat_repository,
        vector_repository=vector_repository,
        cache_strategy=cache_strategy)

async def get_rag_service(
    chunk_service: ChunkService = Depends(get_chunk_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    data_processor: DataProcessor = Depends(get_data_processor),
    vector_repository: VectorRepository = Depends(get_vector_repository)
) -> RAGService:
    return RAGService(
        chunk_service=chunk_service,
        embedding_service=embedding_service,
        data_processor=data_processor,
        vector_repository=vector_repository,
    )


# ----------------------------------------------------------------
# 6. 라우터에서 사용할 싱글톤 의존성 함수들
# (Lifespan에서 생성된 객체들을 꺼내주는 역할)
# ----------------------------------------------------------------
def get_singleton_chat_service(request: Request) -> ChatService:
    return request.app.state.chat_service

def get_singleton_rag_service(request: Request) -> RAGService:
    return request.app.state.rag_service

def get_bm25_manager(request: Request) -> BM25Manager:
    return request.app.state.bm25_manager