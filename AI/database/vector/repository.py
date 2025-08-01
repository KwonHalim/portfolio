from AI.database.vector.vector_strategy.vector_store_strategy import VectorStoreStrategy


class VectorRepository:
    """
    벡터 스토어에 대한 CRUD 작업을 수행하는 레포지토리
    """
    def __init__(self, vector_store_strategy: VectorStoreStrategy):
        self.vector_db = vector_store_strategy

    def add_documents(self, documents):
        """
        벡터 스토어에 문서를 추가합니다.
        :param documents: 추가할 문서들
        """
        print("--- 벡터 스토어에 문서 추가 시작 ---")
        self.vector_db.add_documents(documents)
        print("--- 벡터 스토어에 문서 추가 완료 ---")

    def query(self, query_text: str, top_k: int = 5):
        """
        벡터 스토어에서 쿼리로 유사 문서를 검색합니다.
        :param query_text:
        :param top_k:
        :return:
        """
        print(f"--- 벡터 스토어에서 '{query_text}' 쿼리로 유사 문서 검색 시작 ---")
        results = self.vector_db.query(query_text, k=top_k)
        print(f"--- 벡터 스토어에서 '{query_text}' 쿼리로 유사 문서 검색 완료 ---")
        for i, (doc, score) in enumerate(results):
            print(f"  - 검색결과 {i+1}: {doc.page_content},... (유사도: {score:.4f})")
            print(f"    메타데이터: {doc.metadata}")
        return results