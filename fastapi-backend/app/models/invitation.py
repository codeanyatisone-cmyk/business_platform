"""
Модель приглашений в компанию
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from app.core.database import Base


class InvitationStatus(PyEnum):
    """Статусы приглашения"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


class CompanyInvitation(Base):
    """Модель приглашения пользователя в компанию"""
    __tablename__ = "company_invitations"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    invited_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Заполняется после принятия
    
    # Роль в компании
    role = Column(String(50), default="employee")  # employee, manager, admin
    position = Column(String(255))  # Должность
    
    # Статус приглашения
    status = Column(SQLEnum(InvitationStatus), default=InvitationStatus.PENDING)
    
    # Токен для приглашения
    invitation_token = Column(String(255), unique=True, index=True)
    
    # Даты
    expires_at = Column(DateTime(timezone=True))
    accepted_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    company = relationship("Company", back_populates="invitations")
    department = relationship("Department")
    invited_by = relationship("User", foreign_keys=[invited_by_id])
    user = relationship("User", foreign_keys=[user_id])


