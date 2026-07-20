import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

class EmailService:
    def __init__(self):
        self.smtp_server = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.environ.get('MAIL_PORT', 587))
        self.username = os.environ.get('MAIL_USERNAME')
        self.password = os.environ.get('MAIL_PASSWORD')
        self.from_email = os.environ.get('MAIL_USERNAME')
        self.use_tls = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
        
        print(f"Email configured: {self.smtp_server}:{self.smtp_port}")
        print(f"Username: {self.username}")
        print(f"TLS: {self.use_tls}")

    def send_email(self, to_email, subject, body, html_body=None):
        """Send an email"""
        if not self.username or not self.password:
            print("❌ Email credentials not configured")
            print("Please set MAIL_USERNAME and MAIL_PASSWORD in .env")
            return False

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            # Plain text version
            text_part = MIMEText(body, 'plain')
            msg.attach(text_part)

            # HTML version (if provided)
            if html_body:
                html_part = MIMEText(html_body, 'html')
                msg.attach(html_part)

            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            if self.use_tls:
                server.starttls()
            server.login(self.username, self.password)
            server.send_message(msg)
            server.quit()

            print(f"✅ Email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Email error: {e}")
            return False

    def send_event_reminder(self, booking, event, user):
        """Send event reminder email"""
        subject = f"Reminder: {event.title} is coming up!"

        body = f"""
Hello {user.first_name},

This is a reminder that your event "{event.title}" is happening soon!

Event Details:
- Date: {event.start_date.strftime('%B %d, %Y at %I:%M %p')}
- Venue: {event.venue}
- Address: {event.address}
- City: {event.city}
- Tickets: {booking.number_of_tickets}

Your Booking Reference: {booking.booking_reference}

We look forward to seeing you there!

Best regards,
EventSphere Team
"""

        html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #0284c7, #7c3aed); padding: 30px; border-radius: 12px; text-align: center; color: white;">
        <h1 style="margin: 0;">🎫 Event Reminder</h1>
        <p style="margin: 5px 0 0;">EventSphere</p>
    </div>
    
    <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1f2937;">Hello {user.first_name}!</h2>
        <p style="color: #4b5563;">This is a reminder that your event <strong>"{event.title}"</strong> is happening soon!</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">📅 Event Details</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> {event.start_date.strftime('%B %d, %Y at %I:%M %p')}</p>
            <p style="margin: 5px 0;"><strong>Venue:</strong> {event.venue}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> {event.address}</p>
            <p style="margin: 5px 0;"><strong>City:</strong> {event.city}</p>
            <p style="margin: 5px 0;"><strong>Tickets:</strong> {booking.number_of_tickets}</p>
            <p style="margin: 5px 0;"><strong>Booking Reference:</strong> {booking.booking_reference}</p>
        </div>
        
        <p style="color: #4b5563;">We look forward to seeing you there!</p>
        <p style="color: #4b5563;">Best regards,<br><strong>EventSphere Team</strong></p>
    </div>
</body>
</html>
"""

        return self.send_email(user.email, subject, body, html_body)

    def send_payment_confirmation(self, booking, event, user):
        """Send payment confirmation email"""
        subject = f"Payment Confirmed for {event.title}"

        body = f"""
Hello {user.first_name},

Your payment for "{event.title}" has been confirmed!

Event Details:
- Date: {event.start_date.strftime('%B %d, %Y at %I:%M %p')}
- Venue: {event.venue}
- Amount Paid: KES {booking.total_amount:.2f}
- Tickets: {booking.number_of_tickets}
- Booking Reference: {booking.booking_reference}

Your ticket has been generated. You can view it in your dashboard.

Thank you for booking with EventSphere!

Best regards,
EventSphere Team
"""

        html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 12px; text-align: center; color: white;">
        <h1 style="margin: 0;">✅ Payment Confirmed</h1>
        <p style="margin: 5px 0 0;">EventSphere</p>
    </div>
    
    <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1f2937;">Hello {user.first_name}!</h2>
        <p style="color: #4b5563;">Your payment for <strong>"{event.title}"</strong> has been confirmed!</p>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #bbf7d0;">
            <h3 style="color: #1f2937; margin-top: 0;">📅 Event Details</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> {event.start_date.strftime('%B %d, %Y at %I:%M %p')}</p>
            <p style="margin: 5px 0;"><strong>Venue:</strong> {event.venue}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> KES {booking.total_amount:.2f}</p>
            <p style="margin: 5px 0;"><strong>Tickets:</strong> {booking.number_of_tickets}</p>
            <p style="margin: 5px 0;"><strong>Booking:</strong> {booking.booking_reference}</p>
        </div>
        
        <p style="color: #4b5563;">Your ticket has been generated. <a href="http://localhost:3000/bookings/{booking.booking_reference}" style="color: #0284c7;">View it here</a></p>
        <p style="color: #4b5563;">Thank you for booking with EventSphere!</p>
        <p style="color: #4b5563;">Best regards,<br><strong>EventSphere Team</strong></p>
    </div>
</body>
</html>
"""

        return self.send_email(user.email, subject, body, html_body)

    def test_email(self, test_email):
        """Send a test email to verify configuration"""
        subject = "Test Email from EventSphere"
        body = """
Hello,

This is a test email from your EventSphere application.

If you received this, your email configuration is working correctly!

Best regards,
EventSphere Team
"""
        return self.send_email(test_email, subject, body)
