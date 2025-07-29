from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# 이 config.py 파일이 있는 폴더를 기준으로 .env 파일을 찾습니다.
env_path = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=env_path,
        env_file_encoding="utf-8"
    )
    VECTOR_DB_TYPE :str = "chroma"  # 사용할 벡터 DB 타입 (chroma 또는 pgvector)
    GENAI_API_KEY: str
    CHROMA_HOST: str
    CHROMA_PORT: int
    PGVECTOR_URL: str

# 설정 객체 생성 (다른 파일에서 import하여 사용)
settings = Settings()

