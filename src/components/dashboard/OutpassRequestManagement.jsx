import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase';
import { 
  Calendar, Clock, CheckCircle, XCircle, Search, Filter, Download,
  MapPin, Phone, User, Car, Plane, Train, Bus, Footprints, AlertCircle,
  Eye, Edit, Trash2, Plus
} from 'lucide-react';

const OutpassRequestManagement = ({ data = [], onRefresh }) => {
  const { showNotification } = useNotification();
  const [outpassRequests, setOutpassRequests] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transportFilter, setTransportFilter] = useState('all');

  useEffect(() => {
    console.log('🔍 OutpassRequestManagement: Received data:', data);
    console.log('🔍 OutpassRequestManagement: Data length:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('🔍 OutpassRequestManagement: Sample request:', data[0]);
    }
    if (data) {
      setOutpassRequests(data);
    }
  }, [data]);

  const filteredRequests = outpassRequests.filter(request => {
    const matchesSearch = request.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesTransport = transportFilter === 'all' || request.transport_mode === transportFilter;
    return matchesSearch && matchesStatus && matchesTransport;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTransportIcon = (transport) => {
    switch (transport) {
      case 'walking':
        return <Footprints className="w-4 h-4" />;
      case 'bus':
        return <Bus className="w-4 h-4" />;
      case 'train':
        return <Train className="w-4 h-4" />;
      case 'flight':
        return <Plane className="w-4 h-4" />;
      case 'car':
        return <Car className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (requestId, newStatus, rejectionReason = '') => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/outpass/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          rejection_reason: rejectionReason,
          approved_by: session.user.id
        })
      });

      if (response.ok) {
        showNotification(`Outpass request ${newStatus} successfully`, 'success');
        onRefresh();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to update outpass request', 'error');
      }
    } catch (error) {
      showNotification('Failed to update outpass request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (requestId) => {
    if (!confirm('Are you sure you want to delete this outpass request?')) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/outpass/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        showNotification('Outpass request deleted successfully', 'success');
        onRefresh();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to delete outpass request', 'error');
      }
    } catch (error) {
      showNotification('Failed to delete outpass request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!outpassRequests || outpassRequests.length === 0) {
      showNotification('No outpass requests to export', 'info');
      return;
    }

    const headers = ['Student Name', 'Email', 'Reason', 'Destination', 'Start Date', 'End Date', 'Transport', 'Status', 'Emergency Contact', 'Emergency Phone', 'Created At'];
    const csvData = outpassRequests.map(request => [
      request.users?.full_name || 'N/A',
      request.users?.email || 'N/A',
      request.reason || 'N/A',
      request.destination || 'N/A',
      request.start_date || 'N/A',
      request.end_date || 'N/A',
      request.transport_mode || 'N/A',
      request.status || 'N/A',
      request.emergency_contact || 'N/A',
      request.emergency_phone || 'N/A',
      new Date(request.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outpass-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Outpass requests exported successfully', 'success');
  };

  const stats = {
    total: outpassRequests.length,
    pending: outpassRequests.filter(r => r.status === 'pending').length,
    approved: outpassRequests.filter(r => r.status === 'approved').length,
    rejected: outpassRequests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Outpass Request Management</h2>
          <p className="text-slate-600 mt-1">Manage student outpass requests and approvals</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Requests</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Rejected</p>
              <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search outpass requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={transportFilter}
            onChange={(e) => setTransportFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">All Transport</option>
            <option value="walking">Walking</option>
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="flight">Flight</option>
            <option value="car">Car</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Outpass Requests Found</h3>
            <p className="text-slate-500">No outpass requests match your current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Destination</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Dates</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Transport</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Emergency Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{request.users?.full_name || 'N/A'}</p>
                          <p className="text-sm text-slate-500">{request.users?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900">{request.reason || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900">{request.destination || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-900">{request.start_date || 'N/A'}</p>
                        <p className="text-slate-500">to {request.end_date || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getTransportIcon(request.transport_mode)}
                        <span className="text-slate-900 capitalize">{request.transport_mode || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="capitalize">{request.status || 'N/A'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-900">{request.emergency_contact || 'N/A'}</p>
                        <p className="text-slate-500">{request.emergency_phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Rejection reason:');
                                if (reason) {
                                  handleStatusUpdate(request.id, 'rejected', reason);
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutpassRequestManagement;
