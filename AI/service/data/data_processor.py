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
        일반 문단 텍스트를 Document 객체 리스트로 변환합니다.
        source_identifier를 받아 고유한 source_id를 생성합니다.
        """
        documents = []
        for i, p_text in enumerate(paragraphs):
            doc = Document(
                page_content=p_text,
                metadata={
                    "source_type": "paragraph",
                    # ✨ 수정된 부분: 소스 식별자를 ID에 포함시켜 고유성을 보장합니다.
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
        Q&A JSON 데이터를 Document 객체 리스트로 변환합니다.
        source_identifier를 받아 고유한 source_id를 생성합니다.
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
            question_column: str = "질문",
            answer_column: str = "답변",
    ) -> int:
        """
        이 함수는 파일 변환 유틸리티이므로 직접적인 수정은 필요하지 않습니다.
        이 함수를 통해 생성된 jsonl 파일을 읽은 후,
        위의 process_qa_json 메서드를 호출할 때 파일명을 source_identifier로 넘겨주면 됩니다.
        """
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