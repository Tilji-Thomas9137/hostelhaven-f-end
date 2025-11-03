import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  Users, 
  Home,
  LogOut,
  User,
  Settings,
  Bell,
  Calendar,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Plus,
  Search,
  Filter,
  Download,
  Heart,
  Activity,
  Award,
  BookOpen,
  GraduationCap,
  Shield,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import ChatWidget from '../ui/ChatWidget';
import RazorpayPaymentModal from '../ui/RazorpayPaymentModal';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [childInfo, setChildInfo] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'online',
    transaction_reference: ''
  });
  const [showPaymentDuePopup, setShowPaymentDuePopup] = useState(false);
  const [dueNotification, setDueNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academicPerformance, setAcademicPerformance] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [notifications, setNotifications] = useState([]);

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

  // Fetch unread payment_due notification on mount
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch('http://localhost:3002/api/notifications?type=payment_due&is_read=false&limit=1', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const json = await res.json();
        if (res.ok && json.success && json.data.notifications.length > 0) {
          setDueNotification(json.data.notifications[0]);
          setShowPaymentDuePopup(true);
        }
      } catch (_) {}
    })();
  }, []);

  const parsePaymentFromNotification = (n) => {
    if (!n) return {};
    const msg = n.message || '';
    const m = msg.match(/₹([\d.]+).*for\s(.+?)\s\(ID:.*\)\sby\s(.+)$/i);
    const amount = m ? parseFloat(m[1]) : 0;
    const typeText = m ? m[2] : '';
    const mapType = (t) => {
      const key = t.toLowerCase().replace(/\s+/g, '_');
      return ['room_rent','mess_fees','security_deposit','other'].includes(key) ? key : 'other';
    };
    return { amount, payment_type: mapType(typeText) };
  };

  const handleDueProceed = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && dueNotification) {
        await fetch(`http://localhost:3002/api/notifications/${dueNotification.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
      }
    } catch (_) {}
    setShowPaymentDuePopup(false);
  };

  const openPayFromDue = async (method) => {
    const info = parsePaymentFromNotification(dueNotification);
    setSelectedPayment({ amount: info.amount, payment_type: info.payment_type });
    setPaymentForm(prev => ({ ...prev, payment_method: method }));
    setShowPaymentDuePopup(false);
    setShowPaymentModal(true);
  };

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
        console.log('📊 Full API Response:', JSON.stringify(result, null, 2));
        const childData = result.data.child;
        console.log('👤 Child Data:', childData);

        // Helpers for clean display
        const ordinal = (n) => {
          const s = ["th","st","nd","rd"], v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        const calcAge = () => undefined; // age not displayed per requirements
        const calcYear = (batchYear) => {
          if (!batchYear) return 'N/A';
          const yearNum = Math.max(1, (new Date().getFullYear() - Number(batchYear)) + 1);
          return `${ordinal(yearNum)} Year`;
        };
        
        console.log('🔍 Profile Data:', childData.profile);
        console.log('🔍 Admission Number:', childData.profile.admission_number);
        console.log('🔍 Course:', childData.profile.course);
        console.log('🔍 Room Allocation:', childData.roomAllocation);
        
        // Set real child information (single-hostel defaults)
        setChildInfo({
          name: childData.profile.users.full_name,
          age: calcAge(childData.profile.date_of_birth),
          room: childData.roomAllocation?.rooms?.room_number || 'Not Assigned',
          hostel: 'HostelHaven',
          floor: childData.roomAllocation?.rooms?.floor || 'N/A',
          checkInDate: childData.profile.check_in_date || childData.profile.join_date || 'N/A',
          academicYear: childData.profile.academic_year || 'N/A',
          course: childData.profile.course || 'N/A',
          admissionNumber: childData.profile.admission_number,
          email: childData.profile.users.email,
          phone: childData.profile.users.phone || childData.profile.parent_phone || 'N/A'
        });

        // Set real payments data
        const formattedPayments = childData.payments.map((payment, index) => ({
          id: payment.id,
          month: new Date(payment.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          amount: payment.amount,
          status: payment.status,
          dueDate: payment.due_date,
          paidDate: payment.paid_date
        }));
        setPayments(formattedPayments);

        // Set academic performance (using profile data)
        setAcademicPerformance({
          gpa: childData.profile.gpa || 'N/A',
          attendance: childData.profile.attendance_percentage || 'N/A',
          subjects: [
            { name: 'Overall Performance', grade: childData.profile.gpa || 'N/A', attendance: childData.profile.attendance_percentage || 'N/A' }
          ]
        });

        // Set health status (using profile data)
        setHealthStatus({
          overallHealth: childData.profile.medical_status || 'Good',
          lastCheckup: childData.profile.last_medical_checkup || 'N/A',
          vaccinations: childData.profile.vaccination_status || 'Up to date',
          allergies: childData.profile.allergies || 'None',
          emergencyContact: childData.profile.emergency_contact || childData.profile.parent_phone || 'N/A',
          medicalNotes: childData.profile.medical_notes || 'No medical issues reported'
        });

        // Set communications (using complaints and leave requests)
        const communications = [];
        
        // Add complaints as communications
        childData.complaints.forEach((complaint, index) => {
          communications.push({
            id: `complaint-${complaint.id}`,
            type: 'notification',
            subject: `Complaint: ${complaint.title}`,
            date: new Date(complaint.created_at).toLocaleDateString(),
            status: complaint.status === 'resolved' ? 'read' : 'unread',
            content: complaint.description
          });
        });

        // Add leave requests as communications
        childData.leaveRequests.forEach((request, index) => {
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

      } else {
        console.error('Failed to fetch child data:', response.statusText);
        // Fallback to mock data if API fails
        fetchMockData();
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
      // Fallback to mock data if API fails
      fetchMockData();
    }
  };

  const fetchMockData = () => {
    // Fallback mock data
    setChildInfo({
      name: 'No Child Data Available',
      age: 'N/A',
      room: 'N/A',
      hostel: 'N/A',
      floor: 'N/A',
      checkInDate: 'N/A',
      academicYear: 'N/A',
      course: 'N/A'
    });

    setPayments([]);
    setAcademicPerformance({
      currentSemester: 'N/A',
      gpa: 'N/A',
      attendance: 'N/A',
      subjects: []
    });

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

  const fetchPayments = async () => {
    // Placeholder for payment fetching
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'academic', label: 'Academic Performance', icon: GraduationCap },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'health', label: 'Health Status', icon: Heart },
    { id: 'communications', label: 'Communications', icon: Mail }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Child Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Child Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Name</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Admission Number</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.admissionNumber || 'N/A'}</p>
            </div>
            {/* Age intentionally removed */}
            {/* Academic Year intentionally removed */}
            <div>
              <label className="text-sm font-medium text-slate-600">Course</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.course}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.email || 'N/A'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Room</label>
              <p className={`text-lg font-semibold ${childInfo?.room === 'Not Assigned' ? 'text-red-600' : 'text-slate-800'}`}>
                {childInfo?.room}
              </p>
            </div>
            {/* Hostel hidden for single-hostel platform */}
            <div>
              <label className="text-sm font-medium text-slate-600">Check-in Date</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.checkInDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Floor</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.floor}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Phone</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Recent Notifications</h2>
            <div className="text-sm text-slate-500">{notifications.length} unread</div>
          </div>
          
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className={`flex items-start space-x-4 p-4 rounded-xl transition-colors ${
                notification.type === 'room_allocation' ? 'bg-green-50 hover:bg-green-100' :
                notification.type === 'payment_due' ? 'bg-yellow-50 hover:bg-yellow-100' :
                'bg-blue-50 hover:bg-blue-100'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.type === 'room_allocation' ? 'bg-green-100 text-green-600' :
                  notification.type === 'payment_due' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {notification.type === 'room_allocation' ? <Home className="w-5 h-5" /> :
                   notification.type === 'payment_due' ? <CreditCard className="w-5 h-5" /> :
                   <Bell className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{notification.title}</p>
                  <p className="text-sm text-slate-600">{notification.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">GPA</h3>
              <p className="text-2xl font-bold text-slate-900">{academicPerformance?.gpa || '3.8'}</p>
              <p className="text-sm text-slate-600">Current semester</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Attendance</h3>
              <p className="text-2xl font-bold text-green-600">{academicPerformance?.attendance || '95'}%</p>
              <p className="text-sm text-slate-600">Overall attendance</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Payment Status</h3>
              <p className="text-2xl font-bold text-green-600">Up to Date</p>
              <p className="text-sm text-slate-600">All payments current</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Health Status</h3>
              <p className="text-2xl font-bold text-green-600">Excellent</p>
              <p className="text-sm text-slate-600">Last checkup: Jan 20</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Communications */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Communications</h2>
        <div className="space-y-4">
          {communications.slice(0, 3).map((comm) => (
            <div key={comm.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                comm.type === 'email' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-amber-100 text-amber-600'
              }`}>
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{comm.subject}</p>
                <p className="text-sm text-slate-600">{comm.date}</p>
              </div>
              {comm.status === 'unread' && (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAcademic = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Academic Performance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <h3 className="text-lg font-semibold text-slate-800">Current GPA</h3>
            <p className="text-3xl font-bold text-blue-600">{academicPerformance?.gpa}</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <h3 className="text-lg font-semibold text-slate-800">Attendance</h3>
            <p className="text-3xl font-bold text-green-600">{academicPerformance?.attendance}%</p>
          </div>
          {/* Semester removed as per requirements */}
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mb-4">Subject-wise Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {academicPerformance?.subjects.map((subject, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{subject.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{subject.grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{subject.attendance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => {
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const paidPayments = payments.filter(p => p.status === 'paid');
    const overduePayments = payments.filter(p => p.status === 'overdue');

    return (
      <div className="space-y-6">
        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Payments</p>
                <p className="text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Paid Payments</p>
                <p className="text-2xl font-bold text-green-600">{paidPayments.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overduePayments.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
          <div className="p-6 border-b border-amber-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Payment History</h2>
              <button 
                onClick={exportPaymentsCSV} 
                className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paid By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 capitalize">
                        {payment.payment_type?.replace('_', ' ') || payment.month || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      ₹{payment.amount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : payment.dueDate || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {payment.paid_by_role ? (
                        <div>
                          <div className="font-medium capitalize">{payment.paid_by_role}</div>
                          {payment.paid_at && (
                            <div className="text-xs text-slate-500">
                              {new Date(payment.paid_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handlePayNow(payment)}
                          className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                          Pay Now
                        </button>
                      )}
                      {payment.status === 'paid' && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Paid</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {payments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Payments Found</h3>
              <p className="text-slate-600">No payment records found for your child.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHealth = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Health Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Overall Health</label>
              <p className="text-lg font-semibold text-green-600">{healthStatus?.overallHealth}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Last Checkup</label>
              <p className="text-lg font-semibold text-slate-800">{healthStatus?.lastCheckup}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Vaccinations</label>
              <p className="text-lg font-semibold text-slate-800">{healthStatus?.vaccinations}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Allergies</label>
              <p className="text-lg font-semibold text-slate-800">{healthStatus?.allergies}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Emergency Contact</label>
              <p className="text-lg font-semibold text-slate-800">{healthStatus?.emergencyContact}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Medical Notes</label>
              <p className="text-sm text-slate-600">{healthStatus?.medicalNotes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Communications</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Message</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {communications.map((comm) => (
          <div key={comm.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{comm.subject}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    comm.status === 'read' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {comm.status}
                  </span>
                </div>
                <p className="text-slate-600 mb-3">{comm.content}</p>
                <div className="text-sm text-slate-500">
                  {comm.date}
                </div>
              </div>
              <button className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const exportPaymentsCSV = () => {
    if (!payments || payments.length === 0) {
      alert('No payments to export');
      return;
    }
    const headers = ['Payment Type', 'Amount', 'Due Date', 'Status', 'Paid By', 'Paid Date', 'Transaction Reference'];
    const rows = payments.map(p => [
      `"${p.payment_type?.replace('_', ' ') || p.month || 'Unknown'}"`,
      p.amount || 0,
      `"${p.due_date ? new Date(p.due_date).toLocaleDateString() : p.dueDate || ''}"`,
      `"${p.status || 'pending'}"`,
      `"${p.paid_by_role || ''}"`,
      `"${p.paid_at ? new Date(p.paid_at).toLocaleDateString() : p.paidDate || ''}"`,
      `"${p.transaction_reference || ''}"`
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'child_payments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    // Show Razorpay modal for online payments
    setShowRazorpayModal(true);
  };

  const handleRazorpaySuccess = (updatedPayment) => {
    alert('Payment completed successfully!');
    setShowRazorpayModal(false);
    setSelectedPayment(null);
    fetchPayments(); // Refresh payments
  };

  const handleRazorpayClose = () => {
    setShowRazorpayModal(false);
    setSelectedPayment(null);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPayment || !paymentForm.payment_method) return;
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Not authenticated');
        return;
      }

      const response = await fetch(`http://localhost:3002/api/payments/${selectedPayment.id}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          payment_method: paymentForm.payment_method,
          transaction_reference: paymentForm.transaction_reference,
          paid_by_role: 'parent'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment failed');
      }

      alert('Payment marked as paid successfully!');
      setShowPaymentModal(false);
      setSelectedPayment(null);
      // Refresh payments by refetching child data
      fetchChildData();
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'academic':
        return renderAcademic();
      case 'payments':
        return renderPayments();
      case 'health':
        return renderHealth();
      case 'communications':
        return renderCommunications();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-xl border-r border-amber-200/50 fixed h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-amber-200/50">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">HostelHaven</span>
              <div className="text-xs text-slate-500">Parent Portal</div>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-amber-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900 truncate">{user?.fullName || 'Parent'}</p>
              <p className="text-sm text-slate-500">Parent</p>
              <p className="text-xs text-slate-400 break-all">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-amber-200/50 shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Parent Dashboard'}
              </h1>
              <p className="text-slate-600">Monitor your child's hostel life</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="max-w-6xl mx-auto relative">
            {renderContent()}
            <ChatWidget currentUser={user} channels={[{ id: 'admin-parent', label: 'Admin' }]} />
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 pt-8"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowPaymentModal(false); setSelectedPayment(null); } }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-200">
            <div className="p-6 border-b border-amber-100">
              <h3 className="text-xl font-semibold text-slate-800">Make Payment for Child</h3>
              <p className="text-slate-600 mt-1">Complete payment for your child's hostel fees</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Payment Details */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Payment Type:</span>
                  <span className="text-sm text-slate-900 capitalize">
                    {selectedPayment.payment_type?.replace('_', ' ') || selectedPayment.month || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Amount:</span>
                  <span className="text-lg font-bold text-slate-900">
                    ₹{selectedPayment.amount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Due Date:</span>
                  <span className="text-sm text-slate-900">
                    {selectedPayment.due_date ? new Date(selectedPayment.due_date).toLocaleDateString() : selectedPayment.dueDate || 'Not set'}
                  </span>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="online">Online Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Transaction Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transaction_reference}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, transaction_reference: e.target.value }))}
                    placeholder="Enter transaction ID or reference number"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">Important Note</p>
                    <p className="text-sm text-amber-700">
                      This will mark the payment as paid by parent. Please ensure you have actually completed the payment before confirming.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={isSubmitting || !paymentForm.payment_method}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentDuePopup && dueNotification && (
        <div className="fixed inset-0 flex items-start justify-center z-50 pt-6" onClick={(e)=>{ if(e.target===e.currentTarget) setShowPaymentDuePopup(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-lg w-full mx-4">
            <div className="p-5 border-b border-amber-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Child Payment Due</h3>
              <button className="text-slate-400 hover:text-slate-600" onClick={()=>setShowPaymentDuePopup(false)}><X className="w-5 h-5"/></button>
            </div>
            <div className="p-5">
              <p className="text-slate-700">{dueNotification.message}</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={()=>openPayFromDue('online')} className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Pay Online</button>
                <button onClick={()=>openPayFromDue('cash')} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50">Pay Offline</button>
                <button onClick={handleDueProceed} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50">Proceed</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Payment Modal */}
      {showRazorpayModal && selectedPayment && (
        <RazorpayPaymentModal
          payment={selectedPayment}
          onClose={handleRazorpayClose}
          onSuccess={handleRazorpaySuccess}
        />
      )}
    </div>
  );
};

export default ParentDashboard; 