#RecursiveCharacterTextSplitter를 사용하는 전략
from typing import List

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from service.chunk.chunk_strategy.chunk_strategy import ChunkStrategy


class RecursiveCharacterSplitter(ChunkStrategy):
    """문자 기반 분할 전략 클래스입니다."""
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
    def split_documents(self, documents: List[Document]) -> List[Document]:
        print("--- Recursive Character 분할 실행 ---")
        return self._splitter.split_documents(documents)