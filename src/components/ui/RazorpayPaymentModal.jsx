import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { initializeRazorpayPayment } from '../../lib/razorpay';
import { CreditCard, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';

const RazorpayPaymentModal = ({ payment, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    if (!payment) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Create Razorpay order
      const orderResponse = await fetch('http://localhost:3002/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          amount: payment.amount,
          payment_id: payment.id,
          currency: 'INR'
        })
      });

      const orderResult = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderResult.message || 'Failed to create payment order');
      }

      // Initialize Razorpay payment
      const paymentResult = await initializeRazorpayPayment(orderResult.data, {
        payment_id: payment.id,
        payment_type: payment.payment_type,
        student_name: payment.users?.full_name || 'Student',
        student_email: payment.users?.email || '',
        student_phone: ''
      });

      if (paymentResult.success) {
        onSuccess(paymentResult.data.payment);
        onClose();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Complete Payment</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {payment && (
          <div className="space-y-4">
            {/* Payment Details */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">
                    {payment.payment_type?.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className="text-sm text-slate-600">Payment ID: {payment.id}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Amount</span>
                <span className="text-xl font-bold text-slate-900">
                  ₹{payment.amount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Razorpay</span>
              </div>
              <p className="text-xs text-blue-700">
                Pay securely with UPI, Cards, Net Banking, Wallets
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RazorpayPaymentModal;
