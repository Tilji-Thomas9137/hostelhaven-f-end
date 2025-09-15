import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

/**
 * Verify Aadhar card using Gemini AI
 * @param {File} aadharImage - The Aadhar card image file
 * @param {string} fullName - The full name entered by user
 * @returns {Promise<Object>} Verification result
 */
export const verifyAadharCard = async (aadharImage, fullName) => {
  try {
    const formData = new FormData();
    formData.append('aadharImage', aadharImage);
    formData.append('fullName', fullName);

    const response = await fetch(`${API_BASE_URL}/api/aadhar-verification/verify`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Verification failed');
    }

    return result;
  } catch (error) {
    console.error('Aadhar verification error:', error);
    throw error;
  }
};

/**
 * Save verified Aadhar information to database
 * @param {string} userId - User ID
 * @param {string} aadharNumber - Extracted Aadhar number
 * @param {string} aadharFrontUrl - Front image URL
 * @param {string} aadharBackUrl - Back image URL
 * @returns {Promise<Object>} Save result
 */
export const saveAadharInfo = async (userId, aadharNumber, aadharFrontUrl, aadharBackUrl) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/aadhar-verification/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        aadharNumber,
        aadharFrontUrl,
        aadharBackUrl,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to save Aadhar information');
    }

    return result;
  } catch (error) {
    console.error('Save Aadhar info error:', error);
    throw error;
  }
};

/**
 * Upload Aadhar image to Supabase storage
 * @param {File} file - The image file
 * @param {string} type - 'front' or 'back'
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadAadharImage = async (file, type) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-aadhar-${type}.${fileExt}`;
    const filePath = `aadhar/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('aadhar_verify')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('aadhar_verify')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error(`Aadhar ${type} upload error:`, error);
    throw error;
  }
};

