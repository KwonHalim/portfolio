from typing import List
from AI.service.embedding.embedding_strategy.embedding_strategy import EmbeddingStrategy

# 만약 임베딩에서 해야하는 추가적인 로직이 있다면(특정 모델에만 적용되는 것이 아닌) 여기에다가 작성

class EmbeddingService:
    def __init__(self, embedding_model: EmbeddingStrategy):
        self.embedding_model = embedding_model
        print(f"✅ EmbeddingService 초기화 완료 (모델: {embedding_model.__class__.__name__})")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        여러 문서를 임베딩합니다. 주입받은 모델의 embed_documents를 그대로 호출합니다.
        """
        return self.embedding_model.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        """
        하나의 쿼리를 임베딩합니다. 주입받은 모델의 embed_query를 그대로 호출합니다.
        """
        return self.embedding_model.embed_query(text)