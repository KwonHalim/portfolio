from typing import Optional, Dict, Any, List

from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document
from langchain_core.runnables import Runnable, RunnableConfig

from database.vector.repository import VectorRepository


class DocumentRetriever(Runnable):
    """
    벡터 검색과 BM25 키워드 검색을 결합하여 문서를 찾는 클래스 객체

    LangChain Expression Language (LCEL)의 `Runnable` 인터페이스를 구현하여, 다른 LangChain 구성 요소와 파이프라인(`|`)으로 원활하게 연결될 수 있습니다.
    두 검색 결과는 Reciprocal Rank Fusion (RRF) 알고리즘을 통해 순위를 다시 결정하여 관련이 제일 높은 문서만을 반환합니다.
    """

    def __init__(self, vector_repository: VectorRepository, bm25_retriever: BM25Retriever):
        """
        DocumentRetriever를 초기화합니다.

        Args:
            vector_repository (VectorRepository): 벡터 유사도 검색을 수행하는 레포지토리 객체.
            bm25_retriever (BM25Retriever): BM25 알고리즘을 사용하는 키워드 리트리버 객체. (BM_25로 가져오는 문서의 개수는 4개입니다.) -> bm25_retriever.k
        """
        self.vector_repository = vector_repository
        self.bm25_retriever = bm25_retriever
        if self.bm25_retriever:
            self.bm25_retriever.k = 4  # BM25로 검색하여 가져올 문서의 개수를 결정하는 변수

    def invoke(self, input: str, config: Optional[RunnableConfig] = None) -> Dict[str, Any]:
        """
        주어진 사용자 입력(쿼리)에 대해 하이브리드 검색을 수행합니다.

        이 메서드의 이름이 'invoke'인 이유는 LCEL의 `Runnable` 인터페이스에 정의된 표준 실행 메서드이기 때문입니다. 이를 통해 다른 LCEL 구성 요소와
        일관된 방식으로 상호작용할 수 있습니다.

        Args:
            input (str): 사용자 질문
            config (Optional[RunnableConfig]): LangChain 실행 시 사용될 수 있는 설정 객체 (현재 미사용).

        Returns:
            Dict[str, Any]: "context"와 "source_docs" 키를 포함하는 딕셔너리.
                            - context (str): RRF로 결합된 문서 내용을 바탕으로 생성된,
                                             LLM에 전달될 최종 컨텍스트 문자열.
                            - source_docs (List[Document]): RRF로 재순위화된 상위 Document 객체 리스트.
        """
        # 1. 각 검색기로부터 결과 가져오기
        cosine_results = self.vector_repository.query(input, top_k=4)
        bm25_results: List[Document] = self.bm25_retriever.invoke(input)

        cosine_docs = [doc for doc, score in cosine_results]

        # 2. RRF를 사용한 결과 퓨전(Fusion)
        fused_docs = self._reciprocal_rank_fusion(result_sets=[cosine_docs, bm25_results])

        # 3. LLM에 전달할 컨텍스트 문자열 생성
        docs_content = []
        for doc in fused_docs:
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
        """
        Reciprocal Rank Fusion (RRF) 알고리즘을 사용하여 여러 검색 결과를 결합합니다.

        이 메서드는 여러 검색 엔진(여기서는 벡터 검색, BM25)의 순위 목록을 하나의 통합된 순위로 만들어 가장 관련성 높은 문서를 상위에 올립니다.

        알고리즘의 핵심은 각 문서의 순위(rank)에 상수 k를 더한 값의 역수 (`1 / (k + rank + 1)`)를 점수로 부여하고, 여러 검색 결과에 걸쳐
        이 점수를 합산하는 것입니다. 상수 k는 상위 랭크(1위, 2위 등) 간의 점수 차이가 과도하게 벌어지는 것을 완화하여, 여러 검색 결과에서 꾸준히 상위에
        나타나는 문서들이 더 높은 최종 점수를 얻을 수 있도록 경쟁을 공정하게 만들어주는 역할을 합니다.

        Args:
            result_sets (List[List[Document]]): 각기 다른 검색기의 결과 Document 리스트들.
            k (int): 순위에 대한 가중치를 조절하는 상수. 일반적으로 60이 사용됩니다.
            top_n (int): 최종적으로 반환할 상위 문서의 개수.

        Returns:
            List[Document]: RRF 점수에 따라 재순위화된 상위 N개의 Document 리스트.
        """
        # ---------------------------------------------------------------------
        # fused_scores: 각 문서 content(내용)를 key로 하고, 누적된 RRF 점수를 저장하는 딕셔너리
        # all_docs: 각 문서 content → 실제 Document 객체를 저장하는 딕셔너리
        #   → 두 개를 분리한 이유:
        #       - fused_scores는 점수 계산용 (float 값만 저장)
        #       - all_docs는 content로부터 실제 Document를 찾기 위함
        # ---------------------------------------------------------------------
        fused_scores: Dict[str, float] = {}
        all_docs: Dict[str, Document] = {}

        # ---------------------------------------------------------------------
        # result_sets: 여러 검색기의 결과(Document 리스트들)
        #   → 예: [ [벡터검색 결과1, 결과2...], [BM25 결과1, 결과2...] ]
        # 각 검색기 결과를 순회하면서 RRF 점수를 누적
        # ---------------------------------------------------------------------
        for docs in result_sets:
            for rank, doc in enumerate(docs):  # rank: 해당 검색기의 순위 (0부터 시작)
                content = doc.page_content

                # 최초 등장한 content라면, all_docs에 해당 문서 보관
                if content not in all_docs:
                    all_docs[content] = doc

                # 점수 누적 (처음이면 0에서 시작)
                if content not in fused_scores:
                    fused_scores[content] = 0
                # RRF 점수 공식 적용: 1 / (k + rank + 1)
                #   - rank가 낮을수록(= 상위 문서) 점수가 더 크다
                #   - 여러 검색 결과에서 반복 등장하면 점수가 합산되어 최종 랭크가 올라감
                fused_scores[content] += 1 / (k + rank + 1)

        # ---------------------------------------------------------------------
        # fused_scores를 점수 기준으로 내림차순 정렬
        #   → fused_scores.keys(): 문서 content 리스트
        #   → key=lambda x: fused_scores[x]: content별 누적 점수 기준으로 정렬
        # sorted_content: 점수가 높은 content부터 정렬된 리스트
        # ---------------------------------------------------------------------
        sorted_content = sorted(fused_scores.keys(), key=lambda x: fused_scores[x], reverse=True)

        # print("\n--- RRF 최종 순위 및 점수 ---")
        # for rank, doc in enumerate(final_docs, 1): # 1부터 시작하는 순위
        # RRF 점수 가져오기
        # score = fused_scores[doc.page_content]
        # 출력할 내용 선택
        # display_content = doc.metadata.get("retrieved_content", doc.page_content)
        # 순위, 점수, 내용 출력
        # print(f"[순위 {rank}] (RRF 점수: {score:.4f})")
        # 내용이 너무 길 경우 일부만 표시
        # print(f" └ 내용: {display_content[:150].strip()}...")
        # print("-" * 30)

        return [all_docs[content] for content in sorted_content[:top_n]]