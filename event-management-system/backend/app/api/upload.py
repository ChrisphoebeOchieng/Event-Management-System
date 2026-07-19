import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models.user import User
import uuid

upload_bp = Blueprint('upload', __name__)

# Configure upload settings
UPLOAD_FOLDER = 'uploads/profiles'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use PNG, JPG, JPEG, GIF, or WEBP'}), 400

    # Create upload directory if it doesn't exist
    upload_path = os.path.join(current_app.root_path, '..', UPLOAD_FOLDER)
    os.makedirs(upload_path, exist_ok=True)

    # Generate unique filename
    file_extension = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(upload_path, unique_filename)

    # Save file
    file.save(file_path)

    # Update user with profile picture path
    user.profile_picture = f"/{UPLOAD_FOLDER}/{unique_filename}"
    db.session.commit()

    return jsonify({
        'message': 'Profile picture uploaded successfully',
        'profile_picture': user.profile_picture
    }), 200

@upload_bp.route('/profile-picture', methods=['DELETE'])
@jwt_required()
def delete_profile_picture():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.profile_picture:
        # Delete the file
        file_path = os.path.join(current_app.root_path, '..', user.profile_picture.lstrip('/'))
        if os.path.exists(file_path):
            os.remove(file_path)
        
        user.profile_picture = None
        db.session.commit()

    return jsonify({'message': 'Profile picture removed'}), 200
