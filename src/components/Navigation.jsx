import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Building2 } from 'lucide-react';
import Logo from './Logo';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/", label: "Home" }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-amber-200/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              <Logo size="lg" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="relative text-slate-700 hover:text-amber-600 transition-colors font-medium group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-slate-700 hover:text-amber-600 transition-colors font-medium relative group"
            >
              Login
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/signup"
              className="bg-amber-600 text-white px-6 py-2 rounded-xl hover:bg-amber-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25 font-medium"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:text-amber-600 transition-colors relative group"
          >
            <div className="relative">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              <div className="absolute inset-0 bg-amber-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-amber-200/50 animate-slideDown">
          <div className="px-4 py-6 space-y-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block text-slate-700 hover:text-amber-600 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-amber-200/50 space-y-3">
              <Link
                to="/login"
                className="block text-slate-700 hover:text-amber-600 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
