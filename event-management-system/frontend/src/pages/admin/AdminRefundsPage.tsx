import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Refund {
  id: number;
  booking_reference: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  amount: number;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  processed: number;
  total_amount: number;
  pending_amount: number;
}

const AdminRefundsPage: React.FC = () => {
  const { token } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [refundsRes, statsRes] = await Promise.all([
        api.get('/refunds/all', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/refunds/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRefunds(refundsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (refundId: number) => {
    if (!action) return;
    
    setProcessing(true);
    try {
      await api.post(
        `/refunds/process/${refundId}`,
        {
          action: action,
          admin_notes: adminNotes || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Refund ${action}ed successfully`);
      setSelectedRefund(null);
      setAdminNotes('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'processed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'approved':
      case 'processed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
          <p className="text-gray-500 mt-1">Review and process refund requests</p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-soft p-4">
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="bg-green-50 rounded-xl shadow-soft p-4">
            <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
            <div className="text-sm text-green-600">Approved</div>
          </div>
          <div className="bg-red-50 rounded-xl shadow-soft p-4">
            <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
            <div className="text-sm text-red-600">Rejected</div>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-soft p-4">
            <div className="text-2xl font-bold text-blue-700">KES {stats.pending_amount.toFixed(0)}</div>
            <div className="text-sm text-blue-600">Pending Amount</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {refunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">#{refund.id}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{refund.booking_reference}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{refund.user.name}</div>
                    <div className="text-sm text-gray-500">{refund.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-primary-600">KES {refund.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                      {getStatusIcon(refund.status)}
                      {refund.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedRefund(refund)}
                      className="text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {refunds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No refund requests found</p>
          </div>
        )}
      </div>

      {selectedRefund && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Process Refund #{selectedRefund.id}</h2>
              <button
                onClick={() => setSelectedRefund(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking</p>
                  <p className="font-medium">{selectedRefund.booking_reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-bold text-primary-600">KES {selectedRefund.amount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium">{selectedRefund.user.name}</p>
                <p className="text-sm text-gray-500">{selectedRefund.user.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <p className="text-gray-700">{selectedRefund.reason}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRefund.status)}`}>
                  {getStatusIcon(selectedRefund.status)}
                  {selectedRefund.status}
                </span>
              </div>

              <div>
                <label className="input-label">Action</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setAction('approve')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      action === 'approve'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => setAction('reject')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      action === 'reject'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="input-label">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Add notes about this refund..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleProcess(selectedRefund.id)}
                  disabled={processing}
                  className={`btn-primary flex-1 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {processing ? 'Processing...' : `Confirm ${action}`}
                </button>
                <button
                  onClick={() => setSelectedRefund(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefundsPage;
