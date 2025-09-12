// Alternative version using 'avatars' bucket instead of 'profile_picture'
// Copy the handleFileUpload function from this file to replace the one in StudentProfileForm.jsx

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!currentUser) {
    showNotification('Please log in to upload avatar', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showNotification('File size must be less than 5MB', 'error');
    return;
  }

  if (!file.type.startsWith('image/')) {
    showNotification('Please select an image file', 'error');
    return;
  }

  setIsUploading(true);
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser?.id}-${Date.now()}.${fileExt}`;
    const filePath = fileName; // Direct upload to avatars bucket

    const { error: uploadError } = await supabase.storage
      .from('avatars') // Use 'avatars' bucket instead of 'profile_picture'
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('avatars') // Use 'avatars' bucket instead of 'profile_picture'
      .getPublicUrl(filePath);

    setValue('avatar_url', data.publicUrl);
    showNotification('Avatar uploaded successfully!', 'success');
  } catch (error) {
    console.error('Error uploading file:', error);
    
    let errorMessage = 'Failed to upload avatar';
    if (error.message) {
      if (error.message.includes('JWT')) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.message.includes('bucket')) {
        errorMessage = 'Storage bucket not found. Please contact administrator.';
      } else if (error.message.includes('policy')) {
        errorMessage = 'Upload permission denied. Please contact administrator.';
      } else {
        errorMessage = `Upload failed: ${error.message}`;
      }
    }
    
    showNotification(errorMessage, 'error');
  } finally {
    setIsUploading(false);
  }
};


