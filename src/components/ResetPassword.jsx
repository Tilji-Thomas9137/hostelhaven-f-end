import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { resetPasswordSchema } from '../lib/validation';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import Navigation from './Navigation';
import Footer from './Footer';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    const initializeReset = async () => {
      try {
        console.log('Initializing password reset...');
        console.log('Current URL:', window.location.href);
        
        // Check if we have URL parameters that indicate this is a reset link
        const hasUrlParams = window.location.search || window.location.hash;
        
        if (!hasUrlParams) {
          console.log('No URL parameters found');
          setError('Invalid reset link. Please request a new password reset.');
          setIsInitializing(false);
          return;
        }
        
        // Let Supabase process the URL parameters
        // This will automatically handle the reset link tokens
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('Session error:', error);
          // Don't show error immediately, let the user try to reset password
          console.log('Session error, but continuing...');
        }
        
        // Even if there's no session, we can still proceed
        // The password reset will work if the tokens are valid
        console.log('Proceeding with password reset');
        setIsInitializing(false);
        
      } catch (error) {
        console.log('Initialization error:', error);
        setError('Failed to initialize password reset. Please try again.');
        setIsInitializing(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Timeout reached, forcing initialization to complete');
      setIsInitializing(false);
    }, 3000); // 3 second timeout
    
    initializeReset();
    
    return () => clearTimeout(timeout);
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      // Try to update the user's password directly
      // Supabase will handle the authentication from the URL parameters
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        console.log('Password update error:', error);
        setError(error.message || 'Failed to update password. Please try again.');
      } else {
        console.log('Password updated successfully');
        setSuccess(true);
        // Sign out the user after successful password reset
        await supabase.auth.signOut();
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.log('Unexpected error:', error);
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
          {/* Back to Login Link */}
          <div className="mb-6">
            <Link 
              to="/login" 
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h1>
            <p className="text-slate-600">
              {success 
                ? "Your password has been updated successfully!" 
                : "Enter your new password below"
              }
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8">
            {isInitializing ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">Verifying Reset Link</h2>
                  <p className="text-slate-600">
                    Please wait while we verify your password reset link...
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setIsInitializing(false)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Skip Verification (Debug)
                  </button>
                  <button
                    onClick={() => navigate('/forgot-password')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Request New Reset Link
                  </button>
                </div>
              </div>
            ) : success ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">Password Updated!</h2>
                  <p className="text-slate-600">
                    Your password has been successfully reset. You will be redirected to the login page shortly.
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      {...register('password')}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                        errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
                      }`}
                      placeholder="Enter your new password"
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

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      {...register('confirmPassword')}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                        errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">{error}</p>
                      <p className="text-red-600 text-xs">
                        If you're having trouble with the reset link, please{' '}
                        <Link to="/forgot-password" className="underline hover:no-underline">
                          request a new password reset
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="w-full bg-amber-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>

          {/* Additional Help */}
          {!success && (
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Remember your password?{' '}
                <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ResetPassword; 