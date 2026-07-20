from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.analytics_service import AnalyticsService
from app.models.user import User

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_overview():
    """Get overview statistics (Admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if user.role.value != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = AnalyticsService.get_overview_stats()
    return jsonify(data), 200

@analytics_bp.route('/monthly-revenue', methods=['GET'])
@jwt_required()
def get_monthly_revenue():
    """Get monthly revenue (Admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if user.role.value != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    months = request.args.get('months', 6, type=int)
    data = AnalyticsService.get_monthly_revenue(months)
    return jsonify(data), 200

@analytics_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get event categories distribution (Admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if user.role.value != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = AnalyticsService.get_event_categories()
    return jsonify(data), 200

@analytics_bp.route('/booking-status', methods=['GET'])
@jwt_required()
def get_booking_status():
    """Get booking status distribution (Admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if user.role.value != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = AnalyticsService.get_booking_status_distribution()
    return jsonify(data), 200

@analytics_bp.route('/user-growth', methods=['GET'])
@jwt_required()
def get_user_growth():
    """Get user growth over time (Admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if user.role.value != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    days = request.args.get('days', 30, type=int)
    data = AnalyticsService.get_user_growth(days)
    return jsonify(data), 200

@analytics_bp.route('/top-events', methods=['GET'])
@jwt_required()
def get_top_events():
    """Get top events by bookings (Admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if user.role.value != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    limit = request.args.get('limit', 10, type=int)
    data = AnalyticsService.get_top_events(limit)
    return jsonify(data), 200
