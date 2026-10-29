import { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Building2, MapPin, Globe, Clock,
  DollarSign, Award, BookOpen, CheckCircle2, ArrowRight,
  ArrowLeft, Calendar, Info, ShieldCheck, Share2,
  ExternalLink, Star,
} from 'lucide-react';
import courseService from '../services/courseService';
import Seo from '../components/common/Seo';
import { buildBreadcrumbSchema, buildCourseSchema } from '../utils/seoSchemas';
import { openConsultationModal } from '../hooks/useConsultationModal';
import { companyData } from '../constants/companyData';
import ScholarshipPromoBanner from '../components/study/ScholarshipPromoBanner';
import ROIEstimatorPromoBanner from '../components/study/ROIEstimatorPromoBanner';
import LanguageClubPromo from '../components/home/LanguageClubPromo';
import {
  SidebarNav, SidebarHelpCard, BackToSectionsButton, StickyApplyBar, ShareModal, SectionHeading, DataDisclaimer,
} from '../components/study/DetailsPageKit';
import { GRAIN_BG } from '../utils/heroGrain';
import { formatUpdatedAt } from '../utils/formatDate';
import { formatTuitionUSD } from '../utils/formatTuition';

const DEFAULT_REQUIREMENTS = [
  'Academic Transcripts',
  'Passport Copy',
  'Resume/CV',
  'Statement of Purpose',
  'Recommendation Letters',
];

/* ============================== Tab panels ============================== */
/* Same [240px_1fr] sidebar-nav + content shell as the Destination and
   University detail pages — the course model just has far fewer fields, so
   it's four tabs instead of fifteen, not a different layout. */

const OverviewTab = ({ course, university }) => (
  <div className="space-y-8">
    <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-ink-100 shadow-sm">
      <SectionHeading updatedAt={course.updatedAt}>Course Overview</SectionHeading>
      <div className="prose prose-slate max-w-none">
        <p className="text-ink-600 leading-relaxed text-lg whitespace-pre-line">
          {course.description || 'No detailed description available for this course yet, reach out to a consultant for the full curriculum.'}
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 rounded-2xl text-white">
        <GraduationCap className="w-10 h-10 mb-6 text-primary-200" />
        <h3 className="text-xl font-bold mb-4">Program Level</h3>
        <p className="text-primary-100 text-sm leading-relaxed font-medium">
          {course.level} program{university.name ? ` at ${university.name}` : ''}, duration {course.duration || 'N/A'}.
        </p>
      </div>
      <div className="bg-white p-8 rounded-2xl border border-ink-100 shadow-sm">
        <Globe className="w-10 h-10 mb-6 text-secondary-500" />
        <h3 className="text-xl font-bold text-ink-900 mb-4">Study Destination</h3>
        <p className="text-ink-500 text-sm leading-relaxed font-medium">
          {[university.location, university.country].filter(Boolean).join(', ') || 'Location details available on request.'}
        </p>
      </div>
    </div>

    {/* University quick-info card — so users don't need to switch tabs */}
    {university._id && (
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-ink-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-cream-50 border border-ink-100 flex items-center justify-center overflow-hidden shrink-0">
              {university.logo ? (
                <img src={university.logo} alt={university.name} className="w-full h-full object-contain p-2" />
              ) : (
                <Building2 className="w-7 h-7 text-ink-500" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-ink-900 text-lg">About the University</h4>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <span className="text-sm font-semibold text-ink-500">{university.name}</span>
                {university.ranking && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-600 bg-accent-50 px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-current" /> QS #{university.ranking}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/study-abroad/university/${university._id}`}
              className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 px-5 py-3 rounded-2xl font-bold text-sm transition-all"
            >
              <Building2 className="w-4 h-4" /> Full Profile
            </Link>
            {university.website && (
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-theme-sm"
              >
                <Globe className="w-4 h-4" /> Official Website <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

const RequirementsTab = ({ course, university }) => {
  const requirements = course.requirements?.length
    ? course.requirements
    : (university.admissionRequirements?.length ? university.admissionRequirements : DEFAULT_REQUIREMENTS);
  const usingFallbackRequirements = !course.requirements?.length && !university.admissionRequirements?.length;

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-ink-100 shadow-sm">
      <SectionHeading updatedAt={course.updatedAt}>Entry Requirements</SectionHeading>
      <p className="text-xs text-ink-500 font-medium mb-8 -mt-4 ml-6">
        {usingFallbackRequirements
          ? 'Typical documents, confirm exact requirements with a consultant.'
          : `Specific to ${course.name}.`}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requirements.map((req, i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-cream-50 rounded-2xl border border-ink-100">
            <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
            <span className="text-sm font-bold text-ink-700">{req}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FeesTab = ({ course }) => (
  <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-ink-100 shadow-sm">
    <SectionHeading updatedAt={course.updatedAt}>Fees & Intake</SectionHeading>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: 'Duration', value: course.duration || 'N/A', icon: Clock, chip: 'bg-primary-50 text-primary-600 border-primary-100' },
        {
          label: 'Tuition Fee',
          // Shown in the course's own native currency (what the student is
          // actually billed in), not the backend's USD-normalized
          // tuitionFeeUSD — that field exists purely for the budget filter's
          // cross-currency comparison, not for display.
          value: course.tuitionFee ? formatTuitionUSD(course) : 'Contact us',
          icon: DollarSign,
          chip: 'bg-secondary-50 text-secondary-600 border-secondary-100',
        },
        { label: 'Intake', value: (course.intake && course.intake.length && course.intake.join(', ')) || 'Rolling', icon: Calendar, chip: 'bg-accent-50 text-accent-600 border-accent-100' },
        { label: 'IELTS Requirement', value: course.ieltsRequirement || '6.5', icon: Award, chip: 'bg-accent-50 text-accent-600 border-accent-100' },
      ].map((stat, i) => (
        <div key={i} className="p-6 rounded-[2rem] border border-ink-100 bg-cream-50">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${stat.chip}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-1">{stat.label}</p>
          <p className="text-sm font-bold text-ink-900">{stat.value}</p>
        </div>
      ))}
    </div>
  </div>
);

const UniversityTab = ({ university }) => (
  <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-ink-100 shadow-sm">
    <SectionHeading updatedAt={university.updatedAt}>Hosted By</SectionHeading>
    {university._id ? (
      <div className="space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-cream-50 border border-ink-100 flex items-center justify-center overflow-hidden shrink-0">
            {university.logo ? (
              <img src={university.logo} alt={university.name} className="w-full h-full object-contain p-2" />
            ) : (
              <Building2 className="w-8 h-8 text-ink-500" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-ink-900">{university.name}</h3>
            {(university.location || university.country) && (
              <p className="text-ink-500 font-bold text-sm flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-accent-400" />
                {[university.location, university.country].filter(Boolean).join(', ')}
              </p>
            )}
            {university.ranking && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-accent-600">
                <Star className="w-3.5 h-3.5 fill-current" /> QS Rank #{university.ranking}
              </span>
            )}
          </div>
        </div>
        {university.description && (
          <p className="text-ink-600 leading-relaxed whitespace-pre-line">{university.description}</p>
        )}
        <div className="flex flex-wrap gap-4">
          <Link
            to={`/study-abroad/university/${university._id}`}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-primary-700 transition-all"
          >
            View University Profile <ExternalLink className="w-4 h-4" />
          </Link>
          {university.website && (
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-ink-900 border-2 border-ink-100 px-6 py-3.5 rounded-2xl font-bold text-sm hover:border-primary-600 hover:text-primary-600 transition-all"
            >
              <Globe className="w-4 h-4" /> University Website
            </a>
          )}
        </div>
      </div>
    ) : (
      <p className="text-ink-500 font-medium">University details aren&apos;t available for this course yet.</p>
    )}
  </div>
);

const TAB_PANELS = {
  overview: OverviewTab,
  requirements: RequirementsTab,
  fees: FeesTab,
  university: UniversityTab,
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'requirements', label: 'Entry Requirements', icon: ShieldCheck },
  { id: 'fees', label: 'Fees & Intake', icon: DollarSign },
  { id: 'university', label: 'Hosted By', icon: Building2 },
];

/* ============================== Main page ============================== */

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showShareModal, setShowShareModal] = useState(false);
  const guideSectionsRef = useRef(null);
  const activeTabButtonRef = useRef(null);

  const scrollToGuideSections = () => {
    const el = guideSectionsRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const courseData = await courseService.getCourseById(id);
        const resolved = courseData.course || courseData.data || courseData;
        if (!resolved?._id) {
          setLoadError('not-found');
        } else {
          setCourse(resolved);
        }
      } catch (err) {
        setLoadError(err?.response?.status === 404 ? 'not-found' : 'network');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    activeTabButtonRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-8">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loadError || !course) {
    const isNetworkError = loadError === 'network';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-8 px-4">
        <div className="bg-red-50 p-8 rounded-[2rem] text-center max-w-md">
          <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ink-900 mb-2">
            {isNetworkError ? 'Something Went Wrong' : 'Course Not Found'}
          </h2>
          <p className="text-ink-600 mb-6">
            {isNetworkError
              ? "We couldn't load this course right now. Please check your connection and try again."
              : "This course doesn't exist or may have been removed."}
          </p>
          <div className="flex items-center justify-center gap-4">
            {isNetworkError && (
              <button
                onClick={() => window.location.reload()}
                className="bg-primary-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-all"
              >
                Try Again
              </button>
            )}
            <Link to="/study-abroad/courses" className="inline-flex items-center gap-2 text-primary-600 font-bold">
              Back to Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const university = course.universityId || {};
  const ActivePanel = TAB_PANELS[activeTab];

  return (
    <div className="min-h-screen bg-cream-50 pt-8 pb-20 font-sans">
      <Seo
        title={`${course.name} - Just Go Study`}
        description={(course.description || `${course.name} (${course.level}) at ${university.name || 'a university'}. Duration: ${course.duration || 'N/A'}. Apply with Just Go Study's free guidance.`).slice(0, 160)}
        image={university.coverImage || university.logo}
        schema={[
          buildCourseSchema(course, university),
          buildBreadcrumbSchema([
            { name: 'Home', path: '/study-abroad' },
            { name: 'Courses', path: '/study-abroad/courses' },
            { name: course.name, path: `/study-abroad/course/${course._id}` },
          ]),
        ]}
      />
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">

        {/* Back */}
        <div className="flex items-center justify-between mb-10">
          <Link
            to="/study-abroad/courses"
            className="group inline-flex items-center gap-2 rounded-full bg-primary-50 py-2.5 pl-4 pr-5 text-sm font-bold text-primary-700 shadow-theme-sm transition-all duration-300 hover:bg-primary-100 hover:shadow-theme-md"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Courses
          </Link>
          <button
            onClick={() => setShowShareModal(true)}
            aria-label="Share this course"
            className="inline-flex items-center gap-2 text-sm font-bold text-ink-600 hover:text-primary-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Hero Banner — brand navy gradient + prominent university logo, same visual language as University Details page */}
        <div className="relative mb-12">
          <div className="rounded-[3rem] overflow-hidden relative shadow-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-8 md:p-12 pb-10 md:pb-12">
            <div
              className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: GRAIN_BG }}
            />

            {/* Decorative gradient orbs */}
            <div className="pointer-events-none absolute -left-10 top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-6 bottom-0 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
              {/* Left: Logo + Course Info */}
              <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8 min-w-0">
                {/* University logo card — prominent, always visible */}
                <div className="w-24 h-24 md:w-36 md:h-36 bg-white rounded-2xl p-4 md:p-5 shadow-2xl flex items-center justify-center border-4 border-white/20 shrink-0">
                  {university.logo ? (
                    <img
                      src={university.logo}
                      alt={`${university.name || 'University'} logo`}
                      className="w-full h-full object-contain"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 md:w-14 md:h-14 text-ink-500" />
                  )}
                </div>

                {/* Text content */}
                <div className="space-y-3 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/20">
                      <GraduationCap className="w-4 h-4" />
                      {course.level}
                    </span>
                    {university.ranking && (
                      <span className="px-3 py-2 bg-accent-400 text-ink-900 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Star className="w-3 h-3 fill-ink-900" />
                        QS Rank #{university.ranking}
                      </span>
                    )}
                  </div>
                  <h1 className="font-fraunces italic text-3xl md:text-5xl lg:text-6xl font-medium text-white leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.25)] max-w-3xl">
                    {course.name}
                  </h1>
                  <div className="flex flex-wrap gap-5">
                    <Link
                      to={`/study-abroad/university/${university._id}`}
                      className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm">{university.name}</span>
                    </Link>
                    {(university.location || university.country) && (
                      <div className="flex items-center gap-2.5 text-white/80">
                        <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm">{[university.location, university.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {university.website && (
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-white hover:text-accent-300 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-accent-400/20 group-hover:border-accent-300/40 transition-all">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm flex items-center gap-1.5">
                          Official Site <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Website button (only on desktop, aligned bottom-right) */}
              {university.website && (
                <a
                  href={university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex shrink-0 px-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-sm hover:bg-white hover:text-ink-900 transition-all items-center gap-2 w-fit"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit University
                </a>
              )}
            </div>
          </div>

          {/* Trust strip — real "last updated" timestamp (never invented) so
              students see this listing is actively maintained, plus a direct
              nudge to confirm the live details on the university's own site.
              Same pattern as the University details page's hero. */}
          {(() => {
            const updatedLabel = formatUpdatedAt(course.updatedAt);
            if (!updatedLabel) return null;
            return (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-cream-200 bg-white px-5 py-3.5">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-ink-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  Course info last updated {updatedLabel}
                </div>
                {university.website && (
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors shrink-0"
                  >
                    Confirm details on {university.name || 'the university'}&apos;s official site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          })()}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ScholarshipPromoBanner country={university.country} size="sm" className="mb-0" />
          <ROIEstimatorPromoBanner size="sm" className="mb-0" />
        </div>

        <div className="mb-10">
          <DataDisclaimer />
        </div>

        {/* Content Grid: sticky nav sidebar | content, same [240px_1fr] pattern as the
            Destination and University detail pages. */}
        <div ref={guideSectionsRef} className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 lg:gap-10">
          <div className="lg:self-stretch">
            <SidebarNav
              tabs={TABS}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeTabButtonRef={activeTabButtonRef}
              heading="Course Sections"
            />
            <SidebarHelpCard
              title="Ready to Apply?"
              message="Our expert consultants will guide you through the entire application process for free."
              phone={companyData.phone}
              officeHours={companyData.officeHours}
            />
            <div className="mt-4">
              <LanguageClubPromo variant="mini" />
            </div>
          </div>

          <div className="space-y-16 overflow-hidden min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-16"
              >
                {ActivePanel && <ActivePanel course={course} university={university} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <BackToSectionsButton onClick={scrollToGuideSections} label="Back to Course Sections" />
      </div>

      <StickyApplyBar
        eyebrow="Ready to Apply?"
        title={course.name}
        buttonLabel="Apply Now"
        icon={BookOpen}
        onApply={openConsultationModal}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={course.name}
        whatsappText={`Check out ${course.name} on Just Go Study: ${typeof window !== 'undefined' ? window.location.href : ''}`}
      />
    </div>
  );
};

export default CourseDetails;
