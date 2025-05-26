from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class TeamBase(BaseModel):
    name: str
    settings: Optional[Dict[str, Any]] = None

# Properties to receive via API on creation
class TeamCreate(TeamBase):
    pass

# Properties to receive via API on update
class TeamUpdate(TeamBase):
    pass

# Properties shared by models stored in DB
class TeamInDBBase(TeamBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class TeamResponse(TeamInDBBase):
    pass

# Team Metric schemas
class TeamMetricBase(BaseModel):
    metric_type: str
    value: Dict[str, Any]
    period_start: datetime
    period_end: datetime

class TeamMetricCreate(TeamMetricBase):
    team_id: str

class TeamMetricInDBBase(TeamMetricBase):
    id: str
    team_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class TeamMetricResponse(TeamMetricInDBBase):
    pass 