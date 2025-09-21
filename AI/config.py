from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

# 이 config.py 파일이 있는 폴더를 기준으로 .env 파일을 찾습니다.
env_path = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=env_path,
        env_file_encoding="utf-8"
    )
    VECTOR_DB_TYPE :str
    GENAI_API_KEY: str
    CHROMA_HOST: str
    CHROMA_PORT: int
    PGVECTOR_URL: str
    LLM_TYPE: str
    HUGGINGFACE_API_KEY: Optional[str] = None
    HUGGINGFACE_ENDPOINT_URL: Optional[str] = None
    MONGO_DB_URL: str
    REDIS_HOST:str
    REDIS_PORT: int
    CACHE_TYPE:str

# 설정 객체 생성 (다른 파일에서 import하여 사용)
settings = Settings()

