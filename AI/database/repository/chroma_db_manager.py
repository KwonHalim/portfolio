from typing import List, Dict, Any

from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

from AI.service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy


class ChromaDB:
    def __init__(self, db_path: str, embedding_strategy: EmbeddingStrategy):
        self.embedding_strategy = embedding_strategy
        self.vectorstore = Chroma(
            persist_directory=db_path,
            embedding_function=self.embedding_strategy
        )
        print(f"✅ VectorStoreManager 초기화 완료 (전략: {embedding_strategy.__class__.__name__})")

    def add_documents(self, chunks: List[Document]):
        """
        청킹된 Document 리스트를 받아 DB에 저장합니다.
        Chroma가 내부적으로 embedding_strategy를 호출하여 임베딩을 수행합니다.
        """
        if not chunks:
            print("⚠️ 저장할 데이터가 없습니다.")
            return

        print(f"🔄 {len(chunks)}개 문서를 임베딩 후 DB에 저장 중...")
        self.vectorstore.add_documents(documents=chunks)
        self.vectorstore.persist()
        print("💾 저장 완료")

    def query(self, query_text: str, k: int = 3) -> List[Dict[str, Any]]:
        """쿼리로 유사 문서를 검색합니다."""
        print(f"\n🔍 '{query_text}' 유사도 검색 (상위 {k}개)")
        return self.vectorstore.similarity_search(query_text, k=k)