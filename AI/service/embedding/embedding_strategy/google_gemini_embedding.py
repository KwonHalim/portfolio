import time
from typing import List

from fastapi.logger import logger
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy


class GoogleGeminiEmbedding(EmbeddingStrategy):
    """
    Google의 Gemini 모델을 사용하여 텍스트 임베딩을 수행하는 전략 클래스.
    """
    def __init__(self, model_name: str, api_key: str = None):
        """
        GoogleGeminiEmbedding 전략을 초기화합니다.

        Args:
            model_name (str): 사용할 Gemini 임베딩 모델의 이름.
                              (예: "models/embedding-001")

            api_key (str, optional): Google API 키. 외부에서 주입받습니다.
        """
        
        # ._engine: 이 클래스 내부에서만 사용할 LangChain 임베딩 클라이언트 객체
        self._engine = GoogleGenerativeAIEmbeddings(
            model=model_name,
            google_api_key=api_key,
        )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        주어진 텍스트 목록(문서들)을 임베딩 벡터 리스트로 변환합니다.

        Google API의 분당 요청 제한(QPM)을 고려하여 일정 크기(batch_size)로 나누어 요청하고 중간에 지연 시간(sleep)을 줍니다.

        Args:
            texts (List[str]): 임베딩을 수행할 텍스트(문서)의 리스트.

        Returns:
            List[List[float]]: 각 텍스트에 대한 임베딩 벡터의 리스트.
        """

        logger.info(f"--- Google Gemini로 {len(texts)}개 문서 임베딩 중 ---")
        batch_size = 15
        all_embeddings = []
        logger.info(f"배치사이즈: {batch_size}로 진행합니다.")
        for i in range(0, len(texts), batch_size):

            batch_texts = texts[i:i + batch_size]
            logger.info(f"--- 임베딩 처리 중: {i + 1} ~ {i + len(batch_texts)} / {len(texts)} ---")

            batch_embeddings = self._engine.embed_documents(batch_texts)
            all_embeddings.extend(batch_embeddings)

            if i + batch_size < len(texts):
                time.sleep(5)


        return all_embeddings



    def embed_query(self, text: str) -> List[float]: #하나의 질문 임베딩
        """
        단일 문장을 임베딩 벡터로 변환합니다.

        Args:
            text (str): 임베딩을 수행할 단일 문장(사용자의 질문)

        Returns:
            List[float]: 입력된 텍스트에 대한 임베딩 벡터.
        """
        logger.info(f"--- Google Gemini로 쿼리 임베딩 중: '{text}' ---")
        return self._engine.embed_query(text)