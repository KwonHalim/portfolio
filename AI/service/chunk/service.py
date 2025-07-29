from typing import List

from langchain_core.documents import Document

from AI.service.chunk.chunk_strategy.chunk_strategy import ChunkStrategy


class ChunkService:
    def __init__(self, chunk_strategy: ChunkStrategy):
        self.chunk_strategy = chunk_strategy

    def chunk_documents(self, documents: List[Document]) -> List[Document]:
        """
        문서를 분할합니다.
        """
        print("--- 문서 처리 및 청킹 시작 ---")
        chunks = self.chunk_strategy.split_documents(documents)
        return chunks
