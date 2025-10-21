"""
FastAPI Business Platform Backend
Современный бэкенд с админ панелью для корпоративной платформы
"""

import sys
from pathlib import Path

# Добавляем путь к приложению
sys.path.append(str(Path(__file__).parent))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from pathlib import Path

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.api import api_router
from app.admin.admin import setup_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    # Startup
    print("🚀 Starting Business Platform FastAPI Backend...")
    await init_db()
    # await setup_admin(app)  # Temporarily disabled due to relationship issues
    print("✅ Database initialized")
    # print("✅ Admin panel configured")
    yield
    # Shutdown
    print("🛑 Shutting down Business Platform FastAPI Backend...")


# Создание FastAPI приложения
app = FastAPI(
    title="Business Platform API",
    description="""
    🏢 **Business Platform API** - Современный корпоративный бэкенд
    
    ## Возможности
    
    * **Управление компаниями** - Мультитенантная архитектура
    * **Управление сотрудниками** - Полный CRUD для сотрудников
    * **Система задач** - Kanban доски, спринты, эпики
    * **Финансы** - Учет транзакций и счетов
    * **База знаний** - Статьи, папки, квизы
    * **Академия** - Курсы, программы, уроки
    * **Новости** - Корпоративные новости с комментариями
    * **Админ панель** - Полнофункциональная админка
    
    ## Аутентификация
    
    API использует JWT токены для аутентификации.
    Получите токен через `/api/v1/auth/login` и используйте его в заголовке:
    ```
    Authorization: Bearer <your-token>
    ```
    """,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS + ["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted hosts - using wildcard to allow all hosts in development
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],  # Allow all hosts in development
)

# Статические файлы для админ панели
static_path = Path(__file__).parent / "static"
static_path.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# Подключение API роутеров
app.include_router(api_router, prefix="/api/v1")


@app.get("/", response_class=HTMLResponse)
async def root():
    """Главная страница с информацией о API"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Business Platform API</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; margin-bottom: 10px; }
            .subtitle { color: #7f8c8d; margin-bottom: 30px; }
            .links { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px; }
            .link-card { padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px; text-decoration: none; color: #2c3e50; transition: all 0.2s; }
            .link-card:hover { border-color: #3498db; box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1); }
            .link-title { font-weight: 600; margin-bottom: 8px; }
            .link-desc { color: #7f8c8d; font-size: 14px; }
            .status { display: inline-block; padding: 4px 8px; background: #27ae60; color: white; border-radius: 4px; font-size: 12px; margin-left: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏢 Business Platform API <span class="status">ONLINE</span></h1>
            <p class="subtitle">Современный корпоративный бэкенд с админ панелью</p>
            
            <div class="links">
                <a href="/api/docs" class="link-card">
                    <div class="link-title">📚 API Documentation</div>
                    <div class="link-desc">Swagger UI для тестирования API</div>
                </a>
                
                <a href="/api/redoc" class="link-card">
                    <div class="link-title">📖 ReDoc</div>
                    <div class="link-desc">Альтернативная документация API</div>
                </a>
                
                <a href="/admin" class="link-card">
                    <div class="link-title">⚙️ Admin Panel</div>
                    <div class="link-desc">Административная панель</div>
                </a>
                
                <a href="/health" class="link-card">
                    <div class="link-title">💚 Health Check</div>
                    <div class="link-desc">Проверка состояния сервиса</div>
                </a>
            </div>
        </div>
    </body>
    </html>
    """


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Business Platform API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="info",
    )
