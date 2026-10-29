import { useState } from 'react';
import {
  Mail,
  Phone,
  Clock,
  User,
  CheckCircle2,
  MessageSquare,
  Trash2,
  Send,
  Tag,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Loader2,
  RotateCcw,
  X,
  GraduationCap,
  Globe2,
  Landmark,
  Languages,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  getConsultations,
  updateConsultationStatus,
  deleteConsultation
} from '../../services/studyService';
import { useAdminList } from '../../hooks/useAdminList';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-accent-100 text-accent-700 border-accent-200', icon: <Clock size={14} /> },
  { value: 'contacted', label: 'Contacted', color: 'bg-primary-100 text-primary-700 border-primary-200', icon: <CheckCircle2 size={14} /> },
  { value: 'closed', label: 'Closed', color: 'bg-secondary-100 text-secondary-700 border-secondary-200', icon: <CheckCircle2 size={14} /> },
];

const AdminConsultations = () => {
  const { data: consultations, setData: setConsultations, loading, error, refetch: fetchConsultations } = useAdminList(async () => {
    const consultationData = await getConsultations();
    return Array.isArray(consultationData) ? consultationData : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleUpdateStatus = async (id, status) => {
    setIsUpdating(true);
    try {
      const updated = await updateConsultationStatus(id, status);
      setConsultations(prev => prev.map(item => item._id === id ? updated : item));
      if (selectedConsultation?._id === id) {
        setSelectedConsultation(updated);
      }
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      console.error('Failed to update consultation status:', err);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteConsultation(deleteTarget);
      setConsultations(prev => prev.filter(item => item._id !== deleteTarget));
      setSelectedConsultation(null);
      toast.success('Contact message deleted');
    } catch (err) {
      console.error('Failed to delete consultation:', err);
      toast.error('Failed to delete');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredConsultations = consultations.filter(cons => {
    const fullName = `${cons.firstName} ${cons.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         cons.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cons.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cons.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Contact Messages</h1>
          <p className="text-ink-500">Manage and respond to all contact form submissions.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchConsultations} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <div className="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl border border-primary-100 font-semibold text-sm">
            Total: {consultations.length}
          </div>
          <div className="px-4 py-2 bg-accent-50 text-accent-700 rounded-xl border border-accent-100 font-semibold text-sm">
            Pending: {consultations.filter(c => c.status === 'pending').length}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-ink-100 shadow-theme-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or subject..."
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
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">

        {/* List View */}
        <div className={`flex-1 overflow-y-auto bg-white rounded-2xl border border-ink-100 shadow-theme-sm custom-scrollbar ${selectedConsultation ? 'hidden lg:block' : 'block'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
          ) : !error && filteredConsultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-ink-500">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-ink-500 mb-1">No contact messages yet</h3>
              <p className="text-sm text-ink-500">When someone sends a message via the contact form, it will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-50">
              {filteredConsultations.map((cons) => (
                <motion.div
                  layout
                  key={cons._id}
                  onClick={() => setSelectedConsultation(cons)}
                  className={`p-4 cursor-pointer transition-all hover:bg-cream-50 ${selectedConsultation?._id === cons._id ? 'bg-primary-50 border-l-4 border-primary-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                        {cons.firstName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-ink-900 line-clamp-1">{cons.firstName} {cons.lastName}</h4>
                        <div className="flex items-center gap-2 text-xs text-ink-500 mt-0.5">
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(cons.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Tag size={12} /> {cons.subject}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_OPTIONS.find(o => o.value === cons.status)?.color}`}>
                        {cons.status}
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
        <div className={`lg:w-2/5 overflow-y-auto bg-white rounded-2xl border border-ink-100 shadow-theme-sm custom-scrollbar ${selectedConsultation ? 'block' : 'hidden lg:flex items-center justify-center text-ink-500 bg-cream-50/50 border-dashed'}`}>
          {selectedConsultation ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedConsultation._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedConsultation(null)}
                    className="lg:hidden text-primary-600 font-semibold text-sm flex items-center gap-1"
                  >
                    <ChevronLeft size={16} /> Back to list
                  </button>
                  <div className="hidden lg:block" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteTarget(selectedConsultation._id)}
                      className="p-2 text-ink-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete message"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedConsultation(null)}
                      className="p-2 text-ink-500 hover:text-ink-900 hover:bg-cream-100 rounded-lg transition-all"
                      title="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-2xl font-bold">
                    {selectedConsultation.firstName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-ink-900">{selectedConsultation.firstName} {selectedConsultation.lastName}</h2>
                    <p className="text-ink-500 flex items-center gap-1 text-sm">
                      <User size={14} /> ID: {selectedConsultation._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <DetailItem icon={<Mail size={16} />} label="Email" value={selectedConsultation.email} />
                  <DetailItem icon={<Phone size={16} />} label="Phone" value={selectedConsultation.phone} />
                  <DetailItem icon={<Tag size={16} />} label="Subject" value={selectedConsultation.subject} />
                  {selectedConsultation.consultantType && (
                    <DetailItem icon={<Briefcase size={16} />} label="Consultant Type" value={selectedConsultation.consultantType} className="capitalize" />
                  )}
                </div>

                {(selectedConsultation.preferredDestination || selectedConsultation.studyLevel || selectedConsultation.lastInstitution || selectedConsultation.academicQualification || selectedConsultation.englishTest || selectedConsultation.englishTestScore || selectedConsultation.preferredIntake) && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-ink-900 flex items-center gap-2">
                      <GraduationCap size={18} className="text-primary-500" /> Academic Background
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedConsultation.preferredDestination && (
                        <DetailItem icon={<Globe2 size={16} />} label="Preferred Destination" value={selectedConsultation.preferredDestination} />
                      )}
                      {selectedConsultation.studyLevel && (
                        <DetailItem icon={<GraduationCap size={16} />} label="Desired Study Level" value={selectedConsultation.studyLevel} />
                      )}
                      {selectedConsultation.lastInstitution && (
                        <DetailItem icon={<Landmark size={16} />} label="Last Institution" value={selectedConsultation.lastInstitution} />
                      )}
                      {selectedConsultation.academicQualification && (
                        <DetailItem icon={<BookOpen size={16} />} label="Academic Qualification" value={selectedConsultation.academicQualification} />
                      )}
                      {selectedConsultation.preferredIntake && (
                        <DetailItem icon={<Calendar size={16} />} label="Preferred Intake" value={selectedConsultation.preferredIntake} />
                      )}
                      {selectedConsultation.englishTest && (
                        <DetailItem icon={<Languages size={16} />} label="English Test" value={selectedConsultation.englishTest} />
                      )}
                      {selectedConsultation.englishTestScore && (
                        <DetailItem icon={<Award size={16} />} label="Score" value={selectedConsultation.englishTestScore} />
                      )}
                    </div>
                  </div>
                )}

                {(selectedConsultation.organizationName || selectedConsultation.designation || selectedConsultation.yearsOfExperience) && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-ink-900 flex items-center gap-2">
                      <Briefcase size={18} className="text-primary-500" /> Professional Background
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedConsultation.organizationName && (
                        <DetailItem icon={<Landmark size={16} />} label={selectedConsultation.consultantType === 'agent' ? 'Agency / Company Name' : 'University / College Name'} value={selectedConsultation.organizationName} />
                      )}
                      {selectedConsultation.designation && (
                        <DetailItem icon={<Briefcase size={16} />} label="Designation" value={selectedConsultation.designation} />
                      )}
                      {selectedConsultation.yearsOfExperience && (
                        <DetailItem icon={<Award size={16} />} label="Years of Experience" value={selectedConsultation.yearsOfExperience} />
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-bold text-ink-900 flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary-500" /> Message
                  </h4>
                  <div className="p-4 rounded-2xl bg-primary-50/50 border border-primary-100 text-ink-700 text-sm italic leading-relaxed">
                    {selectedConsultation.message}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-ink-100">
                  <h4 className="font-bold text-ink-900">Manage Status</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleUpdateStatus(selectedConsultation._id, option.value)}
                        disabled={isUpdating}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                          selectedConsultation.status === option.value
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-ink-100 text-ink-600 hover:border-primary-200'
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <a
                    href={`mailto:${selectedConsultation.email}?subject=${encodeURIComponent(`Re: ${selectedConsultation.subject}`)}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cream-50 border-2 border-ink-200 text-ink-700 rounded-xl font-semibold hover:bg-cream-100 transition-all"
                  >
                    <Send size={16} />
                    Reply via Email
                  </a>
                </div>

              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center p-10">
              <MessageSquare size={64} className="mx-auto mb-4 opacity-10" />
              <h3 className="text-lg font-bold text-ink-500">Select a Message</h3>
              <p className="text-sm text-ink-500 mt-1">Select a contact message from the list to view full details and manage it.</p>
            </div>
          )}
        </div>

      </div>
    </div>

    <ConfirmModal
      isOpen={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      onConfirm={handleDeleteConfirm}
      title="Delete this contact message?"
      message="This will permanently delete this consultation message. This action cannot be undone."
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
    <div className="flex-1 min-w-0">
      <p className="text-xs text-ink-500 font-bold uppercase tracking-wider">{label}</p>
      <p className={`font-semibold text-ink-900 ${className} break-all`}>{value}</p>
    </div>
  </div>
);

export default AdminConsultations;
