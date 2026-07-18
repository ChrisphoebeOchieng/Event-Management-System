from app import db
from datetime import datetime

class Vendor(db.Model):
    __tablename__ = 'vendors'

    id = db.Column(db.Integer, primary_key=True)
    business_name = db.Column(db.String(100), nullable=False)
    business_type = db.Column(db.String(50), nullable=False)  # food, drinks, entertainment, etc.
    description = db.Column(db.Text)
    contact_email = db.Column(db.String(120), nullable=False)
    contact_phone = db.Column(db.String(20), nullable=False)
    website = db.Column(db.String(200))
    logo_url = db.Column(db.String(500))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Vendor {self.business_name}>'

class VendorAssignment(db.Model):
    __tablename__ = 'vendor_assignments'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)
    assigned_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='active')  # active, removed

    def __repr__(self):
        return f'<VendorAssignment {self.vendor_id} - {self.event_id}>'
