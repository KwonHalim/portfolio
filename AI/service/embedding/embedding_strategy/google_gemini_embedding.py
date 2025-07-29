from typing import List
import os

from langchain_google_genai import GoogleGenerativeAIEmbeddings

from AI.config import settings
from AI.service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy


class GoogleGeminiEmbedding(EmbeddingStrategy):
    def __init__(self, model_name: str):
        
        # 내부적으로 LangChain의 임베딩 클래스를 '엔진'으로 사용
        self._engine = GoogleGenerativeAIEmbeddings(
            model=model_name,
            google_api_key=settings.GENAI_API_KEY,  # 환경 변수에서 API 키 가져오기
        )
        print(f"✅ GoogleGeminiEmbeddingStrategy 초기화 완료 (모델: {model_name})")

    def embed_documents(self, texts: List[str]) -> List[List[float]]: #문서 임베딩
        print(f"--- Google Gemini로 {len(texts)}개 문서 임베딩 중 ---")
        return self._engine.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]: #하나의 질문 임베딩
        print(f"--- Google Gemini로 쿼리 임베딩 중: '{text}' ---")
        return self._engine.embed_query(text)