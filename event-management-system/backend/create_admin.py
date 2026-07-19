import bcrypt
from app import create_app, db
from app.models.user import User, UserRole

app = create_app()

with app.app_context():
    # Check if admin already exists
    existing_admin = User.query.filter_by(email='admin@eventsphere.com').first()
    
    if existing_admin:
        print("Admin user already exists. Updating password...")
        # Update password
        hashed = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
        existing_admin.password_hash = hashed.decode('utf-8')
        existing_admin.role = UserRole.ADMIN
        db.session.commit()
        print("Admin password updated successfully!")
    else:
        print("Creating new admin user...")
        # Create new admin
        hashed = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
        admin = User(
            username='admin',
            email='admin@eventsphere.com',
            password_hash=hashed.decode('utf-8'),
            first_name='Super',
            last_name='Admin',
            phone_number='0712345678',
            role=UserRole.ADMIN,
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin user created successfully!")
    
    # Verify
    admin = User.query.filter_by(email='admin@eventsphere.com').first()
    print(f"Admin ID: {admin.id}")
    print(f"Admin Email: {admin.email}")
    print(f"Admin Role: {admin.role}")
    print(f"Admin Active: {admin.is_active}")
