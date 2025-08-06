import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase, SITE_URL } from '../lib/supabase';
import { forgotPasswordSchema } from '../lib/validation';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import Navigation from './Navigation';
import Footer from './Footer';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${SITE_URL}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (error) {
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
              <Logo size="xl" animated={true} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password</h1>
            <p className="text-slate-600">
              {success 
                ? "Check your email for the reset link" 
                : "Enter your email address and we'll send you a link to reset your password"
              }
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8">
            {success ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">Email Sent!</h2>
                  <p className="text-slate-600">
                    We've sent a password reset link to <strong>{watch('email')}</strong>. 
                    Please check your email and click the link to reset your password.
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      {...register('email')}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                        errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="w-full bg-amber-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword; 