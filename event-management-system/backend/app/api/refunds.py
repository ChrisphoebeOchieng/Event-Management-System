from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.refund_service import RefundService
from app.models.user import User

refunds_bp = Blueprint('refunds', __name__)

@refunds_bp.route('/request', methods=['POST'])
@jwt_required()
def request_refund():
    """Request a refund for a booking"""
    user_id = get_jwt_identity()
    data = request.json
    
    booking_id = data.get('booking_id')
    reason = data.get('reason')
    
    if not booking_id or not reason:
        return jsonify({'error': 'Booking ID and reason are required'}), 400
    
    result = RefundService.create_refund_request(booking_id, int(user_id), reason)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    
    return jsonify(result), 201

@refunds_bp.route('/status/<int:refund_id>', methods=['GET'])
@jwt_required()
def get_refund_status(refund_id):
    """Get the status of a refund request"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    result = RefundService.get_refund_status(refund_id)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 404
    
    # Check if user is authorized
    refund = RefundService.get_refund_status(refund_id)
    if user.role.value != 'admin':
        # Check if user owns this refund
        from app.models.refund import Refund
        refund_obj = Refund.query.get(refund_id)
        if refund_obj and refund_obj.user_id != int(user_id):
            return jsonify({'error': 'You are not authorized to view this refund'}), 403
    
    return jsonify(result), 200

@refunds_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_refunds():
    """Get all refund requests for the current user"""
    user_id = get_jwt_identity()
    result = RefundService.get_user_refunds(int(user_id))
    return jsonify(result), 200

@refunds_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_refunds():
    """Get all refund requests (Admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if user.role.value != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    result = RefundService.get_all_refunds()
    return jsonify(result), 200

@refunds_bp.route('/process/<int:refund_id>', methods=['POST'])
@jwt_required()
def process_refund(refund_id):
    """Process a refund request (Admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if user.role.value != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.json
    action = data.get('action')  # 'approve' or 'reject'
    admin_notes = data.get('admin_notes')
    
    if action not in ['approve', 'reject']:
        return jsonify({'error': 'Invalid action. Use "approve" or "reject"'}), 400
    
    result = RefundService.process_refund(refund_id, action, admin_notes, int(user_id))
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    
    return jsonify(result), 200

@refunds_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_refund_stats():
    """Get refund statistics (Admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if user.role.value != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    result = RefundService.get_refund_statistics()
    return jsonify(result), 200
