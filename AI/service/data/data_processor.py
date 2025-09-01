import json
import os
from typing import List, Dict

import pandas as pd
from langchain_core.documents import Document


class DataProcessor:

    def process_paragraphs(
        self, paragraphs: List[str], source_identifier: str
    ) -> List[Document]:
        """
        주어진 문단 리스트를 Langchain Document 객체 리스트로 변환합니다.

        각 문단은 Document의 page_content가 되며, 출처 등 부가 정보는 metadata에 저장됩니다.

        Args:
            paragraphs (List[str]): 변환할 문단들의 리스트.
            source_identifier (str): 데이터의 출처 식별자(파일명).

        Returns:
            List[Document]: 메타데이터가 포함된 Langchain Document 객체의 리스트.
        """

        documents = []
        for i, p_text in enumerate(paragraphs):
            doc = Document(
                page_content=p_text,
                metadata={
                    "source_type": "paragraph",
                    "source_id": f"{source_identifier}::{i}",
                    "likes": 0,
                    "dislikes": 0,
                },
            )
            documents.append(doc)
        return documents


    def process_qa_json(
                self, qa_data: List[Dict[str, str]], source_identifier: str
    ) -> List[Document]:
        """
        QA 딕셔너리 리스트를 Langchain Document 객체 리스트로 변환합니다.

        질문(question)은 page_content에, 답변(answer)은 metadata의 retrieved_content에 저장하여 벡터 검색에 사용되도록 구성합니다.

        Args:
            qa_data (List[Dict[str, str]]): 'question'과 'answer' 키를 포함하는 딕셔너리의 리스트.
                예: [{"question": "이름이 무엇인가요?", "answer": "..."}]
            source_identifier (str): 데이터의 출처 식별자 (파일명).

        Returns:
            List[Document]: 변환된 Langchain Document 객체의 리스트.
        """
        documents = []
        for i, item in enumerate(qa_data):
            doc = Document(
                page_content=item["question"],
                metadata={
                    "source_type": "qa",
                    "retrieved_content": item["answer"],
                    "source_id": f"{source_identifier}::{i}",
                    "likes": 0,
                    "dislikes": 0,
                },
            )
            documents.append(doc)
        return documents


    def qa_to_jsonl(
            self,
            input_file_path: str,
            output_file_path: str,
    ) -> int:
        """
        Excel(.xlsx) 또는 CSV(.csv) 파일을 JSONL 형식으로 변환합니다.

        파일 내 '질문'과 '답변' 열을 추출하여 각 행을 하나의 JSON 객체로 만듭니다.
        '질문' 또는 '답변'이 비어있는 행은 결과에서 제외됩니다.

        결과 포맷 예시:
            {"question": "이름이 무엇입니까?", "answer": "권하림입니다."}
        Args:
            input_file_path (): 변환할 원본 파일의 경로.
            output_file_path (): 저장할 JSONL 파일의 경로.

        Returns:
            int: JSONL 파일에 저장된 총 라인(데이터)의 수.

        Raises:
            FileNotFoundError: 입력 파일 경로가 유효하지 않을 경우.
            ValueError: 지원하지 않는 파일 형식이거나, 필수 컬럼('질문', '답변')이 없을 경우.
            RuntimeError: 파일을 읽거나 쓰는 과정에서 예측하지 못한 오류가 발생할 경우.

        """
        
        question_column = "질문"
        answer_column = "답변"


        if not os.path.exists(input_file_path):
            raise FileNotFoundError(f"입력 파일을 찾을 수 없습니다: {input_file_path}")

        file_extension = os.path.splitext(input_file_path)[1].lower()
        try:
            if file_extension == ".xlsx":
                df = pd.read_excel(input_file_path)
            elif file_extension == ".csv":
                try:
                    df = pd.read_csv(input_file_path, encoding="utf-8-sig")
                except UnicodeDecodeError:
                    df = pd.read_csv(input_file_path, encoding="cp949")
            else:
                raise ValueError(
                    f"지원하지 않는 파일 형식입니다: {file_extension}. (.xlsx 또는 .csv 파일만 지원)"
                )
        except Exception as e:
            # 구체적인 오류를 로깅하거나 처리할 수 있습니다.
            raise RuntimeError(f"파일을 읽는 중 오류가 발생했습니다: {e}")

        if question_column not in df.columns or answer_column not in df.columns:
            raise ValueError(
                f"필수 컬럼('{question_column}', '{answer_column}')이 데이터에 없습니다. 현재 컬럼: {df.columns.tolist()}"
            )

        jsonl_data = []
        for index, row in df.iterrows():
            if (
                    pd.isna(row[question_column])
                    or not str(row[question_column]).strip()
                    or pd.isna(row[answer_column])
                    or not str(row[answer_column]).strip()
            ):
                continue
            question = str(row[question_column]).strip()
            answer = str(row[answer_column]).strip()
            json_entry = {"question": question, "answer": answer}
            jsonl_data.append(json_entry)

        try:
            with open(output_file_path, "w", encoding="utf-8") as f:
                for entry in jsonl_data:
                    f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except IOError as e:
            raise RuntimeError(f"파일을 저장하는 중 오류가 발생했습니다: {e}")

        return len(jsonl_data)