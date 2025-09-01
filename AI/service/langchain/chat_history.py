from typing import List

from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

from database.chat.repository import ChatRepository


class ChatHistory(BaseChatMessageHistory):
    """
    ChatRepository를 LangChain 메모리 시스템에 연결하는 어댑터(Adapter) 클래스.

    이 클래스는 LangChain의 `BaseChatMessageHistory` 인터페이스를 구현하여,
    데이터베이스에 저장된 채팅 기록을 LangChain이 이해할 수 있는 형식으로 제공합니다.

    """

    def __init__(self, repository: ChatRepository, session_id: str):
        """
        ChatHistory 어댑터를 초기화합니다.

        참고: 이 클래스는 일반적으로 서비스 계층에서 직접 생성하여 레포지토리를 주입합니다. 이는 서비스가 사용하는 레포지토리와 메모리가 사용하는 레포지토리 간의
        불일치를 방지하기 위함입니다.

        Args:
            repository (ChatRepository): 데이터베이스와 상호작용하는 채팅 레포지토리 객체.
            session_id (str): 특정 대화 세션을 식별하기 위한 고유 ID.
        """
        self.repository = repository
        self.session_id = session_id

    @property
    def messages(self) -> List[BaseMessage]:
        """
        세션 ID에 해당하는 채팅 기록을 데이터베이스에서 조회하여 반환합니다.

        이 프로퍼티는 DB에 저장된 기록을 LangChain이 이해할 수 있는 `HumanMessage`와 `AIMessage` 객체 리스트로 변환하는 역할을 합니다.

        참고: 현재는 해당 세션의 전체 기록을 가져오지만, 추후 성능 최적화를 위해 최근 N개의 대화만 가져오도록 변경될 수 있습니다.

        Returns:
            List[BaseMessage]: 데이터베이스 기록을 변환한 LangChain 메시지 객체의 리스트.
        """
        
        db_messages = self.repository.get_history(self.session_id)
        langchain_messages = []
        for msg in db_messages:
            human = msg.get("interaction", {}).get("human")
            ai = msg.get("interaction", {}).get("ai")
            if human:
                langchain_messages.append(HumanMessage(content=human))
            if ai:
                langchain_messages.append(AIMessage(content=ai))
        return langchain_messages


    def clear(self) -> None:
        """
        채팅 기록을 모두 삭제합니다 (현재 미구현).

        """
        # self.repository.delete_history(self.session_id)
        pass