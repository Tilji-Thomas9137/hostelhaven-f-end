import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useBeautifulToast from '../hooks/useBeautifulToast';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const OutpassTracking = () => {
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyCount, setWeeklyCount] = useState({ count: 0, limit: 3, remaining: 3 });
  const { showError } = useBeautifulToast();

  const fetchOutpasses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch outpass requests
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/outpass/my-requests`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setOutpasses(result.data || []);
        }
      }

      // Fetch weekly count
      const countResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/outpass/weekly-count`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (countResponse.ok) {
        const countResult = await countResponse.json();
        if (countResult.success) {
          setWeeklyCount(countResult.data);
        }
      }
    } catch (error) {
      console.error('Error fetching outpasses:', error);
      showError('Failed to fetch outpass data', {
        duration: 4000,
        title: 'Error!'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutpasses();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
          <span className="ml-2 text-gray-600">Loading outpass data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Weekly Outpass Summary</h3>
            <p className="text-sm text-gray-600">Track your outpass requests for this week</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-600">
              {weeklyCount.count}/{weeklyCount.limit}
            </div>
            <div className="text-sm text-gray-600">
              {weeklyCount.remaining} remaining
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                weeklyCount.count >= weeklyCount.limit 
                  ? 'bg-red-500' 
                  : weeklyCount.count >= weeklyCount.limit * 0.8 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${(weeklyCount.count / weeklyCount.limit) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Outpass List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Your Outpass Requests</h3>
            <button
              onClick={fetchOutpasses}
              className="flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {outpasses.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No Outpass Requests</h4>
              <p className="text-gray-500">You haven't submitted any outpass requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outpasses.map((outpass) => (
                <div key={outpass.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(outpass.status)}`}>
                          {getStatusIcon(outpass.status)}
                          {outpass.status.charAt(0).toUpperCase() + outpass.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(outpass.created_at)}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-800 mb-1">{outpass.reason}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span>{outpass.destination}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>
                            {formatDate(outpass.start_date)} - {formatDate(outpass.end_date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span>
                            {formatTime(outpass.start_time)} - {formatTime(outpass.end_time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ExternalLink className="w-4 h-4 text-indigo-600" />
                          <span className="capitalize">{outpass.transport_mode}</span>
                        </div>
                      </div>
                      
                      {outpass.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">
                            <strong>Rejection Reason:</strong> {outpass.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutpassTracking;



