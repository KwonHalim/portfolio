import json

from database.vector.repository import VectorRepository
from service.chunk.service import ChunkService
from service.data.data_processor import DataProcessor
from service.embedding.service import EmbeddingService


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

    def process(self, paragraph_data: str, paragraph_file_name: str, qa_data: str, qa_file_name: str):
        # 1. TXT(자기소개) 데이터와 Q&A(질의응답) 데이터를 받아서 langchain Document 객체로 변환합니다.
        print("--- 문서 변환 시작 ---")
        docs = []

        if paragraph_data:
            # 1. 전달받은 전체 텍스트를 빈 줄('\n\n') 기준으로 나누어 리스트를 만듭니다. (두 줄 이상 띄어져 있으면 다른 내용이라고 간주하는 것)
            paragraphs_list = [p.strip() for p in paragraph_data.split('\n\n') if p.strip()]

            # 2. 이제 나누어진 '문단 리스트'를 다음 함수로 전달합니다.
            docs.extend(self.data_processor.process_paragraphs(
                paragraphs=paragraphs_list,
                source_identifier=paragraph_file_name
            ))
        print(f"--- 문단 데이터 변환 완료 ---")
        print(f"--- 변환된 문단 데이터 개수: {len(docs)} ---")
        print(f"--- Q&A 데이터 변환 시작 ---")
        print(f"--- Q&A 데이터 개수: {len(qa_data)} ---")
        qa_data = [json.loads(line) for line in qa_data.strip().split('\n')]
        docs.extend(self.data_processor.process_qa_json(qa_data=qa_data, source_identifier=qa_file_name))
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
        self.repository.add_documents(documents) #이 부분에서 임베딩이 자동으로 처리됨(내부적 처리) -> chroma_vector_store.py에서 처리됨.embedding_function참고
        print("--- 청크 문서 저장 완료 ---")
        print(f"--- 총 처리된 문서 개수: {len(docs)} ---")