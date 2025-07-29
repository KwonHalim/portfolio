from typing import List

from langchain_core.documents import Document

from AI.service.chunk.chunk_strategy.chunk_strategy import ChunkStrategy


class ChunkService:
    def __init__(self, chunk_strategy: ChunkStrategy):
        self.chunk_strategy = chunk_strategy

    def split_documents(self, documents: List[Document]) -> List[Document]:
        """
        문서를 분할합니다.
        """
        print("--- 문서 처리 및 청킹 시작 ---")
        # 이후 주입된 모델의 청킹 시작.
        # 만약 공통적인 청킹 추가 로직이 필요하다면 여기 작성
        chunks = self.chunk_strategy.split_documents(documents)
        return chunks
