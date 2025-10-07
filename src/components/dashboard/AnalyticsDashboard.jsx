import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  TrendingUp, Users, Home, DollarSign, AlertCircle, Calendar, Clock,
  BarChart3, PieChart, Activity, Download, RefreshCw, Eye, Target
} from 'lucide-react';

const AnalyticsDashboard = ({ data }) => {
  const { showNotification } = useNotification();
  const [analyticsData, setAnalyticsData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    calculateAnalytics();
  }, [data, selectedPeriod]);

  const calculateAnalytics = () => {
    try {
      setIsLoading(true);
      
      // Calculate KPIs
      const totalStudents = data.students?.length || 0;
      const totalRooms = data.rooms?.length || 0;
      const totalRevenue = data.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const pendingComplaints = data.complaints?.filter(c => c.status === 'pending').length || 0;
      const pendingLeaveRequests = data.leaveRequests?.filter(r => r.status === 'pending').length || 0;

      // Calculate occupancy rate
      const totalCapacity = data.rooms?.reduce((sum, room) => sum + (room.capacity || 0), 0) || 0;
      const totalOccupied = data.rooms?.reduce((sum, room) => sum + (room.current_occupancy || 0), 0) || 0;
      const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

      // Calculate monthly revenue
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = data.payments?.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               payment.status === 'paid';
      }).reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Calculate average response time (mock data for complaints)
      const resolvedComplaints = data.complaints?.filter(c => c.status === 'resolved' && c.resolved_at) || [];
      const avgResponseTime = resolvedComplaints.length > 0 ? 
        resolvedComplaints.reduce((sum, complaint) => {
          const created = new Date(complaint.created_at);
          const resolved = new Date(complaint.resolved_at);
          const diffHours = Math.abs(resolved - created) / (1000 * 60 * 60);
          return sum + diffHours;
        }, 0) / resolvedComplaints.length : 0;

      // Calculate student satisfaction (mock data based on feedback)
      const totalFeedback = data.feedback?.length || 0;
      const positiveFeedback = data.feedback?.filter(f => f.sentiment_score > 0.1).length || 0;
      const satisfactionRate = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0;

      // Revenue trend data (last 6 months)
      const revenueTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthRevenue = data.payments?.filter(payment => {
          const paymentDate = new Date(payment.payment_date);
          return paymentDate.getMonth() === date.getMonth() && 
                 paymentDate.getFullYear() === date.getFullYear() &&
                 payment.status === 'paid';
        }).reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
        
        revenueTrend.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthRevenue
        });
      }

      // Occupancy distribution by floor
      const occupancyByFloor = {};
      data.rooms?.forEach(room => {
        const floor = room.floor || 'Unknown';
        if (!occupancyByFloor[floor]) {
          occupancyByFloor[floor] = { total: 0, occupied: 0 };
        }
        occupancyByFloor[floor].total += room.capacity || 0;
        occupancyByFloor[floor].occupied += room.current_occupancy || 0;
      });

      const occupancyDistribution = Object.entries(occupancyByFloor).map(([floor, data]) => ({
        floor: `Floor ${floor}`,
        occupancy: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
        total: data.total,
        occupied: data.occupied
      }));

      // Payment status distribution
      const paymentStatusDistribution = {
        paid: data.payments?.filter(p => p.status === 'paid').length || 0,
        pending: data.payments?.filter(p => p.status === 'pending').length || 0,
        overdue: data.payments?.filter(p => p.status === 'overdue').length || 0,
        failed: data.payments?.filter(p => p.status === 'failed').length || 0
      };

      // Complaint category distribution
      const complaintCategories = {};
      data.complaints?.forEach(complaint => {
        const category = complaint.category || 'other';
        complaintCategories[category] = (complaintCategories[category] || 0) + 1;
      });

      const complaintDistribution = Object.entries(complaintCategories).map(([category, count]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        count,
        percentage: Math.round((count / (data.complaints?.length || 1)) * 100)
      }));

      setAnalyticsData({
        kpis: {
          occupancyRate,
          monthlyRevenue,
          avgResponseTime: Math.round(avgResponseTime),
          satisfactionRate
        },
        revenueTrend,
        occupancyDistribution,
        paymentStatusDistribution,
        complaintDistribution,
        summary: {
          totalStudents,
          totalRooms,
          totalRevenue,
          pendingIssues: pendingComplaints + pendingLeaveRequests
        }
      });
    } catch (error) {
      console.error('Error calculating analytics:', error);
      showNotification('Failed to calculate analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAnalytics = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Occupancy Rate (%)', analyticsData.kpis?.occupancyRate || 0],
      ['Monthly Revenue (₹)', analyticsData.kpis?.monthlyRevenue || 0],
      ['Avg Response Time (hours)', analyticsData.kpis?.avgResponseTime || 0],
      ['Satisfaction Rate (%)', analyticsData.kpis?.satisfactionRate || 0],
      ['Total Students', analyticsData.summary?.totalStudents || 0],
      ['Total Rooms', analyticsData.summary?.totalRooms || 0],
      ['Total Revenue (₹)', analyticsData.summary?.totalRevenue || 0],
      ['Pending Issues', analyticsData.summary?.pendingIssues || 0]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Analytics data exported successfully!', 'success');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h2>
          <p className="text-slate-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={handleExportAnalytics}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={calculateAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Occupancy Rate</p>
              <p className="text-3xl font-bold text-slate-900">{analyticsData.kpis?.occupancyRate || 0}%</p>
              <p className="text-sm text-green-600">+5% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-slate-900">₹{analyticsData.kpis?.monthlyRevenue?.toLocaleString() || 0}</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-slate-900">{analyticsData.kpis?.avgResponseTime || 0}h</p>
              <p className="text-sm text-red-600">+2h from last month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Student Satisfaction</p>
              <p className="text-3xl font-bold text-slate-900">{analyticsData.kpis?.satisfactionRate || 0}%</p>
              <p className="text-sm text-green-600">+3% from last month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Revenue Trend</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analyticsData.revenueTrend?.map((item, index) => {
              const maxRevenue = Math.max(...analyticsData.revenueTrend.map(r => r.revenue));
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '20px' : '0' }}
                    title={`${item.month}: ₹${item.revenue.toLocaleString()}`}
                  ></div>
                  <span className="text-xs text-slate-600 mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              Total Revenue: ₹{analyticsData.revenueTrend?.reduce((sum, item) => sum + item.revenue, 0).toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Occupancy Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Occupancy by Floor</h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {analyticsData.occupancyDistribution?.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">{item.floor}</span>
                  <span className="text-sm text-slate-900">{item.occupancy}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.occupancy}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{item.occupied}/{item.total} beds</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Payment Status</h3>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {Object.entries(analyticsData.paymentStatusDistribution || {}).map(([status, count]) => {
              const total = Object.values(analyticsData.paymentStatusDistribution || {}).reduce((sum, c) => sum + c, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              const color = {
                paid: 'bg-green-500',
                pending: 'bg-yellow-500',
                overdue: 'bg-red-500',
                failed: 'bg-gray-500'
              }[status] || 'bg-gray-500';
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <span className="text-sm font-medium text-slate-600 capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-900">{count}</span>
                    <span className="text-xs text-slate-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complaint Categories */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Complaint Categories</h3>
            <AlertCircle className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {analyticsData.complaintDistribution?.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">{item.category}</span>
                  <span className="text-sm text-slate-900">{item.count}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{item.percentage}% of total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Summary Statistics</h3>
          <Activity className="w-5 h-5 text-slate-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{analyticsData.summary?.totalStudents || 0}</p>
            <p className="text-sm text-slate-600">Total Students</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Home className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{analyticsData.summary?.totalRooms || 0}</p>
            <p className="text-sm text-slate-600">Total Rooms</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">₹{analyticsData.summary?.totalRevenue?.toLocaleString() || 0}</p>
            <p className="text-sm text-slate-600">Total Revenue</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{analyticsData.summary?.pendingIssues || 0}</p>
            <p className="text-sm text-slate-600">Pending Issues</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
