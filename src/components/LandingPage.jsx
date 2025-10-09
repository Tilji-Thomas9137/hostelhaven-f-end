import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Home,
  Menu,
  X,
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Globe,
  Smartphone,
  Cloud,
  Wifi,
  Utensils,
  Car,
  BookOpen,
  Heart,
  Award,
  Bed,
  Coffee,
  Dumbbell,
  Leaf,
  Play,
  HelpCircle,
  Video,
  ChevronDown,
  MousePointer,
  ArrowUpRight,
  Clock,
  MessageSquare,
  Loader
} from 'lucide-react';
import Logo from './Logo';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedNumbers, setAnimatedNumbers] = useState({
    students: 0,
    rooms: 0,
    satisfaction: 0
  });

  const heroRef = useRef(null);
  const location = useLocation();

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Visibility tracking for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated numbers
  useEffect(() => {
    if (isVisible) {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      const animateNumber = (target, setter) => {
        let current = 0;
        const increment = target / steps;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setter(Math.floor(current));
        }, stepDuration);
      };

      animateNumber(500, (value) => setAnimatedNumbers(prev => ({ ...prev, students: value })));
      animateNumber(50, (value) => setAnimatedNumbers(prev => ({ ...prev, rooms: value })));
      animateNumber(98, (value) => setAnimatedNumbers(prev => ({ ...prev, satisfaction: value })));
    }
  }, [isVisible]);

  // Auto-rotating features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Loading effect - only show on initial page load, not when navigating from other pages
  useEffect(() => {
    // Skip loading screen if navigating from another page
    if (location.state) {
      setIsLoading(false);
    } else {
      // Only show loading on direct page load (not navigation)
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500); // Show loading for 1.5 seconds only on initial page load

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Handle scroll to section when navigating from other pages
  useEffect(() => {
    if (location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      const element = document.getElementById(sectionId);
      if (element) {
        // Small delay to ensure the page is fully loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.state]);



  const features = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Smart Room Management",
      description: "AI-powered room allocation with real-time availability tracking",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Student Portal",
      description: "Complete self-service portal for managing hostel experience",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Comprehensive insights and reporting for administrators",
      gradient: "from-green-500 to-teal-500"
    }
  ];

  const facilities = [
    { icon: '🏠', title: 'Comfortable Rooms', desc: 'Well-furnished rooms with modern amenities' },
    { icon: '🍽️', title: 'Dining Hall', desc: 'Nutritious meals served in a clean environment' },
    { icon: '📚', title: 'Study Rooms', desc: 'Quiet spaces for focused studying' },
    { icon: '🏃', title: 'Recreation Area', desc: 'Sports and entertainment facilities' },
    { icon: '🛡️', title: '24/7 Security', desc: 'Round-the-clock security for your safety' },
    { icon: '🌐', title: 'High-Speed WiFi', desc: 'Fast internet connectivity throughout' },
    { icon: '🧺', title: 'Laundry Service', desc: 'Convenient laundry facilities' },
    { icon: '🚌', title: 'Transportation', desc: 'Easy access to campus and city' }
  ];

  return (
    <>
      {/* Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 z-50 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="w-8 h-8 text-amber-600 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Loading...</h2>
              <p className="text-slate-600">Preparing your hostel experience</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-full blur-3xl animate-float"
          style={{
            left: `${mousePosition.x * 0.05}px`,
            top: `${mousePosition.y * 0.05}px`,
            transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.0001})`
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-yellow-200/20 to-amber-200/20 rounded-full blur-3xl animate-float"
          style={{
            right: `${mousePosition.x * 0.03}px`,
            bottom: `${mousePosition.y * 0.03}px`,
            transform: `translate(50%, 50%) scale(${1 + scrollY * 0.0002})`
          }}
        />
      </div>



      {/* Hero Section */}
      <section ref={heroRef} className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}>
                <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-20 shadow-lg"></div>
              </div>
              <div className="absolute top-40 right-20 animate-pulse" style={{ animationDelay: '2s', animationDuration: '8s' }}>
                <div className="w-4 h-4 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full opacity-30 shadow-md"></div>
              </div>
              <div className="absolute bottom-40 left-20 animate-bounce" style={{ animationDelay: '4s', animationDuration: '7s' }}>
                <div className="w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-25 shadow-lg"></div>
              </div>
            </div>

            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-white/20 shadow-sm animate-fadeInUp">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700 font-medium">Revolutionizing Hostel Management</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-slate-900">Smart Hostel</span>
                  <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent animate-gradient">
                    Management
                  </span>
                  <span className="block text-amber-100 text-4xl md:text-5xl">Made Simple</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
                  Experience the next generation of hostel management with AI-powered automation, 
                  real-time analytics, and seamless digital workflows.
                </p>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const element = document.getElementById('features');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-8 py-4 border-2 border-amber-600 text-amber-600 rounded-xl font-semibold hover:bg-amber-600 hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm text-slate-500">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-100 rounded-full border border-amber-200">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700 font-medium">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
              Everything You Need
              <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                to Succeed
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Comprehensive tools and features designed to streamline every aspect of hostel management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`group bg-white rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative interactive-card ${
                  activeFeature === index ? 'ring-2 ring-amber-500' : ''
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="relative p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-amber-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-slate-600 font-light leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
              World-Class
              <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Facilities
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Modern amenities and services designed to provide the best living experience for students
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
            {facilities.map((facility, index) => (
              <div 
                key={index} 
                className="text-center space-y-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 hover:border-amber-200 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg shadow-md w-full max-w-xs group hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-amber-100 hover:scale-110 transition-transform duration-300 hover:shadow-lg">
                  <div className="text-4xl">{facility.icon}</div>
                </div>
                <div className="flex flex-col items-center justify-center min-h-[3rem]">
                  <div className="text-sm font-semibold text-slate-800 text-center leading-tight group-hover:text-amber-600 transition-colors duration-300">{facility.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-100 rounded-full border border-amber-200">
                <Heart className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700 font-medium">Our Story</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
                About
                <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  HostelHaven
                </span>
              </h2>
              <p className="text-lg text-slate-600 font-light leading-relaxed">
                HostelHaven is a comprehensive hostel management system designed to streamline 
                operations and enhance the living experience for students and administrators alike.
              </p>
              <p className="text-lg text-slate-600 font-light leading-relaxed">
                Our platform combines cutting-edge technology with user-friendly interfaces to 
                provide a seamless experience for managing hostel operations, student services, 
                and administrative tasks.
              </p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">{animatedNumbers.students}+</div>
                  <div className="text-sm text-slate-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">{animatedNumbers.rooms}+</div>
                  <div className="text-sm text-slate-600">Rooms</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">{animatedNumbers.satisfaction}%</div>
                  <div className="text-sm text-slate-600">Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 shadow-xl">
              <div className="text-white space-y-6">
                <div className="flex items-center space-x-3">
                  <Award className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Trusted by 500+ Hostels</h3>
                </div>
                <p className="text-amber-100 font-light">
                  Join thousands of satisfied administrators who have transformed their hostel management with our platform.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">50K+</div>
                    <div className="text-amber-100 text-sm">Students Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">99.9%</div>
                    <div className="text-amber-100 text-sm">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-100 rounded-full border border-amber-200">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700 font-medium">24/7 Support</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
              We're Here to
              <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Help
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Comprehensive support resources to ensure you get the most out of our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 interactive-card">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Documentation</h3>
              <p className="text-slate-600 font-light mb-6">
                Comprehensive guides, tutorials, and API documentation to help you get started quickly.
              </p>
              <span className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group">
                Read Docs
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 interactive-card">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Live Chat</h3>
              <p className="text-slate-600 font-light mb-6">
                Get instant help from our support team through our live chat feature available 24/7.
              </p>
              <span className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group">
                Start Chat
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 interactive-card">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Video Tutorials</h3>
              <p className="text-slate-600 font-light mb-6">
                Step-by-step video tutorials covering all features and best practices for optimal usage.
              </p>
              <span className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group">
                Watch Videos
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </div>
          </div>
          
          <div className="mt-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Still Need Help?</h3>
              <p className="text-amber-100 mb-6">
                Our dedicated support team is always ready to assist you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="px-6 py-3 bg-white text-amber-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Contact Support
                </Link>
                <Link to="/signup" className="px-6 py-3 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Hostels Managed", icon: <Building2 className="w-6 h-6" /> },
              { number: "50K+", label: "Students Served", icon: <Users className="w-6 h-6" /> },
              { number: "99.9%", label: "Uptime", icon: <Target className="w-6 h-6" /> },
              { number: "24/7", label: "Support", icon: <Clock className="w-6 h-6" /> }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center space-y-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:border-amber-300 hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-800">{stat.number}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-600 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
          backgroundSize: '100px 100px, 150px 150px'
        }}></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Transform
              <br />
              <span className="text-amber-100">Your Hostel?</span>
            </h2>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto font-light">
              Join the revolution in hostel management. Start your free trial today and experience the future.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="group px-8 py-4 bg-white text-amber-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
            <Link to="/login" className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 to-orange-50 border-t border-amber-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
                          <div className="flex items-center space-x-3">
              <Logo size="lg" standalone={true} animated={false} />
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
                 <button onClick={() => scrollToSection('features')} className="block w-full text-left text-slate-600 hover:text-amber-700 transition-colors">Features</button>
                 <button onClick={() => scrollToSection('facilities')} className="block w-full text-left text-slate-600 hover:text-amber-700 transition-colors">Facilities</button>
                 <button onClick={() => scrollToSection('stats')} className="block w-full text-left text-slate-600 hover:text-amber-700 transition-colors">Stats</button>
                 <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Services</Link>
                 <Link to="/signup" className="block text-slate-600 hover:text-amber-700 transition-colors">Get Started</Link>
               </div>
             </div>
             
             <div className="space-y-4">
               <h3 className="text-slate-800 font-semibold">Company</h3>
               <div className="space-y-2">
                 <Link to="/about" className="block text-slate-600 hover:text-amber-700 transition-colors">About Us</Link>
                 <button onClick={() => scrollToSection('support')} className="block w-full text-left text-slate-600 hover:text-amber-700 transition-colors">Support</button>
                 <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Services</Link>
                 <Link to="/signup" className="block text-slate-600 hover:text-amber-700 transition-colors">Sign Up</Link>
                 <Link to="/login" className="block text-slate-600 hover:text-amber-700 transition-colors">Sign In</Link>
               </div>
             </div>
             
             <div className="space-y-4">
               <h3 className="text-slate-800 font-semibold">Support</h3>
               <div className="space-y-2">
                 <button onClick={() => scrollToSection('support')} className="block w-full text-left text-slate-600 hover:text-amber-700 transition-colors">Help Center</button>
                 <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Documentation</Link>
                 <button onClick={() => scrollToSection('support')} className="block w-full text-left text-slate-600 hover:text-amber-700 transition-colors">Live Chat</button>
                 <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Video Tutorials</Link>
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
    </div>
    </>
  );
};

export default LandingPage; 