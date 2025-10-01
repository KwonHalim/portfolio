from typing import List

from fastapi.logger import logger

from service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy


class EmbeddingService:
    """특정 임베딩 전략(EmbeddingStrategy)을 사용하여 텍스트를 임베딩하는 서비스 클래스."""

    def __init__(self, embedding_model: EmbeddingStrategy):
        """
        EmbeddingService를 초기화합니다.

        Args:
            embedding_model (EmbeddingStrategy): 텍스트 임베딩에 사용할 임베딩 전략 객체.
                                                 (예: GoogleGeminiEmbedding)
        """
        self.embedding_model = embedding_model
        logger.info(f"✅ EmbeddingService 초기화 완료 (모델: {embedding_model.__class__.__name__})")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        초기화 시 주입된 임베딩 전략을 사용하여 텍스트 목록을 임베딩합니다.

        실제 임베딩 로직은 `embedding_model` 객체에 위임됩니다.

        Args:
            texts (List[str]): 임베딩을 수행할 텍스트(문서)의 리스트.

        Returns:
            List[List[float]]: 각 텍스트에 대한 임베딩 벡터의 리스트.
        """
        return self.embedding_model.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        """
        초기화 시 주입된 임베딩 전략을 사용하여 단일 텍스트를 임베딩합니다.

        Args:
            text (str): 임베딩을 수행할 단일 텍스트(주로 사용자 질문).

        Returns:
            List[float]: 입력된 텍스트에 대한 임베딩 벡터.
        """
        return self.embedding_model.embed_query(text)