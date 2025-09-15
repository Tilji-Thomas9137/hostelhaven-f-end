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
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data states
  const [rooms, setRooms] = useState([]);
  const [myRequest, setMyRequest] = useState(null);
  const [myAllocation, setMyAllocation] = useState(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  
  
  // Filters
  const [roomSearch, setRoomSearch] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);



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

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/room-allocation/rooms');
      if (response.ok) {
        const result = await response.json();
        setRooms(result.data.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };


  const fetchMyRequest = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocation/request', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const request = result.data.request;
        console.log('Fetched request:', request);
        // Explicitly set to null if no request exists, is deleted, or is cancelled
        if (!request || request.status === 'cancelled') {
          console.log('Setting myRequest to null (no request or cancelled)');
          setMyRequest(null);
        } else {
          console.log('Setting myRequest to:', request);
          setMyRequest(request);
        }
      } else if (response.status === 404) {
        // If no request found, set to null
        console.log('No request found (404), setting to null');
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
        .select('room_id, rooms(*)')
        .eq('id', session.user.id)
        .single();

      if (!error && userProfile?.room_id) {
        setMyAllocation({
          room_id: userProfile.room_id,
          room: userProfile.rooms
        });
      }
    } catch (error) {
      console.error('Error fetching my allocation:', error);
    }
  };

  const handleRequestRoom = async (room) => {
    setIsSubmitting(true);
    let errorNotificationShown = false;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showNotification('Please log in to submit a room request', 'error');
        return;
      }

      // Create a simple request with the specific room details
      const requestData = {
        preferred_room_type: room.room_type,
        preferred_floor: room.floor,
        special_requirements: `Requesting Room ${room.room_number} specifically`
      };

      console.log('Requesting room:', room);
      console.log('Request data:', requestData);

      const response = await fetch('http://localhost:3002/api/room-allocation/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        await fetchMyRequest();
        showNotification(`Room request for Room ${room.room_number} submitted successfully! We will review your request and notify you of the status.`, 'success', 4000);
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
    }
  };

  const handleCancelRequest = (requestId) => {
    setRequestToCancel(requestId);
    setShowCancelModal(true);
  };

  const confirmCancelRequest = async () => {
    if (!requestToCancel) return;

    setIsSubmitting(true);
    setShowCancelModal(false);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Delete the request from database instead of just marking as cancelled
      const response = await fetch(`http://localhost:3002/api/room-allocation/request/${requestToCancel}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Request deleted successfully from database');
        // Clear the request from local state immediately since it's deleted
        setMyRequest(null);
        // Force a fresh fetch to ensure UI is updated
        await fetchMyRequest();
        showNotification('Your room request has been successfully cancelled and removed from our system.', 'cancelled', 5000);
      } else {
        const error = await response.json();
        showNotification(error.message || 'Unable to cancel your room request at this time. Please try again or contact support if the issue persists.', 'error');
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
                {myRequest ? `Priority: ${myRequest.priority_score || 0}` : 'Submit a request'}
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
                {rooms.filter(room => room.is_available).length}
              </p>
              <p className="text-sm text-slate-600">Out of {rooms.length} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {myRequest && (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">My Room Request</h2>
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
                <p><span className="font-medium">Priority Score:</span> {myRequest.priority_score || 0}</p>
                {myRequest.preferred_room_type && (
                  <p><span className="font-medium">Preferred Type:</span> {myRequest.preferred_room_type}</p>
                )}
                {myRequest.preferred_floor && (
                  <p><span className="font-medium">Preferred Floor:</span> {myRequest.preferred_floor}</p>
                )}
              </div>
            </div>
            
            {myRequest.allocated_room && (
              <div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">Allocated Room</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Room Number:</span> {myRequest.allocated_room.room_number}</p>
                  <p><span className="font-medium">Floor:</span> {myRequest.allocated_room.floor}</p>
                  <p><span className="font-medium">Type:</span> {myRequest.allocated_room.room_type}</p>
                  <p><span className="font-medium">Price:</span> ${myRequest.allocated_room.price}/month</p>
                </div>
              </div>
            )}
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
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('rooms')}
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Browse Available Rooms</span>
          </button>
          
          <button
            onClick={fetchAllData}
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
            const isAvailable = room.is_available;
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
                room.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {room.is_available ? 'Available' : 'Occupied'}
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
                <span className="font-medium">{room.occupied || 0}</span>
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
              {room.is_available && !myRequest ? (
                <button
                  onClick={() => handleRequestRoom(room)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
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
              ) : myRequest ? (
                <div className="text-center py-2">
                  <p className="text-sm text-slate-500">You already have a pending request</p>
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
    { id: 'rooms', label: 'Available Rooms', icon: Building2 }
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
            onClick={fetchAllData}
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

