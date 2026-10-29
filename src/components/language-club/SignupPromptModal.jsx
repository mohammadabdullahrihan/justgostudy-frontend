import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';

// Generic, content-driven promotional modal for Language Club — every
// caller supplies its own title/message, so this same component can be
// reused from any Language Club page (lesson complete, deck complete,
// or a plain nudge elsewhere), not just the two current call sites.
const SignupPromptModal = ({
  isOpen,
  onClose,
  title = 'Save your progress!',
  message = 'Sign up for a free student account to keep your points, streak, and badges.',
  ctaLabel = 'Create free account',
  ctaHref = '/register?role=student',
}) => {
  const containerRef = useModalA11y(isOpen, onClose);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
          >
            <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-red-100 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-orange-100 blur-[90px]" />

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative flex flex-col items-center px-8 py-14 text-center sm:px-10">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-xl shadow-red-200">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l2.6 6.3L21 9l-5 4.4L17.5 21 12 17.3 6.5 21 8 13.4 3 9l6.4-.7L12 2z"
                    fill="white"
                  />
                </svg>
              </div>

              <h3 className="font-outfit text-2xl font-bold text-ink-900">{title}</h3>
              <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-ink-500">{message}</p>

              <Link
                to={ctaHref}
                onClick={onClose}
                className="mt-8 w-full rounded-2xl bg-red-600 py-4 font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-[0.98] sm:w-auto sm:px-10"
              >
                {ctaLabel}
              </Link>
              <button
                onClick={onClose}
                className="mt-3 text-sm font-semibold text-ink-500 hover:text-ink-700"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SignupPromptModal;
