import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BackButton from '../../components/admin/BackButton';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  TagIcon,
  PhotoIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface EventFormData {
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  venue: string;
  address: string;
  city: string;
  capacity: string;
  ticket_price: string;
  image_url: string;
  status: string;
  is_featured: boolean;
  latitude: string;
  longitude: string;
}

const AddEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    start_date: '',
    end_date: '',
    venue: '',
    address: '',
    city: '',
    capacity: '',
    ticket_price: '',
    image_url: '',
    status: 'published',
    is_featured: false,
    latitude: '',
    longitude: '',
  });

  const categories = ['Technology', 'Music', 'Business', 'Art', 'Sports', 'Food', 'Education', 'Fashion', 'Health', 'Other'];
  const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru', 'Thika', 'Malindi', 'Other'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleCopyFromGoogle = () => {
    const googleAddress = prompt('Paste the address from Google Maps:');
    if (googleAddress) {
      const parts = googleAddress.split(',');
      const venue = parts[0] || '';
      const city = parts[parts.length - 1]?.trim() || '';
      const address = parts.slice(0, -1).join(',').trim();
      
      setFormData(prev => ({
        ...prev,
        venue: venue || prev.venue,
        address: address || prev.address,
        city: city || prev.city
      }));
      setCopySuccess(true);
      toast.success('Address copied from Google Maps');
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eventData: any = {
        ...formData,
        capacity: parseInt(formData.capacity),
        ticket_price: parseFloat(formData.ticket_price),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      
      // Remove empty fields
      Object.keys(eventData).forEach(key => {
        if (eventData[key] === '' || eventData[key] === null) {
          delete eventData[key];
        }
      });
      
      await api.post('/events/', eventData);
      toast.success('Event created successfully!');
      navigate('/admin/events');
    } catch (error: any) {
      console.error('Error:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-500 mt-1">Add a new event to the platform</p>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-blue-800">📋 Copy from Google Maps</h4>
                <p className="text-xs text-blue-600">Paste an address from Google Maps to auto-fill venue details</p>
              </div>
              <button
                type="button"
                onClick={handleCopyFromGoogle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                {copySuccess ? 'Copied!' : 'Paste Address'}
              </button>
            </div>
          </div>

          <div>
            <label className="input-label">Event Title *</label>
            <div className="relative">
              <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="Tech Conference 2026"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Description *</label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="input-field pl-10"
                placeholder="Describe your event..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Start Date & Time *</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="input-label">End Date & Time *</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="input-label">Venue *</label>
            <div className="relative">
              <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="venue"
                type="text"
                value={formData.venue}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="KCA University Auditorium"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Address *</label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="123 Main Street"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Latitude</label>
              <input
                name="latitude"
                type="text"
                value={formData.latitude}
                onChange={handleChange}
                className="input-field"
                placeholder="-1.2864"
              />
            </div>
            <div>
              <label className="input-label">Longitude</label>
              <input
                name="longitude"
                type="text"
                value={formData.longitude}
                onChange={handleChange}
                className="input-field"
                placeholder="36.8172"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Capacity *</label>
              <div className="relative">
                <UserGroupIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="100"
                />
              </div>
            </div>
            <div>
              <label className="input-label">Ticket Price (KES) *</label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="ticket_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.ticket_price}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="input-label">Image URL</label>
            <div className="relative">
              <PhotoIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="is_featured"
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Feature this event</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
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

export default AddEventPage;
