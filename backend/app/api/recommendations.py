from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.event import Event
from app.models.booking import Booking
from app.models.recommendation import UserInteraction, UserPreference
from app.schemas.recommendation import UserInteractionSchema, UserPreferenceSchema, UserPreferenceResponseSchema
from marshmallow import ValidationError
from datetime import datetime, timedelta
import json
from sqlalchemy import func, desc

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('/interact', methods=['POST'])
@jwt_required()
def track_interaction():
    """Track user interaction with an event"""
    user_id = get_jwt_identity()

    try:
        schema = UserInteractionSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    # Check if event exists
    event = Event.query.get(data['event_id'])
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    # Create interaction
    interaction = UserInteraction(
        user_id=int(user_id),
        event_id=data['event_id'],
        interaction_type=data['interaction_type']
    )

    db.session.add(interaction)
    db.session.commit()

    return jsonify({
        'message': 'Interaction tracked successfully',
        'interaction': {
            'event_id': interaction.event_id,
            'interaction_type': interaction.interaction_type,
            'created_at': interaction.created_at.isoformat()
        }
    }), 201

@recommendations_bp.route('/preferences', methods=['POST'])
@jwt_required()
def set_preferences():
    """Set or update user preferences"""
    user_id = get_jwt_identity()

    try:
        schema = UserPreferenceSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    # Check if preferences already exist
    preference = UserPreference.query.filter_by(user_id=int(user_id)).first()

    if preference:
        # Update existing
        preference.preferred_categories = json.dumps(data.get('preferred_categories', []))
        preference.preferred_cities = json.dumps(data.get('preferred_cities', []))
        preference.price_min = data.get('price_min')
        preference.price_max = data.get('price_max')
    else:
        # Create new
        preference = UserPreference(
            user_id=int(user_id),
            preferred_categories=json.dumps(data.get('preferred_categories', [])),
            preferred_cities=json.dumps(data.get('preferred_cities', [])),
            price_min=data.get('price_min'),
            price_max=data.get('price_max')
        )
        db.session.add(preference)

    db.session.commit()

    response_schema = UserPreferenceResponseSchema()
    return jsonify({
        'message': 'Preferences saved successfully',
        'preferences': response_schema.dump(preference)
    }), 200

@recommendations_bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    """Get user preferences"""
    user_id = get_jwt_identity()
    preference = UserPreference.query.filter_by(user_id=int(user_id)).first()

    if not preference:
        return jsonify({
            'message': 'No preferences found',
            'preferences': None
        }), 200

    response_schema = UserPreferenceResponseSchema()
    return jsonify(response_schema.dump(preference)), 200

@recommendations_bp.route('/personalized', methods=['GET'])
@jwt_required()
def get_personalized_recommendations():
    """Get personalized event recommendations based on user interactions and preferences"""
    user_id = get_jwt_identity()

    # Get user preferences
    preference = UserPreference.query.filter_by(user_id=int(user_id)).first()

    # Get user's past interactions (events they've viewed, booked, etc.)
    interacted_events = db.session.query(UserInteraction.event_id).filter(
        UserInteraction.user_id == int(user_id)
    ).distinct().all()
    interacted_event_ids = [e[0] for e in interacted_events]

    # Get events the user has booked
    booked_events = db.session.query(Booking.event_id).filter(
        Booking.user_id == int(user_id),
        Booking.status != 'cancelled'
    ).distinct().all()
    booked_event_ids = [e[0] for e in booked_events]

    # Base query - exclude events user has interacted with or booked
    query = Event.query.filter(
        Event.status == 'published',
        Event.id.notin_(interacted_event_ids + booked_event_ids)
    )

    # Apply preferences if available
    if preference:
        try:
            preferred_categories = json.loads(preference.preferred_categories) if preference.preferred_categories else []
            preferred_cities = json.loads(preference.preferred_cities) if preference.preferred_cities else []

            if preferred_categories:
                query = query.filter(Event.category.in_(preferred_categories))

            if preferred_cities:
                query = query.filter(Event.city.in_(preferred_cities))

            if preference.price_min is not None:
                query = query.filter(Event.ticket_price >= preference.price_min)

            if preference.price_max is not None:
                query = query.filter(Event.ticket_price <= preference.price_max)
        except:
            pass

    # Order by featured events first, then by upcoming dates
    query = query.order_by(desc(Event.is_featured), Event.start_date)

    # Limit to 10 recommendations
    recommendations = query.limit(10).all()

    # If no recommendations, fallback to popular events
    if not recommendations:
        # Get popular events based on bookings
        popular_events = db.session.query(
            Event,
            func.count(Booking.id).label('booking_count')
        ).join(Booking, Booking.event_id == Event.id)\
         .filter(Event.status == 'published')\
         .group_by(Event.id)\
         .order_by(desc('booking_count'))\
         .limit(10).all()

        recommendations = [event for event, count in popular_events]

    from app.schemas.event import EventResponseSchema
    response_schema = EventResponseSchema(many=True)
    return jsonify(response_schema.dump(recommendations)), 200

@recommendations_bp.route('/popular', methods=['GET'])
def get_popular_events():
    """Get popular events based on booking count and interactions"""
    # Get events with most bookings
    popular_by_bookings = db.session.query(
        Event,
        func.count(Booking.id).label('booking_count')
    ).join(Booking, Booking.event_id == Event.id)\
     .filter(Event.status == 'published')\
     .group_by(Event.id)\
     .order_by(desc('booking_count'))\
     .limit(5).all()

    # Get events with most interactions
    popular_by_interactions = db.session.query(
        Event,
        func.count(UserInteraction.id).label('interaction_count')
    ).join(UserInteraction, UserInteraction.event_id == Event.id)\
     .filter(Event.status == 'published')\
     .group_by(Event.id)\
     .order_by(desc('interaction_count'))\
     .limit(5).all()

    # Combine and deduplicate
    popular_events = {}
    for event, count in popular_by_bookings:
        popular_events[event.id] = {'event': event, 'score': count * 2}
    
    for event, count in popular_by_interactions:
        if event.id in popular_events:
            popular_events[event.id]['score'] += count
        else:
            popular_events[event.id] = {'event': event, 'score': count}

    # Sort by score
    sorted_events = sorted(popular_events.values(), key=lambda x: x['score'], reverse=True)[:10]
    recommendations = [item['event'] for item in sorted_events]

    from app.schemas.event import EventResponseSchema
    response_schema = EventResponseSchema(many=True)
    return jsonify(response_schema.dump(recommendations)), 200

@recommendations_bp.route('/trending', methods=['GET'])
def get_trending_events():
    """Get trending events from the last 7 days"""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    # Get events with most interactions in the last 7 days
    trending = db.session.query(
        Event,
        func.count(UserInteraction.id).label('interaction_count')
    ).join(UserInteraction, UserInteraction.event_id == Event.id)\
     .filter(
         Event.status == 'published',
         UserInteraction.created_at >= seven_days_ago
     )\
     .group_by(Event.id)\
     .order_by(desc('interaction_count'))\
     .limit(10).all()

    recommendations = [event for event, count in trending]

    # If no trending events, return featured events
    if not recommendations:
        recommendations = Event.query.filter_by(status='published', is_featured=True).limit(10).all()

    from app.schemas.event import EventResponseSchema
    response_schema = EventResponseSchema(many=True)
    return jsonify(response_schema.dump(recommendations)), 200
