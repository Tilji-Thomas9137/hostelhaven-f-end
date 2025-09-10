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
  Wrench,
  Bed,
  UserCheck,
  FileText,
  Eye,
  Edit,
  Plus,
  Search,
  Download,
  Activity,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';

const OperationsDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  // Ops data
  const [opsStats, setOpsStats] = useState({ maintenanceRequests: 0, pendingAssignments: 0, todayCheckIns: 0, availableRooms: 0 });
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [maintStatusFilter, setMaintStatusFilter] = useState('');
  const [maintPriorityFilter, setMaintPriorityFilter] = useState('');
  const [maintSearch, setMaintSearch] = useState('');
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [assignSelections, setAssignSelections] = useState({}); // studentId -> roomId
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [roomsOverview, setRoomsOverview] = useState({ rooms: [], stats: null });
  const [isBusy, setIsBusy] = useState(false);

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
          
          if (!['hostel_operations_assistant', 'admin', 'warden'].includes(result.data.user.role)) {
            setUser({...result.data.user, isNotOperations: true});
          }
          // Preload ops data for authorized roles
          if (['hostel_operations_assistant', 'admin', 'warden'].includes(result.data.user.role)) {
            fetchOpsStats();
            fetchMaintenanceRequests();
            fetchRoomAssignmentsData();
            fetchRecentCheckIns();
            fetchRoomsOverview();
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
      navigate('/');
    }
  };

  const fetchOpsStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('http://localhost:3002/api/operations/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      if (res.ok) {
        const result = await res.json();
        setOpsStats(result.data || {});
      }
    } catch (e) {
      console.error('Error fetching ops stats:', e);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (maintStatusFilter) params.set('status', maintStatusFilter);
      if (maintPriorityFilter) params.set('priority', maintPriorityFilter);
      const res = await fetch(`http://localhost:3002/api/operations/maintenance-requests?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      if (res.ok) {
        const result = await res.json();
        setMaintenanceRequests(result.data.maintenanceRequests || []);
      }
    } catch (e) {
      console.error('Error fetching maintenance requests:', e);
    }
  };

  const updateMaintenanceRequest = async (id, updates) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const body = { ...updates };
      const res = await fetch(`http://localhost:3002/api/operations/maintenance-requests/${id}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        fetchMaintenanceRequests();
        alert('Request updated');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update request');
      }
    } catch (e) {
      console.error('Error updating maintenance request:', e);
    }
  };

  const fetchRoomAssignmentsData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('http://localhost:3002/api/operations/room-assignments', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      if (res.ok) {
        const result = await res.json();
        setUnassignedStudents(result.data.unassignedStudents || []);
        setAvailableRooms(result.data.availableRooms || []);
      }
    } catch (e) {
      console.error('Error fetching room assignments data:', e);
    }
  };

  const assignStudentToRoom = async (studentId) => {
    const roomId = assignSelections[studentId];
    if (!roomId) {
      alert('Select a room first');
      return;
    }
    setIsBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('http://localhost:3002/api/operations/room-assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId, room_id: roomId })
      });
      if (res.ok) {
        fetchRoomAssignmentsData();
        fetchOpsStats();
        alert('Student assigned to room');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to assign');
      }
    } catch (e) {
      console.error('Error assigning student:', e);
    } finally {
      setIsBusy(false);
    }
  };

  const fetchRecentCheckIns = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('http://localhost:3002/api/operations/recent-checkins?days=7&limit=20', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      if (res.ok) {
        const result = await res.json();
        setRecentCheckIns(result.data.recentCheckIns || []);
      }
    } catch (e) {
      console.error('Error fetching check-ins:', e);
    }
  };

  const fetchRoomsOverview = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('http://localhost:3002/api/operations/rooms-overview', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      if (res.ok) {
        const result = await res.json();
        setRoomsOverview({ rooms: result.data.rooms || [], stats: result.data.stats || null });
      }
    } catch (e) {
      console.error('Error fetching rooms overview:', e);
    }
  };

  // React to maintenance filters
  useEffect(() => {
    fetchMaintenanceRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintStatusFilter, maintPriorityFilter]);

  if (isLoading) {
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

  if (user.isNotOperations || !['hostel_operations_assistant', 'admin', 'warden'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">
            You need operations privileges to access this dashboard.
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
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'assignments', label: 'Room Assignments', icon: Bed },
    { id: 'checkins', label: 'Check-ins', icon: UserCheck },
    { id: 'rooms', label: 'Rooms Overview', icon: Building2 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Total Rooms</h3>
              <p className="text-2xl font-bold text-slate-900">{roomsOverview.stats?.totalRooms || 0}</p>
              <p className="text-sm text-slate-600">Available: {opsStats.availableRooms || roomsOverview.stats?.availableRooms || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Occupied Rooms</h3>
              <p className="text-2xl font-bold text-slate-900">{roomsOverview.stats?.occupiedRooms || 0}</p>
              <p className="text-sm text-slate-600">Current occupancy (today check-ins: {opsStats.todayCheckIns || 0})</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Maintenance</h3>
              <p className="text-2xl font-bold text-slate-900">{opsStats.maintenanceRequests || 0}</p>
              <p className="text-sm text-slate-600">Active requests</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Recent Check-ins</h3>
              <p className="text-2xl font-bold text-slate-900">{opsStats.todayCheckIns || 0}</p>
              <p className="text-sm text-slate-600">Last 24 hours</p>
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
          <p className="text-sm text-slate-400 mt-1">Recent operations activities will appear here</p>
        </div>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Maintenance Requests</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or student..."
              value={maintSearch}
              onChange={(e) => setMaintSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <select
            value={maintPriorityFilter}
            onChange={(e) => setMaintPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={maintStatusFilter}
            onChange={(e) => setMaintStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {maintenanceRequests
                .filter(r => {
                  const q = maintSearch.trim().toLowerCase();
                  if (!q) return true;
                  const student = r.users?.full_name?.toLowerCase() || '';
                  return r.title.toLowerCase().includes(q) || student.includes(q);
                })
                .map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{req.title}</div>
                    <div className="text-sm text-slate-500 truncate max-w-xs">{req.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{req.users?.full_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{req.users?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{req.rooms?.room_number || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      req.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      req.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      req.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      req.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      req.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => updateMaintenanceRequest(req.id, { assigned_to: user.id, status: 'in_progress' })}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {req.status !== 'resolved' && (
                        <button
                          onClick={() => updateMaintenanceRequest(req.id, { status: 'resolved' })}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-amber-600 hover:text-amber-700">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {maintenanceRequests.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No maintenance requests</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRoomAssignments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Room Assignments</h2>
        <div className="text-sm text-slate-600">Available rooms: {availableRooms.length}</div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hostel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assign to Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {unassignedStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.full_name || s.fullName}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{s.hostels?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <select
                      value={assignSelections[s.id] || ''}
                      onChange={(e) => setAssignSelections(prev => ({ ...prev, [s.id]: e.target.value }))}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="">Select a room</option>
                      {availableRooms.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.room_number} • {r.occupied}/{r.capacity}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => assignStudentToRoom(s.id)}
                      disabled={isBusy || !assignSelections[s.id]}
                      className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
              {unassignedStudents.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No unassigned students</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCheckIns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Recent Check-ins</h2>
        <div className="text-sm text-slate-600">Last 7 days</div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hostel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentCheckIns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.full_name || c.fullName || 'Student'}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{c.hostels?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{c.rooms?.room_number || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{new Date(c.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {recentCheckIns.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No recent check-ins</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const [roomsSearch, setRoomsSearch] = useState('');
  const renderRoomsOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Rooms Overview</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={roomsSearch}
              onChange={(e) => setRoomsSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Occupied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roomsOverview.rooms
                .filter(r => {
                  const q = roomsSearch.trim().toLowerCase();
                  if (!q) return true;
                  return String(r.room_number).toLowerCase().includes(q) || String(r.floor).toLowerCase().includes(q);
                })
                .map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{r.room_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{r.floor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{r.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{r.occupied}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'available' ? 'bg-green-100 text-green-800' :
                      r.status === 'occupied' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {roomsOverview.rooms.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No rooms data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Occupancy Report</h3>
              <p className="text-sm text-slate-600">Room utilization analysis</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
            Generate Report
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Maintenance Report</h3>
              <p className="text-sm text-slate-600">Request tracking & resolution</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
            Generate Report
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Student Report</h3>
              <p className="text-sm text-slate-600">Check-in/out statistics</p>
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
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Operations Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800">General Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Auto Room Assignment</span>
                <button className="w-12 h-6 bg-amber-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Maintenance Alerts</span>
                <button className="w-12 h-6 bg-amber-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Check-in Notifications</span>
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
                <span className="text-slate-700">Approval Required</span>
                <button className="w-12 h-6 bg-amber-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Auto Escalation</span>
                <button className="w-12 h-6 bg-slate-300 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Work Order System</span>
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
      case 'maintenance':
        return renderMaintenance();
      case 'assignments':
        return renderRoomAssignments();
      case 'checkins':
        return renderCheckIns();
      case 'rooms':
        return renderRoomsOverview();
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">HostelHaven</span>
              <div className="text-xs text-slate-500">Operations Portal</div>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-amber-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{user.fullName}</p>
              <p className="text-sm text-slate-500">Operations Assistant</p>
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
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Operations Dashboard'}
              </h1>
              <p className="text-slate-600">Manage hostel operations and maintenance</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OperationsDashboard;
