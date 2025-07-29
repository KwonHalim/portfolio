import json
import os
from typing import Dict, List, Any

from langchain_text_splitters import RecursiveCharacterTextSplitter


class RAGDataProcessor:
    """
    다양한 소스(Q&A JSONL, 문단 TXT)의 데이터를 로드하고,
    RAG 시스템에 적합한 형태로 청킹 및 구조화하는 클래스.
    """
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
        print(f"✅ RAGDataProcessor 초기화 완료 (청크 크기: {chunk_size}, 겹침: {chunk_overlap})")