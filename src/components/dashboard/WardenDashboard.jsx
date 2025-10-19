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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading warden dashboard...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">
            You need warden privileges to access this dashboard.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Current role: <span className="font-medium">{user.role || 'student'}</span>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-xl border-r border-amber-200/50 fixed h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-amber-200/50">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">HostelHaven</span>
              <div className="text-xs text-slate-500">Warden Portal</div>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-amber-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{user.fullName}</p>
              <p className="text-sm text-slate-500">Warden</p>
              <p className="text-xs text-slate-400">{user.email}</p>
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
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
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
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Warden Dashboard'}
              </h1>
              <p className="text-slate-600">Manage student welfare and discipline</p>
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
