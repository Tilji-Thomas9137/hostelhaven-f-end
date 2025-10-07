import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  Package,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  X
} from 'lucide-react';

const QRVerification = () => {
  const { showNotification } = useNotification();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmitQR = async (data) => {
    setIsVerifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('http://localhost:3002/api/parcel-management/verify-qr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setVerificationResult(result.data.parcel);
        setShowResult(true);
        showNotification('Parcel verified and claimed successfully!', 'success');
        reset();
      } else {
        throw new Error(result.message || 'Failed to verify QR code');
      }
    } catch (error) {
      console.error('Error verifying QR:', error);
      showNotification(error.message || 'Failed to verify QR code', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setVerificationResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">QR Code Verification</h2>
            <p className="text-slate-600">Verify and claim parcels using QR codes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitQR)} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Instructions</h3>
            <div className="space-y-2 text-blue-700">
              <p>1. Student shows QR code to staff member</p>
              <p>2. Staff scans or enters QR token below</p>
              <p>3. System verifies and marks parcel as claimed</p>
              <p>4. Parcel is handed over to student</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              QR Token *
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('qr_token', { required: 'QR token is required' })}
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter QR token from student"
              />
              <QrCode className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 transform -translate-y-1/2" />
            </div>
            {errors.qr_token && (
              <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.qr_token.message}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isVerifying}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify & Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Verification Result Modal */}
      {showResult && verificationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Parcel Claimed Successfully!</h3>
                  <p className="text-slate-600">Verification completed</p>
                </div>
              </div>
              <button
                onClick={handleCloseResult}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Package className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Parcel Details</h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>Student:</strong> {verificationResult.student_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>From:</strong> {verificationResult.sender_name}
                    </span>
                  </div>

                  {verificationResult.description && (
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-green-600" />
                      <span className="text-green-700">
                        <strong>Description:</strong> {verificationResult.description}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>Received:</strong> {new Date(verificationResult.received_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>Claimed:</strong> {new Date(verificationResult.claimed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Next Steps</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>✓ Parcel has been verified and claimed</p>
                  <p>✓ Student identity has been confirmed</p>
                  <p>✓ QR token has been invalidated</p>
                  <p>✓ Parcel can now be handed over to student</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCloseResult}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRVerification;
