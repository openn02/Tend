from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import yaml
from pathlib import Path
import logging
from app.models.signal import Signal, SignalType, Nudge
from app.models.user import User

logger = logging.getLogger(__name__)

class SignalEngine:
    def __init__(self):
        self.rules = self._load_rules()
        
    def _load_rules(self) -> Dict[str, Any]:
        """Load signal rules from YAML file"""
        try:
            rules_path = Path(__file__).parent / "rules.yaml"
            with open(rules_path, "r") as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Error loading signal rules: {str(e)}")
            return {}

    async def process_metadata(
        self,
        user: User,
        slack_metadata: Optional[Dict[str, Any]] = None,
        calendar_metadata: Optional[Dict[str, Any]] = None,
        gmail_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Signal]:
        """Process metadata and generate signals"""
        signals = []
        
        # Process meeting overload signal
        if calendar_metadata:
            meeting_signal = self._process_meeting_overload(calendar_metadata)
            if meeting_signal:
                signals.append(meeting_signal)
        
        # Process after-hours activity signal
        if calendar_metadata or slack_metadata:
            after_hours_signal = self._process_after_hours_activity(
                calendar_metadata,
                slack_metadata
            )
            if after_hours_signal:
                signals.append(after_hours_signal)
        
        # Process Slack activity signal
        if slack_metadata:
            slack_signal = self._process_slack_activity(slack_metadata)
            if slack_signal:
                signals.append(slack_signal)
        
        # Process email pattern signal
        if gmail_metadata:
            email_signal = self._process_email_pattern(gmail_metadata)
            if email_signal:
                signals.append(email_signal)
        
        return signals

    def _process_meeting_overload(self, calendar_metadata: Dict[str, Any]) -> Optional[Signal]:
        """Process meeting overload signal"""
        try:
            total_meetings = calendar_metadata.get("total_meetings", 0)
            total_duration = calendar_metadata.get("total_duration_hours", 0)
            
            # Calculate meeting overload score (0-1)
            meeting_threshold = self.rules.get("meeting_overload", {}).get("threshold", 12)
            duration_threshold = self.rules.get("meeting_overload", {}).get("duration_threshold", 20)
            
            meeting_score = min(total_meetings / meeting_threshold, 1.0)
            duration_score = min(total_duration / duration_threshold, 1.0)
            
            # Combined score (weighted average)
            score = (meeting_score * 0.6) + (duration_score * 0.4)
            
            if score > 0.7:  # High meeting load
                return Signal(
                    type=SignalType.MEETING_OVERLOAD,
                    value=score,
                    meta={
                        "total_meetings": total_meetings,
                        "total_duration_hours": total_duration,
                        "meeting_threshold": meeting_threshold,
                        "duration_threshold": duration_threshold
                    }
                )
        except Exception as e:
            logger.error(f"Error processing meeting overload signal: {str(e)}")
        return None

    def _process_after_hours_activity(
        self,
        calendar_metadata: Optional[Dict[str, Any]],
        slack_metadata: Optional[Dict[str, Any]]
    ) -> Optional[Signal]:
        """Process after-hours activity signal"""
        try:
            after_hours_score = 0
            meta = {}
            
            if calendar_metadata:
                after_hours_meetings = calendar_metadata.get("after_hours_meetings", 0)
                meta["after_hours_meetings"] = after_hours_meetings
                after_hours_score += min(after_hours_meetings / 3, 1.0) * 0.5
            
            if slack_metadata:
                last_active = slack_metadata.get("last_active")
                if last_active:
                    last_active_time = datetime.fromisoformat(last_active)
                    if last_active_time.hour >= 21:  # After 9 PM
                        after_hours_score += 0.5
                        meta["late_night_slack"] = True
            
            if after_hours_score > 0.6:  # Significant after-hours activity
                return Signal(
                    type=SignalType.AFTER_HOURS_ACTIVITY,
                    value=after_hours_score,
                    meta=meta
                )
        except Exception as e:
            logger.error(f"Error processing after-hours activity signal: {str(e)}")
        return None

    def _process_slack_activity(self, slack_metadata: Dict[str, Any]) -> Optional[Signal]:
        """Process Slack activity signal"""
        try:
            channel_count = slack_metadata.get("channel_count", 0)
            reaction_count = slack_metadata.get("reaction_count", 0)
            
            # Calculate engagement score
            channel_threshold = self.rules.get("slack_activity", {}).get("channel_threshold", 10)
            reaction_threshold = self.rules.get("slack_activity", {}).get("reaction_threshold", 50)
            
            channel_score = min(channel_count / channel_threshold, 1.0)
            reaction_score = min(reaction_count / reaction_threshold, 1.0)
            
            score = (channel_score * 0.4) + (reaction_score * 0.6)
            
            return Signal(
                type=SignalType.SLACK_ACTIVITY,
                value=score,
                meta={
                    "channel_count": channel_count,
                    "reaction_count": reaction_count,
                    "channel_threshold": channel_threshold,
                    "reaction_threshold": reaction_threshold
                }
            )
        except Exception as e:
            logger.error(f"Error processing Slack activity signal: {str(e)}")
        return None

    def _process_email_pattern(self, gmail_metadata: Dict[str, Any]) -> Optional[Signal]:
        """Process email pattern signal"""
        try:
            total_messages = gmail_metadata.get("total_messages", 0)
            thread_count = gmail_metadata.get("thread_count", 0)
            
            # Calculate email load score
            message_threshold = self.rules.get("email_pattern", {}).get("message_threshold", 100)
            thread_threshold = self.rules.get("email_pattern", {}).get("thread_threshold", 30)
            
            message_score = min(total_messages / message_threshold, 1.0)
            thread_score = min(thread_count / thread_threshold, 1.0)
            
            score = (message_score * 0.5) + (thread_score * 0.5)
            
            return Signal(
                type=SignalType.EMAIL_PATTERN,
                value=score,
                meta={
                    "total_messages": total_messages,
                    "thread_count": thread_count,
                    "message_threshold": message_threshold,
                    "thread_threshold": thread_threshold
                }
            )
        except Exception as e:
            logger.error(f"Error processing email pattern signal: {str(e)}")
        return None

    def generate_nudge(self, signal: Signal) -> Optional[Nudge]:
        """Generate a nudge based on signal"""
        try:
            nudge_templates = self.rules.get("nudges", {})
            template = nudge_templates.get(signal.type.value, {}).get("template")
            
            if template and signal.value > 0.7:  # Only generate nudges for significant signals
                # Format template with signal meta
                message = template.format(**(signal.meta or {}))
                return Nudge(
                    message=message,
                    signal_id=signal.id
                )
        except Exception as e:
            logger.error(f"Error generating nudge: {str(e)}")
        return None 