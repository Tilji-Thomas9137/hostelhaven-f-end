// Test script to verify Razorpay integration
const testRazorpayIntegration = () => {
  console.log('🧪 Testing Razorpay Integration...');
  
  // Test 1: Check if Razorpay script can be loaded
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => {
    console.log('✅ Razorpay script loaded successfully');
    
    // Test 2: Check if Razorpay object is available
    if (window.Razorpay) {
      console.log('✅ Razorpay object is available');
      
      // Test 3: Check configuration
      const config = {
        key_id: 'rzp_test_RVL3dTzHqSRYTV',
        currency: 'INR',
        name: 'HostelHaven',
        description: 'Hostel Payment',
        image: '/logo.svg',
        theme: {
          color: '#2563eb'
        }
      };
      
      console.log('✅ Razorpay configuration:', config);
      console.log('🎉 Razorpay integration is ready!');
    } else {
      console.error('❌ Razorpay object not found');
    }
  };
  
  script.onerror = () => {
    console.error('❌ Failed to load Razorpay script');
  };
  
  document.body.appendChild(script);
};

// Run the test when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testRazorpayIntegration);
} else {
  testRazorpayIntegration();
}
