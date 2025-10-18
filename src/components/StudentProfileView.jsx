import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Phone, 
  Mail, 
  GraduationCap, 
  Shield, 
  Calendar, 
  MapPin, 
  Users, 
  Heart, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const StudentProfileView = ({ studentProfile, user }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Normalize nested user object from backend (can be `users` or `user`)
  const profileUser = studentProfile?.users || studentProfile?.user || null;

  if (!studentProfile) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Profile Not Found</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Your student profile has not been created yet. Please contact the hostel administration.
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

  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return `${age} years`;
    } catch {
      return '';
    }
  };

  const getAcademicYear = (batchYear) => {
    if (!batchYear) return '';
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - batchYear;
    if (yearDiff === 0) return '1st Year';
    if (yearDiff === 1) return '2nd Year';
    if (yearDiff === 2) return '3rd Year';
    if (yearDiff === 3) return '4th Year';
    return `${yearDiff + 1}th Year`;
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 p-1 shadow-xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                  {studentProfile?.avatar_url ? (
                    <img 
                      src={studentProfile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{profileUser?.full_name || user?.fullName || ''}</h2>
              <p className="text-slate-600">{studentProfile?.admission_number || ''}</p>
              <p className="text-sm text-slate-500">{studentProfile?.course || ''}{studentProfile?.batch_year ? ` • Batch ${studentProfile.batch_year}` : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Profile Status</div>
            <div className="text-lg font-semibold text-green-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Complete
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
              <p className="text-lg font-semibold text-slate-800">{profileUser?.full_name || ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Phone Number</label>
              <p className="text-lg font-semibold text-slate-800">{profileUser?.phone || ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email Address</label>
              <p className="text-lg font-semibold text-slate-800">{profileUser?.email || ''}</p>
            </div>
          </div>
          
          <div className="space-y-4"></div>
        </div>
      </div>

      {/* Academic Information (gender and blood group removed) */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          Academic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-600">Admission Number</label>
            <p className="text-lg font-semibold text-slate-800">{studentProfile?.admission_number || ''}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Course</label>
            <p className="text-lg font-semibold text-slate-800">{studentProfile?.course || ''}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Batch Year</label>
            <p className="text-lg font-semibold text-slate-800">{studentProfile?.batch_year || ''}</p>
          </div>
          {/* Academic Year intentionally removed as per requirements */}
          {/* Blood Group removed */}
        </div>
      </div>

      {/* Address Information removed */}

      {/* Emergency & Parent Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-red-600" />
          Emergency & Parent Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Parent / Guardian
            </h4>
            <div>
              <label className="text-sm font-medium text-slate-600">Parent Name</label>
              <p className="text-lg font-semibold text-slate-800">{studentProfile?.parent_name || ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Parent Phone</label>
              <p className="text-lg font-semibold text-slate-800">{studentProfile?.parent_phone || ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Parent Email</label>
              <p className="text-lg font-semibold text-slate-800">{studentProfile?.parent_email || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aadhar Information */}
      {studentProfile?.aadhar_number && (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Identity Verification
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Aadhar Number</label>
              <p className="text-lg font-semibold text-slate-800">{studentProfile?.aadhar_number || ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Aadhar card verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfileView;
