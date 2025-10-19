import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase, SITE_URL } from '../lib/supabase';
import { loginSchema } from '../lib/validation';
import { redirectToRoleBasedDashboard } from '../lib/supabaseUtils';
import { getDashboardPath } from '../lib/routingUtils';
import { Eye, EyeOff, Mail, Lock, CheckCircle } from 'lucide-react';
import Logo from './Logo';
import Navigation from './Navigation';
import Footer from './Footer';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      // Use our backend API for authentication
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email, // This will be the username
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.message?.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before logging in.');
          setShowResendConfirmation(true);
        } else if (result.message?.includes('Invalid login credentials') || result.message?.includes('Invalid email or password')) {
          setError('Invalid username or password. Please try again.');
          setShowResendConfirmation(false);
        } else if (result.message?.includes('rate limit')) {
          setError('Too many login attempts. Please try again later.');
          setShowResendConfirmation(false);
        } else if (result.message?.includes('Session has expired') || result.message?.includes('session expired')) {
          setError('Your session has expired. Please log in again.');
          setShowResendConfirmation(false);
        } else if (result.message?.includes('JWT expired') || result.message?.includes('expired')) {
          setError('Your session has expired. Please log in again.');
          setShowResendConfirmation(false);
        } else if (result.message?.includes('Invalid JWT') || result.message?.includes('invalid token')) {
          setError('Invalid authentication token. Please log in again.');
          setShowResendConfirmation(false);
        } else if (result.message?.includes('not yet activated')) {
          setError(result.message);
          setShowResendConfirmation(false);
        } else if (result.message?.includes('currently inactive')) {
          setError('Your account is currently inactive. Please contact an administrator to activate your account.');
          setShowResendConfirmation(false);
        } else if (result.message?.includes('suspended')) {
          setError('Your account has been suspended. Please contact an administrator.');
          setShowResendConfirmation(false);
        } else {
          console.error('Login error:', result);
          setError(result.message || 'An error occurred during login. Please try again.');
          setShowResendConfirmation(false);
        }
        return;
      }

      if (!result.success || !result.data?.user) {
        setError('No user data received. Please try again.');
        return;
      }

      // Store the session data and navigate to appropriate dashboard
      const user = result.data.user;
      
      // Set Supabase session for compatibility
      await supabase.auth.setSession({
        access_token: result.data.session.accessToken,
        refresh_token: result.data.session.refreshToken,
      });

      // Navigate based on user role
      const dashboardPath = getDashboardPath(user.role);
      console.log('🔍 Login: User role:', user.role, 'Dashboard path:', dashboardPath);
      navigate(dashboardPath);
    } catch (error) {
      console.error('Unexpected login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async (email) => {
    setResendLoading(true);
    setResendMessage('');
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage('Confirmation email sent successfully! Please check your email.');
        setShowResendConfirmation(false);
      } else {
        setResendMessage(data.message || 'Failed to resend confirmation email.');
      }
    } catch (error) {
      console.error('Resend confirmation error:', error);
      setResendMessage('Failed to resend confirmation email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        if (error.message.includes('popup_closed_by_user')) {
          setError('Sign in was cancelled. Please try again.');
        } else if (error.message.includes('popup_blocked')) {
          setError('Pop-up was blocked. Please allow pop-ups and try again.');
        } else {
          setError(error.message || 'Failed to sign in with Google. Please try again.');
        }
        return;
      }

      // No need to handle redirect here as Supabase will do it automatically
      // Just show loading state
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-20 pb-8 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full px-4">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" animated={true} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600">Sign in to your account to continue</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    id="email"
                    {...register('email')}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                      errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter your username (e.g., ADM2026001, PARENT-ADM2026001, EMP001)"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Students: Admission Number | Parents: PARENT-Admission Number | Staff: Employee ID
                </p>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    {...register('password')}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                      errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Resend Confirmation */}
              {showResendConfirmation && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                  <p className="mb-2">Didn't receive the confirmation email?</p>
                  <button
                    type="button"
                    onClick={() => handleResendConfirmation(watch('email'))}
                    disabled={resendLoading}
                    className="text-amber-600 hover:text-amber-700 font-medium underline disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                  </button>
                </div>
              )}

              {/* Resend Message */}
              {resendMessage && (
                <div className={`px-4 py-3 rounded-xl text-sm ${
                  resendMessage.includes('successfully') 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {resendMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-300 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-amber-600 hover:text-amber-700 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Login; 