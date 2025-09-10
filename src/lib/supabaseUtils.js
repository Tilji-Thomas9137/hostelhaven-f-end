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

    // Get user profile from Supabase directly
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', authData.user.email)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      navigate('/login');
      return;
    }

    if (!userProfile) {
      // Create user profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || authData.user.email.split('@')[0],
          phone: authData.user.user_metadata?.phone || null,
          role: authData.user.user_metadata?.role || 'student'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        navigate('/login');
        return;
      }

      userProfile = newProfile;
    }

    // Navigate to the dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Error in role-based redirection:', error);
    navigate('/login');
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
  realtime: realtimeUtils
} 