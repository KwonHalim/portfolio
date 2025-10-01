# strategies/chroma_vector.py
from typing import List, Optional

import chromadb
from fastapi.logger import logger
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
        logger.info(f"💾 {len(chunks)}개의 문서를 ChromaDB에 저장 완료")

    def query(self, query_text: str, k: int = 3, source_type: Optional[str] = None) -> list[tuple[Document, float]]:
        """유사도 검색을 수행하고 (문서, 점수) 튜플 리스트를 반환합니다."""
        # 기본 조건으로 Document.page_content의 유사도를 계산하여 반환합니다.
        if source_type:
            results = self.vectorstore.similarity_search_with_relevance_scores(query_text, k=k, source_type=source_type)
        # logger.info(f"🔍 '{query_text}' 쿼리로 유사 문서 검색 완료")
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

    def find_by_source_id(self, source_ids: List[str], is_good: bool):
        # 네이티브 Chroma 컬렉션 직접 가져오기
        collection = self.client.get_collection(name="langchain")
        for source_id in source_ids:
            results = collection.get(
                where={"source_id": source_id},
                limit=1 # _id의 값은 한개만 존재
            )
            if not results or not results['ids']:
                chromadb.logger.info(f"  ❌ 문서를 찾지 못했습니다: {source_id}")
                continue
            doc_id = results['ids'][0]
            current_metadata = results['metadatas'][0]
            if is_good:
                # 좋아요 필드 증가
                current_metadata['likes'] = current_metadata.get('likes', 0) + 1
                logger.info(f"  - ID '{doc_id}'의 'likes'를 {current_metadata['likes']}로 변경합니다.")
            elif not is_good:
                # 싫어요
                current_metadata['dislikes'] = current_metadata.get('dislikes', 0) + 1
                logger.info(f"  - ID '{doc_id}'의 'dislikes'를 {current_metadata['dislikes']}로 변경합니다.")
            # 업데이트 수행
            collection.update(
                ids=[doc_id],
                metadatas=[current_metadata]
            )
            logger.info("✅ 업데이트 완료!")
