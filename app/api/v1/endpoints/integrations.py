from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from typing import Dict, Optional
import httpx
from app.core.config import settings
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()

# OAuth configuration
OAUTH_CONFIG = {
    "google": {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "scope": "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
        "redirect_uri": f"{settings.BACKEND_URL}/api/v1/integrations/google/callback"
    },
    "slack": {
        "client_id": settings.SLACK_CLIENT_ID,
        "client_secret": settings.SLACK_CLIENT_SECRET,
        "auth_url": "https://slack.com/oauth/v2/authorize",
        "token_url": "https://slack.com/api/oauth.v2.access",
        "scope": "chat:write channels:read channels:join",
        "redirect_uri": f"{settings.BACKEND_URL}/api/v1/integrations/slack/callback"
    },
    "zoom": {
        "client_id": settings.ZOOM_CLIENT_ID,
        "client_secret": settings.ZOOM_CLIENT_SECRET,
        "auth_url": "https://zoom.us/oauth/authorize",
        "token_url": "https://zoom.us/oauth/token",
        "scope": "meeting:write meeting:read",
        "redirect_uri": f"{settings.BACKEND_URL}/api/v1/integrations/zoom/callback"
    }
}

@router.get("/{provider}/auth")
async def initiate_oauth(
    provider: str,
    current_user: User = Depends(get_current_user)
):
    """Initiate OAuth flow for a specific provider"""
    if provider not in OAUTH_CONFIG:
        raise HTTPException(status_code=400, detail="Unsupported provider")
    
    config = OAUTH_CONFIG[provider]
    auth_url = f"{config['auth_url']}?client_id={config['client_id']}&redirect_uri={config['redirect_uri']}&scope={config['scope']}&response_type=code"
    
    return {"auth_url": auth_url}

@router.get("/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str,
    current_user: User = Depends(get_current_user)
):
    """Handle OAuth callback and token exchange"""
    if provider not in OAUTH_CONFIG:
        raise HTTPException(status_code=400, detail="Unsupported provider")
    
    config = OAUTH_CONFIG[provider]
    
    async with httpx.AsyncClient() as client:
        try:
            # Exchange code for access token
            token_response = await client.post(
                config["token_url"],
                data={
                    "client_id": config["client_id"],
                    "client_secret": config["client_secret"],
                    "code": code,
                    "redirect_uri": config["redirect_uri"],
                    "grant_type": "authorization_code"
                }
            )
            token_data = token_response.json()
            
            # Store the tokens in the database (implement this)
            # await store_oauth_tokens(current_user.id, provider, token_data)
            
            # Redirect to frontend with success
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/settings?integration={provider}&status=success"
            )
            
        except Exception as e:
            # Redirect to frontend with error
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/settings?integration={provider}&status=error&message={str(e)}"
            )

@router.get("/{provider}/status")
async def get_integration_status(
    provider: str,
    current_user: User = Depends(get_current_user)
):
    """Get the connection status for a specific integration"""
    # TODO: Implement actual token validation and status check
    return {"connected": False} 