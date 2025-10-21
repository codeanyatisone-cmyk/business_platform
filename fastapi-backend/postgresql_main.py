#!/usr/bin/env python3
"""
Упрощенная версия FastAPI с PostgreSQL
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
from typing import List, Optional
import asyncio

# Импорты для работы с базой данных
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, Float, text
from sqlalchemy.sql import func

# Конфигурация базы данных
DATABASE_URL = "postgresql+asyncpg://alisherbilalov@localhost:5432/business_platform"

# Создание движка
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

# Простые модели для тестирования
class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    email = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True)
    position = Column(String(100))
    phone = Column(String(20))
    avatar = Column(String(500))
    company_id = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="new")
    priority = Column(Integer, default=1)
    assignee_id = Column(Integer)
    creator_id = Column(Integer)
    company_id = Column(Integer)
    due_date = Column(DateTime(timezone=True))
    tags = Column(JSON)
    story_points = Column(Integer)
    estimated_hours = Column(Float)
    actual_hours = Column(Float)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Создание FastAPI приложения
app = FastAPI(
    title="Business Platform API (PostgreSQL)",
    description="Упрощенная версия с PostgreSQL",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency для получения сессии БД
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Тестовые данные
async def create_test_data():
    """Создание тестовых данных"""
    async with AsyncSessionLocal() as session:
        # Проверяем, есть ли уже данные
        result = await session.execute(text("SELECT COUNT(*) FROM companies"))
        count = result.scalar()
        
        if count == 0:
            # Создаем тестовую компанию
            company = Company(
                name="Тестовая компания",
                description="Компания для тестирования",
                email="test@company.com"
            )
            session.add(company)
            await session.commit()
            await session.refresh(company)
            
            # Создаем тестовых сотрудников
            employees = [
                Employee(
                    first_name="Иван",
                    last_name="Иванов",
                    email="ivan@company.com",
                    position="Разработчик",
                    company_id=company.id
                ),
                Employee(
                    first_name="Петр",
                    last_name="Петров",
                    email="petr@company.com",
                    position="Менеджер",
                    company_id=company.id
                )
            ]
            
            for emp in employees:
                session.add(emp)
            
            await session.commit()
            
            # Создаем тестовые задачи
            tasks = [
                Task(
                    title="Настроить базу данных",
                    description="Настроить PostgreSQL для проекта",
                    status="DONE",
                    priority=3,
                    assignee_id=1,
                    creator_id=2,
                    company_id=company.id,
                    tags=["backend", "database"]
                ),
                Task(
                    title="Создать API endpoints",
                    description="Создать REST API для фронтенда",
                    status="IN_PROGRESS",
                    priority=2,
                    assignee_id=1,
                    creator_id=2,
                    company_id=company.id,
                    tags=["api", "backend"]
                )
            ]
            
            for task in tasks:
                session.add(task)
            
            await session.commit()
            print("✅ Тестовые данные созданы!")

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Business Platform API (PostgreSQL)",
        "status": "running",
        "database": "PostgreSQL",
        "docs": "/api/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Business Platform API",
        "version": "1.0.0",
        "database": "PostgreSQL",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/v1/companies")
async def get_companies():
    """Получить список компаний"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT * FROM companies WHERE is_active = true"))
        companies = result.fetchall()
        
        return [
            {
                "id": company.id,
                "name": company.name,
                "description": company.description,
                "email": company.email,
                "isActive": company.is_active,
                "createdAt": company.created_at.isoformat() if company.created_at else None,
                "updatedAt": company.updated_at.isoformat() if company.updated_at else None
            }
            for company in companies
        ]

@app.get("/api/v1/employees")
async def get_employees():
    """Получить список сотрудников"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT * FROM employees WHERE is_active = true"))
        employees = result.fetchall()
        
        return [
            {
                "id": emp.id,
                "firstName": emp.first_name,
                "lastName": emp.last_name,
                "name": f"{emp.first_name} {emp.last_name}",
                "email": emp.email,
                "position": emp.position,
                "phone": emp.phone,
                "avatar": emp.avatar,
                "companyId": emp.company_id,
                "isActive": emp.is_active,
                "createdAt": emp.created_at.isoformat() if emp.created_at else None
            }
            for emp in employees
        ]

@app.get("/api/v1/tasks")
async def get_tasks():
    """Получить список задач"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT * FROM tasks ORDER BY created_at DESC"))
        tasks = result.fetchall()
        
        return [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "assigneeId": task.assignee_id,
                "creatorId": task.creator_id,
                "companyId": task.company_id,
                "dueDate": task.due_date.isoformat() if task.due_date else None,
                "tags": getattr(task, 'tags', None) or [],
                "checklist": [],
                "storyPoints": getattr(task, 'story_points', None),
                "estimatedHours": getattr(task, 'estimated_hours', None),
                "actualHours": getattr(task, 'actual_hours', None),
                "isFavorite": getattr(task, 'is_favorite', False),
                "createdAt": task.created_at.isoformat() if task.created_at else None,
                "updatedAt": task.updated_at.isoformat() if task.updated_at else None
            }
            for task in tasks
        ]

@app.post("/api/v1/tasks")
async def create_task(task_data: dict):
    """Создать новую задачу"""
    async with AsyncSessionLocal() as session:
        task = Task(
            title=task_data.get("title", ""),
            description=task_data.get("description"),
            status=task_data.get("status", "TODO"),
            priority=task_data.get("priority", 1),
            assignee_id=task_data.get("assigneeId"),
            creator_id=task_data.get("creatorId", 1),
            company_id=task_data.get("companyId", 1),
            due_date=datetime.fromisoformat(task_data["dueDate"]) if task_data.get("dueDate") else None,
            tags=task_data.get("tags", []),
            story_points=task_data.get("storyPoints"),
            estimated_hours=task_data.get("estimatedHours")
        )
        
        session.add(task)
        await session.commit()
        await session.refresh(task)
        
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "assigneeId": task.assignee_id,
            "creatorId": task.creator_id,
            "companyId": task.company_id,
            "dueDate": task.due_date.isoformat() if task.due_date else None,
            "tags": task.tags or [],
            "checklist": [],
            "storyPoints": task.story_points,
            "estimatedHours": task.estimated_hours,
            "actualHours": task.actual_hours,
            "isFavorite": task.is_favorite,
            "createdAt": task.created_at.isoformat() if task.created_at else None,
            "updatedAt": task.updated_at.isoformat() if task.updated_at else None
        }

@app.put("/api/v1/tasks/{task_id}")
async def update_task(task_id: int, task_data: dict):
    """Обновить задачу"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(text(f"SELECT * FROM tasks WHERE id = {task_id}"))
        task = result.fetchone()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Обновляем поля
        update_fields = []
        for key, value in task_data.items():
            if key == "dueDate" and value:
                value = f"'{datetime.fromisoformat(value).isoformat()}'"
            elif isinstance(value, str):
                value = f"'{value}'"
            elif isinstance(value, list):
                value = f"'{str(value)}'"
            
            if key == "assigneeId":
                update_fields.append(f"assignee_id = {value}")
            elif key == "creatorId":
                update_fields.append(f"creator_id = {value}")
            elif key == "companyId":
                update_fields.append(f"company_id = {value}")
            elif key == "dueDate":
                update_fields.append(f"due_date = {value}")
            elif key == "storyPoints":
                update_fields.append(f"story_points = {value}")
            elif key == "estimatedHours":
                update_fields.append(f"estimated_hours = {value}")
            elif key == "actualHours":
                update_fields.append(f"actual_hours = {value}")
            elif key == "isFavorite":
                update_fields.append(f"is_favorite = {value}")
            else:
                update_fields.append(f"{key} = {value}")
        
        if update_fields:
            update_query = f"UPDATE tasks SET {', '.join(update_fields)}, updated_at = NOW() WHERE id = {task_id}"
            await session.execute(text(update_query))
            await session.commit()
        
        # Возвращаем обновленную задачу
        result = await session.execute(text(f"SELECT * FROM tasks WHERE id = {task_id}"))
        updated_task = result.fetchone()
        
        return {
            "id": updated_task.id,
            "title": updated_task.title,
            "description": updated_task.description,
            "status": updated_task.status,
            "priority": updated_task.priority,
            "assigneeId": updated_task.assignee_id,
            "creatorId": updated_task.creator_id,
            "companyId": updated_task.company_id,
            "dueDate": updated_task.due_date.isoformat() if updated_task.due_date else None,
            "tags": updated_task.tags or [],
            "checklist": updated_task.checklist or [],
            "storyPoints": updated_task.story_points,
            "estimatedHours": updated_task.estimated_hours,
            "actualHours": updated_task.actual_hours,
            "isFavorite": updated_task.is_favorite,
            "createdAt": updated_task.created_at.isoformat() if updated_task.created_at else None,
            "updatedAt": updated_task.updated_at.isoformat() if updated_task.updated_at else None
        }

@app.delete("/api/v1/tasks/{task_id}")
async def delete_task(task_id: int):
    """Удалить задачу"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(text(f"SELECT * FROM tasks WHERE id = {task_id}"))
        task = result.fetchone()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        await session.execute(text(f"DELETE FROM tasks WHERE id = {task_id}"))
        await session.commit()
        
        return {"message": "Task deleted successfully"}

@app.post("/api/v1/auth/login")
async def login(credentials: dict):
    """Простая аутентификация"""
    email = credentials.get("email", "")
    password = credentials.get("password", "")
    
    # Простые тестовые учетные данные
    valid_credentials = [
        {"email": "admin@example.com", "password": "admin"},
        {"email": "test@test.com", "password": "test123"},
        {"email": "user@company.com", "password": "password"},
        {"email": "demo@demo.com", "password": "demo123"}
    ]
    
    for cred in valid_credentials:
        if cred["email"] == email and cred["password"] == password:
            return {
                "access_token": f"fake-jwt-token-{email}",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": email,
                    "name": "Test User",
                    "role": "admin"
                }
            }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/v1/auth/test-credentials")
async def get_test_credentials():
    """Получить список тестовых учетных данных"""
    return {
        "message": "Тестовые учетные данные для входа:",
        "credentials": [
            {"email": "admin@example.com", "password": "admin"},
            {"email": "test@test.com", "password": "test123"},
            {"email": "user@company.com", "password": "password"},
            {"email": "demo@demo.com", "password": "demo123"}
        ]
    }

# Инициализация при запуске
@app.on_event("startup")
async def startup_event():
    print("🚀 Запуск Business Platform API с PostgreSQL...")
    await create_test_data()
    print("✅ Сервер готов к работе!")

if __name__ == "__main__":
    uvicorn.run(
        "postgresql_main:app",
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="info",
    )
