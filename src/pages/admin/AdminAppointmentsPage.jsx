import { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  Trash2,
  Loader2,
  RotateCcw,
  X,
  GraduationCap,
  Globe2,
  Landmark,
  Languages,
  Award,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-accent-100 text-accent-700 border-accent-200', icon: <Clock3 size={14} /> },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-secondary-100 text-secondary-700 border-secondary-200', icon: <CheckCircle2 size={14} /> },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <XCircle size={14} /> },
  { value: 'completed', label: 'Completed', color: 'bg-primary-100 text-primary-700 border-primary-200', icon: <CheckCircle2 size={14} /> },
];

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const appointmentData = await appointmentService.getAllAppointments();
      setAppointments(appointmentData);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setIsUpdating(true);
    try {
      const updated = await appointmentService.updateAppointment(id, { status });
      setAppointments(prev => prev.map(item => item._id === id ? updated : item));
      if (selectedAppointment?._id === id) {
        setSelectedAppointment(updated);
      }
    } catch (err) {
      console.error('Failed to update appointment status:', err);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await appointmentService.deleteAppointment(deleteTarget);
      setAppointments(prev => prev.filter(item => item._id !== deleteTarget));
      setSelectedAppointment(null);
      toast.success('Appointment deleted');
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      toast.error('Failed to delete appointment');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Consultation Appointments</h1>
          <p className="text-ink-500">Manage and track all expert consultation requests.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchAppointments} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <div className="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl border border-primary-100 font-semibold text-sm">
            Total: {appointments.length}
          </div>
          <div className="px-4 py-2 bg-accent-50 text-accent-700 rounded-xl border border-accent-100 font-semibold text-sm">
            Pending: {appointments.filter(a => a.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-ink-100 shadow-theme-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-50 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-ink-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 outline-none bg-white transition-all text-sm font-medium"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">

        {/* List View */}
        <div className={`flex-1 overflow-y-auto bg-white rounded-2xl border border-ink-100 shadow-theme-sm custom-scrollbar ${selectedAppointment ? 'hidden lg:block' : 'block'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-ink-500">
              <Calendar size={48} className="mb-4 opacity-20" />
              <p>No appointments found.</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-50">
              {filteredAppointments.map((app) => (
                <motion.div
                  layout
                  key={app._id}
                  onClick={() => setSelectedAppointment(app)}
                  className={`p-4 cursor-pointer transition-all hover:bg-cream-50 ${selectedAppointment?._id === app._id ? 'bg-primary-50 border-l-4 border-primary-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                        {app.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-ink-900 line-clamp-1">{app.fullName}</h4>
                        <div className="flex items-center gap-2 text-xs text-ink-500 mt-0.5">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(app.preferredDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {app.preferredTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_OPTIONS.find(o => o.value === app.status)?.color}`}>
                        {STATUS_OPTIONS.find(o => o.value === app.status)?.label || app.status}
                      </span>
                      <ChevronRight size={16} className="text-ink-500" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className={`lg:w-2/5 overflow-y-auto bg-white rounded-2xl border border-ink-100 shadow-theme-sm custom-scrollbar ${selectedAppointment ? 'block' : 'hidden lg:flex items-center justify-center text-ink-500 bg-cream-50/50 border-dashed'}`}>
          {selectedAppointment ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAppointment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="lg:hidden text-primary-600 font-semibold text-sm flex items-center gap-1"
                  >
                    <ChevronLeft size={16} /> Back to list
                  </button>
                  <div className="hidden lg:block" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteTarget(selectedAppointment._id)}
                      className="p-2 text-ink-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete appointment"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedAppointment(null)}
                      className="p-2 text-ink-500 hover:text-ink-900 hover:bg-cream-100 rounded-lg transition-all"
                      title="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-2xl font-bold">
                    {selectedAppointment.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-ink-900">{selectedAppointment.fullName}</h2>
                    <p className="text-ink-500 flex items-center gap-1 text-sm">
                      <User size={14} /> ID: {selectedAppointment._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <DetailItem icon={<Mail size={16} />} label="Email" value={selectedAppointment.email} />
                  <DetailItem icon={<Phone size={16} />} label="Phone" value={selectedAppointment.phone} />
                  <DetailItem icon={<Briefcase size={16} />} label="Consultant Type" value={selectedAppointment.consultantType} className="capitalize" />
                  {selectedAppointment.subject && (
                    <DetailItem icon={<MessageSquare size={16} />} label="Subject Topic" value={selectedAppointment.subject} className="capitalize" />
                  )}
                  <div className="p-4 rounded-2xl bg-cream-50 border border-ink-100">
                    <p className="text-xs text-ink-500 font-bold uppercase tracking-wider mb-2">Requested Slot</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 font-semibold text-ink-700">
                        <Calendar size={18} className="text-primary-500" />
                        {new Date(selectedAppointment.preferredDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-ink-700">
                        <Clock size={18} className="text-primary-500" />
                        {selectedAppointment.preferredTime}
                      </div>
                    </div>
                  </div>
                </div>

                {(selectedAppointment.preferredDestination || selectedAppointment.studyLevel || selectedAppointment.lastInstitution || selectedAppointment.academicQualification || selectedAppointment.englishTest || selectedAppointment.englishTestScore || selectedAppointment.preferredIntake) && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-ink-900 flex items-center gap-2">
                      <GraduationCap size={18} className="text-primary-500" /> Academic Background
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedAppointment.preferredDestination && (
                        <DetailItem icon={<Globe2 size={16} />} label="Preferred Destination" value={selectedAppointment.preferredDestination} />
                      )}
                      {selectedAppointment.studyLevel && (
                        <DetailItem icon={<GraduationCap size={16} />} label="Desired Study Level" value={selectedAppointment.studyLevel} />
                      )}
                      {selectedAppointment.lastInstitution && (
                        <DetailItem icon={<Landmark size={16} />} label="Last Institution" value={selectedAppointment.lastInstitution} />
                      )}
                      {selectedAppointment.academicQualification && (
                        <DetailItem icon={<BookOpen size={16} />} label="Academic Qualification" value={selectedAppointment.academicQualification} />
                      )}
                      {selectedAppointment.preferredIntake && (
                        <DetailItem icon={<Calendar size={16} />} label="Preferred Intake" value={selectedAppointment.preferredIntake} />
                      )}
                      {selectedAppointment.englishTest && (
                        <DetailItem icon={<Languages size={16} />} label="English Test" value={selectedAppointment.englishTest} />
                      )}
                      {selectedAppointment.englishTestScore && (
                        <DetailItem icon={<Award size={16} />} label="Score" value={selectedAppointment.englishTestScore} />
                      )}
                    </div>
                  </div>
                )}

                {(selectedAppointment.organizationName || selectedAppointment.designation || selectedAppointment.yearsOfExperience) && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-ink-900 flex items-center gap-2">
                      <Briefcase size={18} className="text-primary-500" /> Professional Background
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedAppointment.organizationName && (
                        <DetailItem icon={<Landmark size={16} />} label={selectedAppointment.consultantType === 'agent' ? 'Agency / Company Name' : 'University / College Name'} value={selectedAppointment.organizationName} />
                      )}
                      {selectedAppointment.designation && (
                        <DetailItem icon={<Briefcase size={16} />} label="Designation" value={selectedAppointment.designation} />
                      )}
                      {selectedAppointment.yearsOfExperience && (
                        <DetailItem icon={<Award size={16} />} label="Years of Experience" value={selectedAppointment.yearsOfExperience} />
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-bold text-ink-900 flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary-500" /> Additional Info
                  </h4>
                  <div className="p-4 rounded-2xl bg-primary-50/50 border border-primary-100 text-ink-700 text-sm italic leading-relaxed">
                    {selectedAppointment.message || 'No additional information provided.'}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-ink-100">
                  <h4 className="font-bold text-ink-900">Manage Appointment</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleUpdateStatus(selectedAppointment._id, option.value)}
                        disabled={isUpdating}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                          selectedAppointment.status === option.value
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-ink-100 text-ink-600 hover:border-primary-200'
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center p-10">
              <Calendar size={64} className="mx-auto mb-4 opacity-10" />
              <h3 className="text-lg font-bold text-ink-500">Select an Appointment</h3>
              <p className="text-sm text-ink-500 mt-1">Select an appointment from the list to view full details and manage its status.</p>
            </div>
          )}
        </div>

      </div>
    </div>

    <ConfirmModal
      isOpen={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      onConfirm={handleDeleteConfirm}
      title="Delete this appointment?"
      message="This will permanently delete this appointment. This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
};

const DetailItem = ({ icon, label, value, className = "" }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl border border-ink-50 hover:border-ink-100 transition-all">
    <div className="w-10 h-10 rounded-lg bg-cream-50 flex items-center justify-center text-primary-500">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs text-ink-500 font-bold uppercase tracking-wider">{label}</p>
      <p className={`font-semibold text-ink-900 ${className}`}>{value}</p>
    </div>
  </div>
);

export default AdminAppointmentsPage;
