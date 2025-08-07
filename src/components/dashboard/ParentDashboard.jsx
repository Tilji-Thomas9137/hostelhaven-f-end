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
  Trash2
} from 'lucide-react';
import Logo from '../Logo';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [childInfo, setChildInfo] = useState(null);
  const [payments, setPayments] = useState([]);
  const [academicPerformance, setAcademicPerformance] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [communications, setCommunications] = useState([]);

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
          fetchMockData();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchMockData = () => {
    // Mock child information
    setChildInfo({
      name: 'Sarah Johnson',
      age: 19,
      room: '205',
      hostel: 'University Heights Hostel',
      floor: 2,
      checkInDate: '2024-01-15',
      academicYear: '2nd Year',
      course: 'Computer Science'
    });

    // Mock payments data
    setPayments([
      { id: 1, month: 'January 2024', amount: 1200, status: 'paid', dueDate: '2024-01-15', paidDate: '2024-01-10' },
      { id: 2, month: 'February 2024', amount: 1200, status: 'paid', dueDate: '2024-02-15', paidDate: '2024-02-12' },
      { id: 3, month: 'March 2024', amount: 1200, status: 'pending', dueDate: '2024-03-15', paidDate: null }
    ]);

    // Mock academic performance
    setAcademicPerformance({
      currentSemester: 'Spring 2024',
      gpa: 3.8,
      attendance: 95,
      subjects: [
        { name: 'Data Structures', grade: 'A', attendance: 98 },
        { name: 'Database Systems', grade: 'A-', attendance: 92 },
        { name: 'Web Development', grade: 'A', attendance: 100 },
        { name: 'Mathematics', grade: 'B+', attendance: 88 }
      ]
    });

    // Mock health status
    setHealthStatus({
      overallHealth: 'Excellent',
      lastCheckup: '2024-01-20',
      vaccinations: 'Up to date',
      allergies: 'None',
      emergencyContact: '+1-555-0123',
      medicalNotes: 'No medical issues reported'
    });

    // Mock communications
    setCommunications([
      {
        id: 1,
        type: 'email',
        subject: 'Monthly Progress Report',
        date: '2024-02-15',
        status: 'read',
        content: 'Your child is performing well academically...'
      },
      {
        id: 2,
        type: 'notification',
        subject: 'Payment Reminder',
        date: '2024-02-10',
        status: 'unread',
        content: 'March payment is due on 15th...'
      }
    ]);
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
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
            <Edit className="w-4 h-4" />
            <span>Update Info</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Name</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Age</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.age} years</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Academic Year</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.academicYear}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Course</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.course}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Room</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.room}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Hostel</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.hostel}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Check-in Date</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.checkInDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Floor</label>
              <p className="text-lg font-semibold text-slate-800">{childInfo?.floor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">GPA</h3>
          <p className="text-2xl font-bold text-slate-900">{academicPerformance?.gpa}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Attendance</h3>
          <p className="text-2xl font-bold text-green-600">{academicPerformance?.attendance}%</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Payment Status</h3>
          <p className="text-2xl font-bold text-slate-900">Up to Date</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Health Status</h3>
          <p className="text-2xl font-bold text-green-600">Excellent</p>
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
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <h3 className="text-lg font-semibold text-slate-800">Semester</h3>
            <p className="text-xl font-semibold text-slate-800">{academicPerformance?.currentSemester}</p>
          </div>
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

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Payment History</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{payment.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{payment.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {payment.paidDate || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-amber-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <Logo size="lg" animated={true} />
            </Link>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{user.fullName}</p>
                  <p className="text-slate-500">Parent</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-amber-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Parent Dashboard</h1>
                <p className="text-slate-600">Monitor your child's hostel life</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-2 mb-8">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard; 