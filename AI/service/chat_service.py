# service/chat_service.py
from typing import Dict, Any, List

from AI.service.rag_service import rag_service


class ChatService:
    def __init__(self, rag_service: rag_service):
        self.rag_service = rag_service
        self.conversation_history = []
    
    def process_message(self, user_message: str) -> Dict[str, Any]:
        """사용자 메시지 처리 및 응답 생성"""
        try:
            # 1. 유사도 검색
            retrieved_docs = self.rag_service.search_documents(user_message, k=3)
            
            # 2. 응답 생성
            response = self.rag_service.generate_response(user_message, retrieved_docs)
            
            # 3. 대화 히스토리 업데이트
            self.conversation_history.append({
                "user": user_message,
                "assistant": response,
                "retrieved_docs": retrieved_docs
            })
            
            return {
                "response": response,
                "retrieved_documents": retrieved_docs,
                "conversation_id": len(self.conversation_history)
            }
            
        except Exception as e:
            return {
                "response": "죄송합니다. 처리 중 오류가 발생했습니다.",
                "error": str(e)
            }
    
    def get_conversation_history(self) -> List[Dict]:
        """대화 히스토리 반환"""
        return self.conversation_history