from fastapi import APIRouter

from api_model.response_models import SuccessResponse

health = APIRouter(tags=["health"])

@health.get("/health")
async def healthCheck():
    return SuccessResponse();
