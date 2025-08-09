# strategies/chroma_vector_store.py
from typing import List, Dict, Any

import chromadb
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

from AI.database.vector.vector_strategy.vector_store_strategy import VectorStoreStrategy
from AI.service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy


class ChromaVectorStore(VectorStoreStrategy):
    def __init__(self, host: str, port: int, embedding_strategy: EmbeddingStrategy):
        """
        ChromaDB 서버에 연결하고 LangChain Chroma 래퍼를 초기화합니다.
        피드백 업데이트를 위해 네이티브 컬렉션 객체에도 접근합니다.
        """
        # LangChain 래퍼가 사용할 클라이언트
        client = chromadb.HttpClient(host=host, port=port)

        # LangChain의 Chroma 벡터스토어 래퍼 초기화
        self.vectorstore = Chroma(
            client=client,
            embedding_function=embedding_strategy
        #     추후 여기에 컬렉션 네임 추가
        )

    def add_documents(self, chunks: List[Document]):
        """
        문서를 ChromaDB에 저장합니다.
        """
        self.vectorstore.add_documents(documents=chunks)
        print(f"💾 {len(chunks)}개의 문서를 ChromaDB에 저장 완료")

    def query(self, query_text: str, k: int = 3) -> list[tuple[Document, float]]:
        """유사도 검색을 수행하고 (문서, 점수) 튜플 리스트를 반환합니다."""
        results = self.vectorstore.similarity_search_with_relevance_scores(query_text, k=k)
        print(f"🔍 '{query_text}' 쿼리로 유사 문서 검색 완료")
        return results