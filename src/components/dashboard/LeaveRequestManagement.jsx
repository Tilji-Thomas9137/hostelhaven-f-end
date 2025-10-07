import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Calendar, Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, X,
  User, Clock, MapPin, FileText, CalendarDays, AlertTriangle, Download
} from 'lucide-react';

const LeaveRequestManagement = ({ data = [], onRefresh }) => {
  const { showNotification } = useNotification();
  const [leaveRequests, setLeaveRequests] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (data) {
      setLeaveRequests(data);
    }
  }, [data]);

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.leave_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const onSubmitAdd = async (formData) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/leave-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification('Leave request added successfully!', 'success');
        setShowAddModal(false);
        reset();
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to add leave request');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to add leave request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEdit = async (formData) => {
    if (!selectedRequest) return;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/leave-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification('Leave request updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedRequest(null);
        reset();
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to update leave request');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to update leave request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (requestId) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/leave-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification('Leave request deleted successfully!', 'success');
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to delete leave request');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to delete leave request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this leave request?')) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/leave-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification('Leave request approved successfully!', 'success');
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to approve leave request');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to approve leave request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!confirm('Are you sure you want to reject this leave request?')) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/leave-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification('Leave request rejected successfully!', 'success');
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to reject leave request');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to reject leave request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Request ID', 'Student Name', 'Leave Type', 'From Date', 'To Date', 'Status', 'Reason', 'Destination'],
      ...filteredRequests.map(request => [
        request.id || '',
        request.student_name || '',
        request.leave_type || '',
        new Date(request.from_date).toLocaleDateString(),
        new Date(request.to_date).toLocaleDateString(),
        request.status || '',
        request.reason || '',
        request.destination || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Leave request data exported successfully!', 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const calculateDuration = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Leave Request Management</h2>
          <p className="text-slate-600">Manage student leave requests and approvals</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Requests</p>
              <p className="text-3xl font-bold text-slate-900">{leaveRequests.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {leaveRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">
                {leaveRequests.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {leaveRequests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search leave requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="md:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="emergency">Emergency</option>
              <option value="medical">Medical</option>
              <option value="personal">Personal</option>
              <option value="family">Family</option>
              <option value="academic">Academic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">Leave Request #{request.id}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(request.leave_type)}`}>
                      {request.leave_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Student</p>
                      <p className="text-slate-900">{request.student_name}</p>
                      <p className="text-sm text-slate-500">{request.student_admission_number}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Duration</p>
                      <p className="text-slate-900">
                        {calculateDuration(request.from_date, request.to_date)} days
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">From Date</p>
                      <p className="text-slate-900">{new Date(request.from_date).toLocaleDateString()}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">To Date</p>
                      <p className="text-slate-900">{new Date(request.to_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        <strong>Reason:</strong> {request.reason}
                      </span>
                    </div>
                    
                    {request.destination && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          <strong>Destination:</strong> {request.destination}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        <strong>Requested:</strong> {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {request.approved_at && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          <strong>Approved:</strong> {new Date(request.approved_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {request.admin_notes && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Admin Notes:</strong> {request.admin_notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowViewModal(true);
                    }}
                    className="px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowEditModal(true);
                    }}
                    className="px-3 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(request.id)}
                    className="px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Leave Requests Found</h3>
            <p className="text-slate-600">No leave requests match your current filters</p>
          </div>
        )}
      </div>

      {/* Add Leave Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Add New Leave Request</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-6">
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

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Leave Type *
                  </label>
                  <select
                    {...register('leave_type', { required: 'Leave type is required' })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="emergency">Emergency</option>
                    <option value="medical">Medical</option>
                    <option value="personal">Personal</option>
                    <option value="family">Family</option>
                    <option value="academic">Academic</option>
                  </select>
                  {errors.leave_type && (
                    <p className="text-red-600 text-sm mt-1">{errors.leave_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue="pending"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    From Date *
                  </label>
                  <input
                    type="date"
                    {...register('from_date', { required: 'From date is required' })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.from_date && (
                    <p className="text-red-600 text-sm mt-1">{errors.from_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    To Date *
                  </label>
                  <input
                    type="date"
                    {...register('to_date', { required: 'To date is required' })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.to_date && (
                    <p className="text-red-600 text-sm mt-1">{errors.to_date.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Reason *
                </label>
                <textarea
                  {...register('reason', { required: 'Reason is required' })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter reason for leave"
                />
                {errors.reason && (
                  <p className="text-red-600 text-sm mt-1">{errors.reason.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  {...register('destination')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Where will you be going?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Admin Notes
                </label>
                <textarea
                  {...register('admin_notes')}
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Admin notes (optional)"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Adding...' : 'Add Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Leave Request Modal */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Edit Leave Request</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Student Name
                  </label>
                  <input
                    {...register('student_name', { required: 'Student name is required' })}
                    defaultValue={selectedRequest.student_name}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter student name"
                  />
                  {errors.student_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.student_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Leave Type
                  </label>
                  <select
                    {...register('leave_type', { required: 'Leave type is required' })}
                    defaultValue={selectedRequest.leave_type}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select leave type</option>
                    <option value="sick">Sick Leave</option>
                    <option value="emergency">Emergency</option>
                    <option value="personal">Personal</option>
                    <option value="family">Family</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.leave_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.leave_type.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    From Date
                  </label>
                  <input
                    {...register('from_date', { required: 'From date is required' })}
                    type="date"
                    defaultValue={selectedRequest.from_date}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.from_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.from_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    To Date
                  </label>
                  <input
                    {...register('to_date', { required: 'To date is required' })}
                    type="date"
                    defaultValue={selectedRequest.to_date}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.to_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.to_date.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Reason
                </label>
                <textarea
                  {...register('reason', { required: 'Reason is required' })}
                  defaultValue={selectedRequest.reason}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for leave"
                />
                {errors.reason && (
                  <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Destination
                  </label>
                  <input
                    {...register('destination', { required: 'Destination is required' })}
                    defaultValue={selectedRequest.destination}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter destination"
                  />
                  {errors.destination && (
                    <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    defaultValue={selectedRequest.status}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Update Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Leave Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Leave Request Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Request #{selectedRequest.id}</h4>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedRequest.leave_type)}`}>
                    {selectedRequest.leave_type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Student</p>
                    <p className="text-slate-900">{selectedRequest.student_name}</p>
                    <p className="text-sm text-slate-500">{selectedRequest.student_admission_number}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarDays className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Duration</p>
                    <p className="text-slate-900">
                      {calculateDuration(selectedRequest.from_date, selectedRequest.to_date)} days
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">From Date</p>
                    <p className="text-slate-900">{new Date(selectedRequest.from_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">To Date</p>
                    <p className="text-slate-900">{new Date(selectedRequest.to_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedRequest.destination && (
                  <div className="flex items-center space-x-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Destination</p>
                      <p className="text-slate-900">{selectedRequest.destination}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Reason</p>
                <p className="text-slate-900">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.admin_notes && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Admin Notes</p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">{selectedRequest.admin_notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

export default LeaveRequestManagement;
