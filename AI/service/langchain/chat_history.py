from typing import List

from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

from AI.database.chat.repository import ChatRepository

# 의존성 주입 필요
class ChatHistory(BaseChatMessageHistory):
    """ChatRepository를 Langchain 메모리 시스템에 연결하는 어댑터 클래스입니다."""
    # 해당 함수의 의존성 주입은 Dependency Injection을 통해 이루어지지 않습니다. Service에서 직접 주입합니다.(실수로 서비스와 다른 Repository를 사용하지 않도록)
    def __init__(self, repository: ChatRepository, session_id: str):
        self.repository = repository
        self.session_id = session_id

    @property
    def messages(self) -> List[BaseMessage]:
        """DB에서 메시지를 가져와 Langchain 메시지 형식으로 변환합니다."""
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

    def add_messages(self, messages: List[BaseMessage]) -> None:
        """
        메모리에서 DB로 저장하는 기능입니다.
        하지만 Retriever 메타데이터와 함께 직접 저장할 것이므로, 이 메서드는 비워둡니다.
        """
        pass

    def clear(self) -> None:
        # 필요 시 DB 기록 삭제 로직을 구현할 수 있습니다.
        pass