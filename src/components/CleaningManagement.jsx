import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  User,
  Home,
  MapPin,
  Search,
  Filter,
  Eye,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';

const CleaningManagement = () => {
  const { showNotification } = useNotification();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('🔍 CleaningManagement: Starting to fetch requests...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ CleaningManagement: No session found');
        return;
      }

      console.log('✅ CleaningManagement: Session found, making API request...');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/cleaning-requests`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 CleaningManagement: API response status:', response.status);
      const result = await response.json();
      console.log('📡 CleaningManagement: API response:', result);

      if (response.ok && result.success) {
        console.log('✅ CleaningManagement: Successfully fetched requests:', result.data.requests?.length || 0);
        setRequests(result.data.requests || []);
        
        // Log each request's user data for debugging
        result.data.requests?.forEach((request, index) => {
          console.log(`🔍 CleaningManagement: Request ${index + 1} user data:`, {
            student_id: request.student_id,
            users: request.users,
            admission_number: request.users?.admission_number,
            full_name: request.users?.full_name,
            email: request.users?.email
          });
        });
      } else {
        console.error('❌ CleaningManagement: Error fetching requests:', result.message);
        showNotification(result.message || 'Failed to fetch cleaning requests', 'error');
      }
    } catch (error) {
      console.error('❌ CleaningManagement: Exception while fetching requests:', error);
      showNotification('Failed to fetch cleaning requests', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRequests();
    await fetchStats();
  };

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/cleaning-requests/stats`, {
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

  const handleApproveRequest = async (requestId) => {
    try {
      setIsUpdating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/cleaning-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Request approved by staff'
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification(result.message || 'Cleaning request approved successfully!', 'success');
        fetchRequests(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        throw new Error(result.message || 'Failed to approve cleaning request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification(error.message || 'Failed to approve cleaning request', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      setIsUpdating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/cleaning-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: reason || 'Request rejected by staff'
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification(result.message || 'Cleaning request rejected successfully!', 'success');
        fetchRequests(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        throw new Error(result.message || 'Failed to reject cleaning request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification(error.message || 'Failed to reject cleaning request', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmReject = () => {
    if (selectedRequest) {
      handleRejectRequest(selectedRequest.id, rejectReason);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      setIsUpdating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/cleaning-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status updated to ${newStatus}`
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification(result.message || `Status updated to ${newStatus} successfully!`, 'success');
        fetchRequests(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        throw new Error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification(error.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
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
          <h2 className="text-2xl font-bold text-slate-800">Cleaning Management</h2>
          <p className="text-slate-600">Manage cleaning requests and assignments - Operations Assistant</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Requests</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total_requests || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-3xl font-bold text-slate-900">{stats.pending_requests || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Progress</p>
              <p className="text-3xl font-bold text-slate-900">{stats.in_progress_requests || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-3xl font-bold text-slate-900">{stats.completed_requests || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Requests Alert */}
      {stats.urgent_requests > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Urgent Requests</h3>
              <p className="text-red-700">
                You have {stats.urgent_requests} urgent cleaning request{stats.urgent_requests > 1 ? 's' : ''} that need immediate attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Cleaning Requests</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Filter className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="border border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-semibold text-slate-800 capitalize">
                          {request.cleaning_type} Cleaning
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        {request.preferred_time && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {request.preferred_time}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">Student</p>
                          <p className="text-slate-800 font-semibold">
                            {request.users?.full_name || request.users?.email?.split('@')[0] || 'Unknown Student'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {request.users?.admission_number || 'Admission: N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">Room</p>
                          <p className="text-slate-800">
                            Room {request.rooms?.room_number || 'Unknown'} (Floor {request.rooms?.floor || 'Unknown'})
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-slate-600 mb-1">Description</p>
                          <p className="text-slate-800">{request.special_instructions || 'No special instructions'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Requested: {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                        
                        {request.preferred_date && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Preferred: {new Date(request.preferred_date).toLocaleDateString()}</span>
                          </div>
                        )}

                        {request.completed_at && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Completed: {new Date(request.completed_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>


                      {request.notes && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <strong>Notes:</strong> {request.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={isUpdating}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setRejectReason('');
                              setShowRejectModal(true);
                            }}
                            disabled={isUpdating}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1 disabled:opacity-50"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {request.status === 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                          disabled={isUpdating}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center space-x-1 disabled:opacity-50"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Start Work</span>
                        </button>
                      )}

                      {request.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'completed')}
                          disabled={isUpdating}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Complete</span>
                        </button>
                      )}

                      {['assigned', 'in_progress'].includes(request.status) && (
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowStatusModal(true);
                          }}
                          className="px-3 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm flex items-center space-x-1"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Update Status</span>
                        </button>
                      )}

                      <button className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Cleaning Requests</h3>
                <p className="text-slate-600">No cleaning requests have been submitted yet</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Reject Request Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Reject Cleaning Request</h3>
                  <p className="text-sm text-slate-500">Are you sure you want to reject this request?</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-slate-600">
                  <p className="font-medium text-slate-800 mb-1">
                    {selectedRequest.cleaning_type} Cleaning Request
                  </p>
                  <p className="mb-1">Student: {selectedRequest.users?.full_name || selectedRequest.users?.email?.split('@')[0] || 'Unknown Student'}</p>
                  <p className="mb-1 text-sm text-slate-500">Admission: {selectedRequest.users?.admission_number || 'N/A'}</p>
                  <p className="mb-1">Room: {selectedRequest.rooms?.room_number || 'Unknown'}</p>
                  <p>Preferred Date: {selectedRequest.preferred_date ? new Date(selectedRequest.preferred_date).toLocaleDateString() : 'Not specified'}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Reason for rejection (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Reject Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Update Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 mb-2">Request Details</h4>
                <p className="text-sm text-slate-600">
                  <strong>Type:</strong> {selectedRequest.cleaning_type} Cleaning
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Current Status:</strong> {selectedRequest.status}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Room:</strong> {selectedRequest.rooms?.room_number}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  New Status
                </label>
                <select
                  id="status-select"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={selectedRequest.status}
                >
                  {selectedRequest.status === 'assigned' && (
                    <>
                      <option value="in_progress">In Progress</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                  {selectedRequest.status === 'in_progress' && (
                    <>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const status = document.getElementById('status-select').value;
                    if (status && status !== selectedRequest.status) {
                      handleUpdateStatus(selectedRequest.id, status);
                    }
                  }}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleaningManagement;
