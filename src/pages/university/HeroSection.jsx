import {
  Building2, MapPin, Calendar, GraduationCap, Users, Map,
  ExternalLink, Star, Heart, Share2, ShieldCheck,
} from 'lucide-react';
import { GRAIN_BG } from '../../utils/heroGrain';
import { StatBar } from '../../components/study/DetailsPageKit';
import { formatUpdatedAt } from '../../utils/formatDate';

/* Full-bleed gradient banner + quick-stats bar, same visual language and
   layout as the Destination/Country page's hero (grain overlay, accent rank
   chip, and the identical StatBar sitting cleanly below the hero rather than
   overlapping it). */
const UniversityHeroSection = ({ university, coursesCount, isSaved, setIsSaved, onShare }) => {
  const updatedLabel = formatUpdatedAt(university.updatedAt);

  return (
  <div className="relative mb-8 md:mb-12">
    <div className="rounded-3xl overflow-hidden relative shadow-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-8 md:p-14">
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: GRAIN_BG }}
      />

      {/* Floating action rail */}
      <div className="absolute top-6 right-6 flex flex-col bg-white/10 backdrop-blur-xl rounded-full border border-white/20 p-1.5 z-10">
        <button
          onClick={() => setIsSaved((p) => !p)}
          aria-label={isSaved ? 'Remove from saved' : 'Save university'}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isSaved ? 'text-red-400' : 'text-white hover:bg-white/15'}`}
        >
          <Heart className={`w-[18px] h-[18px] ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <div className="h-px bg-white/15 mx-2" />
        <button
          onClick={onShare}
          aria-label="Share this university"
          className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/15 transition-colors"
        >
          <Share2 className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Logo & Info */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10 pt-10 md:pt-4">
        <div className="flex items-center gap-6 md:gap-8 min-w-0">
          <div className="w-24 h-24 md:w-36 md:h-36 bg-white rounded-2xl p-4 md:p-5 shadow-2xl flex items-center justify-center border-4 border-white/20 shrink-0">
            {university.logo ? (
              <img src={university.logo} alt={`${university.name} logo`} className="w-full h-full object-contain" loading="eager" fetchPriority="high" decoding="async" />
            ) : (
              <Building2 className="w-10 h-10 text-ink-500" />
            )}
          </div>
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-white/15 backdrop-blur-md text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/20">
                University Profile
              </span>
              {university.ranking && (
                <span className="px-3 py-1 bg-accent-500 text-white rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-current" />
                  QS Rank #{university.ranking}
                </span>
              )}
              {university.institutionType && (
                <span className="px-3 py-1 bg-white/15 backdrop-blur-md text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/20">
                  {university.institutionType}
                </span>
              )}
            </div>
            <h1 className="font-fraunces italic text-3xl md:text-5xl lg:text-6xl font-medium text-white leading-[1.05]">
              {university.name}
            </h1>
            <div className="flex items-center gap-2 text-white/70 font-bold text-sm">
              <MapPin className="w-4 h-4 text-accent-400 shrink-0" />
              {university.location}, {university.country}
            </div>
          </div>
        </div>

        {university.website && (
          <a
            href={university.website}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-sm hover:bg-white hover:text-ink-900 transition-all flex items-center gap-2 w-fit"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Website
          </a>
        )}
      </div>
    </div>

    {/* "At a glance" bar — identical StatBar to the Destination/Country page,
        sitting cleanly below the hero instead of overlapping it. */}
    <StatBar
      stats={[
        { label: 'Founded', value: university.establishedYear || 'N/A', Icon: Calendar, tone: 'primary' },
        {
          // totalProgramsOffered is the university's real published programme
          // count (researched separately); coursesCount is only how many of
          // those we've curated into the Programs tab — falling back to it
          // here would understate a university that genuinely offers far more
          // than we list (e.g. Oxford's ~350 vs. the handful we catalogue).
          label: 'Total Programs',
          value: university.totalProgramsOffered || coursesCount || 0,
          Icon: GraduationCap,
          tone: 'accent',
        },
        { label: 'Students', value: university.totalStudents || '15,000+', Icon: Users, tone: 'secondary' },
        { label: 'Campus', value: university.campusType || 'Urban', Icon: Map, tone: 'accent' },
      ]}
      gridClassName="grid-cols-2 lg:grid-cols-4"
      maxWidthClassName="max-w-5xl"
    />

    {/* Trust strip — real "last updated" timestamp (never invented) so
        students see this profile is actively maintained, plus a direct
        nudge to cross-check the live figures on the university's own site. */}
    {updatedLabel && (
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-cream-200 bg-white px-5 py-3.5">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-ink-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          Profile last updated {updatedLabel}
        </div>
        {university.website && (
          <a
            href={university.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors shrink-0"
          >
            Confirm details on {university.name}&apos;s official site
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    )}
  </div>
  );
};

export default UniversityHeroSection;
