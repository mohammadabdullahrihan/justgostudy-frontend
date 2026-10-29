import { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, GraduationCap, Award, BookOpen, Users, Calendar,
  ArrowRight, ArrowLeft, Info, CheckCircle2, Wallet, Trophy,
  UserCheck, FlaskConical, ShieldCheck, Briefcase, Landmark,
  Sparkles, CreditCard, Library, Dumbbell, UtensilsCrossed,
  Microscope, Handshake, PartyPopper, Layers, TrendingUp,
  FileText, DollarSign, Home as HomeIcon, ExternalLink, Star, Link2,
} from 'lucide-react';
import universityService from '../services/universityService';
import courseService from '../services/courseService';
import Seo from '../components/common/Seo';
import { buildBreadcrumbSchema, buildEducationalOrgSchema } from '../utils/seoSchemas';
import {
  SidebarNav, SidebarHelpCard, BackToSectionsButton, StickyApplyBar,
  ShareModal, SectionHeading, GroupProfilePanel, EmptyState, RichText, DataDisclaimer,
} from '../components/study/DetailsPageKit';
import { PANEL_TONES } from '../utils/tabTones';
import { companyData } from '../constants/companyData';
import { openConsultationModal } from '../hooks/useConsultationModal';
import ScholarshipPromoBanner from '../components/study/ScholarshipPromoBanner';
import CostCalculatorPromoBanner from '../components/study/CostCalculatorPromoBanner';
import LanguageClubPromo from '../components/home/LanguageClubPromo';
import UniversityHeroSection from './university/HeroSection';
import UniversityOverviewTab from './university/OverviewTab';
import UniversityProgramsTab from './university/ProgramsTab';
import UniversityAdmissionsTab from './university/AdmissionsTab';

/* ============================== Tab panels ============================== */
/* The Overview / Programs / Admissions panels are heavy enough to live in
   ./university/*, same split as the country detail page. The remaining
   groups follow the University model's {overview, ...subfields} shape 1:1,
   so they're just thin GroupProfilePanel configs — kept inline here rather
   than as nine near-duplicate files. */

const AcademicsTab = ({ university }) => (
  <GroupProfilePanel
    icon={GraduationCap}
    title="Academics"
    overview={university.academics?.overview}
    updatedAt={university.updatedAt}
    fields={[
      { key: 'notableDepartments', label: 'Notable Departments', icon: Landmark, value: university.academics?.notableDepartments },
      { key: 'degreeLevels', label: 'Degree Levels Offered', icon: Layers, value: university.academics?.degreeLevels },
      { key: 'academicStrengths', label: 'Academic Strengths', icon: Sparkles, value: university.academics?.academicStrengths },
    ]}
  />
);

const TuitionTab = ({ university }) => (
  <GroupProfilePanel
    icon={Wallet}
    title="Tuition & Financial Aid"
    overview={university.tuitionAndAid?.overview}
    updatedAt={university.updatedAt}
    fields={[
      { key: 'costBreakdown', label: 'Cost Breakdown', icon: DollarSign, value: university.tuitionAndAid?.costBreakdown },
      { key: 'paymentPlans', label: 'Payment Plans', icon: CreditCard, value: university.tuitionAndAid?.paymentPlans },
    ]}
  />
);

const ScholarshipsTab = ({ university }) => {
  const list = university.scholarshipsData || [];
  if (!list.length) {
    return (
      <section>
        <SectionHeading icon={Award}>Scholarships</SectionHeading>
        <EmptyState message="We're still gathering scholarship details for this university. Reach out to a consultant for options that fit your profile." />
      </section>
    );
  }
  return (
    <section>
      <SectionHeading icon={Award} updatedAt={university.updatedAt}>Available Scholarships</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((s, idx) => {
          const tone = PANEL_TONES[idx % PANEL_TONES.length];
          return (
            <div key={idx} className={`${tone.bg} p-6 rounded-2xl border ${tone.border} shadow-sm hover:shadow-xl ${tone.hoverBorder} hover:-translate-y-1 transition-all group h-full`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${tone.iconBg} rounded-xl flex items-center justify-center transition-colors`}>
                  <Award className={`w-6 h-6 ${tone.iconText}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-ink-900 mb-2">{s.title}</h4>
                  {s.amount && <p className="text-accent-600 font-bold text-sm mb-2">{s.amount}</p>}
                  <RichText content={s.description} className="mb-3" />
                  {s.deadline && <span className="text-xs text-ink-500">Deadline: {s.deadline}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const CampusTab = ({ university }) => (
  <GroupProfilePanel
    icon={Building2}
    title="Campus & Facilities"
    overview={university.campusAndFacilities?.overview}
    updatedAt={university.updatedAt}
    fields={[
      { key: 'libraries', label: 'Libraries', icon: Library, value: university.campusAndFacilities?.libraries },
      { key: 'labsAndTech', label: 'Labs & Technology', icon: Microscope, value: university.campusAndFacilities?.labsAndTech },
      { key: 'sportsAndRecreation', label: 'Sports & Recreation', icon: Dumbbell, value: university.campusAndFacilities?.sportsAndRecreation },
      { key: 'dining', label: 'Dining', icon: UtensilsCrossed, value: university.campusAndFacilities?.dining },
    ]}
    extra={
      university.facilities && university.facilities.length > 0 && (
        <div className="bg-white p-10 rounded-3xl border border-ink-100 shadow-sm">
          <h3 className="text-lg font-bold text-ink-900 mb-6">More on Campus</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {university.facilities.map((facility, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-cream-50 rounded-2xl border border-ink-100">
                <CheckCircle2 className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-bold text-ink-700">{facility}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
  />
);

const StudentLifeTab = ({ university }) => (
  <GroupProfilePanel
    icon={Users}
    title="Student Life"
    overview={university.studentLife?.overview}
    updatedAt={university.updatedAt}
    fields={[
      { key: 'clubsAndOrganizations', label: 'Clubs & Organizations', icon: Handshake, value: university.studentLife?.clubsAndOrganizations },
      { key: 'traditionsAndEvents', label: 'Traditions & Events', icon: PartyPopper, value: university.studentLife?.traditionsAndEvents },
      { key: 'diversity', label: 'Diversity', icon: Layers, value: university.studentLife?.diversity },
    ]}
  />
);

const HousingTab = ({ university }) => (
  <GroupProfilePanel
    icon={HomeIcon}
    title="Housing"
    overview={university.housing?.overview}
    updatedAt={university.updatedAt}
    fields={[
      { key: 'onCampusOptions', label: 'On-Campus Options', icon: HomeIcon, value: university.housing?.onCampusOptions },
      { key: 'offCampusGuidance', label: 'Off-Campus Guidance', icon: Building2, value: university.housing?.offCampusGuidance },
      { key: 'costs', label: 'Housing Costs', icon: DollarSign, value: university.housing?.costs },
    ]}
  />
);

const RankingsTab = ({ university }) => (
  <GroupProfilePanel
    icon={Trophy}
    title="Rankings & Reputation"
    overview={university.rankingsAndReputation?.overview}
    updatedAt={university.updatedAt}
    fields={[
      { key: 'subjectRankings', label: 'Subject Rankings', icon: TrendingUp, value: university.rankingsAndReputation?.subjectRankings },
      { key: 'accreditations', label: 'Accreditations', icon: ShieldCheck, value: university.rankingsAndReputation?.accreditations },
    ]}
    extra={
      university.ranking && (
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 rounded-2xl text-white flex items-center gap-6">
          <Star className="w-12 h-12 text-accent-300 fill-current shrink-0" />
          <div>
            <p className="text-primary-100 text-xs font-bold uppercase tracking-widest mb-1">QS World Ranking</p>
            <p className="text-3xl font-bold">#{university.ranking}</p>
          </div>
        </div>
      )
    }
  />
);

const AlumniTab = ({ university }) => {
  const list = university.notableAlumni || [];
  if (!list.length) {
    return (
      <section>
        <SectionHeading icon={UserCheck}>Notable Alumni</SectionHeading>
        <EmptyState message="We're still gathering notable alumni for this university. Ask a consultant about graduate outcomes for your program of interest." />
      </section>
    );
  }
  return (
    <section>
      <SectionHeading icon={UserCheck} updatedAt={university.updatedAt}>Notable Alumni</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((a, idx) => {
          const tone = PANEL_TONES[idx % PANEL_TONES.length];
          return (
            <div key={idx} className={`${tone.bg} p-6 rounded-2xl border ${tone.border} shadow-sm hover:shadow-lg ${tone.hoverBorder} transition-all flex items-center gap-4`}>
              <div className={`w-12 h-12 ${tone.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                <UserCheck className={`w-6 h-6 ${tone.iconText}`} />
              </div>
              <div>
                <h4 className="font-bold text-ink-900">{a.name}</h4>
                <RichText content={a.achievement} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const ResearchTab = ({ university }) => (
  <GroupProfilePanel
    icon={FlaskConical}
    title="Research & Innovation"
    overview={university.researchAndInnovation?.overview}
    updatedAt={university.updatedAt}
    fields={[
      { key: 'researchCenters', label: 'Research Centers', icon: Microscope, value: university.researchAndInnovation?.researchCenters },
      { key: 'fundingAndOutput', label: 'Funding & Output', icon: TrendingUp, value: university.researchAndInnovation?.fundingAndOutput },
    ]}
  />
);

const SupportTab = ({ university }) => (
  <GroupProfilePanel
    icon={ShieldCheck}
    title="International Student Support"
    overview={university.internationalStudentSupport?.overview}
    updatedAt={university.updatedAt}
    fields={[
      { key: 'dedicatedOffice', label: 'Dedicated Office', icon: Building2, value: university.internationalStudentSupport?.dedicatedOffice },
      { key: 'orientationAndVisaSupport', label: 'Orientation & Visa Support', icon: FileText, value: university.internationalStudentSupport?.orientationAndVisaSupport },
      { key: 'eslPrograms', label: 'ESL Programs', icon: BookOpen, value: university.internationalStudentSupport?.eslPrograms },
    ]}
  />
);

const CareersTab = ({ university }) => (
  <GroupProfilePanel
    icon={Briefcase}
    title="Career Outcomes"
    overview={university.careerOutcomes?.overview}
    updatedAt={university.updatedAt}
    fields={[
      { key: 'careerServices', label: 'Career Services', icon: Handshake, value: university.careerOutcomes?.careerServices },
      { key: 'employmentRate', label: 'Employment Rate', icon: TrendingUp, value: university.careerOutcomes?.employmentRate },
      { key: 'avgStartingSalary', label: 'Avg Starting Salary', icon: DollarSign, value: university.careerOutcomes?.avgStartingSalary },
      { key: 'employerPartnerships', label: 'Employer Partnerships', icon: Handshake, value: university.careerOutcomes?.employerPartnerships },
    ]}
  />
);

const TimelineTab = ({ university }) => {
  const timeline = university.applicationTimeline || [];

  return (
    <div className="space-y-10">
      <section>
        <SectionHeading icon={Calendar} updatedAt={university.updatedAt}>Application Timeline</SectionHeading>
        {timeline.length === 0 || !timeline.some((t) => t.intake) ? (
          <EmptyState message="We're still gathering intake deadlines for this university. Ask a consultant for the current application calendar." />
        ) : (
          <div className="space-y-4">
            {timeline.filter((t) => t.intake).map((t, idx) => {
              const tone = PANEL_TONES[idx % PANEL_TONES.length];
              return (
                <div key={idx} className={`${tone.bg} p-6 rounded-2xl border ${tone.border} shadow-sm flex flex-col md:flex-row md:items-center gap-4 md:gap-8`}>
                  <div className={`w-12 h-12 ${tone.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Calendar className={`w-6 h-6 ${tone.iconText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-ink-900">{t.intake}</h4>
                    {t.notes && <RichText content={t.notes} className="mt-1" />}
                  </div>
                  {t.deadline && (
                    <span className="text-sm font-bold text-ink-900 bg-white px-4 py-2 rounded-full border border-ink-100 shrink-0 w-fit">
                      Deadline: {t.deadline}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

const ResourcesTab = ({ university }) => {
  // Curated officialLinks (Admissions, Financial Aid, Rankings, etc.) win
  // when present. About half of universities don't have that curated list
  // yet, so fall back to the plain `website` field most profiles do have —
  // real data already on the record, not a fabricated placeholder — rather
  // than dropping the section entirely.
  const links = university.officialLinks?.length > 0
    ? university.officialLinks
    : (university.website ? [{ category: 'University Website', name: `${university.name} Official Website`, url: university.website }] : []);

  return (
    <div className="space-y-10">
      <section>
        <SectionHeading icon={Link2} updatedAt={university.updatedAt}>Official Resources</SectionHeading>
        {links.length === 0 ? (
          <EmptyState message="We're still curating official links for this university. Ask a consultant for verified sources." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-5 bg-white rounded-2xl border border-ink-100 shadow-sm hover:border-primary-300 hover:shadow-lg transition-all group"
              >
                <div className="min-w-0">
                  {link.category && <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-1">{link.category}</p>}
                  <p className="font-bold text-accent-600 underline decoration-accent-300 decoration-2 underline-offset-2 group-hover:text-accent-700 group-hover:decoration-accent-500 transition-colors truncate">{link.name}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-accent-500 group-hover:text-accent-700 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const TAB_PANELS = {
  overview: UniversityOverviewTab,
  academics: AcademicsTab,
  admissions: UniversityAdmissionsTab,
  programs: UniversityProgramsTab,
  tuition: TuitionTab,
  scholarships: ScholarshipsTab,
  campus: CampusTab,
  studentlife: StudentLifeTab,
  housing: HousingTab,
  rankings: RankingsTab,
  // alumni: AlumniTab, — hidden until notableAlumni is populated for most
  // universities (95/280 deep profiles are empty right now); AlumniTab
  // itself is left defined above so this is a one-line re-enable later.
  research: ResearchTab,
  support: SupportTab,
  careers: CareersTab,
  timeline: TimelineTab,
  resources: ResourcesTab,
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'academics', label: 'Academics', icon: GraduationCap },
  { id: 'admissions', label: 'Admissions', icon: CheckCircle2 },
  { id: 'programs', label: 'Programs', icon: BookOpen },
  { id: 'tuition', label: 'Tuition & Financial Aid', icon: Wallet },
  { id: 'scholarships', label: 'Scholarships', icon: Award },
  { id: 'campus', label: 'Campus & Facilities', icon: Building2 },
  { id: 'studentlife', label: 'Student Life', icon: Users },
  { id: 'housing', label: 'Housing', icon: HomeIcon },
  { id: 'rankings', label: 'Rankings & Reputation', icon: Trophy },
  // { id: 'alumni', label: 'Notable Alumni', icon: UserCheck }, — see TAB_PANELS note above
  { id: 'research', label: 'Research & Innovation', icon: FlaskConical },
  { id: 'support', label: 'International Student Support', icon: ShieldCheck },
  { id: 'careers', label: 'Career Outcomes', icon: Briefcase },
  { id: 'timeline', label: 'Application Timeline', icon: Calendar },
  { id: 'resources', label: 'Official Resources', icon: Link2 },
];

/* ============================== Main page ============================== */

const UniversityDetails = () => {
  const { id } = useParams();
  const [university, setUniversity] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
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
    const fetchUniversityDetails = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [uniData, coursesData] = await Promise.all([
          universityService.getUniversityById(id),
          // getCourses defaults to a 9-per-page limit (built for the paginated
          // Courses listing page) — a single university's full programme list
          // needs to come back in one shot here, so raise it well above any
          // real per-university course count.
          courseService.getCourses({ universityId: id, limit: 100 }),
        ]);

        const resolvedUniversity = uniData.university || uniData.data || uniData;
        if (!resolvedUniversity?._id) {
          setLoadError('not-found');
        } else {
          setUniversity(resolvedUniversity);
          setCourses(coursesData.courses || coursesData.data || coursesData || []);
        }
      } catch (err) {
        setLoadError(err?.response?.status === 404 ? 'not-found' : 'network');
      } finally {
        setLoading(false);
      }
    };
    fetchUniversityDetails();
  }, [id]);

  useEffect(() => {
    activeTabButtonRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeTab]);

  if (loading) {
    return (
      <div className="bg-cream-50 min-h-screen pt-8 pb-24 animate-pulse">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="h-[300px] md:h-[400px] rounded-3xl bg-ink-100 mb-24" />
          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 lg:gap-10">
            <div className="bg-white rounded-3xl border border-cream-100 shadow-sm p-2.5 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-11 w-28 lg:w-full shrink-0 bg-cream-200 rounded-xl" />
              ))}
            </div>
            <div className="space-y-6 min-w-0">
              <div className="h-8 w-2/3 bg-cream-200 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-2xl border border-cream-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !university) {
    const isNetworkError = loadError === 'network';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50 pt-8 px-4">
        <div className="bg-red-50 p-8 rounded-2xl text-center max-w-md">
          <Building2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ink-900 mb-2">
            {isNetworkError ? 'Something Went Wrong' : 'University Not Found'}
          </h2>
          <p className="text-ink-600 mb-6">
            {isNetworkError
              ? "We couldn't load this page right now. Please check your connection and try again."
              : "This university doesn't exist or may have been removed."}
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
            <Link to="/study-abroad/universities" className="inline-flex items-center gap-2 text-primary-600 font-bold">
              Back to Universities <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ieltsValues = courses.map((c) => c.ieltsRequirement).filter(Boolean);
  const ieltsRange = ieltsValues.length
    ? (Math.min(...ieltsValues) === Math.max(...ieltsValues)
      ? `${Math.min(...ieltsValues)} Overall`
      : `${Math.min(...ieltsValues)} – ${Math.max(...ieltsValues)} Overall`)
    : 'Varies by program';

  const ActivePanel = TAB_PANELS[activeTab];

  return (
    <div className="bg-cream-50 min-h-screen pt-8 pb-20 font-sans">
      <Seo
        title={`${university.name} - Just Go Study`}
        description={(university.description || `Explore ${university.name}, located in ${university.location}, ${university.country}. View programs, admission requirements and apply with Just Go Study's free guidance.`).slice(0, 160)}
        image={university.logo}
        type="website"
        schema={[
          buildEducationalOrgSchema(university),
          buildBreadcrumbSchema([
            { name: 'Home', path: '/study-abroad' },
            { name: 'Universities', path: '/study-abroad/universities' },
            { name: university.name, path: `/study-abroad/university/${university._id}` },
          ]),
        ]}
      />
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">

        {/* Back */}
        <Link
          to="/study-abroad/universities"
          className="group mb-8 inline-flex items-center gap-2 rounded-full bg-primary-50 py-2.5 pl-4 pr-5 text-sm font-bold text-primary-700 shadow-theme-sm transition-all duration-300 hover:bg-primary-100 hover:shadow-theme-md"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Universities
        </Link>

        <UniversityHeroSection
          university={university}
          coursesCount={courses.length}
          isSaved={isSaved}
          setIsSaved={setIsSaved}
          onShare={() => setShowShareModal(true)}
        />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ScholarshipPromoBanner country={university.country} size="sm" className="mb-0" />
          <CostCalculatorPromoBanner country={university.country} size="sm" className="mb-0" />
        </div>

        <div className="mb-10">
          <DataDisclaimer />
        </div>

        {/* Content Grid: sticky nav sidebar | content, same [240px_1fr] pattern as the
            Destination/Country detail page so all three detail pages read as one system. */}
        <div ref={guideSectionsRef} className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 lg:gap-10">
          <div className="lg:self-stretch">
            <SidebarNav
              tabs={TABS}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeTabButtonRef={activeTabButtonRef}
              heading="University Sections"
            />
            <SidebarHelpCard
              title="Ready to Apply?"
              message={`We'll help you apply to ${university.name}, free of charge.`}
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
                {ActivePanel && (
                  <ActivePanel university={university} courses={courses} ieltsRange={ieltsRange} ieltsValues={ieltsValues} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <BackToSectionsButton onClick={scrollToGuideSections} label="Back to University Sections" />
      </div>

      <StickyApplyBar title={`Apply to ${university.name}`} onApply={openConsultationModal} />

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title={`${university.name} Profile`} whatsappText={`Check out ${university.name} on Just Go Study: ${typeof window !== 'undefined' ? window.location.href : ''}`} />
    </div>
  );
};

export default UniversityDetails;
