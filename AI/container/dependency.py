from typing import Any, Coroutine

from AI.config import settings
from AI.database.vector.repository import VectorRepository
from AI.database.vector.vector_strategy.chroma_vector_store import ChromaVectorStore
from AI.database.vector.vector_strategy.pg_vector_store import PGVectorStore
from AI.database.vector.vector_strategy.vector_store_strategy import VectorStoreStrategy
from AI.service.chunk.chunk_strategy.chunk_strategy import ChunkStrategy
from AI.service.chunk.chunk_strategy.recursive_character_splitter import RecursiveCharacterSplitter
from AI.service.chunk.service import ChunkService
from AI.service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy
from AI.service.embedding.embedding_strategy.google_gemini_embedding import GoogleGeminiEmbedding
from AI.service.embedding.service import EmbeddingService
from AI.service.rag.data_processor import DataProcessor
from AI.service.rag_service import RAGService


# 청킹 방법 선택
async def get_chunk_strategy() -> ChunkStrategy:
    return RecursiveCharacterSplitter(chunk_size=500, chunk_overlap=100)
    # return SemanticSplitter(model_name="all-MiniLM-L6-v2")

# 임베딩 모델 선택
async def get_embedding_strategy() -> EmbeddingStrategy:
    return GoogleGeminiEmbedding(model_name="gemini-embedding-001")

# 데이터 변환 객체
async def get_data_processor() -> DataProcessor:
    return DataProcessor()

# 어떤 DB를 사용할지에 대한 설정
async def get_vector_store_strategy() -> VectorStoreStrategy:
    embedding_strategy = await get_embedding_strategy()

    if settings.VECTOR_DB_TYPE == "pgvector":
        return PGVectorStore(
            connection_string=settings.PGVECTOR_DB_URL,
            embedding_strategy=embedding_strategy
        )
    elif settings.VECTOR_DB_TYPE == "chroma":
        return ChromaVectorStore(
            host=settings.CHROMA_HOST,
            port=settings.CHROMA_PORT,
            embedding_strategy=embedding_strategy
        )
    else:
        raise ValueError(f"지원하지 않는 DB 타입입니다: {settings.VECTOR_DB_TYPE}")

async def get_chunk_service() -> ChunkService:
    return ChunkService(chunk_strategy=await get_chunk_strategy())

async def get_embedding_service() -> EmbeddingService:
    return EmbeddingService(embedding_model=await get_embedding_strategy())

async def get_vector_repository() -> VectorRepository:
    return VectorRepository(vector_store_strategy=await get_vector_store_strategy())


async def get_rag_service() -> RAGService:
    return RAGService(chunk_service=await get_chunk_service(),
                      embedding_service=await get_embedding_service(),
                      data_processor=await get_data_processor(),
                      vector_repository=await get_vector_repository(),
                      )