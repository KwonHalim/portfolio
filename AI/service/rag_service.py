import json

from AI.database.vector.repository import VectorRepository
from AI.service.chunk.service import ChunkService
from AI.service.embedding.service import EmbeddingService
from AI.service.rag.data_processor import DataProcessor


class RAGService:
    def __init__(self,
                 chunk_service: ChunkService,
                 embedding_service: EmbeddingService,
                 data_processor: DataProcessor,
                 vector_repository: VectorRepository,
                 ):
        self.chunk_service = chunk_service
        self.embedding_service = embedding_service
        self.data_processor = data_processor
        self.repository = vector_repository
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
        # 2. 문서 청킹
        print("--- 문서 청킹 시작 ---")
        documents = self.chunk_service.split_documents(docs)
        print(f"--- 청킹 완료 ---")
        print(f"--- 생성된 청크 문서 개수: {len(documents)} ---")
        ''' 3. 청킹된 문서 임베딩
        # ChromaDB는 자동 임베딩됨 따라서 주석처리한다.
        # print("--- 청크 문서 임베딩 시작 ---")
        # embedded_documents = self.embedding_service.embed_documents([doc.page_content for doc in documents])
        # print(f"--- 청크 문서 임베딩 완료 ---")
        # print(f"--- 임베딩된 청크 문서 개수: {len(embedded_documents)} ---")
        # 4. 임베딩된 문서 저장
        '''
        print("--- 청크 문서 저장 시작 ---")
        # 3.청크 문서 저장 및 임베딩
        self.repository.add_documents(documents)


        print("--- 청크 문서 저장 완료 ---")
        print(f"--- 총 처리된 문서 개수: {len(docs)} ---")





