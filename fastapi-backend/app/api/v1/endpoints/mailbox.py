"""
API endpoints для работы с почтовыми ящиками через Mailcow
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
import httpx
import os
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.models import User, Employee
from app.api.v1.dependencies import get_current_user_from_token
from app.schemas.auth import UserResponse
from app.services.email_service import EmailService

router = APIRouter()

# Request models
class MailboxCreateRequest(BaseModel):
    password: str

class MailboxPasswordUpdateRequest(BaseModel):
    password: str

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
            "X-API-Key": MAILCOW_API_KEY
        }
        
        async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
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
            "X-API-Key": MAILCOW_API_KEY
        }
        
        async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
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
            "X-API-Key": MAILCOW_API_KEY
        }
        
        async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
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
            "X-API-Key": MAILCOW_API_KEY
        }
        
        async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
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

@router.get("/info")
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

@router.post("/create")
async def create_user_mailbox(
    request: MailboxCreateRequest,
    current_user: User = Depends(get_current_user_from_token)
):
    """Создание почтового ящика для текущего пользователя"""
    try:
        # Получаем имя пользователя из профиля
        name = f"{current_user.username or 'User'}"
        
        result = await create_mailcow_mailbox(
            current_user.email, 
            request.password, 
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

@router.post("/update-password")
async def update_mailbox_password(
    request: MailboxPasswordUpdateRequest,
    current_user: User = Depends(get_current_user_from_token)
):
    """Обновление пароля почтового ящика"""
    try:
        result = await update_mailcow_mailbox_password(
            current_user.email, 
            request.password
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

@router.get("/webmail-url")
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


# ============================================
# Email Client Endpoints (IMAP/SMTP)
# ============================================

class EmailSendRequest(BaseModel):
    to: str
    subject: str
    body: str
    cc: Optional[str] = None
    bcc: Optional[str] = None
    is_html: bool = False


class MailboxPasswordRequest(BaseModel):
    password: str


# Хранилище паролей почтовых ящиков (в продакшене использовать Redis или БД)
_mailbox_passwords = {}


@router.post("/set-password")
async def set_mailbox_password(
    request: MailboxPasswordRequest,
    current_user: User = Depends(get_current_user_from_token)
):
    """Сохранение пароля почтового ящика для доступа к IMAP/SMTP"""
    try:
        # В продакшене нужно шифровать пароль перед сохранением
        _mailbox_passwords[current_user.email] = request.password
        
        return {
            "success": True,
            "message": "Password saved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving password: {str(e)}"
        )


@router.get("/emails")
async def get_emails(
    folder: str = "INBOX",
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user_from_token)
):
    """Получение списка писем из папки"""
    try:
        password = _mailbox_passwords.get(current_user.email)
        if not password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mailbox password not set. Please set your mailbox password first."
            )
        
        email_service = EmailService(current_user.email, password)
        emails = email_service.get_emails(folder, limit, offset)
        
        return {
            "success": True,
            "emails": emails,
            "total": len(emails),
            "folder": folder
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching emails: {str(e)}"
        )


@router.get("/emails/{email_id}")
async def get_email_detail(
    email_id: str,
    folder: str = "INBOX",
    current_user: User = Depends(get_current_user_from_token)
):
    """Получение полного содержимого письма"""
    try:
        password = _mailbox_passwords.get(current_user.email)
        if not password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mailbox password not set"
            )
        
        email_service = EmailService(current_user.email, password)
        email_data = email_service.get_email_by_id(email_id, folder)
        
        if not email_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not found"
            )
        
        # Пометить как прочитанное
        email_service.mark_as_read(email_id, folder)
        
        return {
            "success": True,
            "email": email_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching email: {str(e)}"
        )


@router.post("/emails/send")
async def send_email(
    request: EmailSendRequest,
    current_user: User = Depends(get_current_user_from_token)
):
    """Отправка письма"""
    try:
        password = _mailbox_passwords.get(current_user.email)
        if not password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mailbox password not set"
            )
        
        email_service = EmailService(current_user.email, password)
        success = email_service.send_email(
            to=request.to,
            subject=request.subject,
            body=request.body,
            cc=request.cc,
            bcc=request.bcc,
            is_html=request.is_html
        )
        
        if success:
            return {
                "success": True,
                "message": "Email sent successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send email"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending email: {str(e)}"
        )


@router.delete("/emails/{email_id}")
async def delete_email(
    email_id: str,
    folder: str = "INBOX",
    current_user: User = Depends(get_current_user_from_token)
):
    """Удаление письма"""
    try:
        password = _mailbox_passwords.get(current_user.email)
        if not password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mailbox password not set"
            )
        
        email_service = EmailService(current_user.email, password)
        success = email_service.delete_email(email_id, folder)
        
        if success:
            return {
                "success": True,
                "message": "Email deleted successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete email"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting email: {str(e)}"
        )


@router.get("/folders")
async def get_folders(
    current_user: User = Depends(get_current_user_from_token)
):
    """Получение списка папок почтового ящика"""
    try:
        password = _mailbox_passwords.get(current_user.email)
        if not password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mailbox password not set"
            )
        
        email_service = EmailService(current_user.email, password)
        folders = email_service.get_folders()
        
        return {
            "success": True,
            "folders": folders
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching folders: {str(e)}"
        )
