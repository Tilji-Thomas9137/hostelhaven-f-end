/**
 * Utility functions for routing and navigation
 */

/**
 * Get the appropriate dashboard path based on user role
 * @param {string} role - User role
 * @returns {string} Dashboard path
 */
export const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'warden':
      return '/warden-dashboard';
    case 'hostel_operations_assistant':
      return '/operations-dashboard';
    case 'student':
      return '/student-dashboard';
    case 'parent':
      return '/parent-dashboard';
    default:
      return '/dashboard';
  }
};

/**
 * Check if a path is a dashboard path
 * @param {string} pathname - Current pathname
 * @returns {boolean} True if it's a dashboard path
 */
export const isDashboardPath = (pathname) => {
  const dashboardPaths = [
    '/dashboard',
    '/student-dashboard',
    '/admin-dashboard',
    '/warden-dashboard',
    '/parent-dashboard',
    '/operations-dashboard'
  ];
  
  return dashboardPaths.some(path => pathname.startsWith(path));
};

/**
 * Get user role from session or user object
 * @param {object} user - User object
 * @param {object} session - Supabase session
 * @returns {string} User role
 */
export const getUserRole = (user, session) => {
  if (user?.role) return user.role;
  if (session?.user?.user_metadata?.role) return session.user.user_metadata.role;
  return 'student'; // Default role
};

/**
 * Navigate to appropriate dashboard based on user role
 * @param {function} navigate - React Router navigate function
 * @param {object} user - User object
 * @param {object} session - Supabase session (optional)
 */
export const navigateToUserDashboard = (navigate, user, session = null) => {
  const role = getUserRole(user, session);
  const dashboardPath = getDashboardPath(role);
  navigate(dashboardPath);
};

/**
 * Create a consistent access denied component
 * @param {string} message - Custom message
 * @param {string} buttonText - Button text
 * @param {function} onButtonClick - Button click handler
 * @returns {JSX.Element} Access denied component
 */
export const createAccessDeniedComponent = (message = 'Access Required', buttonText = 'Go to Login', onButtonClick) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{message}</h2>
        <p className="text-slate-600 mb-6">Please log in to access your dashboard.</p>
        <button
          onClick={onButtonClick}
          className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
