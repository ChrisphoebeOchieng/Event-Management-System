from flask import Flask, send_from_directory, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_babel import Babel, _
from config.config import config
import os
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
babel = Babel()

def get_locale():
    """Get the user's preferred language"""
    # Check if language is in the request headers
    lang = request.headers.get('Accept-Language', 'en')
    if lang:
        # Return the first language in the list
        return lang.split(',')[0].split(';')[0]
    return 'en'

def get_timezone():
    """Get the user's timezone"""
    # Default to UTC
    return 'UTC'

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Babel configuration
    app.config['BABEL_DEFAULT_LOCALE'] = 'en'
    app.config['BABEL_TRANSLATION_DIRECTORIES'] = os.path.join(app.root_path, 'translations')

    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

    upload_path = os.path.join(app.root_path, '..', 'uploads', 'profiles')
    os.makedirs(upload_path, exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Initialize Babel
    babel.init_app(app, locale_selector=get_locale, timezone_selector=get_timezone)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    from app.models import User, Event, Booking, Vendor, VendorAssignment, UserInteraction, UserPreference, Refund, Reminder

    from app.api.auth import auth_bp
    from app.api.events import events_bp
    from app.api.bookings import bookings_bp
    from app.api.payments import payments_bp
    from app.api.vendors import vendors_bp
    from app.api.recommendations import recommendations_bp
    from app.api.upload import upload_bp
    from app.api.admin import admin_bp
    from app.api.ai_recommendations import ai_bp
    from app.api.refunds import refunds_bp
    from app.api.analytics import analytics_bp
    from app.api.test_email import test_email_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(vendors_bp, url_prefix='/api/vendors')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(refunds_bp, url_prefix='/api/refunds')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(test_email_bp, url_prefix='/api/email')

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory('uploads', filename)

    @app.route('/')
    def hello():
        return {'message': _('Event Management System API is running!')}

    @app.route('/health')
    def health():
        return {'status': 'healthy', 'database': 'connected'}

    return app
