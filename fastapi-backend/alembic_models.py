"""
Модели данных для Business Platform - Alembic версия
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from enum import Enum as PyEnum

# Создаем базовый класс
Base = declarative_base()

# Enum для статусов задач
class TaskStatus(PyEnum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    IN_REVIEW = "IN_REVIEW"
    DONE = "DONE"
    CANCELLED = "CANCELLED"

# Enum для приоритетов задач
class TaskPriority(PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Enum для ролей пользователей
class UserRole(PyEnum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    VIEWER = "viewer"

class Company(Base):
    """Модель компании"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    website = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    logo_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    departments = relationship("Department", back_populates="company", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="company", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="company", cascade="all, delete-orphan")

class Department(Base):
    """Модель отдела"""
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("departments.id"))
    manager_id = Column(Integer, ForeignKey("employees.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="departments")
    parent = relationship("Department", remote_side=[id])
    children = relationship("Department", back_populates="parent")
    manager = relationship("Employee", foreign_keys=[manager_id])
    employees = relationship("Employee", back_populates="department")

class User(Base):
    """Модель пользователя системы"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    employee = relationship("Employee", back_populates="user", uselist=False)

class Employee(Base):
    """Модель сотрудника"""
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    middle_name = Column(String(100))
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(50))
    position = Column(String(255))
    avatar_url = Column(String(500))
    birth_date = Column(DateTime(timezone=True))
    hire_date = Column(DateTime(timezone=True))
    salary = Column(Float)
    is_active = Column(Boolean, default=True)
    
    # Внешние ключи
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="employees")
    department = relationship("Department", back_populates="employees")
    user = relationship("User", back_populates="employee")
    
    # Задачи
    created_tasks = relationship("Task", foreign_keys="Task.creator_id", back_populates="creator")
    assigned_tasks = relationship("Task", foreign_keys="Task.assignee_id", back_populates="assignee")

class Task(Base):
    """Модель задачи"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    estimated_hours = Column(Float)
    actual_hours = Column(Float, default=0)
    due_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    tags = Column(JSON)  # Массив тегов
    checklist = Column(JSON)  # Массив пунктов чек-листа
    is_favorite = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    
    # Внешние ключи
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    creator_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("employees.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="tasks")
    creator = relationship("Employee", foreign_keys=[creator_id], back_populates="created_tasks")
    assignee = relationship("Employee", foreign_keys=[assignee_id], back_populates="assigned_tasks")

class PasswordCategory(Base):
    """Модель категории паролей"""
    __tablename__ = "password_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_personal = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Password(Base):
    """Модель пароля"""
    __tablename__ = "passwords"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    url = Column(String(500))
    login = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("password_categories.id"))
    is_personal = Column(Boolean, default=True)
    shared_with = Column(JSON)  # Массив пользователей
    active_users = Column(Integer, default=1)
    updated_by = Column(String(255))
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    # Связи
    category = relationship("PasswordCategory")
    company = relationship("Company")
