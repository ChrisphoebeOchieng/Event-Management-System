import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  CalendarIcon, 
  TicketIcon, 
  UserGroupIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  venue: string;
  city: string;
  capacity: number;
  ticket_price: number;
  image_url: string | null;
  is_featured: boolean;
  status: string;
}

const HomePage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await api.get('/events/?featured=true&status=published');
        setFeaturedEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch featured events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedEvents();
  }, []);

  const features = [
    {
      icon: CalendarIcon,
      title: 'Discover Events',
      description: 'Find exciting events happening near you. Browse by category, date, or location.',
    },
    {
      icon: TicketIcon,
      title: 'Book Tickets',
      description: 'Secure your spot instantly. Easy online booking with instant confirmation.',
    },
    {
      icon: UserGroupIcon,
      title: 'Connect with Vendors',
      description: 'Discover amazing vendors for food, drinks, and entertainment at your events.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover & Book Amazing Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Find events you love, book tickets instantly, and create unforgettable experiences
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/events"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Explore Events
              </Link>
              <Link
                to="/register"
                className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 transition-colors border border-white/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose EventSphere</h2>
            <p className="text-gray-600 mt-2">Your all-in-one event management platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
              <p className="text-gray-600 mt-1">Handpicked events you might like</p>
            </div>
            <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Loading events...</p>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No featured events available right now.</p>
              <p className="text-gray-500 text-sm mt-1">Check back later or explore all events.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <Link to={`/events/${event.id}`} key={event.id} className="card hover:shadow-xl transition-shadow">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  {!event.image_url && (
                    <div className="w-full h-48 bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-primary-600 text-4xl">📅</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        {event.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2">{event.title}</h3>
                    </div>
                    {event.is_featured && (
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{event.description}</p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{event.venue}, {event.city}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{new Date(event.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      KES {event.ticket_price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {event.capacity} spots left
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Own Event?</h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of organizers who trust EventSphere to manage their events
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
