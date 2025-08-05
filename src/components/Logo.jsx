import React from 'react';

const Logo = ({ size = 'md', variant = 'default', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const variantClasses = {
    default: 'text-amber-600',
    white: 'text-white',
    dark: 'text-slate-800'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center`}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          {/* Background circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#ea580c', stopOpacity: 1}} />
            </linearGradient>
            <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#fef3c7', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle cx="24" cy="24" r="24" fill="url(#logoGradient)"/>
          
          {/* Building icon */}
          <path d="M12 36V20L24 12L36 20V36H12Z" fill="url(#buildingGradient)" stroke="#ffffff" strokeWidth="1.5"/>
          
          {/* Windows */}
          <rect x="16" y="22" width="4" height="4" fill="#ffffff" rx="1"/>
          <rect x="28" y="22" width="4" height="4" fill="#ffffff" rx="1"/>
          <rect x="16" y="28" width="4" height="4" fill="#ffffff" rx="1"/>
          <rect x="28" y="28" width="4" height="4" fill="#ffffff" rx="1"/>
          
          {/* Door */}
          <rect x="22" y="32" width="4" height="4" fill="#ffffff" rx="1"/>
          
          {/* Roof detail */}
          <path d="M24 12L20 14V16L24 14L28 16V14L24 12Z" fill="#ffffff"/>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-slate-900">HostelHaven</span>
        <span className="text-xs text-slate-500">Smart Management</span>
      </div>
    </div>
  );
};

export default Logo; 