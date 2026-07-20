import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowDownTrayIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface TicketData {
  ticket_number: string;
  booking_reference: string;
  qr_code: string;
  event: {
    title: string;
    venue: string;
    start_date: string;
    city: string;
  };
  attendee: {
    name: string;
    email: string;
  };
  ticket_details: {
    number_of_tickets: number;
    total_amount: number;
    status: string;
  };
}

interface TicketDisplayProps {
  ticket: TicketData;
  onDownload?: () => void;
}

const TicketDisplay: React.FC<TicketDisplayProps> = ({ ticket, onDownload }) => {
  const [showQR, setShowQR] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-soft overflow-hidden">
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Electronic Ticket</h2>
            <p className="text-primary-100 text-sm">EventSphere</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary-100">Ticket Number</p>
            <p className="font-mono text-sm font-bold">{ticket.ticket_number}</p>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">{ticket.event.title}</h3>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p>📍 {ticket.event.venue}, {ticket.event.city}</p>
          <p>📅 {new Date(ticket.event.start_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Attendee</p>
            <p className="font-medium text-gray-900">{ticket.attendee.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{ticket.attendee.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tickets</p>
            <p className="font-medium text-gray-900">{ticket.ticket_details.number_of_tickets}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.ticket_details.status)}`}>
              {ticket.ticket_details.status}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col items-center">
        <button
          onClick={() => setShowQR(!showQR)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-3"
        >
          {showQR ? 'Hide QR Code' : 'Show QR Code'}
        </button>
        
        {showQR && (
          <div className="bg-white p-4 rounded-xl shadow-soft">
            <QRCodeSVG
              value={ticket.qr_code}
              size={200}
              level="H"
              includeMargin
              className="mx-auto"
            />
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={onDownload}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download Ticket
          </button>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Booking Reference: {ticket.booking_reference}
        </p>
      </div>
    </div>
  );
};

export default TicketDisplay;
