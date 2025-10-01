from datetime import timezone, datetime
from typing import Optional, Dict, Any, List

from bson import ObjectId
from fastapi.logger import logger
from pymongo import MongoClient, ASCENDING

from database.chat.chat_strategy.chat_store_strategy import ChatStrategy


class MongoChatStrategy(ChatStrategy):
    """
    ChatStrategy 인터페이스의 MongoDB 구현체입니다.
    사용자 세션과 채팅 기록을 MongoDB에 저장하고 관리합니다.
    """

    def __init__(self, mongo_uri: str):
        """
        MongoChatStoreStrategy를 초기화합니다.

        Args:
            mongo_uri (str): MongoDB 연결 URI.        """
        self.client = MongoClient(mongo_uri)
        # URI에 명시된 default database 자동 추출
        self.db = self.client.get_default_database()
        self.messages_collection = self.db["chats"]
        logger.info(f"✅ MongoDB Chat Store 초기화 완료 (DB: {self.db.name})")

    def get_or_create_session(self, user_identifier: str) -> str:
        """
        사용자 식별자를 기반으로 세션을 찾거나 새로 생성하고 세션 ID를 반환합니다.
        """
        session = self.sessions_collection.find_one({"user_identifier": user_identifier})

        if session:
            return str(session["_id"])
        else:
            from datetime import datetime
            new_session = {
                "user_identifier": user_identifier,
                "start_time": datetime.now(timezone.utc)
            }
            result = self.sessions_collection.insert_one(new_session)
            return str(result.inserted_id)

    def save_chats(
            self,
            session_id: str,
            human_message: str,
            ai_message: str,
            metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        한 번의 사용자-AI 상호작용을 MongoDB에 저장합니다.
        """
        if metadata is None:
            metadata = {}

        message_doc = {
            "session_id": session_id,
            "interaction": {
                "human": human_message,
                "ai": ai_message,
            },
            "metadata": metadata,  # 예: {'retrieved_source_ids': [...]}
            "timestamp": datetime.now(timezone.utc)
        }
        result = self.messages_collection.insert_one(message_doc)
        return str(result.inserted_id)

    def get_history(self, session_id: str) -> List[Dict[str, Any]]:
        """
        특정 세션의 전체 대화 기록을 시간순으로 정렬하여 가져옵니다.
        """
        from bson import ObjectId
        messages = self.messages_collection.find(
            {"session_id": ObjectId(session_id)}
        ).sort("timestamp", ASCENDING)
        # ObjectId를 문자열로 변환하여 반환 (JSON 직렬화 용이)
        history = []
        for msg in messages:
            msg["_id"] = str(msg["_id"])
            msg["session_id"] = str(msg["session_id"])
            history.append(msg)
        return history

    # 이 메서드는 ChatRepository 클래스 안에 있다고 가정합니다.
    def update_feedback(self, chat_id: str, is_good: bool) -> dict:
        """
        채팅 메시지에 대한 피드백을 업데이트하고, 업데이트된 문서 전체를 반환합니다.
        :param chat_id: 채팅 메시지 ID
        :param is_good: 피드백 (좋은 답변이면 True, 그렇지 않으면 False)
        :return: 업데이트된 채팅 문서(dict) 또는 문서가 없을 경우 None
        """
        feedback = "good" if is_good else "bad"

        updated_document = self.messages_collection.find_one_and_update(
            {"_id": ObjectId(chat_id)},
            {"$set": {"feedback": feedback}},
            )

        return updated_document

    def find_chat_history(self, chat_id:str):
        """
        특정 채팅 문서를 한개 가져옵니다.
        :param chat_id:
        :type chat_id:
        :return:
        :rtype:
        """
        return self.messages_collection.find_one({"_id": ObjectId(chat_id)})
