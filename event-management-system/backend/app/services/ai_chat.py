import os
from openai import OpenAI
from datetime import datetime
from app.models.event import Event
from app.models.user import User
from app.models.booking import Booking

class AIChatService:
    def __init__(self):
        api_key = os.environ.get('OPENAI_API_KEY')
        if api_key:
            self.client = OpenAI(api_key=api_key)
            print("✅ OpenAI Chat service initialized")
        else:
            self.client = None
            print("❌ OpenAI API key not found for chat")

    def get_chat_response(self, user_id: int, message: str, conversation_history: list = None):
        try:
            if not self.client:
                return "⚠️ AI service is not configured. Please set OPENAI_API_KEY in .env"

            # Get user info
            user = User.query.get(user_id)
            if not user:
                return "User not found."

            # Get upcoming events
            now = datetime.utcnow()
            upcoming_events = Event.query.filter(
                Event.status == 'published',
                Event.end_date > now
            ).limit(10).all()

            # Build context
            events_context = ""
            if upcoming_events:
                events_context = "\nUPCOMING EVENTS:\n"
                for i, event in enumerate(upcoming_events[:5], 1):
                    events_context += f"{i}. {event.title} - {event.city} - KES {event.ticket_price:.2f}\n"

            # Build system prompt
            system_prompt = f"""You are EventSphere AI, a friendly event assistant for the EventSphere platform.

User: {user.first_name} {user.last_name}
Available events:
{events_context}

You help users with:
- Discovering events
- Booking tickets
- Event recommendations
- General event information

Be friendly, helpful, and conversational. Keep responses concise.
"""

            # Get AI response
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=200,
                temperature=0.7
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"AI Chat error: {e}")
            return f"⚠️ Error: {str(e)}"
