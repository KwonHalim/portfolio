#RecursiveCharacterTextSplitter를 사용하는 전략
from typing import List

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from service.chunk.chunk_strategy.chunk_strategy import ChunkStrategy


class RecursiveCharacterSplitter(ChunkStrategy):
    """
    계층적 구분자를 사용하여 텍스트를 재귀적으로 분할하는 청킹 전략입니다.

    LangChain의 `RecursiveCharacterTextSplitter`를 사용합니다. 이 전략은
    큰 의미 단위(예: '\n\n')로 먼저 분할을 시도하고, 청크가 너무 길 경우
    점점 더 작은 단위(예: '\n', ' ')로 재귀적으로 분할을 진행합니다.
    """

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        """
        RecursiveCharacterSplitter 전략을 초기화합니다.

        Args:
            chunk_size (int): 각 청크의 최대 크기 (글자 수 기준).
            chunk_overlap (int): 연속된 청크 사이에 겹칠 글자 수.
        """

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
    def split_documents(self, documents: List[Document]) -> List[Document]:
        """
        주어진 문서 리스트를 `RecursiveCharacterTextSplitter`를 사용하여 분할합니다.

        Args:
            documents (List[Document]): 분할할 Langchain Document 객체의 리스트.

        Returns:
            List[Document]: 분할된 청크(Document 객체)의 리스트.
        """
        print("--- Recursive Character 분할 실행 ---")
        return self.splitter.split_documents(documents)