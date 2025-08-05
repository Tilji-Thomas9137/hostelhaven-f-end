import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://dwiwsmhbamhpbugcjqdx.supabase.co'
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3aXdzbWhiYW1ocGJ1Z2NqcWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODMzNTksImV4cCI6MjA2OTg1OTM1OX0.TK8rt9UItsi3S2PrWALN4H4PC24uML2BhJlqMMZlBRU'

// Site URL for redirects - use environment variable or fallback to current origin
export const SITE_URL = import.meta.env?.VITE_SITE_URL || window.location.origin

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) 