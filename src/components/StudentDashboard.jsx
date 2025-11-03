import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  GraduationCap
} from 'lucide-react';

// Validation schema for complaints
const complaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255, 'Title must be less than 255 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.enum(['maintenance', 'cleanliness', 'noise', 'security', 'food', 'wifi', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
});

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomDetails, setRoomDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomRequests, setRoomRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRoomRequestModal, setShowRoomRequestModal] = useState(false);
  const [showEditComplaintModal, setShowEditComplaintModal] = useState(false);
  const [showEditLeaveModal, setShowEditLeaveModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [editingLeaveRequest, setEditingLeaveRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

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
          
          // Fetch all dashboard data
          fetchRoomDetails();
          fetchPayments();
          fetchComplaints();
          fetchLeaveRequests();
          fetchAvailableRooms();
          fetchRoomRequests();
          fetchRecentActivity();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Live update: when admin approves and updates users.room_id, refresh room details
  useEffect(() => {
    let channel;
    const subscribeToRoomAssignment = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      channel = supabase
        .channel(`users-room-${session.user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${session.user.id}`
        }, (payload) => {
          const oldRoomId = payload?.old?.room_id || null;
          const newRoomId = payload?.new?.room_id || null;
          if (oldRoomId !== newRoomId) {
            fetchRoomDetails();
          }
        })
        .subscribe();
    };

    subscribeToRoomAssignment();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchRoomDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/rooms/my-room', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data.room) {
          setRoomDetails({
            id: result.data.room.id,
            roomNumber: result.data.room.room_number,
            floor: result.data.room.floor,
            roomType: result.data.room.room_type,
            capacity: result.data.room.capacity,
            occupied: result.data.room.occupied,
            price: result.data.room.price,
            status: result.data.room.status,
            hostel: {
              name: result.data.hostel?.name || 'N/A',
              address: result.data.hostel?.address || 'N/A',
              city: result.data.hostel?.city || 'N/A',
              phone: result.data.hostel?.phone || 'N/A'
            },
            roommates: result.data.roommates || []
          });
        } else {
          setRoomDetails(null);
        }
      } else {
        setRoomDetails(null);
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/payments/student?limit=10', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setPayments(result.data.payments.map(payment => ({
          id: payment.id,
          month: payment.month_year || new Date(payment.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          amount: payment.amount,
          status: payment.status,
          dueDate: payment.due_date,
          paidDate: payment.paid_date
        })));
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/student-complaints?limit=10', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setComplaints(result.data.complaints.map(complaint => ({
          id: complaint.id,
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
          priority: complaint.priority,
          status: complaint.status,
          createdAt: new Date(complaint.created_at).toLocaleDateString(),
          resolvedAt: complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleDateString() : null
        })));
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/student-leave-requests?limit=10', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setLeaveRequests(result.data.leaveRequests.map(request => ({
          id: request.id,
          reason: request.reason,
          startDate: request.from_date,
          endDate: request.to_date,
          status: request.status,
          createdAt: new Date(request.created_at).toLocaleDateString()
        })));
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/rooms/available', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAvailableRooms(result.data.rooms.map(room => ({
          id: room.id,
          roomNumber: room.room_number,
          floor: room.floor,
          roomType: room.room_type,
          capacity: room.capacity,
          currentOccupancy: room.current_occupancy,
          rentAmount: room.rent_amount,
          status: room.status,
          hostel: room.hostels
        })));
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    }
  };

  const fetchRoomRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/rooms/requests', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRoomRequests(result.data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching room requests:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const activities = [];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch recent payments
      const paymentsResponse = await fetch('http://localhost:3002/api/payments/student?limit=5', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (paymentsResponse.ok) {
        const paymentsResult = await paymentsResponse.json();
        paymentsResult.data.payments.forEach(payment => {
          const paymentDate = new Date(payment.created_at || payment.due_date);
          if (paymentDate >= sevenDaysAgo) {
            activities.push({
              id: `payment-${payment.id}`,
              type: 'payment',
              title: payment.status === 'paid' ? 'Payment Received' : 'Payment Due',
              description: payment.status === 'paid' 
                ? `Payment of ₹${payment.amount} received for ${payment.month_year || new Date(payment.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                : `Payment of ₹${payment.amount} due for ${payment.month_year || new Date(payment.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
              timestamp: payment.created_at || payment.due_date,
              status: payment.status,
              icon: '💳',
              color: payment.status === 'paid' ? 'green' : 'yellow'
            });
          }
        });
      }

      // Fetch recent complaints
      const complaintsResponse = await fetch('http://localhost:3002/api/student-complaints?limit=5', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (complaintsResponse.ok) {
        const complaintsResult = await complaintsResponse.json();
        complaintsResult.data.complaints.forEach(complaint => {
          const complaintDate = new Date(complaint.created_at);
          if (complaintDate >= sevenDaysAgo) {
            activities.push({
              id: `complaint-${complaint.id}`,
              type: 'complaint',
              title: 'Complaint Submitted',
              description: `${complaint.title} (${complaint.category}) - Status: ${complaint.status}`,
              timestamp: complaint.created_at,
              status: complaint.status,
              icon: '⚠️',
              color: complaint.status === 'resolved' ? 'green' : complaint.status === 'in_progress' ? 'blue' : 'yellow'
            });
          }
        });
      }

      // Fetch recent leave requests
      const leaveResponse = await fetch('http://localhost:3002/api/student-leave-requests?limit=5', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (leaveResponse.ok) {
        const leaveResult = await leaveResponse.json();
        leaveResult.data.leaveRequests.forEach(request => {
          const leaveDate = new Date(request.created_at);
          if (leaveDate >= sevenDaysAgo) {
            activities.push({
              id: `leave-${request.id}`,
              type: 'leave_request',
              title: 'Leave Request Submitted',
              description: `${request.reason} from ${new Date(request.from_date).toLocaleDateString()} to ${new Date(request.to_date).toLocaleDateString()} - Status: ${request.status}`,
              timestamp: request.created_at,
              status: request.status,
              icon: '📅',
              color: request.status === 'approved' ? 'green' : request.status === 'rejected' ? 'red' : 'purple'
            });
          }
        });
      }

      // Sort activities by timestamp (most recent first) and take the latest 10
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setRecentActivity(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
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
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'room', label: 'Room Details', icon: Building2 },
    { id: 'rooms', label: 'Available Rooms', icon: Search },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'leave', label: 'Leave Requests', icon: Calendar }
  ];

  const renderOverview = () => {
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const activeComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;
    const totalLeaveRequests = leaveRequests.length;

    return (
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roomDetails ? (
            <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Room Assignment</h3>
                  <p className="text-2xl font-bold text-slate-900">{roomDetails.roomNumber}</p>
                  <p className="text-sm text-slate-600">Floor {roomDetails.floor} • {roomDetails.roomType}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Room Status</h3>
                  <p className="text-2xl font-bold text-slate-900">Not Assigned</p>
                  <p className="text-sm text-slate-600">Contact administration for room allocation</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                pendingPayments > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Payment Status</h3>
                <p className={`text-2xl font-bold ${pendingPayments > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {pendingPayments > 0 ? `${pendingPayments} Pending` : 'Up to Date'}
                </p>
                <p className="text-sm text-slate-600">
                  {pendingPayments > 0 ? 'Outstanding payments' : 'All payments current'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                activeComplaints > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
              }`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Active Complaints</h3>
                <p className="text-2xl font-bold text-slate-900">{activeComplaints}</p>
                <p className="text-sm text-slate-600">
                  {activeComplaints > 0 ? 'Issues pending resolution' : 'No active issues'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Leave Requests</h3>
                <p className="text-2xl font-bold text-slate-900">{totalLeaveRequests}</p>
                <p className="text-sm text-slate-600">
                  {totalLeaveRequests > 0 ? 'Total requests submitted' : 'No requests yet'}
                </p>
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
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{activity.title}</p>
                    <p className="text-sm text-slate-600">{activity.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.color === 'green' ? 'bg-green-100 text-green-700' :
                    activity.color === 'red' ? 'bg-red-100 text-red-700' :
                    activity.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    activity.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {activity.status}
                  </div>
                </div>
              ))
            ) : (
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

  const renderRoomDetails = () => (
    <div className="space-y-6">
      {roomDetails ? (
        <>
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Room Information</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Room Number</label>
                  <p className="text-lg font-semibold text-slate-800">{roomDetails.roomNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Floor</label>
                  <p className="text-lg font-semibold text-slate-800">{roomDetails.floor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Room Type</label>
                  <p className="text-lg font-semibold text-slate-800">{roomDetails.roomType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Capacity</label>
                  <p className="text-lg font-semibold text-slate-800">{roomDetails.capacity} persons</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Monthly Rent</label>
                  <p className="text-lg font-semibold text-slate-800">${roomDetails.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {roomDetails.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Occupancy</label>
                  <p className="text-lg font-semibold text-slate-800">{roomDetails.occupied}/{roomDetails.capacity}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Hostel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-slate-800">{roomDetails.hostel.name}</p>
                    <p className="text-sm text-slate-600">{roomDetails.hostel.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <p className="text-slate-800">{roomDetails.hostel.city}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-amber-600" />
                  <p className="text-slate-800">{roomDetails.hostel.phone}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-amber-600" />
                  <p className="text-slate-800">contact@hostelhaven.com</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Room Assigned</h3>
          <p className="text-slate-600 mb-4">You haven't been assigned to a room yet. Please contact the hostel administration.</p>
          <button className="bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors">
            Contact Administration
          </button>
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Payment History</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
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

  const renderComplaints = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">My Complaints</h2>
        <button 
          onClick={() => setShowComplaintModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {complaints.map((complaint) => (
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
                <div className="flex items-center space-x-4 text-sm text-slate-500 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {complaint.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    complaint.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    complaint.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {complaint.priority}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Created: {complaint.createdAt}</span>
                  {complaint.resolvedAt && <span>Resolved: {complaint.resolvedAt}</span>}
                </div>
              </div>
              <button 
                onClick={() => handleOpenEditComplaint(complaint)}
                className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Update</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAvailableRooms = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Available Rooms</h2>
        <button 
          onClick={() => fetchAvailableRooms()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>
      
      {availableRooms.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Available Rooms</h3>
          <p className="text-slate-600">There are currently no available rooms in your hostel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Room {room.roomNumber}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  room.status === 'available' ? 'bg-green-100 text-green-800' :
                  room.status === 'partially_filled' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {room.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Floor:</span>
                  <span className="font-medium">{room.floor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Type:</span>
                  <span className="font-medium capitalize">{room.roomType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Capacity:</span>
                  <span className="font-medium">{room.currentOccupancy}/{room.capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Rent:</span>
                  <span className="font-medium">₹{room.rentAmount}/month</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowRoomRequestModal(true)}
                className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors"
                disabled={room.currentOccupancy >= room.capacity}
              >
                {room.currentOccupancy >= room.capacity ? 'Room Full' : 'Request Room'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLeaveRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Leave Requests</h2>
        <button 
          onClick={() => setShowLeaveModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {leaveRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
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
                <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                  <span>From: {request.startDate}</span>
                  <span>To: {request.endDate}</span>
                </div>
                <div className="text-sm text-slate-500">
                  Requested: {request.createdAt}
                </div>
              </div>
              <button className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleCreateComplaint = async (formData) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('Submitting complaint with data:', formData);
      console.log('Session token:', session.access_token);

      const response = await fetch('http://localhost:3002/api/student-complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        setShowComplaintModal(false);
        fetchComplaints(); // Refresh complaints list
        fetchRecentActivity(); // Refresh recent activity
        // Show success message
        alert('Complaint submitted successfully!');
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(error.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
      alert('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLeaveRequest = async (formData) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/student-leave-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowLeaveModal(false);
        fetchLeaveRequests(); // Refresh leave requests list
        fetchRecentActivity(); // Refresh recent activity
        alert('Leave request submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error creating leave request:', error);
      alert('Failed to submit leave request');
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

      const response = await fetch(`http://localhost:3002/api/student-complaints/${editingComplaint.id}`, {
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
        fetchRecentActivity(); // Refresh recent activity
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

  const handleRoomRequest = async (roomId, notes) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/rooms/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          notes: notes
        })
      });

      if (response.ok) {
        setShowRoomRequestModal(false);
        fetchAvailableRooms();
        fetchRoomRequests();
        alert('Room request submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit room request');
      }
    } catch (error) {
      console.error('Error creating room request:', error);
      alert('Failed to submit room request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ComplaintModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.title.length < 5 || formData.description.length < 10) {
        alert('Please provide a detailed title and description');
        return;
      }
      handleCreateComplaint(formData);
    };

    if (!showComplaintModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Submit New Complaint</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Brief description of the issue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="noise">Noise</option>
                <option value="security">Security</option>
                <option value="food">Food</option>
                <option value="wifi">WiFi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows="4"
                placeholder="Detailed description of the issue"
                required
              />
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
                disabled={isSubmitting}
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
    const [formData, setFormData] = useState({
      reason: '',
      start_date: '',
      end_date: '',
      emergency_contact: '',
      emergency_phone: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        alert('End date must be after start date');
        return;
      }
      handleCreateLeaveRequest(formData);
    };

    if (!showLeaveModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Submit Leave Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Reason for leave"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Emergency contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Phone</label>
              <input
                type="tel"
                value={formData.emergency_phone}
                onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Emergency contact phone"
              />
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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

  const renderStudentProfile = () => {
    if (!user.profile) {
      return (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Profile Not Found</h3>
          <p className="text-slate-600">Your student profile has not been created yet. Please contact the hostel administration.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{user.fullName}</h2>
              <p className="text-slate-600">Student ID: {user.profile.admissionNumber}</p>
              <p className="text-slate-600">{user.profile.course} {user.profile.batchYear && `- Batch ${user.profile.batchYear}`}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Personal Information</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Full Name:</span>
                <span className="font-medium">{user.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Phone:</span>
                <span className="font-medium">{user.phone || 'Not provided'}</span>
              </div>
              {user.profile.dateOfBirth && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Date of Birth:</span>
                  <span className="font-medium">{new Date(user.profile.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
              {user.profile.bloodGroup && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Blood Group:</span>
                  <span className="font-medium">{user.profile.bloodGroup}</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Academic Information</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Admission Number:</span>
                <span className="font-medium">{user.profile.admissionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Course:</span>
                <span className="font-medium">{user.profile.course}</span>
              </div>
              {user.profile.batchYear && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Batch Year:</span>
                  <span className="font-medium">{user.profile.batchYear}</span>
                </div>
              )}
              {user.profile.joinDate && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Join Date:</span>
                  <span className="font-medium">{new Date(user.profile.joinDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Address</span>
            </h3>
            <div className="space-y-3">
              {user.profile.address && (
                <div>
                  <span className="text-slate-600">Address:</span>
                  <p className="font-medium">{user.profile.address}</p>
                </div>
              )}
              {user.profile.city && (
                <div className="flex justify-between">
                  <span className="text-slate-600">City:</span>
                  <span className="font-medium">{user.profile.city}</span>
                </div>
              )}
              {user.profile.state && (
                <div className="flex justify-between">
                  <span className="text-slate-600">State:</span>
                  <span className="font-medium">{user.profile.state}</span>
                </div>
              )}
              {user.profile.country && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Country:</span>
                  <span className="font-medium">{user.profile.country}</span>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Emergency Contact</span>
            </h3>
            <div className="space-y-3">
              {user.profile.parentName && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Parent Name:</span>
                  <span className="font-medium">{user.profile.parentName}</span>
                </div>
              )}
              {user.profile.parentPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Parent Phone:</span>
                  <span className="font-medium">{user.profile.parentPhone}</span>
                </div>
              )}
              {user.profile.parentEmail && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Parent Email:</span>
                  <span className="font-medium">{user.profile.parentEmail}</span>
                </div>
              )}
              {user.profile.emergencyContactName && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Emergency Contact:</span>
                  <span className="font-medium">{user.profile.emergencyContactName}</span>
                </div>
              )}
              {user.profile.emergencyContactPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Emergency Phone:</span>
                  <span className="font-medium">{user.profile.emergencyContactPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'profile':
        return renderStudentProfile();
      case 'room':
        return renderRoomDetails();
      case 'rooms':
        return renderAvailableRooms();
      case 'payments':
        return renderPayments();
      case 'complaints':
        return renderComplaints();
      case 'leave':
        return renderLeaveRequests();
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
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">HostelHaven</span>
              <div className="text-xs text-slate-500">Student Portal</div>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-amber-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{user.fullName}</p>
              <p className="text-sm text-slate-500">
                {user.profile?.admissionNumber ? `Student - ${user.profile.admissionNumber}` : 'Student'}
              </p>
              <p className="text-xs text-slate-400">{user.email}</p>
              {user.profile?.course && (
                <p className="text-xs text-slate-500">{user.profile.course} {user.profile.batchYear && `(${user.profile.batchYear})`}</p>
              )}
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
    </div>
  );
};

export default StudentDashboard; 