import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { MODAL_SPRING_TRANSITION } from '../../utils/motionPresets';

const RejectApplicationModal = ({ isOpen, onClose, onConfirm, applicantLabel, submitting }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, submitting]);

  const trimmed = reason.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trimmed || submitting) return;
    onConfirm(trimmed);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-application-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && onClose()}
            className="absolute inset-0 bg-slate-900/50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={MODAL_SPRING_TRANSITION}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-ink-200"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-start justify-between p-6 pb-0">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <AlertTriangle size={22} />
                </div>
                <button
                  type="button"
                  onClick={() => !submitting && onClose()}
                  className="w-8 h-8 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-500 hover:text-ink-700 flex items-center justify-center transition-all"
                  aria-label="Cancel"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 pt-4">
                <h3 id="reject-application-title" className="text-lg font-bold text-ink-900">
                  Reject application
                </h3>
                {applicantLabel && (
                  <p className="text-sm text-ink-500 mt-1">{applicantLabel}</p>
                )}
                <p className="text-sm text-ink-500 mt-2 leading-relaxed">
                  This reason is shown to the student, so they know why and what to do next. This cannot be undone.
                </p>

                <label htmlFor="rejection-reason" className="block text-xs font-bold text-ink-500 uppercase tracking-wider mt-5 mb-2">
                  Rejection reason
                </label>
                <textarea
                  id="rejection-reason"
                  autoFocus
                  required
                  minLength={5}
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. IELTS score below the course's minimum requirement"
                  className="w-full text-sm border border-ink-200 rounded-xl px-3.5 py-3 text-ink-900 placeholder-ink-400 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 p-6">
                <button
                  type="button"
                  onClick={() => !submitting && onClose()}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-ink-500 hover:bg-cream-100 transition-all duration-200 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!trimmed || submitting}
                  className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Rejecting…' : 'Reject application'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RejectApplicationModal;
