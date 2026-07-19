import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  MapPinIcon, 
  ClockIcon, 
  CalendarIcon,
  TicketIcon,
  UserGroupIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  venue: string;
  address: string;
  city: string;
  capacity: number;
  ticket_price: number;
  image_url: string | null;
  is_featured: boolean;
  status: string;
  created_by: number;
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    // Implement booking functionality
    alert('Booking functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-red-600">{error || 'Event not found'}</p>
        <Link to="/events" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          ← Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link to="/events" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2">
          {event.image_url && (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-96 object-cover rounded-xl mb-6"
            />
          )}
          {!event.image_url && (
            <div className="w-full h-96 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl mb-6 flex items-center justify-center">
              <span className="text-primary-600 text-6xl">��</span>
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
              {event.category}
            </span>
            {event.is_featured && (
              <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
                ⭐ Featured
              </span>
            )}
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm capitalize">
              {event.status}
            </span>
          </div>

          <div className="space-y-3 text-gray-600 mb-6">
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span>{event.venue}, {event.address}, {event.city}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span>{new Date(event.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span>{new Date(event.start_date).toLocaleTimeString()} - {new Date(event.end_date).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span>{event.capacity} spots available</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h3>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-primary-600">
                KES {event.ticket_price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">per ticket</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Tickets
                </label>
                <input
                  type="number"
                  min="1"
                  max={event.capacity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(Number(e.target.value), event.capacity))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-between py-2 border-t border-gray-200">
                <span className="text-gray-600">Total</span>
                <span className="text-xl font-bold text-primary-600">
                  KES {(event.ticket_price * quantity).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleBooking}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                <TicketIcon className="h-5 w-5 inline-block mr-2" />
                Book Now
              </button>

              <p className="text-xs text-gray-500 text-center">
                {event.capacity} tickets remaining
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
