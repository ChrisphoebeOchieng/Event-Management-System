from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ai_recommendations import AIRecommendationService
from app.schemas.event import EventResponseSchema

ai_bp = Blueprint('ai', __name__)

# Initialize the AI service
ai_service = AIRecommendationService()

@ai_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_ai_recommendations():
    """Get AI-powered event recommendations using OpenAI"""
    user_id = get_jwt_identity()
    limit = request.args.get('limit', 5, type=int)

    try:
        recommended_events = ai_service.get_recommendations(
            user_id=int(user_id),
            limit=limit
        )

        response_schema = EventResponseSchema(many=True)
        return jsonify({
            'message': 'AI recommendations generated',
            'count': len(recommended_events),
            'events': response_schema.dump(recommended_events)
        }), 200

    except Exception as e:
        print(f"AI recommendations error: {e}")
        return jsonify({
            'error': 'Failed to generate AI recommendations',
            'message': str(e)
        }), 500
