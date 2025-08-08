# Langchain 메모리 관련 클래스들을 임포트합니다.
from typing import Dict

from langchain_core.language_models import BaseLanguageModel
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

# 기존에 정의한 Repository와 Retriever를 사용합니다.
from AI.database.chat.repository import ChatRepository
from AI.service.langchain.document_retriever import DocumentRetriever


class ChatService:
    """
    Langchain 메모리를 사용하여 대화 기록을 관리하고,
    결과를 Repository에 저장하는 서비스입니다.
    """

    def __init__(
        self,
        retriever: DocumentRetriever,
        prompt: ChatPromptTemplate,
        llm: BaseLanguageModel,
        chat_repository: ChatRepository,
    ):
        self.retriever = retriever
        self.prompt = prompt
        self.llm = llm
        self.repository = chat_repository
        print("✅ ChatService 초기화 (Langchain 메모리 사용)")

    def ask(self, question: str, session_id: str) -> Dict[str, str]:
        """
        대화 기록을 바탕으로 RAG 체인을 실행하고, 결과를 저장한 후 답변을 반환합니다.
        """
        if len(question) > 200:
            return {"answer": "질문이 너무 깁니다. 200자 이하로 줄여주세요.", "message_id": None}

        print(f"\n--- 🗣️ 질문: {question} (Chat Session: {session_id}) ---")

        retriever_output = self.retriever.invoke(question)
        context = retriever_output["context"]
        source_docs = retriever_output["source_docs"]
        source_ids = [doc.metadata.get("source_id") for doc in source_docs if "source_id" in doc.metadata]
        print(f"--- 📚 참고 소스 ID: {source_ids} ---")
        chain = self.prompt | self.llm | StrOutputParser()

        answer = chain.invoke({
            "context": context,
            # "chat_history": recent_history,
            "question": question
        })

        metadata = {
            "retrieved_source_ids": source_ids,
            "retrieved_documents": [doc.to_json() for doc in source_docs],
        }

        chat_id = self.repository.save_chat(answer, question, session_id, metadata)

        return {"llm_answer" : answer,"chat_id": chat_id}

    def feedback(self, chat_id: str, is_good: bool):
        """
        채팅 메시지에 대한 피드백을 저장합니다.
        :param chat_repository: 채팅 레포지토리 인스턴스
        :param chat_id: 피드백을 남길 채팅 메시지 ID
        :param is_good: 피드백이 긍정적인지 여부 (True/False)
        """
        print(f"--- 피드백 저장 시작 (채팅 ID: {chat_id}, 긍정적: {is_good}) ---")
        return self.repository.update_feedback(chat_id, is_good)