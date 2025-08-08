from pydantic import BaseModel


class RequestMessageDTO(BaseModel):
    message: str
    sessionId: str | None = None

class RequestFeedbackDTO(BaseModel):
    chatId: str
    isGood: bool