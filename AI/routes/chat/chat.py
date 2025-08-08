# routes/chat.py
from fastapi import APIRouter, Depends

from AI.api_model.ChatDTO import RequestMessageDTO, RequestFeedbackDTO
from AI.api_model.response_models import SuccessResponse
from AI.container.dependency import get_chat_service
from AI.service.chat_service import ChatService

chat_router = APIRouter(prefix="/chat", tags=["chat"])

@chat_router.post("/message", response_model=SuccessResponse)
async def chat_message(
    message_data: RequestMessageDTO,
    chat_service: ChatService = Depends(get_chat_service)
):
    """채팅 메시지 처리"""
    result = chat_service.ask(question=message_data.message, session_id = message_data.sessionId)
    return SuccessResponse(result=result)

@chat_router.post("/feedback", response_model=SuccessResponse)
async def chat_feedback(
    message_data: RequestFeedbackDTO,
    chat_service: ChatService = Depends(get_chat_service)
):
    """채팅 피드백 처리"""
    result = chat_service.feedback(
        chat_id=message_data.chatId,
        is_good=message_data.isGood
    )
    if result:
        return SuccessResponse(result={"message": "피드백이 성공적으로 업데이트되었습니다."})
    return None
