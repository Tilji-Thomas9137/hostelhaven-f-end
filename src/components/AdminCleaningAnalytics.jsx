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
  TrendingUp,
  BarChart3,
  Activity,
  Star,
  RefreshCw,
  Download,
  Calendar as CalendarIcon
} from 'lucide-react';

const AdminCleaningAnalytics = () => {
  const { showNotification } = useNotification();
  const [analytics, setAnalytics] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    start_date: '',
    end_date: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter, pagination.page]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '50'
      });

      if (dateFilter.start_date) {
        queryParams.append('start_date', dateFilter.start_date);
      }
      if (dateFilter.end_date) {
        queryParams.append('end_date', dateFilter.end_date);
      }

      const response = await fetch(`${API_BASE_URL}/api/student-cleaning-requests/admin/analytics?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setAnalytics(result.data.analytics);
        setCompletedTasks(result.data.completedTasks);
        setPagination(result.data.pagination);
      } else {
        console.error('Error fetching analytics:', result.message);
        showNotification(result.message || 'Failed to fetch cleaning analytics', 'error');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showNotification('Failed to fetch cleaning analytics', 'error');
    } finally {
      setIsLoading(false);
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

  const filteredTasks = completedTasks.filter(task => {
    const matchesSearch = task.cleaning_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.rooms?.room_number?.toString().includes(searchTerm) ||
                         task.special_instructions?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mb-4"></div>
        <p className="text-slate-600">Loading cleaning analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Cleaning Analytics & Performance</h2>
              <p className="text-slate-600 mt-1">View all completed cleaning tasks and performance metrics</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-slate-500">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Total Completed: {analytics?.completedRequests || 0}
                </span>
                <span className="text-sm text-slate-500">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Completion Rate: {analytics?.completionRate || 0}%
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="font-medium">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Requests</p>
              <p className="text-3xl font-bold text-slate-900">{analytics?.totalRequests || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{analytics?.completedRequests || 0}</p>
              <p className="text-xs text-slate-500">{analytics?.completionRate || 0}% completion rate</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{analytics?.pendingRequests || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg. Completion</p>
              <p className="text-3xl font-bold text-purple-600">{analytics?.avgCompletionTime || 0}</p>
              <p className="text-xs text-slate-500">days</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cleaning Type Distribution */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Cleaning Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics?.cleaningTypeStats && Object.entries(analytics.cleaningTypeStats).map(([type, count]) => (
            <div key={type} className="text-center p-4 bg-gradient-to-br from-slate-50 to-amber-50 rounded-xl border border-slate-200">
              <div className="flex justify-center mb-2">
                {getCleaningTypeIcon(type)}
              </div>
              <p className="text-sm font-medium text-slate-600 capitalize">{type.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-slate-800">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Date Filters */}
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative">
              <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                placeholder="Start Date"
                value={dateFilter.start_date}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start_date: e.target.value }))}
                className="pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                placeholder="End Date"
                value={dateFilter.end_date}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end_date: e.target.value }))}
                className="pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search completed tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Completed Tasks List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Completed Cleaning Tasks</h3>
          <p className="text-sm text-slate-600 mt-1">All successfully completed cleaning requests</p>
        </div>

        <div className="p-6">
          {filteredTasks.length > 0 ? (
            <div className="space-y-6">
              {filteredTasks.map((task) => (
                <div key={task.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header with type and completion status */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`p-3 rounded-xl border ${getCleaningTypeColor(task.cleaning_type)}`}>
                          {getCleaningTypeIcon(task.cleaning_type)}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-800 capitalize">
                            {task.cleaning_type.replace('_', ' ')} Cleaning
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              <span className="capitalize">{task.status.replace('_', ' ')}</span>
                            </span>
                            <span className="text-sm text-slate-500">
                              <Star className="w-4 h-4 inline mr-1" />
                              Completed on {formatDate(task.completed_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-200">
                          <div className="flex items-center space-x-3 text-slate-600 mb-2">
                            <User className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Student</span>
                          </div>
                          <div className="text-sm font-semibold text-slate-800">
                            {task.user_profiles?.full_name || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {task.user_profiles?.admission_number || 'N/A'}
                          </div>
                        </div>
                        
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-200">
                          <div className="flex items-center space-x-3 text-slate-600 mb-2">
                            <Home className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Room</span>
                          </div>
                          <div className="text-sm font-semibold text-slate-800">
                            Room {task.rooms?.room_number || 'N/A'} (Floor {task.rooms?.floor || 'N/A'})
                          </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-200">
                          <div className="flex items-center space-x-3 text-slate-600 mb-2">
                            <Clock className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Preferred Time</span>
                          </div>
                          <div className="text-sm font-semibold text-slate-800">
                            {formatTime(task.preferred_time)}
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {task.special_instructions && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-slate-200">
                          <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 text-green-500" />
                            Special Instructions
                          </div>
                          <p className="text-slate-600 leading-relaxed">{task.special_instructions}</p>
                        </div>
                      )}

                      {/* Notes */}
                      {task.notes && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-amber-200">
                          <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                            Staff Notes
                          </div>
                          <p className="text-slate-600 leading-relaxed">{task.notes}</p>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center space-x-4">
                          <span>Requested: {formatDate(task.created_at)}</span>
                          {task.updated_at && task.updated_at !== task.created_at && (
                            <span>Updated: {formatDate(task.updated_at)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <CheckCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Completed Tasks Found</h3>
              <p className="text-slate-600">No completed cleaning tasks match your current filters.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCleaningAnalytics;
