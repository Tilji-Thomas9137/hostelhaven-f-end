import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { createAccessDeniedComponent } from '../lib/routingUtils';
import StudentDashboard from './dashboard/StudentDashboard';
import ComprehensiveAdminDashboard from './dashboard/ComprehensiveAdminDashboard';
import WardenDashboard from './dashboard/WardenDashboard';
import ParentDashboard from './dashboard/ParentDashboard';
import OperationsDashboard from './dashboard/OperationsDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          navigate('/login');
          return;
        }

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setUser(result.data.user);
        } else {
          // Fallback to session user data
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'student',
            avatar: session.user.user_metadata?.avatar_url
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to default user
        setUser({
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          avatar: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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
    return createAccessDeniedComponent(
      'Access Required',
      'Go to Login',
      () => navigate('/login')
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
      case 'admin':
        return <ComprehensiveAdminDashboard />;
    case 'warden':
      return <WardenDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'hostel_operations_assistant':
      return <OperationsDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard; 