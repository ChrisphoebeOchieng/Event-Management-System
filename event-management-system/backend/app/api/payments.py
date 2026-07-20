from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.booking import Booking
from app.models.event import Event
from app.models.user import User
from app.services.email_service import EmailService
from datetime import datetime

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/create-payment-intent/<int:booking_id>', methods=['POST'])
@jwt_required()
def create_payment_intent(booking_id):
    """Create a payment intent for a booking"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    if int(user_id) != booking.user_id and user.role.value != 'admin':
        return jsonify({'error': 'You are not authorized to pay for this booking'}), 403

    if booking.payment_status == 'paid':
        return jsonify({'error': 'Booking already paid'}), 400

    return jsonify({
        'client_secret': f'pi_test_{booking.booking_reference}',
        'payment_intent_id': f'pi_test_{booking.booking_reference}',
        'amount': booking.total_amount,
        'currency': 'kes',
        'booking_reference': booking.booking_reference
    }), 200

@payments_bp.route('/confirm-payment', methods=['POST'])
@jwt_required()
def confirm_payment():
    """Confirm a payment"""
    user_id = get_jwt_identity()
    data = request.json
    payment_intent_id = data.get('payment_intent_id')
    booking_reference = data.get('booking_reference')

    if not payment_intent_id or not booking_reference:
        return jsonify({'error': 'Payment intent ID and booking reference required'}), 400

    booking = Booking.query.filter_by(booking_reference=booking_reference).first()
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    if int(user_id) != booking.user_id:
        return jsonify({'error': 'You are not authorized to confirm this payment'}), 403

    # Update booking
    booking.payment_status = 'paid'
    booking.paid_at = datetime.utcnow()
    booking.payment_method = 'card'
    booking.payment_reference = payment_intent_id
    
    db.session.commit()

    # Send confirmation email
    try:
        email_service = EmailService()
        event = Event.query.get(booking.event_id)
        user = User.query.get(booking.user_id)
        if event and user:
            email_service.send_payment_confirmation(booking, event, user)
    except Exception as e:
        print(f"Email error: {e}")

    return jsonify({
        'success': True,
        'message': 'Payment confirmed successfully',
        'booking_reference': booking.booking_reference,
        'payment_status': booking.payment_status
    }), 200

@payments_bp.route('/booking/<string:booking_reference>/status', methods=['GET'])
@jwt_required()
def get_payment_status(booking_reference):
    """Get payment status for a booking"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    booking = Booking.query.filter_by(booking_reference=booking_reference).first()
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    if int(user_id) != booking.user_id and user.role.value != 'admin':
        return jsonify({'error': 'You are not authorized to view this payment'}), 403

    return jsonify({
        'booking_reference': booking.booking_reference,
        'payment_status': booking.payment_status,
        'payment_method': booking.payment_method,
        'payment_reference': booking.payment_reference,
        'paid_at': booking.paid_at.isoformat() if booking.paid_at else None,
        'total_amount': booking.total_amount
    }), 200
