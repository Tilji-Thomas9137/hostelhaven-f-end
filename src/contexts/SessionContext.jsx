import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

const SessionContext = createContext();

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const navigate = useNavigate();
  const sessionData = useSession();

  useEffect(() => {
    // Handle session expiration globally
    if (sessionData.error && sessionData.error.message) {
      const errorMessage = sessionData.error.message.toLowerCase();
      
      if (errorMessage.includes('expired') || 
          errorMessage.includes('invalid') || 
          errorMessage.includes('jwt')) {
        console.log('Session expired, redirecting to login...');
        navigate('/login', { 
          state: { 
            message: 'Your session has expired. Please log in again.' 
          } 
        });
      }
    }
  }, [sessionData.error, navigate]);

  const value = {
    ...sessionData,
    // Add any additional session-related functions here
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
