from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.oauth.slack import SlackOAuth
from app.core.oauth.google import GoogleOAuth
from app.core.security import verify_token
from app.db.session import get_db
from app.models.user import User
from app.crud.user import get_user, update_user
import secrets
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize OAuth handlers
slack_oauth = SlackOAuth()
google_oauth = GoogleOAuth()

@router.get("/slack/authorize")
async def slack_authorize() -> Any:
    """Get Slack OAuth authorization URL"""
    state = secrets.token_urlsafe(32)
    return {"authorization_url": slack_oauth.get_oauth_url(state)}

@router.get("/slack/callback")
async def slack_callback(
    *,
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token)
) -> Any:
    """Handle Slack OAuth callback"""
    try:
        # Exchange code for access token
        token_data = await slack_oauth.exchange_code(code)
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange code for token"
            )
        
        # Get user info from Slack
        user_info = await slack_oauth.get_user_info(token_data["access_token"])
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Slack"
            )
        
        # Update user with Slack info
        user = await get_user(db, current_user.id)
        user.slack_user_id = user_info["slack_user_id"]
        await update_user(db, user)
        
        return {"message": "Slack integration successful"}
    except Exception as e:
        logger.error(f"Error in Slack callback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to complete Slack integration"
        )

@router.get("/google/authorize")
async def google_authorize() -> Any:
    """Get Google OAuth authorization URL"""
    state = secrets.token_urlsafe(32)
    return {"authorization_url": google_oauth.get_oauth_url(state)}

@router.get("/google/callback")
async def google_callback(
    *,
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token)
) -> Any:
    """Handle Google OAuth callback"""
    try:
        # Exchange code for access token
        token_data = await google_oauth.exchange_code(code)
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange code for token"
            )
        
        # Get user info from Google
        calendar_metadata = await google_oauth.get_calendar_metadata(token_data)
        gmail_metadata = await google_oauth.get_gmail_metadata(token_data)
        
        if not calendar_metadata and not gmail_metadata:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get metadata from Google"
            )
        
        # Update user with Google info
        user = await get_user(db, current_user.id)
        user.google_user_id = token_data.get("user_id")
        await update_user(db, user)
        
        return {
            "message": "Google integration successful",
            "calendar_metadata": calendar_metadata,
            "gmail_metadata": gmail_metadata
        }
    except Exception as e:
        logger.error(f"Error in Google callback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to complete Google integration"
        )

@router.post("/disconnect/{provider}")
async def disconnect_provider(
    *,
    provider: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_token)
) -> Any:
    """Disconnect OAuth provider"""
    try:
        user = await get_user(db, current_user.id)
        
        if provider == "slack":
            user.slack_user_id = None
        elif provider == "google":
            user.google_user_id = None
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid provider"
            )
        
        await update_user(db, user)
        return {"message": f"{provider.title()} integration disconnected"}
    except Exception as e:
        logger.error(f"Error disconnecting {provider}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to disconnect {provider}"
        ) 