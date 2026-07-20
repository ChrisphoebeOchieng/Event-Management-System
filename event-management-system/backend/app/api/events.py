from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.event import Event
from app.models.user import User
from app.schemas.event import EventCreateSchema, EventUpdateSchema, EventResponseSchema
from marshmallow import ValidationError
from datetime import datetime

events_bp = Blueprint('events', __name__)

@events_bp.route('/', methods=['POST'])
@jwt_required()
def create_event():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or user.role.value not in ['organizer', 'admin']:
            return jsonify({'error': 'Only organizers and admins can create events'}), 403

        schema = EventCreateSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        print("Validation error:", err.messages)
        return jsonify({'errors': err.messages}), 400
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 400

    # Check dates
    start_date = data['start_date']
    end_date = data['end_date']
    
    if start_date >= end_date:
        return jsonify({'error': 'End date must be after start date'}), 400

    # Make datetime naive for comparison
    if start_date.tzinfo is not None:
        start_date = start_date.replace(tzinfo=None)
    
    now = datetime.utcnow()
    if start_date < now:
        return jsonify({'error': 'Start date cannot be in the past'}), 400

    event = Event(
        title=data['title'],
        description=data['description'],
        category=data['category'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        venue=data['venue'],
        address=data['address'],
        city=data['city'],
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        capacity=data['capacity'],
        ticket_price=data['ticket_price'],
        image_url=data.get('image_url'),
        status=data.get('status', 'draft'),
        is_featured=data.get('is_featured', False),
        created_by=int(user_id)
    )

    try:
        db.session.add(event)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print("Database error:", str(e))
        return jsonify({'error': 'Database error: ' + str(e)}), 500

    response_schema = EventResponseSchema()
    return jsonify({
        'message': 'Event created successfully',
        'event': response_schema.dump(event)
    }), 201

@events_bp.route('/', methods=['GET'])
def get_all_events():
    status = request.args.get('status')
    category = request.args.get('category')
    city = request.args.get('city')
    featured = request.args.get('featured')

    query = Event.query

    if status:
        query = query.filter(Event.status == status)
    else:
        query = query.filter(Event.status == 'published')

    if category:
        query = query.filter(Event.category == category)
    
    if city:
        query = query.filter(Event.city.ilike(f'%{city}%'))
    
    if featured and featured.lower() == 'true':
        query = query.filter(Event.is_featured == True)

    events = query.order_by(Event.start_date).all()

    response_schema = EventResponseSchema(many=True)
    return jsonify(response_schema.dump(events)), 200

@events_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.status != 'published':
        try:
            user_id = get_jwt_identity()
            if int(user_id) != event.created_by:
                return jsonify({'error': 'Event not found'}), 404
        except:
            return jsonify({'error': 'Event not found'}), 404

    response_schema = EventResponseSchema()
    return jsonify(response_schema.dump(event)), 200

@events_bp.route('/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        event = Event.query.get(event_id)

        if not event:
            return jsonify({'error': 'Event not found'}), 404

        if user.role.value != 'admin' and int(user_id) != event.created_by:
            return jsonify({'error': 'You are not authorized to update this event'}), 403

        schema = EventUpdateSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    for key, value in data.items():
        if value is not None:
            setattr(event, key, value)

    if data.get('start_date') and data.get('end_date'):
        if data['start_date'] >= data['end_date']:
            return jsonify({'error': 'End date must be after start date'}), 400

    db.session.commit()

    response_schema = EventResponseSchema()
    return jsonify({
        'message': 'Event updated successfully',
        'event': response_schema.dump(event)
    }), 200

@events_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    event = Event.query.get(event_id)

    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if user.role.value != 'admin' and int(user_id) != event.created_by:
        return jsonify({'error': 'You are not authorized to delete this event'}), 403

    db.session.delete(event)
    db.session.commit()

    return jsonify({'message': 'Event deleted successfully'}), 200

@events_bp.route('/my-events', methods=['GET'])
@jwt_required()
def get_my_events():
    user_id = get_jwt_identity()
    events = Event.query.filter_by(created_by=int(user_id)).order_by(Event.created_at.desc()).all()

    response_schema = EventResponseSchema(many=True)
    return jsonify(response_schema.dump(events)), 200
