# routes/chat.py
from fastapi import APIRouter, Depends
from AI.api_model.ChatDTO import MessageDTO
from AI.api_model.response_models import SuccessResponse
from AI.service.chat_service import ChatService
from AI.container.dependency import get_chat_service

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/message", response_model=SuccessResponse)
async def chat_message(
    message_data: MessageDTO,
    chat_service: ChatService = Depends(get_chat_service)
) -> SuccessResponse:
    """채팅 메시지 처리"""
    result = chat_service.process_message(message_data.message)
    return SuccessResponse(result=result)

@router.get("/history")
async def get_chat_history(
    chat_service: ChatService = Depends(get_chat_service)
):
    """대화 히스토리 조회"""
    history = chat_service.get_conversation_history()
    return SuccessResponse(result={"history": history})