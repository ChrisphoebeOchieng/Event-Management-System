from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from app import db
from app.models.user import User, UserRole
from app.schemas.user import UserRegistrationSchema, UserLoginSchema, UserResponseSchema
import bcrypt
from marshmallow import ValidationError
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        print("Received data:", request.json)
        schema = UserRegistrationSchema()
        data = schema.load(request.json)
        print("Validated data:", data)
    except ValidationError as err:
        print("Validation error:", err.messages)
        return jsonify({'errors': err.messages}), 400
    except Exception as e:
        print("Unexpected error:", str(e))
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400

    hashed_password = bcrypt.hashpw(
        data['password'].encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password,
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone_number=data.get('phone_number', ''),
        role=UserRole.ATTENDEE
    )

    db.session.add(user)
    db.session.commit()

    response_schema = UserResponseSchema()
    return jsonify({
        'message': 'User registered successfully',
        'user': response_schema.dump(user)
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        print("Login attempt with:", request.json)
        schema = UserLoginSchema()
        data = schema.load(request.json)
        print("Login validated:", data)
    except ValidationError as err:
        print("Login validation error:", err.messages)
        return jsonify({'errors': err.messages}), 400

    user = User.query.filter_by(email=data['email']).first()
    print("User found:", user)

    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    if not bcrypt.checkpw(
        data['password'].encode('utf-8'),
        user.password_hash.encode('utf-8')
    ):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 401

    # Convert id to string for JWT identity
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            'username': user.username,
            'email': user.email,
            'role': user.role.value
        }
    )
    print("Token created:", access_token[:50] + "...")

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role.value
        }
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    print("User ID from token:", user_id)
    
    # Convert string back to int for database query
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    response_schema = UserResponseSchema()
    return jsonify(response_schema.dump(user)), 200

@auth_bp.route('/test-token', methods=['GET'])
def test_token():
    """Test endpoint to see if token is being sent correctly"""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        return jsonify({
            'message': 'Token is valid!',
            'user_id': user_id
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'type': type(e).__name__
        }), 401
