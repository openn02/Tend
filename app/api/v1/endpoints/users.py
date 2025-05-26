from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import verify_token, get_password_hash
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserUpdate, UserCreate
from app.crud.user import (
    get_user as get_user_crud,
    get_user_by_email,
    get_users,
    create_user,
    update_user,
    delete_user
)
import logging
from uuid import UUID

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token)
) -> Any:
    """Get current user"""
    # The verify_token dependency handles fetching the user based on the token
    # and raises HTTPException if authentication fails.
    # We can return the current_user directly here as it's already fetched.
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    user_in: UserUpdate
) -> Any:
    """Update current user"""
    if user_in.email and user_in.email != current_user.email:
        # Check if email is already taken
        user = await get_user_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Update user
    updated_user = await update_user(db, db_obj=current_user, obj_in=user_in)
    
    # Refresh the user object to include updated data and relationships (like team)
    await db.refresh(updated_user)
    
    return updated_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    user_id: UUID # Change type to UUID
) -> Any:
    """Get user by ID"""
    # Allow managers and admins to get any user
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
         # Allow users to get their own profile
        if str(current_user.id) != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    user = await get_user_crud(db, id=user_id) # Use the renamed get_user_crud
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.get("/", response_model=List[UserResponse])
async def list_users(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """List users"""
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    users = await get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=UserResponse)
async def create_new_user(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    user_in: UserCreate
) -> Any:
    """Create new user"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create users"
        )
    
    user = await get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = await create_user(db, obj_in=user_in)
    return user

@router.delete("/{user_id}")
async def delete_user_by_id(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token),
    user_id: UUID # Change type to UUID
) -> Any:
    """Delete user"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
        )
    
    user = await get_user_crud(db, id=user_id) # Use the renamed get_user_crud
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await delete_user(db, user_id=user_id)
    return {"message": "User deleted successfully"} 