import { createClient } from '@supabase/supabase-js'

// Check for required environment variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://dwiwsmhbamhpbugcjqdx.supabase.co'
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3aXdzbWhiYW1ocGJ1Z2NqcWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODMzNTksImV4cCI6MjA2OTg1OTM1OX0.TK8rt9UItsi3S2PrWALN4H4PC24uML2BhJlqMMZlBRU'

// Site URL for redirects - use environment variable or fallback to current origin
export const SITE_URL = import.meta.env?.VITE_SITE_URL || window.location.origin

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token'
  }
})

// Add session refresh interceptor
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    // Clear any stored tokens
    localStorage.removeItem('supabase.auth.token');
    // Redirect to login page if user was signed out due to token issues
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  } else if (event === 'SIGNED_IN') {
    console.log('User signed in successfully');
  }
})

// Add global error handler for auth errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Invalid Refresh Token') || 
      event.reason?.message?.includes('Refresh Token Not Found')) {
    console.log('Auth token expired, redirecting to login');
    localStorage.clear();
    window.location.href = '/login';
  }
}) 