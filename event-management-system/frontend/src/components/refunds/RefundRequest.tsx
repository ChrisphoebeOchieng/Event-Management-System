import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface RefundRequestProps {
  bookingId: number;
  bookingReference: string;
  amount: number;
  onSuccess?: () => void;
}

const RefundRequest: React.FC<RefundRequestProps> = ({
  bookingId,
  bookingReference,
  amount,
  onSuccess
}) => {
  const { token } = useAuth();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        '/refunds/request',
        {
          booking_id: bookingId,
          reason: reason.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Refund request submitted successfully!');
        setShowForm(false);
        setReason('');
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.data.message || 'Failed to submit refund request');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit refund request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Request Refund</h4>
          <p className="text-sm text-gray-500">
            Booking: {bookingReference} - KES {amount.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showForm
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {showForm ? 'Cancel' : 'Request Refund'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Reason for Refund</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you need a refund..."
              className="input-field"
              rows={4}
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Refund requests are reviewed by our team. Processing may take 3-5 business days.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Submitting...' : 'Submit Refund Request'}
          </button>
        </form>
      )}
    </div>
  );
};

export default RefundRequest;
