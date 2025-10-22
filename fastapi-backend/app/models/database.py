"""
Модели данных для Business Platform
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Company(Base):
    """Модель компании"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    email = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    employees = relationship("Employee", back_populates="company")
    departments = relationship("Department", back_populates="company")
    tasks = relationship("Task", back_populates="company")
    passwords = relationship("Password", back_populates="company")


class Department(Base):
    """Модель отдела"""
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    company_id = Column(Integer, ForeignKey("companies.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="departments")
    employees = relationship("Employee", back_populates="department", primaryjoin="Department.id==Employee.department_id")


class Employee(Base):
    """Модель сотрудника"""
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True)
    position = Column(String(100))
    phone = Column(String(20))
    avatar = Column(String(500))
    company_id = Column(Integer, ForeignKey("companies.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="employees")
    department = relationship("Department", back_populates="employees")
    created_tasks = relationship("Task", foreign_keys="Task.creator_id", back_populates="creator")
    assigned_tasks = relationship("Task", foreign_keys="Task.assignee_id", back_populates="assignee")


class Task(Base):
    """Модель задачи"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="new")  # new, in_progress, review, completed, cancelled
    priority = Column(Integer, default=1)  # 1-3 (low, medium, high)
    assignee_id = Column(Integer, ForeignKey("employees.id"))
    creator_id = Column(Integer, ForeignKey("employees.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    due_date = Column(DateTime(timezone=True))
    tags = Column(JSON)  # Список тегов
    checklist = Column(JSON)  # Чеклист задач
    story_points = Column(Integer)
    estimated_hours = Column(Float)
    actual_hours = Column(Float)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="tasks")
    assignee = relationship("Employee", foreign_keys=[assignee_id], back_populates="assigned_tasks")
    creator = relationship("Employee", foreign_keys=[creator_id], back_populates="created_tasks")


class PasswordCategory(Base):
    """Модель категории паролей"""
    __tablename__ = "password_categories"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(100))
    is_personal = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    passwords = relationship("Password", back_populates="category")


class Password(Base):
    """Модель пароля"""
    __tablename__ = "passwords"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    url = Column(String(500))
    login = Column(String(255), nullable=False)
    password = Column(String(500), nullable=False)  # Зашифрованный пароль
    category_id = Column(String(50), ForeignKey("password_categories.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    shared_with = Column(JSON)  # Список пользователей с доступом
    is_personal = Column(Boolean, default=False)
    updated_by = Column(String(100))
    active_users = Column(Integer, default=1)
    deleted_count = Column(Integer, default=0)
    has_warning = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)  # Новое поле для архивирования
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="passwords")
    category = relationship("PasswordCategory", back_populates="passwords")


class NewsItem(Base):
    """Модель новости"""
    __tablename__ = "news"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)
    category = Column(String(100))
    image = Column(String(500))
    likes = Column(Integer, default=0)
    comments = Column(JSON)  # Список комментариев
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Transaction(Base):
    """Модель транзакции"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    type = Column(String(50), nullable=False)  # income, expense, transfer
    description = Column(Text)
    category = Column(String(100))
    account_id = Column(Integer, ForeignKey("accounts.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    account = relationship("Account", back_populates="transactions")


class Account(Base):
    """Модель счета"""
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # bank, cash, credit
    balance = Column(Float, default=0.0)
    currency = Column(String(3), default="USD")
    company_id = Column(Integer, ForeignKey("companies.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    transactions = relationship("Transaction", back_populates="account")
