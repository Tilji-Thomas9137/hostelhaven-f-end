import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { complaintSchema } from '../lib/validation';
import { 
  AlertCircle, 
  Plus, 
  MessageSquare,
  Tag,
  Clock,
  CheckCircle,
  X,
  User,
  Calendar,
  AlertTriangle,
  Volume2,
  Wifi,
  Droplets,
  Zap,
  Wrench,
  UtensilsCrossed,
  Loader2,
  Sparkles,
  Send,
  FileText
} from 'lucide-react';

const StudentComplaints = () => {
  const { showNotification } = useNotification();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasRoomAllocation, setHasRoomAllocation] = useState(false);
  const [checkingRoom, setCheckingRoom] = useState(true);

  const { register, handleSubmit, formState: { errors, isValid }, reset, watch } = useForm({
    resolver: zodResolver(complaintSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      category: 'noise',
      priority: 'medium'
    }
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'noise': return <Volume2 className="w-4 h-4" />;
      case 'wifi_issue': return <Wifi className="w-4 h-4" />;
      case 'bathroom_dirt': return <Droplets className="w-4 h-4" />;
      case 'electric': return <Zap className="w-4 h-4" />;
      case 'plumbing': return <Wrench className="w-4 h-4" />;
      case 'mess_food_quality': return <UtensilsCrossed className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      noise: 'Noise',
      wifi_issue: 'WiFi Issue',
      bathroom_dirt: 'Bathroom Dirt',
      electric: 'Electric',
      plumbing: 'Plumbing',
      mess_food_quality: 'Mess Food Quality'
    };
    return labels[category] || category;
  };

  useEffect(() => {
    checkRoomAllocation();
    fetchComplaints();
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

  const fetchComplaints = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/student-complaints`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setComplaints(result.data?.complaints || []);
      } else {
        console.error('Error fetching complaints:', response.status);
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/student-complaints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification(result.message || 'Complaint submitted successfully!', 'success');
        setShowModal(false);
        reset();
        fetchComplaints();
      } else {
        // Extract error message from response
        let errorMessage = result.message || result.error || 'Failed to submit complaint';
        // If validation errors array exists, use the first error
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          errorMessage = result.errors[0].msg || result.errors[0].message || errorMessage;
        }
        console.error('Complaint submission error:', {
          status: response.status,
          statusText: response.statusText,
          result: result,
          requestData: {
            title: data.title,
            description: data.description?.substring(0, 50),
            category: data.category,
            priority: data.priority
          }
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      const errorMessage = error.message || 'Failed to submit complaint. Please check your input and try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelComplaint = async (complaintId) => {
    if (!confirm('Are you sure you want to cancel this complaint?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/student-complaints/${complaintId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification(result.message || 'Complaint cancelled successfully!', 'success');
        fetchComplaints();
      } else {
        throw new Error(result.message || 'Failed to cancel complaint');
      }
    } catch (error) {
      console.error('Error cancelling complaint:', error);
      showNotification(error.message || 'Failed to cancel complaint', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-200 text-red-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'noise':
        return 'bg-purple-100 text-purple-800';
      case 'wifi_issue':
        return 'bg-blue-100 text-blue-800';
      case 'bathroom_dirt':
        return 'bg-cyan-100 text-cyan-800';
      case 'electric':
        return 'bg-yellow-100 text-yellow-800';
      case 'plumbing':
        return 'bg-indigo-100 text-indigo-800';
      case 'mess_food_quality':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-700" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
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
          <h2 className="text-xl font-semibold text-slate-800">Complaints</h2>
          <p className="text-sm text-slate-600 mt-1">Submit and track your complaints</p>
        </div>
        <button
          onClick={() => {
            if (!hasRoomAllocation) {
              showNotification('You must have an allocated room to submit complaints. Please complete room allocation first.', 'error');
              return;
            }
            setShowModal(true);
          }}
          disabled={!hasRoomAllocation || checkingRoom}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-amber-100">
            <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Complaints</h3>
            <p className="text-slate-600 mb-6">You haven't submitted any complaints yet.</p>
            <button
              onClick={() => {
                if (!hasRoomAllocation) {
                  showNotification('You must have an allocated room to submit complaints. Please complete room allocation first.', 'error');
                  return;
                }
                setShowModal(true);
              }}
              disabled={!hasRoomAllocation || checkingRoom}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Your First Complaint
            </button>
            {!hasRoomAllocation && !checkingRoom && (
              <p className="mt-4 text-sm text-amber-600 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Room allocation required to submit complaints
              </p>
            )}
          </div>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">{complaint.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                      {getCategoryIcon(complaint.category)}
                      {getCategoryLabel(complaint.category)}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 mb-4">{complaint.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        <strong>Date:</strong> {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(complaint.priority)}
                      <span className="text-slate-600">
                        <strong>Priority:</strong> {complaint.priority}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        <strong>Category:</strong> {getCategoryLabel(complaint.category)}
                      </span>
                    </div>
                  </div>

                  {complaint.resolution && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <strong>Resolution:</strong> {complaint.resolution}
                      </p>
                      {complaint.resolved_at && (
                        <p className="text-xs text-green-600 mt-1">
                          Resolved on: {new Date(complaint.resolved_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {complaint.status === 'pending' && (
                    <button
                      onClick={() => handleCancelComplaint(complaint.id)}
                      className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowModal(false);
              reset();
            }}
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
                    <h2 className="text-2xl font-bold">New Complaint</h2>
                    <p className="text-amber-100 text-sm">Submit a complaint</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="Brief description of the issue"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    errors.title 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register('category')}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all appearance-none ${
                        errors.category 
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                          : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                      }`}
                    >
                      <option value="noise">Noise</option>
                      <option value="wifi_issue">WiFi Issue</option>
                      <option value="bathroom_dirt">Bathroom Dirt</option>
                      <option value="electric">Electric</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="mess_food_quality">Mess Food Quality</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {getCategoryIcon(watch('category'))}
                    </div>
                  </div>
                  {errors.category && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Priority Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('priority')}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      errors.priority 
                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  {errors.priority && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.priority.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description Field */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('description')}
                    placeholder="Please provide detailed information about the issue..."
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all resize-none ${
                      errors.description 
                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description.message}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {watch('description')?.length || 0} / 2000 characters
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Complaint...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentComplaints;
