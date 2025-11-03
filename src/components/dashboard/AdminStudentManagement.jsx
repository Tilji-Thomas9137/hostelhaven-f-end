import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Home,
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Building2,
  MapPin,
  Clock
} from 'lucide-react';
import ViewStudentModal from '../ui/ViewStudentModal';

const AdminStudentManagement = () => {
  const { showNotification } = useNotification();
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allocationFilter, setAllocationFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    admission_number: '',
    full_name: '',
    email: '',
    phone_number: '',
    course: 'MCA',
    batch_year: 2026,
    semester: '4th',
    admission_status: 'pending',
    room_allocation_status: 'not_allocated',
    allocated_room_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStudents(),
        fetchRooms()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/admin/students`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStudents(result.data?.students || []);
      } else {
        console.error('Failed to fetch students:', response.status);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRooms(result.data?.rooms || []);
      } else {
        console.error('Failed to fetch rooms:', response.status);
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/admin/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification('Student added successfully!', 'success');
        setShowAddModal(false);
        resetForm();
        fetchStudents();
      } else {
        throw new Error(result.message || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      showNotification(error.message || 'Failed to add student', 'error');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/admin/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification('Student updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedStudent(null);
        resetForm();
        fetchStudents();
      } else {
        throw new Error(result.message || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      showNotification(error.message || 'Failed to update student', 'error');
    }
  };

  const handleAllocateRoom = async (studentId, roomId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_BASE_URL}/api/admin/students/${studentId}/allocate-room`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_id: roomId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification('Room allocated successfully!', 'success');
        fetchStudents();
      } else {
        throw new Error(result.message || 'Failed to allocate room');
      }
    } catch (error) {
      console.error('Error allocating room:', error);
      showNotification(error.message || 'Failed to allocate room', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      admission_number: '',
      full_name: '',
      email: '',
      phone_number: '',
      course: 'MCA',
      batch_year: 2026,
      semester: '4th',
      admission_status: 'pending',
      room_allocation_status: 'not_allocated',
      allocated_room_id: '',
      notes: ''
    });
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      admission_number: student.admission_number || '',
      full_name: student.full_name || '',
      email: student.email || '',
      phone_number: student.phone_number || '',
      course: student.course || 'MCA',
      batch_year: student.batch_year || 2026,
      semester: student.semester || '4th',
      admission_status: student.admission_status || 'pending',
      room_allocation_status: student.room_allocation_status || 'not_allocated',
      allocated_room_id: student.allocated_room_id || '',
      notes: student.notes || ''
    });
    setShowEditModal(true);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.admission_status === statusFilter;
    const matchesAllocation = allocationFilter === 'all' || student.room_allocation_status === allocationFilter;
    
    return matchesSearch && matchesStatus && matchesAllocation;
  });

  const availableRooms = rooms.filter(room => 
    room.current_occupancy < room.capacity && 
    room.status !== 'full'
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAllocationColor = (status) => {
    switch (status) {
      case 'allocated': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'not_allocated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Management</h2>
          <p className="text-slate-600">Manage student admissions and room allocations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Students</p>
              <p className="text-2xl font-bold text-slate-800">{students.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-slate-800">
                {students.filter(s => s.admission_status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Room Allocated</p>
              <p className="text-2xl font-bold text-slate-800">
                {students.filter(s => s.room_allocation_status === 'allocated').length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-slate-800">
                {students.filter(s => s.admission_status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
          </select>
          
          <select
            value={allocationFilter}
            onChange={(e) => setAllocationFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">All Allocation</option>
            <option value="not_allocated">Not Allocated</option>
            <option value="allocated">Allocated</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Students ({filteredStudents.length})</h3>
          
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No students found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="border border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-semibold text-slate-800">{student.full_name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.admission_status)}`}>
                          {student.admission_status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAllocationColor(student.room_allocation_status)}`}>
                          {student.room_allocation_status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">Admission Number</p>
                          <p className="text-slate-800 font-semibold">{student.admission_number}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">Email</p>
                          <p className="text-slate-800">{student.email}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">Course</p>
                          <p className="text-slate-800">{student.course} - {student.semester}</p>
                        </div>
                      </div>
                      
                      {student.allocated_room_id && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Room:</strong> {student.room_number} (Floor {student.floor})
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowViewModal(true);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      
                      {student.admission_status === 'approved' && student.room_allocation_status === 'not_allocated' && (
                        <button
                          onClick={() => {
                            const roomId = availableRooms[0]?.id;
                            if (roomId) {
                              handleAllocateRoom(student.id, roomId);
                            }
                          }}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>Allocate Room</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" 
          style={{
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full"
            style={{
              width: '95%',
              maxWidth: '1200px',
              maxHeight: '90vh',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Add New Student</h3>
                    <p className="text-amber-100">Complete student registration and profile setup</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div 
              className="p-8 overflow-y-auto"
              style={{
                maxHeight: 'calc(90vh - 140px)',
                height: 'auto'
              }}
            >
              <form onSubmit={handleAddStudent} className="space-y-8">
                {/* Personal Information Section */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <User className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">Personal Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Admission Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.admission_number}
                        onChange={(e) => setFormData({...formData, admission_number: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        placeholder="Enter admission number"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          placeholder="student@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          value={formData.phone_number}
                          onChange={(e) => {
                            const sanitized = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({...formData, phone_number: sanitized});
                          }}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          placeholder="9876543210"
                          maxLength={10}
                          required
                        />
                      </div>
                      {formData.phone_number && formData.phone_number.length !== 10 && (
                        <p className="text-sm text-amber-600">Phone number must be 10 digits</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Academic Information Section */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">Academic Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Course <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      >
                        <option value="MCA">Master of Computer Applications (MCA)</option>
                        <option value="MBA">Master of Business Administration (MBA)</option>
                        <option value="B.Tech">Bachelor of Technology (B.Tech)</option>
                        <option value="B.Com">Bachelor of Commerce (B.Com)</option>
                        <option value="BBA">Bachelor of Business Administration (BBA)</option>
                        <option value="BCA">Bachelor of Computer Applications (BCA)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Batch Year <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.batch_year}
                        onChange={(e) => setFormData({...formData, batch_year: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      >
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Semester <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      >
                        <option value="1st">1st Semester</option>
                        <option value="2nd">2nd Semester</option>
                        <option value="3rd">3rd Semester</option>
                        <option value="4th">4th Semester</option>
                        <option value="5th">5th Semester</option>
                        <option value="6th">6th Semester</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Admission Status Section */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">Admission Status</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Admission Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.admission_status}
                        onChange={(e) => setFormData({...formData, admission_status: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="active">Active</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Room Allocation Status
                      </label>
                      <select
                        value={formData.room_allocation_status}
                        onChange={(e) => setFormData({...formData, room_allocation_status: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      >
                        <option value="not_allocated">Not Allocated</option>
                        <option value="allocated">Allocated</option>
                        <option value="confirmed">Confirmed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Notes Section */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">Additional Information</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Notes & Comments
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                      placeholder="Add any additional notes, special requirements, or comments about the student..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="w-5 h-5" />
                      <span>Add Student</span>
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" 
          style={{
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full"
            style={{
              width: '95%',
              maxWidth: '1200px',
              maxHeight: '90vh',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Edit className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Edit Student</h3>
                    <p className="text-blue-100">Update student information and status</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                    resetForm();
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div 
              className="p-8 overflow-y-auto"
              style={{
                maxHeight: 'calc(90vh - 140px)',
                height: 'auto'
              }}
            >
              <form onSubmit={handleUpdateStudent} className="space-y-8">
                {/* Personal Information Section */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">Personal Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Admission Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.admission_number}
                        onChange={(e) => setFormData({...formData, admission_number: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          value={formData.phone_number}
                          onChange={(e) => {
                            const sanitized = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({...formData, phone_number: sanitized});
                          }}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          maxLength={10}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information Section */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">Academic Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Course <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="MCA">Master of Computer Applications (MCA)</option>
                        <option value="MBA">Master of Business Administration (MBA)</option>
                        <option value="B.Tech">Bachelor of Technology (B.Tech)</option>
                        <option value="B.Com">Bachelor of Commerce (B.Com)</option>
                        <option value="BBA">Bachelor of Business Administration (BBA)</option>
                        <option value="BCA">Bachelor of Computer Applications (BCA)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Batch Year <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.batch_year}
                        onChange={(e) => setFormData({...formData, batch_year: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Semester <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="1st">1st Semester</option>
                        <option value="2nd">2nd Semester</option>
                        <option value="3rd">3rd Semester</option>
                        <option value="4th">4th Semester</option>
                        <option value="5th">5th Semester</option>
                        <option value="6th">6th Semester</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status Management Section */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">Status Management</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Admission Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.admission_status}
                        onChange={(e) => setFormData({...formData, admission_status: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="active">Active</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Room Allocation Status
                      </label>
                      <select
                        value={formData.room_allocation_status}
                        onChange={(e) => setFormData({...formData, room_allocation_status: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="not_allocated">Not Allocated</option>
                        <option value="allocated">Allocated</option>
                        <option value="confirmed">Confirmed</option>
                      </select>
                    </div>
                  </div>
                  
                  {formData.room_allocation_status === 'allocated' && (
                    <div className="mt-6 space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Allocate Room
                      </label>
                      <select
                        value={formData.allocated_room_id}
                        onChange={(e) => setFormData({...formData, allocated_room_id: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="">Select Room</option>
                        {availableRooms.map(room => (
                          <option key={room.id} value={room.id}>
                            {room.room_number} (Floor {room.floor}) - {room.room_type} - Available: {room.capacity - room.current_occupancy}/{room.capacity}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Additional Notes Section */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">Additional Information</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Notes & Comments
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                      placeholder="Add any additional notes, special requirements, or comments about the student..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStudent(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-2">
                      <Edit className="w-5 h-5" />
                      <span>Update Student</span>
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      <ViewStudentModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </div>
  );
};

export default AdminStudentManagement;
