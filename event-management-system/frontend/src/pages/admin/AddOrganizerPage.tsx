import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BackButton from '../../components/admin/BackButton';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const AddOrganizerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    organization: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, organization, ...userData } = formData;
      await api.post('/auth/register', userData);
      
      // Get the user by email and update role to organizer
      const usersRes = await api.get('/admin/users');
      const user = usersRes.data.find((u: any) => u.email === formData.email);
      if (user) {
        await api.put(`/admin/users/${user.id}/role`, { role: 'ORGANIZER' });
      }
      
      toast.success('Organizer created successfully!');
      navigate('/admin/organizers');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create organizer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Organizer</h1>
        <p className="text-gray-500 mt-1">Register a new event organizer</p>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">First Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="John"
                />
              </div>
            </div>
            <div>
              <label className="input-label">Last Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="input-label">Username *</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Email Address *</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Phone Number</label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="0712345678"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Organization</label>
            <div className="relative">
              <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="organization"
                type="text"
                value={formData.organization}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Event Management Co."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Password *</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="input-label">Confirm Password *</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Organizer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/organizers')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddOrganizerPage;
