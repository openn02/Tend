from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
from app.core.config import settings
from app.db.base_class import Base

# Use DATABASE_URL from settings, which should come from Render env var
DATABASE_URL = settings.DATABASE_URL

# Update database URL for async, ensuring it starts with postgresql+asyncpg://
if DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql+asyncpg://"):
    ASYNC_DATABASE_URL = DATABASE_URL
else:
    # Handle other potential prefixes or raise an error
    raise ValueError(f"Unsupported database URL scheme: {DATABASE_URL}")

engine = create_async_engine(
    ASYNC_DATABASE_URL, 
    pool_pre_ping=True, 
    # Add connect_args for asyncpg if needed, e.g., if using SSL
)

# Use expire_on_commit=False to prevent sqlalchemy from expiring objects after commit
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

async def init_db() -> None:
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Import init_db from app.db.init_db
    from app.db.init_db import init_db as initial_data_init

    # Create initial data (e.g. superuser)
    async with AsyncSessionLocal() as session:
        await initial_data_init(session) 