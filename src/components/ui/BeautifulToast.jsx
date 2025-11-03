import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X, 
  Sparkles,
  Star,
  Zap,
  Heart
} from 'lucide-react';

const BeautifulToast = ({ 
  type = 'success', 
  title, 
  message, 
  duration = 5000, 
  onClose,
  isVisible = true 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(100);


  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(progressInterval);
            return 0;
          }
          return prev - (100 / (duration / 50));
        });
      }, 50);

      // Auto-dismiss after duration
      const dismissTimeout = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(dismissTimeout);
      };
    }
  }, [isVisible, duration]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgGradient: 'from-emerald-500 via-green-500 to-teal-500',
          bgGlass: 'from-emerald-50/90 to-green-50/90',
          borderColor: 'border-emerald-200/50',
          icon: CheckCircle,
          iconColor: 'text-emerald-600',
          accentColor: 'text-emerald-700',
          glowColor: 'shadow-emerald-500/25',
          sparkleColor: 'text-emerald-400'
        };
      case 'error':
        return {
          bgGradient: 'from-red-500 via-rose-500 to-pink-500',
          bgGlass: 'from-red-50/90 to-rose-50/90',
          borderColor: 'border-red-200/50',
          icon: XCircle,
          iconColor: 'text-red-600',
          accentColor: 'text-red-700',
          glowColor: 'shadow-red-500/25',
          sparkleColor: 'text-red-400'
        };
      case 'warning':
        return {
          bgGradient: 'from-amber-500 via-orange-500 to-yellow-500',
          bgGlass: 'from-amber-50/90 to-orange-50/90',
          borderColor: 'border-amber-200/50',
          icon: AlertCircle,
          iconColor: 'text-amber-600',
          accentColor: 'text-amber-700',
          glowColor: 'shadow-amber-500/25',
          sparkleColor: 'text-amber-400'
        };
      case 'info':
        return {
          bgGradient: 'from-blue-500 via-indigo-500 to-purple-500',
          bgGlass: 'from-blue-50/90 to-indigo-50/90',
          borderColor: 'border-blue-200/50',
          icon: Info,
          iconColor: 'text-blue-600',
          accentColor: 'text-blue-700',
          glowColor: 'shadow-blue-500/25',
          sparkleColor: 'text-blue-400'
        };
      default:
        return {
          bgGradient: 'from-gray-500 via-slate-500 to-zinc-500',
          bgGlass: 'from-gray-50/90 to-slate-50/90',
          borderColor: 'border-gray-200/50',
          icon: Info,
          iconColor: 'text-gray-600',
          accentColor: 'text-gray-700',
          glowColor: 'shadow-gray-500/25',
          sparkleColor: 'text-gray-400'
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`
      relative max-w-md w-full
      transform transition-all duration-500 ease-out
      ${isAnimating 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
      }
    `}>
      <div className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${config.bgGlass}
        backdrop-blur-xl border ${config.borderColor}
        shadow-2xl ${config.glowColor}
        hover:shadow-3xl transition-all duration-300
        group
      `}>
        {/* Animated background gradient */}
        <div className={`
          absolute inset-0 bg-gradient-to-br ${config.bgGradient} 
          opacity-5 group-hover:opacity-10 transition-opacity duration-300
        `} />
        
        {/* Sparkle effects */}
        <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
          <Sparkles className={`w-4 h-4 ${config.sparkleColor} animate-pulse`} />
        </div>
        <div className="absolute bottom-2 left-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
          <Star className={`w-3 h-3 ${config.sparkleColor} animate-bounce`} />
        </div>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-1 bg-white/20 w-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${config.bgGradient} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="relative p-6">
          <div className="flex items-start space-x-4">
            {/* Icon with animated background */}
            <div className={`
              relative flex-shrink-0
              w-12 h-12 rounded-xl
              bg-gradient-to-br ${config.bgGradient}
              flex items-center justify-center
              shadow-lg group-hover:shadow-xl
              transform group-hover:scale-110 transition-all duration-300
            `}>
              <IconComponent className={`w-6 h-6 text-white`} />
              
              {/* Icon glow effect */}
              <div className={`
                absolute inset-0 rounded-xl
                bg-gradient-to-br ${config.bgGradient}
                opacity-0 group-hover:opacity-30
                blur-sm transition-opacity duration-300
              `} />
              
              {/* Sparkle around icon */}
              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Zap className={`w-3 h-3 ${config.sparkleColor} animate-pulse`} />
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h4 className={`
                text-lg font-bold ${config.accentColor}
                mb-1 group-hover:scale-105 transition-transform duration-300
              `}>
                {title || (type === 'success' ? 'Success!' : 
                          type === 'error' ? 'Error!' : 
                          type === 'warning' ? 'Warning!' : 
                          'Info')}
              </h4>
              <p className="text-slate-700 text-sm leading-relaxed">
                {message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className={`
                flex-shrink-0 p-2 rounded-lg
                hover:bg-white/20 transition-all duration-200
                group-hover:scale-110
                ${config.iconColor} hover:text-white
              `}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
            <Heart className={`w-full h-full ${config.sparkleColor}`} />
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      </div>
    </div>
  );
};

export default BeautifulToast;
