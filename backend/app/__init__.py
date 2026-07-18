from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config.config import config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Import models
    from app.models import User, Event, Booking, Vendor, VendorAssignment, UserInteraction, UserPreference

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.events import events_bp
    from app.api.bookings import bookings_bp
    from app.api.payments import payments_bp
    from app.api.vendors import vendors_bp
    from app.api.recommendations import recommendations_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(vendors_bp, url_prefix='/api/vendors')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')

    @app.route('/')
    def hello():
        return {'message': 'Event Management System API is running!'}

    @app.route('/health')
    def health():
        return {'status': 'healthy', 'database': 'connected'}

    return app
