import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Refund {
  id: number;
  booking_reference: string;
  amount: number;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

const RefundStatus: React.FC = () => {
  const { token } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await api.get('/refunds/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefunds(response.data);
    } catch (error) {
      toast.error('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'processed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
      case 'processed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (refunds.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Status</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-gray-500">No refund requests found</p>
          <p className="text-sm text-gray-400 mt-1">You haven't requested any refunds yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Refund Status</h3>
        <button
          onClick={fetchRefunds}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {refunds.map((refund) => (
          <div
            key={refund.id}
            className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(refund.status)}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                    {refund.status.toUpperCase()}
                  </span>
                </div>
                <p className="font-medium text-gray-900 mt-2">
                  Booking: {refund.booking_reference}
                </p>
                <p className="text-sm text-gray-500">Amount: KES {refund.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">{refund.reason}</p>
                {refund.admin_notes && (
                  <p className="text-sm text-gray-500 mt-1">
                    Admin Notes: {refund.admin_notes}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Requested: {new Date(refund.created_at).toLocaleString()}
                </p>
                {refund.processed_at && (
                  <p className="text-xs text-gray-400">
                    Processed: {new Date(refund.processed_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RefundStatus;
