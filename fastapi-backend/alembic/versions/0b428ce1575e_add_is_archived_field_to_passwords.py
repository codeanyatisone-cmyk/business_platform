"""Add is_archived field to passwords

Revision ID: 0b428ce1575e
Revises: 5bdf2a89362e
Create Date: 2025-10-20 12:38:05.279596

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0b428ce1575e'
down_revision: Union[str, None] = '5bdf2a89362e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем поле is_archived в таблицу passwords
    op.add_column('passwords', sa.Column('is_archived', sa.Boolean(), nullable=True, default=False))


def downgrade() -> None:
    # Удаляем поле is_archived из таблицы passwords
    op.drop_column('passwords', 'is_archived')
