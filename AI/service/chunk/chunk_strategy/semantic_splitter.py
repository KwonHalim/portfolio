from typing import List

from langchain_core.documents import Document

from service.chunk.chunk_strategy.chunk_strategy import ChunkStrategy


class SemanticSplitter(ChunkStrategy):
    """의미 기반 분할 전략 클래스입니다. (향후 구현 예정)"""
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        의미를 기반으로 청킹하는 전략입니다.
        Args:
            model_name (str): HuggingFace의 의미기반 청킹 모델 이름입니다.
        """
        self._model_name = model_name
        print(f"✅ SemanticSplitter 초기화 완료 (사용 모델: {self._model_name})")

    def split_documents(self, documents: List[Document]) -> List[Document]:
        """
        문서를 분할하는 함수입니다. 추후 사용시 추가로 수정할 예정입니다.

        Args:
            documents (List[Document]):

        Returns:
            List[Document]: 청킹된 데이터 리스트를 반환합니다.
        """
        print("--- Semantic(의미 기반) 분할 실행 ---")
        all_chunks = []
        for doc in documents:
            chunks = doc.page_content.split('\n\n') # 문단으로 분리
            for chunk_content in chunks:
                if chunk_content.strip():
                    all_chunks.append(Document(page_content=chunk_content, metadata=doc.metadata))
        return all_chunks