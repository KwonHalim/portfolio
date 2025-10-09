# AI/lifespan.py

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.logger import logger

import container.dependency as deps
from service.retriever.bm25_manager import BM25Manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- ⚙️ 애플리케이션 시작 시 실행 ---
    logger.info("--- 애플리케이션 시작: 싱글톤 객체 생성 ---")

    # 1. 독립적인 무거운 객체들 먼저 생성
    embedding_strategy = await deps.get_embedding_strategy()
    cache = deps.get_redis()
    llm = deps.get_llm()
    chat_db_strategy = deps.get_chat_db_strategy()
    prompt = deps.get_prompt() # 캐싱되므로 여기서 호출해도 무방

    # 2. 위에서 만든 객체에 의존하는 객체들 생성
    vector_store_strategy = await deps.get_vector_store_strategy(embedding_strategy)
    vector_repository = await deps.get_vector_repository(vector_store_strategy)

    #BM25객체 생성
    bm25_manager = BM25Manager(vector_repository)
    await bm25_manager.update_retriever()


    chat_repository = deps.get_chat_repository(chat_db_strategy)
    embedding_service = await deps.get_embedding_service(embedding_strategy)


    retriever = await deps.get_document_retriever(vector_repository, bm25_manager)
    cache_strategy = deps.get_cache_strategy(cache, embedding_strategy)


    # 3. 캐싱된 가벼운 객체들도 가져오기
    chunk_service = deps.get_chunk_service(deps.get_chunk_strategy())
    data_processor = deps.get_data_processor()

    # 4. 최종 서비스 객체들 생성 및 app.state에 저장
    app.state.bm25_manager = bm25_manager

    app.state.rag_service = await deps.get_rag_service(
        chunk_service=chunk_service,
        embedding_service=embedding_service,
        data_processor=data_processor,
        vector_repository=vector_repository,
    )
    app.state.chat_service = await deps.get_chat_service(
        retriever=retriever,
        prompt=prompt,
        llm=llm,
        chat_repository=chat_repository,
        vector_repository=vector_repository,
        cache_strategy=cache_strategy,
    )

    logger.info("--- ✅ 싱글톤 객체 생성 완료 ---")
    yield
    # ---  애플리케이션 종료 시 실행 ---
    logger.info("--- 애플리케이션 종료 ---")