from functools import lru_cache

from fastapi import Depends, Request
from langchain_community.llms.huggingface_endpoint import HuggingFaceEndpoint
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from AI.config import settings
from AI.database.chat.chat_strategy.chat_store_strategy import ChatStrategy
from AI.database.chat.chat_strategy.langchain_mongo_repository import MongoChatStrategy
from AI.database.chat.repository import ChatRepository
from AI.database.vector.repository import VectorRepository
from AI.database.vector.vector_strategy.chroma_vector_store import ChromaVectorStore
from AI.database.vector.vector_strategy.pg_vector_store import PGVectorStore
from AI.database.vector.vector_strategy.vector_store_strategy import VectorStoreStrategy
from AI.service.chat_service import ChatService
from AI.service.chunk.chunk_strategy.chunk_strategy import ChunkStrategy
from AI.service.chunk.chunk_strategy.recursive_character_splitter import RecursiveCharacterSplitter
from AI.service.chunk.service import ChunkService
from AI.service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy
from AI.service.embedding.embedding_strategy.google_gemini_embedding import GoogleGeminiEmbedding
from AI.service.embedding.service import EmbeddingService
from AI.service.langchain.document_retriever import DocumentRetriever
from AI.service.langchain.prompt import create_prompt
from AI.service.data.data_processor import DataProcessor
from AI.service.rag_service import RAGService


# ----------------------------------------------------------------
# 1. 전략 (Strategies) 및 모델 (LLM) 생성
# ----------------------------------------------------------------

@lru_cache
def get_chunk_strategy() -> ChunkStrategy:
    return RecursiveCharacterSplitter(chunk_size=500, chunk_overlap=100)

async def get_embedding_strategy() -> EmbeddingStrategy:
    return GoogleGeminiEmbedding(model_name="gemini-embedding-001", api_key=settings.GENAI_API_KEY)

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
            model="gemini-1.5-flash",
            google_api_key=settings.GENAI_API_KEY
        )
    else:
        raise ValueError(f"지원하지 않는 LLM 타입입니다: {settings.LLM_TYPE}")

def get_chat_db_strategy() -> ChatStrategy:
    return MongoChatStrategy(mongo_uri=settings.MONGO_DB_URL)

async def get_vector_store_strategy(
    embedding_strategy: EmbeddingStrategy = Depends(get_embedding_strategy)
) -> VectorStoreStrategy:
    if settings.VECTOR_DB_TYPE == "pgvector":
        return PGVectorStore(connection_string=settings.PGVECTOR_DB_URL, embedding_strategy=embedding_strategy)
    elif settings.VECTOR_DB_TYPE == "chroma":
        return ChromaVectorStore(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT, embedding_strategy=embedding_strategy)
    else:
        raise ValueError(f"지원하지 않는 DB 타입입니다: {settings.VECTOR_DB_TYPE}")


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


# ----------------------------------------------------------------
# 4. LangChain RAG 구성 요소 생성
# ----------------------------------------------------------------

async def get_document_retriever(
    vector_repository: VectorRepository = Depends(get_vector_repository)
) -> DocumentRetriever:
    return DocumentRetriever(vector_repository=vector_repository)


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
    chat_repository: ChatRepository = Depends(get_chat_repository)
) -> ChatService:
    return ChatService(retriever=retriever, prompt=prompt, llm=llm, chat_repository=chat_repository)

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