from abc import ABC

from langchain_core.embeddings import Embeddings


class EmbeddingStrategy(Embeddings, ABC):
    """모든 임베딩 전략이 따라야 하는 규칙(인터페이스)입니다."""
    # embed_documents와 embed_query 메서드는 Embeddings 부모 클래스에 이미 @abstractmethod로 정의되어 있음

    # @abstractmethod
    # def embed_documents(self, texts: list[str]) -> list[list[float]]:
    #     """Embed search docs.
    #
    #     Args:
    #         texts: List of text to embed.
    #
    #     Returns:
    #         List of embeddings.
    #     """
    #
    # @abstractmethod
    # def embed_query(self, text: str) -> list[float]:
    #     """Embed query text.
    #
    #     Args:
    #         text: Text to embed.
    #
    #     Returns:
    #         Embedding.
    #     """