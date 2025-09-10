import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "fixed top-4 right-4 flex items-center space-x-2 px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ease-in-out";
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border border-green-200`;
      case 'error':
        return `${baseStyles} bg-red-50 border border-red-200`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border border-yellow-200`;
      default:
        return `${baseStyles} bg-blue-50 border border-blue-200`;
    }
  };

  return (
    <div className={getStyles()}>
      <div className="flex items-center space-x-2">
        {getIcon()}
        <p className={`text-sm font-medium ${
          type === 'success' ? 'text-green-800' :
          type === 'error' ? 'text-red-800' :
          type === 'warning' ? 'text-yellow-800' :
          'text-blue-800'
        }`}>
          {message}
        </p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className={`ml-4 p-1 rounded-full hover:bg-opacity-20 transition-colors ${
          type === 'success' ? 'hover:bg-green-200' :
          type === 'error' ? 'hover:bg-red-200' :
          type === 'warning' ? 'hover:bg-yellow-200' :
          'hover:bg-blue-200'
        }`}
      >
        <X className={`w-4 h-4 ${
          type === 'success' ? 'text-green-600' :
          type === 'error' ? 'text-red-600' :
          type === 'warning' ? 'text-yellow-600' :
          'text-blue-600'
        }`} />
      </button>
    </div>
  );
};

export default Toast;
