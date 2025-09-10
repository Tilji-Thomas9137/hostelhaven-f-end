import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Users, 
  Home, 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  UserCheck,
  UserX,
  Eye,
  Edit
} from 'lucide-react';

const RoomAllocation = () => {
  const { showNotification } = useNotification();
  const [allocations, setAllocations] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showDeallocateModal, setShowDeallocateModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchAllocations();
    fetchAvailableStudents();
    fetchAvailableRooms();
  }, []);

  const fetchAllocations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAllocations(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocations/available-students', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAvailableStudents(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching available students:', error);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocations/available-rooms', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAvailableRooms(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    }
  };

  const onSubmitAllocation = async (data) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/room-allocations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: data.student_id,
          room_id: data.room_id,
          start_date: data.start_date
        })
      });

      if (response.ok) {
        showNotification('Room allocated successfully!', 'success');
        setShowAllocationModal(false);
        reset();
        fetchAllocations();
        fetchAvailableStudents();
        fetchAvailableRooms();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to allocate room', 'error');
      }
    } catch (error) {
      console.error('Error allocating room:', error);
      showNotification('Failed to allocate room', 'error');
    }
  };

  const handleDeallocate = async (data) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/room-allocations/${selectedAllocation.id}/deallocate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          end_date: data.end_date
        })
      });

      if (response.ok) {
        showNotification('Room deallocated successfully!', 'success');
        setShowDeallocateModal(false);
        setSelectedAllocation(null);
        fetchAllocations();
        fetchAvailableStudents();
        fetchAvailableRooms();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to deallocate room', 'error');
      }
    } catch (error) {
      console.error('Error deallocating room:', error);
      showNotification('Failed to deallocate room', 'error');
    }
  };

  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = 
      allocation.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.rooms?.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.hostels?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && allocation.is_active) ||
      (filterStatus === 'inactive' && !allocation.is_active);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Allocations</h2>
          <p className="text-gray-600">Manage student room assignments</p>
        </div>
        <button
          onClick={() => setShowAllocationModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Allocate Room
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Allocations</p>
              <p className="text-2xl font-bold text-gray-900">
                {allocations.filter(a => a.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Students</p>
              <p className="text-2xl font-bold text-gray-900">{availableStudents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{availableRooms.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student name, room number, or hostel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Allocations</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hostel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAllocations.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {allocation.users?.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {allocation.users?.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Room {allocation.rooms?.room_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      Floor {allocation.rooms?.floor} • {allocation.rooms?.room_type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {allocation.hostels?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(allocation.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {allocation.end_date ? new Date(allocation.end_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      allocation.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {allocation.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {allocation.is_active && (
                      <button
                        onClick={() => {
                          setSelectedAllocation(allocation);
                          setShowDeallocateModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Allocate Room</h3>
            <form onSubmit={handleSubmit(onSubmitAllocation)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student
                </label>
                <select
                  {...register('student_id', { required: 'Student is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a student</option>
                  {availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} ({student.email})
                    </option>
                  ))}
                </select>
                {errors.student_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.student_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Room
                </label>
                <select
                  {...register('room_id', { required: 'Room is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a room</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} - Floor {room.floor} ({room.room_type})
                    </option>
                  ))}
                </select>
                {errors.room_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.room_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('start_date', { required: 'Start date is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAllocationModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Allocate Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deallocate Modal */}
      {showDeallocateModal && selectedAllocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Deallocate Room</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to deallocate {selectedAllocation.users?.full_name} from Room {selectedAllocation.rooms?.room_number}?
            </p>
            <form onSubmit={handleSubmit(handleDeallocate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  {...register('end_date', { required: 'End date is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeallocateModal(false);
                    setSelectedAllocation(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Deallocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAllocation;
