"""
API endpoints для работы с почтовыми ящиками через Mailcow
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import httpx
import os
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.models import User, Employee
from app.api.v1.endpoints.auth import get_current_user_from_token
from app.schemas.auth import UserResponse

router = APIRouter()

# Mailcow API configuration
MAILCOW_API_URL = "https://mail.anyatis.com/api/v1"
MAILCOW_API_KEY = os.getenv("MAILCOW_API_KEY", "your-mailcow-api-key")
MAILCOW_DOMAIN = os.getenv("MAILCOW_DOMAIN", "anyatis.com")

async def create_mailcow_mailbox(email: str, password: str, name: str) -> dict:
    """Создание почтового ящика в Mailcow"""
    try:
        # Извлекаем локальную часть email (до @)
        local_part = email.split('@')[0]
        
        # Подготавливаем данные для создания ящика
        mailbox_data = {
            "active": "1",
            "local_part": local_part,
            "domain": MAILCOW_DOMAIN,
            "name": name,
            "password": password,
            "password2": password,
            "quota": "1024",  # 1GB по умолчанию
            "tls_enforce_in": "1",
            "tls_enforce_out": "1",
            "force_pw_update": "1"
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MAILCOW_API_KEY}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MAILCOW_API_URL}/add/mailbox",
                json=mailbox_data,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                error_detail = response.text
                return {"success": False, "error": error_detail}
                
    except Exception as e:
        return {"success": False, "error": str(e)}

async def get_mailcow_mailbox(email: str) -> dict:
    """Получение информации о почтовом ящике из Mailcow"""
    try:
        local_part = email.split('@')[0]
        
        headers = {
            "Authorization": f"Bearer {MAILCOW_API_KEY}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{MAILCOW_API_URL}/get/mailbox/{local_part}@{MAILCOW_DOMAIN}",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": "Mailbox not found"}
                
    except Exception as e:
        return {"success": False, "error": str(e)}

async def update_mailcow_mailbox_password(email: str, new_password: str) -> dict:
    """Обновление пароля почтового ящика в Mailcow"""
    try:
        local_part = email.split('@')[0]
        
        mailbox_data = {
            "attr": {
                "password": new_password,
                "password2": new_password,
                "force_pw_update": "1"
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MAILCOW_API_KEY}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MAILCOW_API_URL}/edit/mailbox/{local_part}@{MAILCOW_DOMAIN}",
                json=mailbox_data,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": response.text}
                
    except Exception as e:
        return {"success": False, "error": str(e)}

async def delete_mailcow_mailbox(email: str) -> dict:
    """Удаление почтового ящика из Mailcow"""
    try:
        local_part = email.split('@')[0]
        
        headers = {
            "Authorization": f"Bearer {MAILCOW_API_KEY}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MAILCOW_API_URL}/delete/mailbox/{local_part}@{MAILCOW_DOMAIN}",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": response.text}
                
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/mailbox/info")
async def get_mailbox_info(
    current_user: User = Depends(get_current_user_from_token)
):
    """Получение информации о почтовом ящике пользователя"""
    try:
        result = await get_mailcow_mailbox(current_user.email)
        
        if result["success"]:
            return {
                "success": True,
                "mailbox": {
                    "email": current_user.email,
                    "status": "active",
                    "quota": "1024 MB",
                    "webmail_url": f"https://mail.anyatis.com/SOGo/",
                    "imap_server": "mail.anyatis.com",
                    "smtp_server": "mail.anyatis.com",
                    "imap_port": 993,
                    "smtp_port": 587
                }
            }
        else:
            return {
                "success": False,
                "message": "Mailbox not found or not created yet"
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving mailbox info: {str(e)}"
        )

@router.post("/mailbox/create")
async def create_user_mailbox(
    password: str,
    current_user: User = Depends(get_current_user_from_token)
):
    """Создание почтового ящика для текущего пользователя"""
    try:
        # Получаем имя пользователя из профиля
        name = f"{current_user.username or 'User'}"
        
        result = await create_mailcow_mailbox(
            current_user.email, 
            password, 
            name
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Mailbox created successfully",
                "mailbox": {
                    "email": current_user.email,
                    "webmail_url": f"https://mail.anyatis.com/SOGo/",
                    "imap_server": "mail.anyatis.com",
                    "smtp_server": "mail.anyatis.com"
                }
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create mailbox: {result['error']}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating mailbox: {str(e)}"
        )

@router.post("/mailbox/update-password")
async def update_mailbox_password(
    new_password: str,
    current_user: User = Depends(get_current_user_from_token)
):
    """Обновление пароля почтового ящика"""
    try:
        result = await update_mailcow_mailbox_password(
            current_user.email, 
            new_password
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Mailbox password updated successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update mailbox password: {result['error']}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating mailbox password: {str(e)}"
        )

@router.get("/mailbox/webmail-url")
async def get_webmail_url(
    current_user: User = Depends(get_current_user_from_token)
):
    """Получение URL для доступа к веб-почте"""
    return {
        "webmail_url": f"https://mail.anyatis.com/SOGo/",
        "email": current_user.email,
        "instructions": {
            "login": "Use your business platform email and password",
            "imap_settings": {
                "server": "mail.anyatis.com",
                "port": 993,
                "security": "SSL/TLS"
            },
            "smtp_settings": {
                "server": "mail.anyatis.com", 
                "port": 587,
                "security": "STARTTLS"
            }
        }
    }
