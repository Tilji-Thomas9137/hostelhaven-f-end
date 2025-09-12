import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../contexts/NotificationContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomSchema } from '../../lib/validation';
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
  Trash2,
  UserCheck,
  X
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({});
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Filters
  const [studentsSearch, setStudentsSearch] = useState('');
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState('');
  const [adminComplaintStatusFilter, setAdminComplaintStatusFilter] = useState('');
  const [roomsSearch, setRoomsSearch] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('');
  const [leaveSearch, setLeaveSearch] = useState('');
  
  // Rooms & Allocations Dashboard states
  const [roomsData, setRoomsData] = useState([]);
  const [roomRequests, setRoomRequests] = useState([]);
  const [roomAllocations, setRoomAllocations] = useState([]);
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  const [showEditRoomForm, setShowEditRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  const [showRoomAllocationModal, setShowRoomAllocationModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestToAllocate, setRequestToAllocate] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
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
  const [showViewRoomPanel, setShowViewRoomPanel] = useState(false);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
          
          // Allow admin, operations assistant, and warden to load dashboard data
          const role = (result.data.user.role || '').toLowerCase();
          if (['admin', 'hostel_operations_assistant', 'warden'].includes(role)) {
            fetchDashboardStats();
            fetchStudents();
            fetchRooms();
            fetchComplaints();
            fetchPayments();
            fetchLeaveRequests();
            fetchAnalytics();
            fetchRoomsDashboardData();
          } else {
            console.warn('User lacks admin privileges for full dashboard, role:', result.data.user.role);
            setUser({ ...result.data.user, isNotAdmin: true });
          }
        } else {
          console.error('Failed to fetch user profile:', response.status);
          // Try to get user info from session as fallback
          const { data: { user: sessionUser } } = await supabase.auth.getUser();
          if (sessionUser) {
            setUser({
              id: sessionUser.id,
              fullName: sessionUser.user_metadata?.full_name || sessionUser.email,
              email: sessionUser.email,
              role: sessionUser.user_metadata?.role || 'student',
              avatar_url: sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture || ''
            });
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

  const fetchDashboardStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/admin/dashboard-stats', {
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

  // Resolve a user's avatar URL from multiple possible sources (auth metadata, DB columns, or storage path)
  const getUserAvatarUrl = (user) => {
    const possible = [
      user?.avatar_url,
      user?.profile_picture,
      user?.picture,
      user?.user_metadata?.avatar_url,
      user?.user_metadata?.picture,
    ].filter(Boolean);

    if (possible.length === 0) return '';

    const url = possible[0];
    // If already an absolute URL, return as-is
    if (/^https?:\/\//i.test(url)) return url;

    try {
      // Try common buckets: 'profile_picture' then 'avatars'
      const primary = supabase.storage.from('profile_picture').getPublicUrl(url)?.data?.publicUrl;
      if (primary) return primary;
      const fallback = supabase.storage.from('avatars').getPublicUrl(url)?.data?.publicUrl;
      return fallback || '';
    } catch (e) {
      return '';
    }
  };

  const fetchRooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Simplified: avoid joins that may fail if related tables/relationships were removed
      const { data: roomsData, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (!error && roomsData) {
        setRooms(roomsData);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams();
      params.set('limit', '50');
      if (paymentsStatusFilter) params.set('status', paymentsStatusFilter);

      const response = await fetch(`http://localhost:3002/api/admin/payments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setPayments(result.data.payments || []);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data.analytics || {});
      } else {
        setAnalytics({});
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({});
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
      } else {
        setRoomsData([]);
      }

      if (requestsRes.ok) {
        const requestsResult = await requestsRes.json();
        setRoomRequests(requestsResult.data.requests || []);
      } else {
        console.error('Failed to fetch room requests:', requestsRes.status);
        setRoomRequests([]);
      }

      if (allocationsRes.ok) {
        const allocationsResult = await allocationsRes.json();
        setRoomAllocations(allocationsResult.data.allocations || []);
      } else {
        setRoomAllocations([]);
      }
    } catch (e) {
      console.error('Error fetching rooms dashboard data:', e);
      setRoomsData([]);
      setRoomRequests([]);
      setRoomAllocations([]);
    }
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const fieldsToValidate = ['room_number', 'floor', 'capacity', 'price'];
    let hasErrors = false;
    
    fieldsToValidate.forEach(field => {
      validateField(field, roomFormData[field]);
      if (roomFormErrors[field] || (field === 'room_number' && !roomFormData[field].trim()) || 
          (field === 'capacity' && (!roomFormData[field] || roomFormData[field] < 1))) {
        hasErrors = true;
      }
    });
    
    if (hasErrors) return;

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
        setShowAddRoomForm(false);
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
        showNotification('Room added successfully!', 'success');
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to add room', 'error');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      showNotification('Failed to add room', 'error');
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
    
    // Real-time validation
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let error = '';
    
    switch (fieldName) {
      case 'room_number':
        if (!value.trim()) {
          error = 'Room number is required';
        } else if (value.trim().length < 2) {
          error = 'Room number must be at least 2 characters';
        } else if (!/^[A-Za-z0-9\-\s]+$/.test(value.trim())) {
          error = 'Room number can only contain letters, numbers, hyphens, and spaces';
        }
        break;
        
      case 'floor':
        if (value && (isNaN(value) || parseInt(value) < 0)) {
          error = 'Floor must be a positive number';
        } else if (value && parseInt(value) > 50) {
          error = 'Floor number seems too high (max 50)';
        }
        break;
        
      case 'capacity':
        if (!value) {
          error = 'Capacity is required';
        } else if (isNaN(value) || parseInt(value) < 1) {
          error = 'Capacity must be at least 1';
        } else if (parseInt(value) > 10) {
          error = 'Capacity seems too high (max 10)';
        }
        break;
        
      case 'price':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = 'Price must be a positive number';
        } else if (value && parseFloat(value) > 10000) {
          error = 'Price seems too high (max $10,000)';
        } else if (value && parseFloat(value) < 50) {
          error = 'Price seems too low (min $50)';
        }
        break;
        
      default:
        break;
    }
    
    setRoomFormErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const isFormValid = () => {
    const requiredFields = ['room_number', 'capacity'];
    const hasRequiredFields = requiredFields.every(field => 
      roomFormData[field] && roomFormData[field].toString().trim() !== ''
    );
    const hasNoErrors = Object.values(roomFormErrors).every(error => !error);
    return hasRequiredFields && hasNoErrors;
  };

  const handleAmenityChange = (amenity) => {
    setRoomFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      room_number: room.room_number || '',
      floor: room.floor || '',
      room_type: room.room_type || 'standard',
      capacity: room.capacity || '',
      price: room.price || '',
      amenities: room.amenities || []
    });
    setRoomFormErrors({});
    setShowEditRoomForm(true);
    setShowAddRoomForm(false);
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const fieldsToValidate = ['room_number', 'floor', 'capacity', 'price'];
    let hasErrors = false;
    
    fieldsToValidate.forEach(field => {
      validateField(field, roomFormData[field]);
      if (roomFormErrors[field] || (field === 'room_number' && !roomFormData[field].trim()) || 
          (field === 'capacity' && (!roomFormData[field] || roomFormData[field] < 1))) {
        hasErrors = true;
      }
    });
    
    if (hasErrors) return;

    setIsSubmittingRoom(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/room-allocation/rooms/${editingRoom.id}`, {
        method: 'PUT',
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
        setShowEditRoomForm(false);
        setEditingRoom(null);
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
        showNotification('Room updated successfully!', 'success');
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to update room', 'error');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      showNotification('Failed to update room', 'error');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const handleToggleRoomAvailability = async (room) => {
    const newStatus = room.status === 'available' ? 'maintenance' : 'available';
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/room-allocation/rooms/${room.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        await fetchRoomsDashboardData();
        showNotification(
          `Room ${room.room_number} is now ${newStatus === 'available' ? 'available' : 'under maintenance'}`, 
          'success'
        );
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to update room status', 'error');
      }
    } catch (error) {
      console.error('Error updating room status:', error);
      showNotification('Failed to update room status', 'error');
    }
  };

  const handleApproveRequest = async (request) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch available rooms for allocation
      const response = await fetch('http://localhost:3002/api/room-allocation/rooms', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        const availableRooms = result.data.rooms.filter(room => 
          room.status === 'available' && room.occupied < room.capacity
        );
        setAvailableRooms(availableRooms);
        setRequestToAllocate(request);
        setShowRoomAllocationModal(true);
      } else {
        showNotification('Failed to fetch available rooms', 'error');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('Failed to approve request', 'error');
    }
  };

  const handleViewRequest = async (request) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/room-allocation/requests/${request.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        const requestDetails = result.data.request;
        
        // Show request details in a modal or alert
        const details = `
          Student: ${requestDetails.users?.full_name || 'N/A'}
          Email: ${requestDetails.users?.email || 'N/A'}
          Preferred Type: ${requestDetails.preferred_room_type || 'Any'}
          Preferred Floor: ${requestDetails.preferred_floor || 'Any'}
          Special Requirements: ${requestDetails.special_requirements || 'None'}
          Status: ${requestDetails.status}
          Requested: ${new Date(requestDetails.requested_at).toLocaleString()}
        `;
        
        setSelectedRequest(requestDetails);
        setShowRequestModal(true);
      } else {
        showNotification('Failed to fetch request details', 'error');
      }
    } catch (error) {
      console.error('Error viewing request:', error);
      showNotification('Failed to view request details', 'error');
    }
  };

  const handleCancelRequest = async (request) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/room-allocation/requests/${request.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        await fetchRoomsDashboardData();
        showNotification('Request cancelled successfully', 'success');
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to cancel request', 'error');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      showNotification('Failed to cancel request', 'error');
    }
  };

  const handleAllocateRoom = async () => {
    if (!selectedRoomId || !requestToAllocate) {
      showNotification('Please select a room', 'error');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/room-allocation/requests/${requestToAllocate.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: selectedRoomId
        })
      });

      if (response.ok) {
        await fetchRoomsDashboardData();
        showNotification('Room allocated successfully', 'success');
        setShowRoomAllocationModal(false);
        setRequestToAllocate(null);
        setSelectedRoomId('');
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to allocate room', 'error');
      }
    } catch (error) {
      console.error('Error allocating room:', error);
      showNotification('Failed to allocate room', 'error');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams();
      params.set('limit', '20');
      if (studentsSearch.trim()) params.set('search', studentsSearch.trim());

      const response = await fetch(`http://localhost:3002/api/admin/students?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStudents(result.data.students || []);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams();
      params.set('limit', '20');
      if (adminComplaintStatusFilter) params.set('status', adminComplaintStatusFilter);

      const response = await fetch(`http://localhost:3002/api/admin/complaints?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setComplaints(result.data.complaints || []);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams();
      params.set('limit', '20');
      if (leaveStatusFilter) params.set('status', leaveStatusFilter);

      const response = await fetch(`http://localhost:3002/api/admin/leave-requests?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Backend returns { data: { leaveRequests } }
        setLeaveRequests(result.data.leaveRequests || []);
      } else {
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveRequests([]);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showNotification('Please log in to view user details', 'error');
        return;
      }

      const response = await fetch(`http://localhost:3002/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.user) {
          setViewingUser(result.data.user);
          setShowUserModal(true);
        } else {
          showNotification('User data not found', 'error');
        }
      } else {
        const errorData = await response.json();
        if (response.status === 404) {
          showNotification('User not found', 'error');
        } else {
          showNotification(errorData.message || 'Failed to fetch user details', 'error');
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showNotification('Network error: Failed to fetch user details', 'error');
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showNotification('Please log in to update user status', 'error');
        return;
      }

      const response = await fetch(`http://localhost:3002/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showNotification('User status updated successfully', 'success');
          fetchStudents(); // Refresh the list
          if (viewingUser && viewingUser.id === userId) {
            setViewingUser({ ...viewingUser, status: newStatus });
          }
        } else {
          showNotification(result.message || 'Failed to update user status', 'error');
        }
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to update user status', 'error');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification('Network error: Failed to update user status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Admin filters/watchers
  useEffect(() => {
    // Debounce student search
    const id = setTimeout(() => {
      fetchStudents();
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentsSearch]);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentsStatusFilter]);

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminComplaintStatusFilter]);

  useEffect(() => {
    fetchLeaveRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveStatusFilter]);

  // Debounce leave search to avoid excessive renders when we add server search later
  useEffect(() => {
    const id = setTimeout(() => {
      // Currently client-side filtering; keep effect for future server search
      // No-op
    }, 300);
    return () => clearTimeout(id);
  }, [leaveSearch]);

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

  const handleCreateRoom = async (formData) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Create room in the database
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          room_number: formData.room_number,
          floor: parseInt(formData.floor),
          room_type: formData.room_type,
          capacity: parseInt(formData.capacity),
          price: parseFloat(formData.price),
          status: 'available'
        })
        .select()
        .single();

      if (!error) {
        setShowRoomModal(false);
        fetchRooms(); // Refresh rooms list
        fetchDashboardStats(); // Refresh stats
        showNotification('Room created successfully!', 'success');
      } else {
        showNotification('Failed to create room: ' + error.message, 'error');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      showNotification('Failed to create room', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComplaintStatus = async (complaintId, status, notes = '') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/admin/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, resolution_notes: notes })
      });

      if (response.ok) {
        fetchComplaints(); // Refresh complaints list
        fetchDashboardStats(); // Refresh stats
        alert('Complaint status updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update complaint');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Failed to update complaint');
    }
  };

  const handleViewRoom = (room) => {
    setViewingRoom(room);
    setShowViewRoomPanel(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  // Show access denied message if user is not admin
  if (user.isNotAdmin || (user.role && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">
            You need administrator privileges to access this dashboard.
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
    { id: 'students', label: 'User Management', icon: Users },
    { id: 'rooms-allocations', label: 'Rooms & Allocations', icon: Building2 },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'leave', label: 'Leave Requests', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Total Students</h3>
              <p className="text-2xl font-bold text-slate-900">{dashboardStats.totalStudents?.toLocaleString() || 0}</p>
              <p className="text-sm text-slate-600">Registered users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Total Rooms</h3>
              <p className="text-2xl font-bold text-slate-900">{rooms.length || 0}</p>
              <p className="text-sm text-slate-600">Available rooms</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Total Revenue</h3>
              <p className="text-2xl font-bold text-slate-900">${dashboardStats.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-sm text-slate-600">All time earnings</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Pending Issues</h3>
              <p className="text-2xl font-bold text-slate-900">{dashboardStats.pendingComplaints || 0}</p>
              <p className="text-sm text-slate-600">Need attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Occupancy Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{dashboardStats.totalCapacity || 0}</div>
            <div className="text-slate-600">Total Capacity</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{dashboardStats.totalOccupancy || 0}</div>
            <div className="text-slate-600">Current Occupancy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{dashboardStats.occupancyRate || 0}%</div>
            <div className="text-slate-600">Occupancy Rate</div>
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
          {complaints.slice(0, 5).map((complaint) => (
            <div key={complaint.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                complaint.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                complaint.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                'bg-yellow-100 text-yellow-600'
              }`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{complaint.title}</p>
                <p className="text-sm text-slate-600">
                  By {complaint.users?.full_name} • {complaint.priority} priority
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {complaint.status.replace('_', ' ')}
              </div>
            </div>
          ))}
          
          {complaints.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No recent activity</p>
              <p className="text-sm text-slate-400 mt-1">Recent system activities will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRoomsAllocations = () => (
    <div className="space-y-8">
      {/* Header with Add Room Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rooms & Allocations Dashboard</h2>
          <p className="text-slate-600">Manage rooms, requests, and allocations</p>
        </div>
        <button
          onClick={() => {
            setShowAddRoomForm(true);
            setShowEditRoomForm(false);
            setEditingRoom(null);
            setRoomFormData({
              room_number: '',
              floor: '',
              room_type: 'standard',
              capacity: '',
              price: '',
              amenities: []
            });
            setRoomFormErrors({});
          }}
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
        
        {/* Inline Add Room Form */}
        {showAddRoomForm && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-amber-800">Add New Room</h4>
          <button 
                onClick={() => setShowAddRoomForm(false)}
                className="text-amber-600 hover:text-amber-700 transition-colors"
          >
                <X className="w-5 h-5" />
          </button>
        </div>
            
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    name="room_number"
                    value={roomFormData.room_number}
                    onChange={handleRoomFormChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      roomFormErrors.room_number 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                        : roomFormData.room_number && !roomFormErrors.room_number
                        ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                    }`}
                    placeholder="e.g., 101, A-205"
                  />
                  {roomFormErrors.room_number && (
                    <p className="mt-1 text-sm text-red-600">{roomFormErrors.room_number}</p>
                  )}
      </div>
      
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Floor
                  </label>
                  <input
                    type="number"
                    name="floor"
                    value={roomFormData.floor}
                    onChange={handleRoomFormChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      roomFormErrors.floor 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                        : roomFormData.floor && !roomFormErrors.floor
                        ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                    }`}
                    placeholder="e.g., 1, 2, 3"
                    min="0"
                  />
                  {roomFormErrors.floor && (
                    <p className="mt-1 text-sm text-red-600">{roomFormErrors.floor}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Room Type
                  </label>
                  <select
                    name="room_type"
                    value={roomFormData.room_type}
                    onChange={handleRoomFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="premium">Premium</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={roomFormData.capacity}
                    onChange={handleRoomFormChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      roomFormErrors.capacity 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                        : roomFormData.capacity && !roomFormErrors.capacity
                        ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                    }`}
                    placeholder="e.g., 2, 4"
                    min="1"
                  />
                  {roomFormErrors.capacity && (
                    <p className="mt-1 text-sm text-red-600">{roomFormErrors.capacity}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price per Month ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={roomFormData.price}
                    onChange={handleRoomFormChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      roomFormErrors.price 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                        : roomFormData.price && !roomFormErrors.price
                        ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                    }`}
                    placeholder="e.g., 500, 750"
                    min="0"
                    step="0.01"
                  />
                  {roomFormErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{roomFormErrors.price}</p>
                  )}
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                      isFormValid() 
                        ? 'bg-amber-600 text-white hover:bg-amber-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={isSubmittingRoom || !isFormValid()}
                  >
                    {isSubmittingRoom ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        {isFormValid() ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Add Room
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Complete Required Fields
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['WiFi', 'Air Conditioning', 'Heating', 'Private Bathroom', 'Shared Bathroom', 'Kitchen', 'Laundry', 'Balcony'].map((amenity) => (
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
            </form>
          </div>
        )}
        
        {/* Inline Edit Room Form */}
        {showEditRoomForm && editingRoom && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-blue-800">Edit Room - {editingRoom.room_number}</h4>
              <button
                onClick={() => {
                  setShowEditRoomForm(false);
                  setEditingRoom(null);
                }}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    name="room_number"
                    value={roomFormData.room_number}
                    onChange={handleRoomFormChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      roomFormErrors.room_number 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                        : roomFormData.room_number && !roomFormErrors.room_number
                        ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., 101, A-205"
                  />
                  {roomFormErrors.room_number && (
                    <p className="mt-1 text-sm text-red-600">{roomFormErrors.room_number}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Floor
                  </label>
                  <input
                    type="number"
                    name="floor"
                    value={roomFormData.floor}
                    onChange={handleRoomFormChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      roomFormErrors.floor 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                        : roomFormData.floor && !roomFormErrors.floor
                        ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., 1, 2, 3"
                    min="0"
                  />
                  {roomFormErrors.floor && (
                    <p className="mt-1 text-sm text-red-600">{roomFormErrors.floor}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Room Type
                  </label>
                  <select
                    name="room_type"
                    value={roomFormData.room_type}
                    onChange={handleRoomFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="premium">Premium</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={roomFormData.capacity}
                    onChange={handleRoomFormChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      roomFormErrors.capacity 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                        : roomFormData.capacity && !roomFormErrors.capacity
                        ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., 2, 4"
                    min="1"
                  />
                  {roomFormErrors.capacity && (
                    <p className="mt-1 text-sm text-red-600">{roomFormErrors.capacity}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price per Month ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={roomFormData.price}
                    onChange={handleRoomFormChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      roomFormErrors.price 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                        : roomFormData.price && !roomFormErrors.price
                        ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., 500, 750"
                    min="0"
                    step="0.01"
                  />
                  {roomFormErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{roomFormErrors.price}</p>
                  )}
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                      isFormValid() 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={isSubmittingRoom || !isFormValid()}
                  >
                    {isSubmittingRoom ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        {isFormValid() ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Update Room
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Complete Required Fields
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['WiFi', 'Air Conditioning', 'Heating', 'Private Bathroom', 'Shared Bathroom', 'Kitchen', 'Laundry', 'Balcony'].map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roomFormData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>
        )}
        
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
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="group relative inline-flex items-center justify-center w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-all duration-200 hover:scale-105"
                        title="Edit Room"
                      >
                        <Edit className="w-4 h-4" />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Edit Room
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleToggleRoomAvailability(room)}
                        className={`group relative inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-105 ${
                          room.status === 'available' 
                            ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700' 
                            : 'bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700'
                        }`}
                        title={room.status === 'available' ? 'Mark as Maintenance' : 'Mark as Available'}
                      >
                        {room.status === 'available' ? (
                          <Settings className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          {room.status === 'available' ? 'Mark as Maintenance' : 'Mark as Available'}
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleViewRoom(room)}
                        className="group relative inline-flex items-center justify-center w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-700 rounded-lg transition-all duration-200 hover:scale-105">
                        <Eye className="w-4 h-4" />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          View Details
                        </div>
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
                        <p className="text-sm font-medium text-slate-900">
                          {request.users?.full_name || request.user?.full_name || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {request.users?.email || request.user?.email || ''}
                        </p>
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
                      {(request.status === 'pending' || request.status === 'waitlisted') && (
                        <button 
                          onClick={() => handleCancelRequest(request)}
                          className="group relative inline-flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Cancel Request"
                        >
                          <Trash2 className="w-4 h-4" />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Cancel Request
                          </div>
                        </button>
                      )}
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
                        <Trash2 className="w-4 h-4" />
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

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Payment Management</h2>
        <div className="flex items-center space-x-4">
          <select
            value={paymentsStatusFilter}
            onChange={(e) => setPaymentsStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paid Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{payment.user?.full_name || 'N/A'}</p>
                        <p className="text-sm text-slate-500">{payment.month_year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{payment.due_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{payment.paid_date || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-amber-600 hover:text-amber-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.status === 'pending' && (
                        <button
                          onClick={async () => {
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              if (!session) return;
                              const res = await fetch(`http://localhost:3002/api/admin/payments/${payment.id}/mark-paid`, {
                                method: 'PUT',
                                headers: {
                                  'Authorization': `Bearer ${session.access_token}`,
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ payment_method: 'card' })
                              });
                              if (res.ok) {
                                fetchPayments();
                                fetchDashboardStats();
                                alert('Payment marked as paid');
                              } else {
                                const err = await res.json();
                                alert(err.message || 'Failed to mark as paid');
                              }
                            } catch (e) {
                              console.error(e);
                              alert('Failed to mark as paid');
                            }
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
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

  const handleUpdateLeaveStatus = async (requestId, status, notes = '') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/admin/leave-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        fetchLeaveRequests();
        alert(`Leave request ${status}`);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to update leave request');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update leave request');
    }
  };

  const renderLeaveRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Leave Requests</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by reason or student..."
              value={leaveSearch}
              onChange={(e) => setLeaveSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <select
            value={leaveStatusFilter}
            onChange={(e) => setLeaveStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leaveRequests
                .filter((r) => {
                  const q = leaveSearch.trim().toLowerCase();
                  if (!q) return true;
                  const student = r.users?.full_name?.toLowerCase() || '';
                  const email = r.users?.email?.toLowerCase() || '';
                  return r.reason.toLowerCase().includes(q) || student.includes(q) || email.includes(q);
                })
                .map((request) => (
                <tr key={request.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{request.users?.full_name || 'N/A'}</p>
                        <p className="text-sm text-slate-500">{request.users?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{request.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{request.start_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{request.end_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateLeaveStatus(request.id, 'approved')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateLeaveStatus(request.id, 'rejected')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="text-amber-600 hover:text-amber-700">
                        <Eye className="w-4 h-4" />
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
        <h2 className="text-xl font-semibold text-slate-800">User Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={studentsSearch}
              onChange={(e) => setStudentsSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.role === 'student').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Home className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{rooms.filter(r => r.status === 'available').length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hostel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getUserAvatarUrl(student.user_profiles || student) ? (
                        <img
                          src={getUserAvatarUrl(student.user_profiles || student)}
                          alt={student.full_name}
                          className="w-10 h-10 rounded-full object-cover mr-3 border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        student.role === 'admin' ? 'bg-red-100 text-red-600' :
                        student.role === 'student' ? 'bg-blue-100 text-blue-600' :
                        student.role === 'warden' ? 'bg-green-100 text-green-600' :
                        student.role === 'parent' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <User className="w-5 h-5" />
                      </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{student.full_name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                        {/* Profile summary */}
                        {(student.user_profiles?.admission_number || student.user_profiles?.course) && (
                          <div className="mt-1 text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                            {student.user_profiles?.admission_number && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                ID: {student.user_profiles.admission_number}
                              </span>
                            )}
                            {student.user_profiles?.course && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                {student.user_profiles.course}
                                {student.user_profiles?.batch_year ? ` • ${student.user_profiles.batch_year}` : ''}
                              </span>
                            )}
                            {student.user_profiles?.status && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                {student.user_profiles.status}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.role === 'admin' ? 'bg-red-100 text-red-800' :
                      student.role === 'student' ? 'bg-blue-100 text-blue-800' :
                      student.role === 'warden' ? 'bg-green-100 text-green-800' :
                      student.role === 'parent' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {student.role?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.status === 'available' ? 'bg-green-100 text-green-800' :
                      student.status === 'unavailable' ? 'bg-yellow-100 text-yellow-800' :
                      student.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      student.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status || 'available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.roomNumber && student.roomNumber !== 'Not Assigned' ? (
                      <div>
                        <p className="text-sm font-medium text-slate-900">Room {student.roomNumber}</p>
                        <p className="text-sm text-slate-500">Floor {student.rooms?.floor || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{student.rooms?.room_type || 'Standard'}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">No room assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {student.hostelName && student.hostelName !== 'Not Assigned' ? student.hostelName : 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => fetchUserDetails(student.id)}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateUserStatus(student.id, student.status === 'available' ? 'unavailable' : 'available')}
                        disabled={isUpdatingStatus}
                        className={`p-1 rounded text-xs font-medium ${
                          student.status === 'available' 
                            ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                        title={student.status === 'available' ? 'Mark Unavailable' : 'Mark Available'}
                      >
                        {isUpdatingStatus ? '...' : (student.status === 'available' ? 'Suspend' : 'Activate')}
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

  const renderComplaints = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Complaint Management</h2>
        <div className="flex items-center space-x-4">
          <select
            value={adminComplaintStatusFilter}
            onChange={(e) => setAdminComplaintStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{complaint.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.priority}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    complaint.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                    complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-600 mb-3">{complaint.description}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>By: {complaint.users?.full_name}</span>
                  <span>Room: {complaint.rooms?.room_number || 'N/A'}</span>
                  <span>Created: {new Date(complaint.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {complaint.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateComplaintStatus(complaint.id, 'in_progress')}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Start
                  </button>
                )}
                {complaint.status === 'in_progress' && (
                  <button 
                    onClick={() => handleUpdateComplaintStatus(complaint.id, 'resolved', 'Issue resolved by admin')}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Resolve
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
      </div>
    </div>
  );

  const renderAnalytics = () => {
    // Helpers to aggregate analytics data
    const monthKey = (d) => {
      const date = new Date(d);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };
    const lastNMonths = (n) => {
      const arr = [];
      const now = new Date();
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        arr.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: d.toLocaleString('en-US', { month: 'short' })
        });
      }
      return arr;
    };

    const months = lastNMonths(6);
    const registrationsByMonth = (() => {
      const counts = Object.fromEntries(months.map(m => [m.key, 0]));
      (analytics?.monthlyRegistrations || []).forEach(({ created_at }) => {
        const k = monthKey(created_at);
        if (k in counts) counts[k] += 1;
      });
      return months.map(m => ({ label: m.label, value: counts[m.key] }));
    })();

    const revenueByMonth = (() => {
      const sums = Object.fromEntries(months.map(m => [m.key, 0]));
      (analytics?.monthlyRevenue || []).forEach(({ paid_date, amount }) => {
        const k = monthKey(paid_date);
        if (k in sums) sums[k] += Number(amount || 0);
      });
      return months.map(m => ({ label: m.label, value: sums[m.key] }));
    })();

    const complaintsByCategory = (() => {
      const counts = {};
      (analytics?.complaintsByCategory || []).forEach(({ category }) => {
        counts[category] = (counts[category] || 0) + 1;
      });
      const entries = Object.entries(counts).map(([label, value]) => ({ label, value }));
      return entries.length > 0 ? entries : [
        { label: 'general', value: 0 },
        { label: 'maintenance', value: 0 },
        { label: 'security', value: 0 },
      ];
    })();

    const BarChart = ({ data, height = 220, valuePrefix = '' }) => {
      const margin = { top: 10, right: 6, bottom: 18, left: 18 };
      const innerH = height - margin.top - margin.bottom;
      const width = 100; // viewBox width
      const innerW = width - margin.left - margin.right;
      const maxVal = Math.max(1, ...data.map(d => d.value));
      const niceMax = Math.ceil(maxVal / 5) * 5 || 1;
      const barW = innerW / Math.max(1, data.length);
      const yScale = (v) => innerH - (v / niceMax) * innerH;

      const ticks = Array.from({ length: 5 }, (_, i) => Math.round((niceMax / 4) * i));

      return (
        <div className="w-full" style={{ height }}>
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
            {/* Grid lines */}
            <g transform={`translate(${margin.left},${margin.top})`}>
              {ticks.map((t, i) => (
                <g key={i}>
                  <line x1={0} x2={innerW} y1={yScale(t)} y2={yScale(t)} stroke="#e2e8f0" strokeWidth="0.5" />
                  <text x={-2} y={yScale(t) + 3} fontSize="4" textAnchor="end" fill="#94a3b8">{valuePrefix}{t}</text>
                </g>
              ))}
              {data.map((d, i) => {
                const x = i * barW + barW * 0.15;
                const w = barW * 0.7;
                const h = innerH - yScale(d.value);
                const y = yScale(d.value);
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={w} height={h} fill="#f59e0b" rx="2">
                      <title>{`${d.label}: ${valuePrefix}${d.value}`}</title>
                    </rect>
                    <text x={x + w / 2} y={innerH + 12} fontSize="4" textAnchor="middle" fill="#64748b">{d.label}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      );
    };

    const LineChart = ({ data, height = 220, valuePrefix = '' }) => {
      const margin = { top: 12, right: 6, bottom: 18, left: 18 };
      const width = 100;
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;
      const maxVal = Math.max(1, ...data.map(d => d.value));
      const niceMax = Math.ceil(maxVal / 5) * 5 || 1;
      const stepX = innerW / Math.max(1, data.length - 1);
      const yScale = (v) => innerH - (v / niceMax) * innerH;
      const xScale = (i) => i * stepX;
      const ticks = Array.from({ length: 5 }, (_, i) => Math.round((niceMax / 4) * i));
      const points = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(' ');

      return (
        <div className="w-full" style={{ height }}>
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
            <g transform={`translate(${margin.left},${margin.top})`}>
              {ticks.map((t, i) => (
                <g key={i}>
                  <line x1={0} x2={innerW} y1={yScale(t)} y2={yScale(t)} stroke="#e2e8f0" strokeWidth="0.5" />
                  <text x={-2} y={yScale(t) + 3} fontSize="4" textAnchor="end" fill="#94a3b8">{valuePrefix}{t}</text>
                </g>
              ))}
              <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points={points} />
              {data.map((d, i) => (
                <g key={i}>
                  <circle cx={xScale(i)} cy={yScale(d.value)} r={1.3} fill="#f59e0b">
                    <title>{`${d.label}: ${valuePrefix}${d.value}`}</title>
                  </circle>
                  <text x={xScale(i)} y={innerH + 12} fontSize="4" textAnchor="middle" fill="#64748b">{d.label}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-800">Analytics & Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">New Registrations (6 mo)</h3>
                <p className="text-2xl font-bold text-slate-900">{registrationsByMonth.reduce((a,b)=>a+b.value,0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Revenue (6 mo)</h3>
                <p className="text-2xl font-bold text-slate-900">${revenueByMonth.reduce((a,b)=>a+b.value,0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Active Students</h3>
                <p className="text-2xl font-bold text-slate-900">{Math.floor((dashboardStats.totalStudents || 0) * 0.95)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Registrations</h3>
            <BarChart data={registrationsByMonth} />
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Revenue</h3>
            <LineChart data={revenueByMonth} valuePrefix="$" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Complaints by Category (30 days)</h3>
          <BarChart data={complaintsByCategory} />
        </div>
      </div>
    );
  };

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

  const RoomModal = () => {
    const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
      resolver: zodResolver(roomSchema),
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
                  {...register('room_number')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.room_number ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                  placeholder="101"
                />
                {errors.room_number && <p className="mt-1 text-sm text-red-600">{errors.room_number.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Floor *</label>
                <input
                  type="number"
                  {...register('floor')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.floor ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                  min="0"
                />
                {errors.floor && <p className="mt-1 text-sm text-red-600">{errors.floor.message}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
              <select
                {...register('room_type')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.room_type ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
              >
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
              </select>
              {errors.room_type && <p className="mt-1 text-sm text-red-600">{errors.room_type.message}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                <select
                  {...register('capacity')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.capacity ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 Persons</option>
                  <option value="3">3 Persons</option>
                  <option value="4">4 Persons</option>
                </select>
                {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Price *</label>
                <input
                  type="number"
                  {...register('price')}
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



  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'students':
        return renderStudents();
      case 'rooms-allocations':
        return renderRoomsAllocations();
      case 'complaints':
        return renderComplaints();
      case 'leave':
        return renderLeaveRequests();
      case 'payments':
        return renderPayments();
      case 'analytics':
        return renderAnalytics();
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
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">HostelHaven</span>
              <div className="text-xs text-slate-500">Admin Portal</div>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-amber-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{user.fullName}</p>
              <p className="text-sm text-slate-500">Administrator</p>
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
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-red-50 hover:text-red-700'
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
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Admin Dashboard'}
              </h1>
              <p className="text-slate-600">Manage the entire hostel system</p>
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
      <RoomModal />

      {/* View Room Slide-over */}
      {showViewRoomPanel && viewingRoom && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => { setShowViewRoomPanel(false); setViewingRoom(null); }}
          />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[28rem] bg-white shadow-2xl border-l border-amber-100 flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Room Details - {viewingRoom.room_number}</h3>
              <button
                onClick={() => { setShowViewRoomPanel(false); setViewingRoom(null); }}
                className="text-slate-500 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Room Number</p>
                  <p className="text-slate-800 font-medium">{viewingRoom.room_number || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Floor</p>
                  <p className="text-slate-800 font-medium">{viewingRoom.floor ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Type</p>
                  <p className="text-slate-800 font-medium capitalize">{viewingRoom.room_type || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                    viewingRoom.status === 'available' ? 'bg-green-100 text-green-800' :
                    viewingRoom.status === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                    viewingRoom.status === 'occupied' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {viewingRoom.status || 'unknown'}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Capacity</p>
                  <p className="text-slate-800 font-medium">{viewingRoom.capacity ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Occupied</p>
                  <p className="text-slate-800 font-medium">{viewingRoom.occupied ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
                  <p className="text-slate-800 font-medium">{viewingRoom.price ? `$${viewingRoom.price}/month` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Available Spots</p>
                  <p className="text-slate-800 font-medium">{Math.max(0, (viewingRoom.capacity || 0) - (viewingRoom.occupied || 0))}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Amenities</p>
                {Array.isArray(viewingRoom.amenities) && viewingRoom.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {viewingRoom.amenities.map((a) => (
                      <span key={a} className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No amenities listed</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Notes</p>
                <p className="text-slate-700 text-sm">This panel shows the latest information fetched from the database. Use Edit to modify details or the status toggle to mark availability.</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => { setShowViewRoomPanel(false); setViewingRoom(null); }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* User Details Modal */}
      {showUserModal && viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-slate-800">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  {getUserAvatarUrl(viewingUser.user_profiles || viewingUser) ? (
                    <img
                      src={getUserAvatarUrl(viewingUser.user_profiles || viewingUser)}
                      alt={viewingUser.full_name}
                      className="w-20 h-20 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      viewingUser.role === 'admin' ? 'bg-red-100 text-red-600' :
                      viewingUser.role === 'student' ? 'bg-blue-100 text-blue-600' :
                      viewingUser.role === 'warden' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <User className="w-10 h-10" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-semibold text-slate-800">{viewingUser.full_name}</h4>
                    <p className="text-slate-600">{viewingUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                        viewingUser.role === 'student' ? 'bg-blue-100 text-blue-800' :
                        viewingUser.role === 'warden' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingUser.role?.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingUser.status === 'available' ? 'bg-green-100 text-green-800' :
                        viewingUser.status === 'unavailable' ? 'bg-yellow-100 text-yellow-800' :
                        viewingUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingUser.status || 'available'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-slate-800">Profile Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Admission Number</label>
                      <p className="text-slate-900">{viewingUser.user_profiles?.admission_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Course</label>
                      <p className="text-slate-900">{viewingUser.user_profiles?.course || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Batch Year</label>
                      <p className="text-slate-900">{viewingUser.user_profiles?.batch_year || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Date of Birth</label>
                      <p className="text-slate-900">
                        {viewingUser.user_profiles?.date_of_birth 
                          ? new Date(viewingUser.user_profiles.date_of_birth).toLocaleDateString() 
                          : 'Not provided'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Gender</label>
                      <p className="text-slate-900 capitalize">{viewingUser.user_profiles?.gender || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Blood Group</label>
                      <p className="text-slate-900">{viewingUser.user_profiles?.blood_group || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-slate-800">Contact Information</h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900">{viewingUser.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900">{viewingUser.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-slate-900">{viewingUser.user_profiles?.address || 'Not provided'}</p>
                        {(viewingUser.user_profiles?.city || viewingUser.user_profiles?.state || viewingUser.user_profiles?.country) && (
                          <p className="text-slate-600 text-sm">
                            {[viewingUser.user_profiles?.city, viewingUser.user_profiles?.state, viewingUser.user_profiles?.country]
                              .filter(Boolean)
                              .join(', ') || 'Not provided'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room & Hostel Info */}
              <div className="space-y-6">
                {/* Room Assignment */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h5 className="text-lg font-medium text-slate-800 mb-4">Room Assignment</h5>
                  {viewingUser.rooms ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Room Number</span>
                        <span className="font-medium">Room {viewingUser.rooms.room_number || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Floor</span>
                        <span className="font-medium">{viewingUser.rooms.floor || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Type</span>
                        <span className="font-medium capitalize">{viewingUser.rooms.room_type || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Capacity</span>
                        <span className="font-medium">{viewingUser.rooms.capacity || 'N/A'} students</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 mx-auto mb-3 bg-slate-200 rounded-full flex items-center justify-center">
                        <Home className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No room assigned</p>
                      <p className="text-slate-400 text-sm">This user hasn't been assigned to any room yet</p>
                    </div>
                  )}
                </div>

                {/* Hostel Information */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h5 className="text-lg font-medium text-slate-800 mb-4">Hostel Information</h5>
                  {viewingUser.hostels ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Hostel Name</span>
                        <span className="font-medium">{viewingUser.hostels.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-slate-600">Address</span>
                        <span className="font-medium text-right">{viewingUser.hostels.address || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">City</span>
                        <span className="font-medium">{viewingUser.hostels.city || 'Not provided'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 mx-auto mb-3 bg-slate-200 rounded-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No hostel assigned</p>
                      <p className="text-slate-400 text-sm">This user hasn't been assigned to any hostel yet</p>
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h5 className="text-lg font-medium text-slate-800 mb-4">Emergency Contact</h5>
                  {viewingUser.user_profiles?.emergency_contact_name ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Name</span>
                        <span className="font-medium">{viewingUser.user_profiles.emergency_contact_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Phone</span>
                        <span className="font-medium">{viewingUser.user_profiles.emergency_contact_phone || 'Not provided'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 mx-auto mb-3 bg-slate-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No emergency contact</p>
                      <p className="text-slate-400 text-sm">Emergency contact information not provided</p>
                    </div>
                  )}
                </div>

                {/* Status Actions */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h5 className="text-lg font-medium text-slate-800 mb-4">Status Management</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Current Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingUser.status === 'available' ? 'bg-green-100 text-green-800' :
                        viewingUser.status === 'unavailable' ? 'bg-yellow-100 text-yellow-800' :
                        viewingUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingUser.status || 'available'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateUserStatus(viewingUser.id, 'available')}
                        disabled={isUpdatingStatus || viewingUser.status === 'available'}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Mark Available
                      </button>
                      <button
                        onClick={() => updateUserStatus(viewingUser.id, 'unavailable')}
                        disabled={isUpdatingStatus || viewingUser.status === 'unavailable'}
                        className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Mark Unavailable
                      </button>
                      <button
                        onClick={() => updateUserStatus(viewingUser.id, 'suspended')}
                        disabled={isUpdatingStatus || viewingUser.status === 'suspended'}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Suspend
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Allocation Modal */}
      {showRoomAllocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowRoomAllocationModal(false);
                setRequestToAllocate(null);
                setSelectedRoomId('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-4 pr-8">Allocate Room</h3>
            
            {requestToAllocate && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">Student Request Details</h4>
                <p className="text-sm text-slate-600">
                  <strong>Student:</strong> {requestToAllocate.users?.full_name || requestToAllocate.user?.full_name || 'N/A'}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Email:</strong> {requestToAllocate.users?.email || requestToAllocate.user?.email || 'N/A'}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Preferred Type:</strong> {requestToAllocate.preferred_room_type || 'Any'}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Preferred Floor:</strong> {requestToAllocate.preferred_floor || 'Any'}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Available Room
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Choose a room...</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} - Floor {room.floor} - {room.room_type} - ${room.price}/month
                      {room.amenities && room.amenities.length > 0 && ` (${room.amenities.join(', ')})`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoomId && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2">Selected Room Details</h5>
                  {(() => {
                    const selectedRoom = availableRooms.find(room => room.id === selectedRoomId);
                    return selectedRoom ? (
                      <div className="space-y-1 text-sm text-green-700">
                        <p><strong>Room Number:</strong> {selectedRoom.room_number}</p>
                        <p><strong>Floor:</strong> {selectedRoom.floor}</p>
                        <p><strong>Type:</strong> {selectedRoom.room_type}</p>
                        <p><strong>Capacity:</strong> {selectedRoom.capacity} students</p>
                        <p><strong>Occupied:</strong> {selectedRoom.occupied} students</p>
                        <p><strong>Available Spots:</strong> {selectedRoom.capacity - selectedRoom.occupied}</p>
                        <p><strong>Price:</strong> ${selectedRoom.price}/month</p>
                        {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                          <p><strong>Amenities:</strong> {selectedRoom.amenities.join(', ')}</p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                onClick={() => {
                  setShowRoomAllocationModal(false);
                  setRequestToAllocate(null);
                  setSelectedRoomId('');
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocateRoom}
                disabled={!selectedRoomId}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Allocate Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
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
                        handleCancelRequest(selectedRequest);
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
      )}
    </div>
  );
};

export default AdminDashboard;