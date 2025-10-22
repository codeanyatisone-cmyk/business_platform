"""
Главный роутер API
"""

from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    companies,
    departments,
    employees,
    tasks,
    finances,
    knowledge,
    academy,
    news,
    test,
)

api_router = APIRouter()

# Подключаем все роутеры
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(finances.router, prefix="/finances", tags=["finances"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
api_router.include_router(academy.router, prefix="/academy", tags=["academy"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(test.router, prefix="/test", tags=["test"])
