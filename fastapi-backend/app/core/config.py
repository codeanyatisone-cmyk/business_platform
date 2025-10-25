"""
Конфигурация приложения
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Настройки приложения"""
    
    # Основные настройки
    PROJECT_NAME: str = "Business Platform API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API настройки
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 дней
    
    # CORS настройки
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://frontend",
    ]
    
    # Trusted hosts (just hostnames, not full URLs)
    TRUSTED_HOSTS: List[str] = [
        "localhost",
        "127.0.0.1",
        "frontend",
        "backend",
    ]
    
    # PostgreSQL - ACID-compliant database for critical data
    DATABASE_URL: str = "postgresql://alisherbilalov@localhost:5432/business_platform"
    DATABASE_URL_ASYNC: str = "postgresql+asyncpg://alisherbilalov@localhost:5432/business_platform"
    
    # Redis - Caching and Session Storage
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    REDIS_CACHE_TTL: int = 3600  # 1 hour default cache TTL
    REDIS_SESSION_TTL: int = 86400  # 24 hours session TTL
    
    # MinIO - S3-compatible File Storage
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_SECURE: bool = False
    MINIO_BUCKET_NAME: str = "business-platform"
    MINIO_REGION: str = "us-east-1"
    
    # Mailcow Configuration
    MAILCOW_API_KEY: Optional[str] = None
    MAILCOW_DOMAIN: Optional[str] = None
    MAILCOW_API_URL: Optional[str] = None
    
    # Админ панель
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_EMAIL: str = "admin@business-platform.com"
    
    # Файлы и загрузки
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
    
    # Email настройки (опционально)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Логирование
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Создаем экземпляр настроек
settings = Settings()

# Создаем директории если их нет
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(f"{settings.UPLOAD_DIR}/avatars", exist_ok=True)
os.makedirs(f"{settings.UPLOAD_DIR}/documents", exist_ok=True)
