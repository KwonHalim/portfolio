# routes/chat.py
from fastapi import APIRouter, Depends, Request
from fastapi.logger import logger

from api_model.ChatDTO import RequestMessageDTO, RequestFeedbackDTO
from api_model.response_models import SuccessResponse
from container.dependency import get_singleton_chat_service
from exception.model.base_exception_model import ErrorResponse, ErrorDetail
from service.chat_service import ChatService

chat_router = APIRouter(prefix="/chat", tags=["chat"])

@chat_router.post("/message", response_model=SuccessResponse)
async def chat_message(
    message_data: RequestMessageDTO,
    request : Request,
    chat_service: ChatService = Depends(get_singleton_chat_service)
):
    """
    채팅 메세지를 받아 응답하고 값을 반환합니다.

    Args:
        message_data (RequestMessageDTO): 사용자가 전송하는 메세지입니다.
        request (Request): 사용자의 IP를 로그에 저장하기 위한 용도입니다.
        chat_service (ChatService): 채팅 관련 로직을 처리하는 객체, Depends를 통해 의존성 주입을 받습니다.

    Returns:
        SuccessResponse | ErrorResponse: 처리 성공 여부와 함께 AI의 응답 메시지 등 필요한 데이터를 담아 반환합니다.

    """
    logger.info(f"Client IP: {request.client.host}")

    result = await chat_service.ask(question=message_data.message, session_id=message_data.sessionId)

    if result:
        return SuccessResponse(result=result)
    else:
        error_detail = ErrorDetail(reason="채팅 처리 중 오류가 발생했습니다.")
        return ErrorResponse(error=error_detail)

@chat_router.post("/feedback", response_model=SuccessResponse)
async def chat_feedback(
    message_data: RequestFeedbackDTO,
    chat_service: ChatService = Depends(get_singleton_chat_service)
):
    """
    채팅의 피드백을 받아 처리합니다.

    Args:
        message_data (RequestFeedbackDTO): 사용자의 피드백 데이터. 피드백 대상인 채팅의 ID('chatId')와 좋았는지 여부('isGood')를 포함합니다.
        chat_service (ChatService): 피드백 처리 로직을 담고 있는 서비스 객체. 의존성 주입(Depends)을 통해 제공됩니다.


    Returns:
        SuccessResponse | ErrorResponse: 피드백 성공 여부를 반환합니다.

    """
    is_success = chat_service.feedback(
        chat_id=message_data.chatId,
        is_good=message_data.isGood
    )
    if is_success:
        return SuccessResponse(result={"message": "피드백이 성공적으로 업데이트되었습니다."})
    else:
        error_detail = ErrorDetail(reason="피드백을 처리하는 중 서버 내부 오류가 발생했습니다.")
        return ErrorResponse(error=error_detail)