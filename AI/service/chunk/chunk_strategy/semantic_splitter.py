from typing import List

from langchain_core.documents import Document

from AI.service.chunk.chunk_strategy.chunk_strategy import ChunkStrategy


class SemanticSplitter(ChunkStrategy):
    """의미 기반 분할 전략 클래스입니다. (향후 구현 예정)"""
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self._model_name = model_name
        print(f"✅ SemanticSplitter 초기화 완료 (사용 모델: {self._model_name})")

    def split_documents(self, documents: List[Document]) -> List[Document]:
        print("--- Semantic(의미 기반) 분할 실행 ---")
        # 여기에 실제 의미 기반 청킹 로직이 들어갑니다.
        # 예시: 문단을 기준으로 나누는 간단한 로직
        all_chunks = []
        for doc in documents:
            chunks = doc.page_content.split('\n\n') # 문단으로 분리
            for chunk_content in chunks:
                if chunk_content.strip():
                    all_chunks.append(Document(page_content=chunk_content, metadata=doc.metadata))
        return all_chunks