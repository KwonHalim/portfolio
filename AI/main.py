
from fastapi import FastAPI

from AI.routes.document.document import document_router

app = FastAPI(
    title="CHATBOT",
    description="Rag AI Chatbot ",
)

app.include_router(router=document_router)