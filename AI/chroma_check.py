import argparse

import chromadb
from fastapi.logger import logger

from config import settings

# LangChain에서 사용할 때 기본 컬렉션 이름은 "langchain"
COLLECTION_NAME = "langchain"

def check_chroma_db():
    """DB의 현재 상태와 모든 데이터를 확인합니다."""
    try:
        # 1. ChromaDB 서버에 접속

        client = chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
        logger.info(f"✅ ChromaDB 서버({settings.CHROMA_HOST}:{settings.CHROMA_PORT})에 성공적으로 연결되었습니다.")

        # 2. 컬렉션 가져오기
        collection = client.get_collection(name=COLLECTION_NAME)
        logger.info(f"✅ '{COLLECTION_NAME}' 컬렉션을 찾았습니다.")

        # 3. 저장된 데이터 개수 확인
        count = collection.count()
        logger.info(f"\n📊 총 {count}개의 데이터가 저장되어 있습니다.")

        # 4. 실제 데이터 전체 조회
        if count > 0:
            logger.info("\n📄 저장된 모든 데이터:")
            data = collection.get(limit=count, include=["metadatas", "documents"])

            for i in range(len(data["ids"])):
                logger.info(f"\n  [{i + 1}/{count}]")
                logger.info(f"  - ID: {data['ids'][i]}")
                logger.info(f"    - Document: {data['documents'][i]}")
                logger.info(f"    - Metadata: {data['metadatas'][i]}")

    except Exception as e:
        logger.info(f"\n❌ 오류 발생: ChromaDB를 확인하는 중 문제가 발생했습니다.")
        logger.info(f"   에러 내용: {e}")


def delete_chroma_collection():
    """지정된 컬렉션을 삭제합니다."""
    try:
        # 1. ChromaDB 서버에 접속
        client = chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
        logger.info(f"✅ ChromaDB 서버({settings.CHROMA_HOST}:{settings.CHROMA_PORT})에 성공적으로 연결되었습니다.")

        # 2. 컬렉션 삭제 시도
        logger.info(f"\n🗑️ '{COLLECTION_NAME}' 컬렉션 삭제를 시도합니다...")
        client.delete_collection(name=COLLECTION_NAME)
        logger.info(f"✅ '{COLLECTION_NAME}' 컬렉션이 성공적으로 삭제되었습니다.")

    except ValueError:
        # 컬렉션이 존재하지 않을 때 발생하는 오류 처리
        logger.info(f"❗️ 정보: '{COLLECTION_NAME}' 컬렉션이 이미 존재하지 않습니다.")
    except Exception as e:
        logger.info(f"\n❌ 오류 발생: 컬렉션을 삭제하는 중 문제가 발생했습니다.")
        logger.info(f"   에러 내용: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ChromaDB 컬렉션을 확인하거나 삭제합니다.")
    parser.add_argument('action', choices=['check', 'delete'], help="수행할 작업: 'check' (확인) 또는 'delete' (삭제)")
    args = parser.parse_args()

    if args.action == 'check':
        check_chroma_db()
    elif args.action == 'delete':
        delete_chroma_collection()
'''
사용법

저장 내용 삭제
python3 chroma_check.py delete

저장 내용 확인
python3 chroma_check.py check
'''