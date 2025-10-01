from typing import Dict

from fastapi.logger import logger
from langchain_core.language_models import BaseLanguageModel
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from database.chat.repository import ChatRepository
from database.vector.repository import VectorRepository
from service.cache.cache_strategy import CacheStrategy
from service.langchain.document_retriever import DocumentRetriever


class ChatService:
    """
    RAG 파이프라인을 총괄하는 핵심 서비스 클래스입니다.

    사용자 질문에 대해 문서를 검색하고, LLM 답변을 생성하며,
    대화 기록과 피드백을 데이터베이스에 관리하는 역할을 수행합니다.
    """

    def __init__(
            self,
            retriever: DocumentRetriever,
            prompt: ChatPromptTemplate,
            llm: BaseLanguageModel,
            chat_repository: ChatRepository,
            vector_repository: VectorRepository,
            cache_strategy: CacheStrategy
    ):
        """
        ChatService를 초기화합니다.

        Args:
            retriever (DocumentRetriever): 하이브리드 검색(벡터+키워드)을 수행하는 'Runnable' 검색기.
            prompt (ChatPromptTemplate): LLM에 전달될 최종 프롬프트를 구성하는 템플릿.
            llm (BaseLanguageModel): 답변 생성을 위한 LangChain 언어 모델 객체.
            chat_repository (ChatRepository): 대화 기록을 데이터베이스에 저장하고 조회하는 레포지토리.
            vector_repository (VectorRepository): 피드백을 기반으로 참조 문서의 점수(좋/싫)를 업데이트하는 레포지토리.
            cache_strategy (CacheStrategy): 질문과 유사한 답변을 미리 저장해놓는 캐시
        """
        self.retriever = retriever
        self.prompt = prompt
        self.llm = llm
        self.chat_repository = chat_repository
        self.vector_repository = vector_repository
        self.cache_strategy = cache_strategy
        logger.info("✅ ChatService 초기화 완료")

    async def ask(self, question: str, session_id: str) -> Dict[str, str]:
        """
        사용자 질문에 대한 RAG 파이프라인을 실행하고 결과를 반환합니다.

        처리 흐름:
        0. 캐시된 답변이 있는지 확인하고 있다면 캐시에서 응답합니다.
        1. Retriever를 사용하여 질문과 관련된 컨텍스트 문서를 검색합니다.
        2. 검색된 컨텍스트와 질문을 프롬프트에 결합하여 LLM에 전달합니다.
        3. LLM으로부터 생성된 답변을 받습니다.
        4. 질문, 답변, 참조 문서 ID를 데이터베이스에 저장합니다.

        Args:
            question (str): 사용자의 질문.
            session_id (str): 현재 대화 세션을 식별하는 고유 ID.

        Returns:
            Dict[str, str]: 'llm_answer'와 'chat_id' 키를 포함하는 딕셔너리.
        """
        if len(question) > 200:
            return {"answer": "질문이 너무 깁니다. 200자 이하로 줄여주세요.", "message_id": None}

        logger.info(f"--- 🗣️ 질문: {question} (Chat Session: {session_id}) ---")

        #1. 캐시를 확인하여 유사 답변이 있는지 확인
        cached_result = await self.cache_strategy.get_cached_answer(question)
        if cached_result:
            metadata = {
                "cache_hit": True,
                "question": cached_result.get('question'),
                "score": cached_result.get('score'),
                "retrieved_source_ids": []
            }
            chat_id = self.chat_repository.save_chat(cached_result.get('answer'), question, session_id, metadata)

            return {"llm_answer": cached_result.get('answer'), "chat_id": chat_id}

        # 없다면 아래 실행
        # 2. 검색기를 호출하여 컨텍스트와 참조 문서를 가져옵니다.
        retriever_output = self.retriever.invoke(question)
        context = retriever_output["context"]
        source_docs = retriever_output["source_docs"]

        # 참조된 문서들의 소스 ID를 추출합니다.
        source_ids = [doc.metadata.get("source_id") for doc in source_docs if "source_id" in doc.metadata]

        # 3. 프롬프트, LLM, 출력 파서를 연결하여 RAG 체인을 구성합니다.
        chain = self.prompt | self.llm | StrOutputParser()

        # 4. 체인을 실행하여 AI의 답변을 생성합니다.
        answer = chain.invoke({
            "context": context,
            "question": question
        })

        # 5. 대화 내용을 DB에 저장하기 위한 메타데이터를 구성합니다.
        metadata = {
            "cache_hit": False,
            "retrieved_source_ids": source_ids
        }

        # 6-1 새로 생성된 질문-답변 쌍을 캐시에 저장합니다.
        await self.cache_strategy.add_to_cache(question, answer)

        # 6-2. 대화 내용을 저장하고, 생성된 chat_id를 받습니다.
        chat_id = self.chat_repository.save_chat(answer, question, session_id, metadata)

        return {"llm_answer": answer, "chat_id": chat_id}

    def feedback(self, chat_id: str, is_good: bool) -> bool:
        """
        특정 채팅 답변에 대한 사용자 피드백을 처리합니다.

        이 메서드는 두 가지 주요 작업을 수행합니다:
        1. 채팅 문서 자체의 좋아요/싫어요 상태를 업데이트합니다.
        2. 해당 답변의 근거가 된 참조 문서들의 점수(likes/dislikes)를 조정합니다.

        Args:
            chat_id (str): 피드백을 적용할 채팅의 고유 ID.
            is_good (bool): 피드백이 긍정적인지 여부 (True: 좋아요, False: 싫어요).

        Returns:
            bool: 피드백 처리 성공 여부.
        """
        # 1. MongoDB에서 해당 채팅의 피드백을 업데이트하고, 업데이트된 문서를 가져옵니다.
        updated_chat_document = self.chat_repository.update_feedback(chat_id, is_good)

        # 2. 답변의 근거가 되었던 문서들의 소스 ID를 가져옵니다.
        source_ids = updated_chat_document["metadata"]["retrieved_source_ids"]

        # 3. VectorDB(ChromaDB)에서 해당 소스 ID를 가진 문서들을 찾아 피드백 점수를 업데이트합니다.
        self.vector_repository.find_by_source_id(source_id=source_ids, is_good=is_good)

        return True