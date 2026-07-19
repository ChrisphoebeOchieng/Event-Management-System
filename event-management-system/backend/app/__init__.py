from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config.config import config
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Upload configuration
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size

    # Create uploads directory
    upload_path = os.path.join(app.root_path, '..', 'uploads', 'profiles')
    os.makedirs(upload_path, exist_ok=True)

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"], supports_credentials=True)

    # Import models
    from app.models import User, Event, Booking, Vendor, VendorAssignment, UserInteraction, UserPreference

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.events import events_bp
    from app.api.bookings import bookings_bp
    from app.api.payments import payments_bp
    from app.api.vendors import vendors_bp
    from app.api.recommendations import recommendations_bp
    from app.api.upload import upload_bp
    from app.api.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(vendors_bp, url_prefix='/api/vendors')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory('uploads', filename)

    @app.route('/')
    def hello():
        return {'message': 'Event Management System API is running!'}

    @app.route('/health')
    def health():
        return {'status': 'healthy', 'database': 'connected'}

    return app
