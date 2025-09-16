from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from lifespan import lifespan
from routes.chat.chat import chat_router
from routes.document.document import document_router
from utils.log_config import setup_logging

# 로깅 설정
setup_logging()

# FastAPI 앱 인스턴스 생성
app = FastAPI(
    title="CHATBOT",
    description="Rag AI Chatbot",
    lifespan=lifespan
)

# CORS를 허용할 출처(origin) 목록입니다.
# 개발 환경(localhost)과 프로덕션 환경(chatbot.harim.dev)을 명시적으로 지정합니다.
origins = [
    "http://localhost:3000",      # React 같은 프론트엔드 개발 서버
    "http://localhost:8000",      # 로컬 테스트용 서버
    "http://localhost:5500",      # Live Server 같은 정적 파일 서버
    "https://harim.dev",# 허용하려는 프로덕션 프론트엔드 주소
    "https://*.my-portfolio-4gw.pages.dev" #배포주소
]

# CORS 미들웨어를 앱에 추가합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 위에서 정의한 origins 목록을 사용합니다. "*" 대신 특정 도메인을 지정하는 것이 보안상 안전합니다.
    allow_credentials=True, # 자격 증명(쿠키, 인증 헤더 등)을 허용합니다.
    allow_methods=["*"],    # 모든 HTTP 메소드(GET, POST, PUT, DELETE 등)를 허용합니다.
    allow_headers=["*"],    # 모든 HTTP 헤더를 허용합니다.
)

app.include_router(router=document_router)
app.include_router(router=chat_router)
