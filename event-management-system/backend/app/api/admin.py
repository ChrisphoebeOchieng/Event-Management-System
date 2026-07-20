from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserRole
from app.models.event import Event
from app.models.booking import Booking
from app.models.vendor import Vendor
from app.models.recommendation import UserInteraction, UserPreference
from app.schemas.user import UserResponseSchema
import bcrypt
from marshmallow import ValidationError
import traceback

admin_bp = Blueprint('admin', __name__)

def is_admin(user_id):
    user = User.query.get(int(user_id))
    return user and user.role == UserRole.ADMIN

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.all()
    response_schema = UserResponseSchema(many=True)
    return jsonify(response_schema.dump(users)), 200

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
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
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    new_role = data.get('role', '').upper()

    valid_roles = ['ADMIN', 'ORGANIZER', 'ATTENDEE', 'VENDOR']
    if new_role not in valid_roles:
        return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400

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
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    is_active = data.get('is_active', True)

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
    try:
        print(f"Attempting to delete user with ID: {user_id}")
        
        admin_id = get_jwt_identity()
        print(f"Admin ID: {admin_id}")
        
        if not is_admin(admin_id):
            print("User is not admin")
            return jsonify({'error': 'Admin access required'}), 403

        user = User.query.get(user_id)
        print(f"User found: {user}")
        
        if not user:
            print("User not found")
            return jsonify({'error': 'User not found'}), 404

        # Prevent deleting the last admin
        if user.role == UserRole.ADMIN:
            admin_count = User.query.filter_by(role=UserRole.ADMIN).count()
            print(f"Admin count: {admin_count}")
            if admin_count <= 1:
                return jsonify({'error': 'Cannot delete the last admin'}), 400

        # Delete all related records in correct order
        print("Deleting user interactions...")
        UserInteraction.query.filter_by(user_id=user_id).delete()
        
        print("Deleting user preferences...")
        UserPreference.query.filter_by(user_id=user_id).delete()
        
        print("Deleting bookings...")
        Booking.query.filter_by(user_id=user_id).delete()
        
        print("Deleting events created by user...")
        Event.query.filter_by(created_by=user_id).delete()
        
        # Check if user has a vendor profile and delete it first
        vendor = Vendor.query.filter_by(user_id=user_id).first()
        if vendor:
            print(f"Deleting vendor profile for user {user_id}...")
            db.session.delete(vendor)
        
        print("Deleting user...")
        db.session.delete(user)
        db.session.commit()
        
        print(f"User {user_id} deleted successfully")
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
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
