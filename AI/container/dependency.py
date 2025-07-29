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

async def get_data_processor() -> 'DataProcessor':
    return DataProcessor()

# --- 중간 제품(하위 서비스) 생성 ---
async def get_chunk_service() -> ChunkService:
    return ChunkService(chunk_strategy=await get_chunk_strategy())

async def get_embedding_service() -> EmbeddingService:
    return EmbeddingService(embedding_model=await get_embedding_strategy())


async def get_rag_service() -> RAGService:
    return RAGService(
        chunk_service=await get_chunk_service(),
        embedding_service=await get_embedding_service(),
        data_processor=await get_data_processor()  # DataProcessor는 RAGService 내부에서 초기화됨
    )