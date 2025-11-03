import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
});

// Registration validation schema
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(4, 'Full name must be at least 4 characters')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[6-9]\d{9}$/, 'Phone must be 10 digits starting with 6-9')
    .refine((val) => {
      // Check for invalid patterns
      if (/^(\d)\1{9}$/.test(val)) {
        return false; // All same digits (1111111111, 9999999999, etc.)
      }
      if (/^(\d{2})\1{4}$/.test(val)) {
        return false; // Repeated patterns like 1212121212
      }
      if (/^(\d{3})\1{2}\d$/.test(val)) {
        return false; // Patterns like 1231231234
      }
      if (/^(\d{4})\1{1}\d{2}$/.test(val)) {
        return false; // Patterns like 1234123456
      }
      if (/^(\d{5})\1$/.test(val)) {
        return false; // Patterns like 1234512345
      }
      // Check for sequential patterns
      if (/^(0123456789|9876543210)$/.test(val)) {
        return false; // Sequential ascending/descending
      }
      // Check for common test/invalid patterns
      if (/^(0000000000|1111111111|2222222222|3333333333|4444444444|5555555555|6666666666|7777777777|8888888888|9999999999)$/.test(val)) {
        return false; // All same digits
      }
      if (/^(1234567890|0987654321)$/.test(val)) {
        return false; // Sequential patterns
      }
      return true;
    }, 'Please enter a valid mobile number'),
  
  role: z
    .string()
    .min(1, 'Role is required')
    .refine(val => ['student', 'warden', 'parent', 'hostel_operations_assistant'].includes(val), {
      message: 'Invalid role selected'
    }),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must be less than 32 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
  
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Password reset validation schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must be less than 32 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
  
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
}); 

// Complaint creation/update validation schema
export const complaintSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title must be less than 120 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description is too long'),
  category: z
    .enum(['noise', 'wifi_issue', 'bathroom_dirt', 'electric', 'plumbing', 'mess_food_quality'], {
      required_error: 'Category is required'
    }),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'], {
      required_error: 'Priority is required'
    })
});

// Leave request creation/update validation schema
export const leaveRequestSchema = z.object({
  reason: z
    .string()
    .min(1, 'Reason is required')
    .min(5, 'Reason must be at least 5 characters')
    .max(200, 'Reason is too long'),
  destination: z
    .string()
    .min(1, 'Destination is required')
    .min(2, 'Destination must be at least 2 characters')
    .max(100, 'Destination is too long'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  emergency_contact: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .refine((v) => v === undefined || v.length >= 2, {
      message: 'Emergency contact must be at least 2 characters'
    }),
  emergency_phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .refine((v) => {
      if (v === undefined) return true;
      if (!/^[6-9]\d{9}$/.test(v)) return false;
      // Check for invalid patterns
      if (/^(\d)\1{9}$/.test(v)) return false; // All same digits (1111111111, 9999999999, etc.)
      if (/^(\d{2})\1{4}$/.test(v)) return false; // Repeated patterns like 1212121212
      if (/^(\d{3})\1{2}\d$/.test(v)) return false; // Patterns like 1231231234
      if (/^(\d{4})\1{1}\d{2}$/.test(v)) return false; // Patterns like 1234123456
      if (/^(\d{5})\1$/.test(v)) return false; // Patterns like 1234512345
      // Check for sequential patterns
      if (/^(0123456789|9876543210)$/.test(v)) return false; // Sequential ascending/descending
      // Check for common test/invalid patterns
      if (/^(0000000000|1111111111|2222222222|3333333333|4444444444|5555555555|6666666666|7777777777|8888888888|9999999999)$/.test(v)) return false; // All same digits
      if (/^(1234567890|0987654321)$/.test(v)) return false; // Sequential patterns
      return true;
    }, {
      message: 'Please enter a valid mobile number'
    })
}).refine((data) => {
  if (!data.start_date || !data.end_date) return true;
  try {
    return new Date(data.start_date) < new Date(data.end_date);
  } catch {
    return false;
  }
}, {
  message: 'End date must be after start date',
  path: ['end_date']
});

// Room creation validation schema
export const roomSchema = z.object({
  room_number: z
    .string()
    .min(1, 'Room number is required')
    .max(20, 'Room number is too long'),
  floor: z
    .string()
    .min(1, 'Floor is required')
    .refine((v) => /^\d+$/.test(v) && parseInt(v, 10) >= 0, 'Floor must be a non-negative integer'),
  room_type: z
    .string()
    .min(1, 'Room type is required')
    .max(50, 'Room type name is too long'),
  capacity: z
    .string()
    .min(1, 'Capacity is required')
    .refine((v) => /^\d+$/.test(v) && parseInt(v, 10) >= 1 && parseInt(v, 10) <= 10, 'Capacity must be between 1 and 10'),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Price must be a valid non-negative number')
});

// Profile update schema
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(4, 'Full name must be at least 4 characters')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  phone: z
    .string()
    .optional()
    .refine((v) => {
      if (!v) return true;
      if (!/^[6-9]\d{9}$/.test(v)) return false;
      // Check for invalid patterns
      if (/^(\d)\1{9}$/.test(v)) return false; // All same digits (1111111111, 9999999999, etc.)
      if (/^(\d{2})\1{4}$/.test(v)) return false; // Repeated patterns like 1212121212
      if (/^(\d{3})\1{2}\d$/.test(v)) return false; // Patterns like 1231231234
      if (/^(\d{4})\1{1}\d{2}$/.test(v)) return false; // Patterns like 1234123456
      if (/^(\d{5})\1$/.test(v)) return false; // Patterns like 1234512345
      // Check for sequential patterns
      if (/^(0123456789|9876543210)$/.test(v)) return false; // Sequential ascending/descending
      // Check for common test/invalid patterns
      if (/^(0000000000|1111111111|2222222222|3333333333|4444444444|5555555555|6666666666|7777777777|8888888888|9999999999)$/.test(v)) return false; // All same digits
      if (/^(1234567890|0987654321)$/.test(v)) return false; // Sequential patterns
      return true;
    }, 'Please enter a valid mobile number')
});

// Student profile validation schema
export const studentProfileSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[6-9]\d{9}$/, 'Phone must be 10 digits starting with 6-9')
    .refine((val) => {
      // Check for invalid patterns
      if (/^(\d)\1{9}$/.test(val)) {
        return false; // All same digits (1111111111, 9999999999, etc.)
      }
      if (/^(\d{2})\1{4}$/.test(val)) {
        return false; // Repeated patterns like 1212121212
      }
      if (/^(\d{3})\1{2}\d$/.test(val)) {
        return false; // Patterns like 1231231234
      }
      if (/^(\d{4})\1{1}\d{2}$/.test(val)) {
        return false; // Patterns like 1234123456
      }
      if (/^(\d{5})\1$/.test(val)) {
        return false; // Patterns like 1234512345
      }
      // Check for sequential patterns
      if (/^(0123456789|9876543210)$/.test(val)) {
        return false; // Sequential ascending/descending
      }
      // Check for common test/invalid patterns
      if (/^(0000000000|1111111111|2222222222|3333333333|4444444444|5555555555|6666666666|7777777777|8888888888|9999999999)$/.test(val)) {
        return false; // All same digits
      }
      if (/^(1234567890|0987654321)$/.test(val)) {
        return false; // Sequential patterns
      }
      return true;
    }, 'Please enter a valid mobile number'),
  
  admission_number: z
    .string()
    .min(1, 'Admission number is required')
    .min(3, 'Admission number must be at least 3 characters')
    .max(20, 'Admission number must be less than 20 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Admission number can only contain letters and numbers'),
  
  course: z
    .string()
    .min(1, 'Course is required')
    .min(2, 'Course must be at least 2 characters')
    .max(50, 'Course must be less than 50 characters'),
  
  batch_year: z
    .string()
    .min(1, 'Batch year is required')
    .regex(/^(19|20)\d{2}$/, 'Batch year must be a valid year (1900-2099)')
    .refine((v) => {
      const year = parseInt(v);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear + 10;
    }, 'Batch year must be between 1900 and ' + (new Date().getFullYear() + 10)),
  
  date_of_birth: z
    .string()
    .optional()
    .refine((v) => {
      if (!v) return true;
      const date = new Date(v);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 16 && age <= 100;
    }, 'Age must be between 16 and 100 years'),
  
  gender: z
    .string()
    .min(1, 'Gender is required')
    .refine((v) => ['male', 'female', 'other'].includes(v), 'Please select a valid gender'),
  
  address: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 5, 'Address must be at least 5 characters'),
  
  city: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 2, 'City must be at least 2 characters')
    .refine((v) => !v || /^[A-Za-z\s.-]+$/.test(v), 'City can only contain letters, spaces, periods, and hyphens'),
  
  state: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 2, 'State must be at least 2 characters')
    .refine((v) => !v || /^[A-Za-z\s.-]+$/.test(v), 'State can only contain letters, spaces, periods, and hyphens'),
  
  country: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 2, 'Country must be at least 2 characters')
    .refine((v) => !v || /^[A-Za-z\s.-]+$/.test(v), 'Country can only contain letters, spaces, periods, and hyphens'),
  
  pincode: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{6}$/.test(v), 'Pincode must be exactly 6 digits'),
  
  emergency_contact_name: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 2, 'Emergency contact name must be at least 2 characters'),
  
  emergency_contact_phone: z
    .string()
    .optional()
    .refine((v) => {
      if (!v) return true;
      if (!/^[6-9]\d{9}$/.test(v)) return false;
      // Check for invalid patterns
      if (/^(\d)\1{9}$/.test(v)) return false; // All same digits (1111111111, 9999999999, etc.)
      if (/^(\d{2})\1{4}$/.test(v)) return false; // Repeated patterns like 1212121212
      if (/^(\d{3})\1{2}\d$/.test(v)) return false; // Patterns like 1231231234
      if (/^(\d{4})\1{1}\d{2}$/.test(v)) return false; // Patterns like 1234123456
      if (/^(\d{5})\1$/.test(v)) return false; // Patterns like 1234512345
      // Check for sequential patterns
      if (/^(0123456789|9876543210)$/.test(v)) return false; // Sequential ascending/descending
      // Check for common test/invalid patterns
      if (/^(0000000000|1111111111|2222222222|3333333333|4444444444|5555555555|6666666666|7777777777|8888888888|9999999999)$/.test(v)) return false; // All same digits
      if (/^(1234567890|0987654321)$/.test(v)) return false; // Sequential patterns
      return true;
    }, 'Please enter a valid mobile number'),
  
  parent_name: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 2, 'Parent name must be at least 2 characters'),
  
  parent_phone: z
    .string()
    .optional()
    .refine((v) => {
      if (!v) return true;
      if (!/^[6-9]\d{9}$/.test(v)) return false;
      // Check for invalid patterns
      if (/^(\d)\1{9}$/.test(v)) return false; // All same digits (1111111111, 9999999999, etc.)
      if (/^(\d{2})\1{4}$/.test(v)) return false; // Repeated patterns like 1212121212
      if (/^(\d{3})\1{2}\d$/.test(v)) return false; // Patterns like 1231231234
      if (/^(\d{4})\1{1}\d{2}$/.test(v)) return false; // Patterns like 1234123456
      if (/^(\d{5})\1$/.test(v)) return false; // Patterns like 1234512345
      // Check for sequential patterns
      if (/^(0123456789|9876543210)$/.test(v)) return false; // Sequential ascending/descending
      // Check for common test/invalid patterns
      if (/^(0000000000|1111111111|2222222222|3333333333|4444444444|5555555555|6666666666|7777777777|8888888888|9999999999)$/.test(v)) return false; // All same digits
      if (/^(1234567890|0987654321)$/.test(v)) return false; // Sequential patterns
      return true;
    }, 'Please enter a valid mobile number'),
  
  parent_email: z
    .string()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please enter a valid email address'),
  
  aadhar_number: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{12}$/.test(v), 'Aadhar number must be exactly 12 digits'),
  
  blood_group: z
    .string()
    .optional()
    .refine((v) => !v || /^(A|B|AB|O)[+-]$/.test(v), 'Please select a valid blood group')
});