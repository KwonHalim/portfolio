import json
import os
from typing import List, Dict
import pandas as pd

from langchain_core.documents import Document


class DataProcessor:
    def process_paragraphs(self, paragraphs: List[str]) -> List[Document]:
        """일반 문단 텍스트를 Document 객체 리스트로 변환합니다."""
        documents = []
        for i, p_text in enumerate(paragraphs):
            doc = Document(
                page_content=p_text,
                metadata={"source_type": "paragraph", "source_id": f"p_{i}"}
            )
            documents.append(doc)
        return documents

    def process_qa_json(self, qa_data: List[Dict[str, str]]) -> List[Document]:
        """Q&A JSON 데이터를 Document 객체 리스트로 변환합니다."""
        documents = []
        for i, item in enumerate(qa_data):
            doc = Document(
                page_content=item["question"],
                metadata={
                    "source_type": "qa",
                    "retrieved_content": item["answer"],
                    "source_id": f"qa_{i}"
                }
            )
            documents.append(doc)
        return documents

    def qa_to_jsonl(
            input_file_path: str,
            output_file_path: str,
            question_column: str = '질문',
            answer_column: str = '답변'
    ) -> int:
        """
        Excel 또는 CSV 파일을 읽어 RAG에 적합한 '질문-답변' 형식의 JSON Lines (.jsonl) 파일로 변환합니다.
        질문 또는 답변 중 하나라도 비어있는 행은 제외됩니다.

        Args:
            input_file_path (str): 입력 파일의 경로 (.xlsx 또는 .csv).
            output_file_path (str): 저장할 JSONL 파일의 경로.
            question_column (str): 질문 데이터가 포함된 컬럼의 이름.
            answer_column (str): 답변 데이터가 포함된 컬럼의 이름.

        Returns:
            int: 성공적으로 변환된 데이터 샘플의 총 개수.

        Raises:
            FileNotFoundError: 입력 파일이 존재하지 않을 경우 발생합니다.
            ValueError: 지원하지 않는 파일 형식이거나 필수 컬럼이 없을 경우 발생합니다.
        """
        # 1. 파일 존재 여부 확인
        if not os.path.exists(input_file_path):
            raise FileNotFoundError(f"입력 파일을 찾을 수 없습니다: {input_file_path}")

        # 2. 파일 확장자에 따라 데이터 읽기
        file_extension = os.path.splitext(input_file_path)[1].lower()

        try:
            if file_extension == '.xlsx':
                df = pd.read_excel(input_file_path)
            elif file_extension == '.csv':
                try:
                    df = pd.read_csv(input_file_path, encoding='utf-8-sig')
                except UnicodeDecodeError:
                    df = pd.read_csv(input_file_path, encoding='cp949')
            else:
                raise ValueError(f"지원하지 않는 파일 형식입니다: {file_extension}. (.xlsx 또는 .csv 파일만 지원)")
        except Exception as e:
            print(f"파일을 읽는 중 오류가 발생했습니다: {e}")
            return 0

        # 3. 필수 컬럼 존재 여부 확인
        if question_column not in df.columns or answer_column not in df.columns:
            raise ValueError(f"필수 컬럼('{question_column}', '{answer_column}')이 데이터에 없습니다. 현재 컬럼: {df.columns.tolist()}")

        # 4. JSON Lines 데이터 생성
        jsonl_data = []
        for index, row in df.iterrows():
            # ✅ 질문 또는 답변 중 하나라도 비어있으면 해당 행은 건너뛰기
            if (pd.isna(row[question_column]) or not str(row[question_column]).strip() or
                    pd.isna(row[answer_column]) or not str(row[answer_column]).strip()):
                continue

            question = str(row[question_column]).strip()
            answer = str(row[answer_column]).strip()

            # ✅ JSON 형식을 {"question": ..., "answer": ...}로 변경
            json_entry = {
                "question": question,
                "answer": answer
            }
            jsonl_data.append(json_entry)

        # 5. JSON Lines 파일로 저장
        try:
            with open(output_file_path, 'w', encoding='utf-8') as f:
                for entry in jsonl_data:
                    f.write(json.dumps(entry, ensure_ascii=False) + '\n')
        except IOError as e:
            print(f"파일을 저장하는 중 오류가 발생했습니다: {e}")
            return 0

        return len(jsonl_data)
