import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, User, Mail, Phone, GraduationCap, Shield, Save, Loader2 } from 'lucide-react';

const EditStudentModal = ({ isOpen, onClose, student, onSave, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  useEffect(() => {
    if (student && isOpen) {
      // Reset form with student data
      setValue('full_name', student.student_name || student.full_name || '');
      setValue('course', student.course || '');
      setValue('year', student.batch_year || student.year || '');
      setValue('student_email', student.student_email || student.email || '');
      setValue('student_phone', student.student_phone || student.phone || '');
      setValue('parent_name', student.parent_name || '');
      setValue('parent_email', student.parent_email || '');
      setValue('parent_phone', student.parent_phone || '');
      setValue('parent_relation', student.parent_relation || '');
      setValue('status', student.status || 'pending');
    }
  }, [student, isOpen, setValue]);

  const onSubmit = async (formData) => {
    await onSave(formData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Gradient Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/60 w-full max-w-4xl max-h-[85vh] overflow-hidden animate-modal-enter flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Edit Student</h3>
                <p className="text-sm text-slate-600">Update student information and settings</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="w-8 h-8 bg-white/80 hover:bg-white rounded-lg flex items-center justify-center transition-colors border border-slate-200/60 disabled:opacity-50"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Student Information */}
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Student Information</span>
              </h5>
              
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      {...register('full_name', { required: 'Student name is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter student name"
                    />
                    {errors.full_name && (
                      <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Course *
                    </label>
                    <input
                      type="text"
                      {...register('course', { required: 'Course is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter course"
                    />
                    {errors.course && (
                      <p className="text-red-600 text-sm mt-1">{errors.course.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Year *
                    </label>
                    <input
                      type="text"
                      {...register('year', { required: 'Year is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter year"
                    />
                    {errors.year && (
                      <p className="text-red-600 text-sm mt-1">{errors.year.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Status *
                    </label>
                    <select
                      {...register('status', { required: 'Status is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    {errors.status && (
                      <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <span>Contact Information</span>
              </h5>
              
              <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl p-4 border border-slate-200/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Student Email *
                    </label>
                    <input
                      type="email"
                      {...register('student_email', { 
                        required: 'Student email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter student email"
                    />
                    {errors.student_email && (
                      <p className="text-red-600 text-sm mt-1">{errors.student_email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Student Phone *
                    </label>
                    <input
                      type="tel"
                      {...register('student_phone', { 
                        required: 'Student phone is required',
                        pattern: {
                          value: /^[0-9+\-\s()]+$/,
                          message: 'Invalid phone number'
                        }
                      })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter student phone"
                    />
                    {errors.student_phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.student_phone.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-green-600" />
                <span>Parent Information</span>
              </h5>
              
              <div className="bg-gradient-to-r from-slate-50 to-green-50 rounded-xl p-4 border border-slate-200/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Name *
                    </label>
                    <input
                      type="text"
                      {...register('parent_name', { required: 'Parent name is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter parent name"
                    />
                    {errors.parent_name && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Email *
                    </label>
                    <input
                      type="email"
                      {...register('parent_email', { 
                        required: 'Parent email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter parent email"
                    />
                    {errors.parent_email && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Phone *
                    </label>
                    <input
                      type="tel"
                      {...register('parent_phone', { 
                        required: 'Parent phone is required',
                        pattern: {
                          value: /^[0-9+\-\s()]+$/,
                          message: 'Invalid phone number'
                        }
                      })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter parent phone"
                    />
                    {errors.parent_phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Relation *
                    </label>
                    <input
                      type="text"
                      {...register('parent_relation', { required: 'Relation is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter relation"
                    />
                    {errors.parent_relation && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_relation.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-50 to-green-50 border-t border-slate-200/60 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
