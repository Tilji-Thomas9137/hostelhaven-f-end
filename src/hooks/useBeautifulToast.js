import { useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const useBeautifulToast = () => {
  const { showNotification } = useNotification();

  const showToast = useCallback((type, message, options = {}) => {
    showNotification(message, type, options.duration || 5000, options.title);
  }, [showNotification]);

  const showSuccess = useCallback((message, options = {}) => {
    showNotification(message, 'success', options.duration || 5000, options.title);
  }, [showNotification]);

  const showError = useCallback((message, options = {}) => {
    showNotification(message, 'error', options.duration || 5000, options.title);
  }, [showNotification]);

  const showWarning = useCallback((message, options = {}) => {
    showNotification(message, 'warning', options.duration || 5000, options.title);
  }, [showNotification]);

  const showInfo = useCallback((message, options = {}) => {
    showNotification(message, 'info', options.duration || 5000, options.title);
  }, [showNotification]);

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useBeautifulToast;
