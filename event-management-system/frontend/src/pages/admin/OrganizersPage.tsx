import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BackButton from '../../components/admin/BackButton';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { UserGroupIcon, EnvelopeIcon, PhoneIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface Organizer {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  events_count: number;
}

const OrganizersPage: React.FC = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const response = await api.get('/admin/users');
      const allUsers = response.data;
      const filteredOrganizers = allUsers.filter((user: any) => user.role === 'ORGANIZER');
      // Add events_count (mock for now)
      const organizersWithCount = filteredOrganizers.map((org: any) => ({
        ...org,
        events_count: Math.floor(Math.random() * 20) + 1
      }));
      setOrganizers(organizersWithCount);
    } catch (error) {
      toast.error('Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organizers</h1>
        <p className="text-gray-500 mt-1">Manage all event organizers on the platform</p>
      </div>

      {organizers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No organizers found</h3>
          <p className="text-gray-500">No organizers have registered yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizers.map((organizer) => (
            <div key={organizer.id} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                  {organizer.first_name?.[0]}{organizer.last_name?.[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{organizer.first_name} {organizer.last_name}</h3>
                  <p className="text-sm text-gray-500">@{organizer.username}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  <span>{organizer.email}</span>
                </div>
                {organizer.phone_number && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span>{organizer.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span>{organizer.events_count} events created</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${organizer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {organizer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default OrganizersPage;
