from typing import List

from langchain_core.documents import Document

from service.chunk.chunk_strategy.chunk_strategy import ChunkStrategy


class ChunkService:
    """특정 청킹 전략(ChunkStrategy)을 사용하여 문서를 분할하는 서비스 클래스."""

    def __init__(self, chunk_strategy: ChunkStrategy):
        """
        ChunkService를 초기화합니다.

        Args:
            chunk_strategy (ChunkStrategy): 문서 분할에 사용할 청킹 전략 객체.
        """
        self.chunk_strategy = chunk_strategy

    def split_documents(self, documents: List[Document]) -> List[Document]:
        """
        초기화 시 주입된 청킹 전략을 사용하여 문서 리스트를 분할합니다.

        실제 분할 로직은 `chunk_strategy` 객체에 위임됩니다.

        Args:
            documents (List[Document]): 분할할 Langchain Document 객체의 리스트.

        Returns:
            List[Document]: 분할된 청크(Document 객체)의 리스트.
        """
        print("--- 문서 처리 및 청킹 시작 ---")
        chunks = self.chunk_strategy.split_documents(documents)
        return chunks
