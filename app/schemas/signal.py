from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID

# Signal schemas
class SignalBase(BaseModel):
    type: str = Field(..., description="Type of signal (e.g., 'burnout', 'meeting_overload')")
    source: str = Field(..., description="Source of the signal (e.g., 'slack', 'calendar', 'gmail')")
    severity: float = Field(..., ge=0.0, le=1.0, description="Severity of the signal (0.0 to 1.0)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata about the signal")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence level of the signal (0.0 to 1.0)")

class SignalCreate(SignalBase):
    user_id: UUID = Field(..., description="ID of the user this signal belongs to")

class SignalUpdate(BaseModel):
    type: Optional[str] = Field(None, description="Type of signal")
    source: Optional[str] = Field(None, description="Source of the signal")
    severity: Optional[float] = Field(None, ge=0.0, le=1.0, description="Severity of the signal")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence level")

class SignalResponse(SignalBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Nudge schemas
class NudgeBase(BaseModel):
    type: str = Field(..., description="Type of nudge (e.g., 'take_break', 'schedule_focus_time')")
    title: str = Field(..., description="Title of the nudge")
    message: str = Field(..., description="Message content of the nudge")
    action_url: Optional[str] = Field(None, description="Optional URL for action")
    priority: str = Field(..., description="Priority level (e.g., 'low', 'medium', 'high')")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata about the nudge")

class NudgeCreate(NudgeBase):
    user_id: UUID = Field(..., description="ID of the user this nudge belongs to")
    signal_id: Optional[UUID] = Field(None, description="ID of the associated signal, if any")

class NudgeUpdate(BaseModel):
    type: Optional[str] = Field(None, description="Type of nudge")
    title: Optional[str] = Field(None, description="Title of the nudge")
    message: Optional[str] = Field(None, description="Message content")
    action_url: Optional[str] = Field(None, description="Optional URL for action")
    priority: Optional[str] = Field(None, description="Priority level")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    is_read: Optional[bool] = Field(None, description="Whether the nudge has been read")

class NudgeResponse(NudgeBase):
    id: UUID
    user_id: UUID
    signal_id: Optional[UUID]
    is_read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 