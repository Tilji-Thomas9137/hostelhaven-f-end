// Razorpay configuration
export const RAZORPAY_CONFIG = {
  key_id: 'rzp_test_RVL3dTzHqSRYTV',
  currency: 'INR',
  name: 'HostelHaven',
  description: 'Hostel Payment',
  image: '/logo.svg',
  theme: {
    color: '#2563eb'
  }
};

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initializeRazorpayPayment = async (orderData, paymentData) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Failed to load Razorpay script');
  }

  const options = {
    key: RAZORPAY_CONFIG.key_id,
    amount: orderData.amount,
    currency: orderData.currency,
    name: RAZORPAY_CONFIG.name,
    description: `${RAZORPAY_CONFIG.description} - ${paymentData.payment_type}`,
    image: RAZORPAY_CONFIG.image,
    order_id: orderData.order_id,
    handler: async function (response) {
      try {
        // Import supabase dynamically to avoid circular imports
        const { supabase } = await import('./supabase');
        
        // Verify payment on backend
        const { data: { session } } = await supabase.auth.getSession();
        const verifyResponse = await fetch('http://localhost:3002/api/razorpay/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            payment_id: paymentData.payment_id
          })
        });

        const result = await verifyResponse.json();
        if (verifyResponse.ok && result.success) {
          return result;
        } else {
          throw new Error(result.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        throw error;
      }
    },
    prefill: {
      name: paymentData.student_name,
      email: paymentData.student_email,
      contact: paymentData.student_phone || ''
    },
    notes: {
      payment_id: paymentData.payment_id,
      payment_type: paymentData.payment_type
    },
    theme: RAZORPAY_CONFIG.theme,
    modal: {
      ondismiss: function() {
        console.log('Payment modal dismissed');
      }
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
  
  return new Promise((resolve, reject) => {
    razorpay.on('payment.success', (response) => {
      resolve(response);
    });
    razorpay.on('payment.error', (error) => {
      reject(error);
    });
  });
};
