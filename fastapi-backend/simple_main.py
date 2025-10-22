"""
Simple FastAPI Backend for Business Platform
Minimal version without complex dependencies
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from datetime import datetime
from typing import List, Dict, Any
import json

# Create FastAPI app
app = FastAPI(
    title="Business Platform API",
    description="Simple FastAPI Backend for Business Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
mock_companies = [
    {
        "id": 1,
        "name": "Компания 1",
        "description": "Основная компания",
        "email": "info@company1.com",
        "is_active": True,
        "created_at": "2024-01-01T00:00:00Z"
    },
    {
        "id": 2,
        "name": "Компания 2", 
        "description": "Дочерняя компания",
        "email": "info@company2.com",
        "is_active": True,
        "created_at": "2024-01-02T00:00:00Z"
    }
]

mock_employees = [
    {
        "id": 1,
        "first_name": "Иван",
        "last_name": "Иванов",
        "email": "ivan@company1.com",
        "position": "Разработчик",
        "company_id": 1,
        "is_active": True
    },
    {
        "id": 2,
        "first_name": "Петр",
        "last_name": "Петров", 
        "email": "petr@company1.com",
        "position": "Дизайнер",
        "company_id": 1,
        "is_active": True
    }
]

mock_tasks = [
    {
        "id": 1,
        "title": "Создать API для досок",
        "description": "Разработать REST API для управления досками",
        "status": "in_progress",
        "priority": "high",
        "assignee_id": 1,
        "company_id": 1,
        "created_at": "2024-01-01T00:00:00Z"
    },
    {
        "id": 2,
        "title": "Настроить Axios",
        "description": "Настроить HTTP клиент для работы с API",
        "status": "todo",
        "priority": "medium",
        "assignee_id": 2,
        "company_id": 1,
        "created_at": "2024-01-02T00:00:00Z"
    }
]

mock_boards = [
    {
        "id": 1,
        "name": "Основная доска",
        "description": "Главная доска для управления проектами",
        "color": "#3B82F6",
        "is_default": True,
        "is_archived": False,
        "company_id": 1,
        "tasks": []
    },
    {
        "id": 2,
        "name": "Разработка",
        "description": "Доска для задач разработки",
        "color": "#10B981",
        "is_default": False,
        "is_archived": False,
        "company_id": 1,
        "tasks": []
    }
]

# Password management data
mock_password_categories = [
    {"id": "personal", "name": "Личные", "isPersonal": True},
    {"id": "shared", "name": "Доступные мне", "isPersonal": False},
    {"id": "projects", "name": "Проекты", "isPersonal": False},
    {"id": "accounting", "name": "Бухгалтерия", "isPersonal": False},
    {"id": "hr", "name": "HR отдел", "isPersonal": False},
    {"id": "sales", "name": "Отдел продаж", "isPersonal": False},
    {"id": "services", "name": "Отдел исполнения услуг", "isPersonal": False},
    {"id": "owners", "name": "Для Владельцев", "isPersonal": False},
]

mock_passwords = [
    {
        "id": 1,
        "name": "GitLab",
        "description": "Сервис системы контроля версий и облачного хранилища",
        "url": "gitlab.com",
        "login": "aioncorporation@gitlab.com",
        "password": "encrypted_password_123",
        "category": "Sacruna",
        "categoryId": "shared",
        "sharedWith": ["5 активных"],
        "isPersonal": False,
        "updatedBy": "Кирилл Коростелев",
        "updatedAt": "2024-10-03T00:00:00Z",
        "activeUsers": 5,
        "company_id": 1
    },
    {
        "id": 2,
        "name": "Корпоративная почта",
        "description": "На эту почту регистрируем сервисы",
        "url": "outlook.live.com",
        "login": "aioncorporation@outlook.com",
        "password": "encrypted_password_456",
        "category": "Для Владельцев",
        "categoryId": "owners",
        "sharedWith": ["3 активных"],
        "isPersonal": False,
        "updatedBy": "Кирилл Коростелев",
        "updatedAt": "2024-10-03T00:00:00Z",
        "activeUsers": 3,
        "company_id": 1
    },
    {
        "id": 3,
        "name": "Личный GitHub",
        "description": "Личный аккаунт GitHub",
        "url": "github.com",
        "login": "user@github.com",
        "password": "encrypted_password_789",
        "category": "Личные",
        "categoryId": "personal",
        "sharedWith": [],
        "isPersonal": True,
        "updatedBy": "Текущий пользователь",
        "updatedAt": "2024-10-01T00:00:00Z",
        "activeUsers": 1,
        "company_id": 1
    }
]

# Root endpoint
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Business Platform API</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; }
            .links { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px; }
            .link-card { padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px; text-decoration: none; color: #2c3e50; transition: all 0.2s; }
            .link-card:hover { border-color: #3498db; box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1); }
            .status { display: inline-block; padding: 4px 8px; background: #27ae60; color: white; border-radius: 4px; font-size: 12px; margin-left: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏢 Business Platform API <span class="status">ONLINE</span></h1>
            <p>Simple FastAPI Backend with Mock Data</p>
            
            <div class="links">
                <a href="/api/docs" class="link-card">
                    <div><strong>📚 API Documentation</strong></div>
                    <div>Swagger UI for testing API</div>
                </a>
                
                <a href="/api/v1/test" class="link-card">
                    <div><strong>🧪 Test Endpoint</strong></div>
                    <div>Test API connection</div>
                </a>
                
                <a href="/api/v1/companies" class="link-card">
                    <div><strong>🏢 Companies</strong></div>
                    <div>List companies</div>
                </a>
                
                <a href="/api/v1/tasks" class="link-card">
                    <div><strong>📋 Tasks</strong></div>
                    <div>List tasks</div>
                </a>
            </div>
        </div>
    </body>
    </html>
    """

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Business Platform API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# Test endpoint
@app.get("/api/v1/test")
async def test_connection():
    return {
        "status": "success",
        "message": "FastAPI Backend подключен успешно!",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "service": "Business Platform API"
    }

# Companies endpoints
@app.get("/api/v1/companies")
async def get_companies():
    return mock_companies

@app.get("/api/v1/companies/{company_id}")
async def get_company(company_id: int):
    company = next((c for c in mock_companies if c["id"] == company_id), None)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@app.post("/api/v1/companies")
async def create_company(company: dict):
    new_id = max([c["id"] for c in mock_companies]) + 1
    company["id"] = new_id
    company["created_at"] = datetime.utcnow().isoformat()
    mock_companies.append(company)
    return company

# Employees endpoints
@app.get("/api/v1/employees")
async def get_employees():
    return mock_employees

@app.get("/api/v1/employees/{employee_id}")
async def get_employee(employee_id: int):
    employee = next((e for e in mock_employees if e["id"] == employee_id), None)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

# Tasks endpoints
@app.get("/api/v1/tasks")
async def get_tasks():
    return mock_tasks

@app.get("/api/v1/tasks/{task_id}")
async def get_task(task_id: int):
    task = next((t for t in mock_tasks if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.post("/api/v1/tasks")
async def create_task(task: dict):
    new_id = max([t["id"] for t in mock_tasks]) + 1
    task["id"] = new_id
    task["created_at"] = datetime.utcnow().isoformat()
    mock_tasks.append(task)
    return task

# Boards endpoints
@app.get("/api/v1/boards")
async def get_boards():
    return mock_boards

@app.get("/api/v1/boards/{board_id}")
async def get_board(board_id: int):
    board = next((b for b in mock_boards if b["id"] == board_id), None)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board

@app.post("/api/v1/boards")
async def create_board(board: dict):
    new_id = max([b["id"] for b in mock_boards]) + 1
    board["id"] = new_id
    board["created_at"] = datetime.utcnow().isoformat()
    mock_boards.append(board)
    return board

# Password Categories endpoints
@app.get("/api/v1/password-categories")
async def get_password_categories():
    return mock_password_categories

@app.post("/api/v1/password-categories")
async def create_password_category(category: dict):
    new_id = category.get("id", f"category_{len(mock_password_categories) + 1}")
    category["id"] = new_id
    mock_password_categories.append(category)
    return category

# Passwords endpoints
@app.get("/api/v1/passwords")
async def get_passwords():
    return mock_passwords

@app.get("/api/v1/passwords/{password_id}")
async def get_password(password_id: int):
    password = next((p for p in mock_passwords if p["id"] == password_id), None)
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")
    return password

@app.post("/api/v1/passwords")
async def create_password(password: dict):
    new_id = max([p["id"] for p in mock_passwords]) + 1
    password["id"] = new_id
    password["updatedAt"] = datetime.utcnow().isoformat()
    password["updatedBy"] = "Текущий пользователь"
    password["company_id"] = password.get("company_id", 1)
    mock_passwords.append(password)
    return password

@app.put("/api/v1/passwords/{password_id}")
async def update_password(password_id: int, password: dict):
    existing_password = next((p for p in mock_passwords if p["id"] == password_id), None)
    if not existing_password:
        raise HTTPException(status_code=404, detail="Password not found")
    
    # Update the password
    for key, value in password.items():
        existing_password[key] = value
    
    existing_password["updatedAt"] = datetime.utcnow().isoformat()
    existing_password["updatedBy"] = "Текущий пользователь"
    
    return existing_password

@app.delete("/api/v1/passwords/{password_id}")
async def delete_password(password_id: int):
    global mock_passwords
    password = next((p for p in mock_passwords if p["id"] == password_id), None)
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")
    
    mock_passwords = [p for p in mock_passwords if p["id"] != password_id]
    return {"message": "Password deleted successfully"}

@app.get("/api/v1/passwords/category/{category_id}")
async def get_passwords_by_category(category_id: str):
    filtered_passwords = [p for p in mock_passwords if p["categoryId"] == category_id]
    return filtered_passwords

# Auth endpoints (simple mock)
@app.post("/api/v1/auth/login")
async def login(credentials: dict):
    email = credentials.get("email", "").lower()
    password = credentials.get("password", "")
    
    # Accept multiple test credentials for easier testing
    valid_credentials = [
        ("admin@example.com", "admin"),
        ("test@test.com", "test123"),
        ("user@company.com", "password"),
        ("demo@demo.com", "demo123")
    ]
    
    for valid_email, valid_password in valid_credentials:
        if email == valid_email and password == valid_password:
            return {
                "access_token": "mock-jwt-token-" + str(int(datetime.utcnow().timestamp())),
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": email,
                    "name": "Test User" if email != "admin@example.com" else "Administrator",
                    "role": "admin" if email == "admin@example.com" else "user"
                }
            }
    
    # If no valid credentials found
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/v1/auth/me")
async def get_current_user():
    return {
        "id": 1,
        "email": "admin@example.com",
        "name": "Administrator",
        "role": "admin"
    }

@app.get("/api/v1/auth/test-credentials")
async def get_test_credentials():
    """Get available test credentials for development"""
    return {
        "message": "Available test credentials for development:",
        "credentials": [
            {"email": "admin@example.com", "password": "admin", "role": "admin"},
            {"email": "test@test.com", "password": "test123", "role": "user"},
            {"email": "user@company.com", "password": "password", "role": "user"},
            {"email": "demo@demo.com", "password": "demo123", "role": "user"}
        ],
        "note": "Use any of these credentials to test the login functionality"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
