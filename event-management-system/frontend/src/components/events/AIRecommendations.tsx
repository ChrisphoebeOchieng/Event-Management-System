import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  SparklesIcon, 
  MapPinIcon, 
  ClockIcon, 
  StarIcon,
  ArrowPathIcon
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

const AIRecommendations: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/ai/recommendations');
      if (response.data && response.data.events) {
        setEvents(response.data.events);
        if (response.data.events.length === 0) {
          setError('No recommendations available. Try interacting with more events.');
        }
      } else {
        setEvents([]);
        setError('No recommendations available.');
      }
    } catch (error: any) {
      console.error('Failed to fetch AI recommendations:', error);
      if (error.response?.status === 401) {
        setError('Please login to get personalized recommendations');
      } else {
        setError('Failed to load AI recommendations. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRecommendations();
    toast.success('Refreshing recommendations...');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">AI Recommendations</h2>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Powered by Gemini</span>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-xl"></div>
          <div className="h-20 bg-gray-200 rounded-xl"></div>
          <div className="h-20 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-900">AI Recommendations</h2>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Powered by Gemini</span>
          </div>
          <button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh recommendations"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center py-8 text-gray-500">
          <SparklesIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p>{error}</p>
          <p className="text-sm mt-2">Browse events and interact with them to get better recommendations</p>
          <Link to="/events" className="btn-primary inline-block mt-4">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">AI Recommendations</h2>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Powered by Gemini</span>
        </div>
        <div className="text-center py-8 text-gray-500">
          <SparklesIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p>No recommendations yet</p>
          <p className="text-sm mt-2">Interact with events to get personalized suggestions</p>
          <Link to="/events" className="btn-primary inline-block mt-4">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">AI Recommendations</h2>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Powered by Gemini</span>
        </div>
        <button
          onClick={handleRefresh}
          className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-sm"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {events.slice(0, 5).map((event) => (
          <Link
            to={`/events/${event.id}`}
            key={event.id}
            className="block hover:bg-gray-50 rounded-lg p-3 transition-colors border border-gray-100"
          >
            <div className="flex items-start gap-4">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{event.title}</h3>
                  {event.is_featured && (
                    <StarIcon className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                    {event.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    {event.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {new Date(event.start_date).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-purple-600">
                    KES {event.ticket_price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {events.length > 5 && (
        <Link
          to="/events"
          className="block text-center text-sm text-purple-600 hover:text-purple-700 mt-4 font-medium"
        >
          View all recommendations →
        </Link>
      )}
    </div>
  );
};

export default AIRecommendations;
