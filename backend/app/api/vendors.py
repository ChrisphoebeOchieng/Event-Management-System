from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.vendor import Vendor, VendorAssignment
from app.models.event import Event
from app.models.user import User
from app.schemas.vendor import (
    VendorCreateSchema,
    VendorUpdateSchema,
    VendorResponseSchema,
    VendorAssignmentSchema,
    VendorAssignmentResponseSchema
)
from marshmallow import ValidationError
from datetime import datetime

vendors_bp = Blueprint('vendors', __name__)

@vendors_bp.route('/', methods=['POST'])
@jwt_required()
def register_vendor():
    """Register as a vendor"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Check if user already has a vendor profile
    existing_vendor = Vendor.query.filter_by(user_id=int(user_id)).first()
    if existing_vendor:
        return jsonify({'error': 'You already have a vendor profile'}), 400

    try:
        schema = VendorCreateSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    vendor = Vendor(
        business_name=data['business_name'],
        business_type=data['business_type'],
        description=data.get('description', ''),
        contact_email=data['contact_email'],
        contact_phone=data['contact_phone'],
        website=data.get('website', ''),
        logo_url=data.get('logo_url', ''),
        user_id=int(user_id),
        is_approved=False
    )

    db.session.add(vendor)
    db.session.commit()

    response_schema = VendorResponseSchema()
    return jsonify({
        'message': 'Vendor registered successfully. Awaiting approval.',
        'vendor': response_schema.dump(vendor)
    }), 201

@vendors_bp.route('/', methods=['GET'])
def get_all_vendors():
    """Get all vendors (public)"""
    approved_only = request.args.get('approved_only', 'true').lower() == 'true'

    query = Vendor.query
    if approved_only:
        query = query.filter_by(is_approved=True)

    vendors = query.order_by(Vendor.business_name).all()

    response_schema = VendorResponseSchema(many=True)
    return jsonify(response_schema.dump(vendors)), 200

@vendors_bp.route('/<int:vendor_id>', methods=['GET'])
def get_vendor(vendor_id):
    """Get vendor by ID"""
    vendor = Vendor.query.get(vendor_id)

    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404

    # Don't show unapproved vendors to public
    if not vendor.is_approved:
        try:
            user_id = get_jwt_identity()
            if int(user_id) != vendor.user_id:
                return jsonify({'error': 'Vendor not found'}), 404
        except:
            return jsonify({'error': 'Vendor not found'}), 404

    response_schema = VendorResponseSchema()
    return jsonify(response_schema.dump(vendor)), 200

@vendors_bp.route('/<int:vendor_id>', methods=['PUT'])
@jwt_required()
def update_vendor(vendor_id):
    """Update vendor profile"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    vendor = Vendor.query.get(vendor_id)

    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404

    # Check if user owns this vendor or is admin
    if user.role.value != 'admin' and int(user_id) != vendor.user_id:
        return jsonify({'error': 'You are not authorized to update this vendor'}), 403

    try:
        schema = VendorUpdateSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    # Update fields
    for key, value in data.items():
        if value is not None:
            setattr(vendor, key, value)

    db.session.commit()

    response_schema = VendorResponseSchema()
    return jsonify({
        'message': 'Vendor updated successfully',
        'vendor': response_schema.dump(vendor)
    }), 200

@vendors_bp.route('/<int:vendor_id>/approve', methods=['PUT'])
@jwt_required()
def approve_vendor(vendor_id):
    """Approve a vendor (admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if user.role.value != 'admin':
        return jsonify({'error': 'Only admins can approve vendors'}), 403

    vendor = Vendor.query.get(vendor_id)

    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404

    vendor.is_approved = True
    db.session.commit()

    response_schema = VendorResponseSchema()
    return jsonify({
        'message': 'Vendor approved successfully',
        'vendor': response_schema.dump(vendor)
    }), 200

@vendors_bp.route('/my-vendor', methods=['GET'])
@jwt_required()
def get_my_vendor():
    """Get the vendor profile of the authenticated user"""
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=int(user_id)).first()

    if not vendor:
        return jsonify({'error': 'You do not have a vendor profile'}), 404

    response_schema = VendorResponseSchema()
    return jsonify(response_schema.dump(vendor)), 200

@vendors_bp.route('/<int:vendor_id>/assign', methods=['POST'])
@jwt_required()
def assign_vendor_to_event(vendor_id):
    """Assign a vendor to an event (organizer/admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    vendor = Vendor.query.get(vendor_id)

    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404

    if not vendor.is_approved:
        return jsonify({'error': 'Vendor must be approved before assignment'}), 400

    try:
        schema = VendorAssignmentSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    event = Event.query.get(data['event_id'])

    if not event:
        return jsonify({'error': 'Event not found'}), 404

    # Check if user is the event organizer or admin
    if user.role.value != 'admin' and int(user_id) != event.created_by:
        return jsonify({'error': 'You are not authorized to assign vendors to this event'}), 403

    # Check if vendor is already assigned to this event
    existing = VendorAssignment.query.filter_by(
        event_id=data['event_id'],
        vendor_id=vendor_id,
        status='active'
    ).first()

    if existing:
        return jsonify({'error': 'Vendor is already assigned to this event'}), 400

    assignment = VendorAssignment(
        event_id=data['event_id'],
        vendor_id=vendor_id,
        assigned_by=int(user_id),
        status='active'
    )

    db.session.add(assignment)
    db.session.commit()

    response_schema = VendorAssignmentResponseSchema()
    return jsonify({
        'message': 'Vendor assigned to event successfully',
        'assignment': response_schema.dump(assignment)
    }), 201

@vendors_bp.route('/event/<int:event_id>/vendors', methods=['GET'])
def get_event_vendors(event_id):
    """Get all vendors assigned to an event"""
    event = Event.query.get(event_id)

    if not event:
        return jsonify({'error': 'Event not found'}), 404

    assignments = VendorAssignment.query.filter_by(
        event_id=event_id,
        status='active'
    ).all()

    # Get vendor details
    vendors = []
    for assignment in assignments:
        vendor = Vendor.query.get(assignment.vendor_id)
        if vendor and vendor.is_approved:
            vendor_data = {
                'id': vendor.id,
                'business_name': vendor.business_name,
                'business_type': vendor.business_type,
                'description': vendor.description,
                'contact_email': vendor.contact_email,
                'contact_phone': vendor.contact_phone,
                'website': vendor.website,
                'logo_url': vendor.logo_url,
                'assigned_at': assignment.assigned_at
            }
            vendors.append(vendor_data)

    return jsonify(vendors), 200

@vendors_bp.route('/assignment/<int:assignment_id>', methods=['DELETE'])
@jwt_required()
def remove_vendor_assignment(assignment_id):
    """Remove a vendor from an event (organizer/admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    assignment = VendorAssignment.query.get(assignment_id)

    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404

    event = Event.query.get(assignment.event_id)

    # Check if user is the event organizer or admin
    if user.role.value != 'admin' and int(user_id) != event.created_by:
        return jsonify({'error': 'You are not authorized to remove vendors from this event'}), 403

    assignment.status = 'removed'
    db.session.commit()

    return jsonify({'message': 'Vendor removed from event successfully'}), 200
