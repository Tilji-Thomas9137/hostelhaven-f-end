import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Building2, Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (data.session) {
          // Create user profile by calling the backend API
          try {
            const response = await fetch('http://localhost:3002/api/auth/me', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${data.session.access_token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const result = await response.json();
              console.log('User profile created/retrieved:', result);
              
              // Redirect directly to dashboard after successful authentication
              setStatus('success');
              setMessage('Authentication successful! Redirecting to dashboard...');
              setTimeout(() => navigate('/dashboard'), 2000);
            } else {
              console.error('Failed to create user profile:', response.statusText);
              // Still redirect to dashboard even if profile creation fails
              setStatus('success');
              setMessage('Authentication successful! Redirecting to dashboard...');
              setTimeout(() => navigate('/dashboard'), 2000);
            }
          } catch (profileError) {
            console.error('Profile handling error:', profileError);
            // Still redirect to dashboard even if profile handling fails
            setStatus('success');
            setMessage('Authentication successful! Redirecting to dashboard...');
            setTimeout(() => navigate('/dashboard'), 2000);
          }
        } else {
          setStatus('error');
          setMessage('No session found. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

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