import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Users, Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, X,
  User, Mail, Phone, Calendar, MapPin, GraduationCap, Shield, Power, PowerOff
} from 'lucide-react';
import ConfirmationModal from '../ui/ConfirmationModal';
import ViewStudentModal from '../ui/ViewStudentModal';
import EditStudentModal from '../ui/EditStudentModal';

const StudentManagement = ({ data = [], onRefresh }) => {
  const { showNotification } = useNotification();
  const [students, setStudents] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: null,
    isLoading: false
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (data) {
      setStudents(data);
    }
  }, [data]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.course?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generateStrongPassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=';
    let pwd = '';
    for (let i = 0; i < 16; i++) {
      pwd += charset[Math.floor(Math.random() * charset.length)];
    }
    return pwd;
  };

  const onSubmitAdd = async (formData) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Normalize payload for API expectations
      const normalized = {
        full_name: formData.full_name,
        admission_number: formData.admission_number,
        course: formData.course,
        year: formData.year,
        student_email: formData.student_email,
        student_phone: formData.student_phone,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        parent_email: formData.parent_email,
        parent_relation: formData.parent_relation,
        // Common fields some backends expect for auth creation
        email: formData.student_email,
        role: 'student',
        password: generateStrongPassword(),
      };

      const response = await fetch('http://localhost:3002/api/admission-registry/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalized),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification(
          'Student added successfully! Activation emails with login credentials have been sent to both student and parent email addresses. WhatsApp notification sent to student phone.',
          'success'
        );
        setShowAddModal(false);
        reset();
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to add student');
      }
    } catch (error) {
      // Handle specific validation errors
      if (error.message.includes('already exists')) {
        showNotification(error.message, 'error');
      } else if (error.message.includes('email already exists')) {
        showNotification('A user with this email already exists. Please use a different email address.', 'error');
      } else {
        showNotification(error.message || 'Failed to add student', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEdit = async (formData) => {
    if (!selectedStudent) return;
    
    if (!selectedStudent.admission_number || selectedStudent.admission_number.includes('mock') || selectedStudent.admission_number.includes('student-')) {
      showNotification('Cannot edit mock or test data', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('🔍 STUDENT MANAGEMENT: onSubmitEdit called with formData:', formData);
      console.log('🔍 STUDENT MANAGEMENT: selectedStudent:', selectedStudent);

      const response = await fetch(`http://localhost:3002/api/admission-registry/students/${selectedStudent.admission_number}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData
        }),
      });

      console.log('🔍 STUDENT MANAGEMENT: Edit API response status:', response.status);
      const result = await response.json();
      console.log('🔍 STUDENT MANAGEMENT: Edit API response result:', result);
      
      if (response.ok && result.success) {
        showNotification('Student updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedStudent(null);
        reset();
        onRefresh();
      } else {
        console.log('❌ STUDENT MANAGEMENT: Edit failed:', result);
        throw new Error(result.message || 'Failed to update student');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to update student', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (student) => {
    const studentId = student.admission_number || student.id;
    console.log('🔍 STUDENT MANAGEMENT: handleDeleteClick called with student:', student, 'studentId:', studentId);
    
    if (!studentId || studentId.includes('mock') || studentId.includes('student-')) {
      showNotification('Cannot delete mock or test data', 'error');
      return;
    }

    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Student',
      message: `Are you sure you want to delete ${student.student_name || student.full_name || student.name || 'this student'}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          console.log('🔍 STUDENT MANAGEMENT: Making API call to delete student:', {
            url: `http://localhost:3002/api/admission-registry/students/${studentId}`,
            studentId
          });

          const response = await fetch(`http://localhost:3002/api/admission-registry/students/${studentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          const result = await response.json();
          if (response.ok && result.success) {
            showNotification('Student deleted successfully!', 'success');
            onRefresh();
            setConfirmationModal({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null, isLoading: false });
          } else {
            throw new Error(result.message || 'Failed to delete student');
          }
        } catch (error) {
          console.error('Delete student error:', error);
          showNotification(`Failed to delete student: ${error.message}`, 'error');
          setConfirmationModal({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null, isLoading: false });
        }
      },
      isLoading: false
    });
  };

  const handleStatusToggle = (studentId, currentStatus) => {
    console.log('🔍 STUDENT MANAGEMENT: handleStatusToggle called with:', { studentId, currentStatus });
    
    // Determine new status based on current status
    let newStatus, action, type;
    if (currentStatus === 'active') {
      newStatus = 'inactive';
      action = 'deactivate';
      type = 'warning';
    } else if (currentStatus === 'inactive' || currentStatus === 'approved') {
      newStatus = 'active';
      action = 'activate';
      type = 'success';
    } else {
      // For pending/rejected students, activate them
      newStatus = 'active';
      action = 'activate';
      type = 'success';
    }

    // Find student name for better UX
    const student = students.find(s => s.id === studentId);
    console.log('🔍 STUDENT MANAGEMENT: Found student:', student);
    const studentName = student ? (student.student_name || student.full_name || student.name || 'this student') : 'this student';
    
    // Use admission_number for API calls, not the internal ID
    const apiStudentId = student ? (student.admission_number || student.id) : studentId;
    console.log('🔍 STUDENT MANAGEMENT: Using API student ID:', apiStudentId);

    setConfirmationModal({
      isOpen: true,
      type,
      title: `${action === 'activate' ? 'Activate' : 'Deactivate'} Student`,
      message: `Are you sure you want to ${action} ${studentName}?`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          console.log('🔍 STUDENT MANAGEMENT: Making API call to update status:', {
            url: `http://localhost:3002/api/admission-registry/students/${apiStudentId}`,
            apiStudentId,
            newStatus
          });

          // Update student status in the database
          const response = await fetch(`http://localhost:3002/api/admission-registry/students/${apiStudentId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
          });

          console.log('🔍 STUDENT MANAGEMENT: API response status:', response.status);

          const result = await response.json();
          if (response.ok && result.success) {
            showNotification(`Student ${action}d successfully!`, 'success');
            onRefresh();
            setConfirmationModal({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null, isLoading: false });
          } else {
            throw new Error(result.message || `Failed to ${action} student`);
          }
        } catch (error) {
          showNotification(error.message || `Failed to ${action} student`, 'error');
        } finally {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Management</h2>
          <p className="text-slate-600">Manage student registrations and profiles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id || `student-${index}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{student.student_name}</p>
                          <p className="text-sm text-slate-500">{student.admission_number}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-slate-900">{student.parent_email}</p>
                          <p className="text-sm text-slate-500">{student.parent_phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-slate-900">{student.course}</p>
                          <p className="text-sm text-slate-500">Year {student.batch_year}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusToggle(student.id, student.status)}
                            className={`p-2 rounded-lg transition-colors ${
                              student.status === 'active' 
                                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title={
                              student.status === 'active' 
                                ? 'Deactivate Student' 
                                : 'Activate Student'
                            }
                            disabled={isLoading}
                          >
                            {student.status === 'active' ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Student Drawer */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl border-l border-slate-200 animate-slide-in-right overflow-y-auto pointer-events-auto">
            <div className="p-6 flex items-center justify-between border-b border-slate-200 animate-fade-in">
              <h3 className="text-lg font-semibold text-slate-800">Add New Student</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitAdd)} className="p-6 space-y-6">
              {/* Student Information */}
              <div className="stagger-up">
                <h4 className="text-md font-semibold text-slate-800 mb-4">Student Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('full_name', { required: 'Full name is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                    {errors.full_name && (
                      <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Admission Number *
                    </label>
                    <input
                      type="text"
                      {...register('admission_number', { required: 'Admission number is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter admission number"
                    />
                    {errors.admission_number && (
                      <p className="text-red-600 text-sm mt-1">{errors.admission_number.message}</p>
                    )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Course *
                    </label>
                    <input
                      type="text"
                      {...register('course', { required: 'Course is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <select
                      {...register('year', { required: 'Year is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    {errors.year && (
                      <p className="text-red-600 text-sm mt-1">{errors.year.message}</p>
                    )}
                  </div>

                  <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Student Email *
                </label>
                <input
                  type="email"
                  {...register('student_email', { required: 'Student email is required' })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student email"
                />
                {errors.student_email && (
                  <p className="text-red-600 text-sm mt-1">{errors.student_email.message}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">Must be unique - not used by any existing user</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Student WhatsApp Number *
                </label>
                <input
                  type="tel"
                  {...register('student_phone', { required: 'Student phone is required' })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student WhatsApp number"
                />
                {errors.student_phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.student_phone.message}</p>
                )}
              </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="stagger-up">
                <h4 className="text-md font-semibold text-slate-800 mb-4">Parent Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Name *
                    </label>
                    <input
                      type="text"
                      {...register('parent_name', { required: 'Parent name is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter parent name"
                    />
                    {errors.parent_name && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Phone *
                    </label>
                    <input
                      type="tel"
                      {...register('parent_phone', { required: 'Parent phone is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter parent phone"
                    />
                    {errors.parent_phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Email *
                    </label>
                    <input
                      type="email"
                      {...register('parent_email', { required: 'Parent email is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter parent email"
                    />
                    {errors.parent_email && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_email.message}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Must be unique - not used by any existing user</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Relation *
                    </label>
                    <select
                      {...register('parent_relation', { required: 'Parent relation is required' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select relation</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="guardian">Guardian</option>
                    </select>
                    {errors.parent_relation && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_relation.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Automatic Email Notifications</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      When you add a student, activation emails with login credentials will be automatically sent to both the student and parent email addresses. A WhatsApp notification will also be sent to the student's phone number.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      <strong>Note:</strong> Both student and parent emails must be unique and not already registered in the system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Drawer */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-white shadow-2xl border-l border-slate-200 animate-slide-in-right overflow-y-auto pointer-events-auto">
            <div className="p-6 flex items-center justify-between border-b border-slate-200 animate-fade-in">
              <h3 className="text-lg font-semibold text-slate-800">Edit Student</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitEdit)} className="p-6 space-y-6">
              {/* Student Information */}
              <div className="stagger-up">
                <h4 className="text-md font-semibold text-slate-800 mb-4">Student Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Student Name *
                    </label>
                    <input
                      {...register('full_name', { required: 'Student name is required' })}
                      defaultValue={selectedStudent.student_name || selectedStudent.full_name}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      {...register('course', { required: 'Course is required' })}
                      defaultValue={selectedStudent.course}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course"
                    />
                    {errors.course && (
                      <p className="text-red-600 text-sm mt-1">{errors.course.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Batch Year *
                    </label>
                    <select
                      {...register('year', { required: 'Year is required' })}
                      defaultValue={selectedStudent.batch_year || selectedStudent.year}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    {errors.year && (
                      <p className="text-red-600 text-sm mt-1">{errors.year.message}</p>
                    )}
                  </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Student Email
                </label>
                <input
                  type="email"
                  {...register('student_email')}
                  defaultValue={selectedStudent.student_email || selectedStudent.email}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Student WhatsApp Number
                </label>
                <input
                  type="tel"
                  {...register('student_phone')}
                  defaultValue={selectedStudent.student_phone || selectedStudent.phone}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student WhatsApp number"
                />
              </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="stagger-up">
                <h4 className="text-md font-semibold text-slate-800 mb-4">Parent Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Name *
                    </label>
                    <input
                      type="text"
                      {...register('parent_name', { required: 'Parent name is required' })}
                      defaultValue={selectedStudent.parent_name}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter parent name"
                    />
                    {errors.parent_name && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Phone *
                    </label>
                    <input
                      type="tel"
                      {...register('parent_phone', { required: 'Parent phone is required' })}
                      defaultValue={selectedStudent.parent_phone}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter parent phone"
                    />
                    {errors.parent_phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Email *
                    </label>
                    <input
                      type="email"
                      {...register('parent_email', { required: 'Parent email is required' })}
                      defaultValue={selectedStudent.parent_email}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter parent email"
                    />
                    {errors.parent_email && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Parent Relation *
                    </label>
                    <select
                      {...register('parent_relation', { required: 'Parent relation is required' })}
                      defaultValue={selectedStudent.parent_relation}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select relation</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="guardian">Guardian</option>
                    </select>
                    {errors.parent_relation && (
                      <p className="text-red-600 text-sm mt-1">{errors.parent_relation.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      <ViewStudentModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        student={selectedStudent}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSave={onSubmitEdit}
        isLoading={isLoading}
      />


      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null, isLoading: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        isLoading={confirmationModal.isLoading}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default StudentManagement;
