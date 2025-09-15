import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { studentProfileSchema } from '../lib/validation';
import { verifyAadharCard, saveAadharInfo, uploadAadharImage } from '../lib/aadharVerification';
import { Camera, Loader2, Upload, User, CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Mail, Phone, GraduationCap, Calendar, MapPin, Users, Shield, Heart, Brain } from 'lucide-react';

const StudentProfileForm = ({ onSuccess, onCancel, initialData = null, isEdit = false, showHeader = true }) => {
  const [userData, setUserData] = useState({ full_name: '', email: '' });
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [aadharFrontUrl, setAadharFrontUrl] = useState(initialData?.aadhar_front_url || '');
  const [aadharBackUrl, setAadharBackUrl] = useState(initialData?.aadhar_back_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isVerifyingAadhar, setIsVerifyingAadhar] = useState(false);
  const [aadharVerification, setAadharVerification] = useState(null);
  const [extractedAadharNumber, setExtractedAadharNumber] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    trigger,
    reset
  } = useForm({
    resolver: zodResolver(studentProfileSchema),
    mode: 'onSubmit', // Only validate on form submission
    reValidateMode: 'onSubmit', // Only re-validate on form submission
    defaultValues: {
      full_name: '',
      phone: '',
      admission_number: '',
      course: '',
      batch_year: '',
      date_of_birth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      parent_name: '',
      parent_phone: '',
      parent_email: '',
      blood_group: ''
    }
  });

  // Watch form values for live validation
  const watchedValues = watch();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userProfile, error } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', session.user.id)
            .single();
          
          if (!error && userProfile) {
            setUserData({
              full_name: userProfile.full_name || '',
              email: userProfile.email || ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Initialize form with data
  useEffect(() => {
    if (initialData || userData.full_name) {
      const formData = {
        full_name: initialData?.full_name || initialData?.users?.full_name || userData.full_name || '',
        phone: initialData?.phone || initialData?.users?.phone || '',
        admission_number: initialData?.admission_number || '',
        course: initialData?.course || '',
        batch_year: initialData?.batch_year || '',
        date_of_birth: initialData?.date_of_birth || '',
        gender: initialData?.gender || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        country: initialData?.country || '',
        pincode: initialData?.pincode || '',
        emergency_contact_name: initialData?.emergency_contact_name || '',
        emergency_contact_phone: initialData?.emergency_contact_phone || '',
        parent_name: initialData?.parent_name || '',
        parent_phone: initialData?.parent_phone || '',
        parent_email: initialData?.parent_email || '',
        blood_group: initialData?.blood_group || ''
      };
      
      // Reset form with new data and clear any existing errors
      reset(formData, { 
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false
      });
    }
  }, [initialData, userData.full_name, reset]);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const metaUrl = session?.user?.user_metadata?.avatar_url || '';
        if (!avatarUrl && metaUrl) {
          setAvatarUrl(metaUrl);
        }
      } catch {}
    };
    loadAvatar();
  }, []);

  // Validation will only happen on form submission to prevent focus loss

  // Function to fetch location details from pincode
  const fetchLocationFromPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;
    
    setIsLoadingLocation(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setValue('city', postOffice.District || '');
        setValue('state', postOffice.State || '');
        setValue('country', 'India');
      }
    } catch (error) {
      console.error('Error fetching location from pincode:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Function to verify Aadhar card using Gemini AI
  const handleAadharVerification = async (file, type) => {
    if (!file) return;
    
    setIsVerifyingAadhar(true);
    setVerificationMessage('');
    
    try {
      const fullName = watchedValues.full_name;
      if (!fullName) {
        setVerificationMessage('Please enter your full name first');
        return;
      }

      const result = await verifyAadharCard(file, fullName);
      
      if (result.success) {
        setAadharVerification(result.verification);
        setExtractedAadharNumber(result.extractedInfo.aadharNumber);
        
        if (result.verification.nameMatch) {
          setVerificationMessage(`✅ Aadhar verified! Number: ${result.extractedInfo.aadharNumber}`);
        } else {
          setVerificationMessage(`⚠️ Name mismatch detected. Please ensure the name matches your Aadhar card.`);
        }
      } else {
        setVerificationMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Aadhar verification error:', error);
      setVerificationMessage(`❌ Verification failed: ${error.message}`);
    } finally {
      setIsVerifyingAadhar(false);
    }
  };

  const uploadAadharPhoto = async (file, type) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${type}.${fileExt}`;
      const filePath = `aadhar/${fileName}`;

      console.log(`Uploading Aadhar ${type} to:`, filePath);

      const { error: uploadError } = await supabase.storage
        .from('aadhar_verify')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error(`Upload error for ${type}:`, uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('aadhar_verify')
        .getPublicUrl(filePath);

      console.log(`Aadhar ${type} uploaded successfully:`, publicUrl);
      return publicUrl;
    } catch (error) {
      console.error(`Aadhar ${type} upload error:`, error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    // Trigger validation for all fields before submission
    const isValid = await trigger();
    if (!isValid) {
      console.log('Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let aadharFrontUrlFinal = aadharFrontUrl;
      let aadharBackUrlFinal = aadharBackUrl;

      // Upload Aadhar photos if new files selected (with error handling)
      if (aadharFront) {
        try {
          aadharFrontUrlFinal = await uploadAadharPhoto(aadharFront, 'front');
        } catch (error) {
          console.warn('Aadhar front upload failed, continuing without it:', error);
          // Continue without the front image
        }
      }
      if (aadharBack) {
        try {
          aadharBackUrlFinal = await uploadAadharPhoto(aadharBack, 'back');
        } catch (error) {
          console.warn('Aadhar back upload failed, continuing without it:', error);
          // Continue without the back image
        }
      }

      // Prepare payload with only user_profiles fields
      const userProfilesFields = [
        'admission_number', 'course', 'batch_year', 'date_of_birth', 'gender',
        'address', 'city', 'state', 'country', 'emergency_contact_name',
        'emergency_contact_phone', 'parent_name', 'parent_phone', 'parent_email',
        'aadhar_number', 'blood_group', 'bio', 'pincode'
      ];

      const usersFields = ['full_name', 'phone', 'email'];

      // Create payload with only user_profiles fields
      const payload = {
        admission_number: data.admission_number || '',
        course: data.course || '',
        avatar_url: avatarUrl || null,
        aadhar_front_url: aadharFrontUrlFinal || null,
        aadhar_back_url: aadharBackUrlFinal || null,
        aadhar_number: extractedAadharNumber || null,
        pincode: data.pincode || null
      };

      // Add other user_profiles fields
      userProfilesFields.forEach(field => {
        if (data[field] !== undefined) {
          payload[field] = data[field];
        }
      });

      // Add users fields separately
      const userData = {};
      usersFields.forEach(field => {
        if (data[field] !== undefined) {
          userData[field] = data[field];
        }
      });

      // Debug: Log the session and payload
      console.log('Session user ID:', session.user.id);
      console.log('Payload being sent:', payload);

      // Use backend API to save profile (bypasses RLS issues)
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      const response = await fetch(`${API_BASE_URL}/api/user-profiles/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...payload,
          ...userData, // Include users fields
          status: 'complete', // Correct field mapping for user_profiles
          profile_status: 'active' // Correct field mapping for user_profiles
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error saving user profile:', result);
        throw new Error('Failed to save profile: ' + (result.message || 'Unknown error'));
      }

      const saved = result.data;

      await onSuccess?.(saved);
    } catch (err) {
      console.error('Failed to save profile:', err);
      // Show error to user
      alert('Failed to save profile: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarSelect = () => fileInputRef.current?.click();

  const handleAvatarUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      setIsUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const getFieldStatus = (fieldName) => {
    const hasError = errors[fieldName];
    const hasValue = watchedValues[fieldName] && watchedValues[fieldName].toString().trim() !== '';

    // Only show error status if there's an actual error (not while typing)
    if (hasError) return 'error';
    // Show success if field has value and no error
    if (hasValue && !hasError) return 'success';
    return 'default';
  };

  const getFieldIcon = (fieldName) => {
    const status = getFieldStatus(fieldName);
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const InputField = ({ name, label, type = 'text', placeholder, icon: Icon, required = false, onChange, ...props }) => {
    const status = getFieldStatus(name);
    const fieldIcon = getFieldIcon(name);
    
    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-slate-600" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            {...register(name)}
            type={type}
            placeholder={placeholder}
            className={`w-full px-4 py-4 border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 text-lg ${
              status === 'error' 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                : status === 'success'
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50'
                : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500 bg-white hover:border-amber-400'
            }`}
            {...props}
          />
          {fieldIcon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {fieldIcon}
            </div>
          )}
        </div>
        {errors[name] && getFieldStatus(name) === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors[name].message}
          </div>
        )}
      </div>
    );
  };

  const SelectField = ({ name, label, options, placeholder, icon: Icon, required = false }) => {
    const status = getFieldStatus(name);
    const fieldIcon = getFieldIcon(name);
    
    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-slate-600" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            {...register(name)}
            className={`w-full px-4 py-4 border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 text-lg ${
              status === 'error' 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                : status === 'success'
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50'
                : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500 bg-white hover:border-amber-400'
            }`}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldIcon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {fieldIcon}
            </div>
          )}
        </div>
        {errors[name] && getFieldStatus(name) === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors[name].message}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 rounded-3xl shadow-2xl border border-amber-200/50 p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-amber-200/20 rounded-full translate-y-12 -translate-x-12"></div>
      
      {showHeader && (
        <div className="mb-12 text-center relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl mb-6 shadow-xl relative">
            <User className="w-10 h-10 text-white" />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-30"></div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-800 to-orange-800 bg-clip-text text-transparent mb-3">
            {isEdit ? 'Edit Student Profile' : 'Create Student Profile'}
          </h2>
          <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
            Complete your profile to access all hostel services and features
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        {/* Avatar & Basic Info */}
        <div className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 rounded-3xl shadow-2xl border border-amber-200/50 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Profile Picture & Basic Information
              </div>
              <div className="text-sm text-slate-600 font-medium">Your personal details and photo</div>
            </div>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 flex justify-center">
              <div className="relative group w-56 h-56 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-3 shadow-2xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-inner">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Camera className="w-20 h-20" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarSelect}
                  className="absolute -bottom-3 -right-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-full p-5 shadow-xl transform hover:scale-110 transition-all duration-200"
                  title="Upload avatar"
                >
                  {isUploading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Upload className="w-7 h-7" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="full_name"
                label="Full Name"
                placeholder="Enter your full name"
                icon={User}
                required
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
              <input
                    {...register('phone')}
                type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                      getFieldStatus('phone') === 'error' 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                        : getFieldStatus('phone') === 'success'
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500 bg-white hover:border-amber-400'
                    }`}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setValue('phone', sanitized, { shouldValidate: false, shouldDirty: true });
                    }}
                  />
                  {getFieldIcon('phone') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getFieldIcon('phone')}
                    </div>
                  )}
                </div>
                {errors.phone && getFieldStatus('phone') === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone.message}
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full px-4 py-3 border-2 border-slate-200 bg-slate-50 rounded-xl text-slate-600 cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>
        </div>

        {/* Academic Information */}
        <div className="bg-gradient-to-br from-white via-sky-50/30 to-blue-50/20 rounded-3xl shadow-2xl border border-sky-200/50 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Academic Information
              </div>
              <div className="text-sm text-slate-600 font-medium">Your educational background</div>
            </div>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              name="admission_number"
              label="Admission Number"
              placeholder="ADM123456"
              icon={Shield}
              required
            />
            
            <InputField
              name="course"
              label="Course"
              placeholder="B.Tech CSE"
              icon={GraduationCap}
              required
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Batch Year
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
            <input
                  {...register('batch_year')}
              type="text"
                  placeholder="2025"
                  maxLength={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                    getFieldStatus('batch_year') === 'error' 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                      : getFieldStatus('batch_year') === 'success'
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500 bg-white hover:border-amber-400'
                  }`}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setValue('batch_year', sanitized, { shouldValidate: false, shouldDirty: true });
                  }}
                />
                {getFieldIcon('batch_year') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldIcon('batch_year')}
                  </div>
                )}
              </div>
              {errors.batch_year && getFieldStatus('batch_year') === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.batch_year.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/20 rounded-3xl shadow-2xl border border-emerald-200/50 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Personal Details
              </div>
              <div className="text-sm text-slate-600 font-medium">Tell us about yourself</div>
            </div>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <InputField
                name="date_of_birth"
                label="Date of Birth"
                type="date"
                icon={Calendar}
              />
            </div>
            
            <div className="space-y-3">
              <SelectField
                name="gender"
                label="Gender"
                icon={User}
                required
                placeholder="Select Gender"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
              />
            </div>
            
            <div className="space-y-3">
              <SelectField
                name="blood_group"
                label="Blood Group"
                icon={Heart}
                placeholder="Select Blood Group"
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Aadhar Card Details */}
        <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 rounded-3xl shadow-2xl border border-purple-200/50 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Identity Documents
              </div>
              <div className="text-sm text-slate-600 font-medium">Upload your Aadhar card photos for verification</div>
            </div>
          </h3>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                  Aadhar Front Photo
                </label>
                <div className="border-2 border-dashed border-purple-300 rounded-3xl p-10 text-center hover:border-purple-400 transition-all duration-200 bg-gradient-to-br from-purple-50 to-pink-50 group">
                  {aadharFrontUrl ? (
                    <div className="space-y-4">
                      <img src={aadharFrontUrl} alt="Aadhar Front" className="w-full h-52 object-cover rounded-2xl shadow-xl" />
                      <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Front photo uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-200">
                        <Camera className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <p className="text-lg text-slate-700 font-semibold mb-2">Upload Aadhar Front Photo</p>
                        <p className="text-sm text-slate-500">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAadharFront(file);
                        await handleAadharVerification(file, 'front');
                      }
                    }}
                    className="mt-6 w-full text-sm text-slate-500 file:mr-4 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-600 file:text-white hover:file:from-purple-600 hover:file:to-pink-700 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                  Aadhar Back Photo
                </label>
                <div className="border-2 border-dashed border-purple-300 rounded-3xl p-10 text-center hover:border-purple-400 transition-all duration-200 bg-gradient-to-br from-purple-50 to-pink-50 group">
                  {aadharBackUrl ? (
                    <div className="space-y-4">
                      <img src={aadharBackUrl} alt="Aadhar Back" className="w-full h-52 object-cover rounded-2xl shadow-xl" />
                      <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Back photo uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-200">
                        <Camera className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <p className="text-lg text-slate-700 font-semibold mb-2">Upload Aadhar Back Photo</p>
                        <p className="text-sm text-slate-500">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAadharBack(file);
                        await handleAadharVerification(file, 'back');
                      }
                    }}
                    className="mt-6 w-full text-sm text-slate-500 file:mr-4 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-600 file:text-white hover:file:from-purple-600 hover:file:to-pink-700 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            
            {/* Verification Message */}
            {verificationMessage && (
              <div className={`mt-6 p-4 rounded-2xl border-2 ${
                verificationMessage.includes('✅') 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : verificationMessage.includes('⚠️')
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-3">
                  {isVerifyingAadhar ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : verificationMessage.includes('✅') ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : verificationMessage.includes('⚠️') ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {isVerifyingAadhar ? 'Verifying Aadhar...' : 'Verification Result'}
                    </p>
                    <p className="text-sm mt-1">{verificationMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-3xl shadow-2xl border border-blue-200/50 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Address Information
              </div>
              <div className="text-sm text-slate-600 font-medium">Where do you live?</div>
            </div>
          </h3>
          
          <div className="space-y-6">
            <InputField
              name="address"
              label="Address"
              placeholder="Street, Area, Landmark"
              icon={MapPin}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Pincode
                </label>
                <div className="relative">
                  <input
                    {...register('pincode')}
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                      getFieldStatus('pincode') === 'error' 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                        : getFieldStatus('pincode') === 'success'
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500 bg-white hover:border-amber-400'
                    }`}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setValue('pincode', sanitized, { shouldValidate: false, shouldDirty: true });
                      if (sanitized.length === 6) {
                        fetchLocationFromPincode(sanitized);
                      }
                    }}
                  />
                  {isLoadingLocation && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    </div>
                  )}
                  {getFieldIcon('pincode') && !isLoadingLocation && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getFieldIcon('pincode')}
                    </div>
                  )}
                </div>
                {errors.pincode && getFieldStatus('pincode') === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.pincode.message}
                  </div>
                )}
                <p className="text-xs text-slate-500">Enter 6-digit pincode to auto-fill location</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Country
                </label>
                <input
                  {...register('country')}
                  type="text"
                  placeholder="Enter country"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                    getFieldStatus('country') === 'error' 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                      : getFieldStatus('country') === 'success'
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500 bg-white hover:border-amber-400'
                  }`}
                />
                {getFieldIcon('country') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldIcon('country')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="city"
                label="City"
                placeholder="Enter city"
                icon={MapPin}
              />
              
              <InputField
                name="state"
                label="State"
                placeholder="Enter state"
                icon={MapPin}
              />
            </div>
          </div>
        </div>

        {/* Emergency & Parent Information */}
        <div className="bg-gradient-to-br from-white via-rose-50/30 to-pink-50/20 rounded-3xl shadow-2xl border border-rose-200/50 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Emergency & Parent Information
              </div>
              <div className="text-sm text-slate-600 font-medium">Contact details for emergencies</div>
            </div>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Emergency Contact
              </h4>
              
              <InputField
                name="emergency_contact_name"
                label="Contact Name"
                placeholder="Emergency contact name"
                icon={User}
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Phone
                </label>
                <div className="relative">
              <input
                    {...register('emergency_contact_phone')}
                type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                      getFieldStatus('emergency_contact_phone') === 'error' 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                        : getFieldStatus('emergency_contact_phone') === 'success'
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500 bg-white hover:border-amber-400'
                    }`}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setValue('emergency_contact_phone', sanitized, { shouldValidate: false, shouldDirty: true });
                    }}
                  />
                  {getFieldIcon('emergency_contact_phone') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getFieldIcon('emergency_contact_phone')}
                    </div>
                  )}
                </div>
                {errors.emergency_contact_phone && getFieldStatus('emergency_contact_phone') === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.emergency_contact_phone.message}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Parent / Guardian
              </h4>
              
              <InputField
                name="parent_name"
                label="Parent Name"
                placeholder="Parent/Guardian name"
                icon={User}
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Parent Phone
                </label>
                <div className="relative">
              <input
                    {...register('parent_phone')}
                type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                      getFieldStatus('parent_phone') === 'error' 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                        : getFieldStatus('parent_phone') === 'success'
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50'
                        : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500 bg-white hover:border-amber-400'
                    }`}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setValue('parent_phone', sanitized, { shouldValidate: false, shouldDirty: true });
                    }}
                  />
                  {getFieldIcon('parent_phone') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getFieldIcon('parent_phone')}
                    </div>
                  )}
                </div>
                {errors.parent_phone && getFieldStatus('parent_phone') === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.parent_phone.message}
                  </div>
                )}
              </div>
              
              <InputField
                name="parent_email"
                label="Parent Email"
                type="email"
                placeholder="parent@example.com"
                icon={Mail}
              />
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex justify-center space-x-8 pt-16">
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="px-12 py-5 border-2 border-slate-300 text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-12 py-5 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 text-lg relative overflow-hidden ${
              isDirty
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            disabled={isSubmitting || !isDirty}
          >
            {isDirty && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 hover:opacity-20 transition-opacity duration-200"></div>
            )}
            {isSubmitting && <Loader2 className="w-6 h-6 animate-spin" />}
            <span className="relative z-10">
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Profile'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfileForm;