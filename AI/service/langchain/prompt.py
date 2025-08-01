from langchain_core.prompts import ChatPromptTemplate


def create_prompt() -> ChatPromptTemplate:
    """
    RAG 체인에 사용될 프롬프트 템플릿을 생성하고 반환합니다.
    """
    template = """
    당신은 질문에 대해 주어진 컨텍스트를 기반으로 답변하는 AI 어시스턴트입니다.
    컨텍스트에 답변이 없는 경우, "자료에 없는 내용입니다."라고 답변하세요.

    [컨텍스트]
    {context}

    [질문]
    {question}
    """
    return ChatPromptTemplate.from_template(template)