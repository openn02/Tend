from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.signal import Signal, Nudge
from app.schemas.signal import SignalCreate, SignalUpdate, NudgeCreate, NudgeUpdate
from uuid import UUID

# Signal CRUD operations
async def get_signal(db: AsyncSession, signal_id: UUID) -> Optional[Signal]:
    """Get a signal by ID"""
    result = await db.execute(select(Signal).where(Signal.id == signal_id))
    return result.scalar_one_or_none()

async def get_user_signals(
    db: AsyncSession,
    user_id: UUID,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[Signal]:
    """Get all signals for a user with optional date filtering"""
    query = select(Signal).where(Signal.user_id == user_id)
    
    if start_date:
        query = query.where(Signal.created_at >= start_date)
    if end_date:
        query = query.where(Signal.created_at <= end_date)
    
    query = query.order_by(desc(Signal.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def create_signal(db: AsyncSession, signal_in: SignalCreate) -> Signal:
    """Create a new signal"""
    signal = Signal(
        user_id=signal_in.user_id,
        type=signal_in.type,
        source=signal_in.source,
        severity=signal_in.severity,
        metadata=signal_in.metadata,
        confidence=signal_in.confidence
    )
    db.add(signal)
    await db.commit()
    await db.refresh(signal)
    return signal

async def update_signal(
    db: AsyncSession,
    db_obj: Signal,
    obj_in: SignalUpdate
) -> Signal:
    """Update a signal"""
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete_signal(db: AsyncSession, signal_id: UUID) -> None:
    """Delete a signal"""
    signal = await get_signal(db, signal_id)
    if signal:
        await db.delete(signal)
        await db.commit()

# Nudge CRUD operations
async def get_nudge(db: AsyncSession, nudge_id: UUID) -> Optional[Nudge]:
    """Get a nudge by ID"""
    result = await db.execute(select(Nudge).where(Nudge.id == nudge_id))
    return result.scalar_one_or_none()

async def get_user_nudges(
    db: AsyncSession,
    user_id: UUID,
    skip: int = 0,
    limit: int = 100,
    is_read: Optional[bool] = None
) -> List[Nudge]:
    """Get all nudges for a user with optional read status filtering"""
    query = select(Nudge).where(Nudge.user_id == user_id)
    
    if is_read is not None:
        query = query.where(Nudge.is_read == is_read)
    
    query = query.order_by(desc(Nudge.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def create_nudge(db: AsyncSession, nudge_in: NudgeCreate) -> Nudge:
    """Create a new nudge"""
    nudge = Nudge(
        user_id=nudge_in.user_id,
        signal_id=nudge_in.signal_id,
        type=nudge_in.type,
        title=nudge_in.title,
        message=nudge_in.message,
        action_url=nudge_in.action_url,
        priority=nudge_in.priority,
        metadata=nudge_in.metadata,
        is_read=False
    )
    db.add(nudge)
    await db.commit()
    await db.refresh(nudge)
    return nudge

async def update_nudge(
    db: AsyncSession,
    db_obj: Nudge,
    obj_in: NudgeUpdate
) -> Nudge:
    """Update a nudge"""
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete_nudge(db: AsyncSession, nudge_id: UUID) -> None:
    """Delete a nudge"""
    nudge = await get_nudge(db, nudge_id)
    if nudge:
        await db.delete(nudge)
        await db.commit()

async def mark_nudge_as_read(
    db: AsyncSession,
    nudge_id: UUID,
    user_id: UUID
) -> Optional[Nudge]:
    """Mark a nudge as read"""
    nudge = await get_nudge(db, nudge_id)
    if not nudge or nudge.user_id != user_id:
        return None
    
    nudge.is_read = True
    await db.commit()
    await db.refresh(nudge)
    return nudge 