import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Phone, 
  Mail, 
  Shield, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle,
  Loader2,
  Edit
} from 'lucide-react';

const StaffProfileView = ({ staffProfile, user }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging to see what data we're receiving
  console.log('🔍 StaffProfileView: staffProfile data:', staffProfile);
  console.log('🔍 StaffProfileView: user data:', user);

  if (!staffProfile) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Profile Not Found</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Your staff profile has not been created yet. Please contact the hostel administration.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'hostel_operations_assistant':
        return 'Hostel Operations Assistant';
      case 'admin':
        return 'Administrator';
      case 'warden':
        return 'Warden';
      default:
        return role?.replace('_', ' ').toUpperCase() || 'Staff Member';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'suspended':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 p-1 shadow-xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                  {staffProfile?.avatar_url ? (
                    <img 
                      src={staffProfile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{staffProfile?.full_name || user?.full_name || ''}</h2>
              <p className="text-slate-600">{getRoleDisplay(staffProfile?.role)}</p>
               <p className="text-sm text-slate-500">{staffProfile?.username || staffProfile?.employee_id || staffProfile?.staff_id || ''}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Account Status</div>
            <div className={`text-lg font-semibold flex items-center gap-2 ${getStatusColor(staffProfile?.status)}`}>
              <CheckCircle className="w-5 h-5" />
              {staffProfile?.status?.charAt(0).toUpperCase() + staffProfile?.status?.slice(1) || 'Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-amber-600" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Full Name</label>
              <p className="text-lg font-semibold text-slate-800">{staffProfile?.full_name || ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email Address</label>
              <p className="text-lg font-semibold text-slate-800">{staffProfile?.email || user?.email || ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Phone Number</label>
              <p className="text-lg font-semibold text-slate-800">{staffProfile?.phone_number || staffProfile?.phone || ''}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Employee ID</label>
               <p className="text-lg font-semibold text-slate-800">{staffProfile?.username || staffProfile?.employee_id || staffProfile?.staff_id || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Department</label>
              <p className="text-lg font-semibold text-slate-800">{staffProfile?.department || 'Hostel Management'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Date of Joining</label>
              <p className="text-lg font-semibold text-slate-800">{formatDate(staffProfile?.date_of_joining || staffProfile?.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role & Permissions */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Role & Permissions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-600">Role</label>
            <p className="text-lg font-semibold text-slate-800">{getRoleDisplay(staffProfile?.role)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Access Level</label>
            <p className="text-lg font-semibold text-slate-800">
              {staffProfile?.role === 'admin' ? 'Full Access' : 
               staffProfile?.role === 'warden' ? 'Management Access' : 
               'Operations Access'}
            </p>
          </div>
        </div>

        {/* Permissions List */}
        <div className="mt-6">
          <label className="text-sm font-medium text-slate-600 mb-3 block">Permissions</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {staffProfile?.role === 'hostel_operations_assistant' && (
              <>
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">Manage Cleaning Requests</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">Manage Room Requests</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">View Operations Dashboard</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">Update Request Status</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

       {/* Contact Information */}
       <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
         <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
           <Users className="w-6 h-6 text-blue-600" />
           Contact Information
         </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Work Email</label>
            <p className="text-lg font-semibold text-slate-800">{staffProfile?.email || ''}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Phone Number</label>
            <p className="text-lg font-semibold text-slate-800">{staffProfile?.phone_number || staffProfile?.phone || ''}</p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          Account Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-600">Account Created</label>
            <p className="text-lg font-semibold text-slate-800">{formatDate(staffProfile?.created_at)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Last Updated</label>
            <p className="text-lg font-semibold text-slate-800">{formatDate(staffProfile?.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfileView;
