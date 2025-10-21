"""
Схемы для аутентификации
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    """Запрос на вход"""
    email: str = Field(..., description="Email пользователя")
    password: str = Field(..., description="Пароль")


class Token(BaseModel):
    """Токен доступа"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserCreate(BaseModel):
    """Создание пользователя"""
    email: str = Field(..., description="Email пользователя")
    username: str = Field(..., description="Имя пользователя")
    password: str = Field(..., description="Пароль")
    role: str = Field(default="employee", description="Роль пользователя")


class UserResponse(BaseModel):
    """Ответ с данными пользователя"""
    id: int
    email: str
    username: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class PasswordChange(BaseModel):
    """Смена пароля"""
    current_password: str = Field(..., description="Текущий пароль")
    new_password: str = Field(..., description="Новый пароль")
