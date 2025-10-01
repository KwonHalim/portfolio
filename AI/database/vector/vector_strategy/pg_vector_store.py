# strategies/pg_vector_store.py
from typing import List, Dict, Any
from xml.dom.minidom import Document

from fastapi.logger import logger
from langchain_community.vectorstores import PGVector

from database.vector.vector_strategy.vector_store_strategy import VectorStoreStrategy
from service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy


class PGVectorStore(VectorStoreStrategy):
    def __init__(self, connection_string: str, embedding_strategy: EmbeddingStrategy):
        self.vectorstore = PGVector(
            connection_string=connection_string,
            embedding_function=embedding_strategy,
            collection_name="example_collection"
        )
        logger.info("✅ PGVectorStore가 데이터베이스에 연결되었습니다.")

    def add_documents(self, chunks: List[Document]):
        self.vectorstore.add_documents(documents=chunks)
        logger.info("💾 PGVector에 저장 완료")

    def query(self, query_text: str, k: int = 3) -> List[Dict[str, Any]]:
        results = self.vectorstore.similarity_search_with_relevance_scores(query_text, k=k)
