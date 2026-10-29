import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, Check, Eye, EyeOff, User, LogIn, Sparkles, House,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { GoogleIcon, GithubIcon, MicrosoftIcon } from '../components/common/BrandIcons';

const dashboardPathForRole = (role) => {
  if (role === 'student') return '/student/dashboard';
  if (role === 'agent') return '/agent/dashboard';
  if (role === 'university') return '/university/dashboard';
  if (role === 'developer') return '/developer/dashboard';
  if (role === 'super_admin') return '/super-admin/dashboard';
  return '/admin/dashboard';
};

// Only these prefixes are trusted as post-login redirect targets. `from` comes
// from router location state, which could in theory be crafted via a link
// (e.g. /login pointing at a malicious external redirect), so we allow-list
// known internal dashboard route prefixes rather than trusting it blindly.
const SAFE_REDIRECT_PREFIXES = ['/student/', '/agent/', '/university/', '/admin/', '/super-admin/', '/developer/', '/educator/'];

const isSafeRedirectPath = (path) => (
  typeof path === 'string'
  && path.startsWith('/')
  && !path.startsWith('//')
  && SAFE_REDIRECT_PREFIXES.some((prefix) => path.startsWith(prefix))
);

// GitHub/Microsoft stay wired up (AuthContext, backend) for a quick future
// re-enable, just add the key here once the provider is turned on in
// Firebase Console.
const SOCIAL_PROVIDERS = {
  google: { label: 'Continue with Google', Icon: GoogleIcon },
  github: { label: 'Continue with GitHub', Icon: GithubIcon },
  microsoft: { label: 'Continue with Microsoft', Icon: MicrosoftIcon },
};
const ACTIVE_SOCIAL_PROVIDERS = ['google'];

const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};
const formContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const Login = () => {
  const { user, login, loginWithGoogle, loginWithGithub, loginWithMicrosoft } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Already signed in, a logged-in user landing on /login (bookmark, stale
  // link) should bounce straight to their dashboard instead of seeing the form.
  if (user && !success) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  const redirectByRole = (role) => {
    setTimeout(() => {
      // If PrivateRoute bounced the user here from a specific page (e.g. a
      // deep link to /student/applications), send them back there instead of
      // the generic dashboard, as long as it's a recognized internal route.
      const fromPath = location.state?.from?.pathname;
      if (isSafeRedirectPath(fromPath)) {
        navigate(fromPath + (location.state?.from?.search || ''));
        return;
      }
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'agent') navigate('/agent/dashboard');
      else if (role === 'university') navigate('/university/dashboard');
      else if (role === 'developer') navigate('/developer/dashboard');
      else if (role === 'super_admin') navigate('/super-admin/dashboard');
      else navigate('/admin/dashboard');
    }, 1000);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      setSuccess(true);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const socialLoginFns = {
    google: loginWithGoogle,
    github: loginWithGithub,
    microsoft: loginWithMicrosoft,
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    setSuccess(false);
    setSocialLoading(provider);
    try {
      const loggedUser = await socialLoginFns[provider]();
      setSuccess(true);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-cream-50 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Home, fixed top-left of the whole page */}
      <Link
        to="/"
        title="Back to Home"
        className="fixed left-4 top-4 sm:left-6 sm:top-6 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-primary-600 text-white shadow-theme-md hover:bg-primary-700 transition-colors"
      >
        <House className="w-4 h-4" />
      </Link>

      {/* Blurred pastel background blobs */}
      <div className="absolute -top-32 -left-24 w-[420px] h-[420px] bg-accent-200 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-[380px] h-[380px] bg-primary-200 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[420px] h-[420px] bg-secondary-200 rounded-full blur-[110px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-ink-200 rounded-full blur-[90px] opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 lg:items-stretch">
        {/* Left panel, dark brand visual */}
        <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 rounded-[32px] overflow-hidden p-8 sm:p-10 lg:p-12 min-h-[260px] lg:min-h-[640px] flex flex-col shadow-theme-lg">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />

          <p className="relative z-10 text-white/50 text-xs sm:text-sm tracking-wide max-w-[240px] leading-relaxed">
            Global education made simple, real universities, real guidance,
            real results.
          </p>

          <div className="relative z-10 flex-1 flex items-center">
            <h1 className="text-white font-display font-extrabold text-4xl sm:text-5xl leading-[1.05] tracking-tight">
              Study abroad,
              <br />
              simply
            </h1>
          </div>

          <img
            src="/graduation-hat-with-rolled-certificate-3d.webp"
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 right-0 w-44 sm:w-52 lg:w-60 object-contain drop-shadow-2xl pointer-events-none select-none"
          />
          <div className="absolute bottom-8 left-8 lg:left-12 z-10 w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Right panel, form */}
        <div className="relative bg-white rounded-[32px] shadow-theme-lg p-8 sm:p-10 lg:p-14 flex flex-col">
          <div className="flex items-center justify-between mb-10 lg:mb-14">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="Just Go Study"
                className="w-8 h-8 object-contain"
              />
              <span className="font-extrabold text-base sm:text-lg text-ink-900 group-hover:text-primary-600 transition-colors">
                Just Go Study
              </span>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-800 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-ink-100 flex items-center justify-center">
                <User className="w-3 h-3 text-ink-500" />
              </span>
              Sign Up
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center w-full max-w-sm">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-ink-900 mb-8">
              Sign In
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm mb-5 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-primary-50 border border-primary-200 text-primary-700 p-4 rounded-2xl text-sm mb-5 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Login successful! Redirecting to your dashboard...</span>
              </div>
            )}

            <motion.form
              onSubmit={handleLoginSubmit}
              className="space-y-4"
              variants={formContainerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fieldVariants}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-ink-200 hover:border-ink-300 focus:border-primary-500 rounded-full px-6 py-4 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-primary-500/15 transition-all outline-none text-base"
                  placeholder="Email address"
                  required
                />
              </motion.div>

              <motion.div variants={fieldVariants} className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-ink-200 hover:border-ink-300 focus:border-primary-500 rounded-full px-6 py-4 pr-12 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-primary-500/15 transition-all outline-none text-base"
                  placeholder="Password"
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
              </motion.div>

              <motion.div variants={fieldVariants} className="flex justify-start px-2">
                <Link
                  to="/forgot-password"
                  className="text-accent-600 hover:text-accent-700 text-xs font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div variants={fieldVariants}>
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || success}
                  className="w-full rounded-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/30 mt-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      Signing in...
                    </>
                  ) : success ? (
                    <>
                      <Check className="w-4 h-4" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-ink-100"></div>
              <span className="text-xs text-ink-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-ink-100"></div>
            </div>

            {/* Social sign-in */}
            <div className="space-y-3">
              {Object.entries(SOCIAL_PROVIDERS)
                .filter(([provider]) => ACTIVE_SOCIAL_PROVIDERS.includes(provider))
                .map(([provider, { label, Icon }]) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleSocialLogin(provider)}
                  disabled={!!socialLoading || loading || success}
                  className="w-full flex items-center justify-center gap-2.5 border border-ink-200 hover:border-ink-300 hover:bg-cream-50 rounded-full py-3.5 text-sm font-semibold text-ink-700 transition-all disabled:opacity-60"
                >
                  <Icon className="w-4 h-4" />
                  {socialLoading === provider ? 'Signing in...' : label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-[11px] text-ink-500 mt-8 pt-6 border-t border-ink-100">
            <span>&copy; {new Date().getFullYear()} Just Go Study Inc.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
