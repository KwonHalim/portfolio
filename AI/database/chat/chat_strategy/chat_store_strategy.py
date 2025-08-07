from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class ChatStrategy(ABC):
    """
    채팅 기록을 저장하고 관리하는 전략에 대한 인터페이스입니다.
    이 인터페이스를 구현하는 클래스는 특정 데이터베이스(예: MongoDB)에
    채팅 내역을 저장하는 구체적인 로직을 담당합니다.
    """

    @abstractmethod
    def get_or_create_session(self, user_identifier: str) -> str:
        """
        사용자 식별자(예: 해시된 IP 주소)를 기반으로 세션을 찾거나 생성하고,
        고유한 세션 ID를 문자열로 반환합니다.

        Args:
            user_identifier (str): 사용자를 고유하게 식별하는 값.

        Returns:
            str: 해당 사용자의 세션 ID.
        """
        pass

    @abstractmethod
    def save_chats(
        self,
        session_id: str,
        human_message: str,
        ai_message: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        한 번의 사용자-AI 상호작용(질문과 답변)을 저장하고,
        생성된 메시지의 고유 ID를 문자열로 반환합니다.

        Args:
            session_id (str): 현재 대화가 속한 세션의 ID.
            human_message (str): 사용자의 메시지 (질문).
            ai_message (str): AI의 응답.
            metadata (Optional[Dict[str, Any]]): 함께 저장할 추가 정보.
                                                 (예: {'retrieved_source_ids': [...]})

        Returns:
            str: 저장된 메시지의 고유 ID.
        """
        pass

    @abstractmethod
    def get_history(self, session_id: str) -> List[Dict[str, Any]]:
        """
        특정 세션의 전체 대화 기록을 시간순으로 가져옵니다.
        채팅 UI에 이전 대화 내용을 표시할 때 사용할 수 있습니다.

        Args:
            session_id (str): 조회할 세션의 ID.

        Returns:
            List[Dict[str, Any]]: 해당 세션의 메시지 목록.
        """
        pass
