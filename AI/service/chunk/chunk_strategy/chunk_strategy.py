from abc import abstractmethod, ABC
from typing import List

from langchain_core.documents import Document


# ABC: Abstract Base Class, 추상메서드클래스로 반드시 따라해야하는 규칙
# 해당 클래스는 청킹 전략을 정의하는 추상 클래스입니다. 인터페이스의 역할
class ChunkStrategy(ABC):
    @abstractmethod
    def split_documents(self, documents: List[Document]) -> List[Document]: #Document는 Langchain에서 제공하는 문서 클래스
        """문서 목록을 받아서 청크 목록으로 분할합니다."""
        pass