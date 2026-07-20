import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  CalendarIcon, 
  TicketIcon, 
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_events: number;
  total_bookings: number;
  total_vendors: number;
  total_revenue: number;
  upcoming_events: number;
  pending_payments: number;
}

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  start_date: string;
  venue: string;
  city: string;
  status: string;
  is_featured: boolean;
  ticket_price: number;
  capacity: number;
}

interface Booking {
  id: number;
  booking_reference: string;
  event_id: number;
  number_of_tickets: number;
  total_amount: number;
  status: string;
  payment_status: string;
  booked_at: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's events
        const eventsRes = await api.get('/events/my-events');
        const myEventsData = eventsRes.data || [];
        setMyEvents(myEventsData);

        // Fetch bookings
        const bookingsRes = await api.get('/bookings/');
        const bookings = bookingsRes.data || [];
        setRecentBookings(bookings.slice(0, 5));

        // Calculate stats
        const totalRevenue = bookings
          .filter((b: any) => b.payment_status === 'paid')
          .reduce((sum: number, b: any) => sum + b.total_amount, 0);

        setStats({
          total_events: myEventsData.length,
          total_bookings: bookings.length,
          total_vendors: 0,
          total_revenue: totalRevenue,
          upcoming_events: myEventsData.filter((e: any) => new Date(e.start_date) > new Date()).length,
          pending_payments: bookings.filter((b: any) => b.payment_status === 'pending').length,
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      icon: CalendarIcon,
      label: 'My Events',
      value: stats?.total_events || 0,
      color: 'bg-primary-50 text-primary-600',
      link: '/dashboard/events',
    },
    {
      icon: TicketIcon,
      label: 'My Bookings',
      value: stats?.total_bookings || 0,
      color: 'bg-secondary-50 text-secondary-600',
      link: '/bookings',
    },
    {
      icon: UserGroupIcon,
      label: 'Vendors',
      value: stats?.total_vendors || 0,
      color: 'bg-green-50 text-green-600',
      link: '/dashboard/vendors',
    },
    {
      icon: CurrencyDollarIcon,
      label: 'Revenue',
      value: `KES ${(stats?.total_revenue || 0).toFixed(2)}`,
      color: 'bg-yellow-50 text-yellow-600',
      link: '/dashboard/analytics',
    },
  ];

  const quickActions = [
    { icon: PlusCircleIcon, label: 'Create Event', path: '/admin/events/create', color: 'bg-primary-600' },
    { icon: TicketIcon, label: 'View Bookings', path: '/bookings', color: 'bg-secondary-600' },
    { icon: CalendarIcon, label: 'My Events', path: '/dashboard/events', color: 'bg-blue-600' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.first_name}! 👋
            </h1>
            <p className="text-primary-100 mt-1">
              Here's what's happening with your events and bookings
            </p>
          </div>
          <Link
            to="/admin/events/create"
            className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/30 transition-colors inline-flex items-center gap-2"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className={`${action.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition-opacity`}
            >
              <action.icon className="h-8 w-8 mx-auto mb-2" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* My Events Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Events</h2>
            <p className="text-sm text-gray-500">Events you've created</p>
          </div>
          <Link to="/dashboard/events" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1">
            View All
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {myEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">You haven't created any events yet</p>
            <Link to="/admin/events/create" className="btn-primary inline-block mt-4">
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents.slice(0, 3).map((event) => (
              <Link to={`/events/${event.id}`} key={event.id} className="card p-4 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {event.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2">{event.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    event.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {event.status}
                  </span>
                </div>
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
                    {event.capacity} spots
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <p className="text-sm text-gray-500">Your latest ticket purchases</p>
          </div>
          <Link to="/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1">
            View All
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentBookings.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <TicketIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No bookings yet</p>
              <Link to="/events" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Browse events →
              </Link>
            </div>
          ) : (
            recentBookings.map((booking) => (
              <div key={booking.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{booking.booking_reference}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>{booking.number_of_tickets} tickets</span>
                    <span>KES {booking.total_amount.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                      booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.payment_status}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{new Date(booking.booked_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
