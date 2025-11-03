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
  Home,
  Sparkles,
  Star,
  RefreshCw,
  Eye,
  User,
  MapPin,
  Filter,
  Search,
  X,
  Send,
  Loader2,
  FileText,
  Droplet
} from 'lucide-react';

const StudentCleaningRequest = () => {
  const { showNotification } = useNotification();
  const [cleaningRequests, setCleaningRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
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

      // Check if student has room allocation before allowing cleaning request
      const roomCheckResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/student-cleaning-requests/check-room-allocation`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!roomCheckResponse.ok) {
        const roomCheckResult = await roomCheckResponse.json();
        throw new Error(roomCheckResult.message || 'You must have an allocated room to request cleaning services');
      }

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
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200';
      case 'approved':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200';
      case 'in_progress':
        return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200';
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4" />;
      case 'completed':
        return <Star className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getCleaningTypeIcon = (type) => {
    switch (type) {
      case 'general':
        return <Home className="w-5 h-5 text-blue-500" />;
      case 'deep':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'window':
        return <Eye className="w-5 h-5 text-green-500" />;
      case 'bathroom':
        return <User className="w-5 h-5 text-orange-500" />;
      default:
        return <Home className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCleaningTypeColor = (type) => {
    switch (type) {
      case 'general':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'deep':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'window':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'bathroom':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Filter and search functionality
  const filteredRequests = cleaningRequests.filter(request => {
    const matchesSearch = request.cleaning_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.special_instructions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.preferred_time.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.cleaning_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    const timeMap = {
      'morning': '9:00 AM - 12:00 PM',
      'afternoon': '12:00 PM - 3:00 PM',
      'evening': '3:00 PM - 6:00 PM'
    };
    return timeMap[time] || time;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mb-4"></div>
        <p className="text-slate-600">Loading your cleaning requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Cleaning Requests</h2>
              <p className="text-slate-600 mt-1">Manage your room cleaning services with ease</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-slate-500">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Total Requests: {cleaningRequests.length}
                </span>
                <span className="text-sm text-slate-500">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Completed: {cleaningRequests.filter(r => r.status === 'completed').length}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Request</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      {cleaningRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests by type, time, or instructions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-4 pr-8 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="deep">Deep</option>
                <option value="window">Window</option>
                <option value="bathroom">Bathroom</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Cleaning Requests List */}
      <div className="space-y-6">
        {cleaningRequests.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-xl border border-amber-100">
            <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Cleaning Requests Yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">Start by submitting your first cleaning request to keep your room spotless and comfortable.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Submit Your First Request
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-amber-100">
            <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Matching Requests</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-xl border border-amber-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header with type and status */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-3 rounded-xl border ${getCleaningTypeColor(request.cleaning_type)}`}>
                      {getCleaningTypeIcon(request.cleaning_type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 capitalize">
                        {request.cleaning_type.replace('_', ' ')} Cleaning
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-2 capitalize">{request.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                      <div className="flex items-center space-x-3 text-slate-600 mb-2">
                        <Calendar className="w-5 h-5 text-amber-500" />
                        <span className="font-medium">Preferred Date</span>
                      </div>
                      <div className="text-lg font-semibold text-slate-800">
                        {formatDate(request.preferred_date)}
                      </div>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                      <div className="flex items-center space-x-3 text-slate-600 mb-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <span className="font-medium">Preferred Time</span>
                      </div>
                      <div className="text-lg font-semibold text-slate-800">
                        {formatTime(request.preferred_time)}
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {request.special_instructions && (
                    <div className="bg-gradient-to-r from-slate-50 to-amber-50 rounded-xl p-4 mb-6 border border-slate-200">
                      <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                        Special Instructions
                      </div>
                      <p className="text-slate-600 leading-relaxed">{request.special_instructions}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>Requested on {formatDate(request.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="flex items-center space-x-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleCancelRequest(request.id)}
                          className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">New Cleaning Request</h2>
                    <p className="text-amber-100 text-sm">Request cleaning services for your room</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Cleaning Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  Cleaning Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.cleaning_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, cleaning_type: e.target.value }))}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700 font-medium"
                  required
                >
                  <option value="general">🧹 General Cleaning</option>
                  <option value="deep">✨ Deep Cleaning</option>
                  <option value="window">🪟 Window Cleaning</option>
                  <option value="bathroom">🚿 Bathroom Cleaning</option>
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Preferred Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700 font-medium"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Preferred Time */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Clock className="w-4 h-4 text-green-600" />
                    Preferred Time <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.preferred_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700 font-medium"
                    required
                  >
                    <option value="">Select Time Slot</option>
                    <option value="morning">🌅 Morning (9:00 AM - 12:00 PM)</option>
                    <option value="afternoon">☀️ Afternoon (12:00 PM - 3:00 PM)</option>
                    <option value="evening">🌆 Evening (3:00 PM - 6:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="w-4 h-4 text-amber-600" />
                    Special Instructions
                    <span className="text-slate-500 text-xs font-normal ml-1">(Optional)</span>
                  </label>
                  <textarea
                    value={formData.special_instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                    placeholder="Any special requirements or instructions..."
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all resize-none border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700 font-medium"
                    rows={4}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Cleaning Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-100 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl border ${getCleaningTypeColor(selectedRequest.cleaning_type)}`}>
                    {getCleaningTypeIcon(selectedRequest.cleaning_type)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 capitalize">
                      {selectedRequest.cleaning_type.replace('_', ' ')} Cleaning Details
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-2 capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-50 to-amber-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center space-x-3 text-slate-600 mb-3">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold">Preferred Date</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {formatDate(selectedRequest.preferred_date)}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-slate-50 to-amber-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center space-x-3 text-slate-600 mb-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold">Preferred Time</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {formatTime(selectedRequest.preferred_time)}
                  </div>
                </div>
              </div>

              {selectedRequest.special_instructions && (
                <div className="bg-gradient-to-r from-slate-50 to-amber-50 rounded-xl p-4 border border-slate-200">
                  <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                    Special Instructions
                  </div>
                  <p className="text-slate-600 leading-relaxed">{selectedRequest.special_instructions}</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-slate-50 to-amber-50 rounded-xl p-4 border border-slate-200">
                <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-amber-500" />
                  Request Timeline
                </div>
                <div className="space-y-2 text-slate-600">
                  <div>Requested: {formatDate(selectedRequest.created_at)}</div>
                  {selectedRequest.updated_at && selectedRequest.updated_at !== selectedRequest.created_at && (
                    <div>Last Updated: {formatDate(selectedRequest.updated_at)}</div>
                  )}
                  {selectedRequest.completed_at && (
                    <div>Completed: {formatDate(selectedRequest.completed_at)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCleaningRequest;