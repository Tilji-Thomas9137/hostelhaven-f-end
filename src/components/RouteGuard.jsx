import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getDashboardPath, createAccessDeniedComponent } from '../lib/routingUtils';

/**
 * Route Guard Component
 * Protects routes that require authentication
 */
const RouteGuard = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const isCheckingAuth = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple simultaneous authentication checks
      if (isCheckingAuth.current) {
        console.log('🔒 RouteGuard: Authentication already in progress, skipping...');
        return;
      }
      
      isCheckingAuth.current = true;
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ RouteGuard: Authentication timeout, redirecting to login');
        setIsAuthorized(false);
        setIsLoading(false);
        isCheckingAuth.current = false;
        navigate('/login');
      }, 10000); // 10 second timeout

      try {
        console.log('🔍 RouteGuard: Starting authentication check for role:', requiredRole);
        let { data: { session }, error } = await supabase.auth.getSession();
        
        // If no session at all, redirect to login immediately
        if (error || !session) {
          console.log('❌ RouteGuard: No session found, redirecting to login');
          setIsAuthorized(false);
          setIsLoading(false);
          clearTimeout(timeoutId);
          isCheckingAuth.current = false;
          navigate('/login');
          return;
        }
        
        // Try to refresh session if access token is missing or expired
        if (!session.access_token) {
          console.log('🔄 RouteGuard: No access token, attempting refresh...');
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshedSession) {
            console.error('❌ RouteGuard: Session refresh failed:', refreshError);
            setIsAuthorized(false);
            setIsLoading(false);
            clearTimeout(timeoutId);
            isCheckingAuth.current = false;
            navigate('/login');
            return;
          }
          
          session = refreshedSession;
          console.log('✅ RouteGuard: Session refreshed successfully');
        }

        // Try to get user data from API
        try {
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
            
            // Check role authorization if required
            if (requiredRole && result.data.user.role !== requiredRole) {
              console.log('❌ RouteGuard: Role mismatch. Required:', requiredRole, 'User role:', result.data.user.role);
              console.log('🔍 RouteGuard: Full user data:', result.data.user);
              setIsAuthorized(false);
              setIsLoading(false);
              clearTimeout(timeoutId);
              isCheckingAuth.current = false;
              return;
            }
            
            console.log('✅ RouteGuard: Authentication successful for role:', result.data.user.role);
            setIsAuthorized(true);
            setIsLoading(false);
            clearTimeout(timeoutId);
            isCheckingAuth.current = false;
          } else if (response.status === 401) {
            console.log('❌ RouteGuard: API returned 401, redirecting to login');
            setIsAuthorized(false);
            setIsLoading(false);
            clearTimeout(timeoutId);
            isCheckingAuth.current = false;
            navigate('/login');
            return;
          } else {
            console.log('❌ RouteGuard: API call failed with status:', response.status);
            setIsAuthorized(false);
            setIsLoading(false);
            clearTimeout(timeoutId);
            isCheckingAuth.current = false;
            navigate('/login');
            return;
          }
        } catch (apiError) {
          console.error('❌ RouteGuard: API error:', apiError);
          setIsAuthorized(false);
          setIsLoading(false);
          clearTimeout(timeoutId);
          isCheckingAuth.current = false;
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('❌ RouteGuard: Auth check error:', error);
        setIsAuthorized(false);
        setIsLoading(false);
        clearTimeout(timeoutId);
        isCheckingAuth.current = false;
        navigate('/login');
      }
    };

    checkAuth();

    // Cleanup function to clear timeout on unmount
    return () => {
      // Reset the authentication check flag
      isCheckingAuth.current = false;
    };
  }, [location.pathname, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    if (requiredRole) {
      return createAccessDeniedComponent(
        `${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} Access Required`,
        'Go to Login',
        () => navigate('/login')
      );
    } else {
      return createAccessDeniedComponent(
        'Access Required',
        'Go to Login',
        () => navigate('/login')
      );
    }
  }

  return children;
};

export default RouteGuard;
