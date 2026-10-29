import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { AlertTriangle, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Button from '../components/common/Button';
import { auth } from '../config/firebase';
import { mapFirebaseAuthError } from '../utils/firebaseAuthErrors';
import { PASSWORD_HINT, getPasswordValidationError } from '../utils/passwordValidation';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [codeValid, setCodeValid] = useState(null);

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or missing reset link. Please request a new password reset link.');
      setCodeValid(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then(() => setCodeValid(true))
      .catch((err) => {
        setError(mapFirebaseAuthError(err).message);
        setCodeValid(false);
      });
  }, [oobCode]);

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oobCode || !codeValid) {
      setError('Invalid or missing reset link.');
      return;
    }

    const policyError = await getPasswordValidationError(auth, password);
    if (policyError) {
      setError(policyError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess('Password reset successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(mapFirebaseAuthError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto my-16 px-4"
    >
      <Link
        to="/"
        className="mb-6 flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <div className="bg-white p-8 rounded-3xl border border-ink-100 shadow-theme-lg">
        <h2 className="text-2xl font-extrabold font-display text-ink-900 text-center mb-2">Set New Password</h2>
        <p className="text-ink-500 text-sm text-center mb-6">
          Create a new secure password for your account.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-primary-50 border border-primary-200 text-primary-700 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success} Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
          <div>
            <label htmlFor="reset-new-password" className="block text-ink-700 text-sm font-semibold mb-2">New Password</label>
            <div className="relative">
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cream-50 border border-ink-200 focus:border-primary-500 focus:bg-white rounded-xl px-4 py-3.5 pr-12 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-primary-500/15 transition-all outline-none text-base"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink-500 hover:text-ink-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-ink-500 mt-1.5">{PASSWORD_HINT}</p>
          </div>
          <div>
            <label htmlFor="reset-confirm-password" className="block text-ink-700 text-sm font-semibold mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-cream-50 border border-ink-200 focus:border-primary-500 focus:bg-white rounded-xl px-4 py-3.5 pr-12 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-primary-500/15 transition-all outline-none text-base"
                placeholder="Repeat password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink-500 hover:text-ink-600 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading || !codeValid} className="w-full">
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <p className="text-center text-ink-500 text-sm mt-6">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
