import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BackButton from '../../components/admin/BackButton';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  BuildingStorefrontIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  GlobeAltIcon,
  UserIcon,
  PhotoIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const AddVendorPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    logo_url: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First, create a user account for the vendor
      const username = formData.business_name.toLowerCase().replace(/\s+/g, '_');
      const email = formData.contact_email;
      const password = 'vendor123';
      
      const userData = {
        username,
        email,
        password,
        first_name: formData.business_name.split(' ')[0],
        last_name: 'Vendor',
        phone_number: formData.contact_phone,
        role: 'vendor'
      };
      
      await api.post('/auth/register', userData);
      
      // Get the user by email
      const usersRes = await api.get('/admin/users');
      const user = usersRes.data.find((u: any) => u.email === email);
      
      if (user) {
        // Update user role to vendor
        await api.put(`/admin/users/${user.id}/role`, { role: 'VENDOR' });
        
        // Create vendor profile
        await api.post('/vendors/', {
          ...formData,
          user_id: user.id
        });
      }
      
      toast.success('Vendor created successfully!');
      navigate('/admin/vendors');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Vendor</h1>
        <p className="text-gray-500 mt-1">Register a new vendor on the platform</p>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="input-label">Business Name *</label>
            <div className="relative">
              <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="business_name"
                type="text"
                value={formData.business_name}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="Tasty Bites Catering"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Business Type *</label>
            <select
              name="business_type"
              value={formData.business_type}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select business type</option>
              <option value="food">Food</option>
              <option value="drinks">Drinks</option>
              <option value="entertainment">Entertainment</option>
              <option value="photography">Photography</option>
              <option value="decoration">Decoration</option>
              <option value="catering">Catering</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="input-label">Description</label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field pl-10"
                placeholder="Describe your business..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Contact Email *</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="info@tastybites.com"
                />
              </div>
            </div>
            <div>
              <label className="input-label">Contact Phone *</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="0712345678"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="input-label">Website</label>
            <div className="relative">
              <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="https://tastybites.com"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Logo URL</label>
            <div className="relative">
              <PhotoIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="https://tastybites.com/logo.png"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Vendor'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/vendors')}
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

export default AddVendorPage;
