from typing import Optional, Dict, Any, List

from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document
from langchain_core.runnables import Runnable, RunnableConfig

from database.vector.repository import VectorRepository


class DocumentRetriever(Runnable):
    def __init__(self, vector_repository: VectorRepository, bm25_retriever: BM25Retriever):
        self.vector_repository = vector_repository
        self.bm25_retriever = bm25_retriever
        if self.bm25_retriever:
            self.bm25_retriever.k = 4

    def invoke(self, input: str, config: Optional[RunnableConfig] = None) -> Dict[str, Any]:
        # 1. 각 검색기로부터 결과 가져오기
        cosine_results = self.vector_repository.query(input, top_k=4)  # (Document, score) 튜플 리스트
        bm25_results: List[Document] = self.bm25_retriever.invoke(input)  # Document 객체 리스트

        # 코사인 결과에서 Document 객체만 추출
        cosine_docs = [doc for doc, score in cosine_results]

        # 2. RRF를 사용한 결과 퓨전(Fusion)
        fused_docs = self._reciprocal_rank_fusion([cosine_docs, bm25_results])

        # 3. LLM에 전달할 컨텍스트 문자열 생성
        docs_content = []
        for doc in fused_docs:
            # 만약 Q&A데이터이기에 retrieved_content가 있다면 대답 데이터를 가져오고 문답 데이터라 없으면 그대로 page_content를 사용
            content = doc.metadata.get("retrieved_content", doc.page_content)
            docs_content.append(content)
        context_str = "\n\n".join(docs_content)

        return {"context": context_str, "source_docs": fused_docs}


    @staticmethod
    def _reciprocal_rank_fusion(
            result_sets: List[List[Document]],
            k: int = 60,
            top_n: int = 3
    ) -> List[Document]:
        """Reciprocal Rank Fusion을 사용하여 여러 문서 리스트를 하나의 랭킹으로 결합합니다."""

        fused_scores = {}
        all_docs = {}

        for docs in result_sets:
            for rank, doc in enumerate(docs):
                content = doc.page_content
                if content not in all_docs:
                    all_docs[content] = doc

                if content not in fused_scores:
                    fused_scores[content] = 0
                fused_scores[content] += 1 / (k + rank + 1)

        sorted_content = sorted(fused_scores.keys(), key=lambda x: fused_scores[x], reverse=True)

        final_docs = [all_docs[content] for content in sorted_content[:top_n]]

        # --- 👇 변경된 부분: 순위와 점수를 함께 출력 ---
        # print("\n--- RRF 최종 순위 및 점수 ---")
        # for rank, doc in enumerate(final_docs, 1):  # 1부터 시작하는 순위
            # RRF 점수 가져오기
            # score = fused_scores[doc.page_content]

            # 출력할 내용 선택
            # display_content = doc.metadata.get("retrieved_content", doc.page_content)

            # 순위, 점수, 내용 출력
            # print(f"[순위 {rank}] (RRF 점수: {score:.4f})")
            # 내용이 너무 길 경우 일부만 표시
            # print(f"   └ 내용: {display_content[:150].strip()}...")
            # print("-" * 30)

        return final_docs