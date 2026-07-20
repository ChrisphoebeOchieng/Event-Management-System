from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.email_service import EmailService
from app.models.user import User

test_email_bp = Blueprint('test_email', __name__)

@test_email_bp.route('/send-test', methods=['POST'])
@jwt_required()
def send_test_email():
    """Send a test email to verify configuration"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    email_service = EmailService()
    result = email_service.test_email(user.email)
    
    if result:
        return jsonify({
            'success': True,
            'message': f'Test email sent to {user.email}',
            'to': user.email
        }), 200
    else:
        return jsonify({
            'success': False,
            'error': 'Failed to send test email. Check email configuration.'
        }), 500

@test_email_bp.route('/status', methods=['GET'])
@jwt_required()
def get_email_status():
    """Check email configuration status"""
    email_service = EmailService()
    is_configured = bool(email_service.username and email_service.password)
    
    return jsonify({
        'configured': is_configured,
        'smtp_server': email_service.smtp_server if hasattr(email_service, 'smtp_server') else 'Not configured',
        'username': email_service.username if is_configured else None,
        'message': 'Email service is configured' if is_configured else 'Email service is running in console mode'
    }), 200
