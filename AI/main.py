
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from AI.routes.chat.chat import chat_router
from AI.routes.document.document import document_router

app = FastAPI(
    title="CHATBOT",
    description="Rag AI Chatbot ",
)

origins = [
"http://localhost:3000",
"http://localhost:8000",
]

app.add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)



app.include_router(router=document_router)
app.include_router(router=chat_router)