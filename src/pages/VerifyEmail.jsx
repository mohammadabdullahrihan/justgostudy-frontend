import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { applyActionCode } from 'firebase/auth';
import { Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/common/Button';
import { auth } from '../config/firebase';
import { mapFirebaseAuthError } from '../utils/firebaseAuthErrors';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const email = searchParams.get('email');
  const { resendVerificationEmail } = useAuth();
  const [resending, setResending] = useState(false);

  const [status, setStatus] = useState(() => {
    if (oobCode) return 'loading';
    if (email) return 'pending';
    return 'error';
  });
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email resent. Please check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (!oobCode) {
      if (!email) {
        setStatus('error');
        setMessage('Invalid or missing verification link.');
      }
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully. You can now log in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(mapFirebaseAuthError(err).message);
      });
  }, [oobCode, email]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto my-16 px-4"
    >
      <div className="bg-white p-10 rounded-3xl border border-ink-100 shadow-theme-lg text-center">
        {status === 'pending' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-extrabold font-display text-ink-900 mb-3">Check Your Email</h2>
            <p className="text-ink-500 text-sm mb-2">
              We sent a verification link to:
            </p>
            <p className="text-primary-600 font-semibold text-sm mb-6">{email}</p>
            <p className="text-ink-500 text-xs mb-6">
              Click the link in the email to activate your account.
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-60"
              >
                {resending ? 'Resending...' : "Didn't get it? Resend verification email"}
              </button>
              <Button to="/login" variant="secondary">
                Back to Sign In
              </Button>
            </div>
          </>
        )}

        {status === 'loading' && (
          <>
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin"></div>
            </div>
            <p className="text-ink-500 text-sm">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-extrabold font-display text-ink-900 mb-3">Email Verified!</h2>
            <p className="text-ink-500 text-sm mb-6">{message}</p>
            <Button to="/login">
              Sign In Now
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-extrabold font-display text-ink-900 mb-3">Verification Failed</h2>
            <p className="text-ink-500 text-sm mb-6">{message}</p>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-60"
              >
                {resending ? 'Resending...' : 'Send a new verification email'}
              </button>
              <Button to="/login" variant="secondary">
                Back to Sign In
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyEmail;
