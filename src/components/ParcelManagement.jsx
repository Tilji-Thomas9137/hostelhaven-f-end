import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Package, 
  QrCode, 
  CheckCircle, 
  Clock, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const ParcelManagement = () => {
  const { showNotification } = useNotification();
  const [parcels, setParcels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({});
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    fetchParcels();
    fetchStats();
  }, []);

  const fetchParcels = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/parcel-management/parcels', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setParcels(result.data.parcels || []);
      }
    } catch (error) {
      console.error('Error fetching parcels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/parcel-management/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onSubmitParcel = async (data) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('http://localhost:3002/api/parcel-management/parcels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification('Parcel logged successfully!', 'success');
        reset();
        fetchParcels();
        fetchStats();
      } else {
        throw new Error(result.message || 'Failed to log parcel');
      }
    } catch (error) {
      console.error('Error logging parcel:', error);
      showNotification(error.message || 'Failed to log parcel', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateQR = async (parcelId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/parcel-management/parcels/${parcelId}/qr-code`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setQrToken(result.data.qr_token);
        setSelectedParcel(result.data);
        setShowQRModal(true);
      } else {
        throw new Error(result.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      showNotification(error.message || 'Failed to generate QR code', 'error');
    }
  };

  const handleRegenerateQR = async (parcelId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/parcel-management/parcels/${parcelId}/regenerate-qr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setQrToken(result.data.qr_token);
        showNotification('QR token regenerated successfully!', 'success');
        fetchParcels();
      } else {
        throw new Error(result.message || 'Failed to regenerate QR token');
      }
    } catch (error) {
      console.error('Error regenerating QR:', error);
      showNotification(error.message || 'Failed to regenerate QR token', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'arrived':
        return 'bg-yellow-100 text-yellow-800';
      case 'claimed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Parcel Management</h2>
          <p className="text-slate-600">Manage parcel arrivals and QR code generation</p>
        </div>
        <button
          onClick={() => document.getElementById('parcel-form').scrollIntoView({ behavior: 'smooth' })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Parcel</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Parcels</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total_parcels || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Arrived</p>
              <p className="text-3xl font-bold text-slate-900">{stats.arrived_parcels || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Claimed</p>
              <p className="text-3xl font-bold text-slate-900">{stats.claimed_parcels || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Today</p>
              <p className="text-3xl font-bold text-slate-900">{stats.today_parcels || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Parcel Logging Form */}
      <div id="parcel-form" className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Log New Parcel</h3>
        
        <form onSubmit={handleSubmit(onSubmitParcel)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                {...register('student_name', { required: 'Student name is required' })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter student name"
              />
              {errors.student_name && (
                <p className="text-red-600 text-sm mt-1">{errors.student_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Admission Number *
              </label>
              <input
                type="text"
                {...register('student_admission_number', { required: 'Admission number is required' })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admission number"
              />
              {errors.student_admission_number && (
                <p className="text-red-600 text-sm mt-1">{errors.student_admission_number.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Sender Name *
              </label>
              <input
                type="text"
                {...register('sender_name', { required: 'Sender name is required' })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter sender name"
              />
              {errors.sender_name && (
                <p className="text-red-600 text-sm mt-1">{errors.sender_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Sender Contact
              </label>
              <input
                type="text"
                {...register('sender_contact')}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter sender contact"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('weight')}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter weight"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Size
              </label>
              <input
                type="text"
                {...register('size')}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Small, Medium, Large"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe the parcel contents"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Any additional notes"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  <span>Log Parcel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Parcels List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">All Parcels</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search parcels..."
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Filter className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Sender</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Received</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parcels.length > 0 ? (
                  parcels.map((parcel) => (
                    <tr key={parcel.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{parcel.student_name}</p>
                          <p className="text-sm text-slate-500">{parcel.student_admission_number}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{parcel.sender_name}</p>
                          {parcel.sender_contact && (
                            <p className="text-sm text-slate-500">{parcel.sender_contact}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="text-slate-900 truncate">{parcel.description || 'No description'}</p>
                          {parcel.weight && (
                            <p className="text-sm text-slate-500">{parcel.weight}kg</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(parcel.received_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parcel.status)}`}>
                          {parcel.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {parcel.status === 'arrived' && (
                            <>
                              <button
                                onClick={() => handleGenerateQR(parcel.id)}
                                className="p-1 text-blue-600 hover:text-blue-700"
                                title="Generate QR Code"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRegenerateQR(parcel.id)}
                                className="p-1 text-green-600 hover:text-green-700"
                                title="Regenerate QR"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1 text-slate-400 hover:text-amber-600" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No parcels found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">QR Code Generated</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-slate-100 rounded-lg p-4">
                <QrCode className="w-24 h-24 mx-auto text-slate-600" />
                <p className="text-sm text-slate-600 mt-2">QR Code Placeholder</p>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-slate-900">{selectedParcel?.student_name}</p>
                <p className="text-sm text-slate-600">From: {selectedParcel?.sender_name}</p>
                <p className="text-xs text-slate-500">
                  Received: {new Date(selectedParcel?.received_at).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>QR Token:</strong> {qrToken}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Valid for 24 hours. Student should show this QR code to staff for verification.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => navigator.clipboard.writeText(qrToken)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Copy Token
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParcelManagement;
