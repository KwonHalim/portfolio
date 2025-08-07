from typing import Optional, List, Dict, Any

from langchain_core.runnables import Runnable, RunnableConfig

from AI.database.vector.repository import VectorRepository


class DocumentRetriever(Runnable):
    """
    VectorRepository를 사용하여 문서를 검색하고,
    LLM이 사용하기 좋은 형태의 단일 문자열로 포맷하는 검색기입니다.
    """
    def __init__(self, vector_repository: VectorRepository):
        self.vector_repository = vector_repository

    def invoke(self, input: str, config: Optional[RunnableConfig] = None) -> Dict[str, Any]:
        # 1. 질문으로 문서 검색
        results_with_scores = self.vector_repository.query(input)

        # 2. 검색 결과에서 Document 객체 리스트를 추출합니다.
        source_docs = [doc_object for doc_object, score in results_with_scores]

        # 3. LLM에 전달할 컨텍스트 문자열을 생성합니다.
        docs_content = []
        for doc in source_docs:
            content = doc.metadata.get("retrieved_content", doc.page_content)
            docs_content.append(content)
        context_str = "\n\n".join(docs_content)

        # 4. 컨텍스트 문자열과 원본 Document 리스트를 딕셔너리 형태로 함께 반환합니다.
        #    이것이 ChatService에서 참고 문서를 추적하는 데 사용됩니다.
        print(f"context_str: {context_str[:100]}... (총 {len(context_str)}자)")
        print(f"원본 문서: {source_docs}")
        return {"context": context_str, "source_docs": source_docs}
