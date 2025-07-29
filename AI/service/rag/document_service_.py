from AI.database.repository.document_repository import VectorRepository
from AI.service.rag_service.toJsonl import qa_to_jsonl


class DocumentService_:
    def __init__(self, document_repository: VectorRepository):
        self.repository = document_repository

    def qa_to_jsonl(self):
        excel_input = '../my_qa_data.xlsx'  # 변환할 엑셀 파일 이름
        excel_output = '../my_rag_dataset.jsonl'  # 저장될 파일 이름
        qa_to_jsonl(input_file_path=excel_input,
                output_file_path=excel_output,
                question_column='질문',  # 실제 엑셀의 질문 컬럼 이름
                answer_column='답변'  # 실제 엑셀의 답변 컬럼 이름
                         )
    def context_to_jsonl(self):
        excel_input = '../my_context_data.xlsx'
        excel_output = '../my_rag_dataset.jsonl'

