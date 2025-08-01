# routes/chat.py
from fastapi import APIRouter, Depends

from AI.api_model.ChatDTO import MessageDTO
from AI.api_model.response_models import SuccessResponse
from AI.container.dependency import get_chat_service
from AI.service.chat_service import ChatService

chat_router = APIRouter(prefix="/chat", tags=["chat"])

@chat_router.post("/message", response_model=SuccessResponse)
async def chat_message(
    message_data: MessageDTO,
    chat_service: ChatService = Depends(get_chat_service)):
    """채팅 메시지 처리"""
    result = chat_service.ask(question=message_data.message)
    return SuccessResponse(result=result)