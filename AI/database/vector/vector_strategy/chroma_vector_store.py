# strategies/chroma_vector_store.py
from typing import List, Dict, Any

import chromadb
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

from AI.database.vector.vector_strategy.vector_store_strategy import VectorStoreStrategy
from AI.service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy


class ChromaVectorStore(VectorStoreStrategy):
    def __init__(self, host: str, port: int, embedding_strategy: EmbeddingStrategy):
        client = chromadb.HttpClient(host=host, port=port)
        self.vectorstore = Chroma(
            client=client,
            embedding_function=embedding_strategy
        )
        print(f"✅ ChromaVectorStore가 서버({host}:{port})에 연결되었습니다.")

    def add_documents(self, chunks: List[Document]):
        self.vectorstore.add_documents(documents=chunks)
        print("💾 ChromaDB에 저장 완료")

    def query(self, query_text: str, k: int = 3) -> List[Dict[str, Any]]:
        results = self.vectorstore.similarity_search_with_relevance_scores(query_text, k=k)