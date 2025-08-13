from AI.database.chat.chat_strategy.chat_store_strategy import ChatStrategy


class ChatRepository:
    def __init__(self, chat_strategy: ChatStrategy):
        self.chat_repository = chat_strategy

    def save_chat(self, ai_message: str, human_message: str, session:str, metadata: dict):
        """
        채팅 메시지를 저장합니다.
        :param session: 채팅방 구분 아이디
        :param human_message: 사람의 질문 내용
        :param ai_message: AI의 답변 내용
        :param chat_message: 채팅 메시지 객체
        :return: 저장된 채팅 메시지 ID
        """
        # print("--- 채팅 메시지 저장 시작 (세션: {session}) ---")
        # print(f"  - 사람 질문: {human_message}")
        # print(f"  - AI 답변: {ai_message}")
        # print(f"  - 메타데이터: {metadata}")
        # print("--- 채팅 메시지 저장 완료 ---")

        return self.chat_repository.save_chats(session, human_message, ai_message, metadata)

    def get_history(self, session: str):
        """
        채팅 기록을 가져옵니다.
        :param session: 채팅방 구분 아이디
        :return: 채팅 메시지 리스트
        """
        return self.chat_repository.get_history(session)

    def update_feedback(self, chat_id: str, is_good: bool):
        """
        채팅 메시지에 대한 피드백을 업데이트합니다.
        :param chat_id: 채팅 메시지 ID
        :param is_good: 피드백 (좋은 답변이면 True, 그렇지 않으면 False)
        """
        print(f"--- 채팅 ID {chat_id}에 대한 피드백 업데이트 시작 ---")
        return self.chat_repository.update_feedback(chat_id, is_good)