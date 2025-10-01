import numpy as np
import redis
from fastapi.logger import logger
from langchain_core.embeddings import Embeddings
from redis.commands.search.query import Query

from service.cache.cache_strategy import CacheStrategy


class RedisSemanticCache(CacheStrategy):
    """
    Redis의 벡터 검색을 이용한 시맨틱 캐시 전략 구현체입니다.
    """

    def __init__(self, redis_client: redis.Redis, embedding_model: Embeddings, embedding_dim: int, similarity_threshold:float):
        self.r = redis_client
        self.model = embedding_model
        self.embedding_dim = embedding_dim
        self.index_name = "llm_rag_cache_idx" # 벡터 검색용 인덱스 이름
        self.doc_prefix = "rag_cache:" # 캐시 데이터를 저장할 때 사용할 키의 접두어
        self.similarity_threshold = similarity_threshold or 0.95 # 코사인 유사도 임계값

    async def get_cached_answer(self, question: str) -> dict[str, float | str] | None:
        """

        Args:
            question (str): 사용자의 질문

        Returns:
            - Cache Hit: 이전 AI의 답변
            - Cache Miss: None

        """
        question_embedding = self.model.embed_query(question) # 사용자의 질문을 벡터화
        question_vector = np.array(question_embedding, dtype=np.float32).tobytes() # 벡터를 바이트 데이터 형태로 변환

        # 벡터 명령어 검색
        q = (
            Query("*=>[KNN 1 @question_vector $vec_param AS vector_score]")
            .sort_by("vector_score")
            .return_fields("question", "answer", "vector_score")
            .dialect(2)
        )
        # 쿼리 뜻: 모든 문서(*)를 대상으로 question_vector 필드에서 KNN알고리즘을 통해 가장 가까운 1개의 이웃을 찾는다.
        # (참고)
        # $vec_param은 실제 검색할 벡터값을 의미한다.

        params = {"vec_param": question_vector}
        # vec_param의 자리에 질문 벡터를 삽입한다.

        try:
            results = self.r.ft(self.index_name).search(q, query_params=params)
            # llm_rag_cache_idx라는 이름의 인덱스를 사용하여 쿼리를 실행한 뒤 결과를 받는다.
            if results.docs:
                most_similar = results.docs[0]
                score = 1 - float(most_similar.vector_score)
                # 0에 가까울수록 유사한 것이기에(KNN알고리즘) 유사도로 변환하기 위해 1로 변환

                if score > self.similarity_threshold:
                    logger.info(f"✅ Cache Hit! (유사도: {score:.4f})")
                    return {
                        "answer": most_similar.answer,
                        "original_question": most_similar.question,
                        "score": score
                    }
        except Exception as e:
            logger.info(f"Redis 캐시 검색 오류: {e}")

        logger.info("❌ Cache Miss!")
        return None

    async def add_to_cache(self, question: str, answer: str):
        question_embedding = self.model.embed_query(question)
        question_vector = np.array(question_embedding, dtype=np.float32).tobytes()

        key = f"{self.doc_prefix}{self.r.incr('rag_cache_id')}"
        # Redis의 rag_cache_id 키의 숫자를 1 증가시킨 뒤 그 결과를 가져온다.
        item = {
            "question": question,
            "answer": answer,
            "question_vector": question_vector
        }
        self.r.hset(key, mapping=item)
        logger.info(f"새로운 Q&A를 Redis 캐시에 추가했습니다. (Key: {key})")