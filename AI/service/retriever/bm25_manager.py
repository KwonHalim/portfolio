from fastapi.logger import logger
from langchain_community.retrievers import BM25Retriever

from database.vector.repository import VectorRepository


class BM25Manager:
    def __init__(self, vector_repository: VectorRepository):
        self.vector_repository = vector_repository
        self._retriever: BM25Retriever | None = None

    @property
    def retriever(self) -> BM25Retriever | None:
        """생성된 retriever 인스턴스를 반환하는 프로퍼티"""
        return self._retriever

    async def update_retriever(self):
        """DB 문서를 기반으로 BM25 retriever를 비동기적으로 갱신합니다."""
        logger.info("🔄 BM25 Retriever 업데이트를 시작합니다...")
        all_docs = self.vector_repository.get_all_documents()

        if not all_docs:
            logger.error("⚠️ BM25 Retriever: 색인할 문서가 없어 Retriever를 생성하지 않았습니다.")
            self._retriever = None
            return None

        retriever = BM25Retriever.from_documents(all_docs)
        retriever.k = 4
        self._retriever = retriever
        logger.info(f"✅ BM25 Retriever가 {len(all_docs)}개의 문서로 성공적으로 업데이트되었습니다.")
        return retriever
