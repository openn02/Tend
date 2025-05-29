from typing import Optional, Dict, Any, List
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class GoogleOAuth:
    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = f"{settings.BACKEND_URL}/api/v1/integrations/google/callback"

    def get_oauth_url(self, state: str) -> str:
        """Generate Google OAuth URL"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=[
                "https://www.googleapis.com/auth/calendar.readonly",
                "https://www.googleapis.com/auth/gmail.metadata"
            ]
        )
        flow.redirect_uri = self.redirect_uri
        return flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            state=state
        )[0]

    async def exchange_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Exchange OAuth code for access token"""
        try:
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                    }
                },
                scopes=[
                    "https://www.googleapis.com/auth/calendar.readonly",
                    "https://www.googleapis.com/auth/gmail.metadata"
                ]
            )
            flow.redirect_uri = self.redirect_uri
            flow.fetch_token(code=code)
            credentials = flow.credentials
            return {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_uri": credentials.token_uri,
                "client_id": credentials.client_id,
                "client_secret": credentials.client_secret,
                "scopes": credentials.scopes
            }
        except Exception as e:
            logger.error(f"Error exchanging Google OAuth code: {str(e)}")
            return None

    async def get_calendar_metadata(self, credentials_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get calendar metadata (no event details)"""
        try:
            credentials = Credentials.from_authorized_user_info(credentials_dict)
            service = build("calendar", "v3", credentials=credentials)
            
            # Get events for the last 7 days
            now = datetime.utcnow()
            time_min = (now - timedelta(days=7)).isoformat() + "Z"
            time_max = now.isoformat() + "Z"
            
            events_result = service.events().list(
                calendarId="primary",
                timeMin=time_min,
                timeMax=time_max,
                singleEvents=True,
                orderBy="startTime"
            ).execute()
            
            events = events_result.get("items", [])
            
            # Calculate meeting metrics
            total_duration = 0
            after_hours_count = 0
            for event in events:
                start = datetime.fromisoformat(event["start"].get("dateTime", event["start"].get("date")))
                end = datetime.fromisoformat(event["end"].get("dateTime", event["end"].get("date")))
                duration = (end - start).total_seconds() / 3600  # hours
                total_duration += duration
                
                # Check if meeting is after hours (after 6 PM)
                if start.hour >= 18:
                    after_hours_count += 1
            
            return {
                "total_meetings": len(events),
                "total_duration_hours": total_duration,
                "after_hours_meetings": after_hours_count,
                "average_duration_hours": total_duration / len(events) if events else 0
            }
        except Exception as e:
            logger.error(f"Error getting Google Calendar metadata: {str(e)}")
            return None

    async def get_gmail_metadata(self, credentials_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get Gmail metadata (no email content)"""
        try:
            credentials = Credentials.from_authorized_user_info(credentials_dict)
            service = build("gmail", "v1", credentials=credentials)
            
            # Get message list for the last 7 days
            now = datetime.utcnow()
            time_min = int((now - timedelta(days=7)).timestamp() * 1000)
            
            messages = service.users().messages().list(
                userId="me",
                q=f"after:{time_min}"
            ).execute()
            
            message_list = messages.get("messages", [])
            
            # Get metadata for each message
            metadata_list = []
            for message in message_list[:100]:  # Limit to 100 messages
                msg = service.users().messages().get(
                    userId="me",
                    id=message["id"],
                    format="metadata",
                    metadataHeaders=["From", "To", "Subject", "Date"]
                ).execute()
                metadata_list.append(msg)
            
            return {
                "total_messages": len(message_list),
                "messages_analyzed": len(metadata_list),
                "thread_count": len(set(msg.get("threadId") for msg in metadata_list))
            }
        except Exception as e:
            logger.error(f"Error getting Gmail metadata: {str(e)}")
            return None 