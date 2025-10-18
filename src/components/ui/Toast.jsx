import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, Info, Trash2 } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const entranceTimer = setTimeout(() => setIsAnimating(true), 10);
    
    const exitTimer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300); // Wait for exit animation
    }, duration);

    return () => {
      clearTimeout(entranceTimer);
      clearTimeout(exitTimer);
    };
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
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <Trash2 className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = `fixed top-4 right-4 flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-500 ease-out backdrop-blur-md border-2 ${
      isAnimating 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
    }`;
    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-50 to-emerald-50 border-green-300/60 shadow-green-200/50`;
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-50 to-rose-50 border-red-300/60 shadow-red-200/50`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300/60 shadow-yellow-200/50`;
      case 'info':
        return `${baseStyles} bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300/60 shadow-blue-200/50`;
      case 'cancelled':
        return `${baseStyles} bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300/60 shadow-amber-200/50`;
      default:
        return `${baseStyles} bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300/60 shadow-blue-200/50`;
    }
  };

  return (
    <div className={getStyles()}>
      <div className="flex items-center space-x-2">
        {getIcon()}
        <p className={`text-sm font-semibold leading-relaxed ${
          type === 'success' ? 'text-green-800' :
          type === 'error' ? 'text-red-800' :
          type === 'warning' ? 'text-yellow-800' :
          type === 'info' ? 'text-blue-800' :
          type === 'cancelled' ? 'text-amber-800' :
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
        className={`ml-3 p-1.5 rounded-full hover:bg-opacity-20 transition-all duration-200 ${
          type === 'success' ? 'hover:bg-green-200' :
          type === 'error' ? 'hover:bg-red-200' :
          type === 'warning' ? 'hover:bg-yellow-200' :
          type === 'info' ? 'hover:bg-blue-200' :
          type === 'cancelled' ? 'hover:bg-amber-200' :
          'hover:bg-blue-200'
        }`}
      >
        <X className={`w-4 h-4 ${
          type === 'success' ? 'text-green-600' :
          type === 'error' ? 'text-red-600' :
          type === 'warning' ? 'text-yellow-600' :
          type === 'info' ? 'text-blue-600' :
          type === 'cancelled' ? 'text-amber-600' :
          'text-blue-600'
        }`} />
      </button>
    </div>
  );
};

export default Toast;
