import os
import shutil
import tempfile

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from starlette.responses import FileResponse

from api_model.response_models import SuccessResponse
from container.dependency import get_singleton_rag_service, get_data_processor
from service.data.data_processor import DataProcessor
from service.rag_service import RAGService

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

def cleanup_files(*paths):
    """백그라운드에서 임시 파일들을 삭제하는 함수"""
    for path in paths:
        if path and os.path.exists(path):
            os.remove(path)


@document_router.post("/upload", summary="QA 파일을 JSONL로 변환하여 다운로드")
async def to_jsonl(
        file: UploadFile = File(..., description=".xlsx 또는 .csv 형식의 QA 파일"),
        background_tasks: BackgroundTasks = None,
        data_processor: DataProcessor = Depends(get_data_processor),
):
    """
    업로드된 QA 파일(Excel 또는 CSV)을 JSONL 형식으로 변환하고,
    변환된 파일을 즉시 다운로드합니다.
    """
    file_extension = os.path.splitext(file.filename)[1]
    if file_extension.lower() not in ['.xlsx', '.csv']:
        raise HTTPException(
            status_code=400,
            detail="잘못된 파일 형식입니다. .xlsx 또는 .csv 파일만 업로드할 수 있습니다."
        )

    tmp_input_file_path = None
    tmp_output_file_path = None

    try:
        # 1. 업로드된 파일을 서버에 임시 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_input_file:
            shutil.copyfileobj(file.file, tmp_input_file)
            tmp_input_file_path = tmp_input_file.name

        # 2. 출력 파일 경로 설정
        tmp_output_file_path = f"{tmp_input_file_path}.jsonl"

        # 3. 데이터 처리 함수 호출
        data_processor.qa_to_jsonl(
            input_file_path=tmp_input_file_path,
            output_file_path=tmp_output_file_path
        )

        # 4. 응답이 완료된 후 임시 파일들을 삭제하도록 백그라운드 작업 추가
        background_tasks.add_task(cleanup_files, tmp_input_file_path, tmp_output_file_path)

        # 5. 생성된 파일을 FileResponse로 반환하여 다운로드
        download_filename = f"{os.path.splitext(file.filename)[0]}.jsonl"
        return FileResponse(
            path=tmp_output_file_path,
            filename=download_filename,
            media_type='application/octet-stream'  # 브라우저가 파일 다운로드로 인식하도록 설정
        )

    except (FileNotFoundError, ValueError, RuntimeError) as e:
        # 오류 발생 시 생성되었을 수 있는 임시 파일 정리
        cleanup_files(tmp_input_file_path, tmp_output_file_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # 예상치 못한 오류 발생 시에도 임시 파일 정리
        cleanup_files(tmp_input_file_path, tmp_output_file_path)
        raise HTTPException(status_code=500, detail=f"서버 내부 오류가 발생했습니다: {str(e)}")