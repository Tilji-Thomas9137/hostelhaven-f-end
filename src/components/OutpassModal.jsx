import { useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import useBeautifulToast from '../hooks/useBeautifulToast';
import { 
  X, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Clock,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2
} from 'lucide-react';

// Outpass form validation schema
const outpassSchema = z.object({
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
  destination: z.string()
    .min(3, 'Destination must be at least 3 characters')
    .max(100, 'Destination must not exceed 100 characters'),
  start_date: z.string()
    .min(1, 'Start date is required'),
  end_date: z.string()
    .min(1, 'End date is required'),
  start_time: z.string()
    .min(1, 'Start time is required'),
  end_time: z.string()
    .min(1, 'End time is required'),
  emergency_contact: z.string()
    .min(3, 'Emergency contact name must be at least 3 characters')
    .max(50, 'Emergency contact name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Emergency contact name must contain only letters and spaces')
    .refine(val => !/^\d+$/.test(val), 'Emergency contact name cannot be only numbers'),
  emergency_phone: z.string()
    .regex(/^[0-9]{10}$/, 'Emergency phone must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  transport_mode: z.string()
    .min(1, 'Transport mode is required'),
  parent_approval: z.boolean()
    .refine(val => val === true, 'Parent approval is required')
});

const OutpassModal = ({ isOpen, onClose, onSuccess, editMode = false, extendMode = false, editingRequest = null, extendingRequest = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weeklyCount, setWeeklyCount] = useState({ count: 0, limit: 3, remaining: 3, canRequest: true });
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [hasRoomAllocation, setHasRoomAllocation] = useState(false);
  const [checkingRoom, setCheckingRoom] = useState(false);
  const { showSuccess, showError, showWarning } = useBeautifulToast();

  // Debug: Log environment variables
  console.log('🔧 OutpassModal - VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('🔧 OutpassModal - Full API URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/outpass/create`);


  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(outpassSchema),
    mode: 'onChange'
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const startTime = watch('start_time');
  const endTime = watch('end_time');

  // Validate date and time logic
  const validateDateTime = () => {
    if (startDate && endDate) {
      const start = new Date(`${startDate}T${startTime || '00:00'}`);
      const end = new Date(`${endDate}T${endTime || '23:59'}`);
      
      if (start >= end) {
        return 'End date/time must be after start date/time';
      }
      
      // Check if the outpass duration is not more than 7 days
      const diffInDays = (end - start) / (1000 * 60 * 60 * 24);
      if (diffInDays > 7) {
        return 'Outpass duration cannot exceed 7 days';
      }
      
      // Check if start date is not in the past
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(startDate);
      if (startDateOnly < now) {
        return 'Out date cannot be in the past';
      }
    }
    return null;
  };

  const dateTimeError = validateDateTime();

  // Fetch weekly outpass count when modal opens
  const fetchWeeklyCount = async () => {
    setIsLoadingCount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/outpass/weekly-count`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setWeeklyCount(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching weekly count:', error);
    } finally {
      setIsLoadingCount(false);
    }
  };

  // Check room allocation
  const checkRoomAllocation = async () => {
    setCheckingRoom(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCheckingRoom(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/student-cleaning-requests/check-room-allocation`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setHasRoomAllocation(true);
      } else {
        setHasRoomAllocation(false);
      }
    } catch (error) {
      console.error('Error checking room allocation:', error);
      setHasRoomAllocation(false);
    } finally {
      setCheckingRoom(false);
    }
  };

  // Fetch count when modal opens
  React.useEffect(() => {
    if (isOpen) {
      checkRoomAllocation();
      fetchWeeklyCount();
      
      // Populate form with existing data for edit/extend modes
      if (editMode && editingRequest) {
        setValue('reason', editingRequest.reason);
        setValue('destination', editingRequest.destination);
        setValue('start_date', editingRequest.startDate);
        setValue('end_date', editingRequest.endDate);
        setValue('start_time', '00:00'); // Default time
        setValue('end_time', '23:59'); // Default time
        setValue('emergency_contact', editingRequest.emergency_contact || '');
        setValue('emergency_phone', editingRequest.emergency_phone || '');
        setValue('transport_mode', editingRequest.transport_mode || '');
        setValue('parent_approval', true);
      } else if (extendMode && extendingRequest) {
        // For extend mode, populate with current data but allow modification of end date
        setValue('reason', extendingRequest.reason);
        setValue('destination', extendingRequest.destination);
        setValue('start_date', extendingRequest.startDate);
        setValue('end_date', extendingRequest.endDate);
        setValue('start_time', '00:00');
        setValue('end_time', '23:59');
        setValue('emergency_contact', extendingRequest.emergency_contact || '');
        setValue('emergency_phone', extendingRequest.emergency_phone || '');
        setValue('transport_mode', extendingRequest.transport_mode || '');
        setValue('parent_approval', true);
      }
    }
  }, [isOpen, editMode, extendMode, editingRequest, extendingRequest, setValue]);

  const onSubmit = async (data) => {
    if (dateTimeError) {
      showError(dateTimeError, {
        duration: 5000,
        title: 'Invalid Date/Time!'
      });
      return;
    }

    // Check room allocation before submitting
    if (!hasRoomAllocation) {
      showError('You must have an allocated room to submit outpass requests. Please complete room allocation first.', {
        duration: 6000,
        title: 'Room Allocation Required!'
      });
      return;
    }

    // Check weekly limit before submitting
    if (!weeklyCount.canRequest) {
      showError('Weekly outpass limit reached! You can only request 3 outpasses per week.', {
        duration: 6000,
        title: 'Limit Exceeded!'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showError('Please log in to submit an outpass request', {
          duration: 4000,
          title: 'Authentication Required!'
        });
        return;
      }

      // Prepare payload for backend API
      const payload = {
        reason: data.reason.trim(),
        destination: data.destination.trim(),
        start_date: data.start_date,
        end_date: data.end_date,
        start_time: data.start_time,
        end_time: data.end_time,
        emergency_contact: data.emergency_contact.trim(),
        emergency_phone: data.emergency_phone || null,
        transport_mode: data.transport_mode,
        parent_approval: data.parent_approval
      };

      console.log('Submitting outpass payload:', payload);

      // Try backend API first, fallback to direct Supabase if backend is not available
      let result;
      try {
        const apiUrl = 'http://localhost:3002/api/outpass/create'; // Hardcoded for testing
        console.log('🔗 Calling API URL:', apiUrl);
        console.log('🔧 VITE_API_URL env var:', import.meta.env.VITE_API_URL);
        console.log('🔧 Hardcoded URL for testing:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(payload)
        });

        // Check if response is ok first
        if (!response.ok) {
          let errorMessage = `Server error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If response is not JSON, use status text
            console.error('Non-JSON error response:', response.status, response.statusText);
          }
          
          console.error('Error creating outpass request:', errorMessage);
          showError(errorMessage, {
            duration: 5000,
            title: 'Submission Failed!'
          });
          return;
        }

        // Try to parse JSON response
        try {
          result = await response.json();
        } catch (e) {
          console.error('Failed to parse JSON response:', e);
          showError('Invalid response from server', {
            duration: 5000,
            title: 'Submission Failed!'
          });
          return;
        }

        console.log('Outpass request created successfully via API:', result);
      } catch (fetchError) {
        console.warn('Backend API not available, falling back to direct Supabase:', fetchError);
        
        // Fallback to direct Supabase insertion
        const supabasePayload = {
          ...payload,
          status: 'pending',
          user_id: session.user.id,
          created_at: new Date().toISOString()
        };

        const { data: supabaseResult, error: supabaseError } = await supabase
          .from('outpass_requests')
          .insert([supabasePayload])
          .select()
          .single();

        if (supabaseError) {
          console.error('Error creating outpass request via Supabase:', supabaseError);
          showError(`Failed to submit outpass request: ${supabaseError.message}`, {
            duration: 5000,
            title: 'Submission Failed!'
          });
          return;
        }

        result = { data: supabaseResult };
        console.log('Outpass request created successfully via Supabase:', result);
      }

      // Show success message
      showSuccess('Your outpass request has been submitted successfully! You can track its status in the outpass tracking section. 🎉', {
        duration: 5000,
        title: 'Outpass Request Submitted! ✨'
      });

      // Refresh weekly count
      await fetchWeeklyCount();
      
      reset();
      onSuccess?.(result.data);
      
      // Add a delay before closing to ensure success message is visible
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Exception creating outpass request:', error);
      showError(`Failed to submit outpass request: ${error.message}`, {
        duration: 5000,
        title: 'Submission Failed!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {editMode ? 'Edit Outpass Request' : 
                   extendMode ? 'Extend Outpass Request' : 
                   'Outpass Request'}
                </h2>
                <p className="text-amber-100 text-sm">
                  {editMode ? 'Update your outpass request' : 
                   extendMode ? 'Extend your approved outpass' : 
                   'Apply for hostel outpass'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Room Allocation & Weekly Limit Indicator */}
          <div className="mt-4 space-y-2">
            {!hasRoomAllocation && !checkingRoom && (
              <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-xl">
                <p className="text-red-100 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Room allocation required to submit outpass requests
                </p>
              </div>
            )}
            <div className="p-3 bg-white/10 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Weekly Limit</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isLoadingCount ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className={`text-sm font-bold ${weeklyCount.remaining > 0 ? 'text-green-200' : 'text-red-200'}`}>
                        {weeklyCount.count}/{weeklyCount.limit}
                      </span>
                      <span className="text-xs text-amber-100">
                        ({weeklyCount.remaining} remaining)
                      </span>
                    </>
                  )}
                </div>
              </div>
              {!weeklyCount.canRequest && (
                <div className="mt-2 p-2 bg-red-500/20 border border-red-400/30 rounded-lg">
                  <p className="text-red-100 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Weekly limit reached! Cannot request more outpasses this week.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Reason */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Purpose of Outpass <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('reason')}
              placeholder="Please provide a detailed reason for your outpass request (e.g., medical appointment, family function, educational trip, personal emergency)..."
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all resize-none ${
                errors.reason 
                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                  : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
              rows={3}
            />
            {errors.reason && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin className="w-4 h-4 text-green-600" />
              Destination <span className="text-red-500">*</span>
            </label>
            <input
              {...register('destination')}
              type="text"
              placeholder="Where are you going? (City, location, or address)"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                errors.destination 
                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                  : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
            />
            {errors.destination && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.destination.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Out Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-red-600" />
                Out Date <span className="text-red-500">*</span>
              </label>
              <input
                {...register('start_date')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                  errors.start_date 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                }`}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.start_date.message}
                </p>
              )}
            </div>

            {/* Return Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-green-600" />
                Return Date <span className="text-red-500">*</span>
              </label>
              <input
                {...register('end_date')}
                type="date"
                min={startDate || new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                  errors.end_date 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                }`}
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.end_date.message}
                </p>
              )}
            </div>

            {/* Out Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="w-4 h-4 text-red-600" />
                Out Time <span className="text-red-500">*</span>
              </label>
              <input
                {...register('start_time')}
                type="time"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                  errors.start_time 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                }`}
              />
              {errors.start_time && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.start_time.message}
                </p>
              )}
            </div>

            {/* Return Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="w-4 h-4 text-green-600" />
                Return Time <span className="text-red-500">*</span>
              </label>
              <input
                {...register('end_time')}
                type="time"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                  errors.end_time 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                }`}
              />
              {errors.end_time && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.end_time.message}
                </p>
              )}
            </div>
          </div>

          {/* Date/Time Validation Error */}
          {dateTimeError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {dateTimeError}
              </p>
            </div>
          )}

          {/* Transport Mode */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Mode of Transport <span className="text-red-500">*</span>
            </label>
            <select
              {...register('transport_mode')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-amber-500 transition-all ${
                errors.transport_mode 
                  ? 'border-red-300' 
                  : 'border-slate-300'
              }`}
            >
              <option value="">Select transport mode</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="car">Private Car</option>
              <option value="taxi">Taxi/Cab</option>
              <option value="auto">Auto Rickshaw</option>
              <option value="walking">Walking</option>
              <option value="other">Other</option>
            </select>
            {errors.transport_mode && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.transport_mode.message}
              </p>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Emergency Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="w-4 h-4 text-pink-600" />
                  Emergency Contact <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('emergency_contact')}
                  type="text"
                  placeholder="Parent/Guardian or local contact (letters only)"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    errors.emergency_contact 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                  }`}
                  onKeyPress={(e) => {
                    // Prevent numbers and special characters except spaces
                    if (!/[a-zA-Z\s]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                />
                {errors.emergency_contact && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.emergency_contact.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Phone className="w-4 h-4 text-green-600" />
                  Contact Phone
                </label>
                <input
                  {...register('emergency_phone')}
                  type="tel"
                  placeholder="10-digit phone number (numbers only)"
                  maxLength="10"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    errors.emergency_phone 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                  }`}
                  onKeyPress={(e) => {
                    // Only allow numbers
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                />
                {errors.emergency_phone && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.emergency_phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Parent Approval */}
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Parent/Guardian Approval <span className="text-red-500">*</span>
              </label>
              <div className="flex items-start space-x-3">
                <input
                  {...register('parent_approval')}
                  type="checkbox"
                  id="parent_approval"
                  className="w-5 h-5 text-amber-600 border-2 border-slate-300 rounded focus:ring-amber-500 focus:ring-2 mt-0.5"
                />
                <label htmlFor="parent_approval" className="text-sm text-slate-700 leading-relaxed">
                  I confirm that I have obtained approval from my parent/guardian for this outpass request.
                </label>
              </div>
              {errors.parent_approval && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.parent_approval.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid || dateTimeError || !weeklyCount.canRequest || !hasRoomAllocation || checkingRoom}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {editMode ? 'Updating Request...' : 
                   extendMode ? 'Submitting Extension...' : 
                   'Submitting Outpass Request...'}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {editMode ? 'Update Outpass Request' : 
                   extendMode ? 'Request Extension' : 
                   'Submit Outpass Request'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OutpassModal;
