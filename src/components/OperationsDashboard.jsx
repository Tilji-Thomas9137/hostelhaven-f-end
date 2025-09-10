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
  GraduationCap,
  Wrench,
  Package,
  Clipboard,
  CheckSquare,
  UserCheck,
  Bed
} from 'lucide-react';

const OperationsDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({});
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [roomAssignments, setRoomAssignments] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [roomsOverview, setRoomsOverview] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 
 useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          navigate('/login');
          return;
        }

        // Fetch user profile
        const response = await fetch('http://localhost:3002/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setUser(result.data.user);
          
          // Check if user has operations access
          if (!['hostel_operations_assistant', 'admin', 'warden'].includes(result.data.user.role)) {
            navigate('/dashboard');
            return;
          }
          
          // Fetch operations data
          fetchDashboardStats();
          fetchMaintenanceRequests();
          fetchRoomAssignments();
          fetchRecentCheckIns();
          fetchRoomsOverview();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);  const
 fetchDashboardStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/operations/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setDashboardStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/operations/maintenance-requests?limit=20', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setMaintenanceRequests(result.data.maintenanceRequests);
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };  const
 fetchRoomAssignments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/operations/room-assignments?limit=20', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRoomAssignments(result.data.unassignedStudents);
        setAvailableRooms(result.data.availableRooms);
      }
    } catch (error) {
      console.error('Error fetching room assignments:', error);
    }
  };

  const fetchRecentCheckIns = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/operations/recent-checkins?days=7&limit=20', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRecentCheckIns(result.data.recentCheckIns);
      }
    } catch (error) {
      console.error('Error fetching recent check-ins:', error);
    }
  };  
const fetchRoomsOverview = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/operations/rooms-overview', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRoomsOverview(result.data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms overview:', error);
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
      setUser(null);
      navigate('/');
    }
  };  c
onst handleAssignRoom = async (studentId, roomId) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/operations/room-assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          room_id: roomId
        })
      });

      if (response.ok) {
        setShowAssignmentModal(false);
        setSelectedStudent(null);
        fetchRoomAssignments(); // Refresh assignments
        fetchDashboardStats(); // Refresh stats
        fetchRoomsOverview(); // Refresh rooms
        alert('Student assigned to room successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to assign room');
      }
    } catch (error) {
      console.error('Error assigning room:', error);
      alert('Failed to assign room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMaintenanceStatus = async (requestId, status) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/operations/maintenance-requests/${requestId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchMaintenanceRequests(); // Refresh maintenance requests
        fetchDashboardStats(); // Refresh stats
        alert('Maintenance request updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update maintenance request');
      }
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      alert('Failed to update maintenance request');
    }
  };  if (i
sLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading operations dashboard...</p>
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
    { id: 'assignments', label: 'Room Assignments', icon: UserCheck },
    { id: 'checkins', label: 'Check-ins', icon: CheckSquare },
    { id: 'rooms', label: 'Rooms Overview', icon: Bed }
  ]; 
 const renderOverview = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Maintenance Requests</h3>
              <p className="text-2xl font-bold text-slate-900">{dashboardStats.maintenanceRequests || 0}</p>
              <p className="text-sm text-slate-600">Pending & In Progress</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Pending Assignments</h3>
              <p className="text-2xl font-bold text-slate-900">{dashboardStats.pendingAssignments || 0}</p>
              <p className="text-sm text-slate-600">Students without rooms</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Today's Check-ins</h3>
              <p className="text-2xl font-bold text-slate-900">{dashboardStats.todayCheckIns || 0}</p>
              <p className="text-sm text-slate-600">New registrations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Available Rooms</h3>
              <p className="text-2xl font-bold text-slate-900">{dashboardStats.availableRooms || 0}</p>
              <p className="text-sm text-slate-600">Ready for assignment</p>
            </div>
          </div>
        </div>
      </div>      
{/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Recent Activity</h2>
          <div className="text-sm text-slate-500">Last 24 hours</div>
        </div>
        
        <div className="space-y-4">
          {/* Recent Maintenance Requests */}
          {maintenanceRequests.slice(0, 3).map((request) => (
            <div key={request.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                request.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                request.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                'bg-yellow-100 text-yellow-600'
              }`}>
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{request.title}</p>
                <p className="text-sm text-slate-600">
                  Room {request.rooms?.room_number} • {request.priority} priority
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                request.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {request.status.replace('_', ' ')}
              </div>
            </div>
          ))}
          
          {/* Recent Check-ins */}
          {recentCheckIns.slice(0, 2).map((checkIn) => (
            <div key={checkIn.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">New student check-in</p>
                <p className="text-sm text-slate-600">
                  {checkIn.full_name} • Room {checkIn.rooms?.room_number || 'Pending'}
                </p>
              </div>
              <div className="text-xs text-slate-500">
                {new Date(checkIn.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {/* Show message if no recent activity */}
          {maintenanceRequests.length === 0 && recentCheckIns.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No recent activity</p>
              <p className="text-sm text-slate-400 mt-1">Recent operations activities will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );  const
 renderMaintenance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Maintenance Requests</h2>
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {maintenanceRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{request.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.priority}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                    request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-600 mb-3">{request.description}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Room: {request.rooms?.room_number || 'N/A'}</span>
                  <span>By: {request.users?.full_name}</span>
                  <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {request.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateMaintenanceStatus(request.id, 'in_progress')}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Start Work
                  </button>
                )}
                {request.status === 'in_progress' && (
                  <button 
                    onClick={() => handleUpdateMaintenanceStatus(request.id, 'resolved')}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Mark Resolved
                  </button>
                )}
                <button className="flex items-center space-x-1 px-3 py-1 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">View</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {maintenanceRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No maintenance requests</p>
            <p className="text-sm text-slate-400 mt-1">All maintenance issues are resolved</p>
          </div>
        )}
      </div>
    </div>
  );  co
nst renderAssignments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Room Assignments</h2>
        <div className="text-sm text-slate-500">
          {roomAssignments.length} students waiting for room assignment
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roomAssignments.map((student) => (
          <div key={student.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{student.full_name}</h3>
                    <p className="text-sm text-slate-600">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                  <span>Phone: {student.phone || 'N/A'}</span>
                  <span>Registered: {new Date(student.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Awaiting Assignment
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedStudent(student);
                  setShowAssignmentModal(true);
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
              >
                Assign Room
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {roomAssignments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">All students have been assigned rooms</p>
          <p className="text-sm text-slate-400 mt-1">New students will appear here for room assignment</p>
        </div>
      )}
    </div>
  ); 
 const renderCheckIns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Recent Check-ins</h2>
        <div className="text-sm text-slate-500">Last 7 days</div>
      </div>
      
      <div className="space-y-4">
        {recentCheckIns.map((checkIn) => (
          <div key={checkIn.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{checkIn.full_name}</h3>
                    <p className="text-sm text-slate-600">{checkIn.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                  <span>Room: {checkIn.rooms?.room_number || 'Not Assigned'}</span>
                  <span>Phone: {checkIn.phone || 'N/A'}</span>
                </div>
                <div className="text-sm text-slate-500">
                  Check-in: {new Date(checkIn.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  checkIn.room_id ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {checkIn.room_id ? 'Room Assigned' : 'Pending Assignment'}
                </span>
                <button className="flex items-center space-x-1 px-3 py-1 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">View</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {recentCheckIns.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No recent check-ins</p>
          <p className="text-sm text-slate-400 mt-1">New student registrations will appear here</p>
        </div>
      )}
    </div>
  );  cons
t renderRooms = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Rooms Overview</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Occupancy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Residents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roomsOverview.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <Bed className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{room.room_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{room.floor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{room.room_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {room.occupied || 0}/{room.capacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      room.status === 'available' ? 'bg-green-100 text-green-800' : 
                      room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {room.users && room.users.length > 0 ? (
                      <div className="space-y-1">
                        {room.users.map((resident, index) => (
                          <div key={index} className="text-xs text-slate-600">
                            {resident.full_name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">Empty</span>
                    )}
                  </td>
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