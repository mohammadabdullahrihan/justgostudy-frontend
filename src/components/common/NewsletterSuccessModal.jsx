import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';
import {
  useNewsletterSuccessModalOpen,
  useNewsletterSuccessModalTheme,
  useNewsletterSuccessModalStatus,
  closeNewsletterSuccessModal,
} from '../../hooks/useNewsletterSuccessModal';

const COPY = {
  success: {
    heading: 'You’re on the list!',
    body:
      'Thanks for subscribing to Just Go Study. We’ll send you the scholarships, deadlines and study-abroad tips worth knowing about — nothing else.',
  },
  already: {
    heading: 'You’re already subscribed!',
    body:
      'This email is already on our list — you’re all set. No need to sign up again, we’ll keep the updates coming.',
  },
};

// Language Club's footer is red-branded (see LanguageFooter.jsx), so its
// success modal swaps this palette in instead of the site-wide default.
const THEMES = {
  primary: {
    ring: 'bg-secondary-400',
    badge: 'from-secondary-400 to-secondary-600 shadow-secondary-200',
    blob1: 'bg-accent-100',
    blob2: 'bg-primary-100',
    button: 'bg-primary-600 hover:bg-primary-700 shadow-primary-200',
  },
  red: {
    ring: 'bg-red-400',
    badge: 'from-red-500 to-red-700 shadow-red-200',
    blob1: 'bg-red-100',
    blob2: 'bg-orange-100',
    button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
  },
};

const NewsletterSuccessModal = () => {
  const isOpen = useNewsletterSuccessModalOpen();
  const theme = useNewsletterSuccessModalTheme();
  const status = useNewsletterSuccessModalStatus();
  const containerRef = useModalA11y(isOpen, closeNewsletterSuccessModal);
  const t = THEMES[theme] || THEMES.primary;
  const copy = COPY[status] || COPY.success;

  // Portaled to <body> for the same reason as ConsultationModal: several
  // ancestor layouts leave a transform in place (page-transition wrappers,
  // Lenis), which would otherwise turn this `fixed inset-0` into "fixed to
  // that ancestor" instead of the viewport.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeNewsletterSuccessModal()}
        >
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
          >
            {/* Decorative blurred spheres, same motif as ErrorPage/UniversityDetails */}
            <div className={`pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full ${t.blob1} blur-[80px]`} />
            <div className={`pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full ${t.blob2} blur-[90px]`} />

            <button
              onClick={closeNewsletterSuccessModal}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative flex flex-col items-center px-8 py-14 text-center sm:px-14">
              <div className="relative mb-7 flex h-20 w-20 items-center justify-center">
                {/* Pulse ring, one-shot expand-and-fade behind the badge */}
                <motion.span
                  initial={{ scale: 0.6, opacity: 0.55 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
                  className={`absolute inset-0 rounded-full ${t.ring}`}
                />
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 260, delay: 0.05 }}
                  className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-xl ${t.badge}`}
                >
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      d="M5 12.5L10 17.5L19.5 7"
                      stroke="white"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.4, duration: 0.45, ease: 'easeOut' }}
                    />
                  </svg>
                </motion.div>
              </div>

              <h3 className="font-outfit text-2xl font-bold text-ink-900 sm:text-3xl">
                {copy.heading}
              </h3>
              <p className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-ink-500">
                {copy.body}
              </p>

              <button
                onClick={closeNewsletterSuccessModal}
                className={`mt-9 w-full rounded-2xl py-4 font-bold text-white shadow-lg transition-all active:scale-[0.98] sm:w-auto sm:px-12 ${t.button}`}
              >
                Continue Exploring
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default NewsletterSuccessModal;
