from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserRole
from app.schemas.user import UserResponseSchema
import bcrypt
from marshmallow import ValidationError

admin_bp = Blueprint('admin', __name__)

def is_admin(user_id):
    user = User.query.get(int(user_id))
    return user and user.role == UserRole.ADMIN

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (Admin only)"""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.all()
    response_schema = UserResponseSchema(many=True)
    return jsonify(response_schema.dump(users)), 200

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get a specific user by ID (Admin only)"""
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    response_schema = UserResponseSchema()
    return jsonify(response_schema.dump(user)), 200

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    """Update user role (Admin only)"""
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    new_role = data.get('role', '').upper()

    # Validate role
    valid_roles = ['ADMIN', 'ORGANIZER', 'ATTENDEE', 'VENDOR']
    if new_role not in valid_roles:
        return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400

    # Prevent removing the last admin
    if user.role == UserRole.ADMIN and new_role != 'ADMIN':
        admin_count = User.query.filter_by(role=UserRole.ADMIN).count()
        if admin_count <= 1:
            return jsonify({'error': 'Cannot remove the last admin'}), 400

    user.role = UserRole[new_role]
    db.session.commit()

    response_schema = UserResponseSchema()
    return jsonify({
        'message': f'User role updated to {new_role}',
        'user': response_schema.dump(user)
    }), 200

@admin_bp.route('/users/<int:user_id>/activate', methods=['PUT'])
@jwt_required()
def toggle_user_active(user_id):
    """Activate or deactivate a user (Admin only)"""
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    is_active = data.get('is_active', True)

    # Prevent deactivating the last admin
    if user.role == UserRole.ADMIN and not is_active:
        admin_count = User.query.filter_by(role=UserRole.ADMIN).count()
        if admin_count <= 1:
            return jsonify({'error': 'Cannot deactivate the last admin'}), 400

    user.is_active = is_active
    db.session.commit()

    response_schema = UserResponseSchema()
    return jsonify({
        'message': f'User {"activated" if is_active else "deactivated"}',
        'user': response_schema.dump(user)
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete a user (Admin only)"""
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Prevent deleting the last admin
    if user.role == UserRole.ADMIN:
        admin_count = User.query.filter_by(role=UserRole.ADMIN).count()
        if admin_count <= 1:
            return jsonify({'error': 'Cannot delete the last admin'}), 400

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted successfully'}), 200

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Get user statistics (Admin only)"""
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403

    total_users = User.query.count()
    total_admins = User.query.filter_by(role=UserRole.ADMIN).count()
    total_organizers = User.query.filter_by(role=UserRole.ORGANIZER).count()
    total_attendees = User.query.filter_by(role=UserRole.ATTENDEE).count()
    total_vendors = User.query.filter_by(role=UserRole.VENDOR).count()
    active_users = User.query.filter_by(is_active=True).count()

    return jsonify({
        'total_users': total_users,
        'total_admins': total_admins,
        'total_organizers': total_organizers,
        'total_attendees': total_attendees,
        'total_vendors': total_vendors,
        'active_users': active_users,
        'inactive_users': total_users - active_users
    }), 200
