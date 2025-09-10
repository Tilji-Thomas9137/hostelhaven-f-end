import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

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

  const showNotification = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <div className="fixed z-50 top-0 right-0 p-4 space-y-4">
        {notifications.map(({ id, message, type, duration }) => (
          <Toast
            key={id}
            message={message}
            type={type}
            duration={duration}
            onClose={() => hideNotification(id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
