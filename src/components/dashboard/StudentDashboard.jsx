import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../contexts/NotificationContext';
import useBeautifulToast from '../../hooks/useBeautifulToast';
import { zodResolver } from '@hookform/resolvers/zod';
import { complaintSchema, leaveRequestSchema, profileUpdateSchema } from '../../lib/validation';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { profileUtils } from '../../lib/supabaseUtils';
import StudentProfileForm from '../StudentProfileForm';
import StudentProfileView from '../StudentProfileView';
import StudentRoomRequest from './StudentRoomRequest';
import StudentCleaningRequest from '../StudentCleaningRequest';
import StudentComplaints from '../StudentComplaints';
import OutpassModal from '../OutpassModal';
import RazorpayPaymentModal from '../ui/RazorpayPaymentModal';
import ConfirmationModal from '../ui/ConfirmationModal';
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
  XCircle,
  MapPin,
  Phone,
  Mail,
  Edit,
  Plus,
  Search,
  Filter,
  Download,
  UserCheck,
  Loader2,
  Camera,
  Upload,
  Shield,
  Activity
} from 'lucide-react';

function StudentDashboard() {
  // State management for user data and UI
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
  const { showNotification } = useNotification();
  const { showSuccess, showError, showWarning, showInfo } = useBeautifulToast();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dataLoading, setDataLoading] = useState({
    profile: true,
    room: true,
    payments: true,
    complaints: true,
    leave: true,
    notifications: true
  });
  const [roomDetails, setRoomDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'online',
    transaction_reference: ''
  });
  const [showPaymentDuePopup, setShowPaymentDuePopup] = useState(false);
  const [dueNotification, setDueNotification] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showOutpassModal, setShowOutpassModal] = useState(false);
  const [showEditOutpassModal, setShowEditOutpassModal] = useState(false);
  const [showExtendOutpassModal, setShowExtendOutpassModal] = useState(false);
  const [editingOutpass, setEditingOutpass] = useState(null);
  const [extendingOutpass, setExtendingOutpass] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    onConfirm: null,
    isLoading: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditComplaintModal, setShowEditComplaintModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('');
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState('');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [error, setError] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(null); // null = unknown, true/false = known
  const [profileCompletion, setProfileCompletion] = useState(null); // null = loading
  const [profileStatus, setProfileStatus] = useState(null); // null = loading
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [dataCache, setDataCache] = useState({});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          navigate('/login');
          return;
        }

        // Try to load cached profile status first
        const cacheKey = `profile_status_${session.user.id}`;
        const cachedStatus = localStorage.getItem(cacheKey);
        if (cachedStatus) {
          try {
            const { hasProfile: cachedHasProfile, profileStatus: cachedProfileStatus, profileCompletion: cachedProfileCompletion, timestamp } = JSON.parse(cachedStatus);
            // Use cache if it's less than 5 minutes old
            if (Date.now() - timestamp < 300000) {
              setHasProfile(cachedHasProfile);
              setProfileStatus(cachedProfileStatus);
              setProfileCompletion(cachedProfileCompletion);
            }
          } catch (e) {
            // Invalid cache, ignore
          }
        }

        // Fetch user profile from Supabase
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          // If table doesn't exist, show a message to the user
          if (profileError.message?.includes('relation') && profileError.message?.includes('does not exist')) {
            setError('Database tables are not set up yet. Please contact the administrator.');
            return;
          }
          throw profileError;
        }

        // Normalize user object: ensure fullName is available for UI
        const computedFullName =
          userProfile.full_name ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          userProfile.fullName ||
          session.user.email?.split('@')[0] ||
          'Student';
        // Set user with normalized name and avatar
        setUser({
          ...userProfile,
          fullName: computedFullName,
          full_name: userProfile.full_name ?? computedFullName,
          avatar_url: userProfile.avatar_url || session.user.user_metadata?.avatar_url || null
        });
        setProfileForm({ 
          fullName: userProfile.full_name || '', 
          phone: userProfile.phone || '' 
        });
        
        // Show dashboard immediately after user data is loaded
        setIsLoading(false);
        setIsInitialLoad(false);
          
        // Fetch all dashboard data in parallel for better performance (non-blocking)
        Promise.allSettled([
          fetchStudentProfile(),
          fetchRoomDetails(),
          fetchPayments(),
          fetchComplaints(),
          fetchLeaveRequests(),
          fetchNotifications()
        ]).catch(error => {
          console.error('Error fetching dashboard data:', error);
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle navigation when user is not available
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [isLoading, user, navigate]);

  // Fetch unread payment_due notification on mount
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`${API_BASE_URL}/api/notifications?type=payment_due&is_read=false&limit=1`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const json = await res.json();
        if (res.ok && json.success && json.data.notifications.length > 0) {
          setDueNotification(json.data.notifications[0]);
          setShowPaymentDuePopup(true);
        }
      } catch (_) {}
    })();
  }, []);

  const parsePaymentFromNotification = (n) => {
    if (!n) return {};
    const msg = n.message || '';
    const m = msg.match(/₹([\d.]+).*for\s(.+?)\s\(ID:.*\)\sby\s(.+)$/i);
    const amount = m ? parseFloat(m[1]) : 0;
    const typeText = m ? m[2] : '';
    const mapType = (t) => {
      const key = t.toLowerCase().replace(/\s+/g, '_');
      return ['room_rent','mess_fees','security_deposit','other'].includes(key) ? key : 'other';
    };
    return { amount, payment_type: mapType(typeText) };
  };

  const handleDueProceed = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && dueNotification) {
        await fetch(`${API_BASE_URL}/api/notifications/${dueNotification.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
      }
    } catch (_) {}
    setShowPaymentDuePopup(false);
  };

  const openPayFromDue = async (method) => {
    const info = parsePaymentFromNotification(dueNotification);
    setSelectedPayment({ amount: info.amount, payment_type: info.payment_type });
    setPaymentForm(prev => ({ ...prev, payment_method: method }));
    setShowPaymentDuePopup(false);
    setShowPaymentModal(true);
  };

  // Refetch complaints when filters change
  useEffect(() => {
    fetchComplaints();
  }, [complaintStatusFilter, complaintCategoryFilter]);

  // Refetch leave requests when filters change
  useEffect(() => {
    fetchLeaveRequests();
  }, [leaveStatusFilter]);

  // Refetch room details when room request status changes
  useEffect(() => {
    const channel = supabase
      .channel('room_allocation_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_allocations'
      }, () => {
        fetchRoomDetails();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const fetchRoomDetails = async () => {
    try {
      setDataLoading(prev => ({ ...prev, room: true }));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setRoomDetails(null);
        setDataLoading(prev => ({ ...prev, room: false }));
        return;
      }

      // Use the backend API for more reliable room data fetching
      const response = await fetch(`${API_BASE_URL}/api/rooms/my-room`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🏠 Room API Response (full):', JSON.stringify(result, null, 2));
        
        // Check if there's room data (backend always returns room when allocation exists)
        if (result.success && result.data?.room) {
          const roomData = result.data.room;
          const allocationData = result.data.allocation || {};
          console.log('✅ Room data found:', roomData);
          console.log('✅ Allocation data:', allocationData);
          
          setRoomDetails({
            id: roomData.id,
            roomNumber: roomData.room_number,
            floor: roomData.floor,
            roomType: roomData.room_type,
            capacity: roomData.capacity,
            occupied: roomData.occupied || roomData.current_occupancy || 0,
            price: roomData.price,
            status: roomData.status,
            allocationStatus: allocationData.allocationStatus || allocationData.allocation_status,
            allocationDate: allocationData.allocationDate || allocationData.allocation_date,
            startDate: allocationData.startDate || allocationData.start_date,
            endDate: allocationData.endDate || allocationData.end_date,
            hostel: {
              name: 'HostelHaven',
              address: 'N/A',
              city: 'N/A',
              phone: 'N/A'
            },
            roommates: result.data.roommates || []
          });
        } else {
          console.log('❌ No room data found in response');
          console.log('❌ Response structure:', {
            success: result.success,
            hasData: !!result.data,
            hasRoom: !!result.data?.room,
            message: result.data?.message || result.message,
            fullResponse: result
          });
          
          // Try fallback: check if there's an allocation without room data
          if (result.success && result.data?.allocation) {
            console.log('⚠️ Found allocation but no room data. Allocation:', result.data.allocation);
          }
          
          setRoomDetails(null);
        }
      } else {
        console.error('❌ Failed to fetch room details:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Parsed error:', errorJson);
        } catch (e) {
          console.error('❌ Could not parse error as JSON');
        }
        
        setRoomDetails(null);
      }
      
      setDataLoading(prev => ({ ...prev, room: false }));
    } catch (error) {
      console.error('Error fetching room details:', error);
      setRoomDetails(null);
      setDataLoading(prev => ({ ...prev, room: false }));
    }
  };

  const fetchPayments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch payments from backend API
      const response = await fetch(`${API_BASE_URL}/api/payments/student`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error fetching payments:', response.statusText);
        setPayments([]);
        return;
      }

      const result = await response.json();
      if (result.success) {
        setPayments(result.data.payments || []);
      } else {
        console.error('Error fetching payments:', result.message);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setDataLoading(prev => ({ ...prev, payments: false }));
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let query = supabase
        .from('complaints')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (complaintStatusFilter) {
        query = query.eq('status', complaintStatusFilter);
      }
      if (complaintCategoryFilter) {
        query = query.eq('category', complaintCategoryFilter);
      }

      const { data: complaintsData, error: complaintsError } = await query;

      if (complaintsError) {
        console.error('Error fetching complaints:', complaintsError);
        // If table doesn't exist, just set empty array
        if (complaintsError.message?.includes('relation') && complaintsError.message?.includes('does not exist')) {
          setComplaints([]);
          return;
        }
        return;
      }

      setComplaints(complaintsData.map(complaint => ({
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        status: complaint.status,
        category: complaint.category,
        priority: complaint.priority,
        createdAt: new Date(complaint.created_at).toLocaleDateString(),
        resolvedAt: complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleDateString() : null
      })));
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setDataLoading(prev => ({ ...prev, complaints: false }));
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ No session found');
        return;
      }

      console.log('🔍 Fetching outpass requests for user:', session.user.id);

      // Use the backend API instead of direct Supabase query to handle user ID mapping correctly
      const response = await fetch(`${API_BASE_URL}/api/outpass/my-requests`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('❌ Error fetching outpass requests:', response.status, response.statusText);
        setLeaveRequests([]);
        return;
      }

      const result = await response.json();
      console.log('🔍 API response:', result);

      if (!result.success) {
        console.error('❌ API error:', result.message);
        setLeaveRequests([]);
        return;
      }

      const leaveData = result.data || [];
      console.log('✅ Successfully fetched data:', leaveData);
      console.log('🔍 Number of records:', leaveData?.length || 0);

      if (!leaveData || leaveData.length === 0) {
        console.log('🔍 No data found in database');
        setLeaveRequests([]);
        return;
      }

      // Apply status filter if specified
      let filteredData = leaveData;
      if (leaveStatusFilter) {
        filteredData = leaveData.filter(request => request.status === leaveStatusFilter);
      }

      const mappedRequests = filteredData.map(request => {
        console.log('🔍 Mapping request:', request);
        return {
          id: request.id,
          reason: request.reason,
          startDate: request.start_date,
          endDate: request.end_date,
          status: request.status,
          emergency_contact: request.emergency_contact,
          emergency_phone: request.emergency_phone,
          destination: request.destination,
          transport_mode: request.transport_mode,
          rejection_reason: request.rejection_reason,
          createdAt: new Date(request.created_at).toLocaleDateString()
        };
      });
      
      console.log('✅ Mapped requests:', mappedRequests);
      setLeaveRequests(mappedRequests);
    } catch (error) {
      console.error('❌ Exception fetching outpass requests:', error);
      setLeaveRequests([]);
    } finally {
      setDataLoading(prev => ({ ...prev, leave: false }));
    }
  };

  const fetchNotifications = async () => {
    setDataLoading(prev => ({ ...prev, notifications: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } else {
        setNotifications(notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setDataLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  const fetchStudentProfile = async () => {
    try {
      console.log('🚀 fetchStudentProfile called');
      let { data: { session } } = await supabase.auth.getSession();
      
      // Try to refresh session if no session or expired
      if (!session || !session.access_token) {
        console.log('🔄 No valid session, attempting refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('❌ Session refresh failed:', refreshError);
          navigate('/login');
          return;
        }
        
        session = refreshedSession;
        console.log('✅ Session refreshed successfully');
      }
      
      if (!session) {
        console.log('❌ No session found after refresh');
        navigate('/login');
        return;
      }
      
      console.log('✅ Session found:', {
        email: session.user.email,
        id: session.user.id,
        role: session.user.role,
        created_at: session.user.created_at,
        user_metadata: session.user.user_metadata,
        app_metadata: session.user.app_metadata
      });
      
      // Log session info for debugging
      console.log('✅ Session user ID:', session.user.id);
      console.log('🔑 Access token preview:', session.access_token ? session.access_token.substring(0, 50) + '...' : 'NO TOKEN');

      // Check if access token exists and is valid
      if (!session.access_token) {
        console.error('❌ No access token in session');
        setHasProfile(false);
        return;
      }

      // Get admission number for cache key
      const admissionNumber = session.user.user_metadata?.username || session.user.user_metadata?.admission_number || session.user.email;
      
      // Check cache first
      const cacheKey = `profile_${admissionNumber}`;
      if (dataCache[cacheKey] && Date.now() - dataCache[cacheKey].timestamp < 30000) { // 30 second cache
        const cachedData = dataCache[cacheKey].data;
        setHasProfile(true);
        setStudentProfile(cachedData);
        setProfileCompletion(cachedData.completion);
        setProfileStatus(cachedData.status);
        setDataLoading(prev => ({ ...prev, profile: false }));
        return;
      }

      // Query admission registry via API endpoint (bypasses RLS)
      console.log('🔍 Making API call for student profile:', session.user.email);
      
      const response = await fetch(`${API_BASE_URL}/api/student-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('🔍 API response:', result);
      
      const profileData = result.success ? result.data : null;
      const profileError = result.success ? null : result;
      
      if (profileError) {
        console.error('❌ Error fetching student profile:', profileError);
        if (profileError.error === 'Student profile not found') {
          setHasProfile(false);
          return;
        }
        setHasProfile(false);
        return;
      }

      if (profileData) {
        console.log('✅ Profile data found, setting hasProfile to true');
        setHasProfile(true);
        setStudentProfile(profileData);

        // Calculate completion status with a minimal required set
        // Aligning with admin-provided fields to avoid false "incomplete" states
        const requiredFields = [
          'admission_number',
          'course',
          'batch_year'
        ];

        const missingFields = requiredFields.filter(field => !profileData[field] && profileData[field] !== 0);
        const completion = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);

        // Determine status based on minimal completion (treat as complete when minimal set is present)
        let status = profileData.status || (completion === 100 ? 'complete' : 'incomplete');

        setProfileCompletion(completion);
        setProfileStatus(status);

        // Update user state with avatar URL from profile
        if (profileData.avatar_url) {
          setUser(prev => ({ ...prev, avatar_url: profileData.avatar_url }));
        }

        // Cache the data in memory
        setDataCache(prev => ({
          ...prev,
          [cacheKey]: {
            data: { ...profileData, completion, status },
            timestamp: Date.now()
          }
        }));

        // Cache the profile status in localStorage for faster reloads
        const statusCacheKey = `profile_status_${session.user.id}`;
        localStorage.setItem(statusCacheKey, JSON.stringify({
          hasProfile: true,
          profileStatus: status,
          profileCompletion: completion,
          timestamp: Date.now()
        }));
      } else {
        console.log('❌ No profile data found, setting hasProfile to false');
        setHasProfile(false);
        // Cache the no profile status
        const statusCacheKey = `profile_status_${admissionNumber}`;
        localStorage.setItem(statusCacheKey, JSON.stringify({
          hasProfile: false,
          profileStatus: 'incomplete',
          profileCompletion: 0,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      setHasProfile(false);
    } finally {
      setDataLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleProfileSuccess = async (profileData) => {
    setStudentProfile(profileData);
    setHasProfile(true);
    setShowProfileForm(false);
    setIsEditingProfile(false);
    setActiveTab('overview');
    
    // Clear cache and refresh profile data
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const cacheKey = `profile_${session.user.id}`;
      const statusCacheKey = `profile_status_${session.user.id}`;
      
      // Clear memory cache
      setDataCache(prev => {
        const newCache = { ...prev };
        delete newCache[cacheKey];
        return newCache;
      });
      
      // Clear localStorage cache
      localStorage.removeItem(statusCacheKey);
    }
    
    fetchStudentProfile(); // Refresh profile data
    showNotification('Profile saved successfully!', 'success');
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setShowProfileForm(true);
    setActiveTab('student-profile');
  };

  const handleCreateProfile = () => {
    setIsEditingProfile(false);
    setShowProfileForm(true);
    setActiveTab('student-profile');
  };

  const handleCancelProfile = () => {
    setShowProfileForm(false);
    setIsEditingProfile(false);
    setActiveTab('overview');
  };

  const handleAvatarSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file (JPG, PNG, GIF, etc.)', {
          duration: 4000,
          title: 'Invalid File Type!'
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be 5MB or less. Please choose a smaller image.', {
          duration: 4000,
          title: 'File Too Large!'
        });
        return;
      }

      setIsUploadingAvatar(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // Upload to the profile_picture bucket
      const { error: uploadError } = await supabase.storage
        .from('profile_picture')
        .upload(filePath, file, { 
          cacheControl: '3600', 
          upsert: true 
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile_picture')
        .getPublicUrl(filePath);

      // Update user state immediately for UI feedback
      setUser(prev => ({ ...prev, avatar_url: publicUrl }));

      // Persist avatar_url to user_profiles table
      try {
        const response = await fetch(`${API_BASE_URL}/api/user-profiles/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ 
            avatar_url: publicUrl,
            status: 'complete',
            profile_status: 'active'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn('Failed to persist avatar_url to user_profiles:', errorData);
        }
      } catch (e) {
        console.warn('Failed to persist avatar_url to user_profiles:', e);
      }

      try {
        await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      } catch (e) {
        console.warn('Failed to update auth metadata avatar_url:', e);
      }

      showSuccess('Your profile picture has been updated beautifully! ✨', {
        duration: 3000,
        title: 'Picture Updated!'
      });
      
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showError(`Failed to update your profile picture: ${err.message || 'Unknown error'}`, {
        duration: 5000,
        title: 'Upload Failed!'
      });
    } finally {
      setIsUploadingAvatar(false);
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg mt-4 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-orange-100 p-8 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">Setup Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'student-profile', label: 'Student Profile', icon: User },
    { id: 'room-allocation', label: 'Room Allocation', icon: UserCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'cleaning', label: 'Cleaning Requests', icon: Building2 },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'leave', label: 'Outpass', icon: Calendar },
    { id: 'profile', label: 'Account Settings', icon: Settings }
  ];

  const renderOverview = () => {
    const pendingList = payments.filter(p => p.status === 'pending');
    const pendingPayments = pendingList.length;
    const activeComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;
    const totalLeaveRequests = leaveRequests.length;

    // Check if profile is incomplete and restrict access
    const isProfileIncomplete = hasProfile === false || profileStatus === 'incomplete';
    const isProfileLoading = false; // Avoid indefinite loader; show explicit cards instead

    return (
      <div className="space-y-8">
        {/* Profile Completion Alert */}
        {/* Loader removed to prevent indefinite state */}

        {hasProfile === false && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">⚠️ Profile Required</h3>
                <p className="text-slate-600">Your student profile has not been created yet. Please contact the hostel administration to create your profile.</p>
              </div>
            </div>
          </div>
        )}


        {/* Pending Payment Callout */}
        {pendingPayments > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Payment Pending</h3>
                  <p className="text-slate-600">
                    You have {pendingPayments} pending {pendingPayments === 1 ? 'payment' : 'payments'}. Please complete the payment to continue.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('payments')}
                  className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  Proceed
                </button>
                <button
                  onClick={() => {
                    const firstPending = pendingList[0];
                    if (firstPending) {
                      setSelectedPayment(firstPending);
                      setShowRazorpayModal(true);
                    }
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        )}

        {hasProfile === true && profileStatus === 'pending_review' && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">⏳ Profile Under Review</h3>
                <p className="text-slate-600">Your profile is being reviewed by administration. You'll be notified once approved.</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats - Access restriction notice removed before completion */}

        {/* Loading indicator for data */}
        {isInitialLoad && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Loading Dashboard Data</h3>
                <p className="text-blue-600">Please wait while we fetch your information...</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Hero Stats Cards with Vibrant Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Status Card */}
          <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl p-8 overflow-hidden transform hover:scale-105 transition-all duration-300 animate-fadeIn group">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-700"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                {pendingPayments === 0 && (
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center animate-heartbeat">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              <h3 className="text-white/90 text-sm font-semibold uppercase tracking-wide mb-3">Payment Status</h3>
              
              {dataLoading.payments ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-white/20 rounded-lg w-32 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-40"></div>
                </div>
              ) : (
                <>
                  <p className="text-5xl font-extrabold text-white mb-2">
                    {pendingPayments > 0 ? pendingPayments : '0'}
                  </p>
                  <p className="text-white/80 text-sm font-medium">
                    {pendingPayments > 0 ? 'Outstanding payments' : 'All up to date'}
                  </p>
                  {pendingPayments === 0 && (
                    <div className="mt-4 flex items-center text-white/90 text-xs">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>All Clear</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Active Complaints Card */}
          <div className="relative bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 rounded-3xl shadow-2xl p-8 overflow-hidden transform hover:scale-105 transition-all duration-300 animate-fadeIn delay-100 group">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-300"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                {activeComplaints === 0 && (
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center animate-heartbeat">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              <h3 className="text-white/90 text-sm font-semibold uppercase tracking-wide mb-3">Active Issues</h3>
              
              {dataLoading.complaints ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-white/20 rounded-lg w-16 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-40"></div>
                </div>
              ) : (
                <>
                  <p className="text-5xl font-extrabold text-white mb-2">{activeComplaints}</p>
                  <p className="text-white/80 text-sm font-medium">
                    {activeComplaints > 0 ? 'Issues need attention' : 'No active issues'}
                  </p>
                  {activeComplaints === 0 && (
                    <div className="mt-4 flex items-center text-white/90 text-xs">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>All Safe</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Outpass Card */}
          <div className="relative bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-3xl shadow-2xl p-8 overflow-hidden transform hover:scale-105 transition-all duration-300 animate-fadeIn delay-200 group">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-700"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                {totalLeaveRequests > 0 && (
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-white font-bold text-xs">{totalLeaveRequests}</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-white/90 text-sm font-semibold uppercase tracking-wide mb-3">Outpass Requests</h3>
              
              {dataLoading.leave ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-white/20 rounded-lg w-16 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-40"></div>
                </div>
              ) : (
                <>
                  <p className="text-5xl font-extrabold text-white mb-2">{totalLeaveRequests}</p>
                  <p className="text-white/80 text-sm font-medium">
                    {totalLeaveRequests > 0 ? 'Requests submitted' : 'No requests yet'}
                  </p>
                  {totalLeaveRequests > 0 && (
                    <div className="mt-4 flex items-center text-white/90 text-xs">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Track Status</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Recent Notifications</h2>
              <div className="text-sm text-slate-500">{notifications.length} unread</div>
            </div>
            
            <div className="space-y-4">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`flex items-start space-x-4 p-4 rounded-xl transition-colors ${
                  notification.type === 'room_allocation' ? 'bg-green-50 hover:bg-green-100' :
                  notification.type === 'payment_due' ? 'bg-yellow-50 hover:bg-yellow-100' :
                  'bg-blue-50 hover:bg-blue-100'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'room_allocation' ? 'bg-green-100 text-green-600' :
                    notification.type === 'payment_due' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {notification.type === 'room_allocation' ? <Home className="w-5 h-5" /> :
                     notification.type === 'payment_due' ? <CreditCard className="w-5 h-5" /> :
                     <Bell className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{notification.title}</p>
                    <p className="text-sm text-slate-600">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity with Enhanced Design */}
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-500 font-semibold">Last 7 days</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Recent Payments */}
            {payments.slice(0, 3).map((payment, index) => (
              <div 
                key={`payment-${payment.id}`} 
                className={`relative overflow-hidden rounded-2xl p-5 border-l-4 transform hover:scale-[1.02] transition-all duration-300 ${
                  payment.status === 'paid' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 hover:shadow-lg' 
                    : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-500 hover:shadow-lg'
                } animate-fadeIn`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`relative ${
                    payment.status === 'paid' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                  } w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                    <CreditCard className="w-7 h-7 text-white" />
                    {payment.status === 'paid' && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center animate-heartbeat">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      Payment {payment.status === 'paid' ? 'received' : 'due'} for {payment.month}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      ${payment.amount} • {payment.status === 'paid' ? payment.paidDate : payment.dueDate}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md ${
                    payment.status === 'paid' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Recent Complaints */}
            {complaints.slice(0, 2).map((complaint, index) => (
              <div 
                key={`complaint-${complaint.id}`} 
                className={`relative overflow-hidden rounded-2xl p-5 border-l-4 transform hover:scale-[1.02] transition-all duration-300 ${
                  complaint.status === 'resolved' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500' :
                  complaint.status === 'in_progress' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500' :
                  'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-500'
                } hover:shadow-lg animate-fadeIn`}
                style={{ animationDelay: `${(payments.length + index) * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 ${
                    complaint.status === 'resolved' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                    complaint.status === 'in_progress' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                    'bg-gradient-to-br from-yellow-500 to-amber-500'
                  }`}>
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{complaint.title}</p>
                    <p className="text-sm text-gray-600 font-medium">Submitted on {complaint.createdAt}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md ${
                    complaint.status === 'resolved' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                    complaint.status === 'in_progress' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' :
                    'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                  }`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Recent Outpass */}
            {leaveRequests.slice(0, 2).map((request, index) => (
              <div 
                key={`leave-${request.id}`} 
                className={`relative overflow-hidden rounded-2xl p-5 border-l-4 transform hover:scale-[1.02] transition-all duration-300 ${
                  request.status === 'approved' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500' :
                  request.status === 'rejected' ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-500' :
                  'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-500'
                } hover:shadow-lg animate-fadeIn`}
                style={{ animationDelay: `${(payments.length + complaints.length + index) * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 ${
                    request.status === 'approved' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                    request.status === 'rejected' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                    'bg-gradient-to-br from-purple-500 to-indigo-600'
                  }`}>
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{request.reason}</p>
                    <p className="text-sm text-gray-600 font-medium">
                      {request.startDate} to {request.endDate}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md ${
                    request.status === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                    request.status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' :
                    'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                  }`}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}

            {/* Show message if no recent activity */}
            {payments.length === 0 && complaints.length === 0 && leaveRequests.length === 0 && (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Clock className="w-10 h-10 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 font-bold text-lg mb-2">No recent activity</p>
                <p className="text-sm text-gray-400 font-semibold">Your recent actions will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  const renderPayments = () => {
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const paidPayments = payments.filter(p => p.status === 'paid');
    const overduePayments = payments.filter(p => p.status === 'overdue');

    return (
      <div className="space-y-6">
        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Payments</p>
                <p className="text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Paid Payments</p>
                <p className="text-2xl font-bold text-green-600">{paidPayments.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overduePayments.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
          <div className="p-6 border-b border-amber-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Payment History</h2>
              <button 
                onClick={exportPaymentsCSV} 
                className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paid By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 capitalize">
                        {payment.payment_type?.replace('_', ' ') || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      ₹{payment.amount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {payment.paid_by_role ? (
                        <div>
                          <div className="font-medium capitalize">{payment.paid_by_role}</div>
                          {payment.paid_at && (
                            <div className="text-xs text-slate-500">
                              {new Date(payment.paid_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handlePayNow(payment)}
                          className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                          Pay Now
                        </button>
                      )}
                      {payment.status === 'paid' && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Paid</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {payments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Payments Found</h3>
              <p className="text-slate-600">You don't have any payment records yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderComplaints = () => {
    const isProfileIncomplete = hasProfile === false || profileStatus === 'incomplete';
    const isProfileLoading = hasProfile === null || profileStatus === null;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">My Complaints</h2>
          <button 
            onClick={() => {
              if (isProfileLoading) {
                showNotification('Please wait while we check your profile status', 'info');
                return;
              }
              if (isProfileIncomplete) {
                showNotification('Please complete your profile before submitting complaints', 'error');
                return;
              }
              setShowComplaintModal(true);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
              isProfileLoading || isProfileIncomplete
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
            disabled={isProfileLoading || isProfileIncomplete}
          >
            <Plus className="w-4 h-4" />
            <span>New Complaint</span>
          </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          value={complaintSearch}
          onChange={(e) => setComplaintSearch(e.target.value)}
          placeholder="Search complaints..."
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <select
          value={complaintStatusFilter}
          onChange={(e) => { setComplaintStatusFilter(e.target.value); }}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={complaintCategoryFilter}
          onChange={(e) => { setComplaintCategoryFilter(e.target.value); }}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="maintenance">Maintenance</option>
          <option value="cleanliness">Cleanliness</option>
          <option value="noise">Noise</option>
          <option value="security">Security</option>
          <option value="food">Food</option>
          <option value="wifi">WiFi</option>
        </select>
        <button
          onClick={() => { setComplaintStatusFilter(''); setComplaintCategoryFilter(''); setComplaintSearch(''); }}
          className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Clear Filters
        </button>
      </div>
      
      <div className="space-y-4">
        {complaints
          .filter(c =>
            complaintSearch.trim() === '' ||
            c.title.toLowerCase().includes(complaintSearch.toLowerCase()) ||
            c.description.toLowerCase().includes(complaintSearch.toLowerCase())
          )
          .map((complaint) => (
          <div key={complaint.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{complaint.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    complaint.status === 'resolved' 
                      ? 'bg-green-100 text-green-800' 
                      : complaint.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="text-slate-600 mb-3">{complaint.description}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Created: {complaint.createdAt}</span>
                  {complaint.resolvedAt && <span>Resolved: {complaint.resolvedAt}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleOpenEditComplaint(complaint)} className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Update</span>
                </button>
                <button onClick={() => handleDeleteComplaint(complaint)} className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  };

  const renderLeaveRequests = () => {
    const isProfileIncomplete = hasProfile === false || profileStatus === 'incomplete';
    const isProfileLoading = hasProfile === null || profileStatus === null;
    
    // Calculate statistics
    const totalRequests = leaveRequests.length;
    const pendingRequests = leaveRequests.filter(r => r.status === 'pending').length;
    const approvedRequests = leaveRequests.filter(r => r.status === 'approved').length;
    const rejectedRequests = leaveRequests.filter(r => r.status === 'rejected').length;
    
    console.log('🔍 renderLeaveRequests - leaveRequests array:', leaveRequests);
    console.log('🔍 renderLeaveRequests - totalRequests:', totalRequests);
    console.log('🔍 renderLeaveRequests - dataLoading.leave:', dataLoading.leave);
    
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Outpass Requests</h2>
            <p className="text-slate-600 mt-1">Manage your leave and outpass applications</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                if (isProfileLoading) {
                  showNotification('Please wait while we check your profile status', 'info');
                  return;
                }
                if (isProfileIncomplete) {
                  showNotification('Please complete your profile before submitting outpass requests', 'error');
                  return;
                }
                setShowOutpassModal(true);
              }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl ${
                isProfileLoading || isProfileIncomplete
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700'
              }`}
              disabled={isProfileLoading || isProfileIncomplete}
            >
              <Plus className="w-5 h-5" />
              <span>+ New Outpass</span>
            </button>
            
            <button 
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                fetchLeaveRequests();
                showInfo('Refreshing outpass requests...', {
                  duration: 2000,
                  title: 'Refreshing...'
                });
              }}
              className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl hover:bg-blue-700"
            >
              <Clock className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Requests</p>
                <p className="text-2xl font-bold text-slate-800">{totalRequests}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedRequests}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedRequests}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={leaveSearch}
                onChange={(e) => setLeaveSearch(e.target.value)}
                placeholder="Search by reason, destination, or transport mode..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={leaveStatusFilter}
              onChange={(e) => { setLeaveStatusFilter(e.target.value); }}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => { setLeaveStatusFilter(''); setLeaveSearch(''); }}
              className="px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      
      <div className="space-y-4">
        {/* Outpass Requests List */}
        <div className="space-y-6">
          {leaveRequests
            .filter(r =>
              leaveSearch.trim() === '' ||
              r.reason.toLowerCase().includes(leaveSearch.toLowerCase()) ||
              (r.destination && r.destination.toLowerCase().includes(leaveSearch.toLowerCase())) ||
              (r.transport_mode && r.transport_mode.toLowerCase().includes(leaveSearch.toLowerCase()))
            )
            .filter(r => leaveStatusFilter === '' || r.status === leaveStatusFilter)
            .map((request) => (
            <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{request.reason}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      request.status === 'approved' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {request.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                      {request.status === 'approved' && <CheckCircle className="w-4 h-4 mr-1" />}
                      {request.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  
                  {/* Request Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-semibold text-slate-700">Departure</span>
                      </div>
                      <p className="text-sm text-slate-600">{request.startDate}</p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-slate-700">Return</span>
                      </div>
                      <p className="text-sm text-slate-600">{request.endDate}</p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-slate-700">Destination</span>
                      </div>
                      <p className="text-sm text-slate-600">{request.destination || 'Not specified'}</p>
                    </div>
                    
                    {request.transport_mode && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-semibold text-slate-700">Transport</span>
                        </div>
                        <p className="text-sm text-slate-600 capitalize">{request.transport_mode}</p>
                      </div>
                    )}
                    
                    {request.emergency_contact && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Phone className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-semibold text-slate-700">Emergency Contact</span>
                        </div>
                        <p className="text-sm text-slate-600">{request.emergency_contact}</p>
                        {request.emergency_phone && (
                          <p className="text-xs text-slate-500 mt-1">{request.emergency_phone}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-semibold text-slate-700">Submitted</span>
                      </div>
                      <p className="text-sm text-slate-600">{request.createdAt}</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {request.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleEditOutpass(request)} 
                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="font-medium">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteLeave(request)} 
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">Delete</span>
                      </button>
                    </>
                  )}
                  
                  {request.status === 'approved' && (
                    <>
                      <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Approved</span>
                      </div>
                      <button 
                        onClick={() => handleExtendOutpass(request)} 
                        className="flex items-center space-x-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-300"
                      >
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Extend</span>
                      </button>
                    </>
                  )}

                  {request.status === 'rejected' && (
                    <button 
                      onClick={() => handleEditOutpass(request)} 
                      className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="font-medium">Resubmit</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Rejection Reason */}
              {request.status === 'rejected' && request.rejection_reason && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2 text-sm text-red-700 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Rejection Reason</span>
                  </div>
                  <p className="text-sm text-red-800 leading-relaxed">{request.rejection_reason}</p>
                </div>
              )}
            </div>
          ))}

          {/* Empty State */}
          {leaveRequests.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-amber-100">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">No Outpass Requests Yet</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                You haven't submitted any outpass requests yet. Click the button below to submit your first request.
              </p>
              <button
                onClick={() => {
                  if (isProfileLoading) {
                    showNotification('Please wait while we check your profile status', 'info');
                    return;
                  }
                  if (isProfileIncomplete) {
                    showNotification('Please complete your profile before submitting outpass requests', 'error');
                    return;
                  }
                  setShowOutpassModal(true);
                }}
                className={`px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl ${
                  isProfileLoading || isProfileIncomplete
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700'
                }`}
                disabled={isProfileLoading || isProfileIncomplete}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Submit Your First Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setError('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      // Validate form data
      const parsed = profileUpdateSchema.safeParse(profileForm);
      if (!parsed.success) {
        const firstError = parsed.error.errors[0];
        setError(firstError?.message || 'Invalid input');
        return;
      }

      const { fullName, phone } = parsed.data;

      // Update user_profiles table using backend API
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/api/user-profiles/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            // Update basic user information
            full_name: fullName,
            phone: phone,
            // Include existing profile data
            admission_number: studentProfile?.admission_number || '',
            course: studentProfile?.course || '',
            batch_year: studentProfile?.batch_year || null,
            date_of_birth: studentProfile?.date_of_birth || null,
            gender: studentProfile?.gender || null,
            address: studentProfile?.address || null,
            city: studentProfile?.city || null,
            state: studentProfile?.state || null,
            country: studentProfile?.country || null,
            emergency_contact_name: studentProfile?.emergency_contact_name || null,
            emergency_contact_phone: studentProfile?.emergency_contact_phone || null,
            parent_name: studentProfile?.parent_name || null,
            parent_phone: studentProfile?.parent_phone || null,
            parent_email: studentProfile?.parent_email || null,
            aadhar_number: studentProfile?.aadhar_number || null,
            blood_group: studentProfile?.blood_group || null,
            room_id: studentProfile?.room_id || null,
            avatar_url: studentProfile?.avatar_url || null,
            status: 'complete',
            profile_status: 'active'
          })
        });

        if (!profileResponse.ok) {
          const errorResult = await profileResponse.json();
          console.warn('User profile updated but detailed profile update failed:', errorResult);
        }
      } catch (profileError) {
        console.warn('User profile updated but detailed profile update failed:', profileError);
      }

      // Update local state
      setUser(prev => ({ 
        ...prev, 
        fullName: fullName,
        full_name: fullName, 
        phone: phone,
        avatar_url: prev.avatar_url // Preserve existing avatar URL
      }));

        // Show success message
        setError('');
        showSuccess('Your profile has been updated successfully! 🎉', {
          duration: 4000,
          title: 'Profile Updated!'
        });
      
      // Refresh profile data
      await fetchStudentProfile();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const renderStudentProfile = () => {
    console.log('🔍 renderStudentProfile called with:', {
      hasProfile,
      studentProfile: studentProfile ? 'exists' : 'null',
      showProfileForm,
      dataLoading: dataLoading.profile
    });
    
    if (showProfileForm) {
      return (
        <StudentProfileForm
          onSuccess={handleProfileSuccess}
          onCancel={handleCancelProfile}
          initialData={isEditingProfile ? studentProfile : null}
          isEdit={isEditingProfile}
          showHeader={false}
        />
      );
    }

    // Show loading state while profile is being fetched
    if (hasProfile === null || dataLoading.profile) {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Loading Profile...</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Please wait while we load your student profile information.
            </p>
          </div>
        </div>
      );
    }

    if (!hasProfile) {
      return (
        <StudentProfileForm
          onSuccess={handleProfileSuccess}
          onCancel={handleCancelProfile}
          initialData={null}
          isEdit={false}
          showHeader={false}
        />
      );
    }

    // Show read-only profile view
    return <StudentProfileView studentProfile={studentProfile} user={user} />;
  };

  const renderProfile = () => (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 rounded-3xl shadow-2xl border border-amber-200/50 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div 
                className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-2 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer"
                onClick={handleAvatarSelect}
                title="Click to update profile picture"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors duration-300">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
              </div>
              {/* Upload button overlay */}
              <button
                type="button"
                onClick={handleAvatarSelect}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-full p-3 shadow-lg transform hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Update profile picture"
              >
                {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              {/* Hidden file input */}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload} 
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{user?.full_name || 'User'}</h3>
              <p className="text-slate-600 text-lg mb-2">{user?.email}</p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Basic Info Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-amber-600" />
            Basic Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setProfileForm(prev => ({ ...prev, phone: sanitized }));
                }}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                placeholder="9876543210"
                maxLength={10}
                required
              />
              {profileForm.phone && profileForm.phone.length !== 10 && (
                <p className="text-sm text-amber-600">Phone number must be 10 digits</p>
              )}
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-slate-200 bg-slate-50 rounded-xl text-slate-600 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className={`px-8 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isSavingProfile || !profileForm.fullName || !profileForm.phone || profileForm.phone.length !== 10
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700'
              }`}
              disabled={isSavingProfile || !profileForm.fullName || !profileForm.phone || profileForm.phone.length !== 10}
            >
              {isSavingProfile ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const handleCreateComplaint = async (formData) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_BASE_URL}/api/complaints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowComplaintModal(false);
        fetchComplaints(); // Refresh complaints list
        showNotification('Complaint submitted successfully!', 'success');
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to submit complaint', 'error');
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
      showNotification('Failed to submit complaint', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLeaveRequest = async (formData, notify) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // First, try to find user profile by ID
      let { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      // If not found by ID, try to find by email
      if (profileError || !userProfile) {
        console.log('User not found by ID, trying by email:', session.user.email);
        const { data: userByEmail, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();

        if (emailError) {
          console.error('Error checking user by email:', emailError);
        } else if (userByEmail) {
          console.log('Found user by email, updating ID:', userByEmail);
          // Update the existing user with the correct ID
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ id: session.user.id })
            .eq('email', session.user.email)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating user ID:', updateError);
          } else {
            userProfile = updatedUser;
          }
        }
      }

      // If still no profile found, create a new one
      if (!userProfile) {
        console.log('Creating new user profile for:', session.user.email);
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            role: 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          console.error('Create error details:', JSON.stringify(createError, null, 2));
          
          // Handle specific error cases
          let errorMsg = 'Failed to create user profile. ';
          if (createError.code === '23505') {
            errorMsg += 'User already exists. Please refresh the page and try again.';
          } else if (createError.code === '23503') {
            errorMsg += 'Invalid user data. Please contact support.';
          } else {
            errorMsg += `Error: ${createError.message}`;
          }
          
          if (notify) notify(errorMsg, 'error'); else alert(errorMsg);
          return;
        }
        
        userProfile = newProfile;
      }

      // Now proceed with leave request creation
      const payload = {
        ...formData,
        user_id: session.user.id,
        hostel_id: user.hostel_id,
        room_id: user.room_id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Clean up empty optional fields
      if (!payload.emergency_contact) delete payload.emergency_contact;
      if (!payload.emergency_phone) delete payload.emergency_phone;

      console.log('Submitting payload:', payload);

      const { data, error } = await supabase
        .from('outpass_requests')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Detailed error creating outpass request:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        const errorMsg = `Failed to submit outpass request: ${error.message || error.details || 'Unknown error'}`;
        if (notify) notify(errorMsg, 'error'); else alert(errorMsg);
        return;
      }

      // Modal closed by OutpassModal component
      fetchLeaveRequests();
      
      const successMsg = 'Outpass request submitted successfully!';
      if (notify) notify(successMsg, 'success'); else alert(successMsg);
    } catch (error) {
      console.error('Exception creating outpass request:', error);
      if (notify) notify(`Failed to submit outpass request: ${error.message}`, 'error'); else alert(`Failed to submit outpass request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ComplaintModal = () => {
    const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
      resolver: zodResolver(complaintSchema),
      mode: 'onChange',
      defaultValues: { title: '', description: '', category: 'general', priority: 'medium' }
    });

    const onSubmit = (data) => {
      handleCreateComplaint(data);
      reset();
    };

    if (!showComplaintModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Submit New Complaint</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                {...register('title')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.title ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                placeholder="Brief description of the issue"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                {...register('category')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.category ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
              >
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="noise">Noise</option>
                <option value="security">Security</option>
                <option value="food">Food</option>
                <option value="wifi">WiFi</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                {...register('priority')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.priority ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                {...register('description')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                rows="4"
                placeholder="Detailed description of the issue"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowComplaintModal(false)}
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
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };


  // Export payments as CSV
  const exportPaymentsCSV = () => {
    if (!payments || payments.length === 0) {
      alert('No payments to export');
      return;
    }
    const headers = ['Payment Type', 'Amount', 'Due Date', 'Status', 'Paid By', 'Paid Date', 'Transaction Reference'];
    const rows = payments.map(p => [
      `"${p.payment_type?.replace('_', ' ') || 'Unknown'}"`,
      p.amount || 0,
      `"${p.due_date ? new Date(p.due_date).toLocaleDateString() : ''}"`,
      `"${p.status || 'pending'}"`,
      `"${p.paid_by_role || ''}"`,
      `"${p.paid_at ? new Date(p.paid_at).toLocaleDateString() : ''}"`,
      `"${p.transaction_reference || ''}"`
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'payments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    // Show Razorpay modal for online payments
    setShowRazorpayModal(true);
  };

  const handleRazorpaySuccess = (updatedPayment) => {
    showNotification('Payment completed successfully!', 'success');
    setShowRazorpayModal(false);
    setSelectedPayment(null);
    fetchPayments(); // Refresh payments
  };

  const handleRazorpayClose = () => {
    setShowRazorpayModal(false);
    setSelectedPayment(null);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPayment || !paymentForm.payment_method) return;
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showNotification('Not authenticated', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/payments/${selectedPayment.id}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          payment_method: paymentForm.payment_method,
          transaction_reference: paymentForm.transaction_reference,
          paid_by_role: 'student'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment failed');
      }

      showNotification('Payment marked as paid successfully!', 'success');
      setShowPaymentModal(false);
      setSelectedPayment(null);
      fetchPayments(); // Refresh payments
    } catch (error) {
      console.error('Payment error:', error);
      showNotification(error.message || 'Failed to process payment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit complaint flow
  const handleOpenEditComplaint = (complaint) => {
    if (complaint.status !== 'pending') {
      alert('Only pending complaints can be updated');
      return;
    }
    setEditingComplaint(complaint);
    setShowEditComplaintModal(true);
  };

  const handleUpdateComplaint = async (updates) => {
    if (!editingComplaint) return;
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_BASE_URL}/api/complaints/${editingComplaint.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setShowEditComplaintModal(false);
        setEditingComplaint(null);
        fetchComplaints();
        alert('Complaint updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update complaint');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Failed to update complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const EditComplaintModal = () => {
    const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
      resolver: zodResolver(complaintSchema),
      mode: 'onChange',
      defaultValues: {
        title: editingComplaint?.title || '',
        description: editingComplaint?.description || '',
        category: editingComplaint?.category || 'general',
        priority: editingComplaint?.priority || 'medium'
      }
    });

    useEffect(() => {
      if (editingComplaint) {
        reset({
          title: editingComplaint.title,
          description: editingComplaint.description,
          category: editingComplaint.category || 'general',
          priority: editingComplaint.priority || 'medium'
        });
      }
    }, [editingComplaint, reset]);

    const onSubmit = (data) => {
      handleUpdateComplaint(data);
    };

    if (!showEditComplaintModal || !editingComplaint) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Update Complaint</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                {...register('title')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.title ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                {...register('category')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.category ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
              >
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="noise">Noise</option>
                <option value="security">Security</option>
                <option value="food">Food</option>
                <option value="wifi">WiFi</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                {...register('priority')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.priority ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                {...register('description')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                rows="4"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowEditComplaintModal(false); setEditingComplaint(null); }}
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
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };



  // Delete complaint (pending only)
  const handleDeleteComplaint = async (complaint) => {
    if (complaint.status !== 'pending') {
      alert('Only pending complaints can be deleted');
      return;
    }
    if (!confirm('Delete this complaint?')) return;
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch(`${API_BASE_URL}/api/complaints/${complaint.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        fetchComplaints();
        alert('Complaint deleted');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete complaint');
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Failed to delete complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete outpass request (pending only)
  const handleDeleteLeave = async (request) => {
    if (request.status !== 'pending') {
      showWarning('Only pending outpass requests can be deleted', {
        duration: 3000,
        title: 'Cannot Delete!'
      });
      return;
    }
    
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Outpass Request',
      message: `Are you sure you want to delete this outpass request? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          // Use the backend API instead of direct Supabase query to handle user ID mapping correctly
          const response = await fetch(`${API_BASE_URL}/api/outpass/${request.id}/cancel`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const error = await response.json();
            console.error('Error deleting outpass request:', error);
            showError(error.message || 'Failed to delete outpass request', {
              duration: 4000,
              title: 'Delete Failed!'
            });
            return;
          }

          // Refresh the outpass requests list
          fetchLeaveRequests();
          showSuccess('Outpass request deleted successfully', {
            duration: 3000,
            title: 'Request Deleted!'
          });
          
          // Close the modal
          setConfirmationModal({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: null, isLoading: false });
        } catch (error) {
          console.error('Error deleting outpass request:', error);
          showError('Failed to delete outpass request', {
            duration: 4000,
            title: 'Delete Failed!'
          });
        } finally {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false
    });
  };

  // Edit outpass request (pending and rejected only)
  const handleEditOutpass = async (request) => {
    if (request.status !== 'pending' && request.status !== 'rejected') {
      showWarning('Only pending and rejected outpass requests can be edited', {
        duration: 4000,
        title: 'Cannot Edit!'
      });
      return;
    }
    
    setEditingOutpass(request);
    setShowEditOutpassModal(true);
  };

  // Extend outpass request (approved only)
  const handleExtendOutpass = async (request) => {
    if (request.status !== 'approved') {
      showWarning('Only approved outpass requests can be extended', {
        duration: 4000,
        title: 'Cannot Extend!'
      });
      return;
    }
    
    setExtendingOutpass(request);
    setShowExtendOutpassModal(true);
  };

  // Update outpass request
  const handleUpdateOutpass = async (formData) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_BASE_URL}/api/outpass/${editingOutpass.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowEditOutpassModal(false);
        setEditingOutpass(null);
        fetchLeaveRequests();
        showSuccess('Outpass request updated successfully!', {
          duration: 4000,
          title: 'Request Updated! ✨'
        });
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to update outpass request', {
          duration: 5000,
          title: 'Update Failed!'
        });
      }
    } catch (error) {
      console.error('Error updating outpass request:', error);
      showError('Failed to update outpass request', {
        duration: 5000,
        title: 'Update Failed!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Extend outpass request
  const handleExtendOutpassRequest = async (formData) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_BASE_URL}/api/outpass/${extendingOutpass.id}/extend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowExtendOutpassModal(false);
        setExtendingOutpass(null);
        fetchLeaveRequests();
        showSuccess('Outpass extension request submitted successfully!', {
          duration: 4000,
          title: 'Extension Requested! 🎉'
        });
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to submit extension request', {
          duration: 5000,
          title: 'Extension Failed!'
        });
      }
    } catch (error) {
      console.error('Error extending outpass request:', error);
      showError('Failed to submit extension request', {
        duration: 5000,
        title: 'Extension Failed!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'student-profile':
        return renderStudentProfile();
      case 'room-allocation':
        return <StudentRoomRequest />;
      case 'payments':
        return renderPayments();
      case 'cleaning':
        return <StudentCleaningRequest />;
      case 'complaints':
        return <StudentComplaints />;
      case 'leave':
        return renderLeaveRequests();
      case 'profile':
        return renderProfile();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gradient-to-b from-white to-orange-50 shadow-2xl border-r border-orange-200 fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-orange-200">
          <button 
            onClick={() => setActiveTab('overview')} 
            className="flex items-center space-x-3 group hover:opacity-90 transition-opacity"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">HostelHaven</span>
              <div className="text-xs text-orange-600 font-semibold">Student Portal</div>
            </div>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-orange-200">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div 
                className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 p-0.5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={handleAvatarSelect}
                title="Click to update profile picture"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url}
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full transition-all duration-300 group-hover:scale-105 group-hover:brightness-110" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center group-hover:from-orange-600 group-hover:to-amber-700 transition-all duration-300">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              </div>
              {/* Upload button overlay for sidebar */}
              <button
                type="button"
                onClick={handleAvatarSelect}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -left-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-full p-2 shadow-lg transform hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Update profile picture"
              >
                {isUploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
              {/* Online status indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg animate-heartbeat">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              {/* Hover effect ring */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-orange-300 transition-all duration-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{user.fullName}</p>
              <p className="text-sm text-orange-600 font-semibold">Student</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
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
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl animate-slideInRight'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50'
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
        <header className="bg-gradient-to-r from-white via-orange-50 to-amber-50 shadow-lg p-6 border-b-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage your hostel experience</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-bold text-gray-900">{user.fullName || 'Student'}</p>
                <p className="text-sm text-gray-500 font-semibold">Student Account</p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <span className="text-white font-extrabold text-lg">
                    {user.fullName?.charAt(0) || 'S'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="max-w-6xl mx-auto relative">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ComplaintModal />
      <OutpassModal 
        isOpen={showOutpassModal}
        onClose={() => setShowOutpassModal(false)}
        onSuccess={() => {
          fetchLeaveRequests();
          setShowOutpassModal(false);
        }}
      />
      
      {/* Edit Outpass Modal */}
      {showEditOutpassModal && editingOutpass && (
        <OutpassModal 
          isOpen={showEditOutpassModal}
          onClose={() => {
            setShowEditOutpassModal(false);
            setEditingOutpass(null);
          }}
          onSuccess={() => {
            fetchLeaveRequests();
            setShowEditOutpassModal(false);
            setEditingOutpass(null);
          }}
          editMode={true}
          editingRequest={editingOutpass}
        />
      )}
      
      {/* Extend Outpass Modal */}
      {showExtendOutpassModal && extendingOutpass && (
        <OutpassModal 
          isOpen={showExtendOutpassModal}
          onClose={() => {
            setShowExtendOutpassModal(false);
            setExtendingOutpass(null);
          }}
          onSuccess={() => {
            fetchLeaveRequests();
            setShowExtendOutpassModal(false);
            setExtendingOutpass(null);
          }}
          extendMode={true}
          extendingRequest={extendingOutpass}
        />
      )}
      
      <EditComplaintModal />
      
      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 pt-8"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowPaymentModal(false); setSelectedPayment(null); } }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-200">
            <div className="p-6 border-b border-amber-100">
              <h3 className="text-xl font-semibold text-slate-800">Make Payment</h3>
              <p className="text-slate-600 mt-1">Complete your payment for this item</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Payment Details */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Payment Type:</span>
                  <span className="text-sm text-slate-900 capitalize">
                    {selectedPayment.payment_type?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Amount:</span>
                  <span className="text-lg font-bold text-slate-900">
                    ₹{selectedPayment.amount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Due Date:</span>
                  <span className="text-sm text-slate-900">
                    {selectedPayment.due_date ? new Date(selectedPayment.due_date).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="online">Online Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Transaction Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transaction_reference}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, transaction_reference: e.target.value }))}
                    placeholder="Enter transaction ID or reference number"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">Important Note</p>
                    <p className="text-sm text-amber-700">
                      This will mark the payment as paid. Please ensure you have actually completed the payment before confirming.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={isSubmitting || !paymentForm.payment_method}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentDuePopup && dueNotification && (
        <div className="fixed inset-0 flex items-start justify-center z-50 pt-6" onClick={(e)=>{ if(e.target===e.currentTarget) setShowPaymentDuePopup(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-lg w-full mx-4">
            <div className="p-5 border-b border-amber-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Payment Due</h3>
              <button className="text-slate-400 hover:text-slate-600" onClick={()=>setShowPaymentDuePopup(false)}><X className="w-5 h-5"/></button>
            </div>
            <div className="p-5">
              <p className="text-slate-700">{dueNotification.message}</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={()=>openPayFromDue('online')} className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Pay Online</button>
                <button onClick={()=>openPayFromDue('cash')} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50">Pay Offline</button>
                <button onClick={handleDueProceed} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50">Proceed</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Payment Modal */}
      {showRazorpayModal && selectedPayment && (
        <RazorpayPaymentModal
          payment={selectedPayment}
          onClose={handleRazorpayClose}
          onSuccess={handleRazorpaySuccess}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: null, isLoading: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        isLoading={confirmationModal.isLoading}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default StudentDashboard;