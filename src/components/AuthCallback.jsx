import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { redirectToRoleBasedDashboard } from '../lib/supabaseUtils';
import { getDashboardPath } from '../lib/routingUtils';
import { Building2, Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Debug function to log current state
  const logDebugInfo = (step, data) => {
    const debugMessage = `[${new Date().toISOString()}] ${step}: ${JSON.stringify(data, null, 2)}`;
    console.log(debugMessage);
    setDebugInfo(prev => prev + debugMessage + '\n');
  };

  const createUserProfile = async (session) => {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session available');
      }

      console.log('Checking profile for user:', session.user.id);

      // Try to use backend API first
      const backendUrl = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:3002';
      
      try {
        // First attempt with current access token
        let response = await fetch(`${backendUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        // If unauthorized, try to refresh the session once and retry
        if (response.status === 401) {
          console.warn('Auth /me returned 401, attempting token refresh...');
          const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('Token refresh failed:', refreshError);
          } else if (refreshed?.session?.access_token) {
            response = await fetch(`${backendUrl}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${refreshed.session.access_token}`,
                'Content-Type': 'application/json'
              }
            });
          }
        }

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.user) {
            console.log('User profile retrieved via API:', result.data.user);
            return result.data.user;
          }
        }
      } catch (apiError) {
        console.error('Error calling backend API:', apiError);
      }

      // Fallback: Try direct database access
      console.log('Backend API failed, trying direct database access...');
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (fetchError && !fetchError.message.includes('No rows found')) {
        console.error('Error fetching profile:', fetchError);
        // Don't throw error, just return null - dashboard will handle creation
        return null;
      }

      if (existingProfile) {
        console.log('Existing profile found:', existingProfile);
        return existingProfile;
      }

      // No profile found - return null, dashboard will handle creation
      console.log('No profile found, dashboard will handle creation');
      return null;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      // Don't throw error, just return null - dashboard will handle creation
      return null;
    }
  };

  const handleSuccessfulAuth = async (session) => {
    try {
      if (!session?.user) {
        throw new Error('Invalid session data');
      }

      setStatus('loading');
      setMessage('Setting up your profile...');

      console.log('Processing authentication for:', session.user.email);

      // Try to get user profile (creation will be handled by dashboard if needed)
      const userProfile = await createUserProfile(session);

      if (userProfile) {
        console.log('Profile found, proceeding to dashboard');
      } else {
        console.log('No profile found, dashboard will handle creation');
      }

      setStatus('success');
      setMessage('Authentication successful! Redirecting to dashboard...');

      // Short delay to show success message
      setTimeout(() => {
        const dashboardPath = getDashboardPath(userProfile?.role);
        navigate(dashboardPath);
      }, 1500);
    } catch (error) {
      console.error('Profile handling error:', error);
      
      // Determine appropriate error message
      let errorMessage = 'An error occurred while setting up your profile. Please try again.';
      
      if (error.message === 'Invalid session data') {
        errorMessage = 'Authentication failed. Please try logging in again.';
      } else if (error.message.includes('duplicate key')) {
        errorMessage = 'This account already exists. Please try logging in instead.';
      } else if (error.message.includes('permission denied')) {
        errorMessage = 'Access denied. Please check your account permissions.';
      }

      setStatus('error');
      setMessage(errorMessage);
      
      // Redirect back to login after showing error
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  useEffect(() => {
    let isProcessing = false; // Prevent multiple simultaneous processing

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      
      if (isProcessing) {
        console.log('Already processing auth state change, skipping...');
        return;
      }

      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in via auth state change');
        isProcessing = true;
        try {
          await handleSuccessfulAuth(session);
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          setStatus('error');
          setMessage('Authentication failed. Please try logging in again.');
          setTimeout(() => navigate('/login'), 3000);
        } finally {
          isProcessing = false;
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setStatus('error');
        setMessage('Authentication failed. Please try logging in again.');
        setTimeout(() => navigate('/login'), 3000);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed via auth state change');
        isProcessing = true;
        try {
          await handleSuccessfulAuth(session);
        } catch (error) {
          console.error('Error handling token refresh:', error);
        } finally {
          isProcessing = false;
        }
      }
    });

    const handleAuthCallback = async () => {
      try {
        logDebugInfo('AuthCallback started', {
          url: window.location.href,
          searchParams: Object.fromEntries(searchParams.entries()),
          hash: window.location.hash
        });

        // First, check if user is already authenticated
        const { data: { session: existingSession }, error: existingError } = await supabase.auth.getSession();
        
        logDebugInfo('Initial session check', {
          hasSession: !!existingSession,
          error: existingError?.message,
          sessionExpiresAt: existingSession?.expires_at
        });
        
        if (!existingError && existingSession) {
          console.log('User already authenticated, proceeding to dashboard...');
          await handleSuccessfulAuth(existingSession);
          return;
        }

        // Check for OAuth callback parameters
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error || errorDescription) {
          console.error('OAuth error:', { error, errorDescription });
          
          // Handle specific error cases
          let errorMessage = 'Authentication failed';
          if (error === 'access_denied') {
            errorMessage = 'Access was denied. Please try again.';
          } else if (error === 'invalid_request') {
            errorMessage = 'Invalid request. Please try again.';
          } else if (errorDescription) {
            errorMessage = errorDescription;
          }
          
          throw new Error(errorMessage);
        }

        // Wait a moment for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to get session multiple times with increasing delays
        let session = null;
        let attempts = 0;
        const maxAttempts = 5; // Increased attempts

        while (!session && attempts < maxAttempts) {
          console.log(`Attempting to get session (attempt ${attempts + 1}/${maxAttempts})...`);
          
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error(`Session error (attempt ${attempts + 1}):`, sessionError);
            // Don't throw error immediately, try a few more times
          } else if (currentSession) {
            session = currentSession;
            console.log('Session found, proceeding with authentication...');
            break;
          } else {
            console.log(`No session found on attempt ${attempts + 1}`);
          }

          attempts++;
          if (attempts < maxAttempts) {
            const delay = Math.min(1000 * attempts, 5000); // Cap delay at 5 seconds
            console.log(`Waiting ${delay}ms before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }

        if (session) {
          await handleSuccessfulAuth(session);
          return;
        }

        console.log(`No session found after ${maxAttempts} attempts`);

        // If still no session, check URL hash for tokens (Supabase uses hash fragments)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log('Found tokens in URL, setting session...');
          const { data: { session: tokenSession }, error: tokenError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (tokenError) {
            console.error('Token session error:', tokenError);
            throw new Error('Failed to establish session from tokens');
          }

          if (tokenSession) {
            console.log('Token session established, proceeding with authentication...');
            await handleSuccessfulAuth(tokenSession);
            return;
          }
        }

        // Check for type parameter in URL (email confirmation)
        const type = hashParams.get('type') || searchParams.get('type');
        if (type === 'signup' || type === 'recovery') {
          console.log('Email confirmation detected, waiting for session...');
          // Wait a bit more for email confirmation to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { data: { session: confirmSession }, error: confirmError } = await supabase.auth.getSession();
          
          if (confirmError) {
            console.error('Confirmation session error:', confirmError);
            throw new Error('Failed to process email confirmation');
          }

          if (confirmSession) {
            console.log('Confirmation session found, proceeding with authentication...');
            await handleSuccessfulAuth(confirmSession);
            return;
          }
        }

        // If we get here, no session was found - try one more approach
        console.log('No session found through normal methods, trying alternative approaches...');
        
        // Try to get session from localStorage
        const storedSession = localStorage.getItem('supabase.auth.token');
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            if (parsedSession && parsedSession.access_token) {
              console.log('Found stored session, attempting to restore...');
              const { data: { session: restoredSession }, error: restoreError } = await supabase.auth.setSession({
                access_token: parsedSession.access_token,
                refresh_token: parsedSession.refresh_token
              });

              if (!restoreError && restoredSession) {
                console.log('Session restored successfully');
                await handleSuccessfulAuth(restoredSession);
                return;
              }
            }
          } catch (parseError) {
            console.error('Error parsing stored session:', parseError);
          }
        }

        // Check if this is a direct navigation to callback (not from email/OAuth)
        const currentUrl = window.location.href;
        const hasAuthParams = currentUrl.includes('access_token') || 
                             currentUrl.includes('refresh_token') || 
                             currentUrl.includes('type=') ||
                             currentUrl.includes('error=');

        if (!hasAuthParams) {
          console.log('No auth parameters found, redirecting to login...');
          navigate('/login');
          return;
        }

        // Final fallback - wait a bit more and try again
        console.log('Waiting additional time for session to be established...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const { data: { session: finalSession }, error: finalError } = await supabase.auth.getSession();
        
        if (finalError) {
          console.error('Final session attempt failed:', finalError);
          throw new Error('Authentication failed. Please try logging in again.');
        }

        if (finalSession) {
          console.log('Session found on final attempt');
          await handleSuccessfulAuth(finalSession);
          return;
        }

        // If we still don't have a session, it's likely a real error
        throw new Error('Unable to establish authentication session. Please try logging in again.');
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        
        // Handle specific error cases
        let errorMessage = 'Authentication failed. Please try again.';
        
        if (error.message.includes('Email link is invalid or has expired')) {
          errorMessage = 'The email confirmation link has expired or is invalid. Please try registering again.';
        } else if (error.message.includes('Session has expired') || error.message.includes('session expired')) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (error.message.includes('No session data received') || error.message.includes('Unable to establish authentication session')) {
          errorMessage = 'Authentication failed. This might be due to a network issue or expired session. Please try logging in again.';
        } else if (error.message.includes('Invalid session data')) {
          errorMessage = 'Session expired. Please try logging in again.';
        } else if (error.message.includes('Access was denied')) {
          errorMessage = 'Access was denied. Please try again.';
        } else if (error.message.includes('Invalid request')) {
          errorMessage = 'Invalid request. Please try again.';
        } else if (error.message.includes('JWT expired') || error.message.includes('expired')) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (error.message.includes('Invalid JWT') || error.message.includes('invalid token')) {
          errorMessage = 'Invalid authentication token. Please log in again.';
        } else if (error.message.includes('Authentication failed')) {
          errorMessage = 'Authentication failed. Please check your credentials and try again.';
        } else if (error.message.includes('currently inactive')) {
          errorMessage = 'Your account is currently inactive. Please contact an administrator to activate your account.';
        } else if (error.message.includes('suspended')) {
          errorMessage = 'Your account has been suspended. Please contact an administrator.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setMessage(errorMessage);
        // Add a button to retry
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
        {/* Logo */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
          <Building2 className="w-8 h-8 text-white" />
        </div>

        {/* Status Icon */}
        <div className="mb-4">
          {status === 'loading' && (
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          )}
          {status === 'error' && (
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          )}
        </div>

        {/* Message */}
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Error'}
        </h2>
        
        <p className="text-slate-600 mb-6">
          {message}
        </p>

        {/* Loading Bar */}
        {status === 'loading' && (
          <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
            <div className="bg-amber-500 h-2 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Action Button */}
        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-amber-600 text-white px-4 py-3 rounded-xl hover:bg-amber-700 transition-colors"
            >
              Back to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-100 text-slate-700 px-4 py-3 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Try Again
            </button>
            
            {/* Debug Info (only show in development) */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800">
                  Debug Information
                </summary>
                <pre className="mt-2 p-3 bg-slate-100 rounded text-xs overflow-auto max-h-40">
                  {debugInfo}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;