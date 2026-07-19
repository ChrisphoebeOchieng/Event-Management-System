import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const AdminEventEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
    status: 'draft',
    is_featured: false,
    image_url: '',
  });

  const categories = ['Technology', 'Music', 'Business', 'Art', 'Sports', 'Food', 'Education', 'Fashion', 'Health', 'Other'];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        const data = response.data;
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : '',
          end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : '',
          venue: data.venue || '',
          address: data.address || '',
          city: data.city || '',
          capacity: data.capacity?.toString() || '',
          ticket_price: data.ticket_price?.toString() || '',
          status: data.status || 'draft',
          is_featured: data.is_featured || false,
          image_url: data.image_url || '',
        });
      } catch (error) {
        toast.error('Failed to load event');
        navigate('/admin/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const eventData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        ticket_price: parseFloat(formData.ticket_price),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };
      
      await api.put(`/events/${id}`, eventData);
      toast.success('Event updated successfully!');
      navigate('/admin/events');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate('/admin/events')}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Events
      </button>

      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Edit Event</h1>
          <p className="text-primary-100">Update event details</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="input-label">Event Title *</label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="input-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="input-field"
              placeholder="Describe your event"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <input
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Nairobi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">Start Date & Time *</label>
              <input
                name="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">End Date & Time *</label>
              <input
                name="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Venue *</label>
            <input
              name="venue"
              type="text"
              value={formData.venue}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., KCA University Auditorium"
            />
          </div>

          <div>
            <label className="input-label">Address *</label>
            <input
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Full address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">Capacity *</label>
              <input
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Max attendees"
              />
            </div>
            <div>
              <label className="input-label">Ticket Price (KES) *</label>
              <input
                name="ticket_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.ticket_price}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Image URL</label>
            <input
              name="image_url"
              type="text"
              value={formData.image_url}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
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
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Updating...' : 'Update Event'}
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
    </div>
  );
};

export default AdminEventEditPage;
