from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import verify_token
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.team import Team, TeamMetric
from app.schemas.team import TeamResponse, TeamMetricResponse, TeamCreate
from app.crud.team import (
    get_team,
    get_team_metrics,
    create_team,
    update_team,
    add_team_member,
    remove_team_member
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/my", response_model=TeamResponse)
async def get_my_team(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token)
) -> Any:
    """Get current user's team"""
    if not current_user.team_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not part of any team"
        )
    
    team = await get_team(db, team_id=current_user.team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    return team

@router.get("/my/metrics", response_model=List[TeamMetricResponse])
async def get_team_metrics(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token)
) -> Any:
    """Get team metrics (anonymized)"""
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can view team metrics"
        )
    
    if not current_user.team_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not part of any team"
        )
    
    metrics = await get_team_metrics(db, team_id=current_user.team_id)
    return metrics

@router.post("/create", response_model=TeamResponse)
async def create_new_team(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    team_in: TeamCreate
) -> Any:
    """Create a new team"""
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can create teams"
        )
    
    team = await create_team(db, obj_in=team_in)
    
    # Add creator as team member
    await add_team_member(db, team_id=team.id, user_id=current_user.id)
    
    return team

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team_info(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    team_id: str,
    team_in: TeamCreate
) -> Any:
    """Update team information"""
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can update teams"
        )
    
    team = await get_team(db, team_id=team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    updated_team = await update_team(db, db_obj=team, obj_in=team_in)
    return updated_team

@router.post("/{team_id}/members/{user_id}")
async def add_member(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    team_id: str,
    user_id: str
) -> Any:
    """Add a member to the team"""
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can add team members"
        )
    
    team = await get_team(db, team_id=team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    await add_team_member(db, team_id=team_id, user_id=user_id)
    return {"message": "Member added successfully"}

@router.delete("/{team_id}/members/{user_id}")
async def remove_member(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    team_id: str,
    user_id: str
) -> Any:
    """Remove a member from the team"""
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can remove team members"
        )
    
    team = await get_team(db, team_id=team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    await remove_team_member(db, team_id=team_id, user_id=user_id)
    return {"message": "Member removed successfully"} 