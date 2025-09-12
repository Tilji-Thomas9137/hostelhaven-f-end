import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
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
  const { showNotification } = useNotification();
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

  const [shouldRedirect, setShouldRedirect] = useState({ redirect: false, to: null });
  const [roomsSearch, setRoomsSearch] = useState('');

  // Rooms Dashboard states
  const [roomsData, setRoomsData] = useState([]);
  const [roomRequests, setRoomRequests] = useState([]);
  const [roomAllocations, setRoomAllocations] = useState([]);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    room_number: '',
    floor: '',
    room_type: 'standard',
    capacity: '',
    price: '',
    amenities: []
  });
  const [roomFormErrors, setRoomFormErrors] = useState({});
  const [roomFilters, setRoomFilters] = useState({
    status: '',
    room_type: '',
    floor: ''
  });
  const [requestFilters, setRequestFilters] = useState({
    status: '',
    room_type: ''
  });

  useEffect(() => {
    if (shouldRedirect.redirect && shouldRedirect.to) {
      navigate(shouldRedirect.to);
    }
  }, [shouldRedirect, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching user session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setShouldRedirect({ redirect: true, to: '/login' });
          return;
        }

        if (!session) {
          console.log('No session found, redirecting to login');
          setShouldRedirect({ redirect: true, to: '/login' });
          return;
        }

        console.log('Session found, fetching user data...');
        
        // Try to get user data from Supabase directly first
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Failed to get user data from Supabase:', userError);
          setShouldRedirect({ redirect: true, to: '/login' });
          return;
        }

        if (!userData?.user) {
          console.error('No user data found');
          setShouldRedirect({ redirect: true, to: '/login' });
          return;
        }

        // Get additional user data from our backend
        let userResult;
        try {
          const response = await fetch('http://localhost:3002/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.warn('Backend API failed, using Supabase user data...');
            userResult = {
              data: {
                user: {
                  ...userData.user,
                  role: userData.user.user_metadata?.role || 'student'
                }
              }
            };
          } else {
            userResult = await response.json();
          }
        } catch (error) {
          console.warn('Backend API failed, using Supabase user data...');
          userResult = {
            data: {
              user: {
                ...userData.user,
                role: userData.user.user_metadata?.role || 'student'
              }
            }
          };
        }

        if (!['hostel_operations_assistant', 'admin', 'warden'].includes(userResult?.data?.user?.role)) {
          console.log('User does not have operations access');
          setShouldRedirect({ redirect: true, to: '/dashboard' });
          return;
        }

        setUser(userResult.data.user);
        console.log('Loading operations data...');
        // Preload ops data
        await Promise.all([
          fetchOpsStats(),
          fetchMaintenanceRequests(),
          fetchRoomAssignmentsData(),
          fetchRecentCheckIns(),
          fetchRoomsOverview(),
          fetchRoomsDashboardData()
        ]);
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
        showNotification('Student assigned to room successfully!', 'success');
      } else {
        const err = await res.json();
        showNotification(err.message || 'Failed to assign student', 'error');
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

  const fetchRoomsDashboardData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Fetch rooms data
      const roomsRes = await fetch('http://localhost:3002/api/room-allocation/rooms', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      
      // Fetch room requests
      const requestsRes = await fetch('http://localhost:3002/api/room-allocation/requests', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      
      // Fetch room allocations
      const allocationsRes = await fetch('http://localhost:3002/api/room-allocations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      if (roomsRes.ok) {
        const roomsResult = await roomsRes.json();
        setRoomsData(roomsResult.data.rooms || []);
      }

      if (requestsRes.ok) {
        const requestsResult = await requestsRes.json();
        setRoomRequests(requestsResult.data.requests || []);
      }

      if (allocationsRes.ok) {
        const allocationsResult = await allocationsRes.json();
        setRoomAllocations(allocationsResult.data || []);
      }
    } catch (e) {
      console.error('Error fetching rooms dashboard data:', e);
    }
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!roomFormData.room_number.trim()) errors.room_number = 'Room number is required';
    if (!roomFormData.capacity || roomFormData.capacity < 1) errors.capacity = 'Capacity must be at least 1';
    if (roomFormData.price && roomFormData.price < 0) errors.price = 'Price must be positive';
    
    setRoomFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmittingRoom(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocation/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_number: roomFormData.room_number,
          floor: roomFormData.floor || null,
          room_type: roomFormData.room_type,
          capacity: parseInt(roomFormData.capacity),
          price: roomFormData.price ? parseFloat(roomFormData.price) : null,
          amenities: roomFormData.amenities
        })
      });

      if (response.ok) {
        setShowAddRoomModal(false);
        setRoomFormData({
          room_number: '',
          floor: '',
          room_type: 'standard',
          capacity: '',
          price: '',
          amenities: []
        });
        setRoomFormErrors({});
        await fetchRoomsDashboardData();
        alert('Room added successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add room');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const handleRoomFormChange = (e) => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (roomFormErrors[name]) {
      setRoomFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setRoomFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
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
    { id: 'rooms-dashboard', label: 'Rooms & Allocations', icon: Building2 },
    { id: 'checkins', label: 'Check-ins', icon: UserCheck },
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

  const renderRoomsDashboard = () => (
    <div className="space-y-8">
      {/* Header with Add Room Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rooms & Allocations Dashboard</h2>
          <p className="text-slate-600">Manage rooms, requests, and allocations</p>
        </div>
        <button
          onClick={() => setShowAddRoomModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Total Rooms</h3>
              <p className="text-2xl font-bold text-slate-900">{roomsData.length}</p>
              <p className="text-sm text-slate-600">Available: {roomsData.filter(r => r.is_available).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Pending Requests</h3>
              <p className="text-2xl font-bold text-slate-900">{roomRequests.filter(r => r.status === 'pending').length}</p>
              <p className="text-sm text-slate-600">Awaiting allocation</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Allocated</h3>
              <p className="text-2xl font-bold text-slate-900">{roomAllocations.length}</p>
              <p className="text-sm text-slate-600">Active allocations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Occupancy Rate</h3>
              <p className="text-2xl font-bold text-slate-900">
                {roomsData.length > 0 ? Math.round((roomsData.reduce((sum, r) => sum + (r.occupied || 0), 0) / roomsData.reduce((sum, r) => sum + r.capacity, 0)) * 100) : 0}%
              </p>
              <p className="text-sm text-slate-600">Current utilization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">Rooms Management</h3>
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
            <select
              value={roomFilters.status}
              onChange={(e) => setRoomFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={roomFilters.room_type}
              onChange={(e) => setRoomFilters(prev => ({ ...prev, room_type: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">All Types</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="premium">Premium</option>
              <option value="suite">Suite</option>
            </select>
        </div>
      </div>
      
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Occupied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roomsData
                .filter(room => {
                  const matchesSearch = !roomsSearch || 
                    String(room.room_number).toLowerCase().includes(roomsSearch.toLowerCase()) ||
                    String(room.floor).toLowerCase().includes(roomsSearch.toLowerCase());
                  const matchesStatus = !roomFilters.status || room.status === roomFilters.status;
                  const matchesType = !roomFilters.room_type || room.room_type === roomFilters.room_type;
                  return matchesSearch && matchesStatus && matchesType;
                })
                .map((room) => (
                <tr key={room.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    Room {room.room_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{room.floor || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 capitalize">{room.room_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{room.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{room.occupied || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {room.price ? `$${room.price}/month` : 'N/A'}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-amber-600 hover:text-amber-700">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {roomsData.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">No rooms found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Requests Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">Room Requests</h3>
          <div className="flex items-center space-x-4">
            <select
              value={requestFilters.status}
              onChange={(e) => setRequestFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="allocated">Allocated</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={requestFilters.room_type}
              onChange={(e) => setRequestFilters(prev => ({ ...prev, room_type: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">All Types</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="premium">Premium</option>
              <option value="suite">Suite</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Preferred Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Preferred Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roomRequests
                .filter(request => {
                  const matchesStatus = !requestFilters.status || request.status === requestFilters.status;
                  const matchesType = !requestFilters.room_type || request.preferred_room_type === requestFilters.room_type;
                  return matchesStatus && matchesType;
                })
                .map((request) => (
                <tr key={request.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{request.user?.full_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{request.user?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 capitalize">
                    {request.preferred_room_type || 'Any'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {request.preferred_floor || 'Any'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {request.priority_score || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'allocated' ? 'bg-green-100 text-green-800' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'waitlisted' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(request.requested_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-700">
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
              {roomRequests.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">No room requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Allocations Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Current Allocations</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Allocated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roomAllocations.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{allocation.users?.full_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{allocation.users?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    Room {allocation.rooms?.room_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {allocation.rooms?.floor || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 capitalize">
                    {allocation.rooms?.room_type || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(allocation.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-red-600 hover:text-red-700">
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button className="text-amber-600 hover:text-amber-700">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {roomAllocations.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No allocations found</td>
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
      case 'rooms-dashboard':
        return renderRoomsDashboard();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  const AddRoomModal = () => {
    if (!showAddRoomModal) return null;

    const availableAmenities = [
      'WiFi', 'Air Conditioning', 'Heating', 'Private Bathroom', 
      'Shared Bathroom', 'Kitchen', 'Laundry', 'Balcony', 
      'Study Desk', 'Wardrobe', 'TV', 'Refrigerator'
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={() => setShowAddRoomModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            disabled={isSubmittingRoom}
          >
            <X className="w-6 h-6" />
          </button>
          
          <h3 className="text-2xl font-semibold text-slate-800 mb-6 pr-8">Add New Room</h3>
          
          <form onSubmit={handleAddRoom} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  name="room_number"
                  value={roomFormData.room_number}
                  onChange={handleRoomFormChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    roomFormErrors.room_number ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
                  }`}
                  placeholder="e.g., 101, A-205"
                />
                {roomFormErrors.room_number && (
                  <p className="mt-1 text-sm text-red-600">{roomFormErrors.room_number}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Floor
                </label>
                <input
                  type="number"
                  name="floor"
                  value={roomFormData.floor}
                  onChange={handleRoomFormChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., 1, 2, 3"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Type
                </label>
                <select
                  name="room_type"
                  value={roomFormData.room_type}
                  onChange={handleRoomFormChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="premium">Premium</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={roomFormData.capacity}
                  onChange={handleRoomFormChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    roomFormErrors.capacity ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
                  }`}
                  placeholder="e.g., 2, 4"
                  min="1"
                />
                {roomFormErrors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{roomFormErrors.capacity}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price per Month ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={roomFormData.price}
                  onChange={handleRoomFormChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    roomFormErrors.price ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
                  }`}
                  placeholder="e.g., 500, 750"
                  min="0"
                  step="0.01"
                />
                {roomFormErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{roomFormErrors.price}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roomFormData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                disabled={isSubmittingRoom}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                disabled={isSubmittingRoom}
              >
                {isSubmittingRoom ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Room...
                  </>
                ) : (
                  'Add Room'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
      
      {/* Modals */}
      <AddRoomModal />
    </div>
  );
};

export default OperationsDashboard;
