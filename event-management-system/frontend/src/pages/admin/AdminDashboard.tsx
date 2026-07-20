import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService, UserStats } from '../../services/adminService';
import { 
  UsersIcon, 
  CalendarIcon, 
  TicketIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  EyeIcon,
  UserPlusIcon,
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_users: number;
  total_events: number;
  total_bookings: number;
  total_vendors: number;
  total_revenue: number;
  active_events: number;
  completed_events: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats({
          total_users: data.total_users || 0,
          total_events: 0,
          total_bookings: 0,
          total_vendors: 0,
          total_revenue: 0,
          active_events: 0,
          completed_events: 0
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { 
      icon: UsersIcon, 
      label: 'Total Users', 
      value: stats?.total_users || 0, 
      change: '+12.5%',
      positive: true,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      icon: CalendarIcon, 
      label: 'Total Events', 
      value: stats?.total_events || 0, 
      change: '+8.2%',
      positive: true,
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      icon: TicketIcon, 
      label: 'Total Bookings', 
      value: stats?.total_bookings || 0, 
      change: '+15.3%',
      positive: true,
      color: 'bg-green-50 text-green-600'
    },
    { 
      icon: CurrencyDollarIcon, 
      label: 'Revenue', 
      value: `KES ${(stats?.total_revenue || 0).toLocaleString()}`, 
      change: '+22.1%',
      positive: true,
      color: 'bg-yellow-50 text-yellow-600'
    },
  ];

  const quickActions = [
    { icon: PlusCircleIcon, label: 'Create Event', path: '/admin/events/create', color: 'bg-primary-600' },
    { icon: UserPlusIcon, label: 'Add User', path: '/admin/users', color: 'bg-purple-600' },
    { icon: BuildingStorefrontIcon, label: 'Manage Vendors', path: '/admin/vendors', color: 'bg-green-600' },
    { icon: EyeIcon, label: 'Review Refunds', path: '/admin/refunds', color: 'bg-red-600' },
  ];

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Created new event "Tech Conference"', time: '2 hours ago', avatar: 'JD' },
    { id: 2, user: 'Jane Smith', action: 'Booked 3 tickets for Music Fest', time: '4 hours ago', avatar: 'JS' },
    { id: 3, user: 'Bob Johnson', action: 'Requested refund for cancelled event', time: '6 hours ago', avatar: 'BJ' },
    { id: 4, user: 'Alice Brown', action: 'Registered as a vendor', time: '8 hours ago', avatar: 'AB' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className={`${action.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition-opacity shadow-soft`}
          >
            <action.icon className="h-8 w-8 mx-auto mb-2" />
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                {activity.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                <p className="text-sm text-gray-500">{activity.action}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
