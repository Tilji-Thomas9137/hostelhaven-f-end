import { supabase } from './supabase'

// Authentication functions
export const authUtils = {
  // Sign up with email and password
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Reset password
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },

  // Update password
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  },

  // Refresh session
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession()
    return { data, error }
  },

  // Check if session is expired
  isSessionExpired(session) {
    if (!session) return true
    const now = Math.floor(Date.now() / 1000)
    return session.expires_at <= now
  },

  // Get valid session (refresh if needed)
  async getValidSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return { session: null, error }
    }

    if (!session) {
      return { session: null, error: new Error('No session found') }
    }

    // Check if session is expired
    if (this.isSessionExpired(session)) {
      console.log('Session expired, attempting to refresh...')
      const { data: refreshData, error: refreshError } = await this.refreshSession()
      
      if (refreshError) {
        console.error('Failed to refresh session:', refreshError)
        return { session: null, error: refreshError }
      }
      
      return { session: refreshData.session, error: null }
    }

    return { session, error: null }
  }
}

/**
 * Get user role and redirect to appropriate dashboard
 * @param {Object} session - Supabase session object
 * @param {Function} navigate - React Router navigate function
 */
export const redirectToRoleBasedDashboard = async (authData, navigate) => {
  try {
    if (!authData?.user) {
      console.error('No user data available for redirection');
      navigate('/login');
      return;
    }

    // Get a valid session (refresh if needed)
    const { session: validSession, error: sessionError } = await authUtils.getValidSession();
    
    if (sessionError || !validSession) {
      console.error('Failed to get valid session:', sessionError);
      navigate('/login');
      return;
    }

    // Use the backend API to get or create user profile
    const backendUrl = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:3002';
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${validSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.user) {
          console.log('User profile retrieved successfully:', result.data.user);
          // Navigate to the dashboard
          navigate('/dashboard');
          return;
        }
      } else if (response.status === 401) {
        console.error('Authentication failed - session expired');
        // Try to refresh session and retry
        const { session: refreshedSession, error: refreshError } = await authUtils.refreshSession();
        
        if (refreshError || !refreshedSession) {
          console.error('Failed to refresh session:', refreshError);
          navigate('/login');
          return;
        }

        // Retry with refreshed session
        const retryResponse = await fetch(`${backendUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${refreshedSession.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (retryResponse.ok) {
          const retryResult = await retryResponse.json();
          if (retryResult.success && retryResult.data?.user) {
            console.log('User profile retrieved successfully after refresh:', retryResult.data.user);
            navigate('/dashboard');
            return;
          }
        }
      }
    } catch (apiError) {
      console.error('Error calling backend API:', apiError);
    }

    // Fallback: Try direct database access (this might fail due to RLS)
    console.log('Backend API failed, trying direct database access...');
    
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', authData.user.email)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      // If we can't get the profile, still navigate to dashboard
      // The dashboard will handle profile creation
      navigate('/dashboard');
      return;
    }

    if (!userProfile) {
      console.log('No user profile found, navigating to dashboard to handle creation...');
      // Navigate to dashboard - it will handle profile creation
      navigate('/dashboard');
      return;
    }

    // Navigate to the dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Error in role-based redirection:', error);
    // Even if there's an error, try to navigate to dashboard
    navigate('/dashboard');
  }
};

// User management functions
export const userUtils = {
  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Get all users (admin only)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get users by hostel
  async getUsersByHostel(hostelId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('hostel_id', hostelId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

// Hostel management functions
export const hostelUtils = {
  // Get all hostels
  async getAllHostels() {
    const { data, error } = await supabase
      .from('hostels')
      .select('*')
      .order('name', { ascending: true })
    return { data, error }
  },

  // Get hostel by ID
  async getHostelById(hostelId) {
    const { data, error } = await supabase
      .from('hostels')
      .select('*')
      .eq('id', hostelId)
      .single()
    return { data, error }
  },

  // Create new hostel
  async createHostel(hostelData) {
    const { data, error } = await supabase
      .from('hostels')
      .insert(hostelData)
      .select()
      .single()
    return { data, error }
  },

  // Update hostel
  async updateHostel(hostelId, updates) {
    const { data, error } = await supabase
      .from('hostels')
      .update(updates)
      .eq('id', hostelId)
      .select()
      .single()
    return { data, error }
  },

  // Delete hostel
  async deleteHostel(hostelId) {
    const { error } = await supabase
      .from('hostels')
      .delete()
      .eq('id', hostelId)
    return { error }
  }
}

// Room management functions
export const roomUtils = {
  // Get all rooms
  async getAllRooms() {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        hostels(name, city, state),
        users(full_name, email)
      `)
      .order('room_number', { ascending: true })
    return { data, error }
  },

  // Get rooms by hostel
  async getRoomsByHostel(hostelId) {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        users(full_name, email)
      `)
      .eq('hostel_id', hostelId)
      .order('room_number', { ascending: true })
    return { data, error }
  },

  // Get available rooms
  async getAvailableRooms(hostelId) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('hostel_id', hostelId)
      .eq('status', 'available')
      .order('room_number', { ascending: true })
    return { data, error }
  },

  // Create new room
  async createRoom(roomData) {
    const { data, error } = await supabase
      .from('rooms')
      .insert(roomData)
      .select()
      .single()
    return { data, error }
  },

  // Update room
  async updateRoom(roomId, updates) {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single()
    return { data, error }
  },

  // Assign user to room
  async assignUserToRoom(userId, roomId) {
    const { data, error } = await supabase
      .from('users')
      .update({ room_id: roomId })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  }
}

// Payment management functions
export const paymentUtils = {
  // Get user payments
  async getUserPayments(userId) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        hostels(name),
        rooms(room_number)
      `)
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
    return { data, error }
  },

  // Get all payments (admin)
  async getAllPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        users(full_name, email),
        hostels(name),
        rooms(room_number)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Create payment
  async createPayment(paymentData) {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single()
    return { data, error }
  },

  // Update payment status
  async updatePaymentStatus(paymentId, status, paidDate = null) {
    const updates = { status }
    if (paidDate) updates.paid_date = paidDate
    
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single()
    return { data, error }
  },

  // Get overdue payments
  async getOverduePayments() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        users(full_name, email),
        hostels(name),
        rooms(room_number)
      `)
      .eq('status', 'pending')
      .lt('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true })
    return { data, error }
  }
}

// Leave request functions
export const leaveUtils = {
  // Get user leave requests
  async getUserLeaveRequests(userId) {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        hostels(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get all leave requests (admin)
  async getAllLeaveRequests() {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        users(full_name, email),
        hostels(name)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Create leave request
  async createLeaveRequest(leaveData) {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(leaveData)
      .select()
      .single()
    return { data, error }
  },

  // Update leave request status
  async updateLeaveRequestStatus(leaveId, status, approvedBy = null) {
    const updates = { status }
    if (approvedBy) {
      updates.approved_by = approvedBy
      updates.approved_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('leave_requests')
      .update(updates)
      .eq('id', leaveId)
      .select()
      .single()
    return { data, error }
  }
}

// Complaint functions
export const complaintUtils = {
  // Get user complaints
  async getUserComplaints(userId) {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        hostels(name),
        rooms(room_number)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get all complaints (admin)
  async getAllComplaints() {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        users(full_name, email),
        hostels(name),
        rooms(room_number)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Create complaint
  async createComplaint(complaintData) {
    const { data, error } = await supabase
      .from('complaints')
      .insert(complaintData)
      .select()
      .single()
    return { data, error }
  },

  // Update complaint status
  async updateComplaintStatus(complaintId, status, assignedTo = null) {
    const updates = { status }
    if (assignedTo) updates.assigned_to = assignedTo
    
    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', complaintId)
      .select()
      .single()
    return { data, error }
  }
}

// Notification functions
export const notificationUtils = {
  // Get user notifications
  async getUserNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get unread notifications
  async getUnreadNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single()
    return { data, error }
  },

  // Create notification
  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()
    return { data, error }
  }
}

// Announcement functions
export const announcementUtils = {
  // Get all announcements
  async getAllAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        users(full_name)
      `)
      .eq('is_active', true)
      .order('published_at', { ascending: false })
    return { data, error }
  },

  // Get announcements by hostel
  async getAnnouncementsByHostel(hostelId) {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        users(full_name)
      `)
      .eq('hostel_id', hostelId)
      .eq('is_active', true)
      .order('published_at', { ascending: false })
    return { data, error }
  },

  // Create announcement
  async createAnnouncement(announcementData) {
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcementData)
      .select()
      .single()
    return { data, error }
  },

  // Update announcement
  async updateAnnouncement(announcementId, updates) {
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', announcementId)
      .select()
      .single()
    return { data, error }
  }
}

// Maintenance request functions
export const maintenanceUtils = {
  // Get user maintenance requests
  async getUserMaintenanceRequests(userId) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        hostels(name),
        rooms(room_number)
      `)
      .eq('reported_by', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get all maintenance requests (admin)
  async getAllMaintenanceRequests() {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        users!maintenance_requests_reported_by_fkey(full_name, email),
        hostels(name),
        rooms(room_number)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Create maintenance request
  async createMaintenanceRequest(requestData) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert(requestData)
      .select()
      .single()
    return { data, error }
  },

  // Update maintenance request status
  async updateMaintenanceRequestStatus(requestId, status, assignedTo = null) {
    const updates = { status }
    if (assignedTo) updates.assigned_to = assignedTo
    
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single()
    return { data, error }
  }
}

// Real-time subscriptions
export const realtimeUtils = {
  // Subscribe to notifications
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  // Subscribe to announcements
  subscribeToAnnouncements(hostelId, callback) {
    return supabase
      .channel('announcements')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'announcements',
        filter: `hostel_id=eq.${hostelId}`
      }, callback)
      .subscribe()
  },

  // Subscribe to payments
  subscribeToPayments(userId, callback) {
    return supabase
      .channel('payments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

// Student profile functions
export const profileUtils = {
  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        users(full_name, email, phone),
        rooms(room_number, floor, room_type)
      `)
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  // Get user profile by admission number
  async getUserProfileByAdmission(admissionNumber) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        users(full_name, email, phone),
        rooms(room_number, floor, room_type)
      `)
      .eq('admission_number', admissionNumber)
      .single()
    return { data, error }
  },

  // Create user profile using backend API
  async createUserProfile(profileData) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      const response = await fetch(`${API_BASE_URL}/api/user-profiles/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create profile');
      }

      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update user profile using backend API
  async updateUserProfile(userId, updates) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      const response = await fetch(`${API_BASE_URL}/api/user-profiles/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ ...updates, user_id: userId })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Check if user has profile
  async hasUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()
    return { data: !!data, error }
  },

  // Get profile completion percentage
  async getProfileCompletion(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return { completion: 0, missingFields: [], status: 'incomplete', error }
    }

    const requiredFields = [
      'admission_number', 'course', 'batch_year', 'date_of_birth', 'gender',
      'address', 'city', 'state', 'country', 'emergency_contact_name',
      'emergency_contact_phone', 'parent_name', 'parent_phone', 'parent_email',
      'aadhar_number', 'blood_group'
    ]

    const missingFields = requiredFields.filter(field => !data[field] || data[field] === '')
    const completion = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
    
    // Determine status based on completion
    let status = data.status || 'incomplete'
    if (completion === 100 && status === 'incomplete') {
      status = 'complete'
    }

    return { completion, missingFields, status, error: null }
  },

  // Get all profiles (admin only)
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        users(full_name, email, phone, role),
        rooms(room_number, floor, room_type)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get profiles by course
  async getProfilesByCourse(course) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        users(full_name, email, phone),
        rooms(room_number, floor, room_type)
      `)
      .eq('course', course)
      .order('admission_number', { ascending: true })
    return { data, error }
  },

  // Get profiles by batch year
  async getProfilesByBatch(batchYear) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        users(full_name, email, phone),
        rooms(room_number, floor, room_type)
      `)
      .eq('batch_year', batchYear)
      .order('admission_number', { ascending: true })
    return { data, error }
  },

  // Get profiles by status
  async getProfilesByStatus(status) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        users(full_name, email, phone),
        rooms(room_number, floor, room_type)
      `)
      .eq('profile_status', status)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Update profile status
  async updateProfileStatus(userId, status) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ profile_status: status })
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Update profile completion status
  async updateProfileCompletionStatus(userId, status) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ status: status })
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Assign room to profile
  async assignRoomToProfile(userId, roomId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ room_id: roomId })
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Remove room assignment
  async removeRoomAssignment(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ room_id: null })
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Search profiles
  async searchProfiles(searchTerm) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        users(full_name, email, phone),
        rooms(room_number, floor, room_type)
      `)
      .or(`admission_number.ilike.%${searchTerm}%,course.ilike.%${searchTerm}%,users.full_name.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get profile statistics
  async getProfileStats() {
    const { data: totalProfiles, error: totalError } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact' })

    const { data: activeProfiles, error: activeError } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact' })
      .eq('profile_status', 'active')

    const { data: courseStats, error: courseError } = await supabase
      .from('user_profiles')
      .select('course')
      .eq('profile_status', 'active')

    if (totalError || activeError || courseError) {
      return { error: totalError || activeError || courseError }
    }

    // Count courses
    const courseCounts = courseStats.reduce((acc, profile) => {
      acc[profile.course] = (acc[profile.course] || 0) + 1
      return acc
    }, {})

    return {
      data: {
        total: totalProfiles.length,
        active: activeProfiles.length,
        courseDistribution: courseCounts
      },
      error: null
    }
  },

  // Check if user can perform operations (profile must be complete)
  async canPerformOperations(userId) {
    const { data, error } = await profileUtils.getUserProfile(userId)
    
    if (error || !data) {
      return { canPerform: false, reason: 'Profile not found', error }
    }

    if (data.status === 'incomplete') {
      return { canPerform: false, reason: 'Profile incomplete', error: null }
    }

    if (data.status === 'pending_review') {
      return { canPerform: false, reason: 'Profile under review', error: null }
    }

    return { canPerform: true, reason: 'Profile complete', error: null }
  }
}

// Export all utilities
export default {
  auth: authUtils,
  user: userUtils,
  hostel: hostelUtils,
  room: roomUtils,
  payment: paymentUtils,
  leave: leaveUtils,
  complaint: complaintUtils,
  notification: notificationUtils,
  announcement: announcementUtils,
  maintenance: maintenanceUtils,
  realtime: realtimeUtils,
  profile: profileUtils
} 