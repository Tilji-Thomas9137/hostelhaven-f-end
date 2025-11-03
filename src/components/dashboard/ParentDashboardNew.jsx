import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Home,
  LogOut,
  Heart,
  Mail,
  FileText,
  CreditCard,
  Calendar,
  Bell,
  Settings,
  Calendar as CalendarIcon,
  Activity,
  CheckCircle,
  TrendingUp,
  Award,
  Shield,
  Users,
  Clock,
  AlertCircle,
  Star,
  Zap,
  Gift,
  BarChart3,
  Thermometer,
  UserCheck
} from 'lucide-react';

const ParentDashboardNew = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [childInfo, setChildInfo] = useState(null);
  const [payments, setPayments] = useState([]);
  const [academicPerformance, setAcademicPerformance] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:3002/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setUser(result.data.user);
          fetchChildData();
          fetchNotifications();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } else {
        setNotifications(notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const fetchChildData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session found');
        return;
      }

      const response = await fetch('http://localhost:3002/api/parents/child-info', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const childData = result.data.child;

        setChildInfo({
          name: childData.profile.users.full_name,
          room: childData.roomAllocation?.rooms?.room_number || 'Not Assigned',
          floor: childData.roomAllocation?.rooms?.floor || 'N/A',
          course: childData.profile.course || 'N/A',
          admissionNumber: childData.profile.admission_number,
          email: childData.profile.users.email,
          phone: childData.profile.users.phone || childData.profile.parent_phone || 'N/A'
        });

        const formattedPayments = childData.payments.map((payment) => ({
          id: payment.id,
          month: new Date(payment.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          amount: payment.amount,
          status: payment.status,
          dueDate: payment.due_date,
          paidDate: payment.paid_date
        }));
        setPayments(formattedPayments);

        setAcademicPerformance({
          gpa: childData.profile.gpa || 'N/A',
          attendance: childData.profile.attendance_percentage || 'N/A',
          subjects: []
        });

        setHealthStatus({
          overallHealth: childData.profile.medical_status || 'Good',
          lastCheckup: childData.profile.last_medical_checkup || 'N/A',
          vaccinations: childData.profile.vaccination_status || 'Up to date',
          allergies: childData.profile.allergies || 'None',
          emergencyContact: childData.profile.emergency_contact || childData.profile.parent_phone || 'N/A',
          medicalNotes: childData.profile.medical_notes || 'No medical issues reported'
        });

        const communications = [];
        childData.complaints.forEach((complaint) => {
          communications.push({
            id: `complaint-${complaint.id}`,
            type: 'notification',
            subject: `Complaint: ${complaint.title}`,
            date: new Date(complaint.created_at).toLocaleDateString(),
            status: complaint.status === 'resolved' ? 'read' : 'unread',
            content: complaint.description
          });
        });

        childData.leaveRequests.forEach((request) => {
          communications.push({
            id: `leave-${request.id}`,
            type: 'notification',
            subject: `Leave Request: ${request.reason}`,
            date: new Date(request.created_at).toLocaleDateString(),
            status: request.status === 'approved' ? 'read' : 'unread',
            content: `Leave from ${request.start_date} to ${request.end_date} - ${request.destination}`
          });
        });

        setCommunications(communications);

        // Set complaints separately for dedicated display
        const formattedComplaints = childData.complaints.map((complaint) => ({
          id: complaint.id,
          title: complaint.title,
          description: complaint.description,
          status: complaint.status,
          created_at: complaint.created_at,
          updated_at: complaint.updated_at,
          category: complaint.category || 'General'
        }));
        setComplaints(formattedComplaints);

      } else {
        console.error('Failed to fetch child data:', response.statusText);
        fetchMockData();
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
      fetchMockData();
    }
  };

  const fetchMockData = () => {
    setChildInfo({
      name: 'No Child Data Available',
      room: 'N/A',
      floor: 'N/A',
      course: 'N/A',
      admissionNumber: 'N/A',
      email: 'N/A',
      phone: 'N/A'
    });

    setPayments([]);
    setAcademicPerformance({ gpa: 'N/A', attendance: 'N/A', subjects: [] });
    setHealthStatus({
      overallHealth: 'N/A',
      lastCheckup: 'N/A',
      vaccinations: 'N/A',
      allergies: 'N/A',
      emergencyContact: 'N/A',
      medicalNotes: 'No data available'
    });
    setCommunications([]);
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
      setUser(null);
      navigate('/');
    }
  };

  const handleSavePhone = async () => {
    if (!phoneNumber) {
      alert('Please enter a phone number');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Not authenticated');
        return;
      }

      // Update parent's phone in the users table and also in child's profile
      const response = await fetch('http://localhost:3002/api/parents/update-phone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          phone: phoneNumber
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update phone number');
      }

      // Update local user state
      setUser({ ...user, phone: phoneNumber });
      
      // Update child info phone as well
      if (childInfo) {
        setChildInfo({ ...childInfo, phone: phoneNumber });
      }
      
      alert('Phone number updated successfully!');
    } catch (error) {
      console.error('Error updating phone:', error);
      alert(error.message || 'Failed to update phone number');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50 flex items-center justify-center">
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

  if (!user) {
    navigate('/login');
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'complaints', label: 'Complaints', icon: FileText },
    { id: 'health', label: 'Health Status', icon: Heart },
    { id: 'communications', label: 'Communications', icon: Mail },
    { id: 'leave', label: 'Leave & Visit Requests', icon: Calendar },
    { id: 'mess', label: 'Mess & Attendances', icon: Activity },
    { id: 'events', label: 'Events & Announcements', icon: Bell },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Student Card with Gradient */}
      <div className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-3xl shadow-2xl p-8 overflow-hidden transform hover:scale-[1.01] transition-all duration-300 animate-slideInDown">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-8 flex-1">
            {/* Avatar with Glow Effect */}
            <div className="relative group">
              <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50 animate-pulse"></div>
              {childInfo?.profileImage ? (
                <img 
                  src={childInfo.profileImage} 
                  alt={childInfo?.name || 'Student'}
                  className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="relative w-32 h-32 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300 border-4 border-white">
                  <span className="text-orange-600 text-5xl font-bold">
                    {childInfo?.name?.charAt(0) || 'S'}
                  </span>
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-lg animate-heartbeat"></div>
            </div>
            
            {/* Student Details with Improved Typography */}
            <div className="flex-1 text-white">
              <h2 className="text-4xl font-extrabold mb-2 drop-shadow-lg">{childInfo?.name || 'Student Name'}</h2>
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Award className="w-5 h-5" />
                  <p className="text-lg font-semibold">{childInfo?.course || 'Course'}</p>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Home className="w-5 h-5" />
                  <p className="text-lg font-semibold">Room {childInfo?.room || 'Not Assigned'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Attendance Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 animate-float">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3 mx-auto shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-600 text-center mb-2 font-semibold uppercase tracking-wide">Attendance</p>
              <p className="text-4xl font-extrabold text-gray-900 text-center">{academicPerformance?.attendance || '89'}%</p>
            </div>
            
            {/* Days Present Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 animate-float delay-100">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-3 mx-auto shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-600 text-center mb-2 font-semibold uppercase tracking-wide">Days Active</p>
              <p className="text-4xl font-extrabold text-gray-900 text-center">3</p>
            </div>
            
            {/* Status Card */}
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 animate-float delay-200">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mb-3 mx-auto shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-white text-center mb-2 font-semibold uppercase tracking-wide">Status</p>
              <p className="text-4xl font-extrabold text-white text-center">Safe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid with Vibrant Colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Academic Performance Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 animate-slideInLeft">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className="text-white/80 text-sm font-semibold mb-1">GPA Score</p>
          <p className="text-4xl font-extrabold text-white">{academicPerformance?.gpa || '3.8'}</p>
          <div className="mt-4 flex items-center text-white/90 text-xs">
            <Zap className="w-4 h-4 mr-1" />
            <span>Excellent Performance</span>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 animate-slideInLeft delay-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className="text-white/80 text-sm font-semibold mb-1">Payments</p>
          <p className="text-4xl font-extrabold text-white">Paid</p>
          <div className="mt-4 flex items-center text-white/90 text-xs">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>All Clear</span>
          </div>
        </div>

        {/* Health Status Card */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 animate-slideInLeft delay-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className="text-white/80 text-sm font-semibold mb-1">Health</p>
          <p className="text-4xl font-extrabold text-white">Good</p>
          <div className="mt-4 flex items-center text-white/90 text-xs">
            <Thermometer className="w-4 h-4 mr-1" />
            <span>Excellent</span>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 animate-slideInLeft delay-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className="text-white/80 text-sm font-semibold mb-1">Activity</p>
          <p className="text-4xl font-extrabold text-white">98%</p>
          <div className="mt-4 flex items-center text-white/90 text-xs">
            <Star className="w-4 h-4 mr-1" />
            <span>Very Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Status Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">Health Status</h3>
          </div>
          
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 hover:shadow-md transition-all">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Latest Checkup</p>
              <p className="text-xl font-bold text-gray-900">{healthStatus?.lastCheckup || 'March 10, 2024'}</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 hover:shadow-md transition-all">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Health Status</p>
              <p className="text-xl font-bold text-green-600">{healthStatus?.allergies || 'None'}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Vaccinations</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">COVID-19</span>
                <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">Hepatitis B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leave & Visit Requests Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">Leave Requests</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-l-4 border-blue-500 hover:shadow-md transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">April 1, 2024</p>
                  <p className="text-sm text-gray-600">Leave Request</p>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-bold shadow-md">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">Recent Complaints</h3>
          </div>
          
          {complaints.length > 0 ? (
            <div className="space-y-4">
              {complaints.slice(0, 3).map((complaint, index) => (
                <div key={complaint.id} className={`bg-gradient-to-r ${index === 0 ? 'from-red-50 to-pink-50' : index === 1 ? 'from-orange-50 to-amber-50' : 'from-yellow-50 to-orange-50'} rounded-2xl p-5 hover:shadow-lg transition-all transform hover:scale-[1.02] border-l-4 ${index === 0 ? 'border-red-500' : index === 1 ? 'border-orange-500' : 'border-yellow-500'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-2">{complaint.title}</p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                      <p className="text-xs text-gray-500 font-semibold">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md ${
                      complaint.status === 'resolved' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                        : complaint.status === 'in_progress'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    }`}>
                      {complaint.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-semibold">No complaints yet</p>
            </div>
          )}
        </div>

        {/* Communications Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">Communications</h3>
          </div>
          
          {communications.length > 0 ? (
            <div className="space-y-4">
              {communications.slice(0, 2).map((comm, index) => (
                <div key={comm.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 hover:shadow-lg transition-all transform hover:scale-[1.02]">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">{comm.subject}</p>
                      <p className="text-sm text-gray-600 mb-2">{comm.date}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{comm.content}</p>
                    </div>
                    {comm.status === 'unread' && (
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse shadow-lg"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-semibold">No communications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderComplaints = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Student Complaints</h3>
        
        {complaints.length > 0 ? (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="border-l-4 border-orange-500 bg-gray-50 rounded-r-lg p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{complaint.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{complaint.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created: {new Date(complaint.created_at).toLocaleDateString()}</span>
                      {complaint.updated_at && (
                        <span>Updated: {new Date(complaint.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    complaint.status === 'resolved' 
                      ? 'bg-green-100 text-green-800' 
                      : complaint.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {complaint.status || 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No complaints submitted</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{payment.amount?.toLocaleString() || '0'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {payment.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No payment records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderHealth = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Health Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Latest medical checkup</p>
              <p className="text-lg font-bold text-gray-900">{healthStatus?.lastCheckup || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Overall Health</p>
              <p className="text-lg font-bold text-green-600">{healthStatus?.overallHealth || 'Good'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Health Complaints</p>
              <p className="text-lg font-bold text-gray-900">{healthStatus?.allergies || 'None'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Vaccinations</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">COVID-19</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Hepatitis B</span>
                {healthStatus?.vaccinations !== 'Up to date' && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {healthStatus?.vaccinations}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Emergency Contact</p>
              <p className="text-lg font-bold text-gray-900">{healthStatus?.emergencyContact || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Medical Notes</p>
              <p className="text-sm text-gray-600">{healthStatus?.medicalNotes || 'No medical issues reported'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Communications</h3>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            New Message
          </button>
        </div>
        
        {communications.length > 0 ? (
          <div className="space-y-4">
            {communications.map((comm) => (
              <div key={comm.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{comm.subject}</p>
                    <p className="text-sm text-gray-500">{comm.date}</p>
                    <p className="text-sm text-gray-600 mt-2">{comm.content}</p>
                    {comm.status === 'unread' && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        Unread
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No communications yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeave = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Leave & Visit Requests</h3>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            New Request
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Leave Request</p>
                  <p className="text-sm text-gray-500">April 1, 2024</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMess = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Mess & Attendances</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Mess Attendance</p>
            <p className="text-2xl font-bold text-gray-900">92%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">This Month</p>
            <p className="text-2xl font-bold text-gray-900">28 days</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="text-2xl font-bold text-green-600">Regular</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-2">Mess Preference</p>
          <p className="font-medium text-gray-900">Regular Mess</p>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Events & Announcements</h3>
        </div>
        
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 bg-gray-50 rounded-r-lg p-4">
            <p className="font-medium text-gray-900">Annual Hostel Day</p>
            <p className="text-sm text-gray-500">March 15, 2024</p>
            <p className="text-sm text-gray-600 mt-2">Join us for the annual hostel day celebration...</p>
          </div>
          
          <div className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-4">
            <p className="font-medium text-gray-900">Mid Semester Break</p>
            <p className="text-sm text-gray-500">March 20, 2024</p>
            <p className="text-sm text-gray-600 mt-2">Hostel will remain open during mid semester break...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              value={user?.fullName || ''}
              readOnly
              disabled
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              value={user?.email || ''}
              readOnly
              disabled
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input 
              type="tel" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter phone number"
              value={phoneNumber || user?.phone || ''}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">You can only update your phone number</p>
          </div>
          
          <div className="pt-4">
            <button 
              onClick={handleSavePhone}
              disabled={isSaving || !phoneNumber}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'payments':
        return renderPayments();
      case 'complaints':
        return renderComplaints();
      case 'health':
        return renderHealth();
      case 'communications':
        return renderCommunications();
      case 'leave':
        return renderLeave();
      case 'mess':
        return renderMess();
      case 'events':
        return renderEvents();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-white to-gray-50 shadow-2xl border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">HostelHaven</span>
              <div className="text-xs text-gray-500 font-semibold">Parent Portal</div>
            </div>
          </Link>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl animate-slideInRight'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-red-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header with Gradient */}
        <header className="bg-gradient-to-r from-white via-orange-50 to-amber-50 shadow-lg p-6 border-b-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Overview'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.fullName || 'Parent'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-bold text-gray-900">{user?.fullName || 'Parent'}</p>
                <p className="text-sm text-gray-500 font-semibold">Parent Account</p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <span className="text-white font-extrabold text-lg">
                    {user?.fullName?.charAt(0) || 'P'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentDashboardNew;

