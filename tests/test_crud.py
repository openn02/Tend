import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.user import create_user, get_user, get_user_by_email
from app.crud.team import create_team, get_team, add_team_member
from app.crud.signal import create_signal, get_user_signals
from app.crud.signal import create_nudge, get_user_nudges, mark_nudge_as_read
from app.schemas.user import UserCreate
from app.schemas.team import TeamCreate
from app.schemas.signal import SignalCreate, NudgeCreate
from app.models.user import UserRole
from app.models.signal import SignalType

@pytest.mark.asyncio
async def test_user_crud(db: AsyncSession):
    # Create user
    user_in = UserCreate(
        email="test@example.com",
        password="testpass123",
        full_name="Test User",
        role=UserRole.EMPLOYEE
    )
    user = await create_user(db, obj_in=user_in)
    assert user.email == "test@example.com"
    assert user.full_name == "Test User"
    
    # Get user
    stored_user = await get_user(db, id=user.id)
    assert stored_user.id == user.id
    
    # Get user by email
    email_user = await get_user_by_email(db, email="test@example.com")
    assert email_user.id == user.id

@pytest.mark.asyncio
async def test_team_crud(db: AsyncSession):
    # Create team
    team_in = TeamCreate(
        name="Test Team",
        settings={"threshold": 0.8}
    )
    team = await create_team(db, obj_in=team_in)
    assert team.name == "Test Team"
    
    # Get team
    stored_team = await get_team(db, id=team.id)
    assert stored_team.id == team.id

@pytest.mark.asyncio
async def test_signal_crud(db: AsyncSession):
    # Create user for signal
    user_in = UserCreate(
        email="signal@example.com",
        password="testpass123",
        full_name="Signal User",
        role=UserRole.EMPLOYEE
    )
    user = await create_user(db, obj_in=user_in)
    
    # Create signal
    signal_in = SignalCreate(
        user_id=user.id,
        type=SignalType.MEETING_OVERLOAD,
        value=0.8,
        metadata={"meetings": 10}
    )
    signal = await create_signal(db, obj_in=signal_in)
    assert signal.user_id == user.id
    assert signal.type == SignalType.MEETING_OVERLOAD
    
    # Get user signals
    signals = await get_user_signals(db, user_id=user.id)
    assert len(signals) == 1
    assert signals[0].id == signal.id

@pytest.mark.asyncio
async def test_nudge_crud(db: AsyncSession):
    # Create user for nudge
    user_in = UserCreate(
        email="nudge@example.com",
        password="testpass123",
        full_name="Nudge User",
        role=UserRole.EMPLOYEE
    )
    user = await create_user(db, obj_in=user_in)
    
    # Create signal for nudge
    signal_in = SignalCreate(
        user_id=user.id,
        type=SignalType.MEETING_OVERLOAD,
        value=0.8,
        metadata={"meetings": 10}
    )
    signal = await create_signal(db, obj_in=signal_in)
    
    # Create nudge
    nudge_in = NudgeCreate(
        user_id=user.id,
        signal_id=signal.id,
        message="Test nudge message",
        is_read=False
    )
    nudge = await create_nudge(db, obj_in=nudge_in)
    assert nudge.user_id == user.id
    assert nudge.signal_id == signal.id
    
    # Get user nudges
    nudges = await get_user_nudges(db, user_id=user.id)
    assert len(nudges) == 1
    assert nudges[0].id == nudge.id
    
    # Mark nudge as read
    updated_nudge = await mark_nudge_as_read(db, nudge_id=nudge.id, user_id=user.id)
    assert updated_nudge.is_read == True 