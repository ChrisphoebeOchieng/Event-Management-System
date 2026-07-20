import os
from openai import OpenAI
from app.models.event import Event
from app.models.user import User
from datetime import datetime

class AIRecommendationService:
    def __init__(self):
        api_key = os.environ.get('OPENAI_API_KEY')
        if api_key:
            self.client = OpenAI(api_key=api_key)
            print("✅ OpenAI initialized")
        else:
            self.client = None
            print("❌ OpenAI API key not found")

    def get_recommendations(self, user_id: int, limit: int = 5):
        """Get AI-powered event recommendations using OpenAI"""
        try:
            if not self.client:
                print("⚠️ OpenAI client not available, using fallback")
                return self._get_fallback_recommendations(user_id, limit)

            # Get user data
            user = User.query.get(user_id)
            if not user:
                return []

            # Get upcoming events
            now = datetime.utcnow()
            events = Event.query.filter(
                Event.status == 'published',
                Event.end_date > now
            ).limit(20).all()

            if not events:
                return []

            # Build event list for AI
            event_list = ""
            for i, event in enumerate(events, 1):
                event_list += f"{i}. {event.title} - {event.category} - {event.city} - KES {event.ticket_price:.2f}\n"

            # Create prompt for AI
            prompt = f"""
User: {user.first_name} {user.last_name}

Available events:
{event_list}

Task: Recommend the 5 best events for this user. Return ONLY the event numbers separated by commas (e.g., "3,7,12,18,24").

Your response (only numbers):
"""

            # Get AI response
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an event recommendation assistant. Return only numbers."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50,
                temperature=0.5
            )

            # Parse response
            import re
            numbers = re.findall(r'\d+', response.choices[0].message.content)

            recommended_events = []
            for num in numbers[:limit]:
                idx = int(num) - 1
                if 0 <= idx < len(events):
                    recommended_events.append(events[idx])

            return recommended_events if recommended_events else self._get_fallback_recommendations(user_id, limit)

        except Exception as e:
            print(f"AI Error: {e}")
            return self._get_fallback_recommendations(user_id, limit)

    def _get_fallback_recommendations(self, user_id: int, limit: int):
        """Fallback: Featured events first, then all events"""
        now = datetime.utcnow()
        featured = Event.query.filter(
            Event.status == 'published',
            Event.is_featured == True,
            Event.end_date > now
        ).limit(limit).all()

        if featured:
            return featured

        return Event.query.filter(
            Event.status == 'published',
            Event.end_date > now
        ).limit(limit).all()
