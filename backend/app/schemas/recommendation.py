from marshmallow import Schema, fields, validate

class UserInteractionSchema(Schema):
    event_id = fields.Int(required=True, validate=validate.Range(min=1))
    interaction_type = fields.Str(required=True, validate=validate.OneOf(['view', 'click', 'booking', 'favorite']))

class UserPreferenceSchema(Schema):
    preferred_categories = fields.List(fields.Str())
    preferred_cities = fields.List(fields.Str())
    price_min = fields.Float(validate=validate.Range(min=0))
    price_max = fields.Float(validate=validate.Range(min=0))

class UserPreferenceResponseSchema(Schema):
    id = fields.Int()
    user_id = fields.Int()
    preferred_categories = fields.List(fields.Str())
    preferred_cities = fields.List(fields.Str())
    price_min = fields.Float()
    price_max = fields.Float()
    updated_at = fields.DateTime()
