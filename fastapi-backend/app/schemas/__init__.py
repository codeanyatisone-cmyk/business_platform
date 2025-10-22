"""
Pydantic схемы для валидации данных
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enum для статусов задач
class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
    CANCELLED = "cancelled"


# Enum для приоритетов задач
class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


# Enum для ролей пользователей
class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    VIEWER = "viewer"


# Enum для типов транзакций
class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


# Enum для статусов курсов
class CourseStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# === Аутентификация ===
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.EMPLOYEE


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int


# === Компании ===
class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    website: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    logo_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Отделы ===
class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    company_id: int
    parent_id: Optional[int] = None
    manager_id: Optional[int] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    manager_id: Optional[int] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    company_id: int
    parent_id: Optional[int]
    manager_id: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Сотрудники ===
class EmployeeCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    company_id: int
    department_id: Optional[int] = None
    birth_date: Optional[datetime] = None
    hire_date: Optional[datetime] = None
    salary: Optional[float] = None


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department_id: Optional[int] = None
    birth_date: Optional[datetime] = None
    hire_date: Optional[datetime] = None
    salary: Optional[float] = None


class EmployeeResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    middle_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    position: Optional[str]
    avatar_url: Optional[str]
    birth_date: Optional[datetime]
    hire_date: Optional[datetime]
    salary: Optional[float]
    is_active: bool
    company_id: int
    department_id: Optional[int]
    user_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Задачи ===
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    estimated_hours: Optional[float] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    checklist: Optional[List[dict]] = None
    company_id: int
    assignee_id: Optional[int] = None
    sprint_id: Optional[int] = None
    epic_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    estimated_hours: Optional[float] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    checklist: Optional[List[dict]] = None
    assignee_id: Optional[int] = None
    sprint_id: Optional[int] = None
    epic_id: Optional[int] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    estimated_hours: Optional[float]
    actual_hours: Optional[float]
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    tags: Optional[List[str]]
    checklist: Optional[List[dict]]
    is_favorite: bool
    is_archived: bool
    company_id: int
    creator_id: int
    assignee_id: Optional[int]
    sprint_id: Optional[int]
    epic_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Спринты ===
class SprintCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    goal: Optional[str] = None
    company_id: int


class SprintUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    goal: Optional[str] = None
    is_active: Optional[bool] = None
    is_completed: Optional[bool] = None


class SprintResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    goal: Optional[str]
    is_active: bool
    is_completed: bool
    company_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Эпики ===
class EpicCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    company_id: int


class EpicUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")


class EpicResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    color: Optional[str]
    company_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Финансы ===
class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    transaction_type: TransactionType
    category: Optional[str] = None
    reference: Optional[str] = None
    company_id: int
    account_id: Optional[int] = None


class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    transaction_type: Optional[TransactionType] = None
    category: Optional[str] = None
    reference: Optional[str] = None
    account_id: Optional[int] = None


class TransactionResponse(BaseModel):
    id: int
    amount: float
    description: Optional[str]
    transaction_type: TransactionType
    category: Optional[str]
    reference: Optional[str]
    company_id: int
    account_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Новости ===
class NewsCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    summary: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    company_id: int


class NewsUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_published: Optional[bool] = None


class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    summary: Optional[str]
    category: Optional[str]
    image_url: Optional[str]
    is_published: bool
    likes_count: int
    views_count: int
    company_id: int
    author_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Курсы ===
class CourseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    status: CourseStatus = CourseStatus.DRAFT
    duration_hours: Optional[float] = None
    image_url: Optional[str] = None
    company_id: int
    instructor_id: Optional[int] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[CourseStatus] = None
    duration_hours: Optional[float] = None
    image_url: Optional[str] = None
    instructor_id: Optional[int] = None


class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    status: CourseStatus
    duration_hours: Optional[float]
    image_url: Optional[str]
    company_id: int
    instructor_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
