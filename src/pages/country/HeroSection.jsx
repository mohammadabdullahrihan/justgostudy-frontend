import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPin, GraduationCap, BookOpen, Users, BookmarkPlus, Share2, Compass, Download, ArrowLeft,
} from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import { GRAIN_BG } from '../../utils/heroGrain';
import { StatBar } from '../../components/study/DetailsPageKit';

const flagUrl = (countryCode) => (countryCode ? `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png` : null);

const formatUpdatedDate = (iso) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
};

/* Faint dot-grid, reads as "global network" rather than decoration for its
   own sake, sits under the flag on the no-photo hero variant. */
const DOT_GRID_BG =
  'radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)';

const HeroSection = ({
  heroRef,
  heroImgWrapRef,
  country,
  guide,
  universities,
  courses,
  isSaved,
  setIsSaved,
  setShowShareModal,
  setShowCompareModal,
  setShowGuideModal,
}) => {
  // Always the live onboarded count now — these used to prefer an admin-set
  // "real world" approximation (e.g. "Australia has 43 universities") so a
  // sparsely-populated country didn't look empty, but that static figure
  // goes stale the moment the real DB count grows past it (several
  // destinations now have more onboarded universities than that old
  // approximation ever claimed), which reads as actively wrong rather than
  // optimistic. The live count is the honest number.
  const stats = [
    { label: 'Universities', value: universities.length || 0, Icon: GraduationCap, tone: 'primary' },
    { label: 'Programs', value: courses.length || 0, Icon: BookOpen, tone: 'secondary' },
    { label: 'Students Abroad', value: guide?.studentCount || '10K+', Icon: Users, tone: 'accent' },
  ];

  /* No photography anywhere on this page, brand-toned gradient + the
     country's real flag, never a stock stand-in. */
  const flag = flagUrl(guide?.countryCode);
  const updatedLabel = formatUpdatedDate(guide?.updatedAt);

  return (
    <section ref={heroRef} className="relative mb-8 md:mb-12">
      <div className="h-[520px] md:h-[640px] relative overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3.5rem]">
        <div ref={heroImgWrapRef} className="absolute inset-x-0 -top-[8%] h-[116%] bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950" />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-secondary-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{ backgroundImage: DOT_GRID_BG, backgroundSize: '22px 22px' }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: GRAIN_BG }}
        />
        {flag && (
          <div className="hidden md:flex absolute right-[8%] top-1/2 -translate-y-1/2 items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 scale-110 rounded-[2rem] bg-white/10 blur-2xl" />
              <div className="relative w-64 h-44 lg:w-80 lg:h-52 rounded-[1.75rem] border-4 border-white/90 shadow-2xl shadow-ink-950/40 overflow-hidden">
                <img
                  loading="eager" decoding="async"
                  src={flag}
                  alt={`${country} flag`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />

        {/* Back, mirrors the action rail's frosted-capsule treatment on the opposite corner */}
        <Link
          to="/study-abroad/destinations"
          className="font-outfit absolute top-6 left-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-full hover:bg-accent-500 hover:text-primary-950 hover:border-accent-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Destinations
        </Link>

        {/* Floating action rail, one frosted capsule, not three loose circles */}
        <div className="absolute top-6 right-6 flex flex-col bg-white/10 backdrop-blur-xl rounded-full border border-white/20 p-1.5">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsSaved(!isSaved)}
            aria-label={isSaved ? 'Remove from saved' : 'Save destination'}
            title={isSaved ? 'Remove from saved' : 'Save destination'}
            className="w-11 h-11 flex items-center justify-center rounded-full text-white hover:bg-white/15 transition-colors"
          >
            <BookmarkPlus className={`w-[18px] h-[18px] ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>
          <div className="h-px bg-white/15 mx-2" />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowShareModal(true)}
            aria-label="Share destination"
            title="Share destination"
            className="w-11 h-11 flex items-center justify-center rounded-full text-white hover:bg-white/15 transition-colors"
          >
            <Share2 className="w-[18px] h-[18px]" />
          </motion.button>
          <div className="h-px bg-white/15 mx-2" />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowCompareModal(true)}
            aria-label="Compare destinations"
            title="Compare destinations"
            className="w-11 h-11 flex items-center justify-center rounded-full text-white hover:bg-white/15 transition-colors"
          >
            <Compass className="w-[18px] h-[18px]" />
          </motion.button>
          {guide?.guidePdfUrl && (
            <>
              <div className="h-px bg-white/15 mx-2" />
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowGuideModal(true)}
                aria-label="Download country guide PDF"
                title="Download country guide PDF"
                className="w-11 h-11 flex items-center justify-center rounded-full text-white hover:bg-white/15 transition-colors"
              >
                <Download className="w-[18px] h-[18px]" />
              </motion.button>
            </>
          )}
        </div>

        {/* Editorial title block */}
        <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 pb-32 md:pb-40">
          <ScrollReveal>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="h-px w-8 bg-accent-400" />
              <MapPin className="w-3.5 h-3.5 text-accent-400" />
              <span className="font-outfit text-white/80 font-medium text-xs uppercase tracking-[0.2em]">
                {guide?.region || 'Study Abroad Destination'}
              </span>
            </div>
            <p className="font-outfit text-white/60 text-sm md:text-base uppercase tracking-[0.35em] mb-1">
              Study in
            </p>
            <h1 className="font-outfit text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white capitalize leading-[0.95] drop-shadow-[0_4px_28px_rgba(0,0,0,0.35)]">
              {country}
            </h1>
            <Link
              to="/register"
              className="font-outfit group mt-7 inline-flex items-center gap-3 rounded-full bg-accent-400 pl-6 pr-2 py-2 text-sm font-bold text-ink-950 shadow-lg shadow-accent-900/20 transition-transform hover:scale-[1.03]"
            >
              Get Started for Free
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-white transition-transform group-hover:translate-x-0.5">
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </span>
            </Link>
            {updatedLabel && (
              <p className="font-outfit mt-4 text-white/50 text-xs font-medium tracking-wide">
                Guide updated {updatedLabel}
              </p>
            )}
          </ScrollReveal>
        </div>
      </div>

      {/* "At a glance" bar, sits cleanly below the hero instead of overlapping it */}
      <StatBar stats={stats} />
    </section>
  );
};

export default HeroSection;
