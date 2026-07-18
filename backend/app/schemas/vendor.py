from marshmallow import Schema, fields, validate

class VendorCreateSchema(Schema):
    business_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    business_type = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    description = fields.Str()
    contact_email = fields.Email(required=True)
    contact_phone = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    website = fields.Str()
    logo_url = fields.Str()

class VendorUpdateSchema(Schema):
    business_name = fields.Str(validate=validate.Length(min=2, max=100))
    business_type = fields.Str(validate=validate.Length(min=2, max=50))
    description = fields.Str()
    contact_email = fields.Email()
    contact_phone = fields.Str(validate=validate.Length(min=10, max=20))
    website = fields.Str()
    logo_url = fields.Str()
    is_approved = fields.Bool()

class VendorResponseSchema(Schema):
    id = fields.Int()
    business_name = fields.Str()
    business_type = fields.Str()
    description = fields.Str()
    contact_email = fields.Email()
    contact_phone = fields.Str()
    website = fields.Str()
    logo_url = fields.Str()
    user_id = fields.Int()
    is_approved = fields.Bool()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

class VendorAssignmentSchema(Schema):
    event_id = fields.Int(required=True, validate=validate.Range(min=1))

class VendorAssignmentResponseSchema(Schema):
    id = fields.Int()
    event_id = fields.Int()
    vendor_id = fields.Int()
    assigned_by = fields.Int()
    assigned_at = fields.DateTime()
    status = fields.Str()
