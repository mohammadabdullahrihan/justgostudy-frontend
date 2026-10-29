import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronRight, MapPin, LandPlot } from 'lucide-react';
import { getLogoTone } from '../../utils/tabTones';

/* ============================== Shared card grids ============================== */
/* Reused by the Overview and Universities tab panels, and given their own GSAP
   stagger so the cards animate in every time the panel mounts (i.e. on tab switch). */

export const UniversityCard = ({ uni, idx = 0 }) => {
  const tone = getLogoTone(idx);
  return (
    <Link
      to={`/study-abroad/university/${uni._id}`}
      className={`block bg-white border border-cream-100 rounded-2xl p-6 shadow-sm hover:shadow-lg ${tone.hoverBorder} transition-all group`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 ${tone.logoBg} rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md`}>
          {uni.logo ? (
            <img loading="lazy" decoding="async" src={uni.logo} alt={uni.name} className="w-full h-full object-contain p-2 bg-white" />
          ) : (
            <span className="text-xl font-bold text-white">{uni.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-ink-900 group-hover:text-primary-600 transition-colors">{uni.name}</h4>
          <div className="flex items-center gap-3 mt-1">
            {uni.ranking && (
              <span className={`text-xs ${tone.chipBg} ${tone.chipText} px-2 py-1 rounded font-medium`}>Rank #{uni.ranking}</span>
            )}
            {uni.institutionType && (
              <span className="text-xs bg-cream-100 text-ink-600 px-2 py-1 rounded font-medium">{uni.institutionType}</span>
            )}
            <span className="text-xs text-ink-500">{uni.location}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-ink-500 group-hover:text-primary-600 transition-colors" />
      </div>
    </Link>
  );
};

export const UniversityGrid = ({ universities }) => {
  const gridRef = useRef(null);

  useGSAP(
    () => {
      if (!gridRef.current?.children.length) return;
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
      );
    },
    { scope: gridRef, dependencies: [universities] }
  );

  if (!universities.length) {
    return <p className="text-black font-medium text-[17px] italic">No universities found for this country.</p>;
  }

  return (
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {universities.map((uni, idx) => (
        <UniversityCard key={uni._id} uni={uni} idx={idx} />
      ))}
    </div>
  );
};

/* ============================== Grouped-by-region grid ============================== */
/* Premium variant for destinations with a `subRegion` taxonomy (USA, UK, Canada,
   Australia, New Zealand) — a navy/gold "region selector" rail up top (reads as
   a map legend, not a generic filter-pill row), then each region rendered as
   its own editorial section with a numbered index mark instead of one flat
   grid. Falls back to the plain UniversityGrid above when no university in
   this country has a subRegion set, so it's a no-op for every other destination. */

const ALL_REGIONS = 'All';

export const GroupedUniversityGrid = ({ universities }) => {
  const [activeRegion, setActiveRegion] = useState(ALL_REGIONS);
  const gridRef = useRef(null);

  const { regions, byRegion } = useMemo(() => {
    const map = new Map();
    universities.forEach((uni) => {
      const key = uni.subRegion || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(uni);
    });
    return { regions: [...map.keys()], byRegion: map };
  }, [universities]);

  const visibleRegions = activeRegion === ALL_REGIONS ? regions : [activeRegion];
  const topRegion = useMemo(
    () => regions.reduce((best, r) => (byRegion.get(r).length > byRegion.get(best || r).length ? r : best), regions[0]),
    [regions, byRegion]
  );

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const cards = gridRef.current.querySelectorAll('[data-uni-card]');
      if (!cards.length) return;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out' }
      );
    },
    { scope: gridRef, dependencies: [activeRegion, universities] }
  );

  if (!universities.length) {
    return <p className="text-black font-medium text-[17px] italic">No universities found for this country.</p>;
  }

  return (
    <div>
      {/* Region selector rail — navy/gold "map legend" cards, not plain pills.
          Wraps so every region is visible at once, no horizontal scroll/slider. */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <button
          type="button"
          onClick={() => setActiveRegion(ALL_REGIONS)}
          className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl px-5 py-4 text-left transition-all duration-200 ${
            activeRegion === ALL_REGIONS
              ? 'bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 shadow-lg shadow-primary-900/20'
              : 'bg-white border border-cream-100 hover:border-primary-200 hover:shadow-md'
          }`}
        >
          <LandPlot className={`h-5 w-5 mb-2 ${activeRegion === ALL_REGIONS ? 'text-accent-400' : 'text-primary-500'}`} />
          <span className={`font-outfit text-sm font-bold leading-tight ${activeRegion === ALL_REGIONS ? 'text-white' : 'text-ink-900'}`}>
            All Regions
          </span>
          <span className={`mt-1 text-xs font-semibold ${activeRegion === ALL_REGIONS ? 'text-white/60' : 'text-ink-500'}`}>
            {universities.length} total
          </span>
        </button>
        {regions.map((region) => {
          const isActive = activeRegion === region;
          return (
            <button
              key={region}
              type="button"
              onClick={() => setActiveRegion(region)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl px-5 py-4 text-left transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 shadow-lg shadow-primary-900/20'
                  : 'bg-white border border-cream-100 hover:border-primary-200 hover:shadow-md'
              }`}
            >
              {region === topRegion && (
                <span className={`absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${isActive ? 'bg-accent-400 text-ink-950' : 'bg-accent-100 text-accent-700'}`}>
                  Most
                </span>
              )}
              <MapPin className={`h-5 w-5 mb-2 ${isActive ? 'text-accent-400' : 'text-primary-500'}`} />
              <span className={`font-outfit text-sm font-bold leading-tight pr-6 ${isActive ? 'text-white' : 'text-ink-900'}`}>
                {region}
              </span>
              <span className={`mt-1 text-xs font-semibold ${isActive ? 'text-white/60' : 'text-ink-500'}`}>
                {byRegion.get(region).length} {byRegion.get(region).length === 1 ? 'university' : 'universities'}
              </span>
            </button>
          );
        })}
      </div>

      {/* grouped sections */}
      <div ref={gridRef} className="space-y-14">
        {visibleRegions.map((region, sectionIdx) => {
          const regionUnis = byRegion.get(region) || [];
          if (!regionUnis.length) return null;
          return (
            <div key={region}>
              <div className="mb-6 flex items-center gap-4">
                <span className="font-outfit flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-sm font-bold text-accent-400 shadow-md shadow-primary-900/15">
                  {String(sectionIdx + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-outfit text-xl font-bold text-ink-900">{region}</h3>
                  <p className="text-xs font-semibold text-ink-500">{regionUnis.length} {regionUnis.length === 1 ? 'university' : 'universities'} in our network</p>
                </div>
                <span className="ml-2 h-px flex-1 bg-gradient-to-r from-cream-200 via-cream-200 to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {regionUnis.map((uni, idx) => (
                  <div key={uni._id} data-uni-card>
                    <UniversityCard uni={uni} idx={idx} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

