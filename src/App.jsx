import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import OperationsDashboard from './components/dashboard/OperationsDashboard';
import TestDashboard from './components/TestDashboard';
import AuthCallback from './components/AuthCallback';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ServicesPage from './components/ServicesPage';
import AboutPage from './components/AboutPage';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';

// Component to conditionally render navigation
const AppContent = () => {
  const location = useLocation();
  const isDashboardPage = location.pathname.startsWith('/dashboard') || 
                         location.pathname.startsWith('/student-dashboard') ||
                         location.pathname.startsWith('/admin-dashboard') ||
                         location.pathname.startsWith('/warden-dashboard') ||
                         location.pathname.startsWith('/parent-dashboard') ||
                         location.pathname.startsWith('/operations-dashboard');

  return (
    <div className="App min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {!isDashboardPage && <Navigation />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/operations-dashboard" element={<OperationsDashboard />} />
        <Route path="/test" element={<TestDashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </Router>
  );
}

export default App;