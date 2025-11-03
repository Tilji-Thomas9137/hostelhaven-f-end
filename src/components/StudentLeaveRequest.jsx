import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Edit, 
  Trash2,
  CalendarDays,
  MapPin,
  FileText,
  User
} from 'lucide-react';

const StudentLeaveRequest = () => {
  const { showNotification } = useNotification();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasRoomAllocation, setHasRoomAllocation] = useState(false);
  const [checkingRoom, setCheckingRoom] = useState(true);
  const [formData, setFormData] = useState({
    leave_type: 'personal',
    from_date: '',
    to_date: '',
    reason: '',
    destination: ''
  });

  useEffect(() => {
    checkRoomAllocation();
    fetchLeaveRequests();
  }, []);

  const checkRoomAllocation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCheckingRoom(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/student-cleaning-requests/check-room-allocation`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setHasRoomAllocation(true);
      } else {
        setHasRoomAllocation(false);
      }
    } catch (error) {
      console.error('Error checking room allocation:', error);
      setHasRoomAllocation(false);
    } finally {
      setCheckingRoom(false);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/student-leave-requests`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setLeaveRequests(result.data?.leaveRequests || []);
      } else {
        console.error('Error fetching leave requests:', response.status);
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if student has room allocation before allowing leave request
      const roomCheckResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/student-cleaning-requests/check-room-allocation`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!roomCheckResponse.ok) {
        const roomCheckResult = await roomCheckResponse.json();
        throw new Error(roomCheckResult.message || 'You must have an allocated room to submit leave requests');
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/student-leave-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leave_type: formData.leave_type,
          from_date: formData.from_date,
          to_date: formData.to_date,
          reason: formData.reason,
          destination: formData.destination
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification(result.message || 'Leave request submitted successfully!', 'success');
        setShowModal(false);
        setFormData({
          leave_type: 'personal',
          from_date: '',
          to_date: '',
          reason: '',
          destination: ''
        });
        fetchLeaveRequests();
      } else {
        throw new Error(result.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      showNotification(error.message || 'Failed to submit leave request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/student-leave-requests/${requestId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification(result.message || 'Leave request cancelled successfully!', 'success');
        fetchLeaveRequests();
      } else {
        throw new Error(result.message || 'Failed to cancel leave request');
      }
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      showNotification(error.message || 'Failed to cancel leave request', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'medical':
        return 'bg-blue-100 text-blue-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      case 'family':
        return 'bg-green-100 text-green-800';
      case 'academic':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDuration = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Leave Requests</h2>
          <p className="text-sm text-slate-600 mt-1">Submit and manage your leave requests</p>
        </div>
        <button
          onClick={() => {
            if (!hasRoomAllocation) {
              showNotification('You must have an allocated room to submit leave requests. Please complete room allocation first.', 'error');
              return;
            }
            setShowModal(true);
          }}
          disabled={!hasRoomAllocation || checkingRoom}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {leaveRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-blue-100">
            <CalendarDays className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Leave Requests</h3>
            <p className="text-slate-600 mb-6">You haven't submitted any leave requests yet.</p>
            <button
              onClick={() => {
                if (!hasRoomAllocation) {
                  showNotification('You must have an allocated room to submit leave requests. Please complete room allocation first.', 'error');
                  return;
                }
                setShowModal(true);
              }}
              disabled={!hasRoomAllocation || checkingRoom}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Your First Request
            </button>
            {!hasRoomAllocation && !checkingRoom && (
              <p className="mt-4 text-sm text-blue-600 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Room allocation required to submit leave requests
              </p>
            )}
          </div>
        ) : (
          leaveRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-800 capitalize">
                      {request.leave_type} Leave
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(request.leave_type)}`}>
                      {request.leave_type}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>From Date</span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-800">
                        {new Date(request.from_date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>To Date</span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-800">
                        {new Date(request.to_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>Duration</span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-800">
                        {calculateDuration(request.from_date, request.to_date)} days
                      </div>
                    </div>

                    {request.destination && (
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>Destination</span>
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-800">
                          {request.destination}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 mb-3">
                    <div className="text-sm font-medium text-slate-700 mb-1">Reason:</div>
                    <p className="text-sm text-slate-600">{request.reason}</p>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Requested on {new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-blue-100">
              <h3 className="text-xl font-semibold text-slate-800">New Leave Request</h3>
              <p className="text-slate-600 mt-1">Submit a leave request</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Leave Type
                </label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, leave_type: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="personal">Personal</option>
                  <option value="medical">Medical</option>
                  <option value="family">Family</option>
                  <option value="emergency">Emergency</option>
                  <option value="academic">Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={formData.from_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, from_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={formData.to_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, to_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={formData.from_date || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destination (Optional)
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Where will you be going?"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please provide a detailed reason for your leave..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeaveRequest;
