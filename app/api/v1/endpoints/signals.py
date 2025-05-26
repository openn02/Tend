from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import verify_token
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.signal import Signal, Nudge
from app.schemas.signal import (
    SignalResponse,
    SignalCreate,
    SignalUpdate,
    NudgeResponse,
    NudgeCreate,
    NudgeUpdate
)
from app.crud.signal import (
    get_user_signals,
    get_user_nudges,
    create_signal,
    create_nudge,
    mark_nudge_as_read,
    get_signal,
    get_nudge,
    update_signal,
    update_nudge,
    delete_signal,
    delete_nudge
)
from app.core.signals.engine import SignalEngine
import logging
from datetime import datetime, timedelta

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize signal engine
signal_engine = SignalEngine()

# Signal endpoints
@router.get("/my", response_model=List[SignalResponse])
async def get_my_signals(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> Any:
    """Get current user's signals with optional date filtering"""
    signals = await get_user_signals(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date
    )
    return signals

@router.get("/{signal_id}", response_model=SignalResponse)
async def get_signal_by_id(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    signal_id: str
) -> Any:
    """Get a specific signal by ID"""
    signal = await get_signal(db, signal_id=signal_id)
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found"
        )
    
    # Check if user has permission to view this signal
    if signal.user_id != current_user.id and current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return signal

@router.post("/", response_model=SignalResponse)
async def create_new_signal(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    signal_in: SignalCreate
) -> Any:
    """Create a new signal"""
    signal = await create_signal(db, signal_in)
    return signal

@router.put("/{signal_id}", response_model=SignalResponse)
async def update_signal_by_id(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    signal_id: str,
    signal_in: SignalUpdate
) -> Any:
    """Update a signal"""
    signal = await get_signal(db, signal_id=signal_id)
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found"
        )
    
    # Check if user has permission to update this signal
    if signal.user_id != current_user.id and current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_signal = await update_signal(db, db_obj=signal, obj_in=signal_in)
    return updated_signal

@router.delete("/{signal_id}")
async def delete_signal_by_id(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    signal_id: str
) -> Any:
    """Delete a signal"""
    signal = await get_signal(db, signal_id=signal_id)
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found"
        )
    
    # Check if user has permission to delete this signal
    if signal.user_id != current_user.id and current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    await delete_signal(db, signal_id=signal_id)
    return {"message": "Signal deleted successfully"}

# Nudge endpoints
@router.get("/my/nudges", response_model=List[NudgeResponse])
async def get_my_nudges(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    skip: int = 0,
    limit: int = 100,
    is_read: Optional[bool] = None
) -> Any:
    """Get current user's nudges with optional read status filtering"""
    nudges = await get_user_nudges(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        is_read=is_read
    )
    return nudges

@router.get("/nudges/{nudge_id}", response_model=NudgeResponse)
async def get_nudge_by_id(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    nudge_id: str
) -> Any:
    """Get a specific nudge by ID"""
    nudge = await get_nudge(db, nudge_id=nudge_id)
    if not nudge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudge not found"
        )
    
    # Check if user has permission to view this nudge
    if nudge.user_id != current_user.id and current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return nudge

@router.post("/nudges", response_model=NudgeResponse)
async def create_new_nudge(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    nudge_in: NudgeCreate
) -> Any:
    """Create a new nudge"""
    nudge = await create_nudge(db, nudge_in)
    return nudge

@router.put("/nudges/{nudge_id}", response_model=NudgeResponse)
async def update_nudge_by_id(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    nudge_id: str,
    nudge_in: NudgeUpdate
) -> Any:
    """Update a nudge"""
    nudge = await get_nudge(db, nudge_id=nudge_id)
    if not nudge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudge not found"
        )
    
    # Check if user has permission to update this nudge
    if nudge.user_id != current_user.id and current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_nudge = await update_nudge(db, db_obj=nudge, obj_in=nudge_in)
    return updated_nudge

@router.delete("/nudges/{nudge_id}")
async def delete_nudge_by_id(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    nudge_id: str
) -> Any:
    """Delete a nudge"""
    nudge = await get_nudge(db, nudge_id=nudge_id)
    if not nudge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudge not found"
        )
    
    # Check if user has permission to delete this nudge
    if nudge.user_id != current_user.id and current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    await delete_nudge(db, nudge_id=nudge_id)
    return {"message": "Nudge deleted successfully"}

@router.post("/nudges/{nudge_id}/read")
async def mark_nudge_read(
    *,
    nudge_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token)
) -> Any:
    """Mark a nudge as read"""
    nudge = await mark_nudge_as_read(db, nudge_id=nudge_id, user_id=current_user.id)
    if not nudge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudge not found"
        )
    return {"message": "Nudge marked as read"}

@router.post("/process")
async def process_signals(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token)
) -> Any:
    """Process signals for current user"""
    try:
        # Get metadata from connected services
        slack_metadata = None
        calendar_metadata = None
        gmail_metadata = None
        
        # TODO: Implement metadata fetching from connected services
        
        # Process signals
        signals = await signal_engine.process_metadata(
            user=current_user,
            slack_metadata=slack_metadata,
            calendar_metadata=calendar_metadata,
            gmail_metadata=gmail_metadata
        )
        
        # Save signals and generate nudges
        saved_signals = []
        for signal in signals:
            saved_signal = await create_signal(db, signal)
            saved_signals.append(saved_signal)
            
            # Generate nudge if applicable
            nudge = signal_engine.generate_nudge(saved_signal)
            if nudge:
                await create_nudge(db, nudge)
        
        return {
            "message": "Signals processed successfully",
            "signals_processed": len(saved_signals)
        }
    except Exception as e:
        logger.error(f"Error processing signals: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process signals"
        ) 