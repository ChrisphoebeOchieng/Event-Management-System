from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.booking import Booking
from app.models.event import Event
from app.models.user import User
from app.schemas.booking import BookingCreateSchema, BookingResponseSchema
from app.services.ticket_service import TicketService
from marshmallow import ValidationError
from datetime import datetime
import random
import string
import io
import qrcode

bookings_bp = Blueprint('bookings', __name__)

def generate_booking_reference():
    return 'BK' + ''.join(random.choices(string.digits, k=8))

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    try:
        schema = BookingCreateSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    event = Event.query.get(data['event_id'])
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.status != 'published':
        return jsonify({'error': 'Event is not available for booking'}), 400

    if event.capacity < data['number_of_tickets']:
        return jsonify({'error': 'Not enough tickets available'}), 400

    total_amount = event.ticket_price * data['number_of_tickets']

    booking_reference = generate_booking_reference()
    while Booking.query.filter_by(booking_reference=booking_reference).first():
        booking_reference = generate_booking_reference()

    booking = Booking(
        booking_reference=booking_reference,
        user_id=int(user_id),
        event_id=data['event_id'],
        number_of_tickets=data['number_of_tickets'],
        total_amount=total_amount,
        status='confirmed',
        payment_status='pending'
    )

    event.capacity -= data['number_of_tickets']

    db.session.add(booking)
    db.session.commit()

    response_schema = BookingResponseSchema()
    return jsonify({
        'message': 'Booking created successfully',
        'booking': response_schema.dump(booking)
    }), 201

@bookings_bp.route('/', methods=['GET'])
@jwt_required()
def get_my_bookings():
    user_id = get_jwt_identity()
    bookings = Booking.query.filter_by(user_id=int(user_id)).order_by(Booking.booked_at.desc()).all()

    response_schema = BookingResponseSchema(many=True)
    return jsonify(response_schema.dump(bookings)), 200

@bookings_bp.route('/<string:booking_reference>', methods=['GET'])
@jwt_required()
def get_booking(booking_reference):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    booking = Booking.query.filter_by(booking_reference=booking_reference).first()

    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    if int(user_id) != booking.user_id and user.role.value != 'admin':
        return jsonify({'error': 'You are not authorized to view this booking'}), 403

    response_schema = BookingResponseSchema()
    return jsonify(response_schema.dump(booking)), 200

@bookings_bp.route('/<string:booking_reference>/cancel', methods=['PUT'])
@jwt_required()
def cancel_booking(booking_reference):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    booking = Booking.query.filter_by(booking_reference=booking_reference).first()

    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    if int(user_id) != booking.user_id and user.role.value != 'admin':
        return jsonify({'error': 'You are not authorized to cancel this booking'}), 403

    if booking.status in ['cancelled', 'refunded']:
        return jsonify({'error': f'Booking is already {booking.status}'}), 400

    event = Event.query.get(booking.event_id)
    if event:
        event.capacity += booking.number_of_tickets

    booking.status = 'cancelled'

    db.session.commit()

    return jsonify({
        'message': 'Booking cancelled successfully',
        'booking': {
            'booking_reference': booking.booking_reference,
            'status': booking.status
        }
    }), 200

@bookings_bp.route('/<string:booking_reference>/ticket', methods=['GET'])
@jwt_required()
def get_ticket(booking_reference):
    """Generate and return a ticket with QR code"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    booking = Booking.query.filter_by(booking_reference=booking_reference).first()

    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    if int(user_id) != booking.user_id and user.role.value != 'admin':
        return jsonify({'error': 'You are not authorized to view this ticket'}), 403

    if booking.status != 'confirmed':
        return jsonify({'error': f'Ticket is not available (status: {booking.status})'}), 400

    # Generate or retrieve ticket
    ticket = TicketService.generate_ticket(booking.id)
    
    if not ticket:
        return jsonify({'error': 'Failed to generate ticket'}), 500

    return jsonify(ticket), 200

@bookings_bp.route('/ticket/validate/<string:ticket_number>', methods=['GET'])
@jwt_required()
def validate_ticket(ticket_number):
    """Validate a ticket for check-in (Admin/Organizer only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if user.role.value not in ['admin', 'organizer']:
        return jsonify({'error': 'Only admins and organizers can validate tickets'}), 403

    validation = TicketService.validate_ticket(ticket_number)
    return jsonify(validation), 200

@bookings_bp.route('/ticket/checkin/<string:ticket_number>', methods=['POST'])
@jwt_required()
def checkin_ticket(ticket_number):
    """Check in a ticket (Admin/Organizer only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if user.role.value not in ['admin', 'organizer']:
        return jsonify({'error': 'Only admins and organizers can check in tickets'}), 403

    result = TicketService.check_in_ticket(ticket_number, checker_id=int(user_id))
    return jsonify(result), 200

@bookings_bp.route('/ticket/<string:ticket_number>', methods=['GET'])
@jwt_required()
def get_ticket_details(ticket_number):
    """Get ticket details by ticket number"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    # Only admin/organizer or the ticket owner can view
    booking = Booking.query.filter_by(ticket_number=ticket_number).first()
    if not booking:
        return jsonify({'error': 'Ticket not found'}), 404

    if user.role.value not in ['admin', 'organizer'] and int(user_id) != booking.user_id:
        return jsonify({'error': 'You are not authorized to view this ticket'}), 403

    details = TicketService.get_ticket_details(ticket_number)
    return jsonify(details), 200
