import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
  Shield,
  Eye,
  Trash2,
  Heart,
  Activity,
  Award,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import Logo from './Logo';

const WardenDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [disciplinaryCases, setDisciplinaryCases] = useState([]);
  const [studentWelfare, setStudentWelfare] = useState([]);
  const [roomInspections, setRoomInspections] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

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
    // Mock disciplinary cases
    setDisciplinaryCases([
      {
        id: '1',
        studentName: 'John Smith',
        room: '101',
        issue: 'Noise violation',
        severity: 'medium',
        status: 'active',
        reportedDate: '2024-02-15',
        description: 'Excessive noise after 10 PM'
      },
      {
        id: '2',
        studentName: 'Jane Doe',
        room: '205',
        issue: 'Unauthorized guests',
        severity: 'high',
        status: 'resolved',
        reportedDate: '2024-02-10',
        description: 'Found unauthorized guests in room'
      }
    ]);

    // Mock student welfare
    setStudentWelfare([
      {
        id: '1',
        studentName: 'Mike Johnson',
        room: '103',
        concern: 'Academic stress',
        status: 'monitoring',
        lastCheck: '2024-02-20',
        notes: 'Student showing signs of stress'
      },
      {
        id: '2',
        studentName: 'Sarah Wilson',
        room: '208',
        concern: 'Homesickness',
        status: 'improving',
        lastCheck: '2024-02-18',
        notes: 'Student adapting well to hostel life'
      }
    ]);

    // Mock room inspections
    setRoomInspections([
      {
        id: '1',
        room: '101',
        floor: 1,
        status: 'scheduled',
        scheduledDate: '2024-02-25',
        lastInspection: '2024-01-15',
        notes: 'Routine monthly inspection'
      },
      {
        id: '2',
        room: '205',
        floor: 2,
        status: 'completed',
        scheduledDate: '2024-02-20',
        lastInspection: '2024-02-20',
        notes: 'Room in good condition'
      }
    ]);

    // Mock emergency contacts
    setEmergencyContacts([
      {
        id: '1',
        name: 'Dr. Emily Brown',
        role: 'Medical Officer',
        phone: '+1-555-0101',
        email: 'medical@hostelhaven.com',
        availability: '24/7'
      },
      {
        id: '2',
        name: 'Security Team',
        role: 'Security',
        phone: '+1-555-0102',
        email: 'security@hostelhaven.com',
        availability: '24/7'
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
    { id: 'disciplinary', label: 'Disciplinary Cases', icon: AlertCircle },
    { id: 'welfare', label: 'Student Welfare', icon: Heart },
    { id: 'inspections', label: 'Room Inspections', icon: Building2 },
    { id: 'emergency', label: 'Emergency Contacts', icon: Phone }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Active Cases</h3>
          <p className="text-2xl font-bold text-slate-900">3</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Welfare Cases</h3>
          <p className="text-2xl font-bold text-slate-900">5</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Inspections</h3>
          <p className="text-2xl font-bold text-slate-900">12</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Emergency Calls</h3>
          <p className="text-2xl font-bold text-slate-900">2</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">New disciplinary case reported</p>
              <p className="text-sm text-slate-600">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">Student welfare check completed</p>
              <p className="text-sm text-slate-600">1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">Room inspection scheduled</p>
              <p className="text-sm text-slate-600">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisciplinaryCases = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Disciplinary Cases</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Case</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {disciplinaryCases.map((case_) => (
          <div key={case_.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{case_.studentName}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    case_.severity === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : case_.severity === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {case_.severity}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    case_.status === 'active' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {case_.status}
                  </span>
                </div>
                <p className="text-slate-600 mb-3">{case_.description}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Room: {case_.room}</span>
                  <span>Reported: {case_.reportedDate}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Update</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWelfare = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Student Welfare</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Case</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {studentWelfare.map((welfare) => (
          <div key={welfare.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{welfare.studentName}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    welfare.status === 'monitoring' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {welfare.status}
                  </span>
                </div>
                <p className="text-slate-600 mb-3">{welfare.concern}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Room: {welfare.room}</span>
                  <span>Last Check: {welfare.lastCheck}</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">{welfare.notes}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Update</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInspections = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Room Inspections</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Schedule Inspection</span>
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Scheduled Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Inspection</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roomInspections.map((inspection) => (
                <tr key={inspection.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{inspection.room}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{inspection.floor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inspection.status === 'scheduled' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {inspection.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{inspection.scheduledDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{inspection.lastInspection}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-amber-600 hover:text-amber-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
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

  const renderEmergencyContacts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Emergency Contacts</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {emergencyContacts.map((contact) => (
          <div key={contact.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{contact.name}</h3>
                <p className="text-slate-600">{contact.role}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {contact.availability}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <p className="text-slate-800">{contact.phone}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <p className="text-slate-800">{contact.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-200">
              <button className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
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
      case 'disciplinary':
        return renderDisciplinaryCases();
      case 'welfare':
        return renderWelfare();
      case 'inspections':
        return renderInspections();
      case 'emergency':
        return renderEmergencyContacts();
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
                  <p className="text-slate-500">Warden</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Warden Dashboard</h1>
                <p className="text-slate-600">Oversee hostel discipline and welfare</p>
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

export default WardenDashboard; 