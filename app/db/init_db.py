from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db import base  # noqa: F401
from app.crud import user as crud_user # Import user crud
from app.schemas.user import UserCreate # Import user schema

# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might not see them

async def init_db(db: AsyncSession) -> None:
    # Tables should be created by Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next line
    # from app.db.base import Base
    # from app.db.session import engine
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)

    # Create initial data (e.g. superuser)
    user = await crud_user.get_user_by_email(db, email=settings.FIRST_SUPERUSER) # Assuming you have a settings.FIRST_SUPERUSER
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name="Super User",
            role="admin",
        )
        user = await crud_user.create_user(db, obj_in=user_in)
        # Optionally assign to a default team here if teams are required for users 