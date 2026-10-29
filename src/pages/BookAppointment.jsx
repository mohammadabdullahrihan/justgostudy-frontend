import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Landmark,
  Globe2,
  Languages,
  Award,
  BookOpen,
} from 'lucide-react';
import appointmentService from '../services/appointmentService';
import Seo from '../components/common/Seo';
import { useAuth } from '../context/AuthContext';
import { getDestinations } from '../services/studyService';
import { companyData } from '../constants/companyData';

// Curated destinations shown first, same list/order as the Contact page's
// brand card, with any other active destination from the backend appended
// after — so this dropdown isn't stuck showing only these 6 forever.
const STATIC_DESTINATIONS = ['UK', 'Canada', 'Australia', 'Germany', 'USA', 'Malaysia'];

const STUDY_LEVELS = ["Bachelor's Degree", "Master's Degree", 'PhD', 'Diploma / Foundation', 'Language Course', 'Other'];

const ENGLISH_TESTS = ['IELTS', 'TOEFL iBT', 'PTE Academic', 'Duolingo English Test', 'MOI (Medium of Instruction)', 'Not Taken Yet'];

// Same topic set as the public Contact page's Subject field, except
// "Partnership" is swapped for "Course Information" — this form is for
// students/agents/university reps booking a consultation, not partnership
// inquiries (the Contact page already covers those).
const SUBJECT_TOPICS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'admission', label: 'Admission Support' },
  { value: 'course_information', label: 'Course Information' },
  { value: 'visa', label: 'Visa Assistance' },
  { value: 'scholarship', label: 'Scholarship Info' },
];

const INTAKES = ['Fall 2026', 'Spring 2027', 'Summer 2027', 'Fall 2027', 'Not Decided Yet'];

gsap.registerPlugin(useGSAP);

// Scrolls to the top of the form card (not the very top of the page) so
// advancing/going back a step doesn't yank the whole page up past the hero —
// that used to dump the user back above the fold, forcing them to scroll
// down again to see the step they just landed on.
const scrollToFormTop = (formCardEl) => {
  if (!formCardEl) return;
  if (window.lenis) {
    window.lenis.scrollTo(formCardEl, { offset: -24 });
  } else {
    const targetY = formCardEl.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }
};

/* Animated SVG loader shown while the booking request is in flight */
const SvgSpinner = () => (
  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const TIMELINE_STEPS = [
  { label: 'Basic Info', desc: 'Who are we meeting?' },
  { label: 'Schedule', desc: 'Pick date & time' },
  { label: 'Confirmed', desc: 'We reach out to you' },
];

/* Vertical SVG timeline: the connector line draws in as steps advance and
   the active node pulses. */
const TimelineSVG = ({ currentStep }) => {
  const wrapRef = useRef(null);
  const nodeYs = [30, 150, 270];

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const segments = gsap.utils.toArray('.timeline-segment');
      const nodes = gsap.utils.toArray('.timeline-node');

      // Draw completed segments, reset future ones
      segments.forEach((seg, i) => {
        const done = currentStep >= i + 2;
        if (reduceMotion) {
          gsap.set(seg, { strokeDashoffset: done ? 0 : 1 });
        } else {
          gsap.to(seg, { strokeDashoffset: done ? 0 : 1, duration: 0.8, ease: 'power2.inOut' });
        }
      });

      // Pulse the active node
      nodes.forEach((node, i) => {
        gsap.killTweensOf(node);
        gsap.set(node, { scale: 1, transformOrigin: 'center' });
        if (!reduceMotion && i + 1 === currentStep) {
          gsap.to(node, { scale: 1.2, duration: 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        }
      });
    },
    { scope: wrapRef, dependencies: [currentStep] }
  );

  return (
    <div ref={wrapRef} className="flex gap-4">
      <svg viewBox="0 0 60 300" className="h-72 w-14 shrink-0" fill="none" aria-hidden="true">
        {/* base connector */}
        <line x1="30" y1={nodeYs[0]} x2="30" y2={nodeYs[2]} stroke="#e8ecfc" strokeWidth="4" strokeLinecap="round" />
        {/* drawn segments */}
        {[0, 1].map((i) => (
          <line
            key={i}
            className="timeline-segment"
            pathLength="1"
            x1="30"
            y1={nodeYs[i]}
            x2="30"
            y2={nodeYs[i + 1]}
            stroke="#0e1f6d"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
          />
        ))}
        {/* nodes */}
        {nodeYs.map((y, i) => {
          const reached = currentStep >= i + 1;
          return (
            <g key={y} className="timeline-node">
              <circle cx="30" cy={y} r="14" fill={reached ? '#0e1f6d' : '#ffffff'} stroke={reached ? '#0e1f6d' : '#d2d9f9'} strokeWidth="3" />
              {reached ? (
                <path
                  d={`M${30 - 5} ${y} l3.5 3.5 l6.5 -7`}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <text x="30" y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#788ded">
                  {i + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex h-72 flex-col justify-between py-1">
        {TIMELINE_STEPS.map((step, i) => (
          <div key={step.label} className={`transition-opacity duration-300 ${currentStep >= i + 1 ? 'opacity-100' : 'opacity-50'}`}>
            <p className={`text-sm font-bold ${currentStep >= i + 1 ? 'text-primary-700' : 'text-ink-500'}`}>{step.label}</p>
            <p className="text-xs text-ink-500">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Account role -> this form's consultantType value. Only the site's real
// public-facing roles get auto-selected ('educator' is backend-only, never
// a public registration option — see Join Us/Register — so it has no
// option here either). 'university' is the only name mismatch (backend/
// account role vs. this form's 'university_representative' value).
// admin/super_admin/developer have no option and are left unmapped.
const ROLE_TO_CONSULTANT_TYPE = {
  student: 'student',
  agent: 'agent',
  university: 'university_representative',
};

const BookAppointment = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    consultantType: '',
    preferredDestination: '',
    studyLevel: '',
    lastInstitution: '',
    academicQualification: '',
    englishTest: '',
    englishTestScore: '',
    organizationName: '',
    designation: '',
    yearsOfExperience: '',
    subject: '',
    preferredIntake: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    agreedToPrivacyPolicy: false,
  });
  const [extraDestinations, setExtraDestinations] = useState([]);

  // Live destination list, curated countries first + anything else active,
  // same pattern as the Contact page's brand card.
  useEffect(() => {
    let ignore = false;
    getDestinations({ activeOnly: 'true' })
      .then((res) => {
        if (ignore) return;
        const list = Array.isArray(res) ? res : (res?.data || []);
        const seen = new Set(STATIC_DESTINATIONS.map((c) => c.toLowerCase()));
        const extra = list
          .map((d) => d?.country?.trim())
          .filter((c) => {
            if (!c || seen.has(c.toLowerCase())) return false;
            seen.add(c.toLowerCase());
            return true;
          })
          .sort((a, b) => a.localeCompare(b));
        setExtraDestinations(extra);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  const destinationOptions = [...STATIC_DESTINATIONS, ...extraDestinations];

  // Pre-fill user data if logged in. Consultant type is locked to the
  // account's own role rather than left to self-select — a logged-in
  // student/agent/educator/university account already told us who they
  // are at signup, so re-asking (and risking a mismatched answer) adds
  // nothing. Roles with no corresponding option here (admin/super_admin/
  // developer — staff accounts booking on someone else's behalf) fall
  // through to the normal manual picker.
  const matchedConsultantType = ROLE_TO_CONSULTANT_TYPE[user?.role] || '';

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        consultantType: matchedConsultantType || prev.consultantType,
      }));
    }
  }, [user, matchedConsultantType]);

  // Arriving from a tool (e.g. the ROI Estimator) with a `?country=` param,
  // carry that context into the message instead of dropping it silently.
  useEffect(() => {
    const country = searchParams.get('country');
    if (country) {
      setFormData(prev => ({
        ...prev,
        message: prev.message || `I'd like to discuss studying in ${country}.`,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formCardRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const consultantTypes = [
    { value: 'student', label: 'Student', icon: <BookOpen size={20} className="text-primary-500" /> },
    { value: 'agent', label: 'Agent', icon: <Briefcase size={20} className="text-primary-500" /> },
    { value: 'university_representative', label: 'University/College', icon: <Landmark size={20} className="text-primary-500" /> }
  ];

  // Nothing selected yet (consultantType === '') defaults to the student
  // view — it's the common case and the fuller form, not an empty one.
  const isStudentConsultant = formData.consultantType !== 'agent' && formData.consultantType !== 'university_representative';

  const timeSlots = ['10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'];

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required';
      if (!formData.consultantType) newErrors.consultantType = 'Please select a consultant';
    } else if (step === 2) {
      if (!formData.preferredDate) newErrors.preferredDate = 'Please select a date';
      if (!formData.preferredTime) newErrors.preferredTime = 'Please pick a time slot';
      if (!formData.agreedToPrivacyPolicy) newErrors.agreedToPrivacyPolicy = 'Please agree to the Privacy Policy to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      scrollToFormTop(formCardRef.current);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    scrollToFormTop(formCardRef.current);
  };

  const onAppointmentFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({ ...prev, preferredTime: time }));
    if (errors.preferredTime) {
      setErrors(prev => ({ ...prev, preferredTime: '' }));
    }
  };

  const handleBookAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setIsSubmitting(true);

    try {
      await appointmentService.bookAppointment(formData);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      console.error('bookAppointment error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (isSuccess) {
    return <SuccessView onReset={() => {
      setIsSuccess(false);
      setCurrentStep(1);
      setFormData({
        fullName: '', email: '', phone: '', consultantType: '',
        preferredDestination: '', studyLevel: '', lastInstitution: '', academicQualification: '', englishTest: '', englishTestScore: '',
        organizationName: '', designation: '', yearsOfExperience: '',
        subject: '', preferredIntake: '',
        preferredDate: '', preferredTime: '', message: '', agreedToPrivacyPolicy: false,
      });
    }} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-ink-900">
      <Seo
        title="Book Your Free Consultation - Just Go Study"
        description="Schedule a free, personalized study abroad consultation with a Just Go Study expert. Pick a date and time that works for you and get started on your application."
      />
      {/* Hero Section, navy floating card */}
      <section className="relative mx-3 mt-3 mb-12 overflow-hidden rounded-[2rem] bg-gradient-to-b from-primary-700 via-primary-700 to-primary-600 pb-12 pt-16 sm:mx-4 sm:mt-4 sm:rounded-[2.5rem]">
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-accent-400 shadow-theme-md">
              Schedule a Meeting
            </span>
            <h1 className="mb-4 font-outfit text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Book Your <span className="text-accent-400">Free</span> Consultation
            </h1>

            {/* Progress Bar */}
            <div className="mx-auto mb-8 mt-12 max-w-md">
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= 1 ? 'text-accent-400' : 'text-primary-200'}`}>Basic Info</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= 2 ? 'text-accent-400' : 'text-primary-200'}`}>Schedule</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: currentStep === 1 ? '50%' : '100%' }}
                  className="h-full bg-accent-400 transition-all duration-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row">

          {/* Form Column */}
          <div className="flex-1">
            <div ref={formCardRef} className="rounded-3xl border border-cream-100 bg-white p-6 shadow-theme-lg md:p-10">
              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="font-outfit text-2xl font-bold text-ink-800">Tell us about yourself</h2>
                      <p className="mt-1 text-ink-500">We&apos;ll use this info to prepare for our talk.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <InputField
                        label="Full Name"
                        icon={<User size={18} />}
                        name="fullName"
                        value={formData.fullName}
                        onChange={onAppointmentFieldChange}
                        error={errors.fullName}
                        placeholder="e.g. Abdullah Rihan"
                      />
                      <InputField
                        label="Email Address"
                        icon={<Mail size={18} />}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onAppointmentFieldChange}
                        error={errors.email}
                        placeholder="hello@example.com"
                      />
                      <InputField
                        label="Phone Number"
                        icon={<Phone size={18} />}
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={onAppointmentFieldChange}
                        error={errors.phone}
                        placeholder="+880 1XXX-XXXXXX"
                      />

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
                          <Briefcase size={18} className="text-primary-500" /> Consultant Type
                        </label>
                        {matchedConsultantType && (
                          <p className="text-xs text-ink-500">Matched to your account type — contact support if this needs to change.</p>
                        )}
                        <div className="grid grid-cols-1 gap-3">
                          {consultantTypes.map((type) => (
                            <button
                              key={type.value}
                              disabled={Boolean(matchedConsultantType)}
                              onClick={() => setFormData(prev => ({ ...prev, consultantType: type.value }))}
                              className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 ${
                                formData.consultantType === type.value
                                ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-theme-md'
                                : 'border-cream-100 bg-white hover:border-primary-200'
                              } ${matchedConsultantType ? 'cursor-not-allowed opacity-80' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{type.icon}</span>
                                <span className="font-semibold">{type.label}</span>
                              </div>
                              {formData.consultantType === type.value && <CheckCircle size={18} />}
                            </button>
                          ))}
                        </div>
                        {errors.consultantType && <p className="text-xs text-red-500">{errors.consultantType}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
                          <MessageSquare size={18} className="text-primary-500" /> Subject Topic
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={onAppointmentFieldChange}
                          className="w-full cursor-pointer rounded-xl border-2 border-cream-100 bg-cream-50 px-5 py-4 text-ink-700 outline-none transition-all focus:border-primary-400"
                        >
                          <option value="">Select topic</option>
                          {SUBJECT_TOPICS.map((topic) => (
                            <option key={topic.value} value={topic.value}>{topic.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6 border-t border-cream-100 pt-8">
                      <div>
                        <h3 className="flex items-center gap-2 font-outfit text-lg font-bold text-ink-800">
                          <GraduationCap size={20} className="text-primary-500" /> Academic Background
                          <span className="rounded-full bg-cream-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-500">Optional</span>
                        </h3>
                        <p className="mt-1 text-ink-500">Helps your consultant prepare — skip anything you&apos;re not sure about yet.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
                            <Globe2 size={18} className="text-primary-500" />
                            {isStudentConsultant ? 'Preferred Study Destination' : formData.consultantType === 'agent' ? 'Countries You Place Students In' : 'Country Your Institution Is Based In'}
                          </label>
                          <select
                            name="preferredDestination"
                            value={formData.preferredDestination}
                            onChange={onAppointmentFieldChange}
                            className="w-full cursor-pointer rounded-xl border-2 border-cream-100 bg-cream-50 px-5 py-4 text-ink-700 outline-none transition-all focus:border-primary-400"
                          >
                            <option value="">Select a country</option>
                            {destinationOptions.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
                            <GraduationCap size={18} className="text-primary-500" />
                            {isStudentConsultant ? 'Desired Study Level' : formData.consultantType === 'agent' ? 'Levels You Typically Advise On' : 'Levels You Offer'}
                          </label>
                          <select
                            name="studyLevel"
                            value={formData.studyLevel}
                            onChange={onAppointmentFieldChange}
                            className="w-full cursor-pointer rounded-xl border-2 border-cream-100 bg-cream-50 px-5 py-4 text-ink-700 outline-none transition-all focus:border-primary-400"
                          >
                            <option value="">Select a level</option>
                            {STUDY_LEVELS.map((level) => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>

                        {/* The remaining fields are a student's own academic
                            history — meaningless for an Agent or University/
                            College rep booking on a student's behalf, so
                            they're swapped for a single relevant field
                            instead of showing an empty "Academic
                            Qualification" box next to someone who isn't a
                            student. Backend field names (lastInstitution,
                            academicQualification, englishTest/Score) are
                            unchanged — only the label/visibility is
                            role-aware, so no schema change was needed. */}
                        {isStudentConsultant ? (
                          <>
                            <InputField
                              label="Last Education Institution"
                              icon={<Landmark size={18} />}
                              name="lastInstitution"
                              value={formData.lastInstitution}
                              onChange={onAppointmentFieldChange}
                              placeholder="e.g. Dhaka College"
                            />

                            <InputField
                              label="Academic Qualification"
                              icon={<BookOpen size={18} />}
                              name="academicQualification"
                              value={formData.academicQualification}
                              onChange={onAppointmentFieldChange}
                              placeholder="Exp: HSC: GPA-4, City College, 2024"
                            />

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
                                <Calendar size={18} className="text-primary-500" /> Preferred Intake
                              </label>
                              <select
                                name="preferredIntake"
                                value={formData.preferredIntake}
                                onChange={onAppointmentFieldChange}
                                className="w-full cursor-pointer rounded-xl border-2 border-cream-100 bg-cream-50 px-5 py-4 text-ink-700 outline-none transition-all focus:border-primary-400"
                              >
                                <option value="">Select an intake</option>
                                {INTAKES.map((intake) => (
                                  <option key={intake} value={intake}>{intake}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
                                <Languages size={18} className="text-primary-500" /> English Proficiency Test
                              </label>
                              <select
                                name="englishTest"
                                value={formData.englishTest}
                                onChange={onAppointmentFieldChange}
                                className="w-full cursor-pointer rounded-xl border-2 border-cream-100 bg-cream-50 px-5 py-4 text-ink-700 outline-none transition-all focus:border-primary-400"
                              >
                                <option value="">Select if available</option>
                                {ENGLISH_TESTS.map((test) => (
                                  <option key={test} value={test}>{test}</option>
                                ))}
                              </select>
                              <p className="text-xs text-ink-500">(MOI Accepted)</p>
                            </div>

                            <InputField
                              label="Score"
                              icon={<Award size={18} />}
                              name="englishTestScore"
                              value={formData.englishTestScore}
                              onChange={onAppointmentFieldChange}
                              placeholder="e.g. 6.5 or 90"
                            />
                          </>
                        ) : (
                          <>
                            <InputField
                              label={formData.consultantType === 'agent' ? 'Agency / Company Name' : 'University / College Name'}
                              icon={<Landmark size={18} />}
                              name="organizationName"
                              value={formData.organizationName}
                              onChange={onAppointmentFieldChange}
                              placeholder={formData.consultantType === 'agent' ? 'e.g. Bright Future Consultancy' : 'e.g. ABC University'}
                            />

                            <InputField
                              label="Your Designation"
                              icon={<Briefcase size={18} />}
                              name="designation"
                              value={formData.designation}
                              onChange={onAppointmentFieldChange}
                              placeholder={formData.consultantType === 'agent' ? 'e.g. Senior Counselor' : 'e.g. International Admissions Officer'}
                            />

                            {formData.consultantType === 'agent' && (
                              <InputField
                                label="Years of Experience"
                                icon={<Award size={18} />}
                                name="yearsOfExperience"
                                value={formData.yearsOfExperience}
                                onChange={onAppointmentFieldChange}
                                placeholder="e.g. 3 years"
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={nextStep}
                      className="group flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 py-4 font-bold text-white shadow-theme-md transition-all hover:bg-accent-600 hover:shadow-theme-lg"
                    >
                      Continue to Schedule
                      <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <button onClick={prevStep} className="mb-4 flex items-center gap-1 font-semibold text-primary-600 hover:underline">
                        <ChevronLeft size={18} /> Back to info
                      </button>
                      <h2 className="font-outfit text-2xl font-bold text-ink-800">Pick a time that works</h2>
                      <p className="mt-1 text-ink-500">Select your preferred date and available hour.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
                          <Calendar size={18} className="text-primary-500" /> Select Date
                        </label>
                        <input
                          type="date"
                          name="preferredDate"
                          min={today}
                          value={formData.preferredDate}
                          onChange={onAppointmentFieldChange}
                          className={`w-full rounded-2xl border-2 px-6 py-4 ${errors.preferredDate ? 'border-red-500' : 'border-cream-100'} bg-cream-50 outline-none transition-all focus:border-primary-400`}
                        />
                        {errors.preferredDate && <p className="text-xs text-red-500">{errors.preferredDate}</p>}
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
                          <Clock size={18} className="text-primary-500" /> Available Slots
                        </label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => handleTimeSelect(slot)}
                              className={`rounded-xl border-2 py-3 font-semibold transition-all ${
                                formData.preferredTime === slot
                                ? 'border-primary-600 bg-primary-600 text-white shadow-theme-md'
                                : 'border-cream-100 text-ink-600 hover:border-primary-200'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                        {errors.preferredTime && <p className="text-xs text-red-500">{errors.preferredTime}</p>}
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
                          <MessageSquare size={18} className="text-primary-500" /> Anything you&apos;d like us to know?
                        </label>
                        <textarea
                          name="message"
                          rows="3"
                          value={formData.message}
                          onChange={onAppointmentFieldChange}
                          placeholder="Tell us about your educational goals, budget, or any question you have."
                          className="w-full resize-none rounded-2xl border-2 border-cream-100 bg-cream-50 px-6 py-4 outline-none transition-all focus:border-primary-400"
                        ></textarea>
                      </div>

                      <div className="space-y-2">
                        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-700">
                          <input
                            type="checkbox"
                            name="agreedToPrivacyPolicy"
                            checked={formData.agreedToPrivacyPolicy}
                            onChange={onAppointmentFieldChange}
                            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-2 border-cream-200 text-primary-600 focus:ring-primary-400"
                          />
                          <span>
                            I agree to the <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 underline hover:text-primary-700">Privacy Policy</Link> and consent to being contacted by {companyData.name} about any inquiry.
                          </span>
                        </label>
                        {errors.agreedToPrivacyPolicy && <p className="text-xs text-red-500">{errors.agreedToPrivacyPolicy}</p>}
                      </div>
                    </div>

                    <button
                      onClick={handleBookAppointmentSubmit}
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 py-4 font-bold text-white shadow-theme-md transition-all hover:bg-accent-600 hover:shadow-theme-lg disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <SvgSpinner />
                          Confirming...
                        </>
                      ) : (
                        <>
                          Confirm Appointment
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: SVG timeline + Summary Card */}
          <div className="lg:w-80">
            <div className="sticky top-10 space-y-6">
              <div className="rounded-3xl border border-cream-100 bg-white p-6 shadow-theme-md">
                <h3 className="mb-4 font-outfit text-lg font-bold text-ink-900">Your Progress</h3>
                <TimelineSVG currentStep={currentStep} />
              </div>
              <SummaryCard appointmentData={formData} />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

const InputField = ({ label, icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
      <span className="text-primary-500">{icon}</span> {label}
    </label>
    <input
      {...props}
      className={`w-full rounded-xl border-2 px-5 py-4 ${error ? 'border-red-500' : 'border-cream-100'} bg-cream-50 outline-none transition-all placeholder:text-ink-500 focus:border-primary-400`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const SummaryCard = ({ appointmentData }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative overflow-hidden rounded-3xl bg-primary-600 p-8 text-white shadow-theme-lg"
  >
    {/* Background Decorative Circles */}
    <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-2xl"></div>
    <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary-400/20 blur-2xl"></div>

    <div className="relative z-10">
      <h3 className="mb-6 flex items-center gap-2 font-outfit text-xl font-bold">
        <CheckCircle size={24} className="text-accent-400" /> Appointment Summary
      </h3>

      <div className="space-y-5">
        <div className={`rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-opacity ${appointmentData.fullName ? 'opacity-100' : 'opacity-40'}`}>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-accent-400">Consultant For</p>
          <p className="truncate font-semibold">{appointmentData.fullName || 'Waiting for name...'}</p>
        </div>

        <div className={`rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-opacity ${appointmentData.preferredDate ? 'opacity-100' : 'opacity-40'}`}>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-accent-400">Selected Date</p>
          <p className="font-semibold">{appointmentData.preferredDate ? new Date(appointmentData.preferredDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No date selected'}</p>
        </div>

        <div className={`rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-opacity ${appointmentData.preferredTime ? 'opacity-100' : 'opacity-40'}`}>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-accent-400">Time Slot</p>
          <p className="font-semibold">{appointmentData.preferredTime || 'No time picked'}</p>
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-secondary-400/20 p-1">
            <Check size={14} className="text-secondary-300" />
          </div>
          <span className="text-sm font-medium">Instant Confirmation</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-secondary-400/20 p-1">
            <Check size={14} className="text-secondary-300" />
          </div>
          <span className="text-sm font-medium">24/7 Support</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const SuccessView = ({ onReset }) => (
  <div className="flex min-h-screen items-center justify-center bg-white p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md rounded-3xl border border-primary-50 bg-white p-10 text-center shadow-theme-lg"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
        >
          <Check size={40} strokeWidth={3} />
        </motion.div>
      </div>
      <h2 className="mb-2 font-outfit text-3xl font-bold text-ink-900">Request Received!</h2>
      <p className="mb-8 leading-relaxed text-ink-500">
        We&apos;ve received your appointment request. One of our experts will contact you shortly via email.
      </p>
      <button
        onClick={onReset}
        className="w-full rounded-full bg-primary-600 py-4 font-bold text-white shadow-theme-md transition-all hover:bg-primary-500"
      >
        Return to Form
      </button>
    </motion.div>
  </div>
);

export default BookAppointment;
