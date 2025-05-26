from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, signals, teams, oauth, integrations

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(signals.router, prefix="/signals", tags=["signals"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(oauth.router, prefix="/oauth", tags=["oauth"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"]) 