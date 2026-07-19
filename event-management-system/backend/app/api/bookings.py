from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.booking import Booking
from app.models.event import Event
from app.models.user import User
from app.schemas.booking import BookingCreateSchema, BookingResponseSchema
from marshmallow import ValidationError
from datetime import datetime
import random
import string

bookings_bp = Blueprint('bookings', __name__)

def generate_booking_reference():
    """Generate a unique booking reference"""
    return 'BK' + ''.join(random.choices(string.digits, k=8))

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    """Create a new booking for an event"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    try:
        schema = BookingCreateSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    # Check if event exists
    event = Event.query.get(data['event_id'])
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    # Check if event is published
    if event.status != 'published':
        return jsonify({'error': 'Event is not available for booking'}), 400

    # Check if event has enough capacity
    if event.capacity < data['number_of_tickets']:
        return jsonify({'error': 'Not enough tickets available'}), 400

    # Calculate total amount
    total_amount = event.ticket_price * data['number_of_tickets']

    # Generate unique booking reference
    booking_reference = generate_booking_reference()
    while Booking.query.filter_by(booking_reference=booking_reference).first():
        booking_reference = generate_booking_reference()

    # Create booking
    booking = Booking(
        booking_reference=booking_reference,
        user_id=int(user_id),
        event_id=data['event_id'],
        number_of_tickets=data['number_of_tickets'],
        total_amount=total_amount,
        status='confirmed',
        payment_status='pending'
    )

    # Reduce event capacity
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
    """Get all bookings for the authenticated user"""
    user_id = get_jwt_identity()
    bookings = Booking.query.filter_by(user_id=int(user_id)).order_by(Booking.booked_at.desc()).all()

    response_schema = BookingResponseSchema(many=True)
    return jsonify(response_schema.dump(bookings)), 200

@bookings_bp.route('/<string:booking_reference>', methods=['GET'])
@jwt_required()
def get_booking(booking_reference):
    """Get a specific booking by reference"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    booking = Booking.query.filter_by(booking_reference=booking_reference).first()

    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    # Check if user owns this booking or is admin
    if int(user_id) != booking.user_id and user.role.value != 'admin':
        return jsonify({'error': 'You are not authorized to view this booking'}), 403

    response_schema = BookingResponseSchema()
    return jsonify(response_schema.dump(booking)), 200

@bookings_bp.route('/<string:booking_reference>/cancel', methods=['PUT'])
@jwt_required()
def cancel_booking(booking_reference):
    """Cancel a booking"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    booking = Booking.query.filter_by(booking_reference=booking_reference).first()

    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    # Check if user owns this booking or is admin
    if int(user_id) != booking.user_id and user.role.value != 'admin':
        return jsonify({'error': 'You are not authorized to cancel this booking'}), 403

    # Check if booking is already cancelled or refunded
    if booking.status in ['cancelled', 'refunded']:
        return jsonify({'error': f'Booking is already {booking.status}'}), 400

    # Restore event capacity
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

@bookings_bp.route('/event/<int:event_id>/bookings', methods=['GET'])
@jwt_required()
def get_event_bookings(event_id):
    """Get all bookings for a specific event (organizer/admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    # Check if user is the event organizer or admin
    if int(user_id) != event.created_by and user.role.value != 'admin':
        return jsonify({'error': 'You are not authorized to view bookings for this event'}), 403

    bookings = Booking.query.filter_by(event_id=event_id).order_by(Booking.booked_at.desc()).all()

    response_schema = BookingResponseSchema(many=True)
    return jsonify(response_schema.dump(bookings)), 200
