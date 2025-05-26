from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
import uuid

class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Team settings
    settings = Column(JSON, nullable=True)  # Team-specific settings and thresholds
    
    # Relationships
    members = relationship("User", back_populates="team")
    
    # Anonymized team metrics
    team_metrics = relationship("TeamMetric", back_populates="team")

    def __repr__(self):
        return f"<Team {self.name}>"

class TeamMetric(Base):
    __tablename__ = "team_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    metric_type = Column(String, nullable=False)  # e.g., "burnout_risk", "meeting_density"
    value = Column(JSON, nullable=False)  # Anonymized metric data
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="team_metrics")

    def __repr__(self):
        return f"<TeamMetric {self.metric_type} for team {self.team_id}>" 