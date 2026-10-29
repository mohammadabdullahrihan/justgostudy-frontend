import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Download, X } from 'lucide-react';
import { MODAL_SPRING_TRANSITION } from '../../utils/motionPresets';
import { subscribeNewsletter } from '../../services/studyService';
import { useModalA11y } from '../../hooks/useModalA11y';

/**
 * Genuine value-exchange lead capture: subscribes the email via the existing
 * Newsletter flow, then unlocks the real download URL (a Cloudinary PDF, not
 * a placeholder). Used for the Country Guide PDF download.
 */
const EmailGateModal = ({ isOpen, onClose, downloadUrl, title = 'Download the Country Guide' }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useModalA11y(isOpen, onClose);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await subscribeNewsletter(email.trim());
      toast.success('You are subscribed! Starting your download…');
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      onClose();
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not subscribe right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-gate-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/50"
          />
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={MODAL_SPRING_TRANSITION}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-theme-lg"
          >
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-xl p-1.5 text-ink-500 hover:bg-cream-100">
              <X className="h-5 w-5" />
            </button>
            <div className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <Download className="h-8 w-8" />
              </div>
              <h3 id="email-gate-modal-title" className="mb-2 font-outfit text-xl font-bold text-ink-900">{title}</h3>
              <p className="mb-6 text-sm leading-relaxed text-ink-500">
                Enter your email to get instant access, plus occasional updates on this destination.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-cream-200 bg-cream-50 py-3.5 pl-11 pr-4 text-sm font-medium text-ink-900 outline-none focus:border-primary-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-theme-md transition-all hover:bg-primary-700 disabled:opacity-60"
                >
                  {submitting ? 'Please wait…' : 'Get My Free Guide'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EmailGateModal;
