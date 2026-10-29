import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertCircle } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';
import { MODAL_SPRING_TRANSITION } from '../../utils/motionPresets';
import { StatusBadge } from '../../components/dashboard/home/shared';

const StudentApplicationDetailModal = ({ application, onClose }) => {
  const modalRef = useModalA11y(!!application, onClose);

  if (!application) return null;
  const app = application;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-detail-title"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={MODAL_SPRING_TRANSITION}
          className="bg-white border border-ink-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-theme-lg"
        >
          <div className="flex items-center justify-between p-6 border-b border-ink-100 sticky top-0 bg-white rounded-t-2xl">
            <div>
              <h2 id="application-detail-title" className="font-bold text-ink-900 text-lg">
                {app.courseId?.name || 'Application'}
              </h2>
              <p className="text-sm text-ink-500 mt-0.5">{app.universityId?.name || '—'}</p>
            </div>
            <button
              onClick={onClose}
              autoFocus
              className="w-8 h-8 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-500 hover:text-ink-700 flex items-center justify-center transition-all shrink-0"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <StatusBadge status={app.status} uppercase />
              <span className="text-sm text-ink-500">
                Applied {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {app.status === 'rejected' && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3">
                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="text-sm font-bold text-rose-700 mb-1">Why this was rejected</h3>
                  <p className="text-sm text-rose-600 leading-relaxed">
                    {app.rejectionReason || 'No reason was provided. Please contact support for details.'}
                  </p>
                </div>
              </div>
            )}

            {app.personalInfo && (
              <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
                <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">Personal Info</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-ink-500">Name</span>
                  <span className="text-ink-700">{app.personalInfo.firstName} {app.personalInfo.lastName}</span>
                  <span className="text-ink-500">Phone</span>
                  <span className="text-ink-700">{app.personalInfo.phone || '—'}</span>
                  <span className="text-ink-500">Passport</span>
                  <span className="text-ink-700">{app.personalInfo.passportNumber || '—'}</span>
                  <span className="text-ink-500">Gender</span>
                  <span className="text-ink-700">{app.personalInfo.gender || '—'}</span>
                </div>
              </div>
            )}

            {app.academicInfo && (
              <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
                <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">Academic Info</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-ink-500">Qualification</span>
                  <span className="text-ink-700">{app.academicInfo.highestQualification || '—'}</span>
                  <span className="text-ink-500">Institution</span>
                  <span className="text-ink-700">{app.academicInfo.institutionName || '—'}</span>
                  <span className="text-ink-500">CGPA</span>
                  <span className="text-ink-700">{app.academicInfo.cgpa || '—'}</span>
                  <span className="text-ink-500">Passing Year</span>
                  <span className="text-ink-700">{app.academicInfo.passingYear || '—'}</span>
                  <span className="text-ink-500">IELTS</span>
                  <span className="text-ink-700">{app.academicInfo.ieltsOverall || '—'}</span>
                </div>
              </div>
            )}

            {app.documents?.length > 0 && (
              <div className="bg-cream-50 border border-ink-100 rounded-xl p-4">
                <h3 className="text-xs uppercase tracking-wider text-ink-500 font-bold mb-3">Documents</h3>
                <ul className="space-y-2">
                  {app.documents.map((doc, i) => (
                    <li key={i}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-all">
                        <FileText className="shrink-0" size={16} />
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentApplicationDetailModal;
