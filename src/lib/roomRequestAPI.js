// FRONTEND INTEGRATION GUIDE - UNIFIED ROOM REQUEST SYSTEM
// Use these endpoints for fully functional room requests and allocations

// ============================================================================
// 1. CREATE ROOM REQUEST (Student)
// ============================================================================
const createRoomRequest = async (requestData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const response = await fetch('http://localhost:3002/api/room-requests/unified/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preferred_room_type: requestData.roomType, // 'single', 'double', 'triple'
        preferred_floor: requestData.floor, // optional: 1-8
        special_requirements: requestData.requirements, // optional: string
        urgency_level: requestData.urgency, // optional: 'low', 'medium', 'high'
        requested_room_id: requestData.roomId // optional: specific room UUID
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Room request created:', result.data.request);
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to create room request');
    }
  } catch (error) {
    console.error('❌ Create room request error:', error);
    throw error;
  }
};

// ============================================================================
// 2. APPROVE ROOM REQUEST (Staff/Admin)
// ============================================================================
const approveRoomRequest = async (requestId, roomId, notes = '') => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const response = await fetch(`http://localhost:3002/api/room-requests/unified/${requestId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_id: roomId, // UUID of the room to allocate
        notes: notes // optional: approval notes
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Room request approved and allocated:', result.data);
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to approve room request');
    }
  } catch (error) {
    console.error('❌ Approve room request error:', error);
    throw error;
  }
};

// ============================================================================
// 3. CANCEL ROOM REQUEST (Student/Staff)
// ============================================================================
const cancelRoomRequest = async (requestId) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const response = await fetch(`http://localhost:3002/api/room-requests/unified/${requestId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Room request cancelled:', result.data);
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to cancel room request');
    }
  } catch (error) {
    console.error('❌ Cancel room request error:', error);
    throw error;
  }
};

// ============================================================================
// 4. GET USER'S ROOM REQUEST STATUS (Student)
// ============================================================================
const getMyRoomRequest = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const response = await fetch('http://localhost:3002/api/room-requests/my-request', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      return result.data; // Returns request or null if none exists
    } else {
      throw new Error(result.message || 'Failed to get room request');
    }
  } catch (error) {
    console.error('❌ Get room request error:', error);
    throw error;
  }
};

// ============================================================================
// 5. GET ALL ROOM REQUESTS (Staff/Admin)
// ============================================================================
const getAllRoomRequests = async (page = 1, limit = 10, status = 'all') => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status: status
    });

    const response = await fetch(`http://localhost:3002/api/room-requests/all?${params}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to get room requests');
    }
  } catch (error) {
    console.error('❌ Get all room requests error:', error);
    throw error;
  }
};

// ============================================================================
// 6. CHECK ROOM ALLOCATION STATUS (Student)
// ============================================================================
const checkRoomAllocation = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const response = await fetch('http://localhost:3002/api/room-allocations/my-allocation', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      return result.data; // Returns allocation or null if none exists
    } else {
      throw new Error(result.message || 'Failed to check room allocation');
    }
  } catch (error) {
    console.error('❌ Check room allocation error:', error);
    throw error;
  }
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Example 1: Student submits room request
const submitRoomRequest = async () => {
  try {
    const requestData = {
      roomType: 'double',
      floor: 2,
      requirements: 'Need ground floor access',
      urgency: 'medium'
    };
    
    const result = await createRoomRequest(requestData);
    console.log('Room request submitted:', result.request.id);
    return result;
  } catch (error) {
    console.error('Failed to submit room request:', error.message);
  }
};

// Example 2: Staff approves room request
const approveRequest = async (requestId, roomId) => {
  try {
    const result = await approveRoomRequest(requestId, roomId, 'Approved for Room A101');
    console.log('Request approved and room allocated:', result.allocation.id);
    return result;
  } catch (error) {
    console.error('Failed to approve request:', error.message);
  }
};

// Example 3: Student cancels room request
const cancelRequest = async (requestId) => {
  try {
    const result = await cancelRoomRequest(requestId);
    console.log('Request cancelled:', result.request_id);
    return result;
  } catch (error) {
    console.error('Failed to cancel request:', error.message);
  }
};

// Example 4: Check if student can submit cleaning request
const canSubmitCleaningRequest = async () => {
  try {
    const allocation = await checkRoomAllocation();
    if (allocation && allocation.allocation_status === 'confirmed') {
      console.log('✅ Student has room allocation, can submit cleaning request');
      return true;
    } else {
      console.log('❌ Student has no room allocation, cannot submit cleaning request');
      return false;
    }
  } catch (error) {
    console.error('Failed to check allocation:', error.message);
    return false;
  }
};

// Export functions for use in components
export {
  createRoomRequest,
  approveRoomRequest,
  cancelRoomRequest,
  getMyRoomRequest,
  getAllRoomRequests,
  checkRoomAllocation,
  submitRoomRequest,
  approveRequest,
  cancelRequest,
  canSubmitCleaningRequest
};
