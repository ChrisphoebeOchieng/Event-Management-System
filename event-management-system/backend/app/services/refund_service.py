from app import db
from app.models.refund import Refund, RefundStatus
from app.models.booking import Booking
from app.models.user import User
from datetime import datetime

class RefundService:
    
    @staticmethod
    def create_refund_request(booking_id, user_id, reason):
        """Create a refund request for a booking"""
        booking = Booking.query.get(booking_id)
        if not booking:
            return {'error': 'Booking not found'}

        if booking.user_id != user_id:
            return {'error': 'You are not authorized to request a refund for this booking'}

        if booking.payment_status != 'paid':
            return {'error': 'This booking has not been paid for'}

        if booking.status == 'cancelled':
            return {'error': 'This booking has already been cancelled'}

        # Check if refund already exists
        existing_refund = Refund.query.filter_by(booking_id=booking_id).first()
        if existing_refund:
            return {'error': f'A refund request already exists (Status: {existing_refund.status.value})'}

        # Create refund request
        refund = Refund(
            booking_id=booking_id,
            user_id=user_id,
            amount=booking.total_amount,
            reason=reason,
            status=RefundStatus.PENDING
        )

        booking.refund_requested = True

        db.session.add(refund)
        db.session.commit()

        return {
            'success': True,
            'message': 'Refund request submitted successfully',
            'refund_id': refund.id,
            'status': refund.status.value,
            'amount': refund.amount
        }

    @staticmethod
    def get_refund_status(refund_id):
        """Get the status of a refund request"""
        refund = Refund.query.get(refund_id)
        if not refund:
            return {'error': 'Refund not found'}

        return {
            'refund_id': refund.id,
            'booking_reference': refund.booking.booking_reference,
            'amount': refund.amount,
            'reason': refund.reason,
            'status': refund.status.value,
            'admin_notes': refund.admin_notes,
            'created_at': refund.created_at.isoformat(),
            'processed_at': refund.processed_at.isoformat() if refund.processed_at else None
        }

    @staticmethod
    def get_user_refunds(user_id):
        """Get all refund requests for a user"""
        refunds = Refund.query.filter_by(user_id=user_id).order_by(Refund.created_at.desc()).all()
        
        result = []
        for refund in refunds:
            result.append({
                'id': refund.id,
                'booking_reference': refund.booking.booking_reference,
                'amount': refund.amount,
                'reason': refund.reason,
                'status': refund.status.value,
                'admin_notes': refund.admin_notes,
                'created_at': refund.created_at.isoformat(),
                'processed_at': refund.processed_at.isoformat() if refund.processed_at else None
            })
        
        return result

    @staticmethod
    def get_all_refunds():
        """Get all refund requests (Admin only)"""
        refunds = Refund.query.order_by(Refund.created_at.desc()).all()
        
        result = []
        for refund in refunds:
            result.append({
                'id': refund.id,
                'booking_reference': refund.booking.booking_reference,
                'user': {
                    'id': refund.user.id,
                    'name': refund.user.full_name,
                    'email': refund.user.email
                },
                'amount': refund.amount,
                'reason': refund.reason,
                'status': refund.status.value,
                'admin_notes': refund.admin_notes,
                'created_at': refund.created_at.isoformat(),
                'processed_at': refund.processed_at.isoformat() if refund.processed_at else None
            })
        
        return result

    @staticmethod
    def process_refund(refund_id, action, admin_notes=None, admin_id=None):
        """Process a refund request (Admin only)"""
        refund = Refund.query.get(refund_id)
        if not refund:
            return {'error': 'Refund not found'}

        if refund.status != RefundStatus.PENDING:
            return {'error': f'Refund has already been {refund.status.value}'}

        booking = refund.booking

        if action == 'approve':
            # Process refund
            refund.status = RefundStatus.APPROVED
            refund.processed_at = datetime.utcnow()
            refund.admin_notes = admin_notes or 'Refund approved'
            
            # Update booking
            booking.status = 'refunded'
            booking.refund_processed = True
            booking.payment_status = 'refunded'
            
            # Restore event capacity
            event = booking.event
            if event:
                event.capacity += booking.number_of_tickets

            db.session.commit()

            return {
                'success': True,
                'message': 'Refund approved and processed successfully',
                'status': refund.status.value,
                'booking_reference': booking.booking_reference
            }

        elif action == 'reject':
            refund.status = RefundStatus.REJECTED
            refund.admin_notes = admin_notes or 'Refund rejected'
            db.session.commit()

            return {
                'success': True,
                'message': 'Refund request rejected',
                'status': refund.status.value
            }

        else:
            return {'error': 'Invalid action. Use "approve" or "reject"'}

    @staticmethod
    def get_refund_statistics():
        """Get refund statistics (Admin only)"""
        total = Refund.query.count()
        pending = Refund.query.filter_by(status=RefundStatus.PENDING).count()
        approved = Refund.query.filter_by(status=RefundStatus.APPROVED).count()
        rejected = Refund.query.filter_by(status=RefundStatus.REJECTED).count()
        processed = Refund.query.filter_by(status=RefundStatus.PROCESSED).count()
        
        total_amount = db.session.query(db.func.sum(Refund.amount)).scalar() or 0
        pending_amount = db.session.query(db.func.sum(Refund.amount)).filter(Refund.status == RefundStatus.PENDING).scalar() or 0
        
        return {
            'total': total,
            'pending': pending,
            'approved': approved,
            'rejected': rejected,
            'processed': processed,
            'total_amount': float(total_amount),
            'pending_amount': float(pending_amount)
        }
