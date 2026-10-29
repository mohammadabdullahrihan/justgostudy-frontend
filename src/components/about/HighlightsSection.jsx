import { useRef } from 'react';
import {
  Globe2, ShieldCheck, Banknote, GraduationCap, HeartHandshake,
  Eye, Users, Calculator,
} from 'lucide-react';
import useCardGridFX from '../../hooks/useCardGridFX';

const TINTS = [
  { grad: 'from-primary-400 to-primary-600', icon: 'text-white' },
  { grad: 'from-secondary-400 to-secondary-600', icon: 'text-white' },
  { grad: 'from-accent-400 to-accent-500', icon: 'text-ink-900' },
];

// "500+ accredited institutions across 70+ countries" and "90% visa success"
// mirror the real, site-wide figures used everywhere else on the site (see
// AboutHero/FeaturesSection/WhyTrustUsSection) rather than being retyped
// per-section, so a future change to the real number only has to happen in
// one place's worth of components, not drift between pages.
const HIGHLIGHTS = [
  {
    title: 'Global Academic Network',
    icon: Globe2,
    description:
      'Just Go Study has built partnerships with over 500 accredited universities and colleges across 70+ countries, giving every student a genuinely global shortlist to choose from rather than a handful of pre-selected partner schools. That network spans the UK, USA, Canada, Australia, New Zealand, Europe, the Gulf and Asia, and it covers every study level — Diploma, Bachelor’s, Master’s and Ph.D. — so the same team can guide a student from their very first foundation course through to a doctoral research seat, with end-to-end advice at each stage instead of handing them off between specialists.',
  },
  {
    title: 'High Success Rate',
    icon: ShieldCheck,
    description:
      'The agency maintains an impressive 90% visa success rate, built on meticulous documentation review and realistic mock visa interview preparation rather than volume-based processing. Every file is checked line by line against the specific embassy’s current requirements before submission, and students go through simulated interview rounds so the real one holds no surprises — the kind of preparation that turns a nerve-wracking appointment into a formality.',
  },
  {
    title: 'Scholarship & Financial Aid Focus',
    icon: Banknote,
    description:
      'Just Go Study has helped students secure more than $2.5M in scholarships and financial grants to date, actively hunting down merit-based and need-based funding rather than waiting for students to stumble onto it themselves. Reducing the real out-of-pocket cost of studying abroad is treated as part of the counseling job itself, not an optional add-on, which is why financial aid research runs in parallel with university shortlisting from day one.',
  },
  {
    title: 'Comprehensive Level Coverage',
    icon: GraduationCap,
    description:
      'Programs are mapped specifically for every stage of a student’s academic journey — pre-university diplomas, undergraduate degrees, postgraduate studies and research-focused doctorates (Ph.D.) — so the guidance a student receives is calibrated to exactly where they are, not a generic template reused across every applicant. A diploma-track student and a Ph.D. applicant go through fundamentally different conversations about timelines, funding and institution fit, and that distinction is built into how the team works.',
  },
  {
    title: 'Student-First Philosophy',
    icon: HeartHandshake,
    description:
      'Profile shortlisting is based strictly on a student’s own academic goals, career ambitions and budget, rather than being steered toward whichever institution offers the agency the better commission. That distinction shapes every recommendation the team makes — a university only makes the shortlist if it genuinely fits the student sitting across the table, not because it’s convenient to recommend.',
  },
];

const WHY_PREFER = [
  {
    title: 'Transparency',
    icon: Eye,
    description: 'Clear, upfront policies with no hidden charges or misleading promises.',
  },
  {
    title: 'Experienced Counselors',
    icon: Users,
    description: 'Counselors with international exposure who offer real, actionable advice based on lived experience abroad.',
  },
  {
    title: 'Interactive Tools',
    icon: Calculator,
    description: 'Access to online calculators for estimating living costs, ROI on education, IELTS score bands, and visa timelines.',
  },
];

const HighlightsSection = () => {
  const sectionRef = useRef(null);
  const preferRef = useRef(null);

  useCardGridFX(sectionRef, preferRef);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-cream-50 py-20 sm:py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100 opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-accent-100 opacity-30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            Key Highlights & Strengths
          </span>
          <h2 className="mt-3 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
            What sets Just Go Study apart
          </h2>
        </div>

        <div className="space-y-10 sm:space-y-12">
          {HIGHLIGHTS.map((item, idx) => {
            const tint = TINTS[idx % TINTS.length];
            return (
              <div key={item.title} className="relative flex flex-col gap-5 sm:flex-row sm:gap-8">
                {/* number + icon column */}
                <div className="flex shrink-0 items-center gap-4 sm:w-20 sm:flex-col sm:items-start sm:gap-3">
                  <span className="font-outfit text-4xl font-black leading-none text-ink-900/10 sm:text-5xl">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-theme-sm ${tint.grad}`}>
                    <item.icon className={`h-6 w-6 ${tint.icon}`} />
                  </div>
                </div>

                {/* text column */}
                <div className={`flex-1 border-l-2 border-cream-200 pl-5 sm:pl-8 ${idx === HIGHLIGHTS.length - 1 ? '' : 'pb-10 sm:pb-12'}`}>
                  <h3 className="mb-2 font-outfit text-xl font-bold leading-snug text-ink-900 sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="text-base leading-relaxed text-ink-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Why Students Prefer Just Go Study ── */}
        <div className="mx-auto mb-10 mt-24 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            Why Students Prefer Just Go Study
          </span>
        </div>

        <div ref={preferRef} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {WHY_PREFER.map((item, idx) => {
            const tint = TINTS[idx % TINTS.length];
            return (
              <div key={item.title} data-name={item.title} className="fx-card group relative will-change-transform">
                <div className="fx-ring pointer-events-none absolute -inset-[2px] rounded-[30px] bg-gradient-to-br from-primary-400 to-primary-600 opacity-0" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-cream-100 bg-white p-7 text-center shadow-theme-sm transition-shadow duration-300 group-hover:shadow-theme-lg">
                  <div className={`relative mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br transition-all duration-300 group-hover:-rotate-6 ${tint.grad}`}>
                    <item.icon className={`h-6 w-6 ${tint.icon}`} />
                  </div>
                  <h3 className="relative mb-2 font-outfit text-lg font-bold leading-snug text-ink-900">{item.title}</h3>
                  <p className="relative text-sm leading-relaxed text-ink-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HighlightsSection;
