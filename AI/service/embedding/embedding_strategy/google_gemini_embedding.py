import time
from typing import List

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

    def embed_documents(self, texts: List[str]) -> List[List[float]]: #문서 임베딩
        print(f"--- Google Gemini로 {len(texts)}개 문서 임베딩 중 ---")
        batch_size = 15
        all_embeddings = []
        print(f"배치사이즈: {batch_size}로 진행합니다.")
        for i in range(0, len(texts), batch_size):

            batch_texts = texts[i:i + batch_size]
            print(f"--- 임베딩 처리 중: {i + 1} ~ {i + len(batch_texts)} / {len(texts)} ---")

            batch_embeddings = self._engine.embed_documents(batch_texts)
            all_embeddings.extend(batch_embeddings)

            if i + batch_size < len(texts):
                time.sleep(10)  # 1초 대기 (네트워크 상황에 따라 조절 가능)


        return all_embeddings



    def embed_query(self, text: str) -> List[float]: #하나의 질문 임베딩
        print(f"--- Google Gemini로 쿼리 임베딩 중: '{text}' ---")
        return self._engine.embed_query(text)