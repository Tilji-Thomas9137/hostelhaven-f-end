import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 to-orange-50 border-t border-amber-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-800">
                  HostelHaven
                </span>
                <div className="text-xs text-slate-600">Smart Management</div>
              </div>
            </div>
            <p className="text-slate-600 font-light">
              Revolutionizing hostel management with AI-powered automation and real-time analytics.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-slate-800 font-semibold">Product</h3>
            <div className="space-y-2">
              <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Features</Link>
              <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Facilities</Link>
              <Link to="/" className="block text-slate-600 hover:text-amber-700 transition-colors">Stats</Link>
              <Link to="/signup" className="block text-slate-600 hover:text-amber-700 transition-colors">Get Started</Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-slate-800 font-semibold">Company</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-slate-600 hover:text-amber-700 transition-colors">About</Link>
              <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Support</Link>
              <Link to="/signup" className="block text-slate-600 hover:text-amber-700 transition-colors">Sign Up</Link>
              <Link to="/login" className="block text-slate-600 hover:text-amber-700 transition-colors">Sign In</Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-slate-800 font-semibold">Support</h3>
            <div className="space-y-2">
              <span className="block text-slate-600 hover:text-amber-700 transition-colors">Help Center</span>
              <span className="block text-slate-600 hover:text-amber-700 transition-colors">Documentation</span>
              <span className="block text-slate-600 hover:text-amber-700 transition-colors">Live Chat</span>
              <span className="block text-slate-600 hover:text-amber-700 transition-colors">Video Tutorials</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-amber-200 mt-12 pt-8 text-center">
          <p className="text-slate-600 font-light">
            © 2024 HostelHaven. All rights reserved. Built with ❤️ for modern hostel management.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 