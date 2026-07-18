from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.booking import Booking
from app.models.user import User
from app.models.event import Event
from datetime import datetime

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/process/<string:booking_reference>', methods=['POST'])
@jwt_required()
def process_payment(booking_reference):
    """Process payment for a booking"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    booking = Booking.query.filter_by(booking_reference=booking_reference).first()

    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    # Check if user owns this booking
    if int(user_id) != booking.user_id:
        return jsonify({'error': 'You are not authorized to pay for this booking'}), 403

    # Check if booking is already paid
    if booking.payment_status == 'paid':
        return jsonify({'error': 'Booking is already paid'}), 400

    # Check if booking is cancelled
    if booking.status == 'cancelled':
        return jsonify({'error': 'Cannot pay for a cancelled booking'}), 400

    try:
        data = request.json
        payment_method = data.get('payment_method', 'mpesa')
        mpesa_code = data.get('mpesa_code')

        # Validate M-Pesa code if using M-Pesa
        if payment_method == 'mpesa' and not mpesa_code:
            return jsonify({'error': 'M-Pesa code is required'}), 400

        # Process payment (simulated)
        # In production, you would integrate with a real payment gateway here

        # Update booking payment status
        booking.payment_status = 'paid'
        booking.payment_method = payment_method
        booking.payment_reference = f'PAY-{booking_reference}-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}'
        booking.mpesa_code = mpesa_code if payment_method == 'mpesa' else None
        booking.paid_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'message': 'Payment processed successfully',
            'booking': {
                'booking_reference': booking.booking_reference,
                'payment_status': booking.payment_status,
                'payment_method': booking.payment_method,
                'payment_reference': booking.payment_reference,
                'mpesa_code': booking.mpesa_code,
                'paid_at': booking.paid_at.isoformat() if booking.paid_at else None
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/booking/<string:booking_reference>/status', methods=['GET'])
@jwt_required()
def get_payment_status(booking_reference):
    """Get payment status for a booking"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    booking = Booking.query.filter_by(booking_reference=booking_reference).first()

    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    # Check if user owns this booking or is admin
    if int(user_id) != booking.user_id and user.role.value != 'admin':
        return jsonify({'error': 'You are not authorized to view this payment'}), 403

    return jsonify({
        'booking_reference': booking.booking_reference,
        'payment_status': booking.payment_status,
        'payment_method': booking.payment_method,
        'payment_reference': booking.payment_reference,
        'mpesa_code': booking.mpesa_code,
        'paid_at': booking.paid_at.isoformat() if booking.paid_at else None,
        'total_amount': booking.total_amount
    }), 200

@payments_bp.route('/booking/<string:booking_reference>/refund', methods=['POST'])
@jwt_required()
def refund_payment(booking_reference):
    """Refund a payment (admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    # Only admin can process refunds
    if user.role.value != 'admin':
        return jsonify({'error': 'Only admins can process refunds'}), 403

    booking = Booking.query.filter_by(booking_reference=booking_reference).first()

    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    # Check if booking is paid
    if booking.payment_status != 'paid':
        return jsonify({'error': 'Booking is not paid'}), 400

    # Check if already refunded
    if booking.status == 'refunded':
        return jsonify({'error': 'Booking is already refunded'}), 400

    # Process refund (simulated)
    booking.payment_status = 'refunded'
    booking.status = 'refunded'

    # Restore event capacity
    event = Event.query.get(booking.event_id)
    if event:
        event.capacity += booking.number_of_tickets

    db.session.commit()

    return jsonify({
        'message': 'Refund processed successfully',
        'booking': {
            'booking_reference': booking.booking_reference,
            'payment_status': booking.payment_status,
            'status': booking.status
        }
    }), 200
