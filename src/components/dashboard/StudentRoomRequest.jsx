import { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase';
import ConfirmationModal from '../ui/ConfirmationModal';
import { 
  Building2, 
  Users, 
  UserCheck,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Home,
  User,
  Eye,
  RefreshCw
} from 'lucide-react';

const StudentRoomRequest = () => {
  const { showNotification, clearAllNotifications } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRoomId, setLoadingRoomId] = useState(null);
  
  // Data states
  const [rooms, setRooms] = useState([]);
  const [myRequest, setMyRequest] = useState(null);
  const [myAllocation, setMyAllocation] = useState(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  
  // Enhanced request management states
  const [requestStatus, setRequestStatus] = useState(null);
  const [canSubmitNewRequest, setCanSubmitNewRequest] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  
  
  // Filters
  const [roomSearch, setRoomSearch] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');

  useEffect(() => {
    clearAllNotifications(); // Clear any stale notifications
    fetchAllData();
  }, []);

  // Update request status and form availability whenever myRequest or myAllocation changes
  useEffect(() => {
    updateRequestStatus();
  }, [myRequest, myAllocation]);

  const updateRequestStatus = () => {
    if (myAllocation && myAllocation.allocation_status === 'confirmed') {
      // Student has confirmed room allocation
      setRequestStatus('allocated');
      setCanSubmitNewRequest(false);
      setRequestMessage('You have been allocated a room. No new requests can be submitted.');
      return;
    }

    if (!myRequest) {
      // No request exists
      setRequestStatus('none');
      setCanSubmitNewRequest(true);
      setRequestMessage('');
      return;
    }

    const status = myRequest.status;
    setRequestStatus(status);

    switch (status) {
      case 'pending':
        setCanSubmitNewRequest(false);
        setRequestMessage('You have a pending room request. Please wait for approval or cancel it to submit a new request.');
        break;
      case 'approved':
      case 'allocated':
        setCanSubmitNewRequest(false);
        setRequestMessage('Your room request has been approved. No new requests can be submitted.');
        break;
      case 'rejected':
        setCanSubmitNewRequest(true);
        setRequestMessage('Your previous request was rejected. You can now submit a new room request.');
        break;
      case 'cancelled':
        setCanSubmitNewRequest(true);
        setRequestMessage('Your previous request was cancelled. You can now submit a new room request.');
        break;
      default:
        setCanSubmitNewRequest(true);
        setRequestMessage('');
    }
  };



  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchRooms(),
        fetchMyRequest(),
        fetchMyAllocation()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Unable to load room allocation data. Please refresh the page or try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    showNotification('Refreshing data...', 'info', 2000);
    await fetchAllData();
    showNotification('Data refreshed successfully!', 'success', 2000);
  };

  const fetchRooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        return;
      }

      console.log('Fetching available rooms...');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/room-allocation/rooms`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Rooms response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Rooms data:', result);
        setRooms(result.data?.rooms || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch rooms:', response.status, errorText);
        showNotification('Failed to load available rooms', 'error');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      showNotification('Network error while loading rooms', 'error');
    }
  };


  const fetchMyRequest = async () => {
    try {
      console.log('🔄 fetchMyRequest called');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ No session found in fetchMyRequest');
        return;
      }
      
      console.log('🔑 Session found:', {
        user_id: session.user.id,
        email: session.user.email
      });

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const timestamp = Date.now();
      console.log('📡 Fetching my requests from:', `${API_BASE_URL}/api/room-requests/my-requests?t=${timestamp}`);
      
      const response = await fetch(`${API_BASE_URL}/api/room-requests/my-requests?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        // Extract requests from the response - try multiple possible paths
        const requests = result.data?.requests || result.requests || result.data || [];
        
        console.log('📋 All requests from API:', requests);
        
        // Filter out cancelled requests and find the most recent active request
        const activeRequests = requests.filter(req => {
          const isActive = req.status && req.status.toLowerCase() !== 'cancelled';
          console.log(`🔍 Request ${req.id}: status=${req.status}, isActive=${isActive}`);
          return isActive;
        });
        
        console.log('✅ Active requests after filtering:', activeRequests);
        
        const pendingRequest = activeRequests.find(req => req.status.toLowerCase() === 'pending');
        const requestToSet = pendingRequest || activeRequests[0] || null;
        
        console.log('🎯 Setting myRequest to:', requestToSet);
        setMyRequest(requestToSet);
      } else {
        // Handle other error statuses
        const errorText = await response.text();
        console.error('❌ API request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        setMyRequest(null);
      }
    } catch (error) {
      console.error('Error fetching my request:', error);
      // On error, don't change the current state to avoid UI flicker
    }
  };

  const fetchMyAllocation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // This would fetch the user's current room allocation
      // For now, we'll check if they have a room_id in their profile
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('room_id')
        .eq('id', session.user.id)
        .single();

      if (!error && userProfile?.room_id) {
        // Fetch room details separately if room_id exists
        const { data: roomData } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', userProfile.room_id)
          .single();
        
        setMyAllocation({
          room_id: userProfile.room_id,
          room: roomData,
          allocation_status: 'confirmed'
        });
      } else {
        setMyAllocation(null);
      }
    } catch (error) {
      console.error('Error fetching my allocation:', error);
    }
  };

  const handleRequestRoom = async (room) => {
    // Check if student can submit a new request
    if (!canSubmitNewRequest) {
      showNotification(requestMessage, 'error');
      return;
    }
    
    // Additional check for room allocation
    if (myAllocation && myAllocation.allocation_status === 'confirmed') {
      showNotification('You already have a confirmed room allocation. No new requests can be submitted.', 'error');
      return;
    }
    setIsSubmitting(true);
    setLoadingRoomId(room?.id || null);
    let errorNotificationShown = false;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showNotification('Please log in to submit a room request', 'error');
        return;
      }

      // Create a room request for the specific room with payment information
      const requestData = {
        preferred_room_type: (room.room_type || '').toLowerCase(),
        preferred_floor: room.floor || 1,
        urgency_level: 'medium',
        special_requirements: `REQUESTED_ROOM_ID:${room.id}`
      };

      console.log('Requesting room:', room);
      console.log('Request data:', requestData);

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/room-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Room request submitted successfully:', responseData);
        console.log('📊 Response data structure:', {
          success: responseData.success,
          data: responseData.data,
          message: responseData.message
        });
        
        // Small delay to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔄 About to fetch my request after submission...');
        // Force refresh the request data
        // Immediately refresh all data to show the new request
        console.log('🔄 Refreshing data after successful submission...');
        await fetchAllData();
        
        // Force another refresh after a short delay to ensure data is updated
        setTimeout(async () => {
          console.log('🔄 Final refresh after submission...');
          await fetchAllData();
        }, 2000);
        showNotification(`Room request for Room ${room.room_number} submitted successfully! Monthly rent: ₹${room.price}/month. You will be notified once approved and payment details will be sent to you and your parents.`, 'success', 6000);
      } else {
        let errorMessage = 'Request submission failed';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || error.details || 'Request submission failed';
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        showNotification(errorMessage, 'error');
        errorNotificationShown = true;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating request:', error);
      // Only show notification if it's not already shown above
      if (!errorNotificationShown) {
        showNotification('Unable to connect to our servers. Please check your internet connection and try again.', 'error');
      }
      throw error; // Re-throw to be caught by the form handler
    } finally {
      setIsSubmitting(false);
      setLoadingRoomId(null);
    }
  };

  const handleCancelRequest = (requestId) => {
    setRequestToCancel(requestId);
    setShowCancelModal(true);
  };

  const confirmCancelRequest = async () => {
    if (!requestToCancel) return;

    // Handle dummy requests specially
    if (requestToCancel === 'dummy-request-id') {
      showNotification('This is a test request and cannot be cancelled. Please submit a real room request to test cancellation.', 'info');
      setShowCancelModal(false);
      return;
    }

    console.log('🔄 Starting request cancellation for ID:', requestToCancel);
    setIsSubmitting(true);
    setShowCancelModal(false);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ No session found for cancellation');
        return;
      }

      // Try DELETE first, fallback to PUT cancel if DELETE fails
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      console.log('📡 Sending DELETE request to:', `${API_BASE_URL}/api/room-allocation/request/${requestToCancel}`);
      
      let response = await fetch(`${API_BASE_URL}/api/room-allocation/request/${requestToCancel}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      // If DELETE fails, try PUT cancel as fallback
      if (!response.ok) {
        console.log('⚠️ DELETE failed, trying PUT cancel as fallback...');
        response = await fetch(`${API_BASE_URL}/api/room-allocation/request/${requestToCancel}/cancel`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      console.log('📊 DELETE response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Request deleted successfully from database:', responseData);
        
        // Clear the request from local state immediately since it's deleted
        setMyRequest(null);
        
        // Clear all data to force a complete refresh
        setRooms([]);
        setMyAllocation(null);
        
        // Reset request status to reflect no request
        setRequestStatus('none');
        setCanSubmitNewRequest(true);
        setRequestMessage('');
        
        // Small delay to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔄 About to fetch my request after deletion...');
        // Force a fresh fetch to ensure UI is updated
        await fetchMyRequest();
        
        console.log('🔄 About to fetch all data after deletion...');
        // Also refresh all data to update status cards
        await fetchAllData();
        showNotification('Your room request has been successfully cancelled.', 'success', 3000);
      } else {
        let errorMessage = 'Unable to cancel your room request at this time. Please try again or contact support if the issue persists.';
        try {
          const errorData = await response.json();
          console.error('❌ DELETE request failed:', response.status, errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      showNotification('Unable to cancel your room request at this time. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
      setRequestToCancel(null);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setRequestToCancel(null);
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">My Room</h3>
              <p className="text-2xl font-bold text-slate-900">
                {myAllocation ? `Room ${myAllocation.room?.room_number || 'N/A'}` : 'Not Assigned'}
              </p>
              <p className="text-sm text-slate-600">
                {myAllocation ? myAllocation.room?.room_type || 'Standard' : 'No room allocated'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              myRequest?.status === 'allocated' ? 'bg-green-100 text-green-600' :
              myRequest?.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
              myRequest?.status === 'waitlisted' ? 'bg-purple-100 text-purple-600' :
              'bg-slate-100 text-slate-600'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Request Status</h3>
              <p className="text-2xl font-bold text-slate-900 capitalize">
                {myRequest?.status || 'No Request'}
              </p>
              <p className="text-sm text-slate-600">
                {myRequest ? 'Request submitted' : 'Submit a request'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Available Rooms</h3>
              <p className="text-2xl font-bold text-slate-900">
                {rooms.filter(room => {
                  const actualOccupancy = Math.max(room.current_occupancy || 0, room.occupied || 0);
                  return actualOccupancy < room.capacity && room.status !== 'full' && room.status !== 'maintenance';
                }).length}
              </p>
              <p className="text-sm text-slate-600">Out of {rooms.length} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Room Allocation Display - Show when student has confirmed allocation */}
      {myAllocation && myAllocation.allocation_status === 'confirmed' ? (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">My Room Allocation</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleManualRefresh}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Room Allocated Successfully!</h3>
                <p className="text-green-600">Your room request has been approved and allocated.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-medium text-slate-800 mb-2">Room Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Room Number:</span>
                    <span className="font-medium">{myAllocation.room_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Floor:</span>
                    <span className="font-medium">{myAllocation.floor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Room Type:</span>
                    <span className="font-medium capitalize">{myAllocation.room_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Rent:</span>
                    <span className="font-medium">₹{myAllocation.monthly_rent || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-medium text-slate-800 mb-2">Allocation Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className="font-medium text-green-600 capitalize">{myAllocation.allocation_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Allocated Date:</span>
                    <span className="font-medium">{myAllocation.allocated_at ? new Date(myAllocation.allocated_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Valid Until:</span>
                    <span className="font-medium">{myAllocation.valid_until ? new Date(myAllocation.valid_until).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Important Information</h4>
                  <p className="text-blue-700 text-sm">
                    Your room allocation is confirmed. Please contact the hostel administration for any queries regarding your allocated room.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* Current Status */}
      {myRequest ? (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">My Room Request</h2>
            <button
              onClick={fetchMyRequest}
              disabled={isSubmitting}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">Request Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    myRequest.status === 'allocated' ? 'bg-green-100 text-green-800' : 
                    myRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    myRequest.status === 'waitlisted' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {myRequest.status}
                  </span>
                </p>
                <p><span className="font-medium">Requested:</span> {new Date(myRequest.requested_at).toLocaleDateString()}</p>
                {myRequest.preferred_room_type && (
                  <p><span className="font-medium">Preferred Type:</span> {myRequest.preferred_room_type}</p>
                )}
                {myRequest.preferred_floor && (
                  <p><span className="font-medium">Preferred Floor:</span> {myRequest.preferred_floor}</p>
                )}
                <p>
                  <span className="font-medium">Room Number:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                    myRequest.status === 'allocated' && myRequest.rooms 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {myRequest.status === 'allocated' && myRequest.rooms 
                      ? myRequest.rooms.room_number 
                      : (() => {
                          // Extract requested room number from special_requirements
                          if (myRequest.special_requirements) {
                            console.log('🔍 Debug: special_requirements:', myRequest.special_requirements);
                            console.log('🔍 Debug: available rooms:', rooms.map(r => ({ id: r.id, room_number: r.room_number })));
                            const match = myRequest.special_requirements.match(/REQUESTED_ROOM_ID:([a-f0-9-]+)/i);
                            if (match) {
                              const requestedRoomId = match[1];
                              console.log('🔍 Debug: extracted room ID:', requestedRoomId);
                              const requestedRoom = rooms.find(room => room.id.toString() === requestedRoomId);
                              console.log('🔍 Debug: found room:', requestedRoom);
                              return requestedRoom ? requestedRoom.room_number : 'Room Requested';
                            }
                          }
                          return 'Room Requested';
                        })()}
                  </span>
                </p>
              </div>
            </div>
            
            {myRequest.status === 'allocated' && myRequest.rooms ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-3 flex items-center">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                  </div>
                  Room Allocated Successfully!
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-green-700">Room Number:</span>
                    <p className="text-green-900 font-semibold">{myRequest.rooms.room_number}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Floor:</span>
                    <p className="text-green-900">{myRequest.rooms.floor}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Type:</span>
                    <p className="text-green-900">{myRequest.rooms.room_type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Price:</span>
                    <p className="text-green-900">${myRequest.rooms.price}/month</p>
                  </div>
                </div>
                {myRequest.allocated_at && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <span className="font-medium text-green-700">Allocated:</span>
                    <p className="text-green-900">{new Date(myRequest.allocated_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ) : myRequest.status === 'pending' ? (
              <div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">Request Status</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Request Under Review</p>
                      <p className="text-sm text-blue-600">
                        Your room request is being processed. A specific room number will be assigned when your request is approved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          
          {myRequest.status === 'pending' && (
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => handleCancelRequest(myRequest.id)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Cancel Request
              </button>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-slate-800">Need to submit a new request?</h3>
                <p className="text-slate-600">Browse available rooms below and click "Request This Room" on your preferred room.</p>
              </div>
              <button
                onClick={() => setActiveTab('rooms')}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Browse Rooms</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">My Room Request</h2>
            <div className="flex space-x-2">
              <button
                onClick={fetchMyRequest}
                disabled={isSubmitting}
                className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              {requestStatus === 'none' ? 'No Room Request Found' : 
               requestStatus === 'pending' ? 'Room Request Pending' :
               requestStatus === 'rejected' ? 'Previous Request Rejected' :
               requestStatus === 'allocated' ? 'Room Allocated' :
               'Room Request Status'}
            </h3>
            <p className="text-slate-600 mb-6">
              {requestStatus === 'none' ? 'You haven\'t submitted any room requests yet. Browse available rooms below to get started.' :
               requestMessage || 'Check your room request status below.'}
            </p>
            <button
              onClick={() => {
                if (!canSubmitNewRequest) {
                  showNotification(requestMessage, 'error');
                  return;
                }
                setActiveTab('rooms');
              }}
              disabled={!canSubmitNewRequest}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto ${
                !canSubmitNewRequest
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Browse Available Rooms</span>
            </button>
          </div>
        </div>
      )}
        </>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (!canSubmitNewRequest) {
                showNotification(requestMessage, 'error');
                return;
              }
              setActiveTab('rooms');
            }}
            disabled={!canSubmitNewRequest}
            className={`flex items-center space-x-3 p-4 rounded-xl transition-colors ${
              !canSubmitNewRequest
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <Eye className={`w-5 h-5 ${!canSubmitNewRequest ? 'text-gray-400' : 'text-blue-600'}`} />
            <span className={`font-medium ${!canSubmitNewRequest ? 'text-gray-500' : 'text-blue-800'}`}>
              Browse Available Rooms
            </span>
          </button>
          
          <button
            onClick={handleManualRefresh}
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Available Rooms</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <input
            type="text"
            placeholder="Filter by room type..."
            value={roomTypeFilter}
            onChange={(e) => setRoomTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(() => {
          const availableRooms = rooms.filter((room) => {
            const matchesSearch = roomSearch.trim() === '' || 
              String(room.room_number).toLowerCase().includes(roomSearch.toLowerCase()) ||
              String(room.floor).toLowerCase().includes(roomSearch.toLowerCase());
            const matchesType = roomTypeFilter === '' || room.room_type === roomTypeFilter;
            const actualOccupancy = Math.max(room.current_occupancy || 0, room.occupied || 0);
            const isAvailable = actualOccupancy < room.capacity && room.status !== 'full' && room.status !== 'maintenance';
            return matchesSearch && matchesType && isAvailable;
          });

          if (availableRooms.length === 0) {
            return (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">No Available Rooms</h3>
                <p className="text-slate-600 mb-4">
                  {roomSearch || roomTypeFilter 
                    ? 'No rooms match your current filters. Try adjusting your search criteria.'
                    : 'All rooms are currently occupied. Check back later for availability.'
                  }
                </p>
                {(roomSearch || roomTypeFilter) && (
                  <button
                    onClick={() => {
                      setRoomSearch('');
                      setRoomTypeFilter('');
                    }}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            );
          }

          return availableRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Room {room.room_number}</h3>
                  <p className="text-sm text-slate-500">Floor {room.floor}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                (() => {
                  const actualOccupancy = Math.max(room.current_occupancy || 0, room.occupied || 0);
                  return actualOccupancy < room.capacity && room.status !== 'full' && room.status !== 'maintenance';
                })() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {(() => {
                  const actualOccupancy = Math.max(room.current_occupancy || 0, room.occupied || 0);
                  return actualOccupancy < room.capacity && room.status !== 'full' && room.status !== 'maintenance' ? 'Available' : 'Full';
                })()}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Type:</span>
                <span className="font-medium capitalize">{room.room_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Capacity:</span>
                <span className="font-medium">{room.capacity} person{room.capacity > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Occupied:</span>
                <span className="font-medium">{Math.max(room.current_occupancy || 0, room.occupied || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Price:</span>
                <span className="font-medium text-green-600">${room.price}/month</span>
              </div>
            </div>
            
            {room.amenities && room.amenities.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-slate-600 mb-2">Amenities:</p>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              {(() => {
                const actualOccupancy = Math.max(room.current_occupancy || 0, room.occupied || 0);
                return actualOccupancy < room.capacity && room.status !== 'full' && room.status !== 'maintenance';
              })() && (!myRequest || !['pending', 'waitlisted', 'allocated', 'approved'].includes(myRequest.status)) ? (
                <button
                  onClick={() => handleRequestRoom(room)}
                  disabled={isSubmitting && loadingRoomId === room.id}
                  className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2 ${
                    isSubmitting && loadingRoomId === room.id
                      ? 'bg-amber-400 text-white cursor-not-allowed'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {isSubmitting && loadingRoomId === room.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Request This Room</span>
                    </>
                  )}
                </button>
              ) : !canSubmitNewRequest ? (
                <div className="text-center py-2">
                  {myRequest && myRequest.status === 'approved' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-600 font-medium">Request Approved</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">{requestMessage}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-slate-500">Room not available</p>
                </div>
              )}
            </div>
          </div>
          ));
        })()}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    ...(myAllocation && myAllocation.allocation_status === 'confirmed' || 
        (myRequest && ['approved', 'allocated'].includes(myRequest.status)) ? [] : 
        [{ id: 'rooms', label: 'Available Rooms', icon: Building2 }])
  ];


  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'rooms':
        return renderRooms();
      default:
        return renderOverview();
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading room information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Room Allocation</h1>
          <p className="text-slate-600">Request and manage your room allocation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        onConfirm={confirmCancelRequest}
        title="Cancel Room Request"
        message="Are you sure you want to cancel your room request? This action will permanently remove your request from our system and cannot be undone. You will need to submit a new request if you change your mind."
        confirmText="Yes, Cancel Request"
        cancelText="Keep Request"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default StudentRoomRequest;

