import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CalendarIcon, 
  TicketIcon, 
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const menuItems = [
    {
      icon: CalendarIcon,
      title: 'My Events',
      description: 'Manage your created events',
      link: '/dashboard/events',
    },
    {
      icon: TicketIcon,
      title: 'My Bookings',
      description: 'View your ticket bookings',
      link: '/dashboard/bookings',
    },
    {
      icon: UserGroupIcon,
      title: 'Vendors',
      description: 'Manage event vendors',
      link: '/dashboard/vendors',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics',
      description: 'View event statistics',
      link: '/dashboard/analytics',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Here's an overview of your account</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-2xl font-bold text-primary-600">0</div>
          <div className="text-sm text-gray-600">Events</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-2xl font-bold text-primary-600">0</div>
          <div className="text-sm text-gray-600">Bookings</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-2xl font-bold text-primary-600">0</div>
          <div className="text-sm text-gray-600">Vendors</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-2xl font-bold text-primary-600">0</div>
          <div className="text-sm text-gray-600">Revenue</div>
        </div>
      </div>

      {/* Dashboard Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="card hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-center mb-4">
              <item.icon className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-600 text-center mt-1">{item.description}</p>
          </Link>
        ))}
      </div>

      {/* Account Settings */}
      <div className="mt-8">
        <Link
          to="/profile"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <Cog6ToothIcon className="h-5 w-5" />
          <span>Account Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
