from abc import ABC, abstractmethod
from typing import Optional, Dict


class CacheStrategy(ABC):
    """
    캐싱을 위한 기본 클래스 입니다.
    캐시를 사용하는 로직은 모두 이 클래스를 상속받아야 사용 가능합니다.
    """
    @abstractmethod
    async def get_cached_answer(self, quesion:str) -> Optional[Dict[str, str | float]]:
        """

        Args:
            quesion (str): 사용자의 질문

        Returns:
            - Cache Hit: {"answer": str, 'question': str}
            - Cache Miss: None
        """
    pass

    @abstractmethod
    async def add_to_cache(self, question: str, answer: str) -> None:
        """
        새로운 질문과 답변을 캐시에 추가합니다.

        Args:
            question (str): 사용자 질문
            answer (str): LLM이 생성한 답변
        """
        pass


