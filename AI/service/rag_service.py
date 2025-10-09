import json

from fastapi.logger import logger

from database.vector.repository import VectorRepository
from service.chunk.service import ChunkService
from service.data.data_processor import DataProcessor
from service.embedding.service import EmbeddingService


class RAGService:
    """
    문서 수집(Ingestion) 파이프라인을 총괄하는 서비스 클래스입니다.

    원본 텍스트와 QA 데이터를 입력받아 파싱, 청킹, 임베딩 단계를 거쳐
    최종적으로 벡터 데이터베이스에 저장하는 전체 과정을 관리합니다.
    """
    def __init__(self,
                 chunk_service: ChunkService,
                 embedding_service: EmbeddingService,
                 data_processor: DataProcessor,
                 vector_repository: VectorRepository,
                 ):
        """
        RAGService를 초기화합니다.

        Args:
            chunk_service (ChunkService): 문서를 청크 단위로 분할하는 서비스.
            embedding_service (EmbeddingService): 텍스트를 벡터로 변환하는 서비스 (현재는 VectorRepository에서 처리).
            data_processor (DataProcessor): 원본 데이터(텍스트, JSONL)를 LangChain Document 객체로 파싱하는 서비스.
            vector_repository (VectorRepository): 청크와 임베딩 벡터를 Vector DB에 저장하는 레포지토리.

        """
        self.chunk_service = chunk_service
        self.embedding_service = embedding_service
        self.data_processor = data_processor
        self.repository = vector_repository
        logger.info("✅ RAGService 초기화 완료")

    def process(self, paragraph_data: str, paragraph_file_name: str, qa_data: str, qa_file_name: str):
        """

        Args:
            paragraph_data (str): 문단 데이터 입니다. 파일에 있는 모든 문자열 자체가 입력됩니다.
            paragraph_file_name (str): 입력되는 파일의 이름입니다.
            qa_data (str): QA파일의 질문과 대답의 문자열입니다.
            qa_file_name (str): QA파일의 파일 이름입니다.

        Returns:

        """

        # 이미 chroma에 데이터가 존재하는지 확인하고 만약 존재한다면 해당 데이터를 삭제합니다. 그리고 해당 컬렉션까지 재생성합니다.
        self.repository.reset()


        # 1. TXT(자기소개) 데이터와 Q&A(질의응답) 데이터를 받아서 langchain Document 객체로 변환합니다.
        logger.info("--- 문서 변환 시작 ---")
        docs = []

        if paragraph_data:
            # 1. 전달받은 전체 텍스트를 빈 줄('\n\n') 기준으로 나누어 리스트를 만듭니다. (두 줄 이상 띄어져 있으면 다른 내용이라고 간주하는 것)
            paragraphs_list = [p.strip() for p in paragraph_data.split('\n\n') if p.strip()]

            # 2. 이제 나누어진 '문단 리스트'를 다음 함수로 전달합니다.
            docs.extend(self.data_processor.process_paragraphs(
                paragraphs=paragraphs_list,
                source_identifier=paragraph_file_name
            ))
        logger.info(f"--- 문단 데이터 변환 완료 ---")
        logger.info(f"--- 변환된 문단 데이터 개수: {len(docs)} ---")
        logger.info(f"--- Q&A 데이터 변환 시작 ---")
        qa_data = [json.loads(line) for line in qa_data.strip().split('\n')]
        logger.info(f"--- Q&A 데이터 개수: {len(qa_data)} ---")
        docs.extend(self.data_processor.process_qa_json(qa_data=qa_data, source_identifier=qa_file_name))
        logger.info(f"--- 문서 변환 완료 ---")
        logger.info(f"--- 변환된 문서 개수: {len(docs)} ---")
        # 2. 문서 청킹
        logger.info("--- 문서 청킹 시작 ---")
        documents = self.chunk_service.split_documents(docs)
        logger.info(f"--- 청킹 완료 ---")
        logger.info(f"--- 생성된 청크 문서 개수: {len(documents)} ---")
        ''' 3. 청킹된 문서 임베딩
        # ChromaDB는 자동 임베딩됨 따라서 주석처리한다.
        # print("--- 청크 문서 임베딩 시작 ---")
        # embedded_documents = self.embedding_service.embed_documents([doc.page_content for doc in documents])
        # print(f"--- 청크 문서 임베딩 완료 ---")
        # print(f"--- 임베딩된 청크 문서 개수: {len(embedded_documents)} ---")
        # 4. 임베딩된 문서 저장
        '''
        logger.info("--- 청크 문서 저장 시작 ---")
        # 3.청크 문서 저장 및 임베딩
        self.repository.add_documents(documents) #이 부분에서 임베딩이 자동으로 처리됨(내부적 처리) -> chroma_vector_store.py에서 처리됨.embedding_function참고
        logger.info("--- 청크 문서 저장 완료 ---")
        logger.info(f"--- 총 처리된 문서 개수: {len(docs)} ---")