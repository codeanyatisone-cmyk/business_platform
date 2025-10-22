"""merge heads 0b428ce1575e and b6882894d2d0

Revision ID: b972e156a182
Revises: 0b428ce1575e, b6882894d2d0
Create Date: 2025-10-20 12:51:59.184202

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b972e156a182'
down_revision: Union[str, None] = ('0b428ce1575e', 'b6882894d2d0')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
