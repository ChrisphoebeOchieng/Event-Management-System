import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, UserStats } from '../../services/adminService';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  TicketIcon,
  BuildingStorefrontIcon,
  UserPlusIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { icon: UserPlusIcon, label: 'Manage Users', path: '/admin/users', color: 'bg-primary-600' },
    { icon: CalendarIcon, label: 'Create Event', path: '/admin/events/create', color: 'bg-blue-600' },
    { icon: ChartBarIcon, label: 'Analytics', path: '/admin/analytics', color: 'bg-purple-600' },
    { icon: CurrencyDollarIcon, label: 'Refunds', path: '/admin/refunds', color: 'bg-red-600' },
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
      <div className="bg-gradient-to-r from-purple-600 to-primary-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-100 mt-1">Manage your platform, users, and events</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm">
              👑 Super Admin
            </span>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-50 rounded-xl">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-50 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{stats.total_organizers}</p>
              <p className="text-sm text-gray-500">Organizers</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-50 rounded-xl">
                <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{stats.total_vendors}</p>
              <p className="text-sm text-gray-500">Vendors</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <TicketIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{stats.total_attendees}</p>
              <p className="text-sm text-gray-500">Attendees</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/users" className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1">
          <UserGroupIcon className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <p className="text-gray-500 text-sm mt-1">View, edit, and manage all users</p>
          <ul className="mt-3 text-sm text-gray-600 space-y-1">
            <li>• Change user roles</li>
            <li>• Activate/Deactivate users</li>
            <li>• Delete users</li>
          </ul>
        </Link>

        <Link to="/admin/events" className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1">
          <CalendarIcon className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Event Management</h3>
          <p className="text-gray-500 text-sm mt-1">Create, edit, and manage events</p>
          <ul className="mt-3 text-sm text-gray-600 space-y-1">
            <li>• Create new events</li>
            <li>• Edit event details</li>
            <li>• Publish/Unpublish events</li>
          </ul>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
