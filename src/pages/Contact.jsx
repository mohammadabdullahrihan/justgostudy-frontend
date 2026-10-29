import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import {
  Users, Building2, Globe, Clock, Mail, Phone, MapPin, Headphones,
  Check, ChevronDown, Lock, GraduationCap, Navigation,
  Plus, Shield, Award, Star, Handshake, LifeBuoy, Landmark, Languages, BookOpen,
  Briefcase, CheckCircle, Calendar,
} from 'lucide-react';
import { WhatsappIcon, MessengerIcon, FacebookIcon } from '../components/common/BrandIcons';
import Seo from '../components/common/Seo';
import { companyData } from '../constants/companyData';
import { contactData } from '../constants/pageContent';
import { getDestinations, createConsultation } from '../services/studyService';
import successService from '../services/successService';
import * as faqService from '../services/faqService';
import { buildFaqSchema } from '../utils/seoSchemas';
import { useAuth } from '../context/AuthContext';
import { FALLBACK_STUDENTS_PLACED, FALLBACK_PARTNER_UNIVERSITIES, FALLBACK_COUNTRIES_COVERED } from '../constants/successStats';
import { formatStatValue } from './success/icons.jsx';

// Mirrors BookAppointment.jsx's own role → consultant-type setup, so a
// logged-in student/agent/university account sees the same locked,
// account-matched selector on both forms rather than two different
// behaviors for what's conceptually the same question.
const ROLE_TO_CONSULTANT_TYPE = {
  student: 'student',
  agent: 'agent',
  university: 'university_representative',
};

const consultantTypes = [
  { value: 'student', label: 'Student', icon: <BookOpen size={20} className="text-primary-500" /> },
  { value: 'agent', label: 'Agent', icon: <Briefcase size={20} className="text-primary-500" /> },
  { value: 'university_representative', label: 'University/College', icon: <Landmark size={20} className="text-primary-500" /> },
];

const INTAKES = ['Fall 2026', 'Spring 2027', 'Summer 2027', 'Fall 2027', 'Not Decided Yet'];

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Curated countries shown first, in this order; any other active destination
// from the backend is appended after these, same pattern as the site
// footer, so the brand card isn't stuck showing only 6 countries forever.
const STATIC_DESTINATIONS = ['UK', 'Canada', 'Australia', 'Germany', 'USA', 'Malaysia'];

const STUDY_LEVELS = ["Bachelor's Degree", "Master's Degree", 'PhD', 'Diploma / Foundation', 'Language Course', 'Other'];

const ENGLISH_TESTS = ['IELTS', 'TOEFL iBT', 'PTE Academic', 'Duolingo English Test', 'MOI (Medium of Instruction)', 'Not Taken Yet'];

/* ── SVG focus underline drawn under a form field ── */
const FieldUnderline = () => (
  <svg
    className="pointer-events-none absolute -bottom-px left-3 h-[3px] w-[calc(100%-1.5rem)]"
    viewBox="0 0 100 3"
    preserveAspectRatio="none"
    fill="none"
    aria-hidden="true"
  >
    {/* hidden by default via inline dash so freshly remounted forms start clean */}
    <path
      className="field-underline"
      pathLength="1"
      d="M0 1.5 H100"
      stroke="#3454e5"
      strokeWidth="3"
      strokeLinecap="round"
      style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
    />
  </svg>
);

/* ── abstract geometric shapes floating in the hero ──
   Each shape is a wrapper (`.hero-shape`, positioned + sized) around an inner
   `.hero-shape-inner` svg. The infinite float/rotate tween runs on the
   wrapper; the mouse-parallax quickTo runs on the inner element. Keeping
   them on separate DOM nodes is load-bearing: GSAP's overwrite manager kills
   a tween's control of a property when a second tween targets the same
   property on the same element, so having both animate `y`/`x` on the same
   node made them fight every frame (visible as a jittery "shake"). */
const HeroShapes = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {/* big outline circle */}
    <div className="hero-shape absolute -right-16 top-10 h-64 w-64" data-depth="0.6">
      <svg className="hero-shape-inner h-full w-full" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="96" stroke="#aebbf4" strokeWidth="2" strokeDasharray="6 10" />
      </svg>
    </div>
    {/* filled soft circle */}
    <div className="hero-shape absolute left-[8%] top-24 h-24 w-24" data-depth="1.4">
      <svg className="hero-shape-inner h-full w-full" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="50" fill="#e8ecfc" />
        <circle cx="50" cy="50" r="24" fill="#d2d9f9" />
      </svg>
    </div>
    {/* triangle */}
    <div className="hero-shape absolute left-[22%] bottom-16 h-16 w-16" data-depth="2">
      <svg className="hero-shape-inner h-full w-full" viewBox="0 0 100 100" fill="none">
        <path d="M50 8 L92 88 L8 88 Z" stroke="#3ed1ae" strokeWidth="5" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
    {/* rotated square */}
    <div className="hero-shape absolute right-[20%] top-16 h-14 w-14" data-depth="1.8">
      <svg className="hero-shape-inner h-full w-full" viewBox="0 0 100 100" fill="none">
        <rect x="20" y="20" width="60" height="60" rx="12" transform="rotate(18 50 50)" stroke="#f7a730" strokeWidth="5" />
      </svg>
    </div>
    {/* donut */}
    <div className="hero-shape absolute bottom-24 right-[10%] h-20 w-20" data-depth="1.2">
      <svg className="hero-shape-inner h-full w-full" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="34" stroke="#788ded" strokeWidth="14" />
      </svg>
    </div>
    {/* plus sign */}
    <div className="hero-shape absolute left-[42%] top-12 h-10 w-10" data-depth="2.4">
      <svg className="hero-shape-inner h-full w-full" viewBox="0 0 100 100" fill="none">
        <path d="M50 14 V86 M14 50 H86" stroke="#6fe6c7" strokeWidth="12" strokeLinecap="round" />
      </svg>
    </div>
    {/* small dots cluster */}
    <div className="hero-shape absolute bottom-10 left-[55%] h-16 w-24" data-depth="1">
      <svg className="hero-shape-inner h-full w-full" viewBox="0 0 120 80" fill="#aebbf4">
        {[0, 30, 60, 90].map((x) =>
          [0, 30, 60].map((y) => <circle key={`${x}-${y}`} cx={x + 6} cy={y + 6} r="4" />)
        )}
      </svg>
    </div>
  </div>
);

const trustBadgeIcons = { shield: Shield, certificate: Award, star: Star, handshake: Handshake };

const supportChannels = [
  {
    icon: GraduationCap,
    title: 'In-Person Counseling',
    description: 'Visit our counseling center in Dhaka to plan your academic path in person with senior mentors.',
    rows: [
      { label: 'Days', value: 'Sat – Thu (Closed Fridays)' },
      { label: 'Hours', value: '10:00 AM – 6:30 PM (BST)' },
    ],
  },
  {
    icon: Headphones,
    title: 'Digital & Phone Support',
    description: 'Get immediate answers to your queries via phone, WhatsApp, or email.',
    rows: [
      { label: 'Hotline & WhatsApp', value: 'Sat – Thu, 9:00 AM – 8:00 PM' },
      { label: 'Email Support', value: 'Within 24 business hours' },
    ],
  },
  {
    icon: LifeBuoy,
    title: 'Emergency Post-Arrival Support',
    description: 'For enrolled students who have just landed in their destination country, we run an emergency line to help with accommodation and campus registration issues.',
    rows: [],
  },
];

/* ── component ── */
const Contact = () => {
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', subject: '', consultantType: '', message: '', agree: false,
    preferredDestination: '', studyLevel: '', lastInstitution: '', academicQualification: '', englishTest: '', englishTestScore: '',
    preferredIntake: '', organizationName: '', designation: '', yearsOfExperience: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [extraDestinations, setExtraDestinations] = useState([]);
  const [studentsGuided, setStudentsGuided] = useState(FALLBACK_STUDENTS_PLACED);
  const [partnerUniversities, setPartnerUniversities] = useState(FALLBACK_PARTNER_UNIVERSITIES);
  const [countriesCovered, setCountriesCovered] = useState(FALLBACK_COUNTRIES_COVERED);
  const [dbFaqs, setDbFaqs] = useState([]);

  // Same admin-managed source the home Stats section uses, so these proof
  // numbers never drift from the real, current counts.
  useEffect(() => {
    let ignore = false;
    successService
      .getAllSuccess()
      .then((res) => {
        if (ignore) return;
        const stat = res?.data?.find((s) => /student/i.test(s.title || ''));
        if (stat?.value) setStudentsGuided(stat.value);
        const uniStat = res?.data?.find((s) => /universit/i.test(s.title || ''));
        if (uniStat?.value) setPartnerUniversities(uniStat.value);
        const countryStat = res?.data?.find((s) => /countr/i.test(s.title || ''));
        if (countryStat?.value) setCountriesCovered(countryStat.value);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  // Admin-managed FAQs (category "contact"), replacing the old static list.
  useEffect(() => {
    let ignore = false;
    faqService.getFaqs({ activeOnly: 'true', category: 'contact' })
      .then((data) => { if (!ignore && Array.isArray(data)) setDbFaqs(data); })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    getDestinations({ activeOnly: 'true' })
      .then((res) => {
        if (ignore) return;
        const list = Array.isArray(res) ? res : (res?.data || []);
        const seen = new Set(STATIC_DESTINATIONS.map((c) => c.toLowerCase()));
        const extra = list
          .map((d) => d?.country?.trim())
          .filter((country) => {
            if (!country) return false;
            const key = country.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a, b) => a.localeCompare(b));
        setExtraDestinations(extra);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  const destinationCountries = [...STATIC_DESTINATIONS, ...extraDestinations];

  // Pre-fill + lock consultant type to the logged-in account's own role,
  // same reasoning as BookAppointment.jsx: a student/agent/university
  // account already told us who they are at signup, so don't re-ask.
  const matchedConsultantType = ROLE_TO_CONSULTANT_TYPE[user?.role] || '';
  useEffect(() => {
    if (user) {
      const [first = '', ...rest] = (user.name || '').split(' ');
      setFormData((p) => ({
        ...p,
        firstName: p.firstName || first,
        lastName: p.lastName || rest.join(' '),
        email: user.email || p.email,
        consultantType: matchedConsultantType || p.consultantType,
      }));
    }
  }, [user, matchedConsultantType]);

  // Nothing selected yet defaults to the student view — the common case
  // and the fuller form, not an empty one.
  const isStudentConsultant = formData.consultantType !== 'agent' && formData.consultantType !== 'university_representative';

  const onContactFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createConsultation(formData);
      setSubmitted(true);
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', subject: '', consultantType: '', message: '', agree: false,
        preferredDestination: '', studyLevel: '', lastInstitution: '', academicQualification: '', englishTest: '', englishTestScore: '',
        preferredIntake: '', organizationName: '', designation: '', yearsOfExperience: '',
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

      /* hero heading, word-by-word rise */
      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });
      gsap.from(split.words, { y: 60, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' });
      gsap.from('.hero-sub', { opacity: 0, y: 24, duration: 0.7, delay: 0.6, ease: 'power2.out' });

      /* hero shapes, infinite float + slow spin (runs on the wrapper) */
      const shapes = gsap.utils.toArray('.hero-shape');
      gsap.set(shapes, { willChange: 'transform' });
      shapes.forEach((shapeEl, i) => {
        gsap.from(shapeEl, { opacity: 0, scale: 0.6, duration: 0.8, delay: 0.3 + i * 0.08, ease: 'back.out(1.7)' });
        gsap.to(shapeEl, {
          y: i % 2 === 0 ? -18 : 14,
          rotation: i % 3 === 0 ? 12 : -10,
          duration: 4 + i * 0.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1 + i * 0.2,
        });
      });

      /* mouse parallax, deeper shapes move more (runs on the inner element,
         so it never fights the wrapper's float/rotate tween for the same
         transform properties, see the HeroShapes comment above) */
      const movers = shapes.map((shapeEl) => {
        const inner = shapeEl.querySelector('.hero-shape-inner');
        gsap.set(inner, { willChange: 'transform' });
        return {
          depth: parseFloat(shapeEl.dataset.depth) || 1,
          xTo: gsap.quickTo(inner, 'x', { duration: 0.9, ease: 'power3.out' }),
          yTo: gsap.quickTo(inner, 'y', { duration: 0.9, ease: 'power3.out' }),
        };
      });
      const onHeroMove = (e) => {
        const relX = (e.clientX / window.innerWidth - 0.5) * 2;
        const relY = (e.clientY / window.innerHeight - 0.5) * 2;
        movers.forEach(({ depth, xTo, yTo }) => {
          xTo(relX * 12 * depth);
          yTo(relY * 10 * depth);
        });
      };
      heroRef.current.addEventListener('mousemove', onHeroMove);

      /* scroll reveals, every [data-reveal] group staggers in */
      gsap.utils.toArray('[data-reveal]').forEach((group) => {
        const targets = group.hasAttribute('data-reveal-children') ? group.children : [group];
        gsap.set(targets, { opacity: 0, y: 40 });
        ScrollTrigger.create({
          trigger: group,
          start: 'top 82%',
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              // release the inline transform so CSS hover lifts work
              onComplete: () => gsap.set(targets, { clearProps: 'transform' }),
            }),
        });
      });

      /* form focus underlines, draw out from the left on focus.
         Delegated from the page root so the listeners survive the
         form <-> success-message swap after submit. */
      const setUnderline = (target, drawn) => {
        const path = target.closest?.('.field-wrap')?.querySelector('.field-underline');
        if (!path) return;
        if (drawn) {
          gsap.set(path, { strokeDasharray: 1 });
          gsap.to(path, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' });
        } else {
          gsap.to(path, { strokeDashoffset: 1, duration: 0.35, ease: 'power2.in' });
        }
      };
      const onFocusIn = (e) => setUnderline(e.target, true);
      const onFocusOut = (e) => setUnderline(e.target, false);
      const pageEl = pageRef.current;
      pageEl.addEventListener('focusin', onFocusIn);
      pageEl.addEventListener('focusout', onFocusOut);

      /* submit button, paper plane glides right on hover (delegated) */
      const onOver = (e) => {
        const btn = e.target.closest?.('.submit-btn');
        if (!btn || btn.contains(e.relatedTarget)) return;
        const plane = btn.querySelector('.submit-plane');
        if (plane) gsap.to(plane, { x: 7, y: -4, rotation: 12, duration: 0.4, ease: 'power2.out' });
      };
      const onOut = (e) => {
        const btn = e.target.closest?.('.submit-btn');
        if (!btn || btn.contains(e.relatedTarget)) return;
        const plane = btn.querySelector('.submit-plane');
        if (plane) gsap.to(plane, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      };
      pageEl.addEventListener('mouseover', onOver);
      pageEl.addEventListener('mouseout', onOut);

      return () => {
        split.revert();
        heroRef.current?.removeEventListener('mousemove', onHeroMove);
        pageEl.removeEventListener('focusin', onFocusIn);
        pageEl.removeEventListener('focusout', onFocusOut);
        pageEl.removeEventListener('mouseover', onOver);
        pageEl.removeEventListener('mouseout', onOut);
      };
    },
    { scope: pageRef }
  );

  /* ── transformed data ── */
  const stats = [
    { icon: Users, value: formatStatValue(studentsGuided), label: 'Students Guided' },
    { icon: Building2, value: partnerUniversities, label: 'Universities We Work With' },
    { icon: Globe, value: countriesCovered, label: 'Countries Covered' },
    { icon: Clock, value: '< 24h', label: 'Response Time' },
  ];

  const infoItems = [
    { icon: Mail, label: 'Email Us', value: companyData.email, href: `mailto:${companyData.email}` },
    { icon: Phone, label: 'Call Us', value: companyData.phone, href: `tel:${companyData.phone}` },
    { icon: MapPin, label: 'Visit Us', value: companyData.address, href: null },
    { icon: Clock, label: 'Office Hours', value: companyData.officeHours, href: null },
  ];

  const socialLinks = [
    { icon: WhatsappIcon, label: 'WhatsApp', href: 'https://wa.me/8801901366830', color: 'bg-secondary-500 hover:bg-secondary-600' },
    { icon: MessengerIcon, label: 'Messenger', href: 'https://www.facebook.com/messages/t/61578782754835', color: 'bg-primary-400 hover:bg-primary-500' },
    { icon: FacebookIcon, label: 'Facebook', href: companyData.socialLinks.facebook, color: 'bg-primary-600 hover:bg-primary-700' },
  ];

  const faqs = dbFaqs.map((faq) => ({ q: faq.question, a: faq.answer }));

  const inputClasses =
    'w-full rounded-xl border border-ink-100 bg-cream-50 px-4 py-3 text-ink-900 placeholder-ink-300 outline-none transition-all focus:border-primary-400 focus:shadow-focus-ring';

  return (
    <div ref={pageRef} className="min-h-screen overflow-x-hidden bg-cream-50">
      <Seo
        title="Contact Us - Just Go Study"
        description={`Get in touch with Just Go Study's education consultants in ${companyData.addressLocality}. Call, email, or book a free consultation.`}
        schema={buildFaqSchema(faqs)}
      />

      {/* ══ HERO, navy floating card ══ */}
      <div
        ref={heroRef}
        className="relative mx-3 mt-3 overflow-hidden rounded-[2rem] bg-gradient-to-b from-primary-700 via-primary-700 to-primary-600 pb-20 pt-20 sm:mx-4 sm:mt-4 sm:rounded-[2.5rem]"
      >
        <HeroShapes />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1
            ref={headingRef}
            className="mb-5 font-outfit text-5xl font-bold leading-[1.15] text-white md:text-6xl"
          >
            Let&apos;s Chat, <span className="text-accent-400">Reach Out</span> to Us
          </h1>

          <p className="hero-sub mx-auto max-w-lg text-lg text-primary-100">
            Have questions or feedback? We&apos;re here to help. Send us a message and we&apos;ll respond within 24 hours.
          </p>
        </div>
      </div>

      {/* ══ STATS BAR ══ */}
      <div className="relative z-10 mx-auto mb-6 mt-10 max-w-6xl px-4 sm:px-6">
        <div data-reveal data-reveal-children className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-primary-700 p-5 text-center shadow-theme-md transition-all duration-300 hover:-translate-y-1 hover:shadow-theme-lg"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <s.icon className="h-[18px] w-[18px] text-accent-400" />
              </div>
              <p className="font-outfit text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-0.5 text-xs text-accent-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ TRUST BADGES ══ */}
      <div className="relative z-10 mx-auto mb-16 max-w-5xl px-4 sm:px-6">
        <div data-reveal data-reveal-children className="flex flex-wrap items-center justify-center gap-3">
          {contactData.trustBadges.map((badge) => {
            const BadgeIcon = trustBadgeIcons[badge.icon] || Shield;
            return (
              <div
                key={badge.text}
                className="flex items-center gap-2.5 rounded-full border border-primary-50 bg-white px-4 py-2.5 shadow-theme-sm"
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                  <BadgeIcon className="h-3.5 w-3.5 text-primary-600" />
                </div>
                <span className="text-xs font-semibold text-ink-700">{badge.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ MAIN SPLIT ══ */}
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_400px]">

          {/* ── LEFT: FORM ── */}
          <div data-reveal className="rounded-3xl border border-primary-50 bg-white p-8 shadow-theme-lg lg:p-10">
            <div className="mb-8">
              <h2 className="mb-2 font-outfit text-3xl font-bold text-ink-900">Send us a Message</h2>
              <p className="text-ink-500">Fill out the form and we&apos;ll get back to you within 24 hours.</p>
            </div>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-2xl border border-secondary-200 bg-gradient-to-br from-secondary-50 to-secondary-100 p-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.1 }}
                    className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary-400 to-secondary-500 shadow-theme-lg"
                  >
                    <Check className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="mb-2 font-outfit text-2xl font-bold text-ink-900">Message Sent!</h3>
                  <p className="text-sm text-ink-500">Our team will reach out to you shortly. Check your email!</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleContactSubmit}
                  className="space-y-5"
                >
                  {/* name row */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[['firstName', 'First Name', 'John'], ['lastName', 'Last Name', 'Doe']].map(([name, label, ph]) => (
                      <div key={name}>
                        <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
                        <div className="field-wrap relative">
                          <input type="text" name={name} value={formData[name]} onChange={onContactFieldChange} required placeholder={ph} className={inputClasses} />
                          <FieldUnderline />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink-700">Email Address</label>
                    <div className="field-wrap relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-500" />
                      <input type="email" name="email" value={formData.email} onChange={onContactFieldChange} required placeholder="john@example.com" className={`${inputClasses} pl-10`} />
                      <FieldUnderline />
                    </div>
                  </div>

                  {/* phone + subject */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink-700">Phone</label>
                      <div className="field-wrap relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-500" />
                        <input type="tel" name="phone" value={formData.phone} onChange={onContactFieldChange} placeholder="+880 1XXX-XXXXXX" className={`${inputClasses} pl-10`} />
                        <FieldUnderline />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink-700">Subject</label>
                      <div className="field-wrap relative">
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={onContactFieldChange}
                          required
                          className={`${inputClasses} cursor-pointer appearance-none text-ink-700`}
                        >
                          <option value="">Select topic</option>
                          <option value="general">General Inquiry</option>
                          <option value="admission">Admission Support</option>
                          <option value="visa">Visa Assistance</option>
                          <option value="scholarship">Scholarship Info</option>
                          <option value="course_information">Course Information</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-500" />
                        <FieldUnderline />
                      </div>
                    </div>
                  </div>

                  {/* consultant type */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink-700">
                      <Briefcase size={16} className="text-primary-500" /> I am a...
                    </label>
                    {matchedConsultantType && (
                      <p className="mb-2 text-xs text-ink-400">Matched to your account type — contact support if this needs to change.</p>
                    )}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {consultantTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          disabled={Boolean(matchedConsultantType)}
                          onClick={() => setFormData((p) => ({ ...p, consultantType: type.value }))}
                          className={`flex items-center justify-between gap-2 rounded-xl border-2 p-3 transition-all duration-200 ${
                            formData.consultantType === type.value
                              ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-theme-sm'
                              : 'border-ink-100 bg-white hover:border-primary-200'
                          } ${matchedConsultantType ? 'cursor-not-allowed opacity-80' : ''}`}
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold">{type.icon}{type.label}</span>
                          {formData.consultantType === type.value && <CheckCircle size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* academic background, optional */}
                  <div className="border-t border-ink-100 pt-5">
                    <p className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-500">
                      Academic Background <span className="font-normal normal-case text-ink-400">(optional)</span>
                    </p>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink-700">Preferred Study Destination</label>
                        <div className="field-wrap relative">
                          <select
                            name="preferredDestination"
                            value={formData.preferredDestination}
                            onChange={onContactFieldChange}
                            className={`${inputClasses} cursor-pointer appearance-none text-ink-700`}
                          >
                            <option value="">Select a country</option>
                            {destinationCountries.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-500" />
                          <FieldUnderline />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink-700">Desired Study Level</label>
                        <div className="field-wrap relative">
                          <select
                            name="studyLevel"
                            value={formData.studyLevel}
                            onChange={onContactFieldChange}
                            className={`${inputClasses} cursor-pointer appearance-none text-ink-700`}
                          >
                            <option value="">Select a level</option>
                            {STUDY_LEVELS.map((level) => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-500" />
                          <FieldUnderline />
                        </div>
                      </div>

                      {isStudentConsultant ? (
                        <>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-ink-700">Last Education Institution</label>
                            <div className="field-wrap relative">
                              <Landmark className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-500" />
                              <input
                                type="text"
                                name="lastInstitution"
                                value={formData.lastInstitution}
                                onChange={onContactFieldChange}
                                placeholder="e.g. Dhaka College"
                                className={`${inputClasses} pl-10`}
                              />
                              <FieldUnderline />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-ink-700">Academic Qualification</label>
                            <div className="field-wrap relative">
                              <BookOpen className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-500" />
                              <input
                                type="text"
                                name="academicQualification"
                                value={formData.academicQualification}
                                onChange={onContactFieldChange}
                                placeholder="Exp: HSC: GPA-4, City College, 2024"
                                className={`${inputClasses} pl-10`}
                              />
                              <FieldUnderline />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-ink-700">Preferred Intake</label>
                            <div className="field-wrap relative">
                              <Calendar className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-500" />
                              <select
                                name="preferredIntake"
                                value={formData.preferredIntake}
                                onChange={onContactFieldChange}
                                className={`${inputClasses} cursor-pointer appearance-none pl-10 text-ink-700`}
                              >
                                <option value="">Select an intake</option>
                                {INTAKES.map((intake) => (
                                  <option key={intake} value={intake}>{intake}</option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-500" />
                              <FieldUnderline />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-ink-700">English Proficiency Test</label>
                            <div className="field-wrap relative">
                              <Languages className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-500" />
                              <select
                                name="englishTest"
                                value={formData.englishTest}
                                onChange={onContactFieldChange}
                                className={`${inputClasses} cursor-pointer appearance-none pl-10 text-ink-700`}
                              >
                                <option value="">Select if available</option>
                                {ENGLISH_TESTS.map((test) => (
                                  <option key={test} value={test}>{test}</option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-500" />
                              <FieldUnderline />
                            </div>
                            <p className="mt-1.5 text-xs text-ink-500">(MOI Accepted)</p>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-ink-700">Score</label>
                            <div className="field-wrap relative">
                              <Award className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-500" />
                              <input
                                type="text"
                                name="englishTestScore"
                                value={formData.englishTestScore}
                                onChange={onContactFieldChange}
                                placeholder="e.g. 6.5 or 90"
                                className={`${inputClasses} pl-10`}
                              />
                              <FieldUnderline />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-ink-700">
                              {formData.consultantType === 'agent' ? 'Agency / Company Name' : 'University / College Name'}
                            </label>
                            <div className="field-wrap relative">
                              <Landmark className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-500" />
                              <input
                                type="text"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={onContactFieldChange}
                                placeholder={formData.consultantType === 'agent' ? 'e.g. Bright Future Consultancy' : 'e.g. ABC University'}
                                className={`${inputClasses} pl-10`}
                              />
                              <FieldUnderline />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-ink-700">Your Designation</label>
                            <div className="field-wrap relative">
                              <Briefcase className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-500" />
                              <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={onContactFieldChange}
                                placeholder={formData.consultantType === 'agent' ? 'e.g. Senior Counselor' : 'e.g. International Admissions Officer'}
                                className={`${inputClasses} pl-10`}
                              />
                              <FieldUnderline />
                            </div>
                          </div>

                          {formData.consultantType === 'agent' && (
                            <div>
                              <label className="mb-1.5 block text-sm font-medium text-ink-700">Years of Experience</label>
                              <div className="field-wrap relative">
                                <Award className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-500" />
                                <input
                                  type="text"
                                  name="yearsOfExperience"
                                  value={formData.yearsOfExperience}
                                  onChange={onContactFieldChange}
                                  placeholder="e.g. 3 years"
                                  className={`${inputClasses} pl-10`}
                                />
                                <FieldUnderline />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* message */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink-700">Message</label>
                    <div className="field-wrap relative">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={onContactFieldChange}
                        required
                        rows={4}
                        placeholder="Tell us about your educational goals…"
                        className={`${inputClasses} resize-none`}
                      />
                      <FieldUnderline />
                    </div>
                  </div>

                  {/* agree */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agree"
                      name="agree"
                      checked={formData.agree}
                      onChange={onContactFieldChange}
                      required
                      className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-ink-200 accent-primary-600"
                    />
                    <label htmlFor="agree" className="cursor-pointer text-sm leading-relaxed text-ink-500">
                      I agree to the <a href="/privacy-policy" className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-500">privacy policy</a> and consent to being contacted.
                    </label>
                  </div>

                  {/* submit, paper plane slides on hover */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="submit-btn flex w-full items-center justify-center gap-2.5 rounded-full bg-accent-500 py-4 text-[15px] font-semibold text-white shadow-theme-md transition-colors duration-300 hover:bg-accent-600 hover:shadow-theme-lg disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg className="submit-plane h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>

                  {/* trust line */}
                  <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-ink-500">
                    <Lock className="h-3 w-3 text-ink-500" /> Your data is safe &amp; never shared.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: INFO PANEL ── */}
          <div className="space-y-5">

            {/* brand card */}
            <div data-reveal className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-theme-lg">
              {[220, 340, 460].map((size, i) => (
                <div
                  key={size}
                  className="pointer-events-none absolute rounded-full border-[40px] border-white"
                  style={{ width: size, height: size, top: -size * 0.3, right: -size * 0.3, opacity: 0.08 + i * 0.02 }}
                />
              ))}
              <div className="relative z-10">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-theme-md backdrop-blur-md">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-1 font-outfit text-xl font-bold">Just Go Study</h3>
                <p className="mb-5 text-sm text-primary-200">Helping you study abroad</p>
                <div className="flex flex-wrap gap-2">
                  {destinationCountries.map((c) => (
                    <span key={c} className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-medium">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* info cards */}
            <div data-reveal data-reveal-children className="space-y-3">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="flex cursor-default items-center gap-4 rounded-2xl border border-primary-50 bg-white p-4 shadow-theme-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-theme-md"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
                    <item.icon className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-500">{item.label}</p>
                    {item.href
                      ? <a href={item.href} className="block truncate text-sm font-medium text-ink-800 transition-colors hover:text-primary-600">{item.value}</a>
                      : <p className="text-sm font-medium leading-relaxed text-ink-800">{item.value}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* social */}
            <div data-reveal className="rounded-2xl border border-primary-50 bg-white p-5 shadow-theme-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-500">Quick Connect</p>
              <div className="flex gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-1 items-center justify-center gap-2 px-3 py-2.5 ${s.color} rounded-xl text-sm font-semibold text-white shadow-theme-sm transition-all duration-300 hover:-translate-y-0.5`}
                  >
                    <s.icon className="h-4 w-4" />
                    <span className="hidden text-xs sm:inline">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══ MAP SECTION ══ */}
      <div className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">

          <div data-reveal className="mb-10 text-center">
            <h2 className="font-outfit text-3xl font-bold text-ink-900">Find Us on the Map</h2>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_320px]">

            {/* map embed */}
            <div data-reveal className="min-h-[420px] overflow-hidden rounded-3xl border border-primary-50 shadow-theme-lg">
              <iframe
                title="Just Go Study Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.7489748571547!2d90.41469731536246!3d23.79398228457793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7a4e4f4e4f5%3A0x0!2sGulshan%2C+Dhaka!5e0!3m2!1sen!2sbd!4v1620000000000!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '420px', display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* info cards column */}
            <div data-reveal data-reveal-children className="flex flex-col gap-4">
              {/* address card */}
              <div className="relative flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-7 text-white">
                {[160, 240].map((size) => (
                  <div
                    key={size}
                    className="pointer-events-none absolute rounded-full border-[30px] border-white/10"
                    style={{ width: size, height: size, bottom: -size * 0.4, right: -size * 0.3 }}
                  />
                ))}
                <div className="relative z-10">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-1 font-outfit text-lg font-bold">Office Address</h3>
                  <p className="mb-5 text-sm leading-relaxed text-primary-200">{companyData.address}</p>
                  <a
                    href="https://maps.google.com/?q=Gulshan+Dhaka+Bangladesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 shadow-theme-md transition-all hover:-translate-y-0.5 hover:shadow-theme-lg"
                  >
                    <Navigation className="h-4 w-4" /> Get Directions
                  </a>
                </div>
              </div>

              {/* hours card */}
              <div className="rounded-3xl border border-primary-50 bg-white p-6 shadow-theme-md">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                    <Clock className="h-4 w-4 text-primary-600" />
                  </div>
                  <h3 className="font-outfit font-bold text-ink-900">Office Hours</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { day: 'Saturday – Thursday', time: '10:00 AM – 6:00 PM', active: true },
                    { day: 'Friday', time: 'Closed', active: false },
                  ].map((row) => (
                    <div key={row.day} className="flex items-center justify-between">
                      <span className="text-sm text-ink-500">{row.day}</span>
                      <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${row.active ? 'bg-secondary-50 text-secondary-600' : 'bg-cream-50 text-ink-500'}`}>
                        {row.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* live badge */}
              <div className="flex items-center gap-3 rounded-2xl border border-primary-100 bg-primary-50 px-5 py-4">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="h-3 w-3 flex-shrink-0 rounded-full bg-secondary-500 shadow-theme-sm"
                />
                <p className="text-sm font-medium text-primary-800">
                  We&apos;re currently <span className="font-bold text-secondary-600">open</span>.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══ SUPPORT AVAILABILITY ══ */}
      <div className="bg-cream-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="mb-12 text-center">
            <h2 className="mb-3 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl">
              We&apos;re Here Through Every <span className="text-primary-600">Milestone</span>
            </h2>
            <p className="mx-auto max-w-2xl text-ink-500">
              Our team is available at every stage of your move abroad. Reach out through any of our channels.
            </p>
          </div>

          <div data-reveal data-reveal-children className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {supportChannels.map((channel) => (
              <div
                key={channel.title}
                className="flex h-full flex-col rounded-3xl border border-white/10 bg-primary-700 p-7 shadow-theme-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-theme-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-accent-400">
                  <channel.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-outfit text-lg font-bold text-white">{channel.title}</h3>
                <p className="mb-5 text-sm leading-relaxed text-primary-100">{channel.description}</p>
                {channel.rows.length > 0 && (
                  <div className="mt-auto space-y-2 border-t border-white/10 pt-5">
                    {channel.rows.map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-3 text-sm">
                        <span className="font-medium text-primary-200">{row.label}</span>
                        <span className="text-right font-semibold text-white">{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FAQ SECTION ══ */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white to-cream-100 px-4 py-24 sm:px-6">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <div data-reveal className="mb-14 text-center">
            <h2 className="mb-3 font-outfit text-4xl font-bold text-ink-900">
              Frequently Asked{' '}
              <span className="relative inline-block">
                <span className="text-primary-600">Questions</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-primary-200" />
              </span>
            </h2>
            <p className="mx-auto max-w-md text-ink-500">
              Can&apos;t find what you&apos;re looking for? Drop us a message using the form above.
            </p>
          </div>

          <div data-reveal data-reveal-children className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${isOpen
                    ? 'border-primary-200 shadow-theme-lg'
                    : 'border-cream-100 shadow-theme-sm hover:border-primary-100 hover:shadow-theme-md'
                    }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="group flex w-full items-center gap-4 px-6 py-5 text-left"
                  >
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 ${isOpen ? 'bg-primary-600 text-white shadow-theme-md' : 'bg-primary-50 text-primary-500 group-hover:bg-primary-100'}`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={`flex-1 text-sm font-semibold leading-snug transition-colors duration-200 ${isOpen ? 'text-primary-700' : 'text-ink-800 group-hover:text-primary-600'}`}
                    >
                      {faq.q}
                    </span>

                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0, backgroundColor: isOpen ? '#0e1f6d' : '#e8ecfc' }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                    >
                      <Plus className={`h-3 w-3 transition-colors duration-300 ${isOpen ? 'text-white' : 'text-primary-500'}`} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pl-[4.5rem]">
                          <div className="mb-4 h-px bg-primary-50" />
                          <p className="text-sm leading-relaxed text-ink-500">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* bottom CTA */}
          <div data-reveal className="mt-10 text-center">
            <p className="mb-3 text-sm text-ink-500">Still have questions?</p>
            <a
              href={`mailto:${companyData.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-theme-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-500 hover:shadow-theme-lg"
            >
              <Mail className="h-4 w-4" /> Email Us Directly
            </a>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Contact;
