from sqlalchemy import Column, String, Float, Boolean, ForeignKey, JSON, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base_class import Base

class SignalType(enum.Enum):
    MEETING_OVERLOAD = "meeting_overload"
    AFTER_HOURS_ACTIVITY = "after_hours_activity"
    SLACK_ACTIVITY = "slack_activity"
    EMAIL_PATTERN = "email_pattern"

class Signal(Base):
    __tablename__ = "signals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(Enum(SignalType), nullable=False)
    source = Column(String, nullable=False)
    severity = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    extra_data = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="signals")
    nudges = relationship("Nudge", back_populates="signal", cascade="all, delete-orphan")

class Nudge(Base):
    __tablename__ = "nudges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    signal_id = Column(UUID(as_uuid=True), ForeignKey("signals.id"), nullable=True)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    action_url = Column(String, nullable=True)
    priority = Column(String, nullable=False)
    extra_data = Column(JSON, nullable=False, default=dict)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="nudges")
    signal = relationship("Signal", back_populates="nudges") 