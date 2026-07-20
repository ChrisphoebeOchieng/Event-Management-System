import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BackButton from '../../components/admin/BackButton';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('attendee');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'attendee',
    organization: '',
    title: '',
    bio: '',
    business_name: '',
    business_type: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    admin_level: 'super',
    department: '',
    permissions: []
  });

  const roles = [
    { id: 'attendee', label: 'Attendee', icon: UserCircleIcon, description: 'Book and attend events', color: 'bg-blue-50 text-blue-700' },
    { id: 'organizer', label: 'Organizer', icon: BuildingOfficeIcon, description: 'Create and manage events', color: 'bg-purple-50 text-purple-700' },
    { id: 'vendor', label: 'Vendor', icon: BuildingStorefrontIcon, description: 'Sell products and services', color: 'bg-green-50 text-green-700' },
    { id: 'admin', label: 'Admin', icon: UserGroupIcon, description: 'Full system access', color: 'bg-red-50 text-red-700' },
  ];

  const businessTypes = ['Food', 'Drinks', 'Entertainment', 'Photography', 'Decoration', 'Catering', 'Audio Visual', 'Transport', 'Other'];
  const departments = ['IT', 'Marketing', 'Operations', 'Finance', 'HR', 'Events', 'Sales', 'Customer Support'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setFormData(prev => ({ ...prev, role: roleId }));
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
      const { confirmPassword, organization, title, bio, business_name, business_type, description, contact_email, contact_phone, website, admin_level, department, permissions, ...userData } = formData;
      await api.post('/auth/register', userData);
      
      const usersRes = await api.get('/admin/users');
      const user = usersRes.data.find((u: any) => u.email === formData.email);
      
      if (user) {
        await api.put(`/admin/users/${user.id}/role`, { role: formData.role.toUpperCase() });
        
        if (formData.role === 'vendor') {
          await api.post('/vendors/', {
            business_name: formData.business_name || formData.first_name + ' ' + formData.last_name + ' Services',
            business_type: formData.business_type || 'Other',
            description: formData.description || 'Professional vendor services',
            contact_email: formData.contact_email || formData.email,
            contact_phone: formData.contact_phone || formData.phone_number,
            website: formData.website || '',
            user_id: user.id
          });
        }
      }
      
      toast.success(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} created successfully!`);
      navigate('/admin/users');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
        <p className="text-gray-500 mt-1">Create a new user account with role-specific details</p>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="input-label">Select Role</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedRole === role.id
                        ? 'border-primary-600 bg-primary-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${role.color} inline-block`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-sm font-medium mt-2">{role.label}</div>
                    <div className="text-xs text-gray-500">{role.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">First Name *</label>
              <input
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="John"
              />
            </div>
            <div>
              <label className="input-label">Last Name *</label>
              <input
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Username *</label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="johndoe"
              />
            </div>
            <div>
              <label className="input-label">Email Address *</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Phone Number</label>
            <input
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              className="input-field"
              placeholder="0712345678"
            />
          </div>

          {selectedRole === 'organizer' && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Organization</label>
                  <input
                    name="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Event Management Co."
                  />
                </div>
                <div>
                  <label className="input-label">Title / Position</label>
                  <input
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Event Director"
                  />
                </div>
                <div>
                  <label className="input-label">Bio / Description</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="input-field"
                    placeholder="Professional event organizer with 5 years of experience..."
                  />
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'vendor' && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Business Name *</label>
                  <input
                    name="business_name"
                    type="text"
                    value={formData.business_name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Tasty Bites Catering"
                  />
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
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Business Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="input-field"
                    placeholder="Describe your business..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Contact Email</label>
                    <input
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="info@business.com"
                    />
                  </div>
                  <div>
                    <label className="input-label">Contact Phone</label>
                    <input
                      name="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="0712345678"
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Website</label>
                  <input
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://business.com"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'admin' && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Admin Level</label>
                  <select
                    name="admin_level"
                    value={formData.admin_level}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="super">Super Admin</option>
                    <option value="manager">Manager</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Password *</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="input-label">Confirm Password *</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : `Create ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
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

export default AddUserPage;
