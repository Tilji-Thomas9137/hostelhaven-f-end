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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-amber-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 to-transparent" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Students</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{dashboardData.stats?.totalStudents || 0}</p>
                <p className="text-xs text-amber-600 font-medium">+12% from last month</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-amber-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 to-transparent" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Rooms</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{dashboardData.stats?.totalRooms || 0}</p>
                <p className="text-xs text-slate-500">Available: {dashboardData.stats?.totalRooms - Math.floor(dashboardData.stats?.totalStudents / 2) || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-amber-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/70 to-transparent" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{dashboardData.stats?.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-xs text-yellow-600 font-medium">+8% from last month</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-amber-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 to-transparent" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Issues</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{dashboardData.stats?.pendingIssues || 0}</p>
                <p className="text-xs text-amber-600 font-medium">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-amber-200/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg bg-amber-600 text-white px-4 py-2 hover:bg-amber-700 transition-colors">
                <Plus className="w-4 h-4" /> Add Student
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 transition-colors">
                <Bed className="w-4 h-4" /> Allocate Room
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 text-white px-4 py-2 hover:bg-yellow-700 transition-colors">
                <CreditCard className="w-4 h-4" /> Record Payment
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-800 text-white px-4 py-2 hover:bg-slate-900 transition-colors">
                <FileText className="w-4 h-4" /> Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-amber-200/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {dashboardData.students?.slice(0, 6).map((student, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">New student registered: {student.student_name}</p>
                    <p className="text-xs text-slate-500">{student.created_at ? new Date(student.created_at).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              ))}
              {dashboardData.students?.length === 0 && (
                <p className="text-slate-500 text-center py-4">No recent activity</p>
              )}
            </div>
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
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Top Header */}
      <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-amber-200/50 animate-fade-in">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" animated={true} standalone={true} />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
              <p className="text-xs md:text-sm text-slate-500">Manage hostel operations efficiently</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm transition-base focus-within:border-blue-300">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students, rooms, payments..."
                className="outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors active:scale-[0.98]"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <NotificationBell userId={user?.id} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-white/90 backdrop-blur border-r border-amber-200/50 min-h-[calc(100vh-60px)] hidden md:flex md:flex-col animate-slide-up">
          <div className="p-4">
            <p className="px-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Navigation</p>
          </div>
          <nav className="px-3 space-y-1 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`h-6 w-1 rounded-full ${activeTab === tab.id ? 'bg-blue-600' : 'bg-transparent group-hover:bg-slate-200'}`} />
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="animate-slide-up animate-fade-in">
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
