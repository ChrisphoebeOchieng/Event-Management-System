from app import db
from datetime import datetime
from enum import Enum

class ReminderStatus(Enum):
    PENDING = 'pending'
    SENT = 'sent'
    FAILED = 'failed'

class ReminderType(Enum):
    EVENT_REMINDER = 'event_reminder'
    PAYMENT_REMINDER = 'payment_reminder'
    CHECK_IN_REMINDER = 'check_in_reminder'

class Reminder(db.Model):
    __tablename__ = 'reminders'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reminder_type = db.Column(db.Enum(ReminderType), nullable=False)
    scheduled_for = db.Column(db.DateTime, nullable=False)
    sent_at = db.Column(db.DateTime)
    status = db.Column(db.Enum(ReminderStatus), default=ReminderStatus.PENDING)
    email_sent = db.Column(db.Boolean, default=False)
    subject = db.Column(db.String(200))
    message = db.Column(db.Text)
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    booking = db.relationship('Booking', backref='reminders')
    user = db.relationship('User', backref='reminders')

    def __repr__(self):
        return f'<Reminder {self.id} - {self.reminder_type.value}>'
