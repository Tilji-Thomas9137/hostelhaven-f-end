import { X, User, Mail, Phone, Calendar, GraduationCap, Shield, Clock, CheckCircle } from 'lucide-react';

const ViewStudentModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'inactive':
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Gradient Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/60 w-full max-w-3xl max-h-[85vh] overflow-hidden animate-modal-enter flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Student Details</h3>
                <p className="text-sm text-slate-600">View complete student information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/80 hover:bg-white rounded-lg flex items-center justify-center transition-colors border border-slate-200/60"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Student Profile Card */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 mb-6 border border-slate-200/60">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-slate-800">{student.student_name || student.full_name}</h4>
                <p className="text-slate-600">{student.admission_number}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(student.status)}`}>
                    {student.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Information */}
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Student Information</span>
              </h5>
              
              <div className="bg-white rounded-xl p-4 border border-slate-200/60">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Email</p>
                      <p className="text-slate-900">{student.student_email || student.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Phone</p>
                      <p className="text-slate-900">{student.student_phone || student.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Course</p>
                      <p className="text-slate-900">{student.course || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Year</p>
                      <p className="text-slate-900">{student.batch_year || student.year || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-600" />
                <span>Parent Information</span>
              </h5>
              
              <div className="bg-white rounded-xl p-4 border border-slate-200/60">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Parent Name</p>
                      <p className="text-slate-900">{student.parent_name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Parent Email</p>
                      <p className="text-slate-900">{student.parent_email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Parent Phone</p>
                      <p className="text-slate-900">{student.parent_phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Relation</p>
                      <p className="text-slate-900">{student.parent_relation || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="md:col-span-2 space-y-4">
              <h5 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Status Information</span>
              </h5>
              
              <div className="bg-white rounded-xl p-4 border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Current Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(student.status || 'pending')}`}>
                      {getStatusIcon(student.status || 'pending')}
                      <span>{student.status || 'Pending'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200/60 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentModal;
