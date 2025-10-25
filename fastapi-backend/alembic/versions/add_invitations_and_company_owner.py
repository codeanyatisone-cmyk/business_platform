"""add invitations and company owner

Revision ID: add_invitations
Revises: b972e156a182
Create Date: 2025-10-24 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_invitations'
down_revision = 'b972e156a182'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавляем поле role в employees
    op.add_column('employees', sa.Column('role', sa.String(50), server_default='employee'))
    
    # Добавляем поле owner_id в companies (nullable сначала)
    op.add_column('companies', sa.Column('owner_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_companies_owner_id', 'companies', 'users', ['owner_id'], ['id'])
    
    # Создаем таблицу приглашений
    op.create_table(
        'company_invitations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('department_id', sa.Integer(), nullable=True),
        sa.Column('invited_by_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('role', sa.String(50), server_default='employee'),
        sa.Column('position', sa.String(255), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', name='invitationstatus'), nullable=False, server_default='PENDING'),
        sa.Column('invitation_token', sa.String(255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ),
        sa.ForeignKeyConstraint(['invited_by_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], )
    )
    
    op.create_index('ix_company_invitations_email', 'company_invitations', ['email'])
    op.create_index('ix_company_invitations_invitation_token', 'company_invitations', ['invitation_token'], unique=True)


def downgrade() -> None:
    # Удаляем индексы
    op.drop_index('ix_company_invitations_invitation_token', table_name='company_invitations')
    op.drop_index('ix_company_invitations_email', table_name='company_invitations')
    
    # Удаляем таблицу приглашений
    op.drop_table('company_invitations')
    
    # Удаляем enum
    op.execute('DROP TYPE invitationstatus')
    
    # Удаляем поле owner_id из companies
    op.drop_constraint('fk_companies_owner_id', 'companies', type_='foreignkey')
    op.drop_column('companies', 'owner_id')
    
    # Удаляем поле role из employees
    op.drop_column('employees', 'role')


