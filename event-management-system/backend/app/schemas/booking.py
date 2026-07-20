from marshmallow import Schema, fields, validate

class BookingCreateSchema(Schema):
    event_id = fields.Int(required=True, validate=validate.Range(min=1))
    number_of_tickets = fields.Int(required=True, validate=validate.Range(min=1))

class BookingResponseSchema(Schema):
    id = fields.Int()
    booking_reference = fields.Str()
    user_id = fields.Int()
    event_id = fields.Int()
    number_of_tickets = fields.Int()
    total_amount = fields.Float()
    status = fields.Str()
    payment_status = fields.Str()
    payment_reference = fields.Str()
    ticket_number = fields.Str()
    ticket_checked_in = fields.Bool()
    booked_at = fields.DateTime()
    updated_at = fields.DateTime()
