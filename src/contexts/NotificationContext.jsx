import { createContext, useContext, useState, useCallback } from 'react';
import BeautifulToast from '../components/ui/BeautifulToast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'success', duration = 3000, customTitle = null) => {
    const id = Date.now() + Math.random();
    const notification = { 
      id, 
      message, 
      type, 
      duration,
      title: customTitle || (type === 'success' ? 'Success!' : 
             type === 'error' ? 'Error!' : 
             type === 'warning' ? 'Warning!' : 
             type === 'info' ? 'Info' : 'Notification')
    };
    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, clearAllNotifications }}>
      {children}
      <div className="fixed z-[9999] top-4 right-4 space-y-4">
        {notifications.map(({ id, message, type, duration, title }) => (
          <BeautifulToast
            key={id}
            message={message}
            type={type}
            duration={duration}
            title={title}
            onClose={() => hideNotification(id)}
            isVisible={true}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
