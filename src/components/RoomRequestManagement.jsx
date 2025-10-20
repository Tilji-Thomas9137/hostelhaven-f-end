import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  User,
  Home,
  MapPin,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Star,
  Users,
  UserCheck,
  UserX,
  Clock3,
  X,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const RoomRequestManagement = () => {
  const { showNotification } = useNotification();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showApproveConfirmationModal, setShowApproveConfirmationModal] = useState(false);
  const [requestToConfirm, setRequestToConfirm] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRoomSelectionModal, setShowRoomSelectionModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('🔍 RoomRequestManagement: Starting to fetch requests...');
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ RoomRequestManagement: No session found');
        return;
      }

      console.log('✅ RoomRequestManagement: Session found, making API request...');
      console.log('🔍 RoomRequestManagement: User session:', {
        email: session.user.email,
        id: session.user.id
      });

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      console.log('🔍 RoomRequestManagement: API URL:', `${API_BASE_URL}/api/room-requests/all`);
      
      const response = await fetch(`${API_BASE_URL}/api/room-requests/all`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 RoomRequestManagement: API response status:', response.status);
      console.log('📡 RoomRequestManagement: API response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log('📡 RoomRequestManagement: API response:', result);
      console.log('📡 RoomRequestManagement: Response status:', response.status);
      console.log('📡 RoomRequestManagement: Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok && result.success) {
        console.log('✅ RoomRequestManagement: Successfully fetched requests:', result.data.requests?.length || 0);
        console.log('🔍 RoomRequestManagement: Raw requests data:', result.data.requests);
        console.log('🔍 RoomRequestManagement: Pagination data:', result.data.pagination);
        setRequests(result.data.requests || []);
      } else {
        console.error('❌ RoomRequestManagement: Error fetching requests:', result.message);
        console.error('❌ RoomRequestManagement: Full error response:', result);
        console.error('❌ RoomRequestManagement: Response status was not OK:', response.status);
        showNotification(result.message || 'Failed to fetch room requests', 'error');
      }
    } catch (error) {
      console.error('❌ RoomRequestManagement: Exception while fetching requests:', error);
      console.error('❌ RoomRequestManagement: Error stack:', error.stack);
      showNotification('Failed to fetch room requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRooms = async (roomType) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/rooms?room_type=${roomType}&status=available`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        // Filter rooms to show only those with available capacity
        const availableRooms = result.data.rooms.filter(room => {
          const hasCapacity = room.current_occupancy < room.capacity;
          const isAvailable = room.status === 'available' || room.status === 'partially_filled';
          console.log(`🔍 Room ${room.room_number}: capacity=${room.current_occupancy}/${room.capacity}, status=${room.status}, hasCapacity=${hasCapacity}, isAvailable=${isAvailable}`);
          return hasCapacity && isAvailable;
        });
        
        console.log('🔍 Available rooms after filtering:', availableRooms.length, 'out of', result.data.rooms.length);
        setAvailableRooms(availableRooms);
        
        if (availableRooms.length === 0) {
          showNotification('No rooms available with capacity for allocation', 'warning');
        }
      } else {
        showNotification('Failed to fetch available rooms', 'error');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      showNotification('Failed to fetch available rooms', 'error');
    }
  };

  const handleApproveRequest = async (request) => {
    console.log('🔍 Approve request clicked for:', request.id);
    setRequestToConfirm(request);
    setShowApproveConfirmationModal(true);
  };

  const handleProceedToAllocate = async () => {
    if (!requestToConfirm) return;
    
    const request = requestToConfirm;
    setSelectedRequest(request);
    setShowApproveConfirmationModal(false);
    
    console.log('🔍 Room request details:', {
      id: request.id,
      preferred_room_type: request.preferred_room_type,
      special_requirements: request.special_requirements,
      notes: request.notes
    });
    
    // First, get all rooms of the requested type
    await fetchAvailableRooms(request.preferred_room_type);
    
    // Check if student requested a specific room - try multiple patterns
    let requestedRoomNumber = null;
    
    // First priority: Check if there's a requested room in the request data
    if (request.requested_room && request.requested_room.room_number) {
      requestedRoomNumber = request.requested_room.room_number;
      console.log('🔍 Found requested room from request data (PRIORITY):', requestedRoomNumber);
    } else {
      // Fallback: Try to extract room number from special_requirements or notes
      const searchText = `${request.special_requirements || ''} ${request.notes || ''}`.toLowerCase();
      console.log('🔍 Searching for room number in text:', searchText);
      
      // Multiple patterns to match room numbers (excluding UUIDs)
      const patterns = [
        /room\s+([a-z0-9]+)/i,           // "room A1102", "room 101"
        /requesting\s+room\s+([a-z0-9]+)/i, // "requesting room A1102"
        /wants\s+room\s+([a-z0-9]+)/i,   // "wants room A1102"
        /([a-z]\d{3,4})/i,              // "A1102", "T101" (but not from UUIDs)
        /(\d{3,4})/i                    // "1102", "101" (but not from UUIDs)
      ];
      
      for (const pattern of patterns) {
        const match = searchText.match(pattern);
        if (match) {
          const potentialRoomNumber = match[1];
          
          // Skip if it leads like a UUID (contains hyphens or is too long)
          if (potentialRoomNumber.includes('-') || potentialRoomNumber.length > 6) {
            console.log('🔍 Skipping UUID-like match:', potentialRoomNumber);
            continue;
          }
          
          // Skip if it's part of a UUID (like "d488" from UUID)
          const isPartOfUuid = searchText.includes('requested_room_id:') && 
                             (potentialRoomNumber.length <= 4 && /^[a-z]\d{3}$/i.test(potentialRoomNumber));
          
          if (isPartOfUuid) {
            console.log('🔍 Skipping UUID part:', potentialRoomNumber);
            continue;
          }
          
          requestedRoomNumber = potentialRoomNumber;
          console.log('🔍 Found requested room number from text:', requestedRoomNumber, 'using pattern:', pattern);
          break;
        }
      }
    }
    
    // If we found a requested room number, fetch and check that specific room
    if (requestedRoomNumber) {
      console.log('🔍 Looking for room with number:', requestedRoomNumber);
      console.log('🔍 Available rooms count:', availableRooms.length);
      
      // First check in the already fetched available rooms
      let requestedRoom = availableRooms.find(room => {
        const roomNum = room.room_number.toLowerCase();
        const requestedNum = requestedRoomNumber.toLowerCase();
        const isMatch = roomNum.includes(requestedNum) || requestedNum.includes(roomNum);
        console.log(`🔍 Comparing ${roomNum} with ${requestedNum}: ${isMatch}`);
        return isMatch;
      });
      
      // If not found in available rooms, fetch directly from database
      if (!requestedRoom) {
        console.log('🔍 Room not found in available rooms, fetching directly from database...');
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
          const response = await fetch(`${API_BASE_URL}/api/rooms?room_number=${requestedRoomNumber}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            const rooms = result.data?.rooms || [];
            console.log('🔍 Database search result:', rooms);
            
            // Find the exact room
            requestedRoom = rooms.find(room => {
              const roomNum = room.room_number.toLowerCase();
              const requestedNum = requestedRoomNumber.toLowerCase();
              return roomNum.includes(requestedNum) || requestedNum.includes(roomNum);
            });
            
            if (requestedRoom) {
              console.log('✅ Found requested room in database:', requestedRoom.room_number);
              // Check if room has available capacity
              const occupied = requestedRoom.current_occupancy || 0;
              const hasCapacity = occupied < requestedRoom.capacity;
              const isAvailable = requestedRoom.status === 'available' || requestedRoom.status === 'partially_filled';
              
              if (hasCapacity && isAvailable) {
                console.log('✅ Requested room is available and has capacity');
                setAvailableRooms([requestedRoom]);
                setSelectedRoomId(requestedRoom.id);
              } else {
                console.log('❌ Requested room exists but is not available:', {
                  hasCapacity,
                  isAvailable,
                  capacity: requestedRoom.capacity,
                  occupied: occupied,
                  status: requestedRoom.status
                });
                setAvailableRooms([]);
                showNotification(`Requested room ${requestedRoomNumber} is not available (${occupied}/${requestedRoom.capacity} occupied)`, 'warning');
              }
            } else {
              console.log('❌ Requested room not found in database:', requestedRoomNumber);
              setAvailableRooms([]);
              showNotification(`Requested room ${requestedRoomNumber} does not exist`, 'warning');
            }
          } else {
            console.error('❌ Failed to fetch room from database');
            setAvailableRooms([]);
            showNotification(`Failed to check room availability`, 'error');
          }
        } catch (error) {
          console.error('❌ Error fetching room from database:', error);
          setAvailableRooms([]);
          showNotification(`Error checking room availability`, 'error');
        }
      } else {
        // Room found in available rooms
        console.log('✅ Requested room is available:', requestedRoom.room_number);
        setAvailableRooms([requestedRoom]);
        setSelectedRoomId(requestedRoom.id);
      }
    } else {
      console.log('❌ No specific room requested, showing all available rooms');
      // If no specific room was requested, show all available rooms
    }
    
    setShowRoomSelectionModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedRoomId || !selectedRequest) {
      console.error('❌ Missing required data for approval:', { selectedRoomId, selectedRequest: !!selectedRequest });
      showNotification('Please select a room for allocation', 'error');
      return;
    }

    // Proceed with approval (confirmation already done in custom modal)

    setIsUpdating(true);
    try {
      console.log('🔍 Approving room request:', selectedRequest.id, 'with room:', selectedRoomId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No session found for approval');
        showNotification('Please login to approve requests', 'error');
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      console.log('🔍 Making approval request to:', `${API_BASE_URL}/api/room-requests/${selectedRequest.id}/approve`);
      
      const response = await fetch(`${API_BASE_URL}/api/room-requests/${selectedRequest.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: selectedRoomId,
          notes: `Approved by Hostel Operations Assistant`
        }),
      });

      console.log('📡 Approval response status:', response.status);
      const result = await response.json();
      console.log('📡 Approval response:', result);

      if (response.ok && result.success) {
        console.log('✅ Room request approved successfully');
        showNotification('Room request approved successfully!', 'success');
        setShowRoomSelectionModal(false);
        setSelectedRequest(null);
        setSelectedRoomId('');
        fetchRequests();
      } else {
        console.error('❌ Approval failed:', result.message);
        throw new Error(result.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('❌ Error approving request:', error);
      showNotification(error.message || 'Failed to approve room request', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    // Proceed with rejection (confirmation handled by custom modal)

    setIsUpdating(true);
    try {
      console.log('🔍 Rejecting room request:', requestId, 'Reason:', reason);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No session found for rejection');
        showNotification('Please login to reject requests', 'error');
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      console.log('🔍 Making rejection request to:', `${API_BASE_URL}/api/room-requests/${requestId}/reject`);
      
      const response = await fetch(`${API_BASE_URL}/api/room-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'Request rejected by Hostel Operations Assistant'
        }),
      });

      console.log('📡 Rejection response status:', response.status);
      const result = await response.json();
      console.log('📡 Rejection response:', result);

      if (response.ok && result.success) {
        console.log('✅ Room request rejected successfully');
        showNotification('Room request rejected successfully!', 'success');
        fetchRequests(); // Refresh the list
      } else {
        console.error('❌ Rejection failed:', result.message);
        throw new Error(result.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      showNotification(error.message || 'Failed to reject room request', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200';
      case 'approved':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200';
      case 'waitlisted':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
    }
  };

  const getRoomTypeIcon = (type) => {
    switch (type) {
      case 'single':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'double':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'triple':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'quad':
        return <Users className="w-5 h-5 text-orange-500" />;
      default:
        return <Home className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoomTypeColor = (type) => {
    switch (type) {
      case 'single':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'double':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'triple':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'quad':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.preferred_room_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_profiles?.admission_number?.toString().includes(searchTerm) ||
                         request.special_requirements?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-slate-600">Loading room requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Room Request Management</h2>
              <p className="text-slate-600 mt-1">Manage student room requests and allocations - Operations Assistant</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-slate-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Pending: {requests.filter(r => r.status === 'pending').length}
                </span>
                <span className="text-sm text-slate-500">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Total: {requests.length}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchRequests}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Refresh</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
                    const response = await fetch(`${API_BASE_URL}/api/room-requests/debug-check`);
                    const result = await response.json();
                    console.log('🔍 DEBUG CHECK Result:', result);
                    showNotification(`Debug check completed. Check console for details.`, 'success');
                  } catch (error) {
                    console.error('Debug check error:', error);
                    showNotification('Debug check failed', 'error');
                  }
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Debug</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search room requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Room Requests</h3>
          <p className="text-sm text-slate-600 mt-1">Manage and process student room allocation requests</p>
        </div>

        <div className="p-6">
          {filteredRequests.length > 0 ? (
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header with type and status */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`p-3 rounded-xl border ${getRoomTypeColor(request.preferred_room_type)}`}>
                          {getRoomTypeIcon(request.preferred_room_type)}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-800 capitalize">
                            {request.preferred_room_type?.replace('_', ' ')} Room Request
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                              <Clock className="w-4 h-4 mr-2" />
                              <span className="capitalize">{request.status.replace('_', ' ')}</span>
                            </span>
                            <span className="text-sm text-slate-500">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Requested: {formatDate(request.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Student Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center space-x-3 text-slate-600 mb-2">
                            <User className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Student Information</span>
                          </div>
                          <div className="text-sm font-semibold text-slate-800">
                            {request.user_profiles?.full_name || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-500">
                            Admission: {request.user_profiles?.admission_number || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-500">
                            Email: {request.user_profiles?.email || 'N/A'}
                          </div>
                          {request.user_profiles?.phone_number && (
                            <div className="text-xs text-slate-500">
                              Phone: {request.user_profiles.phone_number}
                            </div>
                          )}
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center space-x-3 text-slate-600 mb-2">
                            <Home className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Room Preference</span>
                          </div>
                          <div className="text-sm font-semibold text-slate-800 capitalize">
                            {request.preferred_room_type?.replace('_', ' ')} Room
                          </div>
                          {request.requested_room && (
                            <div className="text-xs text-slate-500 mt-1">
                              Requested Room: {request.requested_room.room_number} (Floor {request.requested_room.floor})
                            </div>
                          )}
                          {request.allocated_room && (
                            <div className="text-xs text-green-600 mt-1 font-medium">
                              Allocated Room: {request.allocated_room.room_number} (Floor {request.allocated_room.floor})
                            </div>
                          )}
                          {request.special_requirements && !request.special_requirements.includes('REQUESTED_ROOM_ID:') && (
                            <div className="text-xs text-slate-500 mt-1">
                              Special Requirements: {request.special_requirements}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(request)}
                              disabled={isUpdating}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>{isUpdating ? 'Processing...' : 'Approve'}</span>
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id, 'Request rejected by operations assistant')}
                              disabled={isUpdating}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <UserX className="w-4 h-4" />
                              <span>{isUpdating ? 'Processing...' : 'Reject'}</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Room Requests Found</h3>
              <p className="text-slate-600">No room requests match your current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Room Selection Modal */}
      {showRoomSelectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Allocate Requested Room</h3>
              <p className="text-sm text-slate-600 mt-1">
                {availableRooms.length === 1 
                  ? `Allocating requested room: ${availableRooms[0]?.room_number}` 
                  : availableRooms.length === 0 
                    ? "The requested room is not available" 
                    : "Choose an available room for this request"
                }
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {availableRooms.map((room) => (
                  <label key={room.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="room"
                      value={room.id}
                      checked={selectedRoomId === room.id}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">
                        Room {room.room_number} (Floor {room.floor})
                      </div>
                      <div className="text-sm text-slate-500">
                        Capacity: {room.current_occupancy}/{room.capacity} students
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              {availableRooms.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-2">No available rooms for this room type</p>
                  <p className="text-sm text-slate-500">
                    All rooms of this type are currently at full capacity.
                    <br />
                    You may need to wait for a room to become available or check other room types.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRoomSelectionModal(false);
                  setSelectedRequest(null);
                  setSelectedRoomId('');
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                disabled={!selectedRoomId || isUpdating}
                className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  availableRooms.length === 1 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isUpdating ? 'Processing...' : (availableRooms.length === 1 ? 'Approve Room Request' : 'Approve Request')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showApproveConfirmationModal && requestToConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Confirm Room Approval</h3>
                  <p className="text-sm text-slate-500">Are you sure you want to proceed?</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-slate-600">
                  <p className="font-medium text-slate-800 mb-1">Student: {requestToConfirm.user_profiles?.full_name || 'Unknown'}</p>
                  <p className="mb-1">Room Type: {requestToConfirm.preferred_room_type?.replace('_', ' ')}</p>
                  {requestToConfirm.requested_room && (
                    <p>Requested Room: {requestToConfirm.requested_room.room_number}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApproveConfirmationModal(false);
                    setRequestToConfirm(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToAllocate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Room Request Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-medium text-slate-800 mb-2">Student Information</h4>
                <div className="text-sm text-slate-600">
                  <p><strong>Name:</strong> {selectedRequest.user_profiles?.full_name || 'N/A'}</p>
                  <p><strong>Admission Number:</strong> {selectedRequest.user_profiles?.admission_number || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedRequest.user_profiles?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedRequest.user_profiles?.phone_number || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-medium text-slate-800 mb-2">Room Request Details</h4>
                <div className="text-sm text-slate-600">
                  <p><strong>Preferred Room Type:</strong> {selectedRequest.preferred_room_type?.replace('_', ' ')}</p>
                  <p><strong>Status:</strong> {selectedRequest.status}</p>
                  <p><strong>Requested Date:</strong> {formatDate(selectedRequest.created_at)}</p>
                  {selectedRequest.processed_at && (
                    <p><strong>Processed Date:</strong> {formatDate(selectedRequest.processed_at)}</p>
                  )}
                  {selectedRequest.special_requirements && (
                    <p><strong>Special Requirements:</strong> {selectedRequest.special_requirements}</p>
                  )}
                  {selectedRequest.notes && (
                    <p><strong>Notes:</strong> {selectedRequest.notes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomRequestManagement;
