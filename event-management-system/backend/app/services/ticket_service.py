import qrcode
import json
import os
from io import BytesIO
import base64
from datetime import datetime
from app import db
from app.models.booking import Booking
from app.models.event import Event
from app.models.user import User

class TicketService:
    @staticmethod
    def generate_ticket(booking_id):
        """Generate a full ticket with QR code"""
        booking = Booking.query.get(booking_id)
        if not booking:
            return None

        # Get event using event_id
        event = Event.query.get(booking.event_id)
        attendee = User.query.get(booking.user_id)

        # Generate ticket number if not exists
        if not booking.ticket_number:
            booking.ticket_number = booking.generate_ticket_number()
        
        # Generate QR code data
        qr_data = {
            'ticket_number': booking.ticket_number,
            'booking_reference': booking.booking_reference,
            'event_id': booking.event_id,
            'user_id': booking.user_id,
            'number_of_tickets': booking.number_of_tickets,
            'event_title': event.title if event else 'Unknown Event',
            'attendee_name': attendee.full_name if attendee else 'Attendee',
            'issued_at': datetime.utcnow().isoformat()
        }
        
        booking.qr_code_data = json.dumps(qr_data)
        booking.ticket_issued_at = datetime.utcnow()
        
        db.session.commit()
        
        # Generate QR code image
        qr_code_base64 = TicketService.generate_qr_code_image(qr_data)
        
        return {
            'ticket_number': booking.ticket_number,
            'booking_reference': booking.booking_reference,
            'qr_code': qr_code_base64,
            'event': {
                'title': event.title if event else 'Unknown',
                'venue': event.venue if event else 'Unknown',
                'start_date': event.start_date.isoformat() if event else None,
                'city': event.city if event else 'Unknown'
            },
            'attendee': {
                'name': attendee.full_name if attendee else 'Unknown',
                'email': attendee.email if attendee else 'Unknown'
            },
            'ticket_details': {
                'number_of_tickets': booking.number_of_tickets,
                'total_amount': booking.total_amount,
                'status': booking.status
            }
        }

    @staticmethod
    def generate_qr_code_image(data):
        """Generate QR code as base64 string"""
        # Convert data to JSON string
        json_data = json.dumps(data)
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(json_data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"

    @staticmethod
    def validate_ticket(ticket_number):
        """Validate a ticket for check-in"""
        booking = Booking.query.filter_by(ticket_number=ticket_number).first()
        
        if not booking:
            return {'valid': False, 'message': 'Invalid ticket number'}
        
        if booking.ticket_checked_in:
            return {'valid': False, 'message': 'Ticket already checked in'}
        
        if booking.status != 'confirmed':
            return {'valid': False, 'message': f'Ticket status is {booking.status}'}
        
        # Check if event is in the future
        event = Event.query.get(booking.event_id)
        if event and event.start_date < datetime.utcnow():
            return {'valid': False, 'message': 'Event has already passed'}
        
        return {
            'valid': True,
            'booking': booking,
            'message': 'Ticket is valid'
        }

    @staticmethod
    def check_in_ticket(ticket_number, checker_id=None):
        """Check in a ticket"""
        validation = TicketService.validate_ticket(ticket_number)
        
        if not validation['valid']:
            return validation
        
        booking = validation['booking']
        booking.ticket_checked_in = True
        booking.checked_in_at = datetime.utcnow()
        
        if checker_id:
            # Log who checked in the ticket
            checker = User.query.get(checker_id)
            if checker:
                print(f"Ticket {ticket_number} checked in by {checker.full_name}")
        
        db.session.commit()
        
        return {
            'valid': True,
            'message': 'Ticket checked in successfully',
            'booking': booking
        }

    @staticmethod
    def get_ticket_details(ticket_number):
        """Get ticket details by ticket number"""
        booking = Booking.query.filter_by(ticket_number=ticket_number).first()
        
        if not booking:
            return {'error': 'Ticket not found'}
        
        event = Event.query.get(booking.event_id)
        attendee = User.query.get(booking.user_id)
        
        return {
            'ticket_number': booking.ticket_number,
            'booking_reference': booking.booking_reference,
            'event': {
                'title': event.title if event else 'Unknown',
                'venue': event.venue if event else 'Unknown',
                'start_date': event.start_date.isoformat() if event else None,
                'city': event.city if event else 'Unknown'
            },
            'attendee': {
                'name': attendee.full_name if attendee else 'Unknown',
                'email': attendee.email if attendee else 'Unknown'
            },
            'ticket_details': {
                'number_of_tickets': booking.number_of_tickets,
                'total_amount': booking.total_amount,
                'status': booking.status,
                'checked_in': booking.ticket_checked_in,
                'checked_in_at': booking.checked_in_at.isoformat() if booking.checked_in_at else None
            }
        }
