from typing import Optional, Dict, Any
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class SlackOAuth:
    def __init__(self):
        self.client_id = settings.SLACK_CLIENT_ID
        self.client_secret = settings.SLACK_CLIENT_SECRET
        self.signing_secret = settings.SLACK_SIGNING_SECRET

    async def get_user_info(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Get user info from Slack"""
        try:
            client = WebClient(token=access_token)
            response = client.auth_test()
            return {
                "slack_user_id": response["user_id"],
                "team_id": response["team_id"],
                "user_name": response["user"]
            }
        except SlackApiError as e:
            logger.error(f"Error getting Slack user info: {str(e)}")
            return None

    async def get_user_metadata(self, access_token: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user metadata from Slack (no message content)"""
        try:
            client = WebClient(token=access_token)
            
            # Get user presence
            presence = client.users_getPresence(user=user_id)
            
            # Get user's channel list (for activity patterns)
            channels = client.users_conversations(
                user=user_id,
                types="public_channel,private_channel,im",
                limit=100
            )
            
            # Get user's emoji usage (last 30 days)
            reactions = client.reactions_list(
                user=user_id,
                limit=100
            )
            
            return {
                "presence": presence["presence"],
                "channel_count": len(channels["channels"]),
                "reaction_count": len(reactions["items"]),
                "last_active": presence.get("last_activity", None)
            }
        except SlackApiError as e:
            logger.error(f"Error getting Slack user metadata: {str(e)}")
            return None

    def get_oauth_url(self, state: str) -> str:
        """Generate Slack OAuth URL"""
        return (
            "https://slack.com/oauth/v2/authorize"
            f"?client_id={self.client_id}"
            "&scope=users:read,users:read.email,reactions:read,channels:read,groups:read,im:read"
            f"&state={state}"
        )

    async def exchange_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Exchange OAuth code for access token"""
        try:
            client = WebClient()
            response = client.oauth_v2_access(
                client_id=self.client_id,
                client_secret=self.client_secret,
                code=code
            )
            return {
                "access_token": response["access_token"],
                "team_id": response["team"]["id"],
                "user_id": response["authed_user"]["id"]
            }
        except SlackApiError as e:
            logger.error(f"Error exchanging Slack OAuth code: {str(e)}")
            return None 