import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EventSearch, { SearchFilters } from '../components/events/EventSearch';
import { 
  MapPinIcon, 
  ClockIcon, 
  StarIcon,
  MagnifyingGlassIcon
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
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (searchFilters?: SearchFilters) => {
    setLoading(true);
    try {
      let url = '/events/?status=published';
      
      if (searchFilters) {
        // Apply filters
        if (searchFilters.category && searchFilters.category !== 'All') {
          url += `&category=${searchFilters.category}`;
        }
        if (searchFilters.city && searchFilters.city !== 'All') {
          url += `&city=${searchFilters.city}`;
        }
        if (searchFilters.status && searchFilters.status !== 'All') {
          url += `&status=${searchFilters.status}`;
        }
        // Note: search, date, price, sort would need backend support
        // We'll handle search client-side for now
      }
      
      const response = await api.get(url);
      let eventsData = response.data || [];
      
      // Client-side search filtering
      if (searchFilters?.search) {
        const searchTerm = searchFilters.search.toLowerCase();
        eventsData = eventsData.filter((event: Event) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.venue.toLowerCase().includes(searchTerm) ||
          event.city.toLowerCase().includes(searchTerm)
        );
      }
      
      // Client-side price filtering
      if (searchFilters?.priceMin) {
        const minPrice = parseFloat(searchFilters.priceMin);
        eventsData = eventsData.filter((event: Event) => event.ticket_price >= minPrice);
      }
      if (searchFilters?.priceMax) {
        const maxPrice = parseFloat(searchFilters.priceMax);
        eventsData = eventsData.filter((event: Event) => event.ticket_price <= maxPrice);
      }
      
      // Client-side date filtering
      if (searchFilters?.dateFrom) {
        const fromDate = new Date(searchFilters.dateFrom);
        eventsData = eventsData.filter((event: Event) => new Date(event.start_date) >= fromDate);
      }
      if (searchFilters?.dateTo) {
        const toDate = new Date(searchFilters.dateTo);
        toDate.setHours(23, 59, 59);
        eventsData = eventsData.filter((event: Event) => new Date(event.start_date) <= toDate);
      }
      
      // Client-side sorting
      if (searchFilters?.sortBy) {
        const sortBy = searchFilters.sortBy;
        const sortOrder = searchFilters.sortOrder || 'asc';
        eventsData.sort((a: any, b: any) => {
          let aVal = a[sortBy];
          let bVal = b[sortBy];
          
          if (sortBy === 'start_date' || sortBy === 'created_at') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }
          
          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }
      
      setTotalResults(eventsData.length);
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters: SearchFilters) => {
    setFilters(searchFilters);
    fetchEvents(searchFilters);
  };

  const handleReset = () => {
    setFilters(null);
    fetchEvents();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
        <p className="text-gray-500 mt-1">Find and book the best events in your city</p>
      </div>

      <EventSearch onSearch={handleSearch} onReset={handleReset} />

      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {totalResults} event{totalResults !== 1 ? 's' : ''} found
        </p>
        {filters && (
          <button
            onClick={handleReset}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center mt-6">
          <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">
            {filters ? 'Try adjusting your search or filters' : 'Check back later for new events'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {events.map((event) => (
            <Link to={`/events/${event.id}`} key={event.id} className="card hover:shadow-xl transition-all hover:-translate-y-1">
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
