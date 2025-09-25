FROM python:3.12-slim

WORKDIR /AI/app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

#워커 스케줄링 알고리즘: 리눅스 기본값인 CFS
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "--workers", "3", "main:app", "--bind", "0.0.0.0:8000", "--timeout", "120"]