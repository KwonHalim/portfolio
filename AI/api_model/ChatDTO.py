from pydantic import BaseModel


class MessageDTO(BaseModel):
    message: str
    sessionId: str | None = None