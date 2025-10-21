"""Add password management tables

Revision ID: 5bdf2a89362e
Revises: 
Create Date: 2025-10-20 12:20:11.895616

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5bdf2a89362e'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создаем таблицу категорий паролей
    op.create_table('password_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_personal', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_password_categories_id'), 'password_categories', ['id'], unique=False)
    
    # Создаем таблицу паролей
    op.create_table('passwords',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('url', sa.String(length=500), nullable=True),
        sa.Column('login', sa.String(length=255), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('is_personal', sa.Boolean(), nullable=True),
        sa.Column('shared_with', sa.JSON(), nullable=True),
        sa.Column('active_users', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('company_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['password_categories.id'], ),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_passwords_id'), 'passwords', ['id'], unique=False)


def downgrade() -> None:
    # Удаляем таблицы в обратном порядке
    op.drop_index(op.f('ix_passwords_id'), table_name='passwords')
    op.drop_table('passwords')
    op.drop_index(op.f('ix_password_categories_id'), table_name='password_categories')
    op.drop_table('password_categories')
