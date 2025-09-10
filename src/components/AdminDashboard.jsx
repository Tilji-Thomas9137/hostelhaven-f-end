import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hostelSchema } from '../lib/validation';
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
  Download,
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
  Database,
  Cog,
  Eye,
  Trash2
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({});
  const [hostels, setHostels] = useState([]);
  const [students, setStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          
          // Check if user is admin
          if (result.data.user.role !== 'admin') {
            navigate('/dashboard');
            return;
          }
          
          // Fetch admin data
          fetchDashboardStats();
          fetchHostels();
          fetchStudents();
          fetchComplaints();
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

  const fetchHostels = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/admin/hostels?limit=20', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setHostels(result.data.hostels);
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/admin/students?limit=20', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStudents(result.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/admin/complaints?limit=20', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setComplaints(result.data.complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
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

  const handleCreateHostel = async (formData) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/admin/hostels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowHostelModal(false);
        fetchHostels(); // Refresh hostels list
        fetchDashboardStats(); // Refresh stats
        alert('Hostel created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create hostel');
      }
    } catch (error) {
      console.error('Error creating hostel:', error);
      alert('Failed to create hostel');
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'hostels', label: 'Hostels', icon: Building2 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
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
              <h3 className="text-lg font-semibold text-slate-800">Total Hostels</h3>
              <p className="text-2xl font-bold text-slate-900">{dashboardStats.totalHostels || 0}</p>
              <p className="text-sm text-slate-600">Active properties</p>
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

  const renderHostels = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Hostel Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search hostels..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button 
            onClick={() => setShowHostelModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hostel</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostels.map((hostel) => (
          <div key={hostel.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">{hostel.name}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <p className="text-slate-600 text-sm">{hostel.address}, {hostel.city}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Capacity</p>
                  <p className="font-semibold text-slate-800">{hostel.capacity}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Occupancy</p>
                  <p className="font-semibold text-slate-800">{hostel.occupancy || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Students</p>
                  <p className="font-semibold text-green-600">{hostel.studentCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Revenue</p>
                  <p className="font-semibold text-slate-800">${(hostel.revenue || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-3">
                <button className="flex items-center space-x-1 px-3 py-1 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">View</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Student Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hostel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{student.full_name}</p>
                        <p className="text-sm text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.roomNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.hostelName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                      student.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.paymentStatus}
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

  const renderComplaints = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Complaint Management</h2>
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
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

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Analytics & Reports</h2>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Monthly Growth</h3>
              <p className="text-2xl font-bold text-green-600">+8.5%</p>
              <p className="text-sm text-slate-600">vs last month</p>
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
              <p className="text-sm text-slate-600">95% of total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Revenue Growth</h3>
              <p className="text-2xl font-bold text-purple-600">+12.5%</p>
              <p className="text-sm text-slate-600">vs last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Occupancy Trends</h3>
          <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">Chart will be implemented</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Analysis</h3>
          <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">Chart will be implemented</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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

  const HostelModal = () => {
    const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
      resolver: zodResolver(hostelSchema),
      mode: 'onChange',
      defaultValues: {
        name: '', address: '', city: '', state: '', country: '', postal_code: '', phone: '', email: '', capacity: ''
      }
    });

    const onSubmit = (data) => {
      handleCreateHostel({ ...data, capacity: parseInt(data.capacity, 10) });
      reset();
    };

    if (!showHostelModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Hostel</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity *</label>
                <input
                  type="number"
                  {...register('capacity')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.capacity ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                />
                {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
              <textarea
                {...register('address')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.address ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                rows="2"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  {...register('city')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.city ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  {...register('state')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  {...register('country')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  {...register('phone')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowHostelModal(false)}
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
                {isSubmitting ? 'Creating...' : 'Create Hostel'}
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
      case 'hostels':
        return renderHostels();
      case 'students':
        return renderStudents();
      case 'complaints':
        return renderComplaints();
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
      <HostelModal />
    </div>
  );
};

export default AdminDashboard;