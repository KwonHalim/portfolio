from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from AI.api_model.response_models import SuccessResponse
from AI.container.dependency import get_singleton_rag_service
from AI.service.rag_service import RAGService

document_router = APIRouter(prefix="/documents", tags=["documents"])


@document_router.post("/process")
async def process_documents(
        qa_file: UploadFile = File(None),  # 필수 아님
        paragraph_file: UploadFile = File(None),
        rag_service: RAGService = Depends(get_singleton_rag_service),
):
    """
    문서 처리 및 벡터 저장소에 저장
    
    Args:
        qa_file: JSONL 형식의 Q&A 파일 (선택사항)
        paragraph_file: 문단 텍스트 파일 (선택사항)
        rag_service: RAG 서비스 의존성
        
    Returns:
        SuccessResponse: 처리 결과
    """
    # 파일 내용 읽기
    qa_content_str = None
    paragraph_content_str = None

    if qa_file:
        if not qa_file.filename.endswith(('.jsonl', '.txt')):
            raise HTTPException(status_code=400, detail="QA 파일은 .jsonl 또는 .txt 형식이어야 합니다.")

        qa_content_bytes = await qa_file.read()
        qa_content_str = qa_content_bytes.decode('utf-8')
        print(f"QA 파일 읽기 완료: {qa_file.filename}")

    if paragraph_file:
        if not paragraph_file.filename.endswith(('.txt', '.md')):
            raise HTTPException(status_code=400, detail="문단 파일은 .txt 또는 .md 형식이어야 합니다.")

        paragraph_content_bytes = await paragraph_file.read()
        paragraph_content_str = paragraph_content_bytes.decode('utf-8')
        print(f"문단 파일 읽기 완료: {paragraph_file.filename}")

    # 최소 하나의 파일은 제공되어야 함
    if not qa_content_str and not paragraph_content_str:
        raise HTTPException(status_code=400, detail="최소 하나의 파일을 제공해야 합니다.")

    # RAG 서비스를 통한 문서 처리
    result = rag_service.process(
        paragraph_data=paragraph_content_str,
        paragraph_file_name = paragraph_file.filename,
        qa_data=qa_content_str,
        qa_file_name = qa_file.filename
    )

    return SuccessResponse(result=result)
