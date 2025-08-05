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
  Download
} from 'lucide-react';
import Logo from './Logo';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomDetails, setRoomDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

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
          
          // Fetch room details if user has a room
          if (result.data.user.roomId) {
            fetchRoomDetails(result.data.user.roomId);
          }
          
          // Fetch mock data for now
          fetchMockData();
        } else {
          // Fallback to session user data for Google OAuth users
          setUser({
            id: session.user.id,
            fullName: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            email: session.user.email,
            role: 'student',
            avatarUrl: session.user.user_metadata?.avatar_url
          });
          fetchMockData();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchRoomDetails = async (roomId) => {
    // Mock room details - in real app, fetch from API
    setRoomDetails({
      id: roomId,
      roomNumber: '101',
      floor: 1,
      roomType: 'Standard',
      capacity: 2,
      occupied: 1,
      price: 1200,
      status: 'occupied',
      hostel: {
        name: 'University Heights Hostel',
        address: '123 University Ave',
        city: 'New York',
        phone: '+1-555-0123'
      }
    });
  };

  const fetchMockData = () => {
    // Mock payments data
    setPayments([
      { id: 1, month: 'January 2024', amount: 1200, status: 'paid', dueDate: '2024-01-15', paidDate: '2024-01-10' },
      { id: 2, month: 'February 2024', amount: 1200, status: 'paid', dueDate: '2024-02-15', paidDate: '2024-02-12' },
      { id: 3, month: 'March 2024', amount: 1200, status: 'pending', dueDate: '2024-03-15', paidDate: null }
    ]);

    // Mock complaints data
    setComplaints([
      { id: 1, title: 'Heating Issue', description: 'Room temperature is too low', status: 'resolved', createdAt: '2024-01-20', resolvedAt: '2024-01-22' },
      { id: 2, title: 'WiFi Problem', description: 'Internet connection is slow', status: 'in_progress', createdAt: '2024-02-15', resolvedAt: null }
    ]);

    // Mock leave requests data
    setLeaveRequests([
      { id: 1, reason: 'Family Visit', startDate: '2024-02-10', endDate: '2024-02-12', status: 'approved', createdAt: '2024-01-25' },
      { id: 2, reason: 'Medical Appointment', startDate: '2024-03-05', endDate: '2024-03-05', status: 'pending', createdAt: '2024-02-28' }
    ]);
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
    { id: 'room', label: 'Room Details', icon: Building2 },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'leave', label: 'Leave Requests', icon: Calendar }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Room</h3>
          <p className="text-2xl font-bold text-slate-900">{roomDetails?.roomNumber || 'Not Assigned'}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Payment Status</h3>
          <p className="text-2xl font-bold text-green-600">Paid</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Active Complaints</h3>
          <p className="text-2xl font-bold text-slate-900">1</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Leave Requests</h3>
          <p className="text-2xl font-bold text-slate-900">2</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">Payment received for February</p>
              <p className="text-sm text-slate-600">2 days ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">New complaint submitted</p>
              <p className="text-sm text-slate-600">5 days ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">Leave request approved</p>
              <p className="text-sm text-slate-600">1 week ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
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
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Created: {complaint.createdAt}</span>
                  {complaint.resolvedAt && <span>Resolved: {complaint.resolvedAt}</span>}
                </div>
              </div>
              <button className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
                <span>Update</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLeaveRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Leave Requests</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'room':
        return renderRoomDetails();
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-amber-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <Logo size="lg" />
            </Link>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{user.fullName}</p>
                  <p className="text-slate-500">Student</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-amber-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Student Dashboard</h1>
                <p className="text-slate-600">Manage your hostel experience</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-2 mb-8">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard; 