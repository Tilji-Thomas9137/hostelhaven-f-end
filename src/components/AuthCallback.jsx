import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { redirectToRoleBasedDashboard } from '../lib/supabaseUtils';
import { Building2, Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  const createUserProfile = async (session) => {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session available');
      }

      console.log('Checking/creating profile for user:', session.user.id);

      // First check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (fetchError && !fetchError.message.includes('No rows found')) {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      if (existingProfile) {
        console.log('Existing profile found:', existingProfile);
        return existingProfile;
      }

      // Get user metadata from session
      const metadata = session.user.user_metadata || {};
      
      // Extract name from metadata or email
      const fullName = metadata.full_name || 
                      metadata.name || 
                      session.user.email.split('@')[0];

      const newProfile = {
        id: session.user.id,
        email: session.user.email,
        full_name: fullName,
        role: 'student',
        avatar_url: metadata.avatar_url || metadata.picture || null,
        phone: metadata.phone || null
      };

      console.log('Creating new profile:', newProfile);

      // Insert new profile
      const { data: profile, error: insertError } = await supabase
        .from('users')
        .insert([newProfile])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting profile:', insertError);
        throw insertError;
      }

      if (!profile) {
        throw new Error('Profile creation failed - no data returned');
      }

      console.log('Profile created successfully:', profile);
      return profile;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
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

      // Create or get user profile
      const userProfile = await createUserProfile(session);

      if (!userProfile) {
        throw new Error('Failed to create or retrieve user profile');
      }

      setStatus('success');
      setMessage('Authentication successful! Redirecting to dashboard...');

      // Short delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
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
    const handleAuthCallback = async () => {
      try {
        // Get the current session first
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Failed to get session');
        }

        if (currentSession) {
          console.log('Session found, proceeding with authentication...');
          await handleSuccessfulAuth(currentSession);
          return;
        }

        // If no session, check for OAuth callback parameters
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error || errorDescription) {
          console.error('OAuth error:', { error, errorDescription });
          throw new Error(errorDescription || error || 'Authentication failed');
        }

        // Handle OAuth callback
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('Auth error:', authError);
          throw new Error('Failed to authenticate');
        }

        if (!authData?.session) {
          throw new Error('No session data received');
        }

        await handleSuccessfulAuth(authData.session);
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed. Please try again.');
        // Add a button to retry
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
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
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-amber-600 text-white px-4 py-3 rounded-xl hover:bg-amber-700 transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;