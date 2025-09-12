import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authUtils } from '../lib/supabaseUtils';

export const useSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshSession = useCallback(async () => {
    try {
      setError(null);
      const { session: refreshedSession, error: refreshError } = await authUtils.refreshSession();
      
      if (refreshError) {
        console.error('Failed to refresh session:', refreshError);
        setError(refreshError);
        setSession(null);
        return false;
      }
      
      setSession(refreshedSession);
      return true;
    } catch (err) {
      console.error('Session refresh error:', err);
      setError(err);
      setSession(null);
      return false;
    }
  }, []);

  const getValidSession = useCallback(async () => {
    try {
      setError(null);
      const { session: validSession, error: sessionError } = await authUtils.getValidSession();
      
      if (sessionError) {
        console.error('Failed to get valid session:', sessionError);
        setError(sessionError);
        setSession(null);
        return null;
      }
      
      setSession(validSession);
      return validSession;
    } catch (err) {
      console.error('Get valid session error:', err);
      setError(err);
      setSession(null);
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Initial session error:', sessionError);
          if (mounted) {
            setError(sessionError);
            setSession(null);
          }
        } else if (mounted) {
          setSession(initialSession);
        }
      } catch (err) {
        console.error('Initial session fetch error:', err);
        if (mounted) {
          setError(err);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change in useSession:', event, session);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session) {
        setSession(session);
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setError(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session);
        setError(null);
      } else if (event === 'USER_UPDATED' && session) {
        setSession(session);
        setError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    loading,
    error,
    refreshSession,
    getValidSession,
    signOut,
    isAuthenticated: !!session,
    isSessionExpired: session ? authUtils.isSessionExpired(session) : true
  };
};
