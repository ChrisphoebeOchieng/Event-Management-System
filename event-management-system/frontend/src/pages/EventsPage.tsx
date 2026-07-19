import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ClockIcon,
  StarIcon,
  FunnelIcon
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

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Technology', 'Music', 'Business', 'Art', 'Sports', 'Food', 'Education'];
  const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let url = '/events/?status=published';
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        if (selectedCity) {
          url += `&city=${selectedCity}`;
        }
        const response = await api.get(url);
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedCategory, selectedCity]);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setSearchTerm('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
        <p className="text-gray-600 mt-1">Find and book the best events in your city</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-gray-100 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>

          {/* Clear Filters */}
          {(selectedCategory || selectedCity || searchTerm) && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-gray-600 mt-4">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No events found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
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
  );
};

export default EventsPage;
