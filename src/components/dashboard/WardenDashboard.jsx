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
  Shield,
  Gavel,
  Heart,
  UserCheck,
  AlertTriangle,
  FileText,
  Eye,
  Edit,
  Plus,
  Trash2,
  Activity,
  CheckCircle,
  RefreshCw,
  X
} from 'lucide-react';
import ChatWidget from '../ui/ChatWidget';

const WardenDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
          
          if (!['warden', 'admin'].includes(result.data.user.role)) {
            setUser({...result.data.user, isNotWarden: true});
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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
      // Use setTimeout to avoid setState during render warning
      setTimeout(() => {
        navigate('/login');
      }, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
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

  if (user.isNotWarden || !['warden', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 border border-purple-100">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-4 text-lg">
            You need warden privileges to access this dashboard.
          </p>
          <p className="text-sm text-gray-500 mb-8 font-semibold">
            Current role: <span className="text-red-600 font-bold">{user.role || 'student'}</span>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'room-requests', label: 'Room Requests', icon: Building2 },
    { id: 'disciplinary', label: 'Disciplinary', icon: Gavel },
    { id: 'welfare', label: 'Student Welfare', icon: Heart },
    { id: 'inspections', label: 'Room Inspections', icon: UserCheck },
    { id: 'emergency', label: 'Emergency Contacts', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Total Students</h3>
              <p className="text-2xl font-bold text-slate-900">120</p>
              <p className="text-sm text-slate-600">Under supervision</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Active Cases</h3>
              <p className="text-2xl font-bold text-slate-900">3</p>
              <p className="text-sm text-slate-600">Requiring attention</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Pending Inspections</h3>
              <p className="text-2xl font-bold text-slate-900">5</p>
              <p className="text-sm text-slate-600">Scheduled this week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Resolved Issues</h3>
              <p className="text-2xl font-bold text-slate-900">15</p>
              <p className="text-sm text-slate-600">This month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Recent Activity</h2>
          <div className="text-sm text-slate-500">Last 24 hours</div>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No recent activity</p>
          <p className="text-sm text-slate-400 mt-1">Recent warden activities will appear here</p>
        </div>
      </div>
    </div>
  );

  const renderDisciplinary = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Disciplinary Cases</h2>
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            <option value="">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Case</span>
          </button>
        </div>
      </div>
      
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gavel className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">No disciplinary cases</p>
        <p className="text-sm text-slate-400 mt-1">Disciplinary cases will appear here</p>
      </div>
    </div>
  );

  const renderStudentWelfare = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Student Welfare Cases</h2>
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Case</span>
          </button>
        </div>
      </div>
      
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">No welfare cases</p>
        <p className="text-sm text-slate-400 mt-1">Student welfare cases will appear here</p>
      </div>
    </div>
  );

  const renderRoomInspections = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Room Inspections</h2>
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Schedule Inspection</span>
          </button>
        </div>
      </div>
      
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">No room inspections</p>
        <p className="text-sm text-slate-400 mt-1">Room inspection records will appear here</p>
      </div>
    </div>
  );

  const renderEmergencyContacts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Emergency Contacts</h2>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>
      
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">No emergency contacts</p>
        <p className="text-sm text-slate-400 mt-1">Emergency contact information will appear here</p>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Disciplinary Report</h3>
              <p className="text-sm text-slate-600">Case analysis & trends</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
            Generate Report
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Inspection Report</h3>
              <p className="text-sm text-slate-600">Room compliance status</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
            Generate Report
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Welfare Report</h3>
              <p className="text-sm text-slate-600">Student support tracking</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Warden Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800">General Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Auto Notifications</span>
                <button className="w-12 h-6 bg-amber-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Emergency Alerts</span>
                <button className="w-12 h-6 bg-amber-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Inspection Reminders</span>
                <button className="w-12 h-6 bg-amber-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800">Workflow Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Case Escalation</span>
                <button className="w-12 h-6 bg-amber-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Auto Follow-up</span>
                <button className="w-12 h-6 bg-slate-300 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Parent Notifications</span>
                <button className="text-amber-600 hover:text-amber-700">Configure</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoomRequests = () => {
    const [roomRequests, setRoomRequests] = useState([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
      fetchRoomRequests();
      fetchRooms();
    }, []);

    const fetchRoomRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const response = await fetch(`${API_BASE_URL}/api/room-requests/pending`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setRoomRequests(result.data?.requests || []);
        }
      } catch (error) {
        console.error('Error fetching room requests:', error);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    const fetchRooms = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const response = await fetch(`${API_BASE_URL}/api/room-allocation/rooms`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setRooms(result.data?.rooms || []);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    const handleApproveRequest = async (requestId) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const response = await fetch(`${API_BASE_URL}/api/room-requests/${requestId}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          fetchRoomRequests(); // Refresh the list
        }
      } catch (error) {
        console.error('Error approving request:', error);
      }
    };

    const handleRejectRequest = async (requestId) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const response = await fetch(`${API_BASE_URL}/api/room-requests/${requestId}/reject`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          fetchRoomRequests(); // Refresh the list
        }
      } catch (error) {
        console.error('Error rejecting request:', error);
      }
    };

    const getRequestedRoomNumber = (request) => {
      if (request.special_requirements) {
        const match = request.special_requirements.match(/REQUESTED_ROOM_ID:([a-f0-9-]+)/i);
        if (match) {
          const requestedRoomId = match[1];
          const requestedRoom = rooms.find(room => room.id.toString() === requestedRoomId);
          return requestedRoom ? requestedRoom.room_number : 'Unknown';
        }
      }
      return 'Not Specified';
    };

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Pending Room Requests</h2>
            <button 
              onClick={fetchRoomRequests}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          
          {isLoadingRequests ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading room requests...</p>
            </div>
          ) : roomRequests.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">No Pending Requests</h3>
              <p className="text-slate-600">All room requests have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {roomRequests.map((request) => (
                <div key={request.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {request.student?.full_name || 'Unknown Student'}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-600">Student ID:</p>
                          <p className="font-medium text-slate-800">{request.student?.admission_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Email:</p>
                          <p className="font-medium text-slate-800">{request.student?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Requested Room:</p>
                          <p className="font-medium text-blue-600">{getRequestedRoomNumber(request)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Preferred Type:</p>
                          <p className="font-medium text-slate-800 capitalize">{request.preferred_room_type || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Preferred Floor:</p>
                          <p className="font-medium text-slate-800">{request.preferred_floor || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Request Date:</p>
                          <p className="font-medium text-slate-800">
                            {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {request.special_requirements && (
                        <div className="mt-3">
                          <p className="text-sm text-slate-600">Special Requirements:</p>
                          <p className="text-sm text-slate-800">{request.special_requirements}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'room-requests':
        return renderRoomRequests();
      case 'disciplinary':
        return renderDisciplinary();
      case 'welfare':
        return renderStudentWelfare();
      case 'inspections':
        return renderRoomInspections();
      case 'emergency':
        return renderEmergencyContacts();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gradient-to-b from-white to-purple-50 shadow-2xl border-r border-purple-200 fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-purple-200">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">HostelHaven</span>
              <div className="text-xs text-purple-600 font-semibold">Warden Portal</div>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
              <div className="relative w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 truncate">{user.fullName}</p>
              <p className="text-sm text-purple-600 font-semibold">Warden</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl animate-slideInRight'
                    : 'text-slate-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
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
        {/* Top Header */}
        <header className="bg-gradient-to-r from-white via-purple-50 to-indigo-50 shadow-lg p-6 border-b-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Warden Dashboard'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {user.fullName || 'Warden'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-bold text-gray-900">{user.fullName || 'Warden'}</p>
                <p className="text-sm text-gray-500 font-semibold">Warden Account</p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="max-w-6xl mx-auto relative">
            {renderContent()}
            <ChatWidget currentUser={user} channels={[{ id: 'ops-warden', label: 'Operations' }, { id: 'warden-admin', label: 'Admin' }]} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default WardenDashboard;
