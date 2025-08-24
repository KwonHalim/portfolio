# strategies/chroma_vector.py
from typing import List, Optional

import chromadb
from langchain_chroma import Chroma
from langchain_core.documents import Document

from database.vector.vector_strategy.vector_store_strategy import VectorStoreStrategy
from service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy


class ChromaVector(VectorStoreStrategy):
    def __init__(self, host: str, port: int, embedding_strategy: EmbeddingStrategy):
        """
        ChromaDB 서버에 연결하고 LangChain Chroma 래퍼를 초기화합니다.
        피드백 업데이트를 위해 네이티브 컬렉션 객체에도 접근합니다.
        """
        # LangChain 래퍼가 사용할 클라이언트
        self.client = chromadb.HttpClient(host=host, port=port)

        # LangChain의 Chroma 벡터스토어 래퍼 초기화
        self.vectorstore = Chroma(
            client=self.client,
            embedding_function=embedding_strategy,
            collection_name= "langchain" #기본값 그대로 사용예정
        )

    def add_documents(self, chunks: List[Document]):
        """
        문서를 ChromaDB에 저장합니다.
        """
        self.vectorstore.add_documents(documents=chunks)
        print(f"💾 {len(chunks)}개의 문서를 ChromaDB에 저장 완료")

    def query(self, query_text: str, k: int = 3, source_type: Optional[str] = None) -> list[tuple[Document, float]]:
        """유사도 검색을 수행하고 (문서, 점수) 튜플 리스트를 반환합니다."""
        # 기본 조건으로 Document.page_content의 유사도를 계산하여 반환합니다.
        if source_type:
            results = self.vectorstore.similarity_search_with_relevance_scores(query_text, k=k, source_type=source_type)
        # print(f"🔍 '{query_text}' 쿼리로 유사 문서 검색 완료")
        else:
            results = self.vectorstore.similarity_search_with_relevance_scores(query_text, k=k)
        return results

    def get_all_documents(self) -> List[Document]:
        """
        ChromaDB 컬렉션에 저장된 모든 문서를 LangChain Document 객체 리스트로 반환합니다.
        """
        self.collection = self.client.get_collection(name="langchain")

        count = self.collection.count()
        data = self.collection.get(
            limit=count,
            include=["metadatas", "documents"]
        )

        docs = [
            Document(page_content=doc, metadata=meta)
            for doc, meta in zip(data["documents"], data["metadatas"])
        ]
        return docs