import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  CreditCard,
  Shield,
  BarChart3,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Database,
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
  Lock,
  Eye,
  Bell,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckSquare,
  Square,
  Plus,
  Minus
} from 'lucide-react';
import Logo from './Logo';

const ServicesPage = () => {
  const [expandedService, setExpandedService] = useState(null);

  const services = [
    {
      id: 1,
      title: "Room Management System",
      icon: <Bed className="w-8 h-8" />,
      description: "Comprehensive room allocation and management system with real-time availability tracking.",
      features: [
        "Automated room assignment based on preferences",
        "Real-time occupancy tracking",
        "Room change request processing",
        "Maintenance request integration",
        "Room inspection scheduling",
        "Inventory management per room"
      ],
      price: "Starting from $99/month",
      category: "Core Features"
    },
    {
      id: 2,
      title: "Student Portal",
      icon: <Users className="w-8 h-8" />,
      description: "Complete student self-service portal for managing their hostel experience.",
      features: [
        "Payment tracking and history",
        "Complaint submission and tracking",
        "Leave request management",
        "Personal profile management",
        "Document upload and storage",
        "Communication center"
      ],
      price: "Included with Room Management",
      category: "Student Services"
    },
    {
      id: 3,
      title: "Admin Dashboard",
      icon: <BarChart3 className="w-8 h-8" />,
      description: "Powerful administrative tools for complete hostel management and oversight.",
      features: [
        "Revenue analytics and reporting",
        "Student management and records",
        "Staff management and scheduling",
        "Financial reporting and tracking",
        "System configuration and settings",
        "Audit logs and security monitoring"
      ],
      price: "Included with Room Management",
      category: "Administrative"
    },
    {
      id: 4,
      title: "Payment Processing",
      icon: <CreditCard className="w-8 h-8" />,
      description: "Secure payment processing with multiple payment gateways and automated billing.",
      features: [
        "Multiple payment gateway integration",
        "Automated fee calculation",
        "Payment reminder system",
        "Late fee management",
        "Receipt generation",
        "Financial reporting"
      ],
      price: "2.9% + $0.30 per transaction",
      category: "Financial"
    },
    {
      id: 5,
      title: "Security & Access Control",
      icon: <Shield className="w-8 h-8" />,
      description: "Advanced security features with access control and monitoring systems.",
      features: [
        "Role-based access control",
        "Two-factor authentication",
        "Activity logging and monitoring",
        "Data encryption at rest and in transit",
        "Regular security audits",
        "Compliance with data protection regulations"
      ],
      price: "Included with all plans",
      category: "Security"
    },
    {
      id: 6,
      title: "Communication Hub",
      icon: <MessageSquare className="w-8 h-8" />,
      description: "Integrated communication system for announcements, notifications, and messaging.",
      features: [
        "Bulk SMS and email notifications",
        "Announcement management",
        "Emergency alert system",
        "In-app messaging",
        "Notification preferences",
        "Communication analytics"
      ],
      price: "Starting from $29/month",
      category: "Communication"
    },
    {
      id: 7,
      title: "Analytics & Reporting",
      icon: <TrendingUp className="w-8 h-8" />,
      description: "Comprehensive analytics and reporting tools for data-driven decision making.",
      features: [
        "Real-time occupancy analytics",
        "Revenue and financial reports",
        "Student behavior analytics",
        "Custom report generation",
        "Data export capabilities",
        "Performance dashboards"
      ],
      price: "Included with Admin Dashboard",
      category: "Analytics"
    },
    {
      id: 8,
      title: "Mobile App",
      icon: <Smartphone className="w-8 h-8" />,
      description: "Native mobile applications for iOS and Android with full feature access.",
      features: [
        "Cross-platform compatibility",
        "Offline functionality",
        "Push notifications",
        "Biometric authentication",
        "QR code scanning",
        "Real-time updates"
      ],
      price: "Included with all plans",
      category: "Mobile"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small hostels",
      features: [
        "Up to 50 rooms",
        "Basic room management",
        "Student portal",
        "Email support",
        "Basic reporting"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$199",
      period: "/month",
      description: "Ideal for medium-sized hostels",
      features: [
        "Up to 200 rooms",
        "Advanced room management",
        "Admin dashboard",
        "Payment processing",
        "Analytics & reporting",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$399",
      period: "/month",
      description: "For large hostel chains",
      features: [
        "Unlimited rooms",
        "All features included",
        "Custom integrations",
        "Dedicated support",
        "Custom development",
        "SLA guarantee"
      ],
      popular: false
    }
  ];

  const toggleService = (id) => {
    setExpandedService(expandedService === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Our
              <span className="text-amber-600"> Services</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Comprehensive hostel management solutions designed to streamline operations, 
              enhance student experience, and maximize efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-amber-600 text-white px-8 py-4 rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#pricing"
                className="border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-xl hover:bg-amber-600 hover:text-white transition-colors font-semibold text-lg"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Complete Solution
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage your hostel efficiently and effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                    {service.icon}
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600 mb-4">{service.description}</p>
                
                <div className="mb-4">
                  <span className="text-amber-600 font-semibold">{service.price}</span>
                </div>

                <button
                  onClick={() => toggleService(service.id)}
                  className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center space-x-1"
                >
                  <span>{expandedService === service.id ? 'Hide' : 'View'} Features</span>
                  {expandedService === service.id ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>

                {expandedService === service.id && (
                  <div className="mt-4 pt-4 border-t border-amber-100">
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the plan that fits your hostel's needs and scale as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                plan.popular ? 'border-amber-500' : 'border-amber-100'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  <p className="text-slate-600 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-colors ${
                    plan.popular
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Ready to Transform Your Hostel?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of hostel managers who have already streamlined their operations with HostelHaven.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-amber-600 text-white px-8 py-4 rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              to="/about"
              className="border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-xl hover:bg-amber-600 hover:text-white transition-colors font-semibold text-lg"
            >
              Learn More
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
                 <a href="#pricing" className="block text-slate-600 hover:text-amber-700 transition-colors">Room Management</a>
                 <a href="#pricing" className="block text-slate-600 hover:text-amber-700 transition-colors">Student Portal</a>
                 <a href="#pricing" className="block text-slate-600 hover:text-amber-700 transition-colors">Admin Dashboard</a>
                 <a href="#pricing" className="block text-slate-600 hover:text-amber-700 transition-colors">Payment Processing</a>
                 <Link to="/" className="block text-slate-600 hover:text-amber-700 transition-colors">Features</Link>
               </div>
             </div>
             
             <div className="space-y-4">
               <h3 className="text-slate-800 font-semibold">Company</h3>
               <div className="space-y-2">
                 <Link to="/about" className="block text-slate-600 hover:text-amber-700 transition-colors">About Us</Link>
                 <Link to="/about#contact" className="block text-slate-600 hover:text-amber-700 transition-colors">Contact</Link>
                 <Link to="/" className="block text-slate-600 hover:text-amber-700 transition-colors">Support</Link>
                 <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Services</Link>
               </div>
             </div>
            
            <div className="space-y-4">
              <h3 className="text-slate-800 font-semibold">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-600 hover:text-amber-700 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-600 hover:text-amber-700 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-600 hover:text-amber-700 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-600 hover:text-amber-700 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
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
  );
};

export default ServicesPage; 