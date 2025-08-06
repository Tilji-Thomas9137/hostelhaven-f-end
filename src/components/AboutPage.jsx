import { useState, useEffect } from 'react';
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
  Heart,
  Award,
  Target,
  TrendingUp,
  Globe,
  Zap,
  Shield,
  Users as TeamIcon,
  Calendar,
  Clock,
  MapPin as LocationIcon,
  Mail as EmailIcon,
  Phone as PhoneIcon,
  Award as TrophyIcon,
  Target as MissionIcon,
  Eye as VisionIcon,
  Heart as ValuesIcon,
  CheckCircle as SuccessIcon,
  ArrowUpRight,
  Play,
  Pause
} from 'lucide-react';
import Logo from './Logo';

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('mission');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { number: "500+", label: "Hostels Managed", icon: <Building2 className="w-6 h-6" /> },
    { number: "50K+", label: "Students Served", icon: <Users className="w-6 h-6" /> },
    { number: "99.9%", label: "Uptime", icon: <Target className="w-6 h-6" /> },
    { number: "24/7", label: "Support", icon: <Clock className="w-6 h-6" /> }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      bio: "Former hostel manager with 15+ years experience in student housing.",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      bio: "Tech leader with expertise in scalable software solutions.",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      bio: "Product strategist focused on user experience and innovation.",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "David Kim",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "Operations expert with deep knowledge of hostel management.",
      linkedin: "#",
      twitter: "#"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Student-First",
      description: "Everything we do is designed to enhance the student living experience."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Security & Trust",
      description: "We prioritize data security and build trust through transparency."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Innovation",
      description: "Constantly pushing boundaries to create better solutions."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Accessibility",
      description: "Making hostel management accessible to institutions of all sizes."
    }
  ];

  const timeline = [
    {
      year: "2020",
      title: "Founded",
      description: "HostelHaven was founded with a vision to revolutionize hostel management."
    },
    {
      year: "2021",
      title: "First 100 Hostels",
      description: "Reached our first milestone of 100 hostels using our platform."
    },
    {
      year: "2022",
      title: "Mobile App Launch",
      description: "Launched our mobile applications for iOS and Android."
    },
    {
      year: "2023",
      title: "500+ Hostels",
      description: "Expanded to serve over 500 hostels across multiple countries."
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Introduced AI-powered features for predictive analytics."
    }
  ];

  const tabs = [
    { id: 'mission', label: 'Mission & Vision', icon: <MissionIcon className="w-5 h-5" /> },
    { id: 'story', label: 'Our Story', icon: <Heart className="w-5 h-5" /> },
    { id: 'team', label: 'Our Team', icon: <TeamIcon className="w-5 h-5" /> },
    { id: 'values', label: 'Values', icon: <ValuesIcon className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              About
              <span className="text-amber-600"> HostelHaven</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              We're passionate about revolutionizing hostel management through innovative technology 
              and user-centric design, making life easier for administrators and students alike.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/services"
                className="bg-amber-600 text-white px-8 py-4 rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>Our Services</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#team"
                className="border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-xl hover:bg-amber-600 hover:text-white transition-colors font-semibold text-lg"
              >
                Meet Our Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabbed Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'mission' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                    Our Mission & Vision
                  </h2>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center">
                        <MissionIcon className="w-6 h-6 text-amber-600 mr-2" />
                        Our Mission
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        To simplify and modernize hostel management by providing cutting-edge solutions 
                        that enhance the experience for both administrators and students, making hostel 
                        operations more efficient, transparent, and user-friendly.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center">
                        <VisionIcon className="w-6 h-6 text-amber-600 mr-2" />
                        Our Vision
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        To become the leading platform for smart hostel management, setting new standards 
                        in efficiency, transparency, and user satisfaction while empowering educational 
                        institutions to provide better living experiences for their students.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: '🎯', label: 'Focused on Results' },
                      { icon: '💡', label: 'Innovation Driven' },
                      { icon: '🤝', label: 'Collaborative Approach' },
                      { icon: '🌱', label: 'Sustainable Growth' }
                    ].map((item, index) => (
                      <div key={index} className="text-center p-4 bg-white rounded-xl">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-sm font-medium text-slate-800">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'story' && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
                  Our Story
                </h2>
                <div className="space-y-8">
                  <p className="text-lg text-slate-600 leading-relaxed">
                    HostelHaven was born from a simple observation: hostel management was stuck in the past. 
                    While technology was transforming every other industry, hostel administrators were still 
                    struggling with paper-based systems, manual processes, and disconnected tools.
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Our founder, Sarah Johnson, spent 15 years managing hostels and experienced firsthand 
                    the challenges of running student housing efficiently. She saw how administrative overhead 
                    was taking time away from what really mattered - providing a great living experience for students.
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    In 2020, she assembled a team of technology experts and hostel management professionals 
                    to create a solution that would revolutionize the industry. The result was HostelHaven - 
                    a comprehensive platform that streamlines every aspect of hostel management.
                  </p>
                </div>

                {/* Timeline */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Our Journey</h3>
                  <div className="space-y-6">
                    {timeline.map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {item.year}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h4>
                          <p className="text-slate-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
                  Meet Our Team
                </h2>
                <p className="text-xl text-slate-600 mb-12 text-center max-w-3xl mx-auto">
                  We're a diverse team of passionate individuals committed to transforming hostel management 
                  through technology and innovation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {team.map((member, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 text-center">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{member.name}</h3>
                      <p className="text-amber-600 font-medium mb-3">{member.role}</p>
                      <p className="text-slate-600 text-sm mb-4">{member.bio}</p>
                      <div className="flex justify-center space-x-3">
                        <a href={member.linkedin} className="text-slate-400 hover:text-amber-600 transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                        <a href={member.twitter} className="text-slate-400 hover:text-amber-600 transition-colors">
                          <Twitter className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'values' && (
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
                  Our Values
                </h2>
                <p className="text-xl text-slate-600 mb-12 text-center max-w-3xl mx-auto">
                  These core values guide everything we do and shape our culture and decisions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {values.map((value, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8">
                      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-4">{value.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Join Us in Transforming Hostel Management
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Be part of the revolution in student housing management. 
            Let's work together to create better experiences for students and administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-amber-600 text-white px-8 py-4 rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              to="/services"
              className="border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-xl hover:bg-amber-600 hover:text-white transition-colors font-semibold text-lg"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Phone</h3>
              <p className="text-slate-600 mb-4">Call us anytime for immediate assistance</p>
              <p className="text-amber-600 font-semibold">+1 (555) 123-4567</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <EmailIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Email</h3>
              <p className="text-slate-600 mb-4">Send us an email for detailed queries</p>
              <p className="text-amber-600 font-semibold">hello@hostelhaven.com</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LocationIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Office</h3>
              <p className="text-slate-600 mb-4">Visit our headquarters</p>
              <p className="text-amber-600 font-semibold">123 Innovation St, Tech City</p>
            </div>
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
                 <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Room Management</Link>
                 <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Student Portal</Link>
                 <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Admin Dashboard</Link>
                 <Link to="/services" className="block text-slate-600 hover:text-amber-700 transition-colors">Payment Processing</Link>
                 <Link to="/" className="block text-slate-600 hover:text-amber-700 transition-colors">Features</Link>
               </div>
             </div>
             
             <div className="space-y-4">
               <h3 className="text-slate-800 font-semibold">Company</h3>
               <div className="space-y-2">
                 <Link to="/about" className="block text-slate-600 hover:text-amber-700 transition-colors">About Us</Link>
                 <a href="#contact" className="block text-slate-600 hover:text-amber-700 transition-colors">Contact</a>
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

export default AboutPage; 