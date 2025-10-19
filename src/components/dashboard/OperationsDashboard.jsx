import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import CleaningManagement from '../CleaningManagement';
import RoomRequestManagement from '../RoomRequestManagement';
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
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Activity,
  Shield
} from 'lucide-react';

const OperationsDashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cleaning');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('🔍 OperationsDashboard: Starting user check...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('❌ OperationsDashboard: No session found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('✅ OperationsDashboard: Session found, fetching user profile...');
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_uid', session.user.id)
        .single();

      if (error || !userProfile) {
        console.error('❌ OperationsDashboard: User profile error:', error);
        showNotification('User profile not found', 'error');
        navigate('/login');
        return;
      }

      console.log('✅ OperationsDashboard: User profile found:', { role: userProfile.role, name: userProfile.full_name });

      // Check if user is hostel operations assistant
      if (userProfile.role !== 'hostel_operations_assistant') {
        console.log('❌ OperationsDashboard: Access denied, role:', userProfile.role);
        showNotification('Access denied. Hostel operations assistant access required.', 'error');
        navigate('/dashboard');
        return;
      }

      console.log('✅ OperationsDashboard: Access granted, setting user...');
      setUser(userProfile);
    } catch (error) {
      console.error('❌ OperationsDashboard: Error checking user:', error);
      showNotification('Authentication error', 'error');
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
        navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show access denied message if user is not operations assistant
  if (user.role !== 'hostel_operations_assistant') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">
            You need hostel operations assistant privileges to access this dashboard.
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
    { id: 'cleaning', label: 'Cleaning Management', icon: Activity },
    { id: 'rooms', label: 'Room Requests', icon: Building2 },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
            <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome, {user.full_name || 'Operations Assistant'}!</h2>
            <p className="text-slate-600 mt-1">Manage hostel cleaning operations and ensure quality service delivery</p>
            </div>
          </div>
        </div>
        
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600">-</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between">
                      <div>
              <p className="text-sm font-medium text-slate-600">In Progress</p>
              <p className="text-3xl font-bold text-purple-600">-</p>
                      </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                    </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between">
                      <div>
              <p className="text-sm font-medium text-slate-600">Completed Today</p>
              <p className="text-3xl font-bold text-green-600">-</p>
                      </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
        </div>
      </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between">
                      <div>
              <p className="text-sm font-medium text-slate-600">Total Requests</p>
              <p className="text-3xl font-bold text-blue-600">-</p>
                      </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
        </div>
      </div>
    </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
            onClick={() => setActiveTab('cleaning')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all duration-200"
          >
            <Activity className="w-6 h-6 text-amber-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-800">Manage Cleaning Requests</p>
              <p className="text-sm text-slate-600">Approve, assign, and track cleaning tasks</p>
                    </div>
                          </button>

          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-800">Schedule Cleaning</p>
              <p className="text-sm text-slate-600">Plan and schedule cleaning activities</p>
                      </div>
                      </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'cleaning':
        return <CleaningManagement />;
      case 'rooms':
        return <RoomRequestManagement />;
      case 'overview':
        return renderOverview();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-xl border-r border-amber-200/50 fixed h-full z-40 animate-slideInLeft">
        <div className="p-6 border-b border-amber-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Operations</h1>
              <p className="text-sm text-slate-600">Hostel Assistant</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-slate-700 hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-amber-200/50">
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-amber-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user.full_name || 'Operations Assistant'}
              </p>
              <p className="text-xs text-slate-600 truncate">{user.email}</p>
            </div>
          <button
            onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
          >
              <LogOut className="w-4 h-4" />
          </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 animate-slideInRight">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-amber-200/50 shadow-sm p-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 gradient-text">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Operations Dashboard'}
              </h1>
              <p className="text-slate-600 group-hover:text-amber-600 transition-colors duration-200">
                {activeTab === 'cleaning' ? 'Manage hostel cleaning operations' : 
                 activeTab === 'rooms' ? 'Manage student room requests and allocations' :
                 'Manage hostel operations'}
              </p>
            </div>
            <div className="ml-auto" />
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="max-w-6xl mx-auto relative">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OperationsDashboard;