import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
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
    .regex(/^[6-9]\d{9}$/, 'Phone must be 10 digits starting with 6-9'),
  
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
    .enum(['general', 'maintenance', 'cleanliness', 'noise', 'security', 'food', 'wifi'], {
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
    .refine((v) => v === undefined || /^[6-9]\d{9}$/.test(v), {
      message: 'Phone must be 10 digits starting with 6-9'
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
    .enum(['standard', 'deluxe', 'suite'], { required_error: 'Room type is required' }),
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
    .refine((v) => !v || /^[6-9]\d{9}$/.test(v), 'Phone must be 10 digits starting with 6-9')
});