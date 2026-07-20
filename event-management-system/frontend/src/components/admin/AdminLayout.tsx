import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  UserGroupIcon,
  TicketIcon,
  BuildingStorefrontIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Events', href: '/admin/events', icon: CalendarIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Organizers', href: '/admin/organizers', icon: UserGroupIcon },
    { name: 'Bookings', href: '/admin/bookings', icon: TicketIcon },
    { name: 'Vendors', href: '/admin/vendors', icon: BuildingStorefrontIcon },
    { name: 'Refunds', href: '/admin/refunds', icon: CurrencyDollarIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().trim();
      const searchPaths = [
        { path: '/admin/events', keyword: 'event' },
        { path: '/admin/users', keyword: 'user' },
        { path: '/admin/refunds', keyword: 'refund' },
        { path: '/admin/analytics', keyword: 'analytics' },
        { path: '/admin/settings', keyword: 'settings' },
        { path: '/admin/bookings', keyword: 'booking' },
        { path: '/admin/vendors', keyword: 'vendor' },
        { path: '/admin/organizers', keyword: 'organizer' },
      ];
      
      const matchedPath = searchPaths.find(item => 
        item.keyword.includes(searchTerms) || searchTerms.includes(item.keyword)
      );
      
      if (matchedPath) {
        navigate(matchedPath.path);
      } else {
        navigate('/admin/events');
      }
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">EventSphere</span>
                <span className="block text-xs text-gray-500">Admin Panel</span>
              </div>
            </div>
            <button 
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive(item.href) ? 'text-primary-600' : 'text-gray-400'}`} />
                    {item.name}
                    {isActive(item.href) && (
                      <span className="ml-auto w-1.5 h-8 rounded-full bg-primary-600" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Add Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Add</p>
              <div className="space-y-2">
                <Link
                  to="/admin/events/create"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all"
                >
                  <PlusCircleIcon className="h-5 w-5 text-gray-400" />
                  Add Event
                </Link>
                <Link
                  to="/admin/users/add"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all"
                >
                  <PlusCircleIcon className="h-5 w-5 text-gray-400" />
                  Add User
                </Link>
                <Link
                  to="/admin/organizers/add"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all"
                >
                  <PlusCircleIcon className="h-5 w-5 text-gray-400" />
                  Add Organizer
                </Link>
                <Link
                  to="/admin/vendors/add"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all"
                >
                  <PlusCircleIcon className="h-5 w-5 text-gray-400" />
                  Add Vendor
                </Link>
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => logout()}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events, users, bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
              </form>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
