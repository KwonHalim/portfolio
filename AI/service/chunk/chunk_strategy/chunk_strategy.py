from abc import abstractmethod, ABC
from typing import List

from langchain_core.documents import Document


# ABC: Abstract Base Class, 추상메서드클래스로 반드시 따라해야하는 규칙
class ChunkStrategy(ABC):
    """
    청킹(chunking) 전략에 대한 추상 기본 클래스 (ABC).

    모든 구체적인 청킹 전략 클래스들이 상속해야 하는 인터페이스를 정의합니다.
    이 클래스를 상속하는 하위 클래스는 반드시 메서드를 구현해야 합니다.
    """

    @abstractmethod
    def split_documents(self, documents: List[Document]) -> List[Document]: #Document는 Langchain에서 제공하는 문서 클래스
        """주어진 문서 리스트를 특정 전략에 따라 청크 리스트로 분할합니다."""
        pass