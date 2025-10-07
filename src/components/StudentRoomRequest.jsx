import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Home, 
  MapPin, 
  Users, 
  Clock, 
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft
} from 'lucide-react';

const StudentRoomRequest = () => {
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);
  const [roomAllocation, setRoomAllocation] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_uid', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setUserProfile(profile);

      // Check for existing room request
      const { data: request, error: requestError } = await supabase
        .from('room_requests')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'pending')
        .single();

      if (request && !requestError) {
        setExistingRequest(request);
      }

      // Check for existing room allocation
      const { data: allocation, error: allocationError } = await supabase
        .from('room_allocations')
        .select(`
          *,
          rooms!room_allocations_room_id_fkey(
            room_number,
            floor,
            room_type,
            capacity
          )
        `)
        .eq('user_id', profile.id)
        .in('allocation_status', ['confirmed', 'active'])
        .single();

      if (allocation && !allocationError) {
        setRoomAllocation(allocation);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const onSubmit = async (data) => {
    if (existingRequest) {
      showNotification('You already have a pending room request', 'warning');
      return;
    }

    if (roomAllocation) {
      showNotification('You already have a room allocation', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('http://localhost:3002/api/room-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification('Room request submitted successfully!', 'success');
        reset();
        fetchUserData(); // Refresh data
      } else {
        throw new Error(result.message || 'Failed to submit room request');
      }
    } catch (error) {
      console.error('Error submitting room request:', error);
      showNotification(error.message || 'Failed to submit room request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (roomAllocation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Room Allocated!</h2>
              <p className="text-slate-600">You have been assigned a room</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Room {roomAllocation.rooms?.room_number}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-green-700">
                    <MapPin className="w-4 h-4" />
                    <span>Floor {roomAllocation.rooms?.floor}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <Users className="w-4 h-4" />
                    <span>{roomAllocation.rooms?.room_type} - Capacity: {roomAllocation.rooms?.capacity}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <Clock className="w-4 h-4" />
                    <span>Allocated on {new Date(roomAllocation.allocated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {roomAllocation.allocation_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (existingRequest) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Request Pending</h2>
              <p className="text-slate-600">Your room request is under review</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-yellow-800">Preferred Room Type</label>
                  <p className="text-yellow-700 capitalize">{existingRequest.preferred_room_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-yellow-800">Preferred Floor</label>
                  <p className="text-yellow-700">{existingRequest.preferred_floor || 'Any'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-yellow-800">Urgency Level</label>
                  <p className="text-yellow-700 capitalize">{existingRequest.urgency_level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-yellow-800">Request Date</label>
                  <p className="text-yellow-700">{new Date(existingRequest.requested_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {existingRequest.special_requirements && (
                <div>
                  <label className="text-sm font-medium text-yellow-800">Special Requirements</label>
                  <p className="text-yellow-700">{existingRequest.special_requirements}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-yellow-200">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {existingRequest.status}
                </span>
                <p className="text-sm text-yellow-600">
                  Request submitted on {new Date(existingRequest.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Request Room</h2>
            <p className="text-slate-600">Submit your room allocation request</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Info */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Name</label>
                <p className="text-slate-800 font-medium">{userProfile?.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Admission Number</label>
                <p className="text-slate-800 font-medium">{userProfile?.admission_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Course</label>
                <p className="text-slate-800 font-medium">{userProfile?.course} - Year {userProfile?.year}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-slate-800 font-medium">{userProfile?.email}</p>
              </div>
            </div>
          </div>

          {/* Room Preferences */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Room Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Preferred Room Type *
                </label>
                <select
                  {...register('preferred_room_type', { required: 'Room type is required' })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select room type</option>
                  <option value="single">Single Room</option>
                  <option value="double">Double Room</option>
                  <option value="triple">Triple Room</option>
                </select>
                {errors.preferred_room_type && (
                  <p className="text-red-600 text-sm mt-1">{errors.preferred_room_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Preferred Floor
                </label>
                <select
                  {...register('preferred_floor')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Floor</option>
                  <option value="1">Floor 1</option>
                  <option value="2">Floor 2</option>
                  <option value="3">Floor 3</option>
                  <option value="4">Floor 4</option>
                  <option value="5">Floor 5</option>
                  <option value="6">Floor 6</option>
                  <option value="7">Floor 7</option>
                  <option value="8">Floor 8</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Urgency Level *
              </label>
              <select
                {...register('urgency_level', { required: 'Urgency level is required' })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select urgency level</option>
                <option value="low">Low - Flexible timing</option>
                <option value="medium">Medium - Prefer sooner</option>
                <option value="high">High - Urgent need</option>
              </select>
              {errors.urgency_level && (
                <p className="text-red-600 text-sm mt-1">{errors.urgency_level.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Special Requirements
              </label>
              <textarea
                {...register('special_requirements')}
                rows={4}
                placeholder="Any special requirements, accessibility needs, or preferences..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Home className="w-4 h-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRoomRequest;
