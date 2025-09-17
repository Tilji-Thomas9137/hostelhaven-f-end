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
  X,
  Star
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
  const [hostels, setHostels] = useState([]);
  const [hostelRooms, setHostelRooms] = useState([]);
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [hostelFormData, setHostelFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contact_phone: '',
    contact_email: '',
    capacity: '',
    amenities: [],
    rules: [],
    roomTypes: [
      {
        type: 'standard',
        name: 'Standard',
        capacity: 1,
        rentAmount: 0,
        amenities: []
      },
      {
        type: 'deluxe',
        name: 'Deluxe',
        capacity: 2,
        rentAmount: 0,
        amenities: []
      },
      {
        type: 'premium',
        name: 'Premium',
        capacity: 2,
        rentAmount: 0,
        amenities: []
      },
      {
        type: 'suite',
        name: 'Suite',
        capacity: 4,
        rentAmount: 0,
        amenities: []
      }
    ]
  });
  const [formErrors, setFormErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [location, setLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pincodeData, setPincodeData] = useState(null);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState([
    'WiFi', 'Air Conditioning', 'Hot Water', 'Study Table', 'Wardrobe', 
    'Fan', 'Bed', 'Chair', 'Mirror', 'Power Outlets', 'Window', 'Balcony',
    'TV', 'Refrigerator', 'Microwave', 'Coffee Maker', 'Safe', 'Iron',
    'Hair Dryer', 'Towels', 'Toiletries', 'Room Service', 'Daily Cleaning'
  ]);
  const [newAmenity, setNewAmenity] = useState('');
  const [amenityPricing, setAmenityPricing] = useState({
    'WiFi': 500,
    'Air Conditioning': 1000,
    'Hot Water': 300,
    'Study Table': 200,
    'Wardrobe': 150,
    'Fan': 100,
    'Bed': 300,
    'Chair': 100,
    'Mirror': 50,
    'Power Outlets': 100,
    'Window': 200,
    'Balcony': 800,
    'TV': 400,
    'Refrigerator': 600,
    'Microwave': 300,
    'Coffee Maker': 200,
    'Safe': 150,
    'Iron': 100,
    'Hair Dryer': 100,
    'Towels': 50,
    'Toiletries': 100,
    'Room Service': 500,
    'Daily Cleaning': 300
  });
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
    room_type: '',
    capacity: '',
    price: '',
    amenities: []
  });
  const [roomFormErrors, setRoomFormErrors] = useState({});
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);
  const [selectedRoomTypeData, setSelectedRoomTypeData] = useState(null);
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
            fetchHostels();
            fetchRooms();
            fetchComplaints();
            fetchPayments();
            fetchLeaveRequests();
            fetchAnalytics();
            fetchRoomsDashboardData();
            fetchRecentActivity();
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
        console.log('Fetched rooms data:', roomsResult.data.rooms);
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
      const fieldsToValidate = ['room_number', 'room_type', 'floor', 'capacity', 'price'];
      let hasErrors = false;
      
      fieldsToValidate.forEach(field => {
        validateRoomField(field, roomFormData[field]);
        if (roomFormErrors[field] || 
            (field === 'room_number' && !roomFormData[field].trim()) || 
            (field === 'room_type' && !roomFormData[field]) ||
            (field === 'capacity' && (!roomFormData[field] || roomFormData[field] < 1)) ||
            (field === 'floor' && roomFormData[field] && (parseInt(roomFormData[field]) < 1 || parseInt(roomFormData[field]) > 8))) {
          hasErrors = true;
        }
      });
    
    if (hasErrors) return;

    setIsSubmittingRoom(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Calculate the full price before sending to API
      let calculatedPrice = null;
      if (selectedRoomTypeData) {
        const basePrice = selectedRoomTypeData.rentAmount || 0;
        const amenitiesPrice = (selectedRoomTypeData.amenities || []).reduce((total, amenity) => 
          total + (amenityPricing[amenity] || 0), 0);
        calculatedPrice = basePrice + amenitiesPrice;
        
        console.log('Room Price Calculation:', {
          roomNumber: roomFormData.room_number,
          roomType: selectedRoomTypeData.name,
          basePrice,
          amenities: selectedRoomTypeData.amenities,
          amenitiesPrice,
          totalPrice: calculatedPrice,
          amenityPricing: selectedRoomTypeData.amenities.map(amenity => ({
            amenity,
            price: amenityPricing[amenity] || 0
          }))
        });
      }

      const roomData = {
        room_number: roomFormData.room_number,
        floor: roomFormData.floor || null,
        room_type: roomFormData.room_type,
        capacity: parseInt(roomFormData.capacity),
        price: calculatedPrice || (roomFormData.price ? parseFloat(roomFormData.price) : null),
        amenities: roomFormData.amenities
      };

      console.log('Sending room data to API:', roomData);

      const response = await fetch('http://localhost:3002/api/room-allocation/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Room creation response:', responseData);
        
        setShowAddRoomForm(false);
        setRoomFormData({
          room_number: '',
          floor: '',
          room_type: '',
          capacity: '',
          price: '',
          amenities: []
        });
        setSelectedRoomTypeData(null);
        setRoomFormErrors({});
        await fetchRoomsDashboardData();
        showNotification(`Room added successfully! Price: ₹${calculatedPrice || 'N/A'}`, 'success');
      } else {
        let errorMessage = 'Failed to add room';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        showNotification(errorMessage, 'error');
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
    
    // If room_type is changed, auto-populate other fields
    if (name === 'room_type' && value) {
      const roomTypeData = availableRoomTypes.find(rt => rt.type === value);
      if (roomTypeData) {
        setSelectedRoomTypeData(roomTypeData);
        setRoomFormData(prev => ({
          ...prev,
          capacity: roomTypeData.capacity,
          price: roomTypeData.rentAmount,
          amenities: roomTypeData.amenities
        }));
      }
    }
    
    // Real-time validation
    validateRoomField(name, value);
  };

  const validateRoomField = (fieldName, value) => {
    let error = '';
    
    switch (fieldName) {
      case 'room_number':
        if (!value.trim()) {
          error = 'Room number is required';
        } else if (value.trim().length < 2) {
          error = 'Room number must be at least 2 characters';
        } else if (!/^[A-Za-z0-9\-\s]+$/.test(value.trim())) {
          error = 'Room number can only contain letters, numbers, hyphens, and spaces';
        } else {
          // Check if room number already exists
          const existingRoom = rooms.find(room => 
            room.room_number.toLowerCase() === value.trim().toLowerCase()
          );
          if (existingRoom) {
            error = 'Room number already exists. Please choose a different number.';
          }
        }
        break;
        
      case 'floor':
        if (value && (isNaN(value) || parseInt(value) < 0)) {
          error = 'Floor must be a positive number';
        } else if (value && parseInt(value) > 8) {
          error = 'Maximum 8 floors allowed';
        } else if (value && parseInt(value) === 0) {
          error = 'Floor 0 is not allowed';
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
        
      case 'room_type':
        if (!value) {
          error = 'Please select a room type';
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
    const requiredFields = ['room_number', 'room_type', 'capacity'];
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
        let errorMessage = 'Failed to update room';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        showNotification(errorMessage, 'error');
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
        let errorMessage = 'Failed to update room status';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        showNotification(errorMessage, 'error');
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
        let errorMessage = 'Failed to cancel request';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        showNotification(errorMessage, 'error');
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

      // Re-validate the request status just before allocation to avoid stale state
      try {
        const precheck = await fetch(`http://localhost:3002/api/room-allocation/requests/${requestToAllocate.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          }
        });
        if (precheck.ok) {
          const pre = await precheck.json();
          const current = pre.data?.request;
          if (!current || !['pending', 'waitlisted'].includes(current.status)) {
            showNotification(`This request cannot be approved (current status: ${current?.status || 'unknown'}).`, 'error');
            setShowRoomAllocationModal(false);
            setRequestToAllocate(null);
            setSelectedRoomId('');
            await fetchRoomsDashboardData();
            return;
          }
        }
      } catch (_) {
        // Ignore precheck errors; the server will validate again
      }

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
        let errorMessage = 'Failed to allocate room';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error allocating room:', error);
      showNotification('Failed to allocate room', 'error');
    }
  };

  // View allocation details modal state
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [activeAllocation, setActiveAllocation] = useState(null);

  const handleViewAllocation = (allocation) => {
    setActiveAllocation(allocation);
    setShowAllocationModal(true);
  };

  const handleCloseAllocationModal = () => {
    setShowAllocationModal(false);
    setActiveAllocation(null);
  };

  const handleDeallocate = async (allocation) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const confirm = window.confirm(`Deallocate room ${allocation.rooms?.room_number || ''} from ${allocation.users?.full_name || 'student'}?`);
      if (!confirm) return;

      const response = await fetch(`http://localhost:3002/api/room-allocations/${allocation.id}/deallocate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ end_date: new Date().toISOString().slice(0, 10) })
      });

      if (response.ok) {
        await fetchRoomsDashboardData();
        showNotification('Room deallocated successfully', 'success');
        setShowAllocationModal(false);
      } else {
        let msg = 'Failed to deallocate room';
        try {
          const err = await response.json();
          msg = err.message || msg;
        } catch (_) {}
        showNotification(msg, 'error');
      }
    } catch (error) {
      console.error('Error deallocating room:', error);
      showNotification('Failed to deallocate room', 'error');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams();
      params.set('limit', '20');
      params.set('role', 'student');
      if (studentsSearch.trim()) params.set('search', studentsSearch.trim());

      const response = await fetch(`http://localhost:3002/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Only students are requested from backend; no further filtering required
          const onlyStudents = (result.data.students || []).filter(user => user.role === 'student');
          setStudents(onlyStudents);
        } else {
          console.error('API Error:', result.message);
          showNotification(result.message || 'Failed to fetch users', 'error');
          setStudents([]);
        }
      } else {
        // Handle auth errors explicitly
        if (response.status === 401 || response.status === 403) {
          showNotification('Your session has expired. Please log in again.', 'error');
          setStudents([]);
          return;
        }

        let errorMessage = `Failed to fetch users`;
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error('HTTP Error:', errorData);
          } else {
            const errorText = await response.text();
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
            console.error('HTTP Error (text):', response.status, response.statusText, errorText);
          }
        } catch (e) {
          console.error('HTTP Error:', response.status, response.statusText);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        showNotification(errorMessage, 'error');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification(error?.message ? `Network error: ${error.message}` : 'Network error while fetching users', 'error');
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

  const fetchHostels = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: hostels, error } = await supabase
        .from('hostels')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching hostels:', error);
        setHostels([]);
        return;
      }

      // Parse room_types JSON data for each hostel
      const processedHostels = (hostels || []).map(hostel => {
        let roomTypes = [
          {
            type: 'standard',
            name: 'Standard',
            capacity: 1,
            rentAmount: 0,
            amenities: []
          },
          {
            type: 'deluxe',
            name: 'Deluxe',
            capacity: 2,
            rentAmount: 0,
            amenities: []
          }
        ];

        if (hostel.room_types) {
          try {
            roomTypes = JSON.parse(hostel.room_types);
          } catch (error) {
            console.warn('Error parsing room_types for hostel:', hostel.name, error);
            // Keep default roomTypes if parsing fails
          }
        }

        return {
          ...hostel,
          roomTypes
        };
      });

      setHostels(processedHostels);
      
      // Extract unique room types from all hostels
      extractRoomTypesFromHostels(processedHostels);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      setHostels([]);
    }
  };

  // Extract room types from hostels data
  const extractRoomTypesFromHostels = (hostelsData) => {
    const allRoomTypes = new Map();
    
    hostelsData.forEach(hostel => {
      if (hostel.roomTypes && Array.isArray(hostel.roomTypes)) {
        hostel.roomTypes.forEach(roomType => {
          if (roomType.name && roomType.type) {
            allRoomTypes.set(roomType.type, {
              type: roomType.type,
              name: roomType.name,
              capacity: roomType.capacity || 1,
              rentAmount: roomType.rentAmount || 0,
              amenities: roomType.amenities || []
            });
          }
        });
      }
    });
    
    setAvailableRoomTypes(Array.from(allRoomTypes.values()));
  };

  const fetchHostelRooms = async (hostelId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/admin/hostels/${hostelId}/rooms`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHostelRooms(result.data.rooms || []);
        } else {
          showNotification(result.message || 'Failed to fetch rooms', 'error');
          setHostelRooms([]);
        }
      } else {
        let errorMessage = 'Failed to fetch rooms';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        showNotification(errorMessage, 'error');
        setHostelRooms([]);
      }
    } catch (error) {
      console.error('Error fetching hostel rooms:', error);
      showNotification('Network error while fetching rooms', 'error');
      setHostelRooms([]);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      setIsLoadingActivity(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch recent activities from multiple sources
      const activities = [];

      // Recent user registrations
      const { data: recentUsers } = await supabase
        .from('users')
        .select('full_name, email, role, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentUsers) {
        recentUsers.forEach(user => {
          activities.push({
            id: `user-${user.created_at}`,
            type: 'user_registration',
            title: 'New User Registered',
            description: `${user.full_name} (${user.role}) joined the system`,
            timestamp: user.created_at,
            icon: '👤',
            color: 'blue'
          });
        });
      }

      // Recent user profile updates
      const { data: profileUpdates } = await supabase
        .from('user_profiles')
        .select('user_id, updated_at')
        .not('updated_at', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (profileUpdates) {
        for (const profile of profileUpdates) {
          const { data: user } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', profile.user_id)
            .single();
          
          activities.push({
            id: `profile-${profile.updated_at}`,
            type: 'profile_update',
            title: 'Profile Updated',
            description: `${user?.full_name || 'User'} updated their profile`,
            timestamp: profile.updated_at,
            icon: '✏️',
            color: 'purple'
          });
        }
      }

      // Recent complaints
      const { data: recentComplaints } = await supabase
        .from('complaints')
        .select('title, status, created_at, updated_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentComplaints) {
        for (const complaint of recentComplaints) {
          const { data: user } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', complaint.user_id)
            .single();
          
          activities.push({
            id: `complaint-${complaint.created_at}`,
            type: 'complaint',
            title: 'New Complaint',
            description: `${complaint.title} by ${user?.full_name || 'User'} - Status: ${complaint.status}`,
            timestamp: complaint.created_at,
            icon: '⚠️',
            color: 'red'
          });
        }
      }

      // Recent complaint updates
      const { data: complaintUpdates } = await supabase
        .from('complaints')
        .select('title, status, updated_at, user_id')
        .not('updated_at', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (complaintUpdates) {
        for (const complaint of complaintUpdates) {
          activities.push({
            id: `complaint-update-${complaint.updated_at}`,
            type: 'complaint_update',
            title: 'Complaint Updated',
            description: `${complaint.title} status changed to ${complaint.status}`,
            timestamp: complaint.updated_at,
            icon: '🔄',
            color: 'orange'
          });
        }
      }

      // Recent payments
      const { data: recentPayments } = await supabase
        .from('payments')
        .select('amount, status, created_at, updated_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentPayments) {
        for (const payment of recentPayments) {
          const { data: user } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', payment.user_id)
            .single();
          
          activities.push({
            id: `payment-${payment.created_at}`,
            type: 'payment',
            title: 'Payment Processed',
            description: `$${payment.amount} by ${user?.full_name || 'User'} - Status: ${payment.status}`,
            timestamp: payment.created_at,
            icon: '💳',
            color: 'green'
          });
        }
      }

      // Recent leave requests
      const { data: recentLeaves } = await supabase
        .from('leave_requests')
        .select('reason, status, created_at, updated_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentLeaves) {
        for (const leave of recentLeaves) {
          const { data: user } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', leave.user_id)
            .single();
          
          activities.push({
            id: `leave-${leave.created_at}`,
            type: 'leave_request',
            title: 'Leave Request',
            description: `${leave.reason} by ${user?.full_name || 'User'} - Status: ${leave.status}`,
            timestamp: leave.created_at,
            icon: '📅',
            color: 'yellow'
          });
        }
      }

      // Recent leave request updates
      const { data: leaveUpdates } = await supabase
        .from('leave_requests')
        .select('reason, status, updated_at, user_id')
        .not('updated_at', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (leaveUpdates) {
        for (const leave of leaveUpdates) {
          activities.push({
            id: `leave-update-${leave.updated_at}`,
            type: 'leave_update',
            title: 'Leave Request Updated',
            description: `${leave.reason} status changed to ${leave.status}`,
            timestamp: leave.updated_at,
            icon: '📝',
            color: 'indigo'
          });
        }
      }

      // Recent room allocations
      const { data: roomAllocations } = await supabase
        .from('room_allocations')
        .select('created_at, user_id, room_id')
        .order('created_at', { ascending: false })
        .limit(3);

      if (roomAllocations) {
        for (const allocation of roomAllocations) {
          const { data: user } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', allocation.user_id)
            .single();
          
          const { data: room } = await supabase
            .from('rooms')
            .select('room_number')
            .eq('id', allocation.room_id)
            .single();
          
          activities.push({
            id: `allocation-${allocation.created_at}`,
            type: 'room_allocation',
            title: 'Room Allocated',
            description: `${user?.full_name || 'User'} assigned to Room ${room?.room_number || 'Unknown'}`,
            timestamp: allocation.created_at,
            icon: '🏠',
            color: 'teal'
          });
        }
      }

      // Recent room requests
      const { data: roomRequests } = await supabase
        .from('room_requests')
        .select('created_at, status, user_id')
        .order('created_at', { ascending: false })
        .limit(3);

      if (roomRequests) {
        for (const request of roomRequests) {
          const { data: user } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', request.user_id)
            .single();
          
          activities.push({
            id: `room-request-${request.created_at}`,
            type: 'room_request',
            title: 'Room Request',
            description: `${user?.full_name || 'User'} requested a room - Status: ${request.status}`,
            timestamp: request.created_at,
            icon: '🔑',
            color: 'cyan'
          });
        }
      }

      // Recent notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('title, message, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(3);

      if (notifications) {
        for (const notification of notifications) {
          const { data: user } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', notification.user_id)
            .single();
          
          activities.push({
            id: `notification-${notification.created_at}`,
            type: 'notification',
            title: 'Notification Sent',
            description: `${notification.title} to ${user?.full_name || 'User'}`,
            timestamp: notification.created_at,
            icon: '🔔',
            color: 'pink'
          });
        }
      }

      // Recent hostel updates
      const { data: hostelUpdates } = await supabase
        .from('hostels')
        .select('name, updated_at')
        .not('updated_at', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (hostelUpdates) {
        for (const hostel of hostelUpdates) {
          activities.push({
            id: `hostel-update-${hostel.updated_at}`,
            type: 'hostel_update',
            title: 'Hostel Settings Updated',
            description: `Hostel information was updated`,
            timestamp: hostel.updated_at,
            icon: '🏢',
            color: 'amber'
          });
        }
      }

      // Recent room updates
      const { data: roomUpdates } = await supabase
        .from('rooms')
        .select('room_number, status, updated_at')
        .not('updated_at', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (roomUpdates) {
        for (const room of roomUpdates) {
          activities.push({
            id: `room-update-${room.updated_at}`,
            type: 'room_update',
            title: 'Room Updated',
            description: `Room ${room.room_number} status changed to ${room.status}`,
            timestamp: room.updated_at,
            icon: '🚪',
            color: 'lime'
          });
        }
      }

      // Sort by timestamp and take the most recent 15
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 15);

      setRecentActivity(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const createHostel = async (hostelData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('hostels')
        .insert([hostelData])
        .select()
        .single();

      if (error) {
        console.error('Error creating hostel:', error);
        showNotification(`Failed to create hostel: ${error.message}`, 'error');
        return;
      }

      showNotification('Hostel created successfully', 'success');
      fetchHostels();
      setShowHostelModal(false);
      setHostelFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        contact_phone: '',
        contact_email: '',
        capacity: '',
        amenities: [],
        rules: [],
        roomTypes: [
          {
            type: 'standard',
            name: 'Standard',
            capacity: 1,
            rentAmount: 0,
            amenities: []
          },
          {
            type: 'deluxe',
            name: 'Deluxe',
            capacity: 2,
            rentAmount: 0,
            amenities: []
          }
        ]
      });
    } catch (error) {
      console.error('Error creating hostel:', error);
      showNotification('Network error while creating hostel', 'error');
    }
  };

  const updateHostel = async (hostelId, hostelData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('hostels')
        .update(hostelData)
        .eq('id', hostelId)
        .select()
        .single();

      if (error) {
        console.error('Error updating hostel:', error);
        showNotification(`Failed to update hostel: ${error.message}`, 'error');
        return;
      }

      showNotification('Hostel updated successfully', 'success');
      fetchHostels();
      setShowHostelModal(false);
      setEditingHostel(null);
    } catch (error) {
      console.error('Error updating hostel:', error);
      showNotification('Network error while updating hostel', 'error');
    }
  };

  const deleteHostel = async (hostelId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('hostels')
        .delete()
        .eq('id', hostelId);

      if (error) {
        console.error('Error deleting hostel:', error);
        showNotification(`Failed to delete hostel: ${error.message}`, 'error');
        return;
      }

      showNotification('Hostel deleted successfully', 'success');
      fetchHostels();
    } catch (error) {
      console.error('Error deleting hostel:', error);
      showNotification('Network error while deleting hostel', 'error');
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
        if (response.status === 404) {
          showNotification('User not found', 'error');
        } else {
          let errorMessage = 'Failed to fetch user details';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          showNotification(errorMessage, 'error');
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
        let errorMessage = 'Failed to update user status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        showNotification(errorMessage, 'error');
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

  // Load Google Maps and auto-fetch location when modal opens
  useEffect(() => {
    if (showHostelModal) {
      loadGoogleMaps();
      // Auto-fetch location if not already available
      if (!location) {
        const timer = setTimeout(() => {
          getCurrentLocation();
        }, 1000); // Small delay to let the modal render first
        return () => clearTimeout(timer);
      }
    }
  }, [showHostelModal]);

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

      // Create room using the API endpoint
      const response = await fetch('http://localhost:3002/api/room-allocation/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_number: formData.room_number,
          floor: parseInt(formData.floor),
          room_type: formData.room_type,
          capacity: parseInt(formData.capacity),
          price: parseFloat(formData.price),
          amenities: formData.amenities || []
        })
      });

      if (response.ok) {
        setShowRoomModal(false);
        fetchRooms(); // Refresh rooms list
        fetchDashboardStats(); // Refresh stats
        showNotification('Room created successfully!', 'success');
      } else {
        const error = await response.json();
        showNotification('Failed to create room: ' + (error.message || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      showNotification('Failed to create room', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    const errors = { ...formErrors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Hostel name is required';
        } else if (value.trim().length < 3) {
          errors.name = 'Hostel name must be at least 3 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.name = 'Hostel name should only contain letters and spaces';
        } else {
          delete errors.name;
        }
        break;
        
      case 'address':
        if (!value.trim()) {
          errors.address = 'Address is required';
        } else if (value.trim().length < 10) {
          errors.address = 'Address must be at least 10 characters';
        } else if (value.trim().length > 500) {
          errors.address = 'Address must be less than 500 characters';
        } else if (!/^[a-zA-Z0-9\s,.-]+$/.test(value.trim())) {
          errors.address = 'Address contains invalid characters';
        } else {
          delete errors.address;
        }
        break;
        
      case 'city':
        if (!value.trim()) {
          errors.city = 'City is required';
        } else if (value.trim().length < 2) {
          errors.city = 'City must be at least 2 characters';
        } else {
          delete errors.city;
        }
        break;
        
      case 'state':
        if (!value.trim()) {
          errors.state = 'State is required';
        } else if (value.trim().length < 2) {
          errors.state = 'State must be at least 2 characters';
        } else {
          delete errors.state;
        }
        break;
        
      case 'pincode':
        if (!value.trim()) {
          errors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(value.trim())) {
          errors.pincode = 'Pincode must be 6 digits';
        } else {
          delete errors.pincode;
        }
        break;
        
      case 'contact_phone':
        if (value && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(value.trim())) {
          errors.contact_phone = 'Please enter a valid phone number';
        } else {
          delete errors.contact_phone;
        }
        break;
        
      case 'contact_email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.contact_email = 'Please enter a valid email address';
        } else {
          delete errors.contact_email;
        }
        break;
        
      case 'capacity':
        if (!value) {
          errors.capacity = 'Capacity is required';
        } else if (isNaN(value) || parseInt(value) < 1) {
          errors.capacity = 'Capacity must be a positive number';
        } else if (parseInt(value) > 1000) {
          errors.capacity = 'Capacity cannot exceed 1,000';
        } else {
          delete errors.capacity;
        }
        break;
        
      // duplicate 'pincode' case removed (logic handled above)
        
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForm = () => {
    const requiredFields = ['name', 'address', 'city', 'state', 'pincode', 'capacity'];
    let isValid = true;
    const newErrors = {};
    
    // Validate required fields
    requiredFields.forEach(field => {
      const value = hostelFormData[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      } else if (field === 'capacity' && (isNaN(value) || parseInt(value) <= 0)) {
        newErrors[field] = 'Capacity must be a positive number';
        isValid = false;
      } else if (field === 'pincode' && (!/^\d{6}$/.test(value))) {
        newErrors[field] = 'Pincode must be 6 digits';
        isValid = false;
      }
    });
    
    // Validate optional fields
    if (hostelFormData.contact_phone && !/^\d{10}$/.test(hostelFormData.contact_phone.replace(/\D/g, ''))) {
      newErrors.contact_phone = 'Phone number must be 10 digits';
      isValid = false;
    }
    
    if (hostelFormData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hostelFormData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };

  // Google Maps integration
  const loadGoogleMaps = () => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCoPzRJLAmma54BBOyF4AhZ2ZIqGvak8CA&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      showNotification('Fetching your location...', 'info');
      
      try {
        navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          setLocation(coords);
          setIsLoadingLocation(false);
          showNotification('Location fetched successfully!', 'success');
          
          // Also update the location field in form data if needed
          // You can use reverse geocoding here to get address from coordinates
          reverseGeocode(coords.lat, coords.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to get current location';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while retrieving location.';
              break;
          }
          
          setIsLoadingLocation(false);
          showNotification(errorMessage, 'error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
      } catch (error) {
        console.error('Geolocation error:', error);
        setIsLoadingLocation(false);
        showNotification('Location access is not available. You can manually enter the address.', 'warning');
      }
    } else {
      showNotification('Geolocation is not supported by this browser. You can manually enter the address.', 'warning');
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await response.json();
      
      if (data && data.city && data.principalSubdivision) {
        // Auto-fill city and state if they're empty
        if (!hostelFormData.city) {
          handleInputChange('city', data.city);
        }
        if (!hostelFormData.state) {
          handleInputChange('state', data.principalSubdivision);
        }
        
        // Update location with more details
        setLocation(prev => ({
          ...prev,
          address: data.locality || data.city,
          city: data.city,
          state: data.principalSubdivision,
          country: data.countryName,
          formattedAddress: data.localityInfo?.administrative?.[0]?.name || data.city
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Don't show error to user as this is optional
    }
  };

  const fetchPincodeData = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;
    
    setIsLoadingPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
        const postOffice = data[0].PostOffice[0];
        setPincodeData({
          district: postOffice.District,
          state: postOffice.State,
          country: postOffice.Country,
          region: postOffice.Region,
          division: postOffice.Division,
          block: postOffice.Block,
          taluk: postOffice.Taluk
        });
        
        // Auto-fill city and state if they're empty
        if (!hostelFormData.city) {
          handleInputChange('city', postOffice.District);
        }
        if (!hostelFormData.state) {
          handleInputChange('state', postOffice.State);
        }
        
        showNotification('Location details fetched successfully', 'success');
      } else {
        showNotification('Invalid pincode or no data found', 'error');
        setPincodeData(null);
      }
    } catch (error) {
      console.error('Error fetching pincode data:', error);
      showNotification('Failed to fetch location details', 'error');
      setPincodeData(null);
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const handleInputChange = (field, value) => {
    setHostelFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Live validation
    if (isValidating) {
      validateField(field, value);
    }
    
    // Auto-fetch pincode data when pincode is complete
    if (field === 'pincode' && value.length === 6 && /^\d{6}$/.test(value)) {
      fetchPincodeData(value);
    }
  };

  const handleRoomTypeChange = (typeIndex, field, value) => {
    setHostelFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.map((roomType, index) => 
        index === typeIndex 
          ? { ...roomType, [field]: value }
          : roomType
      )
    }));
  };

  const handleRoomTypeAmenityToggle = (typeIndex, amenity) => {
    setHostelFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.map((roomType, index) => 
        index === typeIndex 
          ? {
              ...roomType,
              amenities: roomType.amenities.includes(amenity)
                ? roomType.amenities.filter(a => a !== amenity)
                : [...roomType.amenities, amenity]
            }
          : roomType
      )
    }));
  };

  const addRoomType = () => {
    setHostelFormData(prev => ({
      ...prev,
      roomTypes: [
        ...prev.roomTypes,
        {
          type: `custom_${Date.now()}`,
          name: '',
          capacity: 1,
          totalRooms: 0,
          rentAmount: 0,
          amenities: []
        }
      ]
    }));
  };

  const removeRoomType = (typeIndex) => {
    setHostelFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, index) => index !== typeIndex)
    }));
  };

  const addNewAmenity = () => {
    if (newAmenity.trim() && !availableAmenities.includes(newAmenity.trim())) {
      setAvailableAmenities(prev => [...prev, newAmenity.trim()]);
      setAmenityPricing(prev => ({
        ...prev,
        [newAmenity.trim()]: 0
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity) => {
    setAvailableAmenities(prev => prev.filter(a => a !== amenity));
    setAmenityPricing(prev => {
      const newPricing = { ...prev };
      delete newPricing[amenity];
      return newPricing;
    });
    
    // Remove this amenity from all room types
    setHostelFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.map(roomType => ({
        ...roomType,
        amenities: roomType.amenities.filter(a => a !== amenity)
      }))
    }));
  };

  const updateAmenityPricing = (amenity, price) => {
    setAmenityPricing(prev => ({
      ...prev,
      [amenity]: parseFloat(price) || 0
    }));
  };

  const calculateRoomPrice = (roomType) => {
    const basePrice = roomType.rentAmount || 0;
    const amenityPrice = roomType.amenities.reduce((total, amenity) => {
      return total + (amenityPricing[amenity] || 0);
    }, 0);
    return basePrice + amenityPrice;
  };

  const calculateTotalPrice = () => {
    return (hostelFormData.roomTypes || []).reduce((total, roomType) => {
      return total + calculateRoomPrice(roomType);
    }, 0);
  };

  const handleHostelSubmit = async (e) => {
    e.preventDefault();
    setIsValidating(true);
    setIsSubmitting(true);
    
    // Enhanced validation
    if (!validateForm()) {
      showNotification('Please fix the form errors before submitting', 'error');
      setIsSubmitting(false);
      return;
    }

    // Additional validation for required fields
    if (!hostelFormData.name?.trim()) {
      showNotification('Hostel name is required', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!hostelFormData.address?.trim()) {
      showNotification('Address is required', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!hostelFormData.capacity || parseInt(hostelFormData.capacity) <= 0) {
      showNotification('Valid capacity is required', 'error');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showNotification('Please log in to continue', 'error');
        setIsSubmitting(false);
        return;
      }

      // Prepare hostel data matching the actual database schema
      const hostelData = {
        name: hostelFormData.name.trim(),
        address: hostelFormData.address.trim(),
        location: location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : null,
        city: hostelFormData.city?.trim() || '',
        state: hostelFormData.state?.trim() || '',
        pincode: hostelFormData.pincode?.trim() || '',
        contact_phone: hostelFormData.contact_phone?.trim() || null,
        contact_email: hostelFormData.contact_email?.trim() || null,
        capacity: parseInt(hostelFormData.capacity) || 0,
        current_occupancy: 0,
        amenities: hostelFormData.amenities || [],
        rules: hostelFormData.rules || [],
        room_types: JSON.stringify(hostelFormData.roomTypes || [])
      };

      console.log('Submitting hostel data:', hostelData);

      if (editingHostel) {
        // Update existing hostel using direct Supabase
        const { data, error } = await supabase
          .from('hostels')
          .update(hostelData)
          .eq('id', editingHostel.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating hostel:', error);
          showNotification(`Failed to update hostel: ${error.message}`, 'error');
          return;
        }

        console.log('Hostel updated successfully:', data);
        showNotification('Hostel updated successfully', 'success');
      } else {
        // Create new hostel using direct Supabase
        const { data, error } = await supabase
          .from('hostels')
          .insert([hostelData])
          .select()
          .single();

        if (error) {
          console.error('Error creating hostel:', error);
          showNotification(`Failed to create hostel: ${error.message}`, 'error');
          return;
        }

        console.log('Hostel created successfully:', data);
        showNotification('Hostel created successfully', 'success');
      }

      // Reset form and close modal
      resetHostelForm();
      setShowHostelModal(false);
      setEditingHostel(null);
      await fetchHostels();
    } catch (error) {
      console.error('Error in hostel submission:', error);
      showNotification(`An error occurred: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to reset form
  const resetHostelForm = () => {
    setHostelFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contact_phone: '',
      contact_email: '',
      capacity: '',
      amenities: [],
      rules: [],
      roomTypes: [
        {
          type: 'standard',
          name: 'Standard',
          capacity: 1,
          totalRooms: 0,
          rentAmount: 0,
          amenities: []
        },
        {
          type: 'deluxe',
          name: 'Deluxe',
          capacity: 2,
          totalRooms: 0,
          rentAmount: 0,
          amenities: []
        },
        {
          type: 'premium',
          name: 'Premium',
          capacity: 2,
          totalRooms: 0,
          rentAmount: 0,
          amenities: []
        },
        {
          type: 'suite',
          name: 'Suite',
          capacity: 4,
          totalRooms: 0,
          rentAmount: 0,
          amenities: []
        }
      ]
    });
    setFormErrors({});
    setIsValidating(false);
    setLocation(null);
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
        let errorMessage = 'Failed to update complaint';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(errorMessage);
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
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'rooms-allocations', label: 'Rooms & Allocations', icon: Building2 },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'leave', label: 'Leave Requests', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'hostel', label: 'Hostel Settings', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover-lift animate-fadeIn group" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-all duration-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">Total Students</h3>
              <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">{dashboardStats.totalStudents?.toLocaleString() || 0}</p>
              <p className="text-sm text-slate-600">Registered users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover-lift animate-fadeIn group" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-all duration-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 group-hover:text-green-600 transition-colors duration-200">Total Rooms</h3>
              <p className="text-2xl font-bold text-slate-900 group-hover:text-green-600 transition-colors duration-200">{rooms.length || 0}</p>
              <p className="text-sm text-slate-600">In this hostel</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover-lift animate-fadeIn group" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-all duration-200">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 group-hover:text-purple-600 transition-colors duration-200">Total Revenue</h3>
              <p className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors duration-200">${dashboardStats.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-sm text-slate-600">All time earnings</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover-lift animate-fadeIn group" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-all duration-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 group-hover:text-red-600 transition-colors duration-200">Pending Issues</h3>
              <p className="text-2xl font-bold text-slate-900 group-hover:text-red-600 transition-colors duration-200">{dashboardStats.pendingComplaints || 0}</p>
              <p className="text-sm text-slate-600">Need attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover-lift animate-slideUp group">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 group-hover:text-amber-600 transition-colors duration-200">Occupancy Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors duration-200">
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.totalCapacity || 0}</div>
            </div>
            <div className="text-slate-600 font-medium">Total Capacity</div>
          </div>
          <div className="text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors duration-200">
              <div className="text-2xl font-bold text-green-600">{dashboardStats.totalOccupancy || 0}</div>
            </div>
            <div className="text-slate-600 font-medium">Current Occupancy</div>
          </div>
          <div className="text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors duration-200">
              <div className="text-2xl font-bold text-purple-600">{dashboardStats.occupancyRate || 0}%</div>
            </div>
            <div className="text-slate-600 font-medium">Occupancy Rate</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover-lift animate-slideUp group" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200">Recent Activity</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchRecentActivity}
              disabled={isLoadingActivity}
              className="p-2 text-slate-400 hover:text-amber-600 transition-all duration-200 hover:bg-amber-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover-subtle"
              title="Refresh Activity"
            >
              <Activity className={`w-4 h-4 ${isLoadingActivity ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-sm text-slate-500">Last 24 hours</div>
          </div>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div 
                key={activity.id}
                className={`flex items-start space-x-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 hover-subtle animate-fadeIn group`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  activity.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  activity.color === 'red' ? 'bg-red-100 text-red-600' :
                  activity.color === 'green' ? 'bg-green-100 text-green-600' :
                  activity.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                  activity.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  activity.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                  activity.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                  activity.color === 'teal' ? 'bg-teal-100 text-teal-600' :
                  activity.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' :
                  activity.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                  activity.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                  activity.color === 'lime' ? 'bg-lime-100 text-lime-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                  <p className="text-sm text-slate-600 truncate">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 animate-pulse">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className={`w-8 h-8 text-slate-400 ${isLoadingActivity ? 'animate-spin' : ''}`} />
              </div>
              <p className="text-slate-500 font-medium">
                {isLoadingActivity ? 'Loading activities...' : 'No recent activity'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {isLoadingActivity ? 'Please wait while we fetch the latest activities' : 'Recent system activities will appear here'}
              </p>
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Add New Room</h3>
                    <p className="text-amber-100 text-sm">Create a new room with pre-configured settings</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddRoomForm(false)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddRoom} className="p-6 space-y-6">
              {/* Basic Room Information */}
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800">Basic Room Information</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Room Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="room_number"
                        value={roomFormData.room_number}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-3 pr-10 border rounded-xl focus:outline-none transition-all text-slate-700 placeholder-slate-400 ${
                          roomFormErrors.room_number 
                            ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                            : roomFormData.room_number && !roomFormErrors.room_number
                            ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                            : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                        }`}
                        placeholder="e.g., 101, A-205, 3B-12"
                      />
                      {roomFormData.room_number && !roomFormErrors.room_number && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                      {roomFormErrors.room_number && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {roomFormData.room_number && !roomFormErrors.room_number && (
                      <p className="mt-1 text-sm text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Room number is available
                      </p>
                    )}
                    {roomFormErrors.room_number && (
                      <div className="mt-1">
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {roomFormErrors.room_number}
                        </p>
                        {roomFormErrors.room_number.includes('already exists') && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium mb-2">Suggested alternatives:</p>
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                const baseNumber = roomFormData.room_number.trim();
                                const suggestions = [];
                                
                                // Try adding suffixes
                                for (let i = 1; i <= 5; i++) {
                                  suggestions.push(`${baseNumber}A`, `${baseNumber}B`, `${baseNumber}-${i}`);
                                }
                                
                                // Try variations
                                if (baseNumber.includes('-')) {
                                  const parts = baseNumber.split('-');
                                  if (parts.length === 2) {
                                    suggestions.push(`${parts[0]}${parseInt(parts[1]) + 1}`, `${parts[0]}${parseInt(parts[1]) + 2}`);
                                  }
                                }
                                
                                return suggestions.slice(0, 6).map((suggestion, index) => {
                                  const isAvailable = !rooms.find(room => 
                                    room.room_number.toLowerCase() === suggestion.toLowerCase()
                                  );
                                  return (
                                    <button
                                      key={index}
                                      type="button"
                                      onClick={() => {
                                        setRoomFormData(prev => ({ ...prev, room_number: suggestion }));
                                        validateRoomField('room_number', suggestion);
                                      }}
                                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        isAvailable 
                                          ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                                          : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
                                      }`}
                                      disabled={!isAvailable}
                                    >
                                      {suggestion} {isAvailable ? '✓' : '✗'}
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Floor (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="floor"
                        value={roomFormData.floor}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all text-slate-700 ${
                          roomFormErrors.floor 
                            ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                            : roomFormData.floor && !roomFormErrors.floor
                            ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                            : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                        }`}
                        placeholder="e.g., 1, 2, 3"
                        min="1"
                        max="8"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                        🏢
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Maximum 8 floors allowed (1-8)</p>
                    {roomFormErrors.floor && (
                      <p className="mt-1 text-sm text-red-600">{roomFormErrors.floor}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Room Type Selection */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800">Room Type Selection</h4>
                    <p className="text-sm text-slate-600">Choose from pre-configured room types with all settings</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Select Room Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="room_type"
                    value={roomFormData.room_type}
                    onChange={handleRoomFormChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all text-slate-700 ${
                      roomFormErrors.room_type 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50' 
                        : roomFormData.room_type && !roomFormErrors.room_type
                        ? 'border-green-300 focus:ring-2 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  >
                    <option value="">Choose a room type...</option>
                    {availableRoomTypes.map((roomType) => (
                      <option key={roomType.type} value={roomType.type}>
                        {roomType.name} • Capacity: {roomType.capacity} • Base Price: ₹{roomType.rentAmount?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">All room details will be auto-populated from the selected type</p>
                  {roomFormErrors.room_type && (
                    <p className="mt-1 text-sm text-red-600">{roomFormErrors.room_type}</p>
                  )}
                </div>
              </div>

              {/* Room Type Preview */}
              {selectedRoomTypeData && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Room Type Details</h4>
                      <p className="text-sm text-slate-600">Complete configuration for {selectedRoomTypeData.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pricing Information */}
                    <div className="bg-white rounded-xl p-5 border border-green-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <h5 className="font-semibold text-slate-800">Pricing Breakdown</h5>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Base Rent:</span>
                          <span className="font-semibold text-slate-800">₹{selectedRoomTypeData.rentAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Amenities:</span>
                          <span className="font-semibold text-slate-800">₹{selectedRoomTypeData.amenities?.reduce((total, amenity) => total + (amenityPricing[amenity] || 0), 0).toLocaleString()}</span>
                        </div>
                        <div className="border-t border-green-200 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-800">Total Price:</span>
                            <span className="text-2xl font-bold text-green-600">
                              ₹{(selectedRoomTypeData.rentAmount || 0) + (selectedRoomTypeData.amenities?.reduce((total, amenity) => total + (amenityPricing[amenity] || 0), 0) || 0)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 text-center mt-1">per month</p>
                        </div>
                      </div>
                    </div>

                    {/* Capacity & Features */}
                    <div className="bg-white rounded-xl p-5 border border-green-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <h5 className="font-semibold text-slate-800">Capacity & Features</h5>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Capacity:</span>
                          <span className="font-semibold text-slate-800">{selectedRoomTypeData.capacity} people</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Room Type:</span>
                          <span className="font-semibold text-slate-800">{selectedRoomTypeData.name}</span>
                        </div>
                        <div className="border-t border-green-200 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Amenities:</span>
                            <span className="font-semibold text-blue-600">{selectedRoomTypeData.amenities?.length || 0} included</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities Grid */}
                  {selectedRoomTypeData.amenities && selectedRoomTypeData.amenities.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4" />
                        </div>
                        <h5 className="font-semibold text-slate-800">Included Amenities</h5>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {selectedRoomTypeData.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-700">{amenity}</span>
                            {amenityPricing[amenity] > 0 && (
                              <span className="text-xs text-green-600 font-medium">
                                +₹{amenityPricing[amenity]}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`px-8 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 font-semibold ${
                    isSubmittingRoom 
                      ? 'bg-slate-400 text-white cursor-not-allowed' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                  }`}
                  disabled={isSubmittingRoom}
                >
                  {isSubmittingRoom ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding Room...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Add Room</span>
                    </>
                  )}
                </button>
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
                    Room Type *
                  </label>
                  <input
                    type="text"
                    name="room_type"
                    value={roomFormData.room_type}
                    onChange={handleRoomFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="e.g., Standard, Deluxe, Premium, Suite, Economy, Luxury, etc."
                  />
                  <p className="mt-1 text-xs text-slate-500">Enter any custom room type name</p>
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
                    {(() => {
                      // If room has direct price, use it
                      if (room.price) {
                        return `₹${room.price}/month`;
                      }
                      
                      // If room has room_type, calculate price from room type data
                      if (room.room_type && availableRoomTypes.length > 0) {
                        const roomTypeData = availableRoomTypes.find(rt => rt.type === room.room_type);
                        if (roomTypeData) {
                          const basePrice = roomTypeData.rentAmount || 0;
                          const amenitiesPrice = (roomTypeData.amenities || []).reduce((total, amenity) => 
                            total + (amenityPricing[amenity] || 0), 0);
                          const totalPrice = basePrice + amenitiesPrice;
                          return `₹${totalPrice.toLocaleString()}/month`;
                        }
                      }
                      
                      return 'N/A';
                    })()}
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
                      <button 
                        onClick={() => handleViewAllocation(allocation)}
                        className="group relative inline-flex items-center justify-center w-8 h-8 bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 rounded-lg transition-all duration-200 hover:scale-105"
                        title="View Allocation"
                      >
                        <Eye className="w-4 h-4" />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          View Details
                        </div>
                      </button>
                      <button 
                        onClick={() => handleDeallocate(allocation)}
                        className="group relative inline-flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 hover:scale-105"
                        title="Deallocate"
                      >
                        <Trash2 className="w-4 h-4" />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Deallocate
                        </div>
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

      {/* Allocation Details Modal */}
      {showAllocationModal && activeAllocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 relative">
            <button
              onClick={handleCloseAllocationModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-semibold text-slate-800 mb-4 pr-8">Allocation Details</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Student</h4>
                <p className="text-slate-900">{activeAllocation.users?.full_name || 'N/A'}</p>
                <p className="text-slate-600 text-sm">{activeAllocation.users?.email || ''}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1">Room</h4>
                  <p className="text-slate-900">{activeAllocation.rooms?.room_number || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1">Floor</h4>
                  <p className="text-slate-900">{activeAllocation.rooms?.floor || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1">Type</h4>
                  <p className="text-slate-900 capitalize">{activeAllocation.rooms?.room_type || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1">Allocated On</h4>
                  <p className="text-slate-900">{new Date(activeAllocation.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={handleCloseAllocationModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDeallocate(activeAllocation)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Deallocate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
                                let errorMessage = 'Failed to mark as paid';
                                try {
                                  const err = await res.json();
                                  errorMessage = err.message || errorMessage;
                                } catch (e) {
                                  errorMessage = `HTTP ${res.status}: ${res.statusText}`;
                                }
                                alert(errorMessage);
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
        let errorMessage = 'Failed to update leave request';
        try {
          const err = await response.json();
          errorMessage = err.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(errorMessage);
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
              <p className="text-sm font-medium text-gray-600">Total Users </p>
              <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.role !== 'admin').length}</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.filter((s) => s.role !== 'admin').map((student) => (
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
                    <div className="space-y-1">
                      <div className="text-sm text-slate-900 font-medium">
                        {student.user_profiles?.course || 'Course N/A'}
                      </div>
                      <div className="text-xs text-slate-600">
                        {student.user_profiles?.batch_year ? `Batch ${student.user_profiles.batch_year}` : 'Batch N/A'}
                      </div>
                      <div className="text-xs text-slate-600">
                        ID: {student.user_profiles?.admission_number || 'N/A'}
                      </div>
                      {student.user_profiles?.status && (
                        <div className="text-xs">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            {student.user_profiles.status}
                          </span>
                        </div>
                      )}
                    </div>
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
                        onClick={() => updateUserStatus(student.id, student.status === 'available' ? 'suspended' : 'available')}
                        disabled={isUpdatingStatus}
                        className={`p-1 rounded text-xs font-medium ${
                          student.status === 'available' 
                            ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                        title={student.status === 'available' ? 'Suspend User' : 'Activate User'}
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

  const renderHostelSettings = () => {
    const currentHostel = hostels.length > 0 ? hostels[0] : null;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-800">Hostel Settings</h2>
          <button
            onClick={() => {
              setEditingHostel(currentHostel);
              setHostelFormData({
                name: currentHostel?.name || '',
                address: currentHostel?.address || '',
                city: currentHostel?.city || '',
                state: currentHostel?.state || '',
                pincode: currentHostel?.pincode || '',
                contact_phone: currentHostel?.contact_phone || '',
                contact_email: currentHostel?.contact_email || '',
                capacity: currentHostel?.capacity || '',
                amenities: currentHostel?.amenities || [],
                rules: currentHostel?.rules || [],
                roomTypes: currentHostel?.roomTypes || [
                  {
                    type: 'standard',
                    name: 'Standard',
                    capacity: 1,
                    rentAmount: 0,
                    amenities: []
                  },
                  {
                    type: 'deluxe',
                    name: 'Deluxe',
                    capacity: 2,
                    rentAmount: 0,
                    amenities: []
                  },
                  {
                    type: 'premium',
                    name: 'Premium',
                    capacity: 2,
                    rentAmount: 0,
                    amenities: []
                  },
                  {
                    type: 'suite',
                    name: 'Suite',
                    capacity: 4,
                    rentAmount: 0,
                    amenities: []
                  }
                ]
              });
              setFormErrors({});
              setIsValidating(false);
              setLocation(currentHostel?.location?.lat && currentHostel?.location?.lng ? {
                lat: currentHostel.location.lat,
                lng: currentHostel.location.lng
              } : null);
              setShowHostelModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Settings className="w-5 h-5" />
            <span>{currentHostel ? 'Update Settings' : 'Add Hostel Information'}</span>
          </button>
        </div>

        {/* Hostel Overview */}
        {currentHostel ? (
          <div className="grid grid-cols-1 xl:grid-cols-5 lg:grid-cols-4 gap-6">
            {/* Main Hostel Info */}
            <div className="xl:col-span-3 lg:col-span-3 bg-white rounded-2xl shadow-lg border border-amber-100 p-6 animate-fadeInUp">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{currentHostel.name}</h3>
                  <p className="text-slate-600">{currentHostel.address}, {currentHostel.city}, {currentHostel.state} {currentHostel.pincode}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center animate-float">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentHostel.contact_phone && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium text-slate-800">{currentHostel.contact_phone}</p>
                    </div>
                  </div>
                )}
                {currentHostel.contact_email && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                    <Mail className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-800">{currentHostel.contact_email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {currentHostel.amenities && currentHostel.amenities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-3">Available Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentHostel.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {currentHostel.rules && currentHostel.rules.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-3">Hostel Rules</h4>
                  <ul className="space-y-2">
                    {currentHostel.rules.map((rule, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-slate-600">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Stats Sidebar */}
            <div className="xl:col-span-2 lg:col-span-1 space-y-6">
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-100 p-6 animate-scaleIn" style={{ animationDelay: '0.05s' }}>
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-amber-600" />
                  Quick Stats
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{rooms.length}</div>
                    <div className="text-xs text-slate-600">Total Rooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {rooms.filter(room => room.status === 'available').length}
                    </div>
                    <div className="text-xs text-slate-600">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {rooms.filter(room => room.status === 'occupied').length}
                    </div>
                    <div className="text-xs text-slate-600">Occupied</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {rooms.filter(room => room.status === 'maintenance').length}
                    </div>
                    <div className="text-xs text-slate-600">Maintenance</div>
                  </div>
                </div>
              </div>

              {/* Capacity Stats */}
              <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Capacity Overview</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Capacity</span>
                    <span className="font-bold text-slate-800">{currentHostel.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Current Occupancy</span>
                    <span className="font-bold text-slate-800">{currentHostel.current_occupancy}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${currentHostel.capacity > 0 ? (currentHostel.current_occupancy / currentHostel.capacity) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    {currentHostel.capacity > 0 ? Math.round((currentHostel.current_occupancy / currentHostel.capacity) * 100) : 0}% Occupied
                  </p>
                  
                  {/* Room Count by Type */}
                  {rooms.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h5 className="text-sm font-semibold text-slate-700 mb-3">Room Count by Type</h5>
                      <div className="space-y-2">
                        {Object.entries(
                          rooms.reduce((acc, room) => {
                            acc[room.room_type] = (acc[room.room_type] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                              <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-slate-600">Rooms:</span>
                              <span className="font-bold text-slate-800">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Types Detail */}
              <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Room Types Detail</h4>
                <div className="space-y-3">
                  {(() => {
                    // Get all configured room types from hostel settings
                    const configuredRoomTypes = currentHostel?.roomTypes || [
                      { type: 'standard', name: 'Standard', capacity: 1, rentAmount: 0 },
                      { type: 'deluxe', name: 'Deluxe', capacity: 2, rentAmount: 0 }
                    ];

                    // Get actual room data
                    const roomData = rooms.reduce((acc, room) => {
                      if (!acc[room.room_type]) {
                        acc[room.room_type] = {
                          count: 0,
                          totalCapacity: 0,
                          currentOccupancy: 0,
                          availableRooms: 0,
                          occupiedRooms: 0,
                          maintenanceRooms: 0
                        };
                      }
                      acc[room.room_type].count += 1;
                      acc[room.room_type].totalCapacity += room.capacity || 1;
                      acc[room.room_type].currentOccupancy += room.current_occupancy || 0;
                      
                      if (room.status === 'available') acc[room.room_type].availableRooms += 1;
                      else if (room.status === 'occupied') acc[room.room_type].occupiedRooms += 1;
                      else if (room.status === 'maintenance') acc[room.room_type].maintenanceRooms += 1;
                      
                      return acc;
                    }, {});

                    // Show all configured room types
                    return configuredRoomTypes.map((roomType) => {
                      const actualData = roomData[roomType.type] || {
                        count: 0,
                        totalCapacity: 0,
                        currentOccupancy: 0,
                        availableRooms: 0,
                        occupiedRooms: 0,
                        maintenanceRooms: 0
                      };

                      return (
                        <div key={roomType.type} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-slate-800 capitalize">{roomType.name}</span>
                              {roomType.rentAmount > 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  ₹{roomType.rentAmount}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-amber-600">{actualData.count} rooms</div>
                              {roomType.totalRooms > 0 && (
                                <div className="text-xs text-slate-500">Configured: {roomType.totalRooms} rooms</div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Per Room Capacity:</span>
                              <span className="font-medium text-slate-800">{roomType.capacity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Actual Total Capacity:</span>
                              <span className="font-medium text-slate-800">{actualData.totalCapacity}</span>
                            </div>
                            {roomType.totalRooms > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Configured Total Capacity:</span>
                                <span className="font-medium text-blue-600">{(roomType.totalRooms || 0) * (roomType.capacity || 0)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-slate-600">Occupied:</span>
                              <span className="font-medium text-slate-800">{actualData.currentOccupancy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Available:</span>
                              <span className="font-medium text-green-600">{actualData.availableRooms}</span>
                            </div>
                            {actualData.maintenanceRooms > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Maintenance:</span>
                                <span className="font-medium text-red-600">{actualData.maintenanceRooms}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 animate-scaleIn" style={{ animationDelay: '0.3s' }}>
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowRoomModal(true)}
                    className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Add Room</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingHostel(currentHostel);
                      setHostelFormData({
                        name: currentHostel.name,
                        address: currentHostel.address || '',
                        city: currentHostel.city || '',
                        state: currentHostel.state || '',
                        pincode: currentHostel.pincode || '',
                        contact_phone: currentHostel.contact_phone || '',
                        contact_email: currentHostel.contact_email || '',
                        capacity: currentHostel.capacity || '',
                        amenities: currentHostel.amenities || [],
                        rules: currentHostel.rules || [],
                        roomTypes: currentHostel.roomTypes || [
                          {
                            type: 'standard',
                            name: 'Standard',
                            capacity: 1,
                            rentAmount: 0,
                            amenities: []
                          },
                          {
                            type: 'deluxe',
                            name: 'Deluxe',
                            capacity: 2,
                            rentAmount: 0,
                            amenities: []
                          },
                          {
                            type: 'premium',
                            name: 'Premium',
                            capacity: 2,
                            rentAmount: 0,
                            amenities: []
                          },
                          {
                            type: 'suite',
                            name: 'Suite',
                            capacity: 4,
                            rentAmount: 0,
                            amenities: []
                          }
                        ]
                      });
                      setFormErrors({});
                      setIsValidating(false);
                      setLocation(currentHostel?.location?.lat && currentHostel?.location?.lng ? {
                        lat: currentHostel.location.lat,
                        lng: currentHostel.location.lng
                      } : null);
                      setShowHostelModal(true);
                    }}
                    className="w-full flex items-center space-x-3 p-3 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    <span className="font-medium">Edit Details</span>
                  </button>
                </div>
              </div>

              {/* Hostel Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 animate-scaleIn" style={{ animationDelay: '0.4s' }}>
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Hostel Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Created:</span>
                    <span className="font-medium text-slate-800">
                      {new Date(currentHostel.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Updated:</span>
                    <span className="font-medium text-slate-800">
                      {new Date(currentHostel.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Location:</span>
                    <span className="font-medium text-slate-800">{currentHostel.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pincode:</span>
                    <span className="font-medium text-slate-800">{currentHostel.pincode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-amber-100">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Hostel Information</h3>
            <p className="text-slate-600 mb-6">Set up your hostel information to get started.</p>
            <button
              onClick={() => {
                setEditingHostel(null);
                setHostelFormData({
                  name: '',
                  address: '',
                  city: '',
                  state: '',
                  pincode: '',
                  contact_phone: '',
                  contact_email: '',
                  capacity: '',
                  amenities: [],
                  rules: [],
                  roomTypes: [
                    {
                      type: 'standard',
                      name: 'Standard',
                      capacity: 1,
                      rentAmount: 0,
                      amenities: []
                    },
                    {
                      type: 'deluxe',
                      name: 'Deluxe',
                      capacity: 2,
                      rentAmount: 0,
                      amenities: []
                    },
                    {
                      type: 'premium',
                      name: 'Premium',
                      capacity: 2,
                      rentAmount: 0,
                      amenities: []
                    },
                    {
                      type: 'suite',
                      name: 'Suite',
                      capacity: 4,
                      rentAmount: 0,
                      amenities: []
                    }
                  ]
                });
                setFormErrors({});
                setIsValidating(false);
                setShowHostelModal(true);
              }}
              className="btn-primary"
            >
              Add Hostel Information
            </button>
          </div>
        )}

      </div>
    );
  };

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

  const RoomModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const { register, handleSubmit: formHandleSubmit, formState: { errors, isValid }, reset } = useForm({
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

    const handleFormSubmit = (data) => {
      onSubmit(data);
      reset();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Room</h3>
          <form onSubmit={formHandleSubmit(handleFormSubmit)} className="space-y-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Room Type *</label>
              <input
                type="text"
                {...register('room_type')}
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
                onClick={onClose}
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
      case 'hostel':
        return renderHostelSettings();
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
      <div className="w-64 bg-white shadow-xl border-r border-amber-200/50 fixed h-full z-40 animate-slideInLeft">
        {/* Logo */}
        <div className="p-6 border-b border-amber-200/50 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 gradient-text">HostelHaven</span>
              <div className="text-xs text-slate-500">Admin Portal</div>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-amber-200/50 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900 group-hover:text-red-600 transition-colors duration-200">{user.fullName}</p>
              <p className="text-sm text-slate-500">Administrator</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="space-y-2">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-slate-600'
                }`}
                style={{ animationDelay: `${0.4 + index * 0.05}s` }}
              >
                <tab.icon className="w-5 h-5 transition-all duration-200" />
                <span className="font-medium transition-transform duration-200">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-4 right-4 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 rounded-xl transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 animate-slideInRight">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-amber-200/50 shadow-sm p-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 gradient-text">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Admin Dashboard'}
              </h1>
              <p className="text-slate-600 group-hover:text-amber-600 transition-colors duration-200">Manage your hostel system</p>
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
      <RoomModal 
        isOpen={showRoomModal} 
        onClose={() => setShowRoomModal(false)} 
        onSubmit={handleCreateRoom}
        isSubmitting={isSubmitting}
      />

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
                    {viewingUser.role !== 'admin' && (
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
                    )}
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
                  {availableRooms.map((room) => {
                    // Calculate room price
                    let roomPrice = 'N/A';
                    if (room.price) {
                      roomPrice = `₹${room.price}`;
                    } else if (room.room_type && availableRoomTypes.length > 0) {
                      const roomTypeData = availableRoomTypes.find(rt => rt.type === room.room_type);
                      if (roomTypeData) {
                        const basePrice = roomTypeData.rentAmount || 0;
                        const amenitiesPrice = (roomTypeData.amenities || []).reduce((total, amenity) => 
                          total + (amenityPricing[amenity] || 0), 0);
                        const totalPrice = basePrice + amenitiesPrice;
                        roomPrice = `₹${totalPrice.toLocaleString()}`;
                      }
                    }
                    
                    return (
                      <option key={room.id} value={room.id}>
                        Room {room.room_number} - Floor {room.floor} - {room.room_type} - {roomPrice}/month
                        {room.amenities && room.amenities.length > 0 && ` (${room.amenities.join(', ')})`}
                      </option>
                    );
                  })}
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

      {/* Hostel Settings Modal */}
      {showHostelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {editingHostel ? 'Update Hostel Information' : 'Add Hostel Information'}
                    </h3>
                    <p className="text-amber-100 text-sm">
                      {editingHostel ? 'Modify your hostel information' : 'Set up your hostel details and configuration'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    resetHostelForm();
                    setShowHostelModal(false);
                    setEditingHostel(null);
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[calc(95vh-120px)] overflow-y-auto">
              <form onSubmit={handleHostelSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span>Basic Information</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Hostel Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={hostelFormData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          onBlur={() => validateField('name', hostelFormData.name)}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                            formErrors.name 
                              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                              : 'border-slate-300 focus:ring-amber-500 hover:border-amber-400'
                          }`}
                          placeholder="Enter hostel name (letters and spaces only)"
                        />
                        {hostelFormData.name && !formErrors.name && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.name}</span>
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        Only letters and spaces allowed. No numbers or special characters.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Capacity <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={hostelFormData.capacity}
                          onChange={(e) => handleInputChange('capacity', e.target.value)}
                          onBlur={() => validateField('capacity', hostelFormData.capacity)}
                          className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                            formErrors.capacity 
                              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                              : 'border-slate-300 focus:ring-amber-500 hover:border-amber-400'
                          }`}
                          placeholder="Enter total capacity"
                          min="1"
                          max="1000"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      {formErrors.capacity && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.capacity}</span>
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        Maximum capacity: 1,000 students
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Information Section */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Location Information</span>
                  </h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={hostelFormData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        onBlur={() => validateField('address', hostelFormData.address)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors resize-none ${
                          formErrors.address 
                            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                            : 'border-slate-300 focus:ring-amber-500 hover:border-amber-400'
                        }`}
                        placeholder="Enter complete address"
                        rows={3}
                      />
                      {formErrors.address && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.address}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={hostelFormData.pincode}
                            onChange={(e) => handleInputChange('pincode', e.target.value)}
                            onBlur={() => validateField('pincode', hostelFormData.pincode)}
                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                              formErrors.pincode 
                                ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                                : 'border-slate-300 focus:ring-amber-500 hover:border-amber-400'
                            }`}
                            placeholder="Enter 6-digit pincode"
                            maxLength="6"
                          />
                          {isLoadingPincode && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
                            </div>
                          )}
                        </div>
                        {formErrors.pincode && (
                          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{formErrors.pincode}</span>
                          </p>
                        )}
                        {pincodeData && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-sm text-green-800">
                              <div className="font-medium">Location Details:</div>
                              <div className="mt-1 space-y-1">
                                <div><span className="font-medium">District:</span> {pincodeData.district}</div>
                                <div><span className="font-medium">State:</span> {pincodeData.state}</div>
                                <div><span className="font-medium">Region:</span> {pincodeData.region}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={hostelFormData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          onBlur={() => validateField('city', hostelFormData.city)}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                            formErrors.city 
                              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                              : 'border-slate-300 focus:ring-amber-500 hover:border-amber-400'
                          }`}
                          placeholder="Enter city"
                        />
                        {formErrors.city && (
                          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{formErrors.city}</span>
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={hostelFormData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          onBlur={() => validateField('state', hostelFormData.state)}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                            formErrors.state 
                              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                              : 'border-slate-300 focus:ring-amber-500 hover:border-amber-400'
                          }`}
                          placeholder="Enter state"
                        />
                        {formErrors.state && (
                          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{formErrors.state}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Professional Location Services */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h5 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span>Location Services</span>
                          </h5>
                          <p className="text-sm text-slate-600 mt-1">Get precise location coordinates and map integration</p>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={isLoadingLocation}
                            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center space-x-2 shadow-sm ${
                              isLoadingLocation 
                                ? 'bg-blue-400 text-white cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isLoadingLocation ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <MapPin className="w-4 h-4" />
                            )}
                            <span>{isLoadingLocation ? 'Fetching...' : 'Get Current Location'}</span>
                          </button>
                          
                          {location && (
                            <button
                              type="button"
                              onClick={getCurrentLocation}
                              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex items-center space-x-2 shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Refresh Location</span>
                            </button>
                          )}
                          
                        </div>
                      </div>
                      
                      {location && (
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-slate-700">Live Location Data</span>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Live</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="text-sm text-slate-600">
                                <span className="font-medium text-slate-500">Coordinates:</span>
                                <div className="font-mono bg-slate-50 px-3 py-2 rounded text-xs mt-1 border">
                                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                </div>
                              </div>
                              <div className="text-sm text-slate-600">
                                <span className="font-medium text-slate-500">Accuracy:</span>
                                <span className="ml-1">±{Math.round(location.accuracy || 5)} meters</span>
                              </div>
                              {location.address && (
                                <div className="text-sm text-slate-600">
                                  <span className="font-medium text-slate-500">Address:</span>
                                  <div className="mt-1 text-slate-700">{location.address}</div>
                                </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div className="text-sm text-slate-600">
                                <span className="font-medium text-slate-500">Status:</span>
                                <span className="ml-1 text-green-600 font-medium">Active & Live</span>
                              </div>
                              <div className="text-sm text-slate-600">
                                <span className="font-medium text-slate-500">Source:</span>
                                <span className="ml-1">GPS + Reverse Geocoding</span>
                              </div>
                              {location.city && location.state && (
                                <div className="text-sm text-slate-600">
                                  <span className="font-medium text-slate-500">Auto-filled:</span>
                                  <div className="mt-1 text-slate-700">{location.city}, {location.state}</div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Last updated: {new Date().toLocaleTimeString()}</span>
                              <span>Location ID: {Math.random().toString(36).substr(2, 9)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {!location && (
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <div className="text-center text-slate-500">
                            <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                            <p className="text-sm">Click "Get Current Location" to fetch coordinates</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>Contact Information</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        value={hostelFormData.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        onBlur={() => validateField('contact_phone', hostelFormData.contact_phone)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                          formErrors.contact_phone 
                            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                            : 'border-slate-300 focus:ring-amber-500 hover:border-amber-400'
                        }`}
                        placeholder="Enter phone number"
                      />
                      {formErrors.contact_phone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.contact_phone}</span>
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={hostelFormData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        onBlur={() => validateField('contact_email', hostelFormData.contact_email)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                          formErrors.contact_email 
                            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                            : 'border-slate-300 focus:ring-amber-500 hover:border-amber-400'
                        }`}
                        placeholder="Enter email address"
                      />
                      {formErrors.contact_email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.contact_email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Amenities Selection Section */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Star className="w-5 h-5 text-white" />
                    </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">Basic Amenities</h4>
                        <p className="text-sm text-slate-600">Select the amenities available at your hostel</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-amber-200">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span>{hostelFormData.amenities.length} Selected</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[
                        { name: 'WiFi', icon: '📶', color: 'blue' },
                        { name: 'Laundry', icon: '👕', color: 'purple' },
                        { name: 'Parking', icon: '🚗', color: 'green' },
                        { name: 'Security', icon: '🔒', color: 'red' },
                        { name: 'Cafeteria', icon: '🍽️', color: 'orange' },
                        { name: 'Gym', icon: '💪', color: 'indigo' },
                        { name: 'Library', icon: '📚', color: 'teal' },
                        { name: 'Study Room', icon: '📖', color: 'pink' },
                        { name: 'Common Room', icon: '🛋️', color: 'yellow' },
                        { name: 'Air Conditioning', icon: '❄️', color: 'cyan' },
                        { name: 'Hot Water', icon: '🔥', color: 'rose' },
                        { name: 'CCTV', icon: '📹', color: 'slate' }
                      ].map((amenity) => (
                        <label key={amenity.name} className="group relative flex flex-col items-center p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 hover:border-amber-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                            checked={hostelFormData.amenities.includes(amenity.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setHostelFormData({
                                ...hostelFormData,
                                  amenities: [...hostelFormData.amenities, amenity.name]
                              });
                            } else {
                              setHostelFormData({
                                ...hostelFormData,
                                  amenities: hostelFormData.amenities.filter(a => a !== amenity.name)
                              });
                            }
                          }}
                            className="sr-only"
                          />
                          
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 shadow-md transition-all duration-200 ${
                            hostelFormData.amenities.includes(amenity.name) 
                              ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg scale-110' 
                              : 'bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-600'
                          }`}>
                            {amenity.icon}
                          </div>
                          
                          <span className={`text-sm font-medium text-center transition-colors duration-200 ${
                            hostelFormData.amenities.includes(amenity.name) 
                              ? 'text-amber-700' 
                              : 'text-slate-700 group-hover:text-slate-800'
                          }`}>
                            {amenity.name}
                          </span>
                          
                          {hostelFormData.amenities.includes(amenity.name) && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                      </label>
                    ))}
                    </div>
                    
                    {hostelFormData.amenities.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Star className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm">Select amenities to show what your hostel offers</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Amenities Management Section */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">Amenities Management</h4>
                        <p className="text-sm text-slate-600">Configure and price your hostel amenities</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>{(availableAmenities || []).length} Amenities</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Add New Amenity Card */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </div>
                        <h5 className="text-lg font-semibold text-slate-800">Add New Amenity</h5>
                      </div>
                      
                      <div className="flex space-x-3">
                        <div className="flex-1">
                        <input
                          type="text"
                          value={newAmenity}
                          onChange={(e) => setNewAmenity(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
                            placeholder="Enter amenity name (e.g., Swimming Pool, Gym, etc.)"
                            onKeyPress={(e) => e.key === 'Enter' && addNewAmenity()}
                        />
                        </div>
                        <button
                          type="button"
                          onClick={addNewAmenity}
                          disabled={!newAmenity.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Amenity</span>
                        </button>
                      </div>
                    </div>

                    {/* Amenities Grid with Enhanced Design */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                              <Star className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-lg font-semibold text-slate-800">Amenities & Pricing</h5>
                              <p className="text-sm text-slate-600">Set individual pricing for each amenity</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                            <span className="font-medium">₹</span>
                            <span>Pricing in INR</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {(availableAmenities || []).length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Settings className="w-8 h-8 text-slate-400" />
                            </div>
                            <h6 className="text-lg font-medium text-slate-600 mb-2">No Amenities Added Yet</h6>
                            <p className="text-slate-500">Add your first amenity to get started with pricing configuration.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {(availableAmenities || []).map((amenity, index) => (
                              <div key={amenity} className="group bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                      {amenity.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h6 className="font-semibold text-slate-800 text-sm">{amenity}</h6>
                                      <p className="text-xs text-slate-500">Amenity #{index + 1}</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeAmenity(amenity)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    title="Remove amenity"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                      Monthly Price (₹)
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">₹</span>
                            <input
                              type="number"
                              value={amenityPricing[amenity] || 0}
                              onChange={(e) => updateAmenityPricing(amenity, e.target.value)}
                                        className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                              placeholder="0"
                              min="0"
                              step="50"
                            />
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Base Price</span>
                                    <span className="font-medium text-green-600">
                                      ₹{(amenityPricing[amenity] || 0).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                          </div>
                        ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Room Types & Pricing Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Home className="w-5 h-5 text-white" />
                    </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">Room Types & Pricing</h4>
                        <p className="text-sm text-slate-600">Configure room types, capacity, and pricing structure</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-indigo-200">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      <span>{(hostelFormData.roomTypes || []).length} Room Types</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {(hostelFormData.roomTypes || []).map((roomType, typeIndex) => (
                      <div key={typeIndex} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Room Type Header */}
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {roomType.name ? roomType.name.charAt(0).toUpperCase() : 'R'}
                              </div>
                              <div>
                                <h5 className="text-xl font-bold text-slate-800">
                            {roomType.name || `Room Type ${typeIndex + 1}`}
                          </h5>
                                <p className="text-sm text-slate-600">Room configuration and pricing</p>
                              </div>
                            </div>
                          {(hostelFormData.roomTypes || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRoomType(typeIndex)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105"
                                title="Remove room type"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                          </div>
                        </div>
                        
                        {/* Room Configuration Form */}
                        <div className="p-6 space-y-6">
                          {/* Basic Configuration Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-slate-700">
                              Room Type Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={roomType.name}
                              onChange={(e) => handleRoomTypeChange(typeIndex, 'name', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
                                placeholder="e.g., Standard, Deluxe"
                            />
                          </div>
                          
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-slate-700">
                              Per Room Capacity <span className="text-red-500">*</span>
                            </label>
                              <div className="relative">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={roomType.capacity}
                              onChange={(e) => handleRoomTypeChange(typeIndex, 'capacity', parseInt(e.target.value))}
                                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-700"
                                  placeholder="Max occupancy"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                                  👥
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                People per room
                              </p>
                          </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-slate-700">
                              Total Room Count <span className="text-red-500">*</span>
                            </label>
                              <div className="relative">
                            <input
                              type="number"
                              min="1"
                                  max="1000"
                              value={roomType.totalRooms || 0}
                              onChange={(e) => handleRoomTypeChange(typeIndex, 'totalRooms', parseInt(e.target.value) || 0)}
                                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-700"
                              placeholder="Number of rooms"
                            />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                                  🏠
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 flex items-center">
                                <Building2 className="w-3 h-3 mr-1" />
                                Total rooms of this type
                              </p>
                          </div>
                          
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-slate-700">
                              Base Rent (₹) <span className="text-red-500">*</span>
                            </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm font-medium">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={roomType.rentAmount}
                              onChange={(e) => handleRoomTypeChange(typeIndex, 'rentAmount', parseFloat(e.target.value))}
                                  className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-700"
                              placeholder="Base monthly rent"
                            />
                              </div>
                          </div>
                        </div>

                          {/* Price & Capacity Summary Cards */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Price Summary Card */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-white" />
                                </div>
                            <div>
                                  <h6 className="text-lg font-bold text-slate-800">Total Room Price</h6>
                                  <p className="text-sm text-slate-600">Base + Amenities pricing</p>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Base Rent:</span>
                                  <span className="font-semibold text-slate-800">₹{(roomType.rentAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Amenities:</span>
                                  <span className="font-semibold text-slate-800">₹{roomType.amenities.reduce((total, amenity) => total + (amenityPricing[amenity] || 0), 0).toLocaleString()}</span>
                                </div>
                                <div className="border-t border-amber-200 pt-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-800">Total Price:</span>
                                    <span className="text-3xl font-bold text-amber-600">₹{calculateRoomPrice(roomType).toLocaleString()}</span>
                                  </div>
                                  <p className="text-sm text-slate-500 text-center mt-1">per month</p>
                                </div>
                              </div>
                            </div>

                            {/* Capacity Summary Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                  <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                  <h6 className="text-lg font-bold text-slate-800">Capacity Summary</h6>
                                  <p className="text-sm text-slate-600">Room occupancy details</p>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Total Rooms:</span>
                                  <span className="font-semibold text-slate-800">{roomType.totalRooms || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Per Room Capacity:</span>
                                  <span className="font-semibold text-slate-800">{roomType.capacity || 0} people</span>
                                </div>
                                <div className="border-t border-blue-200 pt-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-800">Total Capacity:</span>
                                    <span className="text-2xl font-bold text-blue-600">{(roomType.totalRooms || 0) * (roomType.capacity || 0)}</span>
                                </div>
                                  <p className="text-sm text-slate-500 text-center mt-1">people can be accommodated</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                          {/* Room-Specific Amenities */}
                          <div className="bg-slate-50 rounded-xl p-6">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                <Star className="w-4 h-4" />
                              </div>
                        <div>
                                <h6 className="text-lg font-semibold text-slate-800">Room-Specific Amenities</h6>
                                <p className="text-sm text-slate-600">Select amenities for this room type (price impact shown)</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {(availableAmenities || []).map((amenity) => (
                                <label key={amenity} className="group relative flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={roomType.amenities.includes(amenity)}
                                  onChange={() => handleRoomTypeAmenityToggle(typeIndex, amenity)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-slate-700 truncate block">{amenity}</span>
                                  {amenityPricing[amenity] > 0 && (
                                      <span className="text-xs text-indigo-600 font-medium">
                                        +₹{amenityPricing[amenity].toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                            
                            {roomType.amenities.length === 0 && (
                              <div className="text-center py-8">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Star className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500 text-sm">No amenities selected for this room type</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add New Room Type Button */}
                    <button
                      type="button"
                      onClick={addRoomType}
                      className="w-full flex items-center justify-center space-x-3 p-6 border-2 border-dashed border-indigo-300 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 rounded-2xl transition-all duration-200 hover:scale-[1.02] group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg">Add New Room Type</div>
                        <div className="text-sm text-indigo-500">Create additional room configurations</div>
                      </div>
                    </button>

                    {/* Enhanced Pricing Summary */}
                    {(hostelFormData.roomTypes || []).length > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h5 className="text-xl font-bold text-slate-800">Pricing Summary</h5>
                            <p className="text-sm text-slate-600">Complete overview of all room types and pricing</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                        {(hostelFormData.roomTypes || []).map((roomType, index) => (
                            <div key={index} className="bg-white rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                  {roomType.name ? roomType.name.charAt(0).toUpperCase() : 'R'}
                                </div>
                                <h6 className="font-bold text-slate-800">{roomType.name || `Room Type ${index + 1}`}</h6>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                  <span className="text-slate-600">Base Rent:</span>
                                  <span className="font-medium">₹{(roomType.rentAmount || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Amenities:</span>
                                  <span className="font-medium">₹{roomType.amenities.reduce((total, amenity) => total + (amenityPricing[amenity] || 0), 0).toLocaleString()}</span>
                              </div>
                                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                                <span className="text-slate-800">Total:</span>
                                  <span className="text-green-600">₹{calculateRoomPrice(roomType).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                  <span>Rooms:</span>
                                  <span>{roomType.totalRooms || 0} × {roomType.capacity || 0} people</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                        
                        <div className="bg-white rounded-xl p-5 border border-green-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                            ₹{(hostelFormData.roomTypes || []).length > 0 ? Math.round(calculateTotalPrice() / (hostelFormData.roomTypes || []).length) : 0}
                        </div>
                              <div className="text-sm text-slate-600">Average Room Price</div>
                      </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {(hostelFormData.roomTypes || []).reduce((total, roomType) => total + (roomType.totalRooms || 0), 0)}
                    </div>
                              <div className="text-sm text-slate-600">Total Rooms</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {(hostelFormData.roomTypes || []).reduce((total, roomType) => total + ((roomType.totalRooms || 0) * (roomType.capacity || 0)), 0)}
                              </div>
                              <div className="text-sm text-slate-600">Total Capacity</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Hostel Rules Section */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">Hostel Rules & Policies</h4>
                        <p className="text-sm text-slate-600">Define clear guidelines and policies for your hostel</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-red-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>{hostelFormData.rules.length} Rules</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Quick Rule Templates */}
                    <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <h5 className="text-lg font-semibold text-slate-800">Quick Rule Templates</h5>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { icon: '🕐', text: 'Curfew time: 10:00 PM', category: 'Timing' },
                          { icon: '🚫', text: 'No smoking in rooms', category: 'Health' },
                          { icon: '🔇', text: 'Maintain silence after 11 PM', category: 'Quiet Hours' },
                          { icon: '🧹', text: 'Keep rooms clean and tidy', category: 'Cleanliness' },
                          { icon: '👥', text: 'No overnight guests allowed', category: 'Visitors' },
                          { icon: '💰', text: 'Monthly rent due by 5th', category: 'Payment' }
                        ].map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              if (!hostelFormData.rules.includes(template.text)) {
                                setHostelFormData({
                                  ...hostelFormData, 
                                  rules: [...hostelFormData.rules, template.text]
                                });
                              }
                            }}
                            className="group flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all duration-200 text-left"
                          >
                            <div className="text-2xl">{template.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-700 truncate">{template.text}</div>
                              <div className="text-xs text-slate-500">{template.category}</div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-4 h-4 text-red-500" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rules List */}
                    <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                          <div>
                            <h5 className="text-lg font-semibold text-slate-800">Current Rules</h5>
                            <p className="text-sm text-slate-600">Manage your hostel's rules and policies</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {hostelFormData.rules.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <AlertCircle className="w-8 h-8 text-slate-400" />
                            </div>
                            <h6 className="text-lg font-medium text-slate-600 mb-2">No Rules Added Yet</h6>
                            <p className="text-slate-500">Add rules to establish clear guidelines for your hostel residents.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                    {hostelFormData.rules.map((rule, index) => (
                              <div key={index} className="group bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-200 hover:border-red-300 hover:shadow-md transition-all duration-200">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {index + 1}
                        </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="relative">
                        <input
                          type="text"
                          value={rule}
                          onChange={(e) => {
                            const newRules = [...hostelFormData.rules];
                            newRules[index] = e.target.value;
                            setHostelFormData({...hostelFormData, rules: newRules});
                          }}
                                        className="w-full px-4 py-3 text-slate-700 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white rounded-lg transition-all placeholder-slate-400"
                                        placeholder="Enter a clear and specific rule..."
                                        style={{ fontSize: '16px' }} // Prevents zoom on mobile
                                      />
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                                        <span>Rule #{index + 1}</span>
                                        <span>•</span>
                                        <span>{rule.length} characters</span>
                                      </div>
                                      
                        <button
                          type="button"
                          onClick={() => {
                            const newRules = hostelFormData.rules.filter((_, i) => i !== index);
                            setHostelFormData({...hostelFormData, rules: newRules});
                          }}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                        title="Remove this rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                                    </div>
                                  </div>
                                </div>
                      </div>
                    ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Add New Rule Button */}
                    <button
                      type="button"
                      onClick={() => setHostelFormData({...hostelFormData, rules: [...hostelFormData.rules, '']})}
                      className="w-full flex items-center justify-center space-x-3 p-6 border-2 border-dashed border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 rounded-2xl transition-all duration-200 hover:scale-[1.02] group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg">Add New Rule</div>
                        <div className="text-sm text-red-500">Create a custom rule for your hostel</div>
                      </div>
                    </button>

                    {/* Rules Guidelines */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h6 className="font-semibold text-slate-800 mb-2">Rules Guidelines</h6>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Keep rules clear, specific, and easy to understand</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Include consequences for rule violations</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Consider safety, respect, and community harmony</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Review and update rules regularly based on feedback</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowHostelModal(false);
                      setEditingHostel(null);
                      setHostelFormData({
                        name: '',
                        address: '',
                        city: '',
                        state: '',
                        pincode: '',
                        contact_phone: '',
                        contact_email: '',
                        capacity: '',
                        amenities: [],
                        rules: [],
                        roomTypes: [
                          {
                            type: 'standard',
                            name: 'Standard',
                            capacity: 1,
                            rentAmount: 0,
                            amenities: []
                          },
                          {
                            type: 'deluxe',
                            name: 'Deluxe',
                            capacity: 2,
                            rentAmount: 0,
                            amenities: []
                          },
                          {
                            type: 'premium',
                            name: 'Premium',
                            capacity: 2,
                            rentAmount: 0,
                            amenities: []
                          },
                          {
                            type: 'suite',
                            name: 'Suite',
                            capacity: 4,
                            rentAmount: 0,
                            amenities: []
                          }
                        ]
                      });
                      setFormErrors({});
                      setLocation(null);
                    }}
                    className="px-8 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || Object.keys(formErrors).length > 0}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      editingHostel ? 'Update Hostel' : 'Create Hostel'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;