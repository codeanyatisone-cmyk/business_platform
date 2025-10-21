"""
API endpoints для компаний
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_companies():
    """Получение списка компаний"""
    return {"message": "Companies endpoint - в разработке"}


@router.post("/")
async def create_company():
    """Создание компании"""
    return {"message": "Create company - в разработке"}
