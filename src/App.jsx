import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
// SignUp component removed - registration disabled
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import ComprehensiveAdminDashboard from './components/dashboard/ComprehensiveAdminDashboard';
import WardenDashboard from './components/dashboard/WardenDashboard';
import OperationsDashboard from './components/dashboard/OperationsDashboard';
import ParentDashboard from './components/dashboard/ParentDashboard';
import ParentDashboardNew from './components/dashboard/ParentDashboardNew';
import TestDashboard from './components/TestDashboard';
import AuthCallback from './components/AuthCallback';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Activate from './components/Activate';
import ServicesPage from './components/ServicesPage';
import AboutPage from './components/AboutPage';
import StudentRoomRequest from './components/StudentRoomRequest';
import ParentOTPVerification from './components/ParentOTPVerification';
import ParcelManagement from './components/ParcelManagement';
import QRVerification from './components/QRVerification';
import StudentCleaningRequest from './components/StudentCleaningRequest';
import CleaningManagement from './components/CleaningManagement';
import RouteGuard from './components/RouteGuard';
import DebugLogin from './components/DebugLogin';
import DebugRoomRequests from './components/DebugRoomRequests';
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
        {/* Signup route removed - registration disabled */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/dashboard" element={<RouteGuard><Dashboard /></RouteGuard>} />
        <Route path="/student-dashboard" element={<RouteGuard requiredRole="student"><StudentDashboard /></RouteGuard>} />
        <Route path="/admin-dashboard" element={<RouteGuard requiredRole="admin"><ComprehensiveAdminDashboard /></RouteGuard>} />
        <Route path="/warden-dashboard" element={<RouteGuard requiredRole="warden"><WardenDashboard /></RouteGuard>} />
        <Route path="/operations-dashboard" element={<RouteGuard requiredRole="hostel_operations_assistant"><OperationsDashboard /></RouteGuard>} />
        <Route path="/parent-dashboard" element={<RouteGuard requiredRole="parent"><ParentDashboardNew /></RouteGuard>} />
        <Route path="/parent-dashboard-old" element={<RouteGuard requiredRole="parent"><ParentDashboard /></RouteGuard>} />
        <Route path="/test" element={<TestDashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/student/room-request" element={<StudentRoomRequest />} />
        <Route path="/parent/verify" element={<ParentOTPVerification />} />
        <Route path="/staff/parcel-management" element={<ParcelManagement />} />
        <Route path="/staff/qr-verification" element={<QRVerification />} />
        <Route path="/student/cleaning-request" element={<StudentCleaningRequest />} />
        <Route path="/staff/cleaning-management" element={<CleaningManagement />} />
        {/* Debug routes removed */}
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