from langchain_core.language_models import BaseLanguageModel
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

from AI.service.langchain.document_retriever import DocumentRetriever


class ChatService:
    """
    Retriever, Prompt, LLM을 결합하여 RAG 체인을 구성하고,
    질문에 대한 답변 생성을 책임지는 서비스입니다.
    """
    def __init__(
        self,
        retriever: DocumentRetriever,
        prompt: ChatPromptTemplate,
        llm: BaseLanguageModel,
    ):
        self.rag_chain = (
            {"context": retriever, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        print("✅ QAService 초기화 및 RAG 체인 조립 완료")

    def ask(self, question: str) -> str:
        """
        미리 조립된 RAG 체인을 실행하여 질문에 대한 답변을 생성합니다.
        """
        print(f"\n--- 🗣️ 질문: {question} ---")
        return self.rag_chain.invoke(question)