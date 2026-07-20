from app import db
from app.models.event import Event
from app.models.booking import Booking
from app.models.user import User
from app.models.vendor import Vendor
from datetime import datetime, timedelta
from sqlalchemy import func, extract

class AnalyticsService:
    
    @staticmethod
    def get_overview_stats():
        """Get overview statistics"""
        total_users = User.query.count()
        total_events = Event.query.count()
        total_bookings = Booking.query.count()
        total_vendors = Vendor.query.count()
        
        # Revenue
        total_revenue = db.session.query(func.sum(Booking.total_amount)).filter(
            Booking.payment_status == 'paid'
        ).scalar() or 0
        
        # Active events (published and not passed)
        now = datetime.utcnow()
        active_events = Event.query.filter(
            Event.status == 'published',
            Event.end_date > now
        ).count()
        
        # Completed events
        completed_events = Event.query.filter(
            Event.status == 'completed'
        ).count()
        
        return {
            'total_users': total_users,
            'total_events': total_events,
            'total_bookings': total_bookings,
            'total_vendors': total_vendors,
            'total_revenue': float(total_revenue),
            'active_events': active_events,
            'completed_events': completed_events
        }
    
    @staticmethod
    def get_monthly_revenue(months=6):
        """Get monthly revenue for the last N months"""
        result = []
        now = datetime.utcnow()
        
        for i in range(months):
            month = now - timedelta(days=30*i)
            month_start = month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Get next month
            if month.month == 12:
                next_month = month.replace(year=month.year+1, month=1, day=1)
            else:
                next_month = month.replace(month=month.month+1, day=1)
            
            revenue = db.session.query(func.sum(Booking.total_amount)).filter(
                Booking.payment_status == 'paid',
                Booking.paid_at >= month_start,
                Booking.paid_at < next_month
            ).scalar() or 0
            
            result.append({
                'month': month_start.strftime('%B %Y'),
                'revenue': float(revenue)
            })
        
        return result
    
    @staticmethod
    def get_event_categories():
        """Get event distribution by category"""
        categories = db.session.query(
            Event.category,
            func.count(Event.id).label('count')
        ).group_by(Event.category).all()
        
        return [{'category': cat, 'count': count} for cat, count in categories]
    
    @staticmethod
    def get_booking_status_distribution():
        """Get booking status distribution"""
        statuses = db.session.query(
            Booking.status,
            func.count(Booking.id).label('count')
        ).group_by(Booking.status).all()
        
        return [{'status': status, 'count': count} for status, count in statuses]
    
    @staticmethod
    def get_user_growth(days=30):
        """Get user growth over time"""
        result = []
        now = datetime.utcnow()
        
        for i in range(days, -1, -1):
            date = now - timedelta(days=i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            count = User.query.filter(
                User.created_at >= day_start,
                User.created_at < day_end
            ).count()
            
            result.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'count': count
            })
        
        return result
    
    @staticmethod
    def get_top_events(limit=10):
        """Get top events by bookings"""
        top_events = db.session.query(
            Event.id,
            Event.title,
            func.count(Booking.id).label('booking_count'),
            func.sum(Booking.total_amount).label('revenue')
        ).join(Booking, Booking.event_id == Event.id)\
         .filter(Booking.payment_status == 'paid')\
         .group_by(Event.id, Event.title)\
         .order_by(func.count(Booking.id).desc())\
         .limit(limit).all()
        
        return [{
            'id': event.id,
            'title': event.title,
            'booking_count': event.booking_count,
            'revenue': float(event.revenue) if event.revenue else 0
        } for event in top_events]
