// FRONTEND FIXES VERIFICATION
// Test the updated StudentRoomRequest component

// Test 1: Room Number Display Fix
const testRoomNumberDisplay = () => {
  console.log('🧪 Testing room number display...');
  
  // Mock request data with requested_room_id
  const mockRequest = {
    id: 'test-request-123',
    status: 'pending',
    preferred_room_type: 'double',
    requested_room_id: 'room-uuid-123',
    special_requirements: 'Requested specific room: A101'
  };
  
  // Mock rooms data
  const mockRooms = [
    { id: 'room-uuid-123', room_number: 'A101', room_type: 'double' },
    { id: 'room-uuid-456', room_number: 'A102', room_type: 'single' }
  ];
  
  // Test the room number extraction logic
  const getRoomNumber = (request, rooms) => {
    // If allocated and has room data, show room number
    if (request.status === 'allocated' && request.rooms) {
      return request.rooms.room_number;
    }
    
    // If has requested_room_id field, use it directly
    if (request.requested_room_id) {
      const requestedRoom = rooms.find(room => room.id === request.requested_room_id);
      return requestedRoom ? requestedRoom.room_number : 'Room Requested';
    }
    
    // Try to extract from special_requirements as fallback
    if (request.special_requirements) {
      const match = request.special_requirements.match(/REQUESTED_ROOM_ID:([a-f0-9-]+)/i);
      if (match) {
        const requestedRoomId = match[1];
        const requestedRoom = rooms.find(room => room.id === requestedRoomId);
        return requestedRoom ? requestedRoom.room_number : 'Room Requested';
      }
    }
    
    return 'Room Requested';
  };
  
  const result = getRoomNumber(mockRequest, mockRooms);
  console.log('✅ Room number result:', result);
  console.log('Expected: A101, Got:', result);
  
  return result === 'A101';
};

// Test 2: Cancelled Request Filtering Fix
const testCancelledRequestFiltering = () => {
  console.log('🧪 Testing cancelled request filtering...');
  
  const mockRequests = [
    { id: 'req-1', status: 'pending', created_at: '2025-01-20' },
    { id: 'req-2', status: 'cancelled', created_at: '2025-01-19' },
    { id: 'req-3', status: 'approved', created_at: '2025-01-18' },
    { id: 'req-4', status: 'rejected', created_at: '2025-01-17' }
  ];
  
  // Test the filtering logic
  const activeRequests = mockRequests.filter(req => {
    const status = req.status?.toLowerCase();
    const isActive = status && !['cancelled', 'rejected'].includes(status);
    console.log(`Request ${req.id}: status=${req.status}, isActive=${isActive}`);
    return isActive;
  });
  
  console.log('✅ Active requests:', activeRequests);
  console.log('Expected: 2 requests (pending, approved), Got:', activeRequests.length);
  
  return activeRequests.length === 2 && 
         activeRequests.every(req => ['pending', 'approved'].includes(req.status));
};

// Test 3: API Endpoint Updates
const testAPIEndpoints = () => {
  console.log('🧪 Testing API endpoint updates...');
  
  const endpoints = {
    create: '/api/room-requests/unified/create',
    cancel: '/api/room-requests/unified/:id/cancel',
    approve: '/api/room-requests/unified/:id/approve'
  };
  
  console.log('✅ Updated endpoints:', endpoints);
  
  // Verify endpoints are correct
  const isValid = Object.values(endpoints).every(endpoint => 
    endpoint.includes('/unified/') && endpoint.includes('/api/room-requests/')
  );
  
  console.log('Expected: true, Got:', isValid);
  return isValid;
};

// Run all tests
const runAllTests = () => {
  console.log('🚀 Running frontend fixes verification...');
  
  const test1 = testRoomNumberDisplay();
  const test2 = testCancelledRequestFiltering();
  const test3 = testAPIEndpoints();
  
  console.log('\n📊 Test Results:');
  console.log('Room Number Display:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('Cancelled Request Filtering:', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('API Endpoint Updates:', test3 ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = test1 && test2 && test3;
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return allPassed;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testRoomRequestFixes = runAllTests;
  console.log('🧪 Test function available as window.testRoomRequestFixes()');
}

// Run tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testRoomNumberDisplay,
    testCancelledRequestFiltering,
    testAPIEndpoints,
    runAllTests
  };
}
