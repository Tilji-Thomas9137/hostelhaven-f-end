import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Home, Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, X,
  MapPin, Bed, Users, Building, Calendar, DollarSign
} from 'lucide-react';

const RoomManagement = ({ data = [], onRefresh }) => {
  const { showNotification } = useNotification();
  const [rooms, setRooms] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isGeneratingRooms, setIsGeneratingRooms] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();

  useEffect(() => {
    if (data) {
      setRooms(data);
    }
  }, [data]);

  // Sync edit form values whenever a new room is chosen for editing
  useEffect(() => {
    if (showEditModal && selectedRoom) {
      setValue('room_number', selectedRoom.room_number || '');
      setValue('floor', selectedRoom.floor?.toString() || '');
      setValue('room_type', selectedRoom.room_type || '');
      const storedRent = selectedRoom.price || selectedRoom.monthly_rent || 0;
      if (storedRent >= 10000) {
        setValue('yearly_rent', storedRent);
        setValue('monthly_rent', Math.round(storedRent / 12));
      } else {
        setValue('monthly_rent', storedRent);
        setValue('yearly_rent', storedRent * 12);
      }
      setValue('status', selectedRoom.status || 'available');
    }
  }, [showEditModal, selectedRoom, setValue]);

  // Watch values for controlled edit inputs
  const watchedRoomNumber = watch('room_number');
  const watchedFloor = watch('floor');
  const watchedRoomType = watch('room_type');
  const watchedMonthly = watch('monthly_rent');
  const watchedYearly = watch('yearly_rent');
  const watchedStatus = watch('status');




  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.room_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = floorFilter === 'all' || room.floor?.toString() === floorFilter;
    const matchesType = typeFilter === 'all' || room.room_type === typeFilter;
    return matchesSearch && matchesFloor && matchesType;
  });

  const createSingleRoom = async (formData) => {
    setIsGeneratingRooms(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showNotification('Please log in to create room', 'error');
        return;
      }

      const { block, floor, room_number, room_type } = formData;
      
      if (!block || !floor || !room_number || !room_type) {
        showNotification('Block, floor, room number, and room type are required', 'error');
        return;
      }

      // Auto-determine capacity and pricing based on room type (yearly amounts)
      const roomTypeConfig = {
        'single': { capacity: 1, price: 28000 },    // ₹28,000 yearly
        'double': { capacity: 2, price: 23000 },    // ₹23,000 yearly
        'triple': { capacity: 3, price: 20000 }     // ₹20,000 yearly
      };

      const config = roomTypeConfig[room_type];
      if (!config) {
        showNotification('Invalid room type selected', 'error');
        return;
      }

      // Create full room number with block
      const fullRoomNumber = `${block}${floor}${room_number}`;

      const roomData = {
        room_number: fullRoomNumber,
        floor: parseInt(floor),
        room_type,
        monthly_rent: config.price,
        status: 'available'
      };

      const response = await fetch('http://localhost:3002/api/room-management/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification(`Successfully created room ${fullRoomNumber}!`, 'success');
        setShowGenerateForm(false);
        reset();
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      showNotification(error.message || 'Failed to create room', 'error');
    } finally {
      setIsGeneratingRooms(false);
    }
  };

  const onSubmitEdit = async (formData) => {
    if (!selectedRoom) return;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use yearly rent for the update
      const updateData = {
        room_number: formData.room_number,
        floor: formData.floor,
        room_type: formData.room_type,
        monthly_rent: formData.yearly_rent || formData.monthly_rent * 12,
        status: formData.status
      };

      const response = await fetch(`http://localhost:3002/api/room-management/rooms/${selectedRoom.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification('Room updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedRoom(null);
        reset();
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to update room');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to update room', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/room-management/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification('Room deleted successfully!', 'success');
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to delete room');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to delete room', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'partially_filled':
        return 'bg-yellow-100 text-yellow-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'single':
        return 'bg-blue-100 text-blue-800';
      case 'double':
        return 'bg-purple-100 text-purple-800';
      case 'triple':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOccupancyRate = (current, capacity) => {
    if (capacity === 0) return 0;
    return Math.round((current / capacity) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Room Management</h2>
          <p className="text-slate-600">Manage hostel rooms and allocations</p>
        </div>
        <button
          onClick={() => setShowGenerateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Rooms</p>
              <p className="text-3xl font-bold text-slate-900">{rooms.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Available</p>
              <p className="text-3xl font-bold text-green-600">
                {rooms.filter(r => r.status === 'available').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Occupied</p>
              <p className="text-3xl font-bold text-red-600">
                {rooms.filter(r => r.status === 'full').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Maintenance</p>
              <p className="text-3xl font-bold text-gray-600">
                {rooms.filter(r => r.status === 'maintenance').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-32">
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Floors</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
              <option value="4">4th Floor</option>
            </select>
          </div>
          <div className="md:w-40">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Room {room.room_number}</h3>
                  <p className="text-sm text-slate-500">Floor {room.floor}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(room.room_type)}`}>
                  {room.room_type}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Capacity:</span>
                  <span className="font-medium">{room.capacity || 0} beds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Occupied:</span>
                  <span className="font-medium">{room.current_occupancy || 0} beds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Occupancy Rate:</span>
                  <span className="font-medium">
                    {calculateOccupancyRate(room.current_occupancy || 0, room.capacity || 1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                    {room.status?.replace('_', ' ') || 'available'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowViewModal(true);
                  }}
                  className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                >
                  View
                </button>
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="flex-1 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Rooms Found</h3>
            <p className="text-slate-600">No rooms match your current filters</p>
          </div>
        )}
      </div>


      {/* Generate Rooms Modal - Simplified */}
      {showGenerateForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowGenerateForm(false);
            }
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Add New Room</h3>
              <p className="text-sm text-slate-600 mt-1">Create a new room with the specified details.</p>
            </div>
            <button
              onClick={() => setShowGenerateForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(createSingleRoom)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Block *
                </label>
                <select
                  {...register('block', { required: 'Block is required' })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select block</option>
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                  <option value="D">Block D</option>
                </select>
                {errors.block && (
                  <p className="text-red-600 text-sm mt-1">{errors.block.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Floor *
                </label>
                <select
                  {...register('floor', { required: 'Floor is required' })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select floor</option>
                  <option value="1">1st Floor</option>
                  <option value="2">2nd Floor</option>
                  <option value="3">3rd Floor</option>
                  <option value="4">4th Floor</option>
                </select>
                {errors.floor && (
                  <p className="text-red-600 text-sm mt-1">{errors.floor.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  {...register('room_number', { required: 'Room number is required' })}
                  placeholder="e.g., 101, 205, 301"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.room_number && (
                  <p className="text-red-600 text-sm mt-1">{errors.room_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Room Type *
                </label>
                <select
                  {...register('room_type', { required: 'Room type is required' })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="single">Single (₹28,000/year)</option>
                  <option value="double">Double (₹23,000/year)</option>
                  <option value="triple">Triple (₹20,000/year)</option>
                </select>
                {errors.room_type && (
                  <p className="text-red-600 text-sm mt-1">{errors.room_type.message}</p>
                )}
              </div>
            </div>

            {/* Room Preview */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-0.5">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-800 mb-1">Room Details</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>• <strong>Block System:</strong> Rooms organized in blocks A-D across 4 floors</p>
                    <p>• <strong>Room Number:</strong> Format will be Block+Floor+Number (e.g., A1101)</p>
                    <p>• <strong>Pricing:</strong> Single ₹28,000/year | Double ₹23,000/year | Triple ₹20,000/year</p>
                    <p>• <strong>Capacity:</strong> Auto-determined based on room type</p>
                    <p>• <strong>Status:</strong> Will be set to "Available" by default</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGeneratingRooms}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingRooms ? 'Creating Room...' : 'Create Room'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && selectedRoom && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 pt-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Edit Room</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={watchedRoomNumber || ''}
                    onChange={(e) => {
                      setValue('room_number', e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., A101, B205"
                    required
                  />
                  {errors.room_number && (
                    <p className="text-red-600 text-sm mt-1">{errors.room_number.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Floor *
                  </label>
                  <select
                    value={watchedFloor || ''}
                    onChange={(e) => {
                      setValue('floor', e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select floor</option>
                    <option value="1">1st Floor</option>
                    <option value="2">2nd Floor</option>
                    <option value="3">3rd Floor</option>
                    <option value="4">4th Floor</option>
                  </select>
                  {errors.floor && (
                    <p className="text-red-600 text-sm mt-1">{errors.floor.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Room Type *
                  </label>
                  <select
                    value={watchedRoomType || ''}
                    onChange={(e) => {
                      const type = e.target.value;
                      setValue('room_type', type);
                      // Set pricing based on type (yearly)
                      const yearlyByType = {
                        single: 28000,
                        double: 23000,
                        triple: 20000
                      };
                      const yr = yearlyByType[type] || 0;
                      setValue('yearly_rent', yr);
                      setValue('monthly_rent', yr ? Math.round(yr / 12) : 0);
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="single">Single (₹28,000/year)</option>
                    <option value="double">Double (₹23,000/year)</option>
                    <option value="triple">Triple (₹20,000/year)</option>
                  </select>
                  {errors.room_type && (
                    <p className="text-red-600 text-sm mt-1">{errors.room_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Monthly Rent (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={watchedMonthly || 0}
                    onChange={(e) => {
                      const monthlyRent = parseFloat(e.target.value) || 0;
                      const yearlyRent = monthlyRent * 12;
                      setValue('monthly_rent', monthlyRent);
                      setValue('yearly_rent', yearlyRent);
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2333"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Yearly Rent (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={watchedYearly || 0}
                    onChange={(e) => {
                      const yearlyRent = parseFloat(e.target.value) || 0;
                      const monthlyRent = Math.round(yearlyRent / 12);
                      setValue('yearly_rent', yearlyRent);
                      setValue('monthly_rent', monthlyRent);
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 28000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Status
                </label>
                <select
                  value={watchedStatus || ''}
                  onChange={(e) => {
                    setValue('status', e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="partially_filled">Partially Filled</option>
                  <option value="full">Full</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Update Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Room Modal */}
      {showViewModal && selectedRoom && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 pt-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Room Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Home className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Room Number</p>
                    <p className="text-slate-900">{selectedRoom.room_number}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Floor</p>
                    <p className="text-slate-900">Floor {selectedRoom.floor}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Bed className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Room Type</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedRoom.room_type)}`}>
                      {selectedRoom.room_type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Capacity</p>
                    <p className="text-slate-900">{selectedRoom.capacity || 0} beds</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Current Occupancy</p>
                    <p className="text-slate-900">{selectedRoom.current_occupancy || 0} beds</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Monthly Rent</p>
                    <p className="text-slate-900">
                      ₹{(() => {
                        const yearlyRent = selectedRoom.price || selectedRoom.monthly_rent || 0;
                        
                        // Define the yearly rent amounts based on room type
                        const yearlyRentMap = {
                          'single': 28000,    // ₹28,000 yearly
                          'double': 23000,    // ₹23,000 yearly  
                          'triple': 20000     // ₹20,000 yearly
                        };
                        
                        // If we have a room type and the stored rent matches yearly amount, divide by 12
                        if (selectedRoom.room_type && yearlyRentMap[selectedRoom.room_type] && 
                            yearlyRent === yearlyRentMap[selectedRoom.room_type]) {
                          return Math.round(yearlyRent / 12).toLocaleString();
                        }
                        
                        // If rent is already monthly (less than 5000), display as is
                        if (yearlyRent < 5000) {
                          return yearlyRent.toLocaleString();
                        }
                        
                        // Otherwise assume it's yearly and divide by 12
                        return Math.round(yearlyRent / 12).toLocaleString();
                      })()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 md:col-span-2">
                  <CheckCircle className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRoom.status)}`}>
                      {selectedRoom.status?.replace('_', ' ') || 'available'}
                    </span>
                  </div>
                </div>
              </div>


              <div className="flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
