import { useEffect } from 'react';
import { AlertTriangle, X, Trash2, CheckCircle, Info, Shield } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, info, success
  isLoading = false
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="w-8 h-8 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-amber-600" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-600" />;
      default:
        return <Shield className="w-8 h-8 text-amber-600" />;
    }
  };

  const getModalStyles = () => {
    switch (type) {
      case 'danger':
        return {
          background: 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50',
          border: 'border-red-200/60',
          shadow: 'shadow-red-200/50',
          iconBg: 'bg-gradient-to-br from-red-100 to-rose-100',
          iconBorder: 'border-red-200'
        };
      case 'warning':
        return {
          background: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
          border: 'border-amber-200/60',
          shadow: 'shadow-amber-200/50',
          iconBg: 'bg-gradient-to-br from-amber-100 to-yellow-100',
          iconBorder: 'border-amber-200'
        };
      case 'success':
        return {
          background: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
          border: 'border-green-200/60',
          shadow: 'shadow-green-200/50',
          iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100',
          iconBorder: 'border-green-200'
        };
      case 'info':
        return {
          background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
          border: 'border-blue-200/60',
          shadow: 'shadow-blue-200/50',
          iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100',
          iconBorder: 'border-blue-200'
        };
      default:
        return {
          background: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50',
          border: 'border-slate-200/60',
          shadow: 'shadow-slate-200/50',
          iconBg: 'bg-gradient-to-br from-slate-100 to-gray-100',
          iconBorder: 'border-slate-200'
        };
    }
  };

  const getBackdropStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-gradient-to-br from-red-50/80 via-rose-50/80 to-pink-50/80';
      case 'warning':
        return 'bg-gradient-to-br from-amber-50/80 via-yellow-50/80 to-orange-50/80';
      case 'success':
        return 'bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80';
      case 'info':
        return 'bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80';
      default:
        return 'bg-gradient-to-br from-slate-50/80 via-gray-50/80 to-zinc-50/80';
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirm: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:ring-red-500 text-white shadow-lg shadow-red-200/50",
          cancel: "bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 focus:ring-slate-500 text-slate-700 border border-slate-200"
        };
      case 'warning':
        return {
          confirm: "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 focus:ring-amber-500 text-white shadow-lg shadow-amber-200/50",
          cancel: "bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 focus:ring-slate-500 text-slate-700 border border-slate-200"
        };
      case 'success':
        return {
          confirm: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:ring-green-500 text-white shadow-lg shadow-green-200/50",
          cancel: "bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 focus:ring-slate-500 text-slate-700 border border-slate-200"
        };
      case 'info':
        return {
          confirm: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 text-white shadow-lg shadow-blue-200/50",
          cancel: "bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 focus:ring-slate-500 text-slate-700 border border-slate-200"
        };
      default:
        return {
          confirm: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:ring-amber-500 text-white shadow-lg shadow-amber-200/50",
          cancel: "bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 focus:ring-slate-500 text-slate-700 border border-slate-200"
        };
    }
  };

  const modalStyles = getModalStyles();
  const buttonStyles = getButtonStyles();
  const backdropStyles = getBackdropStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced Backdrop */}
      <div 
        className={`fixed inset-0 ${backdropStyles} backdrop-blur-md transition-all duration-300`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-md transform overflow-hidden rounded-3xl ${modalStyles.background} border-2 ${modalStyles.border} shadow-2xl ${modalStyles.shadow} transition-all duration-300 animate-modal-enter`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl ${modalStyles.iconBg} border ${modalStyles.iconBorder} shadow-lg`}>
                {getIcon()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {type === 'danger' ? 'This action cannot be undone' :
                   type === 'warning' ? 'Please review before proceeding' :
                   type === 'success' ? 'Confirm this action' :
                   type === 'info' ? 'Additional information' :
                   'Please confirm'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/50 hover:text-slate-600 transition-all duration-200 hover:scale-110"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
              <p className="text-slate-700 leading-relaxed font-medium">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 bg-white/40 backdrop-blur-sm px-6 py-4 border-t border-white/30">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonStyles.cancel} ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
              }`}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonStyles.confirm} ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
