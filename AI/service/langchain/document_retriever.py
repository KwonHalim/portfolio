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

    def invoke(self, input: str, config: Optional[RunnableConfig] = None) -> str:
        # 1. 질문으로 문서 검색
        # self.vector_repository.query()는 (Document, score) 튜플의 리스트를 반환합니다.
        results_with_scores = self.vector_repository.query(input)

        # 2. 검색된 문서들을 하나의 문자열로 합침
        docs_content = []
        # 각 튜플을 doc_object와 score로 분리하여 처리합니다.
        for doc_object, score in results_with_scores:
            # Q&A 데이터는 metadata에 답변이 있으므로 그것을 우선 사용합니다.
            content = doc_object.metadata.get("retrieved_content", doc_object.page_content)
            docs_content.append(content)

        return "\n\n".join(docs_content)

