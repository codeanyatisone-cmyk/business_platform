"""
API endpoints для управления приглашениями в компанию
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import secrets

from app.core.database import get_db
from app.models import User, Company, Department, Employee, CompanyInvitation, InvitationStatus
from app.api.v1.dependencies import get_current_user_from_token

router = APIRouter()


# Pydantic models
class InvitationCreate(BaseModel):
    email: EmailStr
    company_id: int
    department_id: int | None = None
    role: str = "employee"  # employee, manager, admin
    position: str | None = None


class InvitationResponse(BaseModel):
    id: int
    email: str
    company_id: int
    company_name: str
    department_id: int | None
    department_name: str | None
    role: str
    position: str | None
    status: str
    invitation_token: str
    expires_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class InvitationAccept(BaseModel):
    invitation_token: str


@router.post("/create", response_model=InvitationResponse)
async def create_invitation(
    invitation_data: InvitationCreate,
    current_user: User = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Создать приглашение пользователя в компанию
    Только владелец компании или админ может приглашать
    """
    try:
        # Проверяем, что компания существует
        result = await db.execute(
            select(Company).where(Company.id == invitation_data.company_id)
        )
        company = result.scalar_one_or_none()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        # Проверяем права доступа (владелец или админ компании)
        if company.owner_id != current_user.id:
            # Проверяем, является ли пользователь админом компании
            result = await db.execute(
                select(Employee).where(
                    and_(
                        Employee.user_id == current_user.id,
                        Employee.company_id == invitation_data.company_id,
                        Employee.role == "admin"
                    )
                )
            )
            employee = result.scalar_one_or_none()
            
            if not employee:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only company owner or admin can invite users"
                )
        
        # Проверяем, что отдел существует (если указан)
        department = None
        if invitation_data.department_id:
            result = await db.execute(
                select(Department).where(
                    and_(
                        Department.id == invitation_data.department_id,
                        Department.company_id == invitation_data.company_id
                    )
                )
            )
            department = result.scalar_one_or_none()
            
            if not department:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Department not found"
                )
        
        # Проверяем, нет ли уже активного приглашения для этого email
        result = await db.execute(
            select(CompanyInvitation).where(
                and_(
                    CompanyInvitation.email == invitation_data.email,
                    CompanyInvitation.company_id == invitation_data.company_id,
                    CompanyInvitation.status == InvitationStatus.PENDING
                )
            )
        )
        existing_invitation = result.scalar_one_or_none()
        
        if existing_invitation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Active invitation already exists for this email"
            )
        
        # Проверяем, не является ли пользователь уже сотрудником
        result = await db.execute(
            select(Employee).where(
                and_(
                    Employee.email == invitation_data.email,
                    Employee.company_id == invitation_data.company_id
                )
            )
        )
        existing_employee = result.scalar_one_or_none()
        
        if existing_employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already an employee of this company"
            )
        
        # Создаем приглашение
        invitation_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(days=7)  # Приглашение действует 7 дней
        
        invitation = CompanyInvitation(
            email=invitation_data.email,
            company_id=invitation_data.company_id,
            department_id=invitation_data.department_id,
            invited_by_id=current_user.id,
            role=invitation_data.role,
            position=invitation_data.position,
            invitation_token=invitation_token,
            expires_at=expires_at,
            status=InvitationStatus.PENDING
        )
        
        db.add(invitation)
        await db.commit()
        await db.refresh(invitation)
        
        return InvitationResponse(
            id=invitation.id,
            email=invitation.email,
            company_id=invitation.company_id,
            company_name=company.name,
            department_id=invitation.department_id,
            department_name=department.name if department else None,
            role=invitation.role,
            position=invitation.position,
            status=invitation.status.value,
            invitation_token=invitation.invitation_token,
            expires_at=invitation.expires_at,
            created_at=invitation.created_at
        )
    
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating invitation: {str(e)}"
        )


@router.get("/my-invitations", response_model=List[InvitationResponse])
async def get_my_invitations(
    current_user: User = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Получить все приглашения для текущего пользователя"""
    try:
        result = await db.execute(
            select(CompanyInvitation, Company, Department).
            join(Company, CompanyInvitation.company_id == Company.id).
            outerjoin(Department, CompanyInvitation.department_id == Department.id).
            where(
                and_(
                    CompanyInvitation.email == current_user.email,
                    CompanyInvitation.status == InvitationStatus.PENDING,
                    CompanyInvitation.expires_at > datetime.utcnow()
                )
            )
        )
        
        invitations = []
        for invitation, company, department in result:
            invitations.append(InvitationResponse(
                id=invitation.id,
                email=invitation.email,
                company_id=invitation.company_id,
                company_name=company.name,
                department_id=invitation.department_id,
                department_name=department.name if department else None,
                role=invitation.role,
                position=invitation.position,
                status=invitation.status.value,
                invitation_token=invitation.invitation_token,
                expires_at=invitation.expires_at,
                created_at=invitation.created_at
            ))
        
        return invitations
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching invitations: {str(e)}"
        )


@router.post("/accept")
async def accept_invitation(
    accept_data: InvitationAccept,
    current_user: User = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Принять приглашение в компанию"""
    try:
        # Находим приглашение
        result = await db.execute(
            select(CompanyInvitation).where(
                CompanyInvitation.invitation_token == accept_data.invitation_token
            )
        )
        invitation = result.scalar_one_or_none()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found"
            )
        
        # Проверяем, что приглашение для текущего пользователя
        if invitation.email != current_user.email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This invitation is not for you"
            )
        
        # Проверяем статус и срок действия
        if invitation.status != InvitationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invitation is {invitation.status.value}"
            )
        
        if invitation.expires_at < datetime.utcnow():
            invitation.status = InvitationStatus.EXPIRED
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has expired"
            )
        
        # Проверяем, не является ли пользователь уже сотрудником
        result = await db.execute(
            select(Employee).where(
                and_(
                    Employee.user_id == current_user.id,
                    Employee.company_id == invitation.company_id
                )
            )
        )
        existing_employee = result.scalar_one_or_none()
        
        if existing_employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already an employee of this company"
            )
        
        # Создаем запись сотрудника
        employee = Employee(
            user_id=current_user.id,
            company_id=invitation.company_id,
            department_id=invitation.department_id,
            first_name=current_user.username,  # Можно будет обновить позже
            last_name="",
            email=current_user.email,
            position=invitation.position,
            role=invitation.role,
            is_active=True
        )
        
        db.add(employee)
        
        # Обновляем статус приглашения
        invitation.status = InvitationStatus.ACCEPTED
        invitation.user_id = current_user.id
        invitation.accepted_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(employee)
        
        return {
            "success": True,
            "message": "Invitation accepted successfully",
            "employee_id": employee.id,
            "company_id": employee.company_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accepting invitation: {str(e)}"
        )


@router.post("/decline/{invitation_id}")
async def decline_invitation(
    invitation_id: int,
    current_user: User = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Отклонить приглашение"""
    try:
        result = await db.execute(
            select(CompanyInvitation).where(CompanyInvitation.id == invitation_id)
        )
        invitation = result.scalar_one_or_none()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found"
            )
        
        if invitation.email != current_user.email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This invitation is not for you"
            )
        
        invitation.status = InvitationStatus.DECLINED
        await db.commit()
        
        return {
            "success": True,
            "message": "Invitation declined"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error declining invitation: {str(e)}"
        )


@router.get("/company/{company_id}/invitations", response_model=List[InvitationResponse])
async def get_company_invitations(
    company_id: int,
    current_user: User = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Получить все приглашения компании (только для владельца/админа)"""
    try:
        # Проверяем права доступа
        result = await db.execute(
            select(Company).where(Company.id == company_id)
        )
        company = result.scalar_one_or_none()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        if company.owner_id != current_user.id:
            # Проверяем, является ли админом
            result = await db.execute(
                select(Employee).where(
                    and_(
                        Employee.user_id == current_user.id,
                        Employee.company_id == company_id,
                        Employee.role == "admin"
                    )
                )
            )
            employee = result.scalar_one_or_none()
            
            if not employee:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Получаем приглашения
        result = await db.execute(
            select(CompanyInvitation, Department).
            outerjoin(Department, CompanyInvitation.department_id == Department.id).
            where(CompanyInvitation.company_id == company_id).
            order_by(CompanyInvitation.created_at.desc())
        )
        
        invitations = []
        for invitation, department in result:
            invitations.append(InvitationResponse(
                id=invitation.id,
                email=invitation.email,
                company_id=invitation.company_id,
                company_name=company.name,
                department_id=invitation.department_id,
                department_name=department.name if department else None,
                role=invitation.role,
                position=invitation.position,
                status=invitation.status.value,
                invitation_token=invitation.invitation_token,
                expires_at=invitation.expires_at,
                created_at=invitation.created_at
            ))
        
        return invitations
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching company invitations: {str(e)}"
        )


