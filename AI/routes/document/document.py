import os
import shutil
import tempfile

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.logger import logger
from starlette.responses import FileResponse

from api_model.response_models import SuccessResponse
from container.dependency import get_singleton_rag_service, get_data_processor, get_bm25_manager
from service.data.data_processor import DataProcessor
from service.rag_service import RAGService

document_router = APIRouter(prefix="/documents", tags=["documents"])


@document_router.post("/process")
async def process_documents(
        qa_file: UploadFile = File(None),
        paragraph_file: UploadFile = File(None),
        rag_service: RAGService = Depends(get_singleton_rag_service),
        bm25_retriever = Depends(get_bm25_manager),
):
    """
    RAG 시 참고할 데이터를 입력받습니다. 두 파일 모두 필수는 아니지만, 적어도 하나의 파일은 존재해야 합니다.
    TODO 만약 같은 파일이 들어올 시 이전 데이터 자동으로 덮어씌우기 혹은 가장 최신 파일 이용할 수 있도록 하기

    Args:
        qa_file (UploadFile): 질의응답 파일 (질문 / 대답 이라는 열이 존재해야함), jsonl 형식의 파일로만 받을 수 있음, 필수 파라미터 아님
        paragraph_file (UploadFile): txt파일임. 한줄 띄어져 있으면 (\n\n) 다른 문단으로 간주하는 로직이 들어있음, 필수 파라미터 아님
        rag_service (RAGService): 파일 처리 관련 로직이 들어있는 객체, dependency를 통해 주입받음

    Returns:

        SuccessResponse | ErrorResponse: 피드백 성공 여부를 반환합니다.

    """
    # 파일 내용 읽기
    qa_content_str = None
    paragraph_content_str = None

    if qa_file:
        if not qa_file.filename.endswith(('.jsonl')):
            raise HTTPException(status_code=400, detail="QA 파일은 .jsonl 형식이어야 합니다.")

        qa_content_bytes = await qa_file.read()
        qa_content_str = qa_content_bytes.decode('utf-8')
        logger.info(f"QA 파일 읽기 완료: {qa_file.filename}")

    if paragraph_file:
        if not paragraph_file.filename.endswith(('.txt', '.md')):
            raise HTTPException(status_code=400, detail="문단 파일은 .txt 형식이어야 합니다.")

        paragraph_content_bytes = await paragraph_file.read()
        paragraph_content_str = paragraph_content_bytes.decode('utf-8')
        logger.info(f"문단 파일 읽기 완료: {paragraph_file.filename}")

    # 최소 하나의 파일은 제공되어야 함
    if not qa_content_str and not paragraph_content_str:
        raise HTTPException(status_code=400, detail="최소 하나의 파일을 제공해야 합니다.")

    # RAG 서비스를 통한 문서 처리
    rag_service.process(
        paragraph_data=paragraph_content_str,
        paragraph_file_name = paragraph_file.filename,
        qa_data=qa_content_str,
        qa_file_name = qa_file.filename
    )

    # BM25객체 새로운 문서로 업데이트
    await bm25_retriever.update_retriever()

    return SuccessResponse()

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
    TODO 추후 리팩토링 예정, 임시파일 사용이 아닌 스트리밍 방식으로 수정 예정
    업로드된 QA 파일(.xlsx, .csv)을 JSONL 형식으로 변환하여 사용자에게 다운로드합니다.

    이 엔드포인트는 파일을 서버에 임시 저장하고 변환한 후, 응답이 완료되면 백그라운드에서 임시 파일을 자동으로 삭제합니다.

    Args:
        file (UploadFile): 사용자가 업로드한 .xlsx 또는 .csv 형식의 QA 파일.
        background_tasks (BackgroundTasks): FastAPI의 의존성 주입 기능. 응답 전송 후 임시 파일을 삭제하는 등의 후처리 작업을 수행합니다.
        data_processor (DataProcessor): 파일 변환 로직을 실제로 수행하는 서비스 객체. 의존성 주입을 통해 제공됩니다.

    Returns:
        FileResponse: 변환된 .jsonl 파일을 담고 있는 스트리밍 응답. 브라우저에서 파일 다운로드를 트리거합니다.

    Raises:
        HTTPException (status_code=400): 지원하지 않는 파일 형식이거나 파일 내용에 문제가 있어 처리할 수 없는 경우 발생합니다.
        HTTPException (status_code=500): 파일 처리 중 예상치 못한 서버 내부 오류가 발생한 경우 발생합니다.
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