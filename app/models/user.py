from sqlalchemy import Boolean, Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.db.session import Base
import uuid

class UserRole(str, enum.Enum):
    EMPLOYEE = "employee"
    MANAGER = "manager"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # OAuth connections
    slack_user_id = Column(String, unique=True, nullable=True)
    google_user_id = Column(String, unique=True, nullable=True)
    
    # Privacy settings
    data_consent_given = Column(Boolean, default=False)
    data_consent_updated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True)
    team = relationship("Team", back_populates="members")
    
    # Signal data
    signals = relationship("Signal", back_populates="user")
    nudges = relationship("Nudge", back_populates="user")

    def __repr__(self):
        return f"<User {self.email}>" 