import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Shield, Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, X,
  User, Mail, Phone, Calendar, MapPin, Badge, Key, Power, PowerOff
} from 'lucide-react';
import ConfirmationModal from '../ui/ConfirmationModal';
import ViewStaffModal from '../ui/ViewStaffModal';
import EditStaffModal from '../ui/EditStaffModal';

const StaffManagement = ({ data = [], onRefresh }) => {
  const { showNotification } = useNotification();
  const [staff, setStaff] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
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
      setStaff(data);
    }
  }, [data]);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const onSubmitAdd = async (formData) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3002/api/staff-management/staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification('Staff member added successfully!', 'success');
        setShowAddModal(false);
        reset();
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to add staff member');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to add staff member', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEdit = async (formData) => {
    if (!selectedStaff) return;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3002/api/staff-management/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification('Staff member updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedStaff(null);
        reset();
        onRefresh();
      } else {
        throw new Error(result.message || 'Failed to update staff member');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to update staff member', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (staffId) => {
    // Find staff member name for better UX
    const staffMember = staff.find(member => member.id === staffId);
    const staffName = staffMember ? staffMember.full_name : 'this staff member';

    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Staff Member',
      message: `Are you sure you want to delete ${staffName}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const response = await fetch(`http://localhost:3002/api/staff-management/staff/${staffId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          const result = await response.json();
          if (response.ok && result.success) {
            showNotification('Staff member deleted successfully!', 'success');
            onRefresh();
            setConfirmationModal({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null, isLoading: false });
          } else {
            throw new Error(result.message || 'Failed to delete staff member');
          }
        } catch (error) {
          showNotification(error.message || 'Failed to delete staff member', 'error');
        } finally {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false
    });
  };

  const handleStatusToggle = (staffId, currentStatus) => {
    // Determine new status based on current status
    let newStatus, action, type;
    if (currentStatus === 'active') {
      newStatus = 'inactive';
      action = 'deactivate';
      type = 'warning';
    } else if (currentStatus === 'inactive' || currentStatus === 'suspended') {
      newStatus = 'active';
      action = 'activate';
      type = 'success';
    } else {
      // Default case for any other status
      newStatus = 'active';
      action = 'activate';
      type = 'success';
    }

    // Find staff member name for better UX
    const staffMember = staff.find(member => member.id === staffId);
    const staffName = staffMember ? staffMember.full_name : 'this staff member';

    setConfirmationModal({
      isOpen: true,
      type,
      title: `${action === 'activate' ? 'Activate' : 'Deactivate'} Staff Member`,
      message: `Are you sure you want to ${action} ${staffName}?`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const response = await fetch(`http://localhost:3002/api/staff-management/staff/${staffId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
          });

          const result = await response.json();
          if (response.ok && result.success) {
            showNotification(`Staff member ${action}d successfully!`, 'success');
            onRefresh();
            setConfirmationModal({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null, isLoading: false });
          } else {
            throw new Error(result.message || `Failed to ${action} staff member`);
          }
        } catch (error) {
          showNotification(error.message || `Failed to ${action} staff member`, 'error');
        } finally {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false
    });
  };

  const handleBulkStatusToggle = (status) => {
    if (selectedStaffIds.length === 0) {
      showNotification('Please select staff members first', 'warning');
      return;
    }

    const action = status === 'active' ? 'activate' : 'deactivate';
    const type = status === 'active' ? 'success' : 'warning';

    setConfirmationModal({
      isOpen: true,
      type,
      title: `${action === 'activate' ? 'Activate' : 'Deactivate'} Multiple Staff`,
      message: `Are you sure you want to ${action} ${selectedStaffIds.length} staff member(s)?`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          // Process all selected staff members
          const promises = selectedStaffIds.map(staffId => 
            fetch(`http://localhost:3002/api/staff-management/staff/${staffId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status }),
            })
          );

          const responses = await Promise.all(promises);
          const results = await Promise.all(responses.map(res => res.json()));

          const successCount = results.filter(result => result.success).length;
          const failCount = results.length - successCount;

          if (successCount > 0) {
            showNotification(`${successCount} staff member(s) ${action}d successfully!`, 'success');
            setSelectedStaffIds([]);
            onRefresh();
          }
          
          if (failCount > 0) {
            showNotification(`${failCount} staff member(s) failed to ${action}`, 'error');
          }

          setConfirmationModal({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null, isLoading: false });
        } catch (error) {
          showNotification(`Failed to ${action} staff members`, 'error');
        } finally {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false
    });
  };

  const handleSelectAll = () => {
    if (selectedStaffIds.length === filteredStaff.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(filteredStaff.map(member => member.id));
    }
  };

  const handleSelectStaff = (staffId) => {
    setSelectedStaffIds(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'warden':
        return 'bg-purple-100 text-purple-800';
      case 'hostel_operations_assistant':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
          <p className="text-slate-600">Manage hostel staff and their roles</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const inactiveStaff = staff.filter(member => member.status !== 'active');
              if (inactiveStaff.length === 0) {
                showNotification('No inactive staff members to activate', 'info');
                return;
              }
              setSelectedStaffIds(inactiveStaff.map(member => member.id));
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            title="Select all inactive staff for bulk activation"
          >
            <Power className="w-4 h-4" />
            <span>Select Inactive</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="warden">Warden</option>
              <option value="hostel_operations_assistant">Operations Assistant</option>
            </select>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedStaffIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-800 font-medium">
                {selectedStaffIds.length} staff member(s) selected
              </span>
              <button
                onClick={() => setSelectedStaffIds([])}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkStatusToggle('active')}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Power className="w-4 h-4" />
                <span>Activate Selected</span>
              </button>
              <button
                onClick={() => handleBulkStatusToggle('inactive')}
                disabled={isLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <PowerOff className="w-4 h-4" />
                <span>Deactivate Selected</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={selectedStaffIds.length === filteredStaff.length && filteredStaff.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Staff Member</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => (
                    <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedStaffIds.includes(member.id)}
                          onChange={() => handleSelectStaff(member.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{member.full_name}</p>
                          <p className="text-sm text-slate-500">{member.employee_id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-slate-900">{member.email}</p>
                          <p className="text-sm text-slate-500">{member.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStaff(member);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStaff(member);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusToggle(member.id, member.status)}
                            className={`p-2 rounded-lg transition-colors ${
                              member.status === 'active' 
                                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title={
                              member.status === 'active' 
                                ? 'Deactivate Staff' 
                                : member.status === 'suspended' 
                                  ? 'Activate Staff' 
                                  : 'Activate Staff'
                            }
                            disabled={isLoading}
                          >
                            {member.status === 'active' ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
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
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No staff members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Staff Drawer (no overlay) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-white shadow-2xl border-l border-slate-200 overflow-y-auto pointer-events-auto animate-slide-in-right">
            <div className="p-6 flex items-center justify-between border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Add New Staff Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitAdd)} className="p-6 space-y-6">
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
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    {...register('employee_id', { required: 'Employee ID is required' })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter employee ID"
                  />
                  {errors.employee_id && (
                    <p className="text-red-600 text-sm mt-1">{errors.employee_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone number is required' })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Role *
                  </label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select role</option>
                    <option value="warden">Warden</option>
                    <option value="hostel_operations_assistant">Hostel Operations Assistant</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
                  )}
                </div>

                {/* Password removed as not needed; accounts can be invited/activated later */}

              </div>

              <div className="flex justify-end space-x-3">
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
                  {isLoading ? 'Adding...' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Staff Modal */}
      <ViewStaffModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        staff={selectedStaff}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
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
        confirmText={confirmationModal.type === 'danger' ? 'Delete' : 'Confirm'}
        cancelText="Cancel"
      />
    </div>
  );
};

export default StaffManagement;
