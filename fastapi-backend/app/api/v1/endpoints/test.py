"""
Простой тестовый endpoint для проверки подключения
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/test")
async def test_connection():
    """Тестовый endpoint для проверки подключения"""
    return {
        "status": "success",
        "message": "FastAPI Backend подключен успешно!",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "service": "Business Platform API"
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Business Platform FastAPI Backend",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": "running"
    }
