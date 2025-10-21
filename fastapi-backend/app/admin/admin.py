"""
Настройка админ панели SQLAdmin (совместимо с SQLAlchemy)
"""

from fastapi import FastAPI
from sqladmin import Admin, ModelView

from app.core.database import engine
from app.models import (
    User,
    Employee,
    Company,
    Department,
    Task,
)


class UserAdmin(ModelView, model=User):
    name = "Пользователи"
    name_plural = "Пользователи"
    icon = "fa-solid fa-user"
    column_list = [User.id, User.email, User.username, User.role, User.is_active, User.created_at]
    column_searchable_list = [User.email, User.username]


class CompanyAdmin(ModelView, model=Company):
    name = "Компании"
    name_plural = "Компании"
    icon = "fa-solid fa-building"
    column_list = [Company.id, Company.name, Company.email, Company.is_active, Company.created_at]
    column_searchable_list = [Company.name, Company.email]


class DepartmentAdmin(ModelView, model=Department):
    name = "Отделы"
    name_plural = "Отделы"
    icon = "fa-solid fa-sitemap"
    column_list = [Department.id, Department.name, Department.company_id, Department.is_active, Department.created_at]
    column_searchable_list = [Department.name]


class EmployeeAdmin(ModelView, model=Employee):
    name = "Сотрудники"
    name_plural = "Сотрудники"
    icon = "fa-solid fa-user-tie"
    column_list = [
        Employee.id,
        Employee.first_name,
        Employee.last_name,
        Employee.position,
        Employee.company_id,
        Employee.is_active,
    ]
    column_searchable_list = [Employee.first_name, Employee.last_name, Employee.email]


class TaskAdmin(ModelView, model=Task):
    name = "Задачи"
    name_plural = "Задачи"
    icon = "fa-solid fa-list-check"
    column_list = [
        Task.id,
        Task.title,
        Task.status,
        Task.priority,
        Task.assignee_id,
        Task.company_id,
        Task.created_at,
    ]
    column_searchable_list = [Task.title]


async def setup_admin(app: FastAPI):
    """Инициализация SQLAdmin на /admin"""
    admin = Admin(app, engine)
    admin.add_view(UserAdmin)
    admin.add_view(CompanyAdmin)
    admin.add_view(DepartmentAdmin)
    admin.add_view(EmployeeAdmin)
    admin.add_view(TaskAdmin)
    # SQLAdmin автоматически вешает маршруты под /admin
    print("✅ SQLAdmin configured at /admin")
