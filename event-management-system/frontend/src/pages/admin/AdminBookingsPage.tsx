import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BackButton from '../../components/admin/BackButton';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { TicketIcon, EyeIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  event_id: number;
  number_of_tickets: number;
  total_amount: number;
  status: string;
  payment_status: string;
  booked_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  event?: {
    title: string;
    start_date: string;
  };
}

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/');
      const bookingsData = response.data;
      
      // Fetch user and event details for each booking
      const bookingsWithDetails = await Promise.all(
        bookingsData.map(async (booking: Booking) => {
          try {
            const userRes = await api.get(`/admin/users/${booking.user_id}`);
            const eventRes = await api.get(`/events/${booking.event_id}`);
            return {
              ...booking,
              user: userRes.data,
              event: eventRes.data
            };
          } catch {
            return booking;
          }
        })
      );
      
      setBookings(bookingsWithDetails);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { color: 'bg-green-100 text-green-700', icon: CheckCircleIcon };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-700', icon: XCircleIcon };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: XCircleIcon };
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 mt-1">View all bookings on the platform</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500">No bookings have been made yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => {
                  const statusInfo = getStatusBadge(booking.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono font-medium text-gray-900">
                          {booking.booking_reference}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.booked_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user?.first_name} {booking.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{booking.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.event?.title || 'Event'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.event?.start_date ? new Date(booking.event.start_date).toLocaleDateString() : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{booking.number_of_tickets}</td>
                      <td className="px-6 py-4 text-sm font-medium text-primary-600">
                        KES {booking.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookingsPage;
