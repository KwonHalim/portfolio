from abc import ABC, abstractmethod
from typing import List, Dict, Any
from langchain_core.documents import Document

class VectorStoreStrategy(ABC):
    @abstractmethod
    def add_documents(self, chunks: List[Document]):
        """문서(청크)를 저장소에 추가합니다."""
        pass

    @abstractmethod
    def query(self, query_text: str, k: int = 3) -> List[Dict[str, Any]]:
        """쿼리로 유사 문서를 검색합니다."""
        pass