"""
API endpoints для работы с паролями
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.api.v1.dependencies import get_current_user_from_token
from app.models import User

router = APIRouter()

# Request/Response models
class PasswordCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class PasswordCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime

class PasswordCreate(BaseModel):
    title: str
    username: str
    password: str
    url: Optional[str] = None
    notes: Optional[str] = None
    category_id: Optional[int] = None

class PasswordResponse(BaseModel):
    id: int
    title: str
    username: str
    password: str
    url: Optional[str] = None
    notes: Optional[str] = None
    category_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

# Password Categories endpoints
@router.get("/password-categories")
async def get_password_categories(
    current_user: User = Depends(get_current_user_from_token)
):
    """Получение списка категорий паролей"""
    # Пока возвращаем заглушку
    return {
        "categories": [
            {"id": 1, "name": "Рабочие", "description": "Рабочие пароли"},
            {"id": 2, "name": "Личные", "description": "Личные пароли"},
            {"id": 3, "name": "Банковские", "description": "Банковские пароли"},
        ]
    }

@router.post("/password-categories")
async def create_password_category(
    category_data: PasswordCategoryCreate,
    current_user: User = Depends(get_current_user_from_token)
):
    """Создание новой категории паролей"""
    # Пока возвращаем заглушку
    return {
        "id": 1,
        "name": category_data.name,
        "description": category_data.description,
        "created_at": datetime.utcnow()
    }

# Passwords endpoints
@router.get("/passwords")
async def get_passwords(
    current_user: User = Depends(get_current_user_from_token)
):
    """Получение списка паролей"""
    # Пока возвращаем заглушку
    return {
        "passwords": [
            {
                "id": 1,
                "title": "Gmail",
                "username": "user@example.com",
                "password": "***",
                "url": "https://gmail.com",
                "notes": "Личная почта",
                "category_id": 2,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": 2,
                "title": "GitHub",
                "username": "developer",
                "password": "***",
                "url": "https://github.com",
                "notes": "Рабочий аккаунт",
                "category_id": 1,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
    }

@router.post("/passwords")
async def create_password(
    password_data: PasswordCreate,
    current_user: User = Depends(get_current_user_from_token)
):
    """Создание нового пароля"""
    # Пока возвращаем заглушку
    return {
        "id": 1,
        "title": password_data.title,
        "username": password_data.username,
        "password": "***",
        "url": password_data.url,
        "notes": password_data.notes,
        "category_id": password_data.category_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

@router.get("/passwords/{password_id}")
async def get_password(
    password_id: int,
    current_user: User = Depends(get_current_user_from_token)
):
    """Получение конкретного пароля"""
    # Пока возвращаем заглушку
    return {
        "id": password_id,
        "title": "Gmail",
        "username": "user@example.com",
        "password": "realpassword123",
        "url": "https://gmail.com",
        "notes": "Личная почта",
        "category_id": 2,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

@router.put("/passwords/{password_id}")
async def update_password(
    password_id: int,
    password_data: PasswordCreate,
    current_user: User = Depends(get_current_user_from_token)
):
    """Обновление пароля"""
    # Пока возвращаем заглушку
    return {
        "id": password_id,
        "title": password_data.title,
        "username": password_data.username,
        "password": "***",
        "url": password_data.url,
        "notes": password_data.notes,
        "category_id": password_data.category_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

@router.delete("/passwords/{password_id}")
async def delete_password(
    password_id: int,
    current_user: User = Depends(get_current_user_from_token)
):
    """Удаление пароля"""
    return {"message": "Password deleted successfully"}

