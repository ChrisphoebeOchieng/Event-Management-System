from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ai_chat import AIChatService

chat_bp = Blueprint('chat', __name__)
chat_service = AIChatService()

@chat_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    """Send a message to the AI chat assistant"""
    user_id = get_jwt_identity()
    data = request.json
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400

    try:
        response = chat_service.get_chat_response(
            user_id=int(user_id),
            message=message
        )
        return jsonify({
            'message': response,
            'success': True
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500
