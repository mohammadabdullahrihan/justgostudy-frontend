import { useRef, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, MapPin, Building2, Calendar, Search } from 'lucide-react';
import FlagIcon from '../../components/FlagIcon';
import { getUniversities } from '../../services/universityService';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// A handful of commonly-requested destinations only — with universities
// spanning ~70 countries, listing every one of them as a filter tab wrapped
// into an unreadable wall of pills. Anything beyond this short list is
// reachable via the search box below, which hands off to the full
// Universities page instead of trying to cram every country in here.
const PRIORITY_COUNTRIES = ['USA', 'UK', 'Australia', 'Canada', 'UAE', 'Germany'];

const COUNTRY_FLAG_MAP = {
  Canada: 'ca',
  'United Kingdom': 'gb',
  UK: 'gb',
  Australia: 'au',
  Germany: 'de',
  USA: 'us',
  'United States': 'us',
  Ireland: 'ie',
};

const rankTag = (ranking) => {
  if (!ranking) return null;
  if (ranking <= 15) return 'Top Ranked';
  if (ranking <= 50) return 'Popular';
  return null;
};

const UniversityCard = ({ uni, featured }) => {
  const tag = rankTag(uni.ranking);
  const flagId = COUNTRY_FLAG_MAP[uni.country] || uni.country;
  const image = uni.logo;

  return (
    <div className="rounded-[28px] border border-white/10 bg-primary-600 p-4 shadow-theme-sm transition-shadow duration-300 hover:shadow-theme-md">
      {/* Image, inset on all 4 sides with its own rounded corners */}
      <div className="relative h-52 overflow-hidden rounded-2xl bg-primary-500">
        {image ? (
          <img loading="lazy" decoding="async" src={image} alt={uni.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-10 w-10 text-primary-200" />
          </div>
        )}
        {tag && (
          <span className="absolute right-3 top-3 rounded-full bg-accent-100 px-3.5 py-1.5 text-xs font-bold text-ink-900 shadow-sm">
            {tag}
          </span>
        )}
      </div>

      <div className="px-1 pt-5 pb-1">
        {/* Pill + meta row */}
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-primary-500 px-3.5 py-1.5 text-xs font-semibold text-primary-100">
            <span className="h-3.5 w-3.5 overflow-hidden rounded-full">
              <FlagIcon languageId={flagId} className="h-full w-full" />
            </span>
            {uni.country}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-primary-100">
            <MapPin className="h-4 w-4" />
            {uni.location}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-outfit text-xl font-bold leading-snug text-white line-clamp-2">
          {uni.name}
        </h3>

        {/* Rank / Est. year row */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-sm text-primary-100">Global Rank</p>
            <p className="font-outfit text-2xl font-bold text-white">
              {uni.ranking ? `#${uni.ranking}` : '—'}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 font-outfit text-lg font-bold text-white">
              <Calendar className="h-4 w-4 text-primary-100" />
              {uni.establishedYear || '—'}
            </div>
            <p className="text-sm text-primary-100">Est. Year</p>
          </div>
        </div>

        {/* CTA, full-width pill, filled for featured card, outline otherwise */}
        <Link
          to={`/study-abroad/university/${uni._id}`}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-colors ${
            featured
              ? 'bg-primary-500 text-white hover:bg-primary-400'
              : 'border border-primary-400 text-primary-100 hover:border-primary-200 hover:bg-primary-500'
          }`}
        >
          View Programs <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

const UniversitySection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countryQuery, setCountryQuery] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        // This widget only ever renders 6 cards + a country filter row, but
        // the endpoint's default response is the full document for every
        // university (280 of them carry a full deep-profile write-up) —
        // ~7.4MB over the wire for what this section actually uses. `select`
        // trims that to just the listing fields the card and filters read.
        const universityData = await getUniversities({
          select: 'name,country,location,logo,ranking,establishedYear',
        });
        const list = Array.isArray(universityData) ? universityData : universityData.universities || universityData.data || [];
        if (!ignore) setUniversities(list);
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load universities.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const filters = useMemo(() => {
    const countries = new Set(universities.map((u) => u.country).filter(Boolean));
    const priority = PRIORITY_COUNTRIES.filter((c) => countries.has(c));
    return ['All', ...priority];
  }, [universities]);

  // All country names, for the search box's datalist autocomplete — every
  // country is reachable this way even though only a handful get their own
  // filter tab above.
  const allCountries = useMemo(
    () => [...new Set(universities.map((u) => u.country).filter(Boolean))].sort(),
    [universities]
  );

  const handleCountrySearch = (e) => {
    e.preventDefault();
    const q = countryQuery.trim();
    if (!q) return;
    // `search` (not `country`) on purpose — it's a forgiving substring match
    // on the Universities page (name/country/location), so a typo or partial
    // country name still lands on real results instead of an empty page.
    navigate(`/study-abroad/universities?search=${encodeURIComponent(q)}`);
  };

  const filtered = useMemo(() => {
    const list =
      activeFilter === 'All' ? universities : universities.filter((u) => u.country === activeFilter);
    return list.slice(0, 9);
  }, [universities, activeFilter]);

  useGSAP(
    () => {
      if (!gridRef.current?.children.length) return;
      gsap.set(gridRef.current.children, { opacity: 0, y: 24 });
      gsap.to(gridRef.current.children, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [filtered] }
  );

  return (
    <section ref={sectionRef} className="relative bg-cream-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
            Our Universities
          </span>
          <h2 className="mt-3 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
            Universities students <span className="text-accent-500">love most</span>
          </h2>
        </div>

        {/* Popular-country tabs + a search box for everything else (~70
            countries total — too many for a readable tab row, see
            PRIORITY_COUNTRIES above). Search hands off to the full
            Universities page instead of trying to fit every country here. */}
        <div className="mb-10 flex flex-col items-center justify-between gap-6 sm:flex-row sm:gap-8">
          {filters.length > 1 && (
            <div className="flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-3 border-b border-ink-100 sm:w-auto sm:justify-start">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors duration-200 ${
                    activeFilter === filter
                      ? 'border-accent-500 text-accent-600'
                      : 'border-transparent text-ink-500 hover:text-accent-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleCountrySearch} className="relative w-full shrink-0 sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              list="university-section-countries"
              value={countryQuery}
              onChange={(e) => setCountryQuery(e.target.value)}
              placeholder="Search any country…"
              className="w-full rounded-full border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-accent-500"
            />
            <datalist id="university-section-countries">
              {allCountries.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl border border-ink-100 bg-primary-600" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-400">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-ink-500">No universities found.</p>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((uni, index) => (
              <UniversityCard key={uni._id} uni={uni} featured={index === 0} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/study-abroad/universities"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-8 py-3.5 font-semibold text-ink-600 transition-colors hover:border-accent-500 hover:text-accent-600"
          >
            View All Universities
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UniversitySection;
