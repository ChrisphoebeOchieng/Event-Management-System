from app import db
from datetime import datetime

class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    booking_reference = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    number_of_tickets = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled, refunded
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, failed, refunded
    payment_method = db.Column(db.String(50))  # mpesa, card, cash
    payment_reference = db.Column(db.String(100))
    mpesa_code = db.Column(db.String(50))
    paid_at = db.Column(db.DateTime)
    booked_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Booking {self.booking_reference}>'
