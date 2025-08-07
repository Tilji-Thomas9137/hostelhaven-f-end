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
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
  Database,
  Cog,
  Eye,
  Trash2
} from 'lucide-react';
import Logo from '../Logo';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [hostels, setHostels] = useState([]);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState({});

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
    // Mock hostels data
    setHostels([
      {
        id: '1',
        name: 'University Heights Hostel',
        address: '123 University Ave',
        city: 'New York',
        capacity: 500,
        occupancy: 450,
        occupancyRate: 90,
        revenue: 540000
      },
      {
        id: '2',
        name: 'Campus View Hostel',
        address: '456 College Blvd',
        city: 'Los Angeles',
        capacity: 300,
        occupancy: 285,
        occupancyRate: 95,
        revenue: 342000
      }
    ]);

    // Mock students data
    setStudents([
      {
        id: '1',
        name: 'John Student',
        email: 'john@example.com',
        room: '101',
        hostel: 'University Heights',
        status: 'active',
        paymentStatus: 'paid'
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        room: '102',
        hostel: 'University Heights',
        status: 'active',
        paymentStatus: 'pending'
      }
    ]);

    // Mock analytics
    setAnalytics({
      totalStudents: 1234,
      totalRevenue: 882000,
      occupancyRate: 92.5,
      pendingIssues: 12,
      monthlyGrowth: 8.5
    });
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
    { id: 'hostels', label: 'Hostels', icon: Building2 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Total Students</h3>
          <p className="text-2xl font-bold text-slate-900">{analytics.totalStudents?.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Occupancy Rate</h3>
          <p className="text-2xl font-bold text-green-600">{analytics.occupancyRate}%</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Revenue</h3>
          <p className="text-2xl font-bold text-slate-900">${analytics.totalRevenue?.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Pending Issues</h3>
          <p className="text-2xl font-bold text-slate-900">{analytics.pendingIssues}</p>
        </div>
      </div>

      {/* Hostels Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Hostels Overview</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Hostel</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hostels.map((hostel) => (
            <div key={hostel.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">{hostel.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <p className="text-slate-600">{hostel.address}, {hostel.city}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Capacity</p>
                    <p className="font-semibold text-slate-800">{hostel.capacity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Occupancy</p>
                    <p className="font-semibold text-slate-800">{hostel.occupancy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Rate</p>
                    <p className="font-semibold text-green-600">{hostel.occupancyRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Revenue</p>
                    <p className="font-semibold text-slate-800">${hostel.revenue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-3">
                  <button className="flex items-center space-x-1 px-3 py-1 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">View</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">New student registered</p>
              <p className="text-sm text-slate-600">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">Payment received</p>
              <p className="text-sm text-slate-600">15 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">New complaint submitted</p>
              <p className="text-sm text-slate-600">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHostels = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Hostel Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search hostels..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Hostel</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Occupancy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {hostels.map((hostel) => (
                <tr key={hostel.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{hostel.name}</p>
                        <p className="text-sm text-slate-500">{hostel.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{hostel.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{hostel.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{hostel.occupancy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${hostel.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-amber-600 hover:text-amber-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Student Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hostel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{student.name}</p>
                        <p className="text-sm text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.room}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.hostel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-amber-600 hover:text-amber-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Monthly Growth</h3>
          <p className="text-2xl font-bold text-green-600">+{analytics.monthlyGrowth}%</p>
          <p className="text-sm text-slate-600 mt-2">vs last month</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Active Students</h3>
          <p className="text-2xl font-bold text-slate-900">{Math.floor(analytics.totalStudents * 0.95)}</p>
          <p className="text-sm text-slate-600 mt-2">95% of total</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Revenue Growth</h3>
          <p className="text-2xl font-bold text-purple-600">+12.5%</p>
          <p className="text-sm text-slate-600 mt-2">vs last month</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Occupancy Trends</h3>
          <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center">
            <p className="text-slate-500">Chart placeholder</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Analysis</h3>
          <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center">
            <p className="text-slate-500">Chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">System Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800">General Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Email Notifications</span>
                <button className="w-12 h-6 bg-amber-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">SMS Notifications</span>
                <button className="w-12 h-6 bg-slate-300 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Auto Backup</span>
                <button className="w-12 h-6 bg-amber-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800">Security Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Two-Factor Auth</span>
                <button className="w-12 h-6 bg-amber-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Session Timeout</span>
                <select className="px-3 py-1 border border-slate-300 rounded-lg">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Password Policy</span>
                <button className="text-amber-600 hover:text-amber-700">Configure</button>
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
      case 'hostels':
        return renderHostels();
      case 'students':
        return renderStudents();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
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
                  <p className="text-slate-500">Administrator</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-600">Manage the entire hostel system</p>
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

export default AdminDashboard; 