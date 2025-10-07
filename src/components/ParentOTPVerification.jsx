import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const ParentOTPVerification = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email', 'otp', 'success'
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmitEmail = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/parent-verification/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEmail(data.email);
        setStep('otp');
        showNotification('OTP sent to your email address', 'success');
      } else {
        throw new Error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      showNotification(error.message || 'Failed to send OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOTP = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/parent-verification/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: data.otp
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStep('success');
        showNotification('OTP verified successfully!', 'success');
        
        // Set session and redirect to parent dashboard
        if (result.data.session_url) {
          window.location.href = result.data.session_url;
        } else {
          navigate('/parent-dashboard');
        }
      } else {
        throw new Error(result.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showNotification(error.message || 'Invalid OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setEmail('');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-green-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Verification Successful!</h2>
          <p className="text-slate-600 mb-6">
            Your email has been verified successfully. You can now access your child's information.
          </p>
          <button
            onClick={() => navigate('/parent-dashboard')}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {step === 'email' ? 'Parent Verification' : 'Enter OTP'}
          </h2>
          <p className="text-slate-600">
            {step === 'email' 
              ? 'Enter your email address to receive verification code'
              : `Enter the 6-digit code sent to ${email}`
            }
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Parent Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send OTP</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 text-sm font-medium">OTP Valid for 10 minutes</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmitOTP)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Enter 6-digit OTP *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('otp', { 
                      required: 'OTP is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'OTP must be 6 digits'
                      }
                    })}
                    className="w-full px-4 py-3 pl-12 text-center text-lg tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="000000"
                    maxLength="6"
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                </div>
                {errors.otp && (
                  <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.otp.message}</span>
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="flex-1 border border-slate-300 text-slate-700 py-3 px-6 rounded-lg hover:bg-slate-50 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center">
              <button
                onClick={handleBackToEmail}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Didn't receive OTP? Resend
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>This verification is required for security purposes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentOTPVerification;
