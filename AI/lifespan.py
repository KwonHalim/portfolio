# AI/lifespan.py

from contextlib import asynccontextmanager

from fastapi import FastAPI

import container.dependency as deps


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- ⚙️ 애플리케이션 시작 시 실행 ---
    print("--- 애플리케이션 시작: 싱글톤 객체 생성 ---")

    # 1. 독립적인 무거운 객체들 먼저 생성
    embedding_strategy = await deps.get_embedding_strategy()
    llm = deps.get_llm()
    chat_db_strategy = deps.get_chat_db_strategy()
    prompt = deps.get_prompt() # 캐싱되므로 여기서 호출해도 무방

    # 2. 위에서 만든 객체에 의존하는 객체들 생성
    vector_store_strategy = await deps.get_vector_store_strategy(embedding_strategy)
    vector_repository = await deps.get_vector_repository(vector_store_strategy)
    chat_repository = deps.get_chat_repository(chat_db_strategy)
    embedding_service = await deps.get_embedding_service(embedding_strategy)
    bm_25_retriever = await deps.get_bm25_retriever(vector_repository)
    retriever = await deps.get_document_retriever(vector_repository, bm_25_retriever)


    # 3. 캐싱된 가벼운 객체들도 가져오기
    chunk_service = deps.get_chunk_service(deps.get_chunk_strategy())
    data_processor = deps.get_data_processor()

    # 4. 최종 서비스 객체들 생성 및 app.state에 저장
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
    )

    print("--- ✅ 싱글톤 객체 생성 완료 ---")
    yield
    # --- 🔌 애플리케이션 종료 시 실행 ---
    print("--- 애플리케이션 종료 ---")