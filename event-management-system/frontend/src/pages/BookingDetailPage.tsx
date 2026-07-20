import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

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
  payment_reference?: string;
  paid_at?: string;
  booked_at: string;
  ticket_number?: string;
  ticket_checked_in?: boolean;
  event?: {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    venue: string;
    address: string;
    city: string;
    ticket_price: number;
  };
}

const BookingDetailPage: React.FC = () => {
  const { bookingRef } = useParams<{ bookingRef: string }>();
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      const response = await api.get(`/bookings/${bookingRef}`);
      const bookingData = response.data;
      
      try {
        const eventRes = await api.get(`/events/${bookingData.event_id}`);
        bookingData.event = eventRes.data;
      } catch {
        // Event not found
      }
      
      setBooking(bookingData);
    } catch (error) {
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [bookingRef]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handlePayment = async () => {
    if (!booking) return;
    
    setPaying(true);
    try {
      const response = await api.post(
        `/payments/create-payment-intent/${booking.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await new Promise(resolve => setTimeout(resolve, 1500));

      const confirmResponse = await api.post(
        '/payments/confirm-payment',
        {
          payment_intent_id: response.data.payment_intent_id || `pi_test_${booking.booking_reference}`,
          booking_reference: booking.booking_reference
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (confirmResponse.data.success) {
        toast.success('Payment successful! 🎉');
        fetchBooking();
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-500">Booking not found</p>
        <Link to="/bookings" className="text-primary-600 hover:text-primary-700">
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  const isPaid = booking.payment_status === 'paid';
  const isConfirmed = booking.status === 'confirmed';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/bookings" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Bookings
      </Link>

      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Booking Details</h1>
              <p className="text-primary-100 text-sm">Reference: {booking.booking_reference}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConfirmed ? 'bg-green-500/20 text-white' : 'bg-red-500/20 text-white'
            }`}>
              {booking.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{booking.event?.title || 'Event'}</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Venue</p>
                <p className="font-medium text-gray-900">{booking.event?.venue || 'TBD'}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {booking.event?.start_date ? new Date(booking.event.start_date).toLocaleDateString() : 'TBD'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-500">Tickets</p>
              <p className="font-bold text-gray-900">{booking.number_of_tickets}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="font-bold text-primary-600">KES {booking.total_amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment Status</p>
              <p className={`font-bold ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                {isPaid ? '✅ Paid' : '⏳ Pending'}
              </p>
            </div>
          </div>

          {isConfirmed && !isPaid && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Payment required to complete your booking
                </p>
              </div>
              <button
                onClick={handlePayment}
                disabled={paying}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base"
              >
                {paying ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay KES ${booking.total_amount.toFixed(2)}`
                )}
              </button>
            </div>
          )}

          {isPaid && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-lg font-semibold text-green-700">✅ Payment Confirmed</p>
                <p className="text-sm text-green-600">
                  Paid on {booking.paid_at ? new Date(booking.paid_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
