import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, Check, Eye, EyeOff, LogIn, UserPlus, Sparkles,
  GraduationCap, UserCog, Building2, House, ArrowLeft, ArrowRight, Globe2, Users, UserCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { GoogleIcon, GithubIcon, MicrosoftIcon } from '../components/common/BrandIcons';
import { getPasswordValidationError } from '../utils/passwordValidation';
import { validatePassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import CountryMultiSelect from '../components/common/CountryMultiSelect';
import PhoneInput from '../components/common/PhoneInput';

const AGENT_TYPES = [
  { value: 'global_in_country_office', label: 'Global / In-Country Office' },
  { value: 'saas_agency', label: 'SaaS Agency' },
];

const EMPLOYEE_RANGES = ['1-5', '6-20', '21-50', '51-200', '200+'];

// Matches the rounded-full pill style of step 1's inputs above, kept as one
// constant since step 2 repeats it across ~11 fields.
const AGENT_INPUT_CLASS =
  'w-full bg-white border border-ink-200 hover:border-ink-300 focus:border-primary-500 rounded-full px-6 py-4 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-primary-500/15 transition-all outline-none text-base';

const INITIAL_AGENT_DATA = {
  agentType: '',
  companyName: '',
  sourceCountries: [],
  officeState: '',
  officeCity: '',
  officeStreet: '',
  founderName: '',
  founderEmail: '',
  founderPhone: '',
  contactPersonFirstName: '',
  contactPersonLastName: '',
  contactPersonEmail: '',
  contactPersonPhone: '',
  numberOfEmployees: '',
  designation: '',
};

// GitHub/Microsoft stay wired up (AuthContext, backend) for a quick future
// re-enable, just add the key here once the provider is turned on in
// Firebase Console.
const SOCIAL_PROVIDERS = {
  google: { label: 'Continue with Google', Icon: GoogleIcon },
  github: { label: 'Continue with GitHub', Icon: GithubIcon },
  microsoft: { label: 'Continue with Microsoft', Icon: MicrosoftIcon },
};
const ACTIVE_SOCIAL_PROVIDERS = ['google'];

const ROLES = [
  { value: 'student', icon: GraduationCap, label: 'Student' },
  { value: 'agent', icon: UserCog, label: 'Agent' },
  { value: 'university', icon: Building2, label: 'University/College' },
];

const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};
const formContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const dashboardPathForRole = (role) => {
  if (role === 'student') return '/student/dashboard';
  if (role === 'agent') return '/agent/dashboard';
  if (role === 'university') return '/university/dashboard';
  if (role === 'developer') return '/developer/dashboard';
  if (role === 'super_admin') return '/super-admin/dashboard';
  return '/admin/dashboard';
};

const Register = () => {
  const { user, register, loginWithGoogle, loginWithGithub, loginWithMicrosoft } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referralCode = searchParams.get('ref');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  // Agent-only registration-time fields (Company/Founder/Contact Person
  // details) — kept separate from formData since they only apply to the
  // agent role and only appear on step 2 of the agent sign-up flow.
  const [agentData, setAgentData] = useState(INITIAL_AGENT_DATA);
  const [step, setStep] = useState(1);
  const [passwordChecks, setPasswordChecks] = useState(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const validRoles = ['student', 'agent', 'university'];
    if (roleParam && validRoles.includes(roleParam)) {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!formData.password) {
      setPasswordChecks(null);
      return;
    }
    let cancelled = false;
    validatePassword(auth, formData.password).then((status) => {
      if (!cancelled) setPasswordChecks(status);
    });
    return () => { cancelled = true; };
  }, [formData.password]);

  // Already signed in (e.g. via the social sign-up path), bounce straight
  // to the dashboard instead of showing the registration form again.
  if (user && !success) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  // Runs the final registration call. `agentProfile` is undefined for
  // student/university (they only ever see step 1), or the mapped agent
  // payload once step 2's fields have been validated.
  const submitRegistration = async (agentProfile) => {
    setLoading(true);
    try {
      const result = await register({ ...formData, referralCode, agentProfile });
      setSuccess(true);
      setTimeout(() => {
        navigate(dashboardPathForRole(result.role || formData.role));
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const policyError = await getPasswordValidationError(auth, formData.password);
    if (policyError) {
      setError(policyError);
      return;
    }

    // Agents get a second step collecting company/founder/contact-person
    // details before the account is actually created — student/university
    // registration is unaffected and still submits immediately here.
    if (formData.role === 'agent') {
      setStep(2);
      return;
    }

    await submitRegistration(undefined);
  };

  const handleAgentDetailsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const required = [
      ['agentType', 'Agent type'],
      ['companyName', 'Company name'],
      ['founderName', "Founder's full name"],
      ['founderEmail', "Founder's email address"],
      ['founderPhone', "Founder's contact number"],
      ['contactPersonFirstName', "Contact person's first name"],
      ['contactPersonLastName', "Contact person's last name"],
      ['contactPersonEmail', "Contact person's email"],
      ['contactPersonPhone', "Contact person's mobile number"],
    ];
    const missing = required.find(([key]) => !agentData[key]?.trim?.());
    if (missing) {
      setError(`${missing[1]} is required.`);
      return;
    }

    await submitRegistration({
      agentType: agentData.agentType,
      companyName: agentData.companyName,
      designation: agentData.designation,
      sourceCountries: agentData.sourceCountries,
      officeAddress: {
        street: agentData.officeStreet,
        city: agentData.officeCity,
        state: agentData.officeState,
      },
      founderName: agentData.founderName,
      founderEmail: agentData.founderEmail,
      founderPhone: agentData.founderPhone,
      contactPersonFirstName: agentData.contactPersonFirstName,
      contactPersonLastName: agentData.contactPersonLastName,
      contactPersonEmail: agentData.contactPersonEmail,
      contactPersonPhone: agentData.contactPersonPhone,
      numberOfEmployees: agentData.numberOfEmployees,
      phone: formData.phone,
    });
  };

  const socialLoginFns = {
    google: loginWithGoogle,
    github: loginWithGithub,
    microsoft: loginWithMicrosoft,
  };

  const handleSocialSignUp = async (provider) => {
    setError('');
    setSuccess(false);
    setSocialLoading(provider);
    try {
      const loggedUser = await socialLoginFns[provider]();
      setSuccess(true);
      setTimeout(() => {
        if (loggedUser.role === 'student') navigate('/student/dashboard');
        else if (loggedUser.role === 'agent') navigate('/agent/dashboard');
        else if (loggedUser.role === 'university') navigate('/university/dashboard');
        else if (loggedUser.role === 'developer') navigate('/developer/dashboard');
        else if (loggedUser.role === 'super_admin') navigate('/super-admin/dashboard');
        else navigate('/admin/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Sign-up failed. Please try again.');
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
        <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 rounded-[32px] overflow-hidden p-8 sm:p-10 lg:p-12 min-h-[260px] lg:min-h-[640px] flex flex-col shadow-theme-lg order-2 lg:order-1">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />

          <p className="relative z-10 text-white/50 text-xs sm:text-sm tracking-wide max-w-[240px] leading-relaxed">
            Join thousands of students and partners already working with
            universities abroad.
          </p>

          <div className="relative z-10 flex-1 flex items-center">
            <h1 className="text-white font-display font-extrabold text-4xl sm:text-5xl leading-[1.05] tracking-tight">
              Start your
              <br />
              global journey
            </h1>
          </div>

          <img
            src="/hat-map-icon.webp"
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 right-0 w-40 sm:w-48 lg:w-56 object-contain drop-shadow-2xl pointer-events-none select-none"
          />
          <div className="absolute bottom-8 left-8 lg:left-12 z-10 w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Right panel, form */}
        <div className="relative bg-white rounded-[32px] shadow-theme-lg p-8 sm:p-10 lg:p-14 flex flex-col order-1 lg:order-2">
          <div className="flex items-center justify-between mb-8 lg:mb-10">
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
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-800 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-ink-100 flex items-center justify-center">
                <LogIn className="w-3 h-3 text-ink-500" />
              </span>
              Sign In
            </Link>
          </div>

          <div className={`flex-1 flex flex-col justify-center w-full ${step === 2 ? 'max-w-xl' : 'max-w-sm'}`}>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-ink-900 mb-1">
              {step === 2 ? 'Agency Details' : 'Create Account'}
            </h2>
            {step === 2 && (
              <p className="text-ink-500 text-sm mb-6">
                A few more details so we can review and approve your agency.
              </p>
            )}
            {step === 1 && <div className="mb-6" />}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm mb-5 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-primary-50 border border-primary-200 text-primary-700 p-4 rounded-2xl text-sm mb-5 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Account created! Redirecting to your dashboard...</span>
              </div>
            )}

            {step === 1 && (
            <motion.form
              onSubmit={handleRegisterSubmit}
              className="space-y-4"
              variants={formContainerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fieldVariants}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-ink-200 hover:border-ink-300 focus:border-primary-500 rounded-full px-6 py-4 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-primary-500/15 transition-all outline-none text-base"
                  placeholder="Full name"
                  required
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white border border-ink-200 hover:border-ink-300 focus:border-primary-500 rounded-full px-6 py-4 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-primary-500/15 transition-all outline-none text-base"
                  placeholder="Email address"
                  required
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-ink-200 hover:border-ink-300 focus:border-primary-500 rounded-full px-6 py-4 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-primary-500/15 transition-all outline-none text-base"
                  placeholder="Contact number"
                  pattern="[0-9+\s()-]{7,20}"
                  title="Enter a valid phone number"
                  required
                />
              </motion.div>

              <motion.div variants={fieldVariants} className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              {passwordChecks && (
                <motion.ul variants={fieldVariants} className="px-2 -mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  {[
                    ['meetsMinPasswordLength', '10+ characters'],
                    ['containsUppercaseLetter', 'Uppercase letter'],
                    ['containsLowercaseLetter', 'Lowercase letter'],
                    ['containsNumericCharacter', 'Number'],
                    ['containsNonAlphanumericCharacter', 'Special character'],
                  ].map(([key, label]) => {
                    const met = passwordChecks[key];
                    return (
                      <li key={key} className={`flex items-center gap-1.5 ${met ? 'text-secondary-600' : 'text-ink-500'}`}>
                        <Check className={`w-3 h-3 shrink-0 ${met ? 'opacity-100' : 'opacity-30'}`} />
                        {label}
                      </li>
                    );
                  })}
                </motion.ul>
              )}

              <motion.div variants={fieldVariants} className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full bg-white border rounded-full px-6 py-4 pr-12 text-ink-900 placeholder-ink-400 focus:ring-2 transition-all outline-none text-base ${
                    formData.confirmPassword && formData.confirmPassword !== formData.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15'
                      : 'border-ink-200 hover:border-ink-300 focus:border-primary-500 focus:ring-primary-500/15'
                  }`}
                  placeholder="Confirm password"
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
                {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                  <p className="text-xs text-red-500 mt-1.5 px-2">Passwords do not match</p>
                )}
              </motion.div>

              {/* Role selector, compact pill segmented control */}
              <motion.div variants={fieldVariants} className="px-2">
                <p className="text-ink-500 text-xs font-semibold mb-2.5">
                  I am registering as
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.value })}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold border transition-all ${
                        formData.role === r.value
                          ? 'bg-ink-900 border-ink-900 text-white'
                          : 'bg-white border-ink-200 text-ink-600 hover:border-ink-300'
                      }`}
                    >
                      <r.icon className="w-3.5 h-3.5" />
                      {r.label}
                    </button>
                  ))}
                </div>
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
                      Creating account...
                    </>
                  ) : success ? (
                    <>
                      <Check className="w-4 h-4" />
                      Account created!
                    </>
                  ) : formData.role === 'agent' ? (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>
            )}

            {step === 2 && (
              <form onSubmit={handleAgentDetailsSubmit} className="space-y-6">
                {/* Company Details */}
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-ink-900 font-bold text-sm">
                    <Building2 className="w-4 h-4 text-primary-600" />
                    Company Details
                  </p>

                  <div>
                    <p className="text-ink-500 text-xs font-semibold mb-2">Agent Type</p>
                    <div className="flex flex-wrap gap-2">
                      {AGENT_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setAgentData({ ...agentData, agentType: t.value })}
                          className={`px-4 py-2.5 rounded-full text-xs font-semibold border transition-all ${
                            agentData.agentType === t.value
                              ? 'bg-ink-900 border-ink-900 text-white'
                              : 'bg-white border-ink-200 text-ink-600 hover:border-ink-300'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={agentData.companyName}
                    onChange={(e) => setAgentData({ ...agentData, companyName: e.target.value })}
                    className={AGENT_INPUT_CLASS}
                    placeholder="Company name"
                    required
                  />

                  <div>
                    <p className="text-ink-500 text-xs font-semibold mb-2">Source Country (optional)</p>
                    <CountryMultiSelect
                      value={agentData.sourceCountries}
                      onChange={(sourceCountries) => setAgentData({ ...agentData, sourceCountries })}
                      placeholder="Countries you source students from..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={agentData.officeState}
                      onChange={(e) => setAgentData({ ...agentData, officeState: e.target.value })}
                      className={AGENT_INPUT_CLASS}
                      placeholder="State (optional)"
                    />
                    <input
                      type="text"
                      value={agentData.officeCity}
                      onChange={(e) => setAgentData({ ...agentData, officeCity: e.target.value })}
                      className={AGENT_INPUT_CLASS}
                      placeholder="City (optional)"
                    />
                  </div>
                  <input
                    type="text"
                    value={agentData.officeStreet}
                    onChange={(e) => setAgentData({ ...agentData, officeStreet: e.target.value })}
                    className={AGENT_INPUT_CLASS}
                    placeholder="Address (optional)"
                  />
                </div>

                {/* Founder Details */}
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-ink-900 font-bold text-sm">
                    <Globe2 className="w-4 h-4 text-primary-600" />
                    Founder Details
                  </p>
                  <input
                    type="text"
                    value={agentData.founderName}
                    onChange={(e) => setAgentData({ ...agentData, founderName: e.target.value })}
                    className={AGENT_INPUT_CLASS}
                    placeholder="Founder's full name"
                    required
                  />
                  <input
                    type="email"
                    value={agentData.founderEmail}
                    onChange={(e) => setAgentData({ ...agentData, founderEmail: e.target.value })}
                    className={AGENT_INPUT_CLASS}
                    placeholder="Founder's email address"
                    required
                  />
                  <PhoneInput
                    value={agentData.founderPhone}
                    onChange={(founderPhone) => setAgentData({ ...agentData, founderPhone })}
                    placeholder="Founder's contact number"
                    required
                  />
                </div>

                {/* Contact Person Details */}
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-ink-900 font-bold text-sm">
                    <Users className="w-4 h-4 text-primary-600" />
                    Contact Person Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={agentData.contactPersonFirstName}
                      onChange={(e) => setAgentData({ ...agentData, contactPersonFirstName: e.target.value })}
                      className={AGENT_INPUT_CLASS}
                      placeholder="First name"
                      required
                    />
                    <input
                      type="text"
                      value={agentData.contactPersonLastName}
                      onChange={(e) => setAgentData({ ...agentData, contactPersonLastName: e.target.value })}
                      className={AGENT_INPUT_CLASS}
                      placeholder="Last name"
                      required
                    />
                  </div>
                  <input
                    type="email"
                    value={agentData.contactPersonEmail}
                    onChange={(e) => setAgentData({ ...agentData, contactPersonEmail: e.target.value })}
                    className={AGENT_INPUT_CLASS}
                    placeholder="Contact person's email"
                    required
                  />
                  <PhoneInput
                    value={agentData.contactPersonPhone}
                    onChange={(contactPersonPhone) => setAgentData({ ...agentData, contactPersonPhone })}
                    placeholder="Contact person's mobile number"
                    required
                  />
                </div>

                {/* Account-holder's own role at the company */}
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-ink-900 font-bold text-sm">
                    <UserCircle className="w-4 h-4 text-primary-600" />
                    Your Role
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={agentData.numberOfEmployees}
                      onChange={(e) => setAgentData({ ...agentData, numberOfEmployees: e.target.value })}
                      className={AGENT_INPUT_CLASS}
                    >
                      <option value="">No. of employees (optional)</option>
                      {EMPLOYEE_RANGES.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={agentData.designation}
                      onChange={(e) => setAgentData({ ...agentData, designation: e.target.value })}
                      className={AGENT_INPUT_CLASS}
                      placeholder="Your designation (optional)"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-ink-200 text-ink-600 text-sm font-semibold hover:border-ink-300 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading || success}
                    className="flex-1 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/30"
                  >
                    {loading ? 'Creating account...' : success ? 'Account created!' : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {step === 1 && (
            <>
            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-ink-100"></div>
              <span className="text-xs text-ink-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-ink-100"></div>
            </div>

            {/* Social sign-up */}
            <div className="space-y-3">
              {Object.entries(SOCIAL_PROVIDERS)
                .filter(([provider]) => ACTIVE_SOCIAL_PROVIDERS.includes(provider))
                .map(([provider, { label, Icon }]) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleSocialSignUp(provider)}
                  disabled={!!socialLoading || loading || success}
                  className="w-full flex items-center justify-center gap-2.5 border border-ink-200 hover:border-ink-300 hover:bg-cream-50 rounded-full py-3.5 text-sm font-semibold text-ink-700 transition-all disabled:opacity-60"
                >
                  <Icon className="w-4 h-4" />
                  {socialLoading === provider ? 'Signing in...' : label}
                </button>
              ))}
            </div>
            </>
            )}
          </div>

          <div className="text-center text-[11px] text-ink-500 mt-8 pt-6 border-t border-ink-100">
            <span>&copy; {new Date().getFullYear()} Just Go Study Inc.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
