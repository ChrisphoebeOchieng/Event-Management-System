import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BackButton from '../../components/admin/BackButton';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  BuildingStorefrontIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Vendor {
  id: number;
  business_name: string;
  business_type: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  logo_url: string;
  is_approved: boolean;
  created_at: string;
  user_id: number;
}

const AdminVendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendors/');
      setVendors(response.data);
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/vendors/${id}/approve`);
      toast.success('Vendor approved successfully');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to approve vendor');
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return { color: 'bg-green-100 text-green-700', icon: CheckCircleIcon, label: 'Approved' };
    } else {
      return { color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon, label: 'Pending' };
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
        <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
        <p className="text-gray-500 mt-1">Manage all vendors on the platform</p>
      </div>

      {vendors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <BuildingStorefrontIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No vendors found</h3>
          <p className="text-gray-500">No vendors have registered yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((vendor) => {
            const statusInfo = getStatusBadge(vendor.is_approved);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={vendor.id} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {vendor.logo_url ? (
                      <img src={vendor.logo_url} alt={vendor.business_name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                        <BuildingStorefrontIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{vendor.business_name}</h3>
                      <span className="text-sm text-gray-500">{vendor.business_type}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{vendor.description}</p>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span>{vendor.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span>{vendor.contact_phone}</span>
                  </div>
                  {vendor.website && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {vendor.website}
                      </a>
                    </div>
                  )}
                </div>
                
                {!vendor.is_approved && (
                  <button
                    onClick={() => handleApprove(vendor.id)}
                    className="mt-4 btn-primary w-full text-sm"
                  >
                    Approve Vendor
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVendorsPage;
