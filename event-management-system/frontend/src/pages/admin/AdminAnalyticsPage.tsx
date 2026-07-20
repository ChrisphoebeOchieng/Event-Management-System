import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BackButton from '../../components/admin/BackButton';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  UsersIcon, 
  CalendarIcon, 
  TicketIcon, 
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface OverviewStats {
  total_users: number;
  total_events: number;
  total_bookings: number;
  total_vendors: number;
  total_revenue: number;
  active_events: number;
  completed_events: number;
}

const AdminAnalyticsPage: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { icon: UsersIcon, label: 'Total Users', value: stats?.total_users || 0, color: 'bg-blue-50 text-blue-600' },
    { icon: CalendarIcon, label: 'Total Events', value: stats?.total_events || 0, color: 'bg-purple-50 text-purple-600' },
    { icon: TicketIcon, label: 'Total Bookings', value: stats?.total_bookings || 0, color: 'bg-green-50 text-green-600' },
    { icon: BuildingStorefrontIcon, label: 'Total Vendors', value: stats?.total_vendors || 0, color: 'bg-orange-50 text-orange-600' },
    { icon: CurrencyDollarIcon, label: 'Revenue', value: `KES ${stats?.total_revenue.toFixed(2)}`, color: 'bg-yellow-50 text-yellow-600' },
    { icon: ArrowTrendingUpIcon, label: 'Active Events', value: stats?.active_events || 0, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <AdminLayout>
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your platform performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-soft p-4">
            <div className={`p-2 rounded-xl ${stat.color} inline-block`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Categories</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Technology</span>
              <span className="text-sm font-medium text-gray-900">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Music</span>
              <span className="text-sm font-medium text-gray-900">30%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Business</span>
              <span className="text-sm font-medium text-gray-900">25%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Confirmed</span>
              <span className="text-sm font-medium text-green-600">60%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-medium text-yellow-600">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cancelled</span>
              <span className="text-sm font-medium text-red-600">15%</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
