import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import useBeautifulToast from '../hooks/useBeautifulToast';
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
  Loader2,
  Camera,
  Upload
} from 'lucide-react';

const StudentProfileView = ({ studentProfile, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useBeautifulToast();

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

  const handleAvatarSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file (JPG, PNG, GIF, etc.)', {
          duration: 4000,
          title: 'Invalid File Type!'
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be 5MB or less. Please choose a smaller image.', {
          duration: 4000,
          title: 'File Too Large!'
        });
        return;
      }

      setIsUploadingAvatar(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // Upload to the profile_picture bucket
      const { error: uploadError } = await supabase.storage
        .from('profile_picture')
        .upload(filePath, file, { 
          cacheControl: '3600', 
          upsert: true 
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile_picture')
        .getPublicUrl(filePath);

      // Persist avatar_url to user_profiles table
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const response = await fetch(`${API_BASE_URL}/api/user-profiles/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ 
            avatar_url: publicUrl,
            status: 'complete',
            profile_status: 'active'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn('Failed to persist avatar_url to user_profiles:', errorData);
        }
      } catch (e) {
        console.warn('Failed to persist avatar_url to user_profiles:', e);
      }

      try {
        await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      } catch (e) {
        console.warn('Failed to update auth metadata avatar_url:', e);
      }

      showSuccess('Your profile picture has been updated successfully! ✨', {
        duration: 3000,
        title: 'Picture Updated!'
      });

      // Reload the page to show the new avatar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showError(`Failed to update your profile picture: ${err.message || 'Unknown error'}`, {
        duration: 5000,
        title: 'Upload Failed!'
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div 
                className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 p-1 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
                onClick={handleAvatarSelect}
                title="Click to update profile picture"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                  {(studentProfile?.avatar_url || user?.avatar_url) ? (
                    <img 
                      src={studentProfile?.avatar_url || user?.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Upload button overlay */}
              <button
                type="button"
                onClick={handleAvatarSelect}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-full p-2 shadow-lg transform hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Update profile picture"
              >
                {isUploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
              
              {/* Hidden file input */}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload} 
              />
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
