import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const forgotPasswordData = await forgotPassword(email);
      setSuccess(forgotPasswordData.message || 'If an account exists, a password reset email has been sent.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
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
        <h2 className="text-2xl font-extrabold font-display text-ink-900 text-center mb-2">Reset Password</h2>
        <p className="text-ink-500 text-sm text-center mb-6">
          Enter your email and we will send you a link to reset your password.
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
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
          <div>
            <label htmlFor="forgot-password-email" className="block text-ink-700 text-sm font-semibold mb-2">Email Address</label>
            <input
              id="forgot-password-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cream-50 border border-ink-200 focus:border-primary-500 focus:bg-white rounded-xl px-4 py-3.5 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-primary-500/15 transition-all outline-none text-base"
              placeholder="e.g., student@example.com"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="text-center text-ink-500 text-sm mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
