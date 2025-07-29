# routes/chat.py
from fastapi import APIRouter, Depends
from AI.api_model.ChatDTO import MessageDTO
from AI.api_model.response_models import SuccessResponse
from AI.service.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/message", response_model=SuccessResponse)
async def chat_message(
    message_data: MessageDTO.message,
    chat_service: ChatService = Depends(get_chat_service)
) -> SuccessResponse:
    """채팅 메시지 처리"""
    result = chat_service.process_message(message_data)
    return SuccessResponse(result=result)