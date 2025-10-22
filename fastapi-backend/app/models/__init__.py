"""
Модели данных для Business Platform
Основаны на архитектуре системы управления задачами
"""

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, 
    ForeignKey, Enum, Float, JSON, Table
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from enum import Enum as PyEnum
from app.core.database import Base


# Enum для статусов задач
class TaskStatus(PyEnum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
    CANCELLED = "cancelled"


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


# Enum для типов транзакций
class TransactionType(PyEnum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


# Enum для статусов курсов
class CourseStatus(PyEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# Связующая таблица для многие-ко-многим между задачами и наблюдателями
task_watchers = Table(
    'task_watchers',
    Base.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id'), primary_key=True),
    Column('employee_id', Integer, ForeignKey('employees.id'), primary_key=True),
)


# Связующая таблица для зависимостей задач
task_dependencies = Table(
    'task_dependencies',
    Base.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id'), primary_key=True),
    Column('depends_on_task_id', Integer, ForeignKey('tasks.id'), primary_key=True),
)


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
    sprints = relationship("Sprint", back_populates="company", cascade="all, delete-orphan")
    epics = relationship("Epic", back_populates="company", cascade="all, delete-orphan")


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
    watched_tasks = relationship("Task", secondary=task_watchers, back_populates="watchers")


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
    sprint_id = Column(Integer, ForeignKey("sprints.id"))
    epic_id = Column(Integer, ForeignKey("epics.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="tasks")
    creator = relationship("Employee", foreign_keys=[creator_id], back_populates="created_tasks")
    assignee = relationship("Employee", foreign_keys=[assignee_id], back_populates="assigned_tasks")
    sprint = relationship("Sprint", back_populates="tasks")
    epic = relationship("Epic", back_populates="tasks")
    watchers = relationship("Employee", secondary=task_watchers, back_populates="watched_tasks")
    dependencies = relationship("Task", secondary=task_dependencies, 
                               primaryjoin=id == task_dependencies.c.task_id,
                               secondaryjoin=id == task_dependencies.c.depends_on_task_id)
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")
    time_logs = relationship("TimeLog", back_populates="task", cascade="all, delete-orphan")


class Sprint(Base):
    """Модель спринта"""
    __tablename__ = "sprints"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    goal = Column(Text)
    is_active = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    
    # Внешние ключи
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="sprints")
    tasks = relationship("Task", back_populates="sprint")


class Epic(Base):
    """Модель эпика"""
    __tablename__ = "epics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    color = Column(String(7))  # HEX цвет
    
    # Внешние ключи
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="epics")
    tasks = relationship("Task", back_populates="epic")


class TaskComment(Base):
    """Модель комментария к задаче"""
    __tablename__ = "task_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    
    # Внешние ключи
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    task = relationship("Task", back_populates="comments")
    author = relationship("Employee")


class TimeLog(Base):
    """Модель учета времени"""
    __tablename__ = "time_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text)
    hours = Column(Float, nullable=False)
    logged_date = Column(DateTime(timezone=True), nullable=False)
    
    # Внешние ключи
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    task = relationship("Task", back_populates="time_logs")
    employee = relationship("Employee")


class Transaction(Base):
    """Модель финансовой транзакции"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(Text)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    category = Column(String(100))
    reference = Column(String(255))
    
    # Внешние ключи
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company")
    account = relationship("Account", back_populates="transactions")


class Account(Base):
    """Модель финансового счета"""
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    account_type = Column(String(100))  # bank, cash, credit, etc.
    balance = Column(Float, default=0)
    currency = Column(String(3), default="USD")
    is_active = Column(Boolean, default=True)
    
    # Внешние ключи
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company")
    transactions = relationship("Transaction", back_populates="account")


class NewsItem(Base):
    """Модель новости"""
    __tablename__ = "news"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    summary = Column(Text)
    category = Column(String(100))
    image_url = Column(String(500))
    is_published = Column(Boolean, default=True)
    likes_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    
    # Внешние ключи
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company")
    author = relationship("Employee")
    comments = relationship("NewsComment", back_populates="news", cascade="all, delete-orphan")


class NewsComment(Base):
    """Модель комментария к новости"""
    __tablename__ = "news_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    
    # Внешние ключи
    news_id = Column(Integer, ForeignKey("news.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    news = relationship("NewsItem", back_populates="comments")
    author = relationship("Employee")


class Course(Base):
    """Модель курса"""
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    category = Column(String(100))
    status = Column(Enum(CourseStatus), default=CourseStatus.DRAFT)
    duration_hours = Column(Float)
    image_url = Column(String(500))
    
    # Внешние ключи
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    instructor_id = Column(Integer, ForeignKey("employees.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company")
    instructor = relationship("Employee")
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")


class Lesson(Base):
    """Модель урока"""
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    order = Column(Integer, default=0)
    duration_minutes = Column(Integer)
    video_url = Column(String(500))
    
    # Внешние ключи
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    course = relationship("Course", back_populates="lessons")
