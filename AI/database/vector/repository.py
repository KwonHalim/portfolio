from typing import Optional, List

from fastapi.logger import logger

from database.vector.vector_strategy.vector_store_strategy import VectorStoreStrategy


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
        logger.info("--- 벡터 스토어에 문서 추가 시작 ---")
        self.vector_db.add_documents(documents)
        logger.info("--- 벡터 스토어에 문서 추가 완료 ---")

    def query(self, query_text: str, top_k: int = 5, source_type: Optional[str] = None):
        """
        벡터 스토어에서 쿼리로 유사 문서를 검색합니다.
        :param query_text: 유사도를 비교할 사용자의 질문
        :param top_k: 유사한 문서의 개수
        :param source_type: 문서 데이터인지, QA데이터인지 확인 (인자값 없을 시에는 모두 포함하여 검색) -> 'qa' | 'paragraph' 중 선택
        :return: 유사한 문서의 데이터

        """
        # logger.info(f"--- 벡터 스토어에서 '{query_text}' 쿼리로 유사 문서 검색 시작 ---")
        results = self.vector_db.query(query_text, k=top_k, source_type = source_type)
        # logger.info(f"--- 벡터 스토어에서 '{query_text}' 쿼리로 유사 문서 검색 완료 ---")
        # for i, (doc, score) in enumerate(results):
        #     logger.info(f"  - 검색결과 {i+1}: {doc.page_content},... (유사도: {score:.4f})")
        #     logger.info(f"    메타데이터: {doc.metadata}")
        return results

    def get_all_documents(self):
        return self.vector_db.get_all_documents()



    def update_feedback_metadata(self, chunk_id: str, feedback: str):
        """특정 청크의 'likes' 또는 'dislikes' 메타데이터를 1 증가시킵니다."""
        try:
            current_meta = self.vector_db.get(ids=[chunk_id])["metadatas"][0]

            if feedback == "like":
                current_meta["likes"] = current_meta.get("likes") + 1
            elif feedback == "dislike":
                current_meta["dislikes"] = current_meta.get("dislikes") + 1

            self.vector_db.update(ids=[chunk_id], metadatas=[current_meta])
            logger.info(f"  - VectorDB: 청크 '{chunk_id}'의 '{feedback}' 카운트 업데이트 완료.")
        except Exception as e:
            logger.info(f"🚨 VectorDB 메타데이터 업데이트 실패 (ID: {chunk_id}): {e}")


    def find_by_source_id(self, source_id: List[str], is_good: bool):
        try:
            self.vector_db.find_by_source_id(source_ids=source_id, is_good=is_good)
        except Exception as e:
            return

    def reset(self):
        self.vector_db.reset()