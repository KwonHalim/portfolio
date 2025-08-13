import logging
import sys

from loguru import logger

# 기본 로거 제거 후 새로 설정
logger.remove()

# 로그 레벨 및 포맷 설정
log_format = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
)

# 콘솔(터미널) 로그 설정
logger.add(sys.stderr, level="INFO", format=log_format)

# 파일 로그 설정 (날짜별로 파일 생성)
# - rotation="1 day": 매일 자정(00:00)에 새 로그 파일 생성
# - retention="7 days": 7일이 지난 로그 파일은 자동 삭제
# - level="INFO": INFO 레벨 이상의 로그만 파일에 기록
logger.add(
    "~/logs/FastAPI/app_{time:YYYY-MM-DD}.log",
    rotation="1 day",
    retention="7 days",
    level="INFO",
    format=log_format,
    encoding="utf-8"
)


# FastAPI의 Uvicorn 로거를 Loguru와 연동
class InterceptHandler(logging.Handler):
    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logging():
    logging.basicConfig(handlers=[InterceptHandler()], level=0)
    logging.getLogger("uvicorn.access").handlers = [InterceptHandler()]
    logging.getLogger("uvicorn.error").handlers = [InterceptHandler()]