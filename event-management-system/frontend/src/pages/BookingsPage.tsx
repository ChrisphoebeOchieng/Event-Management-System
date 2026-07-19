import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  TicketIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  event_id: number;
  number_of_tickets: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  mpesa_code?: string;
  paid_at?: string;
  booked_at: string;
  event?: {
    title: string;
    start_date: string;
    venue: string;
    city: string;
  };
}

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/');
        setBookings(response.data || []);
      } catch (error) {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">View and manage all your ticket bookings</p>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500">Start booking events today!</p>
          <Link to="/events" className="btn-primary inline-block mt-4">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
              <div 
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(booking.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <TicketIcon className="h-5 w-5 text-primary-600" />
                    <span className="font-mono font-medium text-gray-900">
                      {booking.booking_reference}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                      booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.payment_status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span>{booking.number_of_tickets} tickets</span>
                    <span>KES {booking.total_amount.toFixed(2)}</span>
                    <span>{new Date(booking.booked_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {expandedId === booking.id ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedId === booking.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Ticket Details</p>
                      <p className="font-medium text-gray-900 mt-1">{booking.number_of_tickets} tickets</p>
                      <p className="text-gray-600">Total: KES {booking.total_amount.toFixed(2)}</p>
                      <p className="text-gray-600">Status: {booking.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment</p>
                      <p className="font-medium text-gray-900 mt-1 capitalize">{booking.payment_method || 'Not paid'}</p>
                      {booking.mpesa_code && (
                        <p className="text-gray-600">M-Pesa Code: {booking.mpesa_code}</p>
                      )}
                      <p className="text-gray-600">Status: {booking.payment_status}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Booking Date</p>
                      <p className="font-medium text-gray-900 mt-1">{new Date(booking.booked_at).toLocaleString()}</p>
                      {booking.paid_at && (
                        <p className="text-gray-600">Paid: {new Date(booking.paid_at).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
