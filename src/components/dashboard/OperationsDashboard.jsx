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
  Shield,
  Eye,
  Trash2,
  Heart,
  Activity,
  Award,
  BookOpen,
  GraduationCap,
  Wrench,
  Package,
  Clipboard,
  CheckSquare
} from 'lucide-react';
import Logo from '../Logo';

const OperationsDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [roomAssignments, setRoomAssignments] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [inventory, setInventory] = useState([]);

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
    // Mock maintenance requests
    setMaintenanceRequests([
      {
        id: '1',
        room: '101',
        issue: 'Heating not working',
        priority: 'high',
        status: 'pending',
        reportedDate: '2024-02-20',
        assignedTo: 'John Tech',
        description: 'Room temperature is too low'
      },
      {
        id: '2',
        room: '205',
        issue: 'WiFi connectivity',
        priority: 'medium',
        status: 'in_progress',
        reportedDate: '2024-02-18',
        assignedTo: 'Mike IT',
        description: 'Slow internet connection'
      }
    ]);

    // Mock room assignments
    setRoomAssignments([
      {
        id: '1',
        studentName: 'Alex Johnson',
        room: '102',
        status: 'pending',
        requestedDate: '2024-02-15',
        assignedDate: null,
        notes: 'New student registration'
      },
      {
        id: '2',
        studentName: 'Sarah Wilson',
        room: '203',
        status: 'assigned',
        requestedDate: '2024-02-10',
        assignedDate: '2024-02-12',
        notes: 'Room change request'
      }
    ]);

    // Mock check-ins
    setCheckIns([
      {
        id: '1',
        studentName: 'Mike Brown',
        room: '104',
        checkInTime: '2024-02-20 14:30',
        status: 'completed',
        notes: 'All documents verified'
      },
      {
        id: '2',
        studentName: 'Emma Davis',
        room: '206',
        checkInTime: '2024-02-20 16:45',
        status: 'pending',
        notes: 'Waiting for payment confirmation'
      }
    ]);

    // Mock inventory
    setInventory([
      {
        id: '1',
        item: 'Towels',
        quantity: 50,
        minQuantity: 100,
        status: 'low_stock',
        lastUpdated: '2024-02-19'
      },
      {
        id: '2',
        item: 'Bed Sheets',
        quantity: 200,
        minQuantity: 150,
        status: 'adequate',
        lastUpdated: '2024-02-18'
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
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'assignments', label: 'Room Assignments', icon: Building2 },
    { id: 'checkins', label: 'Check-ins', icon: CheckSquare },
    { id: 'inventory', label: 'Inventory', icon: Package }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Maintenance Requests</h3>
          <p className="text-2xl font-bold text-slate-900">8</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Room Assignments</h3>
          <p className="text-2xl font-bold text-slate-900">15</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Check-ins Today</h3>
          <p className="text-2xl font-bold text-slate-900">45</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Low Stock Items</h3>
          <p className="text-2xl font-bold text-slate-900">3</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">New maintenance request</p>
              <p className="text-sm text-slate-600">Room 101 - Heating issue</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">Student check-in completed</p>
              <p className="text-sm text-slate-600">Mike Brown - Room 104</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">Room assignment processed</p>
              <p className="text-sm text-slate-600">Sarah Wilson - Room 203</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Maintenance Requests</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {maintenanceRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">Room {request.room}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : request.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {request.priority}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : request.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <p className="text-slate-600 mb-3">{request.description}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Reported: {request.reportedDate}</span>
                  <span>Assigned to: {request.assignedTo}</span>
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

  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Room Assignments</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roomAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{assignment.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{assignment.room}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assignment.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{assignment.requestedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{assignment.assignedDate || '-'}</td>
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

  const renderCheckIns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Student Check-ins</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Check-in</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {checkIns.map((checkIn) => (
          <div key={checkIn.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{checkIn.studentName}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    checkIn.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {checkIn.status}
                  </span>
                </div>
                <p className="text-slate-600 mb-3">{checkIn.notes}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Room: {checkIn.room}</span>
                  <span>Time: {checkIn.checkInTime}</span>
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

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Inventory Management</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Min Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.minQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'low_stock' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status === 'low_stock' ? 'Low Stock' : 'Adequate'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.lastUpdated}</td>
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'maintenance':
        return renderMaintenance();
      case 'assignments':
        return renderAssignments();
      case 'checkins':
        return renderCheckIns();
      case 'inventory':
        return renderInventory();
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
                  <p className="text-slate-500">Operations Assistant</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Operations Dashboard</h1>
                <p className="text-slate-600">Manage daily hostel operations</p>
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

export default OperationsDashboard; 