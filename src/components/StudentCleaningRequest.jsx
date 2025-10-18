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
  Home
} from 'lucide-react';

const StudentCleaningRequest = () => {
  const { showNotification } = useNotification();
  const [cleaningRequests, setCleaningRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    room_id: '',
    preferred_date: '',
    preferred_time: '',
    cleaning_type: 'general',
    special_instructions: ''
  });

  useEffect(() => {
    fetchCleaningRequests();
  }, []);

  const fetchCleaningRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/student-cleaning-requests`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCleaningRequests(result.data?.cleaningRequests || []);
      } else {
        console.error('Error fetching cleaning requests:', response.status);
        setCleaningRequests([]);
      }
    } catch (error) {
      console.error('Error fetching cleaning requests:', error);
      setCleaningRequests([]);
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

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/student-cleaning-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cleaning_type: formData.cleaning_type,
          preferred_date: formData.preferred_date,
          preferred_time: formData.preferred_time,
          special_instructions: formData.special_instructions
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification(result.message || 'Cleaning request submitted successfully!', 'success');
        setShowModal(false);
        setFormData({
          room_id: '',
          preferred_date: '',
          preferred_time: '',
          cleaning_type: 'general',
          special_instructions: ''
        });
        fetchCleaningRequests();
      } else {
        throw new Error(result.message || 'Failed to submit cleaning request');
      }
    } catch (error) {
      console.error('Error submitting cleaning request:', error);
      showNotification(error.message || 'Failed to submit cleaning request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this cleaning request?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/student-cleaning-requests/${requestId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification(result.message || 'Cleaning request cancelled successfully!', 'success');
        fetchCleaningRequests();
      } else {
        throw new Error(result.message || 'Failed to cancel cleaning request');
      }
    } catch (error) {
      console.error('Error cancelling cleaning request:', error);
      showNotification(error.message || 'Failed to cancel cleaning request', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Cleaning Requests</h2>
          <p className="text-sm text-slate-600 mt-1">Request cleaning services for your room</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Cleaning Requests List */}
      <div className="space-y-4">
        {cleaningRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-amber-100">
            <Home className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Cleaning Requests</h3>
            <p className="text-slate-600 mb-6">You haven't submitted any cleaning requests yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Submit Your First Request
            </button>
          </div>
        ) : (
          cleaningRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-800 capitalize">
                      {request.cleaning_type.replace('_', ' ')} Cleaning
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Preferred Date</span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-800">
                        {request.preferred_date ? new Date(request.preferred_date).toLocaleDateString() : 'Not specified'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>Preferred Time</span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-800">
                        {request.preferred_time || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  {request.special_instructions && (
                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                      <div className="text-sm font-medium text-slate-700 mb-1">Special Instructions:</div>
                      <p className="text-sm text-slate-600">{request.special_instructions}</p>
                    </div>
                  )}

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
            <div className="p-6 border-b border-amber-100">
              <h3 className="text-xl font-semibold text-slate-800">New Cleaning Request</h3>
              <p className="text-slate-600 mt-1">Request cleaning services for your room</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cleaning Type
                </label>
                <select
                  value={formData.cleaning_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, cleaning_type: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                >
                  <option value="general">General Cleaning</option>
                  <option value="deep">Deep Cleaning</option>
                  <option value="window">Window Cleaning</option>
                  <option value="bathroom">Bathroom Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={formData.preferred_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                >
                  <option value="">Select Time</option>
                  <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="afternoon">Afternoon (12:00 PM - 3:00 PM)</option>
                  <option value="evening">Evening (3:00 PM - 6:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                  placeholder="Any special requirements or instructions..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  rows={3}
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
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default StudentCleaningRequest;