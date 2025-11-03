import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import {
  BarChart3, Users, Shield, Home, CreditCard, AlertCircle, Calendar, TrendingUp,
  Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, X, Download, FileText,
  UserPlus, Bed, DollarSign, MessageSquare, Clock, PieChart, Activity, LogOut,
  Bell
} from 'lucide-react';
import Logo from '../Logo';
import StudentManagement from './StudentManagement';
import StaffManagement from './StaffManagement';
import RoomManagement from './RoomManagement';
import PaymentManagement from './PaymentManagement';
import ComplaintManagement from './ComplaintManagement';
import LeaveRequestManagement from './LeaveRequestManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import ChatWidget from '../ui/ChatWidget';
import NotificationBell from '../ui/NotificationBell';

const ComprehensiveAdminDashboard = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [user, setUser] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'staff', label: 'Staff', icon: Shield },
    { id: 'rooms', label: 'Rooms', icon: Home },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'leave-requests', label: 'Leave Requests', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, fetching dashboard data...');
        fetchDashboardData();
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (mounted) setUser(currentUser || null);
      } catch (_) {
        if (mounted) setUser(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session available, skipping API calls');
        setIsLoading(false);
        return;
      }
      
      console.log('Session available, making API calls...');

      // Fetch all dashboard data in parallel with error handling
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const [
        studentsResponse,
        roomsResponse,
        paymentsResponse,
        complaintsResponse,
        staffResponse,
        leaveRequestsResponse
      ] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/admission-registry/students`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch(`${API_BASE_URL}/api/room-management/rooms`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch(`${API_BASE_URL}/api/payments`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch(`${API_BASE_URL}/api/complaints`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch(`${API_BASE_URL}/api/staff-management/staff`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch(`${API_BASE_URL}/api/leave-requests`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
      ]);

      // Process responses with error handling
      const studentsData = studentsResponse.status === 'fulfilled' && studentsResponse.value.ok 
        ? await studentsResponse.value.json() 
        : { success: false, data: { students: [] }, error: studentsResponse.reason || 'Failed to fetch students' };
      
      const roomsData = roomsResponse.status === 'fulfilled' && roomsResponse.value.ok 
        ? await roomsResponse.value.json() 
        : { success: false, data: { rooms: [] }, error: roomsResponse.reason || 'Failed to fetch rooms' };
      
      const paymentsData = paymentsResponse.status === 'fulfilled' && paymentsResponse.value.ok 
        ? await paymentsResponse.value.json() 
        : { success: false, data: { payments: [] }, error: paymentsResponse.reason || 'Failed to fetch payments' };
      
      const complaintsData = complaintsResponse.status === 'fulfilled' && complaintsResponse.value.ok 
        ? await complaintsResponse.value.json() 
        : { success: false, data: { complaints: [] }, error: complaintsResponse.reason || 'Failed to fetch complaints' };
      
      const staffData = staffResponse.status === 'fulfilled' && staffResponse.value.ok 
        ? await staffResponse.value.json() 
        : { success: false, data: { staff: [] }, error: staffResponse.reason || 'Failed to fetch staff' };
      
      const leaveRequestsData = leaveRequestsResponse.status === 'fulfilled' && leaveRequestsResponse.value.ok 
        ? await leaveRequestsResponse.value.json() 
        : { success: false, data: { leaveRequests: [] }, error: leaveRequestsResponse.reason || 'Failed to fetch leave requests' };

      // Log any errors for debugging
      if (!studentsData.success) console.log('Students API error:', studentsData.error);
      if (!roomsData.success) console.log('Rooms API error:', roomsData.error);
      if (!paymentsData.success) console.log('Payments API error:', paymentsData.error);
      if (!complaintsData.success) console.log('Complaints API error:', complaintsData.error);
      if (!staffData.success) console.log('Staff API error:', staffData.error);
      if (!leaveRequestsData.success) console.log('Leave requests API error:', leaveRequestsData.error);

      // Calculate statistics
      const totalStudents = studentsData.success ? studentsData.data.students.length : 0;
      const totalRooms = roomsData.success ? roomsData.data.rooms.length : 0;
      const totalRevenue = paymentsData.success ? 
        paymentsData.data.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0) : 0;
      const pendingIssues = complaintsData.success ? 
        complaintsData.data.complaints.filter(c => c.status === 'pending').length : 0;

      // Use mock data if APIs are not available
      const mockStudents = studentsData.success ? 
        studentsData.data.students.map((student, index) => ({
          ...student,
          id: student.admission_number || `student-${index}-${Date.now()}`
        })) : [
        { id: 'mock-1', student_name: 'John Doe', admission_number: 'STU001', course: 'Computer Science', batch_year: 2024, parent_name: 'John Sr.', parent_email: 'johnsr@example.com', parent_phone: '+1234567890' },
        { id: 'mock-2', student_name: 'Jane Smith', admission_number: 'STU002', course: 'Business Administration', batch_year: 2024, parent_name: 'Jane Sr.', parent_email: 'janesr@example.com', parent_phone: '+1234567891' }
      ];
      
      const mockRooms = roomsData.success ? 
        roomsData.data.rooms.map((room, index) => ({
          ...room,
          id: room.id || `room-${index}-${Date.now()}`
        })) : [
        { id: 'mock-room-1', room_number: '101', floor: 1, capacity: 2, current_occupancy: 1, status: 'partially_filled' },
        { id: 'mock-room-2', room_number: '102', floor: 1, capacity: 2, current_occupancy: 2, status: 'full' }
      ];

      setDashboardData({
        students: mockStudents,
        rooms: mockRooms,
        payments: paymentsData.success ? paymentsData.data.payments : [],
        complaints: complaintsData.success ? complaintsData.data.complaints : [],
        staff: staffData.success ? staffData.data.staff : [],
        leaveRequests: leaveRequestsData.success ? leaveRequestsData.data.leaveRequests : [],
        stats: {
          totalStudents: mockStudents.length,
          totalRooms: mockRooms.length,
          totalRevenue,
          pendingIssues
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero KPI Cards with Vibrant Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="px-3 py-1 bg-green-500 rounded-full animate-pulse">
                <span className="text-xs font-bold text-white">+12%</span>
              </div>
            </div>
            <h3 className="text-white/90 text-sm font-semibold uppercase tracking-wide mb-2">Total Students</h3>
            <p className="text-5xl font-black text-white mb-2">{dashboardData.stats?.totalStudents || 0}</p>
            <p className="text-white/80 text-sm font-medium">from last month</p>
          </div>
        </div>

        {/* Total Rooms Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-300"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <Home className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-white/90 text-sm font-semibold uppercase tracking-wide mb-2">Total Rooms</h3>
            <p className="text-5xl font-black text-white mb-2">{dashboardData.stats?.totalRooms || 0}</p>
            <p className="text-white/80 text-sm font-medium">
              Available: {dashboardData.stats?.totalRooms - Math.floor(dashboardData.stats?.totalStudents / 2) || 0}
            </p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div className="px-3 py-1 bg-green-500 rounded-full animate-pulse">
                <span className="text-xs font-bold text-white">+8%</span>
              </div>
            </div>
            <h3 className="text-white/90 text-sm font-semibold uppercase tracking-wide mb-2">Total Revenue</h3>
            <p className="text-4xl font-black text-white mb-2">₹{dashboardData.stats?.totalRevenue?.toLocaleString() || 0}</p>
            <p className="text-white/80 text-sm font-medium">from last month</p>
          </div>
        </div>

        {/* Pending Issues Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              {(dashboardData.stats?.pendingIssues || 0) > 0 && (
                <div className="px-3 py-1 bg-orange-500 rounded-full animate-heartbeat">
                  <span className="text-xs font-bold text-white">!</span>
                </div>
              )}
            </div>
            <h3 className="text-white/90 text-sm font-semibold uppercase tracking-wide mb-2">Pending Issues</h3>
            <p className="text-5xl font-black text-white mb-2">{dashboardData.stats?.pendingIssues || 0}</p>
            <p className="text-white/80 text-sm font-medium">Requires attention</p>
          </div>
        </div>
      </div>

      {/* Quick Actions + Activity with Enhanced Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-orange-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-500 font-semibold">Manage your operations</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> 
              Add Student
            </button>
            <button className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg">
              <Bed className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" /> 
              Allocate Room
            </button>
            <button className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg">
              <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" /> 
              Record Payment
            </button>
            <button className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg">
              <FileText className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" /> 
              Export Report
            </button>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500 font-semibold">Latest updates</p>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dashboardData.students?.slice(0, 6).map((student, index) => (
              <div key={index} className="group relative overflow-hidden flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">New student registered</p>
                  <p className="text-xs font-semibold text-blue-600">{student.student_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{student.created_at ? new Date(student.created_at).toLocaleDateString() : '—'}</p>
                </div>
              </div>
            ))}
            {dashboardData.students?.length === 0 && (
              <p className="text-gray-500 text-center py-8 font-semibold">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Professional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Room Occupancy Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Room Occupancy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Occupied Rooms</span>
                <span className="text-sm font-medium text-slate-800">14/19</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" style={{width: '74%'}}></div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>74% Occupied</span>
                <span>26% Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Paid</span>
                </div>
                <span className="text-sm font-medium text-green-600">8 students</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Pending</span>
                </div>
                <span className="text-sm font-medium text-yellow-600">2 students</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Overdue</span>
                </div>
                <span className="text-sm font-medium text-red-600">1 student</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">API Services</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Email Service</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <p className="text-sm font-medium text-slate-800">New student registration</p>
                <p className="text-xs text-slate-500">2 minutes ago</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm font-medium text-slate-800">Payment reminder sent</p>
                <p className="text-xs text-slate-500">15 minutes ago</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm font-medium text-slate-800">Room allocation completed</p>
                <p className="text-xs text-slate-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Monthly Meeting</p>
                    <p className="text-xs text-slate-500">Tomorrow, 2:00 PM</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Student Orientation</p>
                    <p className="text-xs text-slate-500">Friday, 10:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'students':
        return <StudentManagement data={dashboardData.students} onRefresh={fetchDashboardData} />;
      case 'staff':
        return <StaffManagement data={dashboardData.staff} onRefresh={fetchDashboardData} />;
      case 'rooms':
        return <RoomManagement data={dashboardData.rooms} onRefresh={fetchDashboardData} />;
      case 'payments':
        return <PaymentManagement data={dashboardData.payments} onRefresh={fetchDashboardData} />;
      case 'complaints':
        return <ComplaintManagement data={dashboardData.complaints} onRefresh={fetchDashboardData} />;
      case 'leave-requests':
        return <LeaveRequestManagement data={dashboardData.leaveRequests} onRefresh={fetchDashboardData} />;
      case 'analytics':
        return <AnalyticsDashboard data={dashboardData} />;
      default:
        return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg mt-4 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50">
      {/* Top Header with Enhanced Design */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-white via-orange-50 to-amber-50 shadow-lg border-b-2 border-orange-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent tracking-tight">Admin Dashboard</h1>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Manage hostel operations efficiently</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200 focus-within:border-orange-400">
              <Search className="w-4 h-4 text-orange-500" />
              <input
                type="text"
                placeholder="Search students, rooms, payments..."
                className="outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
              />
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 shadow-lg active:scale-[0.98]"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Refresh</span>
            </button>
            <NotificationBell userId={user?.id} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar with Enhanced Design */}
        <aside className="w-64 shrink-0 bg-gradient-to-b from-white to-orange-50 backdrop-blur border-r border-orange-200 shadow-2xl min-h-[calc(100vh-80px)] hidden md:flex md:flex-col">
          <div className="p-6 border-b border-orange-200">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">HostelHaven</span>
                <div className="text-xs text-orange-600 font-semibold">Admin Portal</div>
              </div>
            </div>
          </div>
          
          <nav className="p-4 space-y-2 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl animate-slideInRight'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-blue-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-red-300"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          <div className="animate-fadeIn">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Chat Widget */}
      <ChatWidget
        currentUser={user}
        channels={[
          { id: 'ops-admin', label: 'Operations' },
          { id: 'warden-admin', label: 'Warden' },
          { id: 'admin-parent', label: 'Parents' }
        ]}
      />
    </div>
  );
};

// Additional components will be implemented next



export default ComprehensiveAdminDashboard;
