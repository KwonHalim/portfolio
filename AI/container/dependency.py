from fastapi import Depends
from langchain_community.llms.huggingface_endpoint import HuggingFaceEndpoint
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from AI.config import settings
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
# - 가장 기본적인 동작 방식을 정의하는 '부품'들을 생성합니다.
# ----------------------------------------------------------------

# 청킹 방법 선택
async def get_chunk_strategy() -> ChunkStrategy:
    return RecursiveCharacterSplitter(chunk_size=500, chunk_overlap=100)
    # return SemanticSplitter(model_name="all-MiniLM-L6-v2")

# 임베딩 모델 선택
async def get_embedding_strategy() -> EmbeddingStrategy:
    return GoogleGeminiEmbedding(model_name="gemini-embedding-001",
                                 api_key=settings.GENAI_API_KEY)

# 채팅 LLM 모델 선택
async def get_llm() -> BaseLanguageModel:
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


# ----------------------------------------------------------------
# 2. 데이터 접근 계층 (Repository) 생성
# - 데이터베이스와의 통신을 책임지는 객체들을 생성합니다.
# ----------------------------------------------------------------

# DB 선택
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

# 벡터 레포지토리 생성
async def get_vector_repository() -> VectorRepository:
    return VectorRepository(vector_store_strategy=await get_vector_store_strategy())


# ----------------------------------------------------------------
# 3. 핵심 서비스 (Core Services) 생성
# - 주입받은 전략을 사용하여 실제 비즈니스 로직을 수행하는 서비스들을 생성합니다.
# ----------------------------------------------------------------

# txt(문단 데이터), Q&A.csv,xslx(질의응답) 데이터를 처리하는 데이터 프로세서
async def get_data_processor() -> DataProcessor:
    return DataProcessor()

# 청크 서비스 생성
async def get_chunk_service() -> ChunkService:
    return ChunkService(chunk_strategy=await get_chunk_strategy())

# 임베딩 서비스 생성
async def get_embedding_service() -> EmbeddingService:
    return EmbeddingService(embedding_model=await get_embedding_strategy())


# ----------------------------------------------------------------
# 4. LangChain RAG 구성 요소 생성
# - RAG 체인을 만드는 데 필요한 LangChain 관련 부품들을 생성합니다.
# ----------------------------------------------------------------

# 참고할 문서 검색기 생성
def get_document_retriever(
    vector_repository: VectorRepository = Depends(get_vector_repository)
) -> DocumentRetriever:
    return DocumentRetriever(vector_repository=vector_repository)

# 사용할 프롬프트 입력
def get_prompt() -> ChatPromptTemplate:
    return create_prompt()


# ----------------------------------------------------------------
# 5. 최종 서비스 조립 (Final Services)
# - 모든 하위 서비스와 구성 요소를 조립하여 최종적으로 사용할 서비스를 생성합니다.
# ----------------------------------------------------------------

# 최종 질의응답 서비스
async def get_chat_service(
        retriever: DocumentRetriever = Depends(get_document_retriever),
        prompt: ChatPromptTemplate = Depends(create_prompt),
        llm: BaseLanguageModel = Depends(get_llm)
) -> ChatService:
    return ChatService(retriever=retriever, prompt=prompt, llm=llm)

# 최종 문서 처리 서비스
async def get_rag_service() -> RAGService:
    return RAGService(chunk_service=await get_chunk_service(),
                      embedding_service=await get_embedding_service(),
                      data_processor=await get_data_processor(),
                      vector_repository=await get_vector_repository(),
                      )
