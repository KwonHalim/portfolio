import json

from AI.service.chunk.service import ChunkService
from AI.service.embedding.service import EmbeddingService
from AI.service.rag.data_processor import DataProcessor


class RAGService:
    def __init__(self, chunk_service: ChunkService, embedding_service: EmbeddingService, data_processor: DataProcessor):
        self.chunk_service = chunk_service
        self.embedding_service = embedding_service
        self.data_processor = data_processor
        print("✅ RAGService 초기화 완료")

    def process(self, paragraph_data: str | None, qa_data: str | None):
        # 1. TXT(자기소개) 데이터와 Q&A(질의응답) 데이터를 받아서 langchain Document 객체로 변환합니다.
        print("--- 문서 변환 시작 ---")
        docs = []
        docs.extend(self.data_processor.process_paragraphs([paragraph_data]))
        qa_data = [json.loads(line) for line in qa_data.strip().split('\n')]
        docs.extend(self.data_processor.process_qa_json(qa_data))
        print(f"--- 문서 변환 완료 ---")
        print(f"--- 변환된 문서 개수: {len(docs)} ---")
        # 2. 청킹 데이터 임베딩
        print("--- 문서 청킹 시작 ---")
        documents = self.chunk_service.chunk_documents(docs)
        print(f"--- 청킹 완료 ---")
        print(f"--- 생성된 청크 문서 개수: {len(documents)} ---")




