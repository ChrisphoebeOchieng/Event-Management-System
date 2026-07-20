from app import db
from datetime import datetime
import secrets
import string

class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    booking_reference = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    number_of_tickets = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='confirmed')
    payment_status = db.Column(db.String(20), default='pending')
    payment_method = db.Column(db.String(50))
    payment_reference = db.Column(db.String(100))
    mpesa_code = db.Column(db.String(50))
    paid_at = db.Column(db.DateTime)
    
    # Ticket fields
    ticket_number = db.Column(db.String(50), unique=True)
    qr_code_data = db.Column(db.Text)
    ticket_issued_at = db.Column(db.DateTime)
    ticket_checked_in = db.Column(db.Boolean, default=False)
    checked_in_at = db.Column(db.DateTime)
    
    # Refund tracking
    refund_requested = db.Column(db.Boolean, default=False)
    refund_processed = db.Column(db.Boolean, default=False)
    
    booked_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def generate_ticket_number(self):
        prefix = "TKT"
        random_part = ''.join(secrets.choice(string.digits) for _ in range(10))
        return f"{prefix}{random_part}"

    def __repr__(self):
        return f'<Booking {self.booking_reference}>'
