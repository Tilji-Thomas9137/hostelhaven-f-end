import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../contexts/NotificationContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { complaintSchema, leaveRequestSchema, profileUpdateSchema } from '../../lib/validation';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { profileUtils } from '../../lib/supabaseUtils';
import StudentProfileForm from '../StudentProfileForm';
import StudentRoomRequest from './StudentRoomRequest';
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
  UserCheck
} from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dataLoading, setDataLoading] = useState({
    profile: true,
    room: true,
    payments: true,
    complaints: true,
    leave: true
  });
  const [roomDetails, setRoomDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditComplaintModal, setShowEditComplaintModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [showEditLeaveModal, setShowEditLeaveModal] = useState(false);
  const [editingLeaveRequest, setEditingLeaveRequest] = useState(null);
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

        // Fetch user profile from Supabase with avatar_url from user_profiles
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select(`
            *,
            user_profiles(avatar_url)
          `)
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

        setUser(userProfile);
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
          fetchLeaveRequests()
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

  // Refetch complaints when filters change
  useEffect(() => {
    fetchComplaints();
  }, [complaintStatusFilter, complaintCategoryFilter]);

  // Refetch leave requests when filters change
  useEffect(() => {
    fetchLeaveRequests();
  }, [leaveStatusFilter]);

  const fetchRoomDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Single optimized query to get room details with hostel and roommates
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select(`
          *,
          hostels(name, address, city, phone),
          users!rooms_room_id_fkey(id, full_name, email)
        `)
        .eq('users.email', session.user.email)
        .single();

      if (roomError) {
        console.error('Error fetching room details:', roomError);
        // If table doesn't exist, just set null
        if (roomError.message?.includes('relation') && roomError.message?.includes('does not exist')) {
          setRoomDetails(null);
          return;
        }
        return;
      }

      if (roomData) {
        // Filter out current user from roommates
        const roommates = roomData.users?.filter(roommate => roommate.email !== session.user.email) || [];
        
        setRoomDetails({
          id: roomData.id,
          roomNumber: roomData.room_number,
          floor: roomData.floor,
          roomType: roomData.room_type,
          capacity: roomData.capacity,
          occupied: roomData.occupied,
          price: roomData.price,
          status: roomData.status,
          hostel: {
            name: roomData.hostels?.name || 'N/A',
            address: roomData.hostels?.address || 'N/A',
            city: roomData.hostels?.city || 'N/A',
            phone: roomData.hostels?.phone || 'N/A'
          },
          roommates: roommates
        });
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
    } finally {
      setDataLoading(prev => ({ ...prev, room: false }));
    }
  };

  const fetchPayments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch payments from Supabase
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('due_date', { ascending: false })
        .limit(10);

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        // If table doesn't exist, just set empty array
        if (paymentsError.message?.includes('relation') && paymentsError.message?.includes('does not exist')) {
          setPayments([]);
          return;
        }
        return;
      }

      setPayments(paymentsData.map(payment => ({
        id: payment.id,
        month: payment.month_year || new Date(payment.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        amount: payment.amount,
        status: payment.status,
        dueDate: payment.due_date,
        paidDate: payment.paid_date
      })));
    } catch (error) {
      console.error('Error fetching payments:', error);
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
      if (!session) return;

      let query = supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (leaveStatusFilter) {
        query = query.eq('status', leaveStatusFilter);
      }

      const { data: leaveData, error: leaveError } = await query;

      if (leaveError) {
        console.error('Error fetching leave requests:', leaveError);
        // If table doesn't exist, just set empty array
        if (leaveError.message?.includes('relation') && leaveError.message?.includes('does not exist')) {
          setLeaveRequests([]);
          return;
        }
        return;
      }

      setLeaveRequests(leaveData.map(request => ({
        id: request.id,
        reason: request.reason,
        startDate: request.start_date,
        endDate: request.end_date,
        status: request.status,
        emergency_contact: request.emergency_contact,
        emergency_phone: request.emergency_phone,
        createdAt: new Date(request.created_at).toLocaleDateString()
      })));
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setDataLoading(prev => ({ ...prev, leave: false }));
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check cache first
      const cacheKey = `profile_${session.user.id}`;
      if (dataCache[cacheKey] && Date.now() - dataCache[cacheKey].timestamp < 30000) { // 30 second cache
        const cachedData = dataCache[cacheKey].data;
        setHasProfile(true);
        setStudentProfile(cachedData);
        setProfileCompletion(cachedData.completion);
        setProfileStatus(cachedData.status);
        setDataLoading(prev => ({ ...prev, profile: false }));
        return;
      }

      // Single optimized query to get profile with completion data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          users(full_name, email, phone),
          rooms(room_number, floor, room_type)
        `)
        .eq('user_id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching student profile:', profileError);
        setHasProfile(false);
        return;
      }

      if (profileData) {
        setHasProfile(true);
        setStudentProfile(profileData);

        // Calculate completion status directly from profile data
        const requiredFields = [
          'admission_number', 'course', 'batch_year', 'date_of_birth', 'gender',
          'address', 'city', 'state', 'country', 'emergency_contact_name',
          'emergency_contact_phone', 'parent_name', 'parent_phone', 'parent_email',
          'aadhar_number', 'blood_group'
        ];

        const missingFields = requiredFields.filter(field => !profileData[field] || profileData[field] === '');
        const completion = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);
        
        // Determine status based on completion
        let status = profileData.status || 'incomplete';
        if (completion === 100 && status === 'incomplete') {
          status = 'complete';
        }

        setProfileCompletion(completion);
        setProfileStatus(status);

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
        setHasProfile(false);
        // Cache the no profile status
        const statusCacheKey = `profile_status_${session.user.id}`;
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Setup Required</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-amber-600 text-white px-4 py-3 rounded-xl hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
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
    { id: 'student-profile', label: 'Student Profile', icon: User },
    { id: 'room-allocation', label: 'Room Allocation', icon: UserCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'leave', label: 'Leave Requests', icon: Calendar },
    { id: 'profile', label: 'Account Settings', icon: Settings }
  ];

  const renderOverview = () => {
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const activeComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;
    const totalLeaveRequests = leaveRequests.length;

    // Check if profile is incomplete and restrict access
    const isProfileIncomplete = hasProfile === false || profileStatus === 'incomplete';
    const isProfileLoading = hasProfile === null || profileStatus === null;

    return (
      <div className="space-y-8">
        {/* Profile Completion Alert */}
        {isProfileLoading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">Loading Profile Status</h3>
                <p className="text-slate-600">Please wait while we check your profile completion status...</p>
              </div>
            </div>
          </div>
        )}

        {hasProfile === false && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">⚠️ Profile Required</h3>
                <p className="text-slate-600">You must complete your student profile before accessing hostel services.</p>
              </div>
              <button
                onClick={handleCreateProfile}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all font-medium"
              >
                Create Profile
              </button>
            </div>
          </div>
        )}

        {hasProfile === true && profileStatus === 'incomplete' && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">⚠️ Profile Incomplete ({profileCompletion}%)</h3>
                <p className="text-slate-600">Complete your profile to access all hostel features and services.</p>
              </div>
              <button
                onClick={handleEditProfile}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all font-medium"
              >
                Complete Profile
              </button>
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

        {/* Quick Stats */}
        {isProfileIncomplete && !isProfileLoading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Access Restricted</h3>
                <p className="text-red-600">Complete your profile to access room details, payments, complaints, and leave requests.</p>
              </div>
            </div>
          </div>
        )}

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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">Room Assignment</h3>
                {dataLoading.room ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-900">{roomDetails?.roomNumber || 'Not Assigned'}</p>
                    {roomDetails && (
                      <p className="text-sm text-slate-600">Floor {roomDetails.floor} • {roomDetails.roomType}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                pendingPayments > 0 ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
              }`}>
                <CreditCard className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">Payment Status</h3>
                {dataLoading.payments ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <p className={`text-2xl font-bold ${pendingPayments > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {pendingPayments > 0 ? `${pendingPayments} Pending` : 'Up to Date'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {pendingPayments > 0 ? 'Outstanding payments' : 'All payments current'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                activeComplaints > 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
              }`}>
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">Active Complaints</h3>
                {dataLoading.complaints ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-8 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-900">{activeComplaints}</p>
                    <p className="text-sm text-slate-600">
                      {activeComplaints > 0 ? 'Issues pending resolution' : 'No active issues'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">Leave Requests</h3>
                {dataLoading.leave ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-8 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-900">{totalLeaveRequests}</p>
                    <p className="text-sm text-slate-600">
                      {totalLeaveRequests > 0 ? 'Total requests submitted' : 'No requests yet'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Recent Activity</h2>
            <div className="text-sm text-slate-500">Last 7 days</div>
          </div>
          
          <div className="space-y-4">
            {/* Recent Payments */}
            {payments.slice(0, 3).map((payment) => (
              <div key={`payment-${payment.id}`} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  payment.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">
                    Payment {payment.status === 'paid' ? 'received' : 'due'} for {payment.month}
                  </p>
                  <p className="text-sm text-slate-600">
                    ${payment.amount} • {payment.status === 'paid' ? payment.paidDate : payment.dueDate}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {payment.status}
                </div>
              </div>
            ))}
            
            {/* Recent Complaints */}
            {complaints.slice(0, 2).map((complaint) => (
              <div key={`complaint-${complaint.id}`} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  complaint.status === 'resolved' ? 'bg-green-100 text-green-600' : 
                  complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{complaint.title}</p>
                  <p className="text-sm text-slate-600">Submitted on {complaint.createdAt}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                  complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {complaint.status.replace('_', ' ')}
                </div>
              </div>
            ))}
            
            {/* Recent Leave Requests */}
            {leaveRequests.slice(0, 2).map((request) => (
              <div key={`leave-${request.id}`} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  request.status === 'approved' ? 'bg-green-100 text-green-600' : 
                  request.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{request.reason}</p>
                  <p className="text-sm text-slate-600">
                    {request.startDate} to {request.endDate}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  request.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {request.status}
                </div>
              </div>
            ))}

            {/* Show message if no recent activity */}
            {payments.length === 0 && complaints.length === 0 && leaveRequests.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No recent activity</p>
                <p className="text-sm text-slate-400 mt-1">Your recent actions will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Payment History</h2>
        <button onClick={exportPaymentsCSV} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{payment.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{payment.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {payment.paidDate || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Outpass Requests</h2>
            <p className="text-sm text-slate-600 mt-1">Manage your leave and outpass applications</p>
          </div>
          <button 
            onClick={() => {
              if (isProfileLoading) {
                showNotification('Please wait while we check your profile status', 'info');
                return;
              }
              if (isProfileIncomplete) {
                showNotification('Please complete your profile before submitting leave requests', 'error');
                return;
              }
              setShowLeaveModal(true);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
              isProfileLoading || isProfileIncomplete
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
            disabled={isProfileLoading || isProfileIncomplete}
          >
            <Plus className="w-4 h-4" />
            <span>New Outpass</span>
          </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          value={leaveSearch}
          onChange={(e) => setLeaveSearch(e.target.value)}
          placeholder="Search by reason or destination..."
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <select
          value={leaveStatusFilter}
          onChange={(e) => { setLeaveStatusFilter(e.target.value); }}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={() => { setLeaveStatusFilter(''); setLeaveSearch(''); }}
          className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Clear Filters
        </button>
      </div>
      
      <div className="space-y-4">
        {leaveRequests
          .filter(r =>
            leaveSearch.trim() === '' ||
            r.reason.toLowerCase().includes(leaveSearch.toLowerCase()) ||
            (r.destination && r.destination.toLowerCase().includes(leaveSearch.toLowerCase()))
          )
          .map((request) => (
          <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-slate-800">{request.reason}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Duration</span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-800">
                      {request.startDate} to {request.endDate}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>Destination</span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-800">
                      {request.destination || 'Not specified'}
                    </div>
                  </div>
                </div>

                {request.emergency_contact && request.emergency_phone && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2 text-sm text-slate-600 mb-1">
                      <Phone className="w-4 h-4" />
                      <span>Emergency Contact</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-slate-800">{request.emergency_contact}</span>
                      <span className="text-slate-500 mx-2">•</span>
                      <span className="text-slate-800">{request.emergency_phone}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Requested on {request.createdAt}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {request.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleOpenEditLeave(request)} 
                      className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteLeave(request)} 
                      className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {request.status === 'rejected' && request.rejection_reason && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center space-x-2 text-sm text-red-600 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Rejection Reason</span>
                </div>
                <p className="text-sm text-red-700">{request.rejection_reason}</p>
              </div>
            )}
          </div>
        ))}

        {leaveRequests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-amber-100">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Outpass Requests</h3>
            <p className="text-slate-600 mb-6">You haven't submitted any outpass requests yet.</p>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Submit Your First Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const parsed = profileUpdateSchema.safeParse(profileForm);
      if (!parsed.success) {
        alert(parsed.error.errors[0]?.message || 'Invalid input');
        return;
      }

      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({
          full_name: profileForm.fullName,
          phone: profileForm.phone
        })
        .eq('email', session.user.email)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        alert('Failed to update profile');
        return;
      }

      setUser(prev => ({ 
        ...prev, 
        full_name: updateData.full_name, 
        phone: updateData.phone 
      }));
      alert('Profile updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const renderStudentProfile = () => {
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

    if (!hasProfile) {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Complete Your Student Profile</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Create your student profile to access all hostel features, including room allocation, 
              payment tracking, and administrative services.
            </p>
            <button
              onClick={handleCreateProfile}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              Create Student Profile
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 p-1 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                    {studentProfile?.avatar_url ? (
                      <img 
                        src={studentProfile.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full transition-all duration-300 group-hover:scale-110 group-hover:brightness-110" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
                {/* Hover effect ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-300 transition-all duration-300"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{studentProfile?.users?.full_name || user.fullName}</h2>
                <p className="text-slate-600">{studentProfile?.admission_number}</p>
                <p className="text-sm text-slate-500">{studentProfile?.course} • Batch {studentProfile?.batch_year}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-slate-500">Profile Completion</div>
                <div className="text-lg font-semibold text-slate-800">
                  {profileCompletion !== null ? `${profileCompletion}%` : 'Loading...'}
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                {profileCompletion !== null ? (
                  <div 
                    className="w-8 h-8 rounded-full border-4 border-slate-200"
                    style={{
                      background: `conic-gradient(from 0deg, #3b82f6 0deg, #3b82f6 ${profileCompletion * 3.6}deg, #e2e8f0 ${profileCompletion * 3.6}deg)`
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-4 border-slate-200 animate-pulse bg-slate-200" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                profileStatus === null 
                  ? 'bg-slate-100 text-slate-600 animate-pulse' 
                  : studentProfile?.profile_status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profileStatus === null ? 'Loading...' : (studentProfile?.profile_status === 'active' ? 'Active' : 'Inactive')}
              </span>
              {studentProfile?.rooms && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Room {studentProfile.rooms.room_number}
                </span>
              )}
            </div>
            <button
              onClick={handleEditProfile}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Date of Birth</label>
                <p className="text-slate-800">{studentProfile?.date_of_birth ? new Date(studentProfile.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Gender</label>
                <p className="text-slate-800 capitalize">{studentProfile?.gender || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Blood Group</label>
                <p className="text-slate-800">{studentProfile?.blood_group || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Aadhar Number</label>
                <p className="text-slate-800">{studentProfile?.aadhar_number || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Address</label>
                <p className="text-slate-800">{studentProfile?.address || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">City, State</label>
                <p className="text-slate-800">{studentProfile?.city && studentProfile?.state ? `${studentProfile.city}, ${studentProfile.state}` : 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Country</label>
                <p className="text-slate-800">{studentProfile?.country || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Emergency Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Contact Name</label>
                <p className="text-slate-800">{studentProfile?.emergency_contact_name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Contact Phone</label>
                <p className="text-slate-800">{studentProfile?.emergency_contact_phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Parent/Guardian</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Name</label>
                <p className="text-slate-800">{studentProfile?.parent_name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Phone</label>
                <p className="text-slate-800">{studentProfile?.parent_phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-slate-800">{studentProfile?.parent_email || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {studentProfile?.bio && (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">About</h3>
            <p className="text-slate-700">{studentProfile.bio}</p>
          </div>
        )}
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Account Settings</h2>
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-1 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                {user?.user_profiles?.avatar_url ? (
                  <img 
                    src={user.user_profiles.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full transition-all duration-300 group-hover:scale-110 group-hover:brightness-110" 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:from-amber-600 group-hover:to-orange-700 transition-all duration-300">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
            </div>
            {/* Edit overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="text-white text-xs font-medium bg-black bg-opacity-30 px-2 py-1 rounded-full">Edit</div>
            </div>
            {/* Hover effect ring */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-amber-300 transition-all duration-300"></div>
          </div>
          <div className="flex-1">
            <div className="text-slate-800 font-bold text-lg">{user.fullName}</div>
            <div className="text-slate-600 text-sm font-medium">{user.email}</div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">Online</span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Assignment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Hostel</label>
            <p className="text-slate-800">{user.hostel?.name || 'Not Assigned'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Room</label>
            <p className="text-slate-800">{user.room?.room_number || roomDetails?.roomNumber || 'Not Assigned'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const handleCreateComplaint = async (formData) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/complaints', {
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
        .from('leave_requests')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Detailed error creating leave request:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        const errorMsg = `Failed to submit leave request: ${error.message || error.details || 'Unknown error'}`;
        if (notify) notify(errorMsg, 'error'); else alert(errorMsg);
        return;
      }

      setShowLeaveModal(false);
      fetchLeaveRequests();
      
      const successMsg = 'Leave request submitted successfully!';
      if (notify) notify(successMsg, 'success'); else alert(successMsg);
    } catch (error) {
      console.error('Exception creating leave request:', error);
      if (notify) notify(`Failed to submit leave request: ${error.message}`, 'error'); else alert(`Failed to submit leave request: ${error.message}`);
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

  const LeaveRequestModal = () => {
    const { register, handleSubmit, watch, reset, formState: { errors, isValid } } = useForm({
      resolver: zodResolver(leaveRequestSchema),
      mode: 'onChange',
      defaultValues: { 
        reason: '', 
        start_date: '', 
        end_date: '', 
        destination: '',
        emergency_contact: '', 
        emergency_phone: '' 
      }
    });
    const [message, setMessage] = useState(null);

    const onSubmit = (data) => {
      handleCreateLeaveRequest(data, (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
      });
      reset();
    };

    if (!showLeaveModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Submit Outpass Request</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {message && (
              <div className={`px-3 py-2 rounded text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {message.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Leave</label>
              <input
                type="text"
                {...register('reason')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.reason ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                placeholder="E.g., Weekend trip home, Family function, Medical appointment"
              />
              {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
              <input
                type="text"
                {...register('destination')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.destination ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                placeholder="Where are you going?"
              />
              {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('start_date')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.start_date ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  {...register('end_date')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.end_date ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                  min={watch('start_date') || new Date().toISOString().split('T')[0]}
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Emergency Contact Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    {...register('emergency_contact')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.emergency_contact ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                    placeholder="Parent/Guardian name"
                  />
                  {errors.emergency_contact && <p className="mt-1 text-sm text-red-600">{errors.emergency_contact.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    {...register('emergency_phone')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.emergency_phone ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                    placeholder="10-digit mobile number"
                  />
                  {errors.emergency_phone && <p className="mt-1 text-sm text-red-600">{errors.emergency_phone.message}</p>}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
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
                {isSubmitting ? 'Submitting...' : 'Submit Outpass'}
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
    const headers = ['Month', 'Amount', 'Due Date', 'Status', 'Paid Date'];
    const rows = payments.map(p => [
      `"${p.month}"`,
      p.amount,
      `"${p.dueDate || ''}"`,
      `"${p.status}"`,
      `"${p.paidDate || ''}"`
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

      const response = await fetch(`http://localhost:3002/api/complaints/${editingComplaint.id}`, {
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

  // Edit leave flow
  const handleOpenEditLeave = (request) => {
    if (request.status !== 'pending') {
      alert('Only pending leave requests can be edited');
      return;
    }
    setEditingLeaveRequest(request);
    setShowEditLeaveModal(true);
  };

  const handleUpdateLeaveRequest = async (updates) => {
    if (!editingLeaveRequest) return;
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Clean up empty optional fields and add updated_at
      const payload = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      if (!payload.emergency_contact) delete payload.emergency_contact;
      if (!payload.emergency_phone) delete payload.emergency_phone;

      const { error } = await supabase
        .from('leave_requests')
        .update(payload)
        .eq('id', editingLeaveRequest.id)
        .eq('user_id', session.user.id) // Ensure user owns the request
        .eq('status', 'pending'); // Only allow updating pending requests

      if (error) {
        console.error('Error updating leave request:', error);
        alert(error.message || 'Failed to update leave request');
        return;
      }

      setShowEditLeaveModal(false);
      setEditingLeaveRequest(null);
      fetchLeaveRequests();
      alert('Leave request updated successfully!');
    } catch (error) {
      console.error('Error updating leave request:', error);
      alert('Failed to update leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const EditLeaveModal = () => {
    const { register, handleSubmit, watch, formState: { errors, isValid }, reset } = useForm({
      resolver: zodResolver(leaveRequestSchema),
      mode: 'onChange',
      defaultValues: {
        reason: editingLeaveRequest?.reason || '',
        destination: editingLeaveRequest?.destination || '',
        start_date: editingLeaveRequest?.startDate || '',
        end_date: editingLeaveRequest?.endDate || '',
        emergency_contact: editingLeaveRequest?.emergency_contact || '',
        emergency_phone: editingLeaveRequest?.emergency_phone || ''
      }
    });

    useEffect(() => {
      if (editingLeaveRequest) {
        reset({
          reason: editingLeaveRequest.reason,
          destination: editingLeaveRequest.destination || '',
          start_date: editingLeaveRequest.startDate,
          end_date: editingLeaveRequest.endDate,
          emergency_contact: editingLeaveRequest.emergency_contact || '',
          emergency_phone: editingLeaveRequest.emergency_phone || ''
        });
      }
    }, [editingLeaveRequest, reset]);

    const onSubmit = (data) => {
      handleUpdateLeaveRequest(data);
    };

    if (!showEditLeaveModal || !editingLeaveRequest) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Edit Outpass Request</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Leave</label>
              <input
                type="text"
                {...register('reason')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.reason ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                placeholder="E.g., Weekend trip home, Family function, Medical appointment"
              />
              {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
              <input
                type="text"
                {...register('destination')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.destination ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                placeholder="Where are you going?"
              />
              {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('start_date')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.start_date ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  {...register('end_date')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.end_date ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                  min={watch('start_date') || new Date().toISOString().split('T')[0]}
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Emergency Contact Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    {...register('emergency_contact')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.emergency_contact ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                    placeholder="Parent/Guardian name"
                  />
                  {errors.emergency_contact && <p className="mt-1 text-sm text-red-600">{errors.emergency_contact.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    {...register('emergency_phone')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.emergency_phone ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                    placeholder="10-digit mobile number"
                  />
                  {errors.emergency_phone && <p className="mt-1 text-sm text-red-600">{errors.emergency_phone.message}</p>}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowEditLeaveModal(false); setEditingLeaveRequest(null); }}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
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
      const response = await fetch(`http://localhost:3002/api/complaints/${complaint.id}`, {
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

  // Delete leave request (pending only)
  const handleDeleteLeave = async (request) => {
    if (request.status !== 'pending') {
      alert('Only pending leave requests can be deleted');
      return;
    }
    if (!confirm('Delete this leave request?')) return;
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', request.id)
        .eq('user_id', session.user.id) // Ensure user owns the request
        .eq('status', 'pending'); // Only allow deleting pending requests

      if (error) {
        console.error('Error deleting leave request:', error);
        alert(error.message || 'Failed to delete leave request');
        return;
      }

      fetchLeaveRequests();
      alert('Leave request deleted successfully');
    } catch (error) {
      console.error('Error deleting leave request:', error);
      alert('Failed to delete leave request');
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
      case 'complaints':
        return renderComplaints();
      case 'leave':
        return renderLeaveRequests();
      case 'profile':
        return renderProfile();
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
          <button 
            onClick={() => setActiveTab('overview')} 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">HostelHaven</span>
              <div className="text-xs text-slate-500">Student Portal</div>
            </div>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-amber-200/50">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-0.5 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                  {user?.user_profiles?.avatar_url ? (
                    <img 
                      src={user.user_profiles.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full transition-all duration-300 group-hover:scale-105 group-hover:brightness-110" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:from-amber-600 group-hover:to-orange-700 transition-all duration-300">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              </div>
              {/* Online status indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              {/* Hover effect ring */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-amber-300 transition-all duration-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">{user.fullName}</p>
              <p className="text-sm text-slate-600 font-medium">Student</p>
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
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
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-slate-600">Manage your hostel experience</p>
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
      <ComplaintModal />
      <LeaveRequestModal />
      <EditComplaintModal />
      <EditLeaveModal />
    </div>
  );
};

export default StudentDashboard; 