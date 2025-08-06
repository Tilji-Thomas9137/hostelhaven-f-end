import React, { useState, useEffect } from 'react';

const Logo = ({ size = 'md', variant = 'default', className = '', animated = true, standalone = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState([]);

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

  // Particle animation effect
  useEffect(() => {
    if (animated && isHovered) {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2
      }));
      setParticles(newParticles);

      const interval = setInterval(() => {
        setParticles(prev => prev.map(particle => ({
          ...particle,
          x: particle.x + Math.cos(particle.angle) * particle.speed,
          y: particle.y + Math.sin(particle.angle) * particle.speed,
          angle: particle.angle + 0.02
        })));
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isHovered, animated]);

  // If standalone, return just the icon
  if (standalone) {
    return (
      <div 
        className={`relative ${sizeClasses[size]} group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated Background Ring */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 p-0.5 transition-all duration-500 ${
          isHovered ? 'animate-spin-slow scale-110 shadow-2xl shadow-amber-500/50' : 'scale-100'
        }`}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-200 to-orange-200 animate-pulse"></div>
        </div>

        {/* Main Logo Icon */}
        <div className={`relative ${sizeClasses[size]} bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl flex items-center justify-center transform transition-all duration-500 ${
          isHovered ? 'scale-105 rotate-3 shadow-2xl shadow-amber-500/30' : 'scale-100 rotate-0'
        }`}>
          {/* Animated Particles */}
          {animated && isHovered && particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-white rounded-full animate-ping"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.id * 0.1}s`
              }}
            />
          ))}

          {/* 3D Building Icon */}
          <svg 
            width="70%" 
            height="70%" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`text-white transition-all duration-500 ${
              isHovered ? 'animate-bounce' : ''
            }`}
          >
            <defs>
              {/* Advanced Gradients */}
              <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#fef3c7', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#fde68a', stopOpacity: 1}} />
              </linearGradient>
              
              <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#60a5fa', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
              </linearGradient>

              <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
              </linearGradient>

              {/* Glow Effects */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Main Building Structure */}
            <path 
              d="M12 36V20L24 12L36 20V36H12Z" 
              fill="url(#buildingGradient)" 
              stroke="#ffffff" 
              strokeWidth="1.5"
              className="transition-all duration-300"
              style={{
                filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' : 'none'
              }}
            />
            
            {/* Animated Windows */}
            <rect 
              x="16" y="22" width="4" height="4" 
              fill="url(#windowGradient)" 
              rx="1"
              className={`transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
            />
            <rect 
              x="28" y="22" width="4" height="4" 
              fill="url(#windowGradient)" 
              rx="1"
              className={`transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
              style={{ animationDelay: '0.2s' }}
            />
            <rect 
              x="16" y="28" width="4" height="4" 
              fill="url(#windowGradient)" 
              rx="1"
              className={`transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
              style={{ animationDelay: '0.4s' }}
            />
            <rect 
              x="28" y="28" width="4" height="4" 
              fill="url(#windowGradient)" 
              rx="1"
              className={`transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
              style={{ animationDelay: '0.6s' }}
            />
            
            {/* Animated Door */}
            <rect 
              x="22" y="32" width="4" height="4" 
              fill="url(#doorGradient)" 
              rx="1"
              className={`transition-all duration-300 ${isHovered ? 'animate-bounce' : ''}`}
            />
            
            {/* Enhanced Roof Detail */}
            <path 
              d="M24 12L20 14V16L24 14L28 16V14L24 12Z" 
              fill="#ffffff"
              className="transition-all duration-300"
              style={{
                filter: isHovered ? 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' : 'none'
              }}
            />

            {/* Floating Elements */}
            {isHovered && (
              <>
                <circle cx="24" cy="8" r="1" fill="#ffffff" className="animate-ping" />
                <circle cx="20" cy="10" r="0.5" fill="#ffffff" className="animate-ping" style={{ animationDelay: '0.5s' }} />
                <circle cx="28" cy="10" r="0.5" fill="#ffffff" className="animate-ping" style={{ animationDelay: '1s' }} />
              </>
            )}
          </svg>

          {/* Glowing Border Effect */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 transition-opacity duration-500 ${
            isHovered ? 'opacity-30 animate-pulse' : ''
          }`}></div>
        </div>

        {/* Floating Icons */}
        {isHovered && (
          <>
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
          </>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center space-x-3 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Logo Container */}
      <div className={`relative ${sizeClasses[size]} group`}>
        {/* Animated Background Ring */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 p-0.5 transition-all duration-500 ${
          isHovered ? 'animate-spin-slow scale-110 shadow-2xl shadow-amber-500/50' : 'scale-100'
        }`}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-200 to-orange-200 animate-pulse"></div>
        </div>

        {/* Main Logo Icon */}
        <div className={`relative ${sizeClasses[size]} bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl flex items-center justify-center transform transition-all duration-500 ${
          isHovered ? 'scale-105 rotate-3 shadow-2xl shadow-amber-500/30' : 'scale-100 rotate-0'
        }`}>
          {/* Animated Particles */}
          {animated && isHovered && particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-white rounded-full animate-ping"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.id * 0.1}s`
              }}
            />
          ))}

          {/* 3D Building Icon */}
          <svg 
            width="70%" 
            height="70%" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`text-white transition-all duration-500 ${
              isHovered ? 'animate-bounce' : ''
            }`}
          >
            <defs>
              {/* Advanced Gradients */}
              <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#fef3c7', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#fde68a', stopOpacity: 1}} />
              </linearGradient>
              
              <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#60a5fa', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
              </linearGradient>

              <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
              </linearGradient>

              {/* Glow Effects */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Main Building Structure */}
            <path 
              d="M12 36V20L24 12L36 20V36H12Z" 
              fill="url(#buildingGradient)" 
              stroke="#ffffff" 
              strokeWidth="1.5"
              className="transition-all duration-300"
              style={{
                filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' : 'none'
              }}
            />
            
            {/* Animated Windows */}
            <rect 
              x="16" y="22" width="4" height="4" 
              fill="url(#windowGradient)" 
              rx="1"
              className={`transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
            />
            <rect 
              x="28" y="22" width="4" height="4" 
              fill="url(#windowGradient)" 
              rx="1"
              className={`transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
              style={{ animationDelay: '0.2s' }}
            />
            <rect 
              x="16" y="28" width="4" height="4" 
              fill="url(#windowGradient)" 
              rx="1"
              className={`transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
              style={{ animationDelay: '0.4s' }}
            />
            <rect 
              x="28" y="28" width="4" height="4" 
              fill="url(#windowGradient)" 
              rx="1"
              className={`transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
              style={{ animationDelay: '0.6s' }}
            />
            
            {/* Animated Door */}
            <rect 
              x="22" y="32" width="4" height="4" 
              fill="url(#doorGradient)" 
              rx="1"
              className={`transition-all duration-300 ${isHovered ? 'animate-bounce' : ''}`}
            />
            
            {/* Enhanced Roof Detail */}
            <path 
              d="M24 12L20 14V16L24 14L28 16V14L24 12Z" 
              fill="#ffffff"
              className="transition-all duration-300"
              style={{
                filter: isHovered ? 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' : 'none'
              }}
            />

            {/* Floating Elements */}
            {isHovered && (
              <>
                <circle cx="24" cy="8" r="1" fill="#ffffff" className="animate-ping" />
                <circle cx="20" cy="10" r="0.5" fill="#ffffff" className="animate-ping" style={{ animationDelay: '0.5s' }} />
                <circle cx="28" cy="10" r="0.5" fill="#ffffff" className="animate-ping" style={{ animationDelay: '1s' }} />
              </>
            )}
          </svg>

          {/* Glowing Border Effect */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 transition-opacity duration-500 ${
            isHovered ? 'opacity-30 animate-pulse' : ''
          }`}></div>
        </div>

        {/* Floating Icons */}
        {isHovered && (
          <>
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
          </>
        )}
      </div>

      {/* Text Logo */}
      <div className="flex flex-col">
        <div className="relative">
          <span className={`text-xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-orange-600 bg-clip-text text-transparent transition-all duration-500 ${
            isHovered ? 'scale-105' : ''
          }`}>
            HostelHaven
          </span>
          
          {/* Animated Underline */}
          <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ${
            isHovered ? 'w-full' : 'w-0'
          }`}></div>
        </div>
        
        <span className={`text-xs font-medium transition-all duration-500 ${
          isHovered ? 'text-amber-600 scale-105' : 'text-slate-500'
        }`}>
          Smart Management
        </span>
      </div>
    </div>
  );
};

export default Logo; 