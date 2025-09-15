import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  Users, 
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Download,
  BarChart3,
  TrendingUp,
  Activity,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  User,
  Settings,
  Bell,
  X
} from 'lucide-react';

const RoomAllocation = () => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data states
  const [rooms, setRooms] = useState([]);
  const [requests, setRequests] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [batches, setBatches] = useState([]);
  
  // UI states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filters
  const [roomSearch, setRoomSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  // Refetch requests when filter changes
  useEffect(() => {
    fetchRequests();
  }, [requestStatusFilter]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchRooms(),
        fetchRequests(),
        fetchWaitlist(),
        fetchStatistics(),
        fetchBatches()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to fetch data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocation/rooms', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRooms(result.data.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams();
      if (requestStatusFilter) params.set('status', requestStatusFilter);
      params.set('limit', '50');

      const response = await fetch(`http://localhost:3002/api/room-allocation/requests?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRequests(result.data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }, [requestStatusFilter]);

  const fetchWaitlist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocation/waitlist', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setWaitlist(result.data.waitlist || []);
      }
    } catch (error) {
      console.error('Error fetching waitlist:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocation/statistics', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStatistics(result.data || {});
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      // This would be a new endpoint to fetch allocation batches
      // For now, we'll create a mock implementation
      setBatches([]);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleCreateRoom = async (formData) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocation/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowRoomModal(false);
        fetchRooms();
        fetchStatistics();
        showNotification('Room created successfully!', 'success');
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to create room', 'error');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      showNotification('Failed to create room', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchAllocation = async (batchName) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocation/batch-allocate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batch_name: batchName })
      });

      if (response.ok) {
        setShowBatchModal(false);
        fetchAllData();
        showNotification('Batch allocation completed successfully!', 'success');
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to run batch allocation', 'error');
      }
    } catch (error) {
      console.error('Error running batch allocation:', error);
      showNotification('Failed to run batch allocation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessWaitlist = async () => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocation/process-waitlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        fetchAllData();
        showNotification(result.message || 'Waitlist processed successfully!', 'success');
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to process waitlist', 'error');
      }
    } catch (error) {
      console.error('Error processing waitlist:', error);
      showNotification('Failed to process waitlist', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleApproveRequest = async (request) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/room-allocation/requests/${request.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showNotification('Request approved successfully!', 'success');
        await fetchAllData();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to approve request', 'error');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('Failed to approve request', 'error');
    }
  };

  const handleRejectRequest = async (request) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/room-allocation/requests/${request.id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showNotification('Request rejected successfully!', 'success');
        await fetchAllData();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to reject request', 'error');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification('Failed to reject request', 'error');
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 rounded-3xl shadow-xl border border-blue-200/50 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">{statistics.rooms?.total || 0}</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Total Rooms</h3>
              <p className="text-3xl font-black text-slate-900 mb-1">{statistics.rooms?.total || 0}</p>
              <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
                Available: {statistics.rooms?.available || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 rounded-3xl shadow-xl border border-emerald-200/50 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-8 h-8" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">{statistics.requests?.allocated || 0}</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Allocated</h3>
              <p className="text-3xl font-black text-slate-900 mb-1">{statistics.requests?.allocated || 0}</p>
              <p className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                Students housed
              </p>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-100 rounded-3xl shadow-xl border border-amber-200/50 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">{statistics.requests?.pending || 0}</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Pending</h3>
              <p className="text-3xl font-black text-slate-900 mb-1">{statistics.requests?.pending || 0}</p>
              <p className="text-sm font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full inline-block">
                Awaiting allocation
              </p>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-100 to-indigo-100 rounded-3xl shadow-xl border border-purple-200/50 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-400 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">{statistics.requests?.waitlisted || 0}</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Waitlist</h3>
              <p className="text-3xl font-black text-slate-900 mb-1">{statistics.requests?.waitlisted || 0}</p>
              <p className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full inline-block">
                In queue
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Overview */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-slate-200/50 p-8 hover:shadow-2xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Occupancy Overview</h2>
              <p className="text-slate-600">Real-time room utilization statistics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group/item text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-2">{statistics.rooms?.total_capacity || 0}</div>
              <div className="text-slate-600 font-semibold">Total Capacity</div>
            </div>
            <div className="group/item text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                <UserCheck className="w-8 h-8" />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-2">{statistics.rooms?.total_occupied || 0}</div>
              <div className="text-slate-600 font-semibold">Current Occupancy</div>
            </div>
            <div className="group/item text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-2">{statistics.rooms?.occupancy_rate || 0}%</div>
              <div className="text-slate-600 font-semibold">Occupancy Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 rounded-3xl shadow-xl border border-amber-200/50 p-8 hover:shadow-2xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Quick Actions</h2>
              <p className="text-slate-600">Manage rooms and allocations efficiently</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setShowRoomModal(true)}
              className="group/action flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-2xl border border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover/action:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-slate-800 block">Add New Room</span>
                <span className="text-sm text-slate-600">Create a new room entry</span>
              </div>
            </button>
            
            <button
              onClick={() => setShowBatchModal(true)}
              className="group/action flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-2xl border border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover/action:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-slate-800 block">Run Batch Allocation</span>
                <span className="text-sm text-slate-600">Process multiple allocations</span>
              </div>
            </button>
            
            <button
              onClick={handleProcessWaitlist}
              disabled={isSubmitting}
              className="group/action flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-2xl border border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover/action:scale-110 transition-transform duration-300">
                <RefreshCw className={`w-6 h-6 ${isSubmitting ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-left">
                <span className="font-semibold text-slate-800 block">Process Waitlist</span>
                <span className="text-sm text-slate-600">Handle pending requests</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Room Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <select
            value={roomTypeFilter}
            onChange={(e) => setRoomTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All Types</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="premium">Premium</option>
            <option value="suite">Suite</option>
          </select>
          <button 
            onClick={() => setShowRoomModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Occupancy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rooms
                .filter((room) => {
                  const matchesSearch = roomSearch.trim() === '' || 
                    String(room.room_number).toLowerCase().includes(roomSearch.toLowerCase()) ||
                    String(room.floor).toLowerCase().includes(roomSearch.toLowerCase());
                  const matchesType = roomTypeFilter === '' || room.room_type === roomTypeFilter;
                  return matchesSearch && matchesType;
                })
                .map((room) => (
                <tr key={room.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{room.room_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{room.floor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 capitalize">{room.room_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{room.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{room.occupied || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${room.price}</td>
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

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Room Requests</h2>
        <div className="flex items-center space-x-4">
          <select
            value={requestStatusFilter}
            onChange={(e) => setRequestStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="allocated">Allocated</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Preferences</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Allocated Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{request.user?.full_name || 'N/A'}</p>
                        <p className="text-sm text-slate-500">{request.user?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(request.requested_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div>
                      <p className="font-medium">{request.preferred_room_type || 'Any'}</p>
                      <p className="text-xs text-slate-500">Floor: {request.preferred_floor || 'Any'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <span className="font-mono text-sm">{request.priority_score || 0}</span>
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
                    {request.allocated_room ? (
                      <div>
                        <p className="font-medium">Room {request.allocated_room.room_number}</p>
                        <p className="text-xs text-slate-500">{request.allocated_room.room_type}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400">Not allocated</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewRequest(request)}
                        className="group relative inline-flex items-center justify-center w-8 h-8 bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 rounded-lg transition-all duration-200 hover:scale-105"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          View Details
                        </div>
                      </button>
                      {request.status === 'pending' && (
                        <button 
                          onClick={() => handleApproveRequest(request)}
                          className="group relative inline-flex items-center justify-center w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Approve Request"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Approve Request
                          </div>
                        </button>
                      )}
                      {(request.status === 'pending' || request.status === 'waitlisted') && (
                        <button 
                          onClick={() => handleRejectRequest(request)}
                          className="group relative inline-flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Reject Request"
                        >
                          <X className="w-4 h-4" />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Reject Request
                          </div>
                        </button>
                      )}
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

  const renderWaitlist = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Waitlist Management</h2>
        <button
          onClick={handleProcessWaitlist}
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
          <span>Process Waitlist</span>
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Added Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Preferences</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {waitlist.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      #{entry.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{entry.user?.full_name || 'N/A'}</p>
                        <p className="text-sm text-slate-500">{entry.user?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(entry.added_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div>
                      <p className="font-medium">{entry.preferred_room_type || 'Any'}</p>
                      <p className="text-xs text-slate-500">Floor: {entry.room_request?.preferred_floor || 'Any'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <span className="font-mono text-sm">{entry.priority_score || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-amber-600 hover:text-amber-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700">
                        <CheckCircle className="w-4 h-4" />
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'rooms', label: 'Rooms', icon: Building2 },
    { id: 'requests', label: 'Requests', icon: Users },
    { id: 'waitlist', label: 'Waitlist', icon: Clock }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'rooms':
        return renderRooms();
      case 'requests':
        return renderRequests();
      case 'waitlist':
        return renderWaitlist();
      default:
        return renderOverview();
    }
  };

  const RoomModal = () => {
    const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
      mode: 'onChange',
      defaultValues: {
        room_number: '',
        floor: '',
        room_type: 'standard',
        capacity: '1',
        price: ''
      }
    });

    const onSubmit = (data) => {
      handleCreateRoom(data);
      reset();
    };

    if (!showRoomModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Room</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Number *</label>
                <input
                  type="text"
                  {...register('room_number', { required: 'Room number is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.room_number ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                  placeholder="101"
                />
                {errors.room_number && <p className="mt-1 text-sm text-red-600">{errors.room_number.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Floor *</label>
                <input
                  type="number"
                  {...register('floor', { required: 'Floor is required', min: { value: 0, message: 'Floor must be 0 or greater' } })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.floor ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                  min="0"
                />
                {errors.floor && <p className="mt-1 text-sm text-red-600">{errors.floor.message}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Room Type *</label>
              <input
                type="text"
                {...register('room_type', { required: 'Room type is required' })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.room_type ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                placeholder="e.g., Standard, Deluxe, Premium, Suite, Economy, Luxury, etc."
              />
              {errors.room_type && <p className="mt-1 text-sm text-red-600">{errors.room_type.message}</p>}
              <p className="mt-1 text-xs text-slate-500">Enter any custom room type name</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                <select
                  {...register('capacity', { required: 'Capacity is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.capacity ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 Persons</option>
                  <option value="3">3 Persons</option>
                  <option value="4">4 Persons</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Price *</label>
                <input
                  type="number"
                  {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.price ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                  placeholder="1200"
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowRoomModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const BatchModal = () => {
    const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
      mode: 'onChange',
      defaultValues: {
        batch_name: ''
      }
    });

    const onSubmit = (data) => {
      handleBatchAllocation(data.batch_name);
      reset();
    };

    if (!showBatchModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Run Batch Allocation</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name *</label>
              <input
                type="text"
                {...register('batch_name', { required: 'Batch name is required' })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.batch_name ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                placeholder="Monthly Allocation - December 2024"
              />
              {errors.batch_name && <p className="mt-1 text-sm text-red-600">{errors.batch_name.message}</p>}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This will process all pending room requests and allocate rooms based on priority scores. 
                    Students without available rooms will be added to the waitlist.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? 'Processing...' : 'Run Allocation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const RequestModal = () => {
    if (!showRequestModal || !selectedRequest) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Request Details</h2>
                  <p className="text-slate-600">Student room allocation request information</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Student Information</span>
                </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Name</label>
                      <p className="text-slate-900 font-semibold">{selectedRequest.users?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <p className="text-slate-900">{selectedRequest.users?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Phone</label>
                      <p className="text-slate-900">{selectedRequest.users?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Admission Number</label>
                      <p className="text-slate-900">{selectedRequest.users?.user_profiles?.[0]?.admission_number || 'N/A'}</p>
                    </div>
                  </div>
              </div>

              {/* Request Details */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>Request Details</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Preferred Room Type</label>
                    <p className="text-slate-900 font-semibold">{selectedRequest.preferred_room_type || 'Any'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Preferred Floor</label>
                    <p className="text-slate-900">{selectedRequest.preferred_floor || 'Any'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Priority Score</label>
                    <p className="text-slate-900 font-semibold">{selectedRequest.priority_score || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Request Date</label>
                    <p className="text-slate-900">{new Date(selectedRequest.requested_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-amber-600" />
                  <span>Status Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Current Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedRequest.status === 'allocated' ? 'bg-green-100 text-green-800' : 
                        selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedRequest.status === 'waitlisted' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Allocated Room</label>
                    <p className="text-slate-900">
                      {selectedRequest.allocated_room ? 
                        `Room ${selectedRequest.allocated_room.room_number} (${selectedRequest.allocated_room.room_type})` : 
                        'Not allocated'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              {selectedRequest.special_requirements && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200/50">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <span>Special Requirements</span>
                  </h3>
                  <p className="text-slate-900">{selectedRequest.special_requirements}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
              >
                Close
              </button>
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApproveRequest(selectedRequest);
                      setShowRequestModal(false);
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      handleRejectRequest(selectedRequest);
                      setShowRequestModal(false);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading room allocation system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 rounded-full border-3 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Room Allocation System
                  </h1>
                  <p className="text-slate-600 text-lg font-medium mt-2">
                    Intelligent room management and student allocation platform
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchAllData}
                  className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-2xl hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-semibold">Refresh Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2">
            <nav className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center space-x-3 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50 hover:scale-102'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Enhanced Content */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            {renderContent()}
          </div>

          {/* Modals */}
          <RoomModal />
          <BatchModal />
          <RequestModal />
        </div>
      </div>
    </div>
  );
};

export default RoomAllocation;