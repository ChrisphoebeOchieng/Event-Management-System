from app import db
from datetime import datetime

class UserInteraction(db.Model):
    __tablename__ = 'user_interactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    interaction_type = db.Column(db.String(20), nullable=False)  # view, click, booking, favorite
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<UserInteraction {self.user_id} - {self.event_id} - {self.interaction_type}>'

class UserPreference(db.Model):
    __tablename__ = 'user_preferences'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    preferred_categories = db.Column(db.Text)  # JSON array of categories
    preferred_cities = db.Column(db.Text)     # JSON array of cities
    price_min = db.Column(db.Float)
    price_max = db.Column(db.Float)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<UserPreference {self.user_id}>'
