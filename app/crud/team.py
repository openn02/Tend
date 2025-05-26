from typing import List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.team import Team, TeamMetric
from app.models.user import User
from app.schemas.team import TeamCreate, TeamUpdate

class CRUDTeam(CRUDBase[Team, TeamCreate, TeamUpdate]):
    async def get_by_name(self, db: AsyncSession, *, name: str) -> Optional[Team]:
        """Get team by name"""
        result = await db.execute(select(Team).filter(Team.name == name))
        return result.scalar_one_or_none()

    async def get_by_organization(
        self, db: AsyncSession, *, organization_id: int, skip: int = 0, limit: int = 100
    ) -> List[Team]:
        """Get all teams in an organization"""
        result = await db.execute(
            select(Team)
            .filter(Team.organization_id == organization_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_members(
        self, db: AsyncSession, *, team_id: int, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """Get all members of a team"""
        result = await db.execute(
            select(User)
            .join(User.teams)
            .filter(Team.id == team_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def add_member(self, db: AsyncSession, *, team_id: int, user_id: int) -> Team:
        """Add a member to a team"""
        team = await self.get(db, id=team_id)
        user = await db.get(User, user_id)
        if team and user:
            team.members.append(user)
            await db.commit()
            await db.refresh(team)
        return team

    async def remove_member(self, db: AsyncSession, *, team_id: int, user_id: int) -> Team:
        """Remove a member from a team"""
        team = await self.get(db, id=team_id)
        user = await db.get(User, user_id)
        if team and user:
            team.members.remove(user)
            await db.commit()
            await db.refresh(team)
        return team

    # Placeholder function for team metrics
    async def get_team_metrics(self, db: AsyncSession, *, team_id: int) -> List[Any]:
        """Get team metrics (placeholder)"""
        # TODO: Implement actual logic for fetching and calculating team metrics
        return [] # Return an empty list for now

team = CRUDTeam(Team)

# Export common operations
get_team = team.get
get_team_by_name = team.get_by_name
get_teams = team.get_multi
get_teams_by_organization = team.get_by_organization
get_team_members = team.get_members
create_team = team.create
update_team = team.update
delete_team = team.remove
add_team_member = team.add_member
remove_team_member = team.remove_member
# Export the new placeholder function
get_team_metrics = team.get_team_metrics 