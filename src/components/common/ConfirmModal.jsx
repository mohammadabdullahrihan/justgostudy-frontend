import { motion, AnimatePresence } from 'framer-motion';
import { MODAL_SPRING_TRANSITION } from '../../utils/motionPresets';
import { useModalA11y } from '../../hooks/useModalA11y';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const containerRef = useModalA11y(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50"
          />

          {/* Modal Card */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={MODAL_SPRING_TRANSITION}
            className="relative w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200"
          >
            <div className="p-8 text-center">
              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'
              }`}>
                {type === 'danger' ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Text */}
              <h3 id="confirm-modal-title" className="text-xl font-bold text-gray-900 mb-2 font-display">
                {title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                {message}
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg ${
                    type === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
                      : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20'
                  }`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition-all duration-200"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
