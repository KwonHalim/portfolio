from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# 이 config.py 파일이 있는 폴더를 기준으로 .env 파일을 찾습니다.
env_path = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=env_path,
        env_file_encoding="utf-8"
    )

    # .env 파일에서 읽어올 변수들
    GENAI_API_KEY: str
    # DB_URL: str # 나중에 필요하면 주석 해제

    # 코드에서 기본값을 지정하는 변수
    TIMEZONE_LOCATION: str = "Asia/Seoul"


# 설정 객체 생성 (다른 파일에서 import하여 사용)
settings = Settings()

