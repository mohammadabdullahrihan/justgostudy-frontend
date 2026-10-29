import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { AlertTriangle, Building2, RotateCcw, Search, MapPin, Award, GraduationCap, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getAllUniversities } from '../services/universityService';
import { getDestinations } from '../services/studyService';
import courseService from '../services/courseService';

// Only what the listing grid + filters actually render, trims the heavy
// text/array fields (description, history, campusLife, facilities,
// admissionRequirements) that the detail page needs but this page doesn't.
const LISTING_FIELDS = 'name,country,location,logo,ranking,establishedYear,campusType';
import Seo from '../components/common/Seo';
import { companyData } from '../constants/companyData';
import GridProgressPill from '../components/study/GridProgressPill';
import LanguageClubPromo from '../components/home/LanguageClubPromo';
import useCardGridFX from '../hooks/useCardGridFX';
import { formatLocation } from '../utils/formatLocation';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const RANKINGS = [
  { label: 'All Rankings', value: 'All' },
  { label: 'Top 100', value: '100' },
  { label: 'Top 500', value: '500' },
  { label: 'Top 1000', value: '1000' },
];
const CAMPUS_TYPES = ['All', 'Urban', 'Suburban', 'Rural'];

// Kept in natural academic progression, never re-sort or alphabetize these.
const COURSE_LEVELS = [
  { label: 'All Levels', value: 'All' },
  { label: 'Foundation', value: 'Foundation' },
  { label: 'Diploma', value: 'Diploma' },
  { label: 'Undergraduate', value: 'Undergraduate' },
  { label: 'Graduate', value: 'Graduate' },
  { label: 'PhD (Research)', value: 'PhD' },
];
const PAGE_SIZE = 12;

// Free-text course levels in the DB ('Postgraduate', 'Master\'s', 'BSc',
// 'Foundation (pathway)', 'Undergraduate (with Foundation Year)'…) get
// bucketed into the 5 canonical stages above. Order matters: 'foundation'
// is checked before 'undergraduate' so a foundation-year degree still
// buckets as Foundation, and the more specific 'undergraduate' is checked
// before the generic 'graduate' substring match.
const normalizeLevel = (raw) => {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes('phd') || s.includes('doctor') || s.includes('research')) return 'PhD';
  if (s.includes('foundation')) return 'Foundation';
  if (s.includes('undergraduate') || s.includes('bachelor') || /\bbsc\b|\bba\b/.test(s)) return 'Undergraduate';
  if (s.includes('postgraduate') || s.includes('graduate') || s.includes('master') || /\bmsc\b|\bma\b/.test(s)) return 'Graduate';
  if (s.includes('diploma') || s.includes('certificate')) return 'Diploma';
  return null;
};

// Lets the search box find 'who offers bachelor/masters' style queries,
// short forms (ug, bsc, msc…) and long forms (undergraduate, postgraduate…)
// both resolve to the same bucket used by courseLevelsByUni.
const LEVEL_SEARCH_SYNONYMS = {
  Undergraduate: ['undergraduate', 'bachelor', 'bachelor\'s', 'bachelors', 'ug', 'bsc', 'ba', 'beng', 'bba', 'llb', 'mbbs'],
  Graduate: ['graduate', 'postgraduate', 'master', 'master\'s', 'masters', 'pg', 'msc', 'ma', 'mba', 'meng', 'llm'],
  PhD: ['phd', 'doctorate', 'doctoral', 'research'],
  Diploma: ['diploma', 'certificate'],
  Foundation: ['foundation', 'pathway', 'bridging'],
};

// Short terms (ug, ba, ma…) require an exact match so they don't false-match
// as a substring of unrelated query text; longer terms match either direction.
const matchesLevelSynonym = (query, offeredLevels) =>
  Object.entries(LEVEL_SEARCH_SYNONYMS).some(
    ([bucket, terms]) =>
      offeredLevels?.has(bucket) &&
      terms.some((term) => (term.length <= 3 ? term === query : term.includes(query) || query.includes(term)))
  );

// Soft glow tints rotated behind each university logo.
const GLOW_TINTS = ['bg-accent-200', 'bg-primary-200', 'bg-secondary-200', 'bg-coral-200'];

// Compact page list: always show first & last, the current page ±1, and use
// '…' gaps elsewhere so long paginations (e.g. 60+ pages) never overflow.
const getPageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push('start-gap');
  for (let p = left; p <= right; p += 1) pages.push(p);
  if (right < total - 1) pages.push('end-gap');
  pages.push(total);
  return pages;
};

// Pill-shaped filter chip: click to open a small option popover beneath it.
// Chips wrap naturally, so new filters can be added without cramming a fixed-width bar.
const FilterChip = ({ icon: Icon, label, value, isActive, isOpen, onToggle, children }) => (
  <div className="relative">
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold outline-none transition-all duration-200 focus:shadow-none ${
        isOpen
          ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-theme-sm'
          : isActive
          ? 'border-primary-200 bg-primary-50/70 text-primary-700'
          : 'border-cream-200 bg-white text-ink-600 hover:border-primary-200 hover:bg-cream-50'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${isOpen || isActive ? 'text-primary-500' : 'text-ink-500'}`} />
      <span className="whitespace-nowrap">
        <span className="hidden sm:inline text-ink-500 font-medium">{label}: </span>
        {value}
      </span>
      <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div data-lenis-prevent className="absolute left-0 top-full z-30 mt-2 max-h-72 w-56 overflow-y-auto rounded-2xl border border-cream-100 bg-white p-1.5 shadow-theme-lg">
        {children}
      </div>
    )}
  </div>
);

const FilterOption = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`block w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold outline-none transition-colors duration-150 focus:shadow-none ${
      active ? 'bg-primary-50 text-primary-700' : 'text-ink-600 hover:bg-cream-50'
    }`}
  >
    {children}
  </button>
);

const Universities = () => {
  const [searchParams] = useSearchParams();
  const [rawUniversities, setRawUniversities] = useState([]);
  const [destinationCountries, setDestinationCountries] = useState([]);
  const [courseLevelsByUni, setCourseLevelsByUni] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [country, setCountry] = useState(searchParams.get('country') || 'All');
  const [rankingRange, setRankingRange] = useState('All');
  const [campusType, setCampusType] = useState('All');
  const [courseLevel, setCourseLevel] = useState('All');
  const [page, setPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);

  const pageRef = useRef(null);
  const gridRef = useRef(null);
  const barRef = useRef(null);
  const fillRef = useRef(null);
  const nameRef = useRef(null);
  const headingRef = useRef(null);
  const filterBarRef = useRef(null);

  const [openFilter, setOpenFilter] = useState(null);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCountry(searchParams.get('country') || 'All');
  }, [searchParams]);

  // Everything is fetched once and filtered client-side, the dataset is
  // small, so this keeps search/filters instant instead of round-tripping
  // to the server on every keystroke, and lets search/country cover the
  // full catalog rather than whatever page happened to be server-filtered.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const universitiesRes = await getAllUniversities({ select: LISTING_FIELDS });
        const list = Array.isArray(universitiesRes)
          ? universitiesRes
          : universitiesRes.universities || universitiesRes.data || [];
        if (!cancelled) setRawUniversities(list);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load universities.');
      } finally {
        if (!cancelled) setLoading(false);
      }

      // Destination options should include every country JustTrip has set up
      // as a destination, not just ones with a university added yet.
      try {
        const destinations = await getDestinations({ activeOnly: true });
        if (!cancelled) setDestinationCountries(destinations.map((d) => d.country).filter(Boolean));
      } catch {
        /* Destination filter just falls back to university countries */
      }

      // Course levels power the 'Course Level' filter. Non-fatal if it fails,
      // that filter just won't narrow anything down. Uses the lightweight
      // { universityId, level } endpoint instead of paginated getCourses, so
      // this doesn't pay for the full course+university aggregation just to
      // read two fields off every course.
      try {
        const rows = await courseService.getCourseLevelsByUniversity();
        const map = {};
        (rows || []).forEach((c) => {
          const uniId = c.universityId?._id || c.universityId;
          const level = normalizeLevel(c.level);
          if (!uniId || !level) return;
          const key = String(uniId);
          if (!map[key]) map[key] = new Set();
          map[key].add(level);
        });
        if (!cancelled) setCourseLevelsByUni(map);
      } catch {
        /* course-level filter degrades gracefully */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const universities = useMemo(() => {
    let list = [...rawUniversities];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (uni) =>
          [uni.name, uni.country, uni.location].some((field) => field?.toLowerCase().includes(q)) ||
          matchesLevelSynonym(q, courseLevelsByUni[uni._id])
      );
    }

    if (country !== 'All') {
      list = list.filter((uni) => uni.country === country);
    }

    if (rankingRange !== 'All') {
      const maxRank = parseInt(rankingRange, 10);
      list = list.filter(
        (uni) =>
          uni.ranking !== null &&
          uni.ranking !== undefined &&
          uni.ranking <= maxRank,
      );
    }

    if (campusType !== 'All') {
      list = list.filter(
        (uni) =>
          uni.campusType &&
          uni.campusType.toLowerCase().includes(campusType.toLowerCase()),
      );
    }

    if (courseLevel !== 'All') {
      list = list.filter((uni) => courseLevelsByUni[uni._id]?.has(courseLevel));
    }

    return list;
  }, [rawUniversities, search, country, rankingRange, campusType, courseLevel, courseLevelsByUni]);

  // Any filter change should jump back to page 1 so results stay visible.
  useEffect(() => {
    setPage(1);
  }, [search, country, rankingRange, campusType, courseLevel]);

  const countryOptions = useMemo(() => {
    const set = new Set([
      ...rawUniversities.map((uni) => uni.country).filter(Boolean),
      ...destinationCountries,
    ]);
    return ['All', ...Array.from(set).sort()];
  }, [rawUniversities, destinationCountries]);

  const totalPages = Math.max(1, Math.ceil(universities.length / PAGE_SIZE));

  const paginatedUniversities = useMemo(
    () => universities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [universities, page]
  );

  useCardGridFX(pageRef, gridRef, { barRef, fillRef, nameRef }, [paginatedUniversities, loading]);

  // Heading word-reveal + underline draw (shared animation system).
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });
      const underline = pageRef.current?.querySelector('.hero-underline');
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from(split.words, { opacity: 0, y: 24, stagger: 0.06, duration: 0.6 })
        .fromTo(underline, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.2');
    },
    { scope: pageRef, dependencies: [] }
  );

  const hasActiveFilters =
    search || country !== 'All' || rankingRange !== 'All' || campusType !== 'All' || courseLevel !== 'All';

  const handleReset = () => {
    setSearch('');
    setCountry('All');
    setRankingRange('All');
    setCampusType('All');
    setCourseLevel('All');
  };

  // Close the open filter segment on outside click or Escape.
  useEffect(() => {
    if (!openFilter) return;
    const handlePointerDown = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) setOpenFilter(null);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenFilter(null);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openFilter]);

  const toggleFilter = (key) => setOpenFilter((prev) => (prev === key ? null : key));

  return (
    <div ref={pageRef} className="relative mx-auto max-w-[1440px] px-8 pb-12 pt-8 font-sans sm:px-12 lg:px-20">
      <Seo
        title="Partner Universities Worldwide - Just Go Study"
        description="Explore Just Go Study's network of universities across the UK, USA, Canada, Australia and more. Compare rankings, campus life and admission requirements."
        canonical={`${companyData.siteUrl}/study-abroad/universities`}
      />
      {/* Navy premium banner: heading + search + filters */}
      <div className="relative mb-10 rounded-[2.5rem] bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 px-6 py-12 sm:px-10 lg:px-14">
        {/* Clipped separately from the container so filter dropdowns below aren't cut off */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem]">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-secondary-500/10 blur-3xl" />
        </div>

        <div className="relative mb-8">
          <h1 ref={headingRef} className="mb-3 font-outfit text-4xl font-extrabold leading-tight text-white md:text-5xl">
            Universities <span className="text-accent-400">We Work With</span>
          </h1>
          {/* animated underline that draws under the heading */}
          <svg className="mb-4 h-3 w-56 max-w-full" viewBox="0 0 240 12" fill="none" preserveAspectRatio="none" aria-hidden="true">
            <path
              className="hero-underline"
              d="M2 8 C 60 2, 180 2, 238 8"
              stroke="#f7a730"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength="1"
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
          </svg>
          <p className="max-w-2xl text-base leading-relaxed text-primary-100">
            Browse accredited universities from around the world and
            find the right fit for your studies.
          </p>
        </div>

        {/* Search + filters */}
        <div ref={filterBarRef} className="relative z-20 space-y-4">
        <div className="relative">
          <div
            className={`flex items-center gap-3 rounded-[26px] border-2 bg-white py-2.5 pl-2.5 pr-2.5 shadow-theme-md transition-all duration-300 sm:gap-4 sm:py-3 sm:pl-3 sm:pr-3 ${
              searchFocused ? 'border-primary-300 shadow-theme-lg' : 'border-cream-100'
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 sm:h-12 sm:w-12 ${
                searchFocused ? 'bg-primary-600' : 'bg-accent-100'
              }`}
            >
              <Search className={`h-5 w-5 transition-colors duration-300 ${searchFocused ? 'text-white' : 'text-accent-600'}`} />
            </div>

            <input
              id="university-search"
              type="text"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                setOpenFilter(null);
                setSearchFocused(true);
              }}
              onBlur={() => setSearchFocused(false)}
              placeholder="Find your university, Oxford, Toronto, Germany…"
              className="min-w-0 flex-1 bg-transparent font-outfit text-lg font-bold text-ink-900 outline-none focus:shadow-none focus-visible:outline-none placeholder:font-semibold placeholder:text-ink-500 sm:text-xl"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                title="Clear search"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-500 outline-none transition-colors hover:bg-cream-200 hover:text-ink-700 focus:shadow-none"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {!loading && !error && (
              <div className="flex shrink-0 items-baseline gap-1 rounded-2xl bg-cream-50 px-3 py-2 sm:gap-1.5 sm:px-4 sm:py-2.5">
                <span className="font-outfit text-base font-black leading-none text-primary-700 sm:text-lg">
                  {universities.length}
                </span>
                <span className="hidden text-[10px] font-bold uppercase leading-tight tracking-wide text-ink-500 sm:inline">
                  {universities.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
            )}
          </div>

          <svg
            className="pointer-events-none absolute -bottom-1.5 left-16 h-2 w-40 max-w-[55%] sm:left-[4.5rem]"
            viewBox="0 0 160 8"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M2 5 C 40 1, 120 1, 158 5"
              stroke="#f7a730"
              strokeWidth="3"
              strokeLinecap="round"
              pathLength="1"
              style={{
                strokeDasharray: 1,
                strokeDashoffset: searchFocused ? 0 : 1,
                transition: 'stroke-dashoffset 0.5s ease',
              }}
            />
          </svg>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterChip
            icon={MapPin}
            label="Destination"
            value={country === 'All' ? 'All Countries' : country}
            isActive={country !== 'All'}
            isOpen={openFilter === 'country'}
            onToggle={() => toggleFilter('country')}
          >
            {countryOptions.map((c) => (
              <FilterOption
                key={c}
                active={country === c}
                onClick={() => {
                  setCountry(c);
                  setOpenFilter(null);
                }}
              >
                {c === 'All' ? 'All Countries' : c}
              </FilterOption>
            ))}
          </FilterChip>

          <FilterChip
            icon={Award}
            label="Ranking"
            value={RANKINGS.find((r) => r.value === rankingRange)?.label || 'All Rankings'}
            isActive={rankingRange !== 'All'}
            isOpen={openFilter === 'ranking'}
            onToggle={() => toggleFilter('ranking')}
          >
            {RANKINGS.map((r) => (
              <FilterOption
                key={r.value}
                active={rankingRange === r.value}
                onClick={() => {
                  setRankingRange(r.value);
                  setOpenFilter(null);
                }}
              >
                {r.label}
              </FilterOption>
            ))}
          </FilterChip>

          <FilterChip
            icon={Building2}
            label="Campus"
            value={campusType === 'All' ? 'All Campuses' : campusType}
            isActive={campusType !== 'All'}
            isOpen={openFilter === 'campus'}
            onToggle={() => toggleFilter('campus')}
          >
            {CAMPUS_TYPES.map((t) => (
              <FilterOption
                key={t}
                active={campusType === t}
                onClick={() => {
                  setCampusType(t);
                  setOpenFilter(null);
                }}
              >
                {t === 'All' ? 'All Campuses' : t}
              </FilterOption>
            ))}
          </FilterChip>

          <FilterChip
            icon={GraduationCap}
            label="Courses"
            value={COURSE_LEVELS.find((l) => l.value === courseLevel)?.label || 'All Levels'}
            isActive={courseLevel !== 'All'}
            isOpen={openFilter === 'courseLevel'}
            onToggle={() => toggleFilter('courseLevel')}
          >
            {COURSE_LEVELS.map((l) => (
              <FilterOption
                key={l.value}
                active={courseLevel === l.value}
                onClick={() => {
                  setCourseLevel(l.value);
                  setOpenFilter(null);
                }}
              >
                {l.label}
              </FilterOption>
            ))}
          </FilterChip>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              title="Reset filters"
              className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-primary-200 outline-none transition-colors focus:shadow-none hover:text-red-400"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="glass-card animate-pulse rounded-2xl border border-cream-200 p-6"
            >
              <div className="mb-4 h-14 w-14 rounded-xl bg-cream-200"></div>
              <div className="mb-2 h-4 w-3/4 rounded bg-cream-200"></div>
              <div className="h-3 w-1/2 rounded bg-cream-200"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
          <AlertTriangle className="mx-auto mb-3 h-6 w-6" />
          {error}
        </div>
      ) : universities.length === 0 ? (
        <div className="glass-card group relative mx-auto my-6 max-w-lg overflow-hidden rounded-3xl border border-cream-200 p-12 text-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent opacity-50"></div>
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-cream-200 bg-white shadow-theme-lg transition-all duration-300 group-hover:border-primary-500/30">
            <div className="absolute inset-0 rounded-2xl bg-primary-500/10 opacity-50 blur-md transition-opacity group-hover:opacity-100"></div>
            <Building2 className="relative z-10 h-8 w-8 text-primary-600" />
          </div>
          <h3 className="mb-2 font-outfit text-xl font-bold text-ink-900">
            No Universities Found
          </h3>
          <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-ink-600">
            We couldn&apos;t find any universities matching your search
            query or selected country. Try updating your filters to find
            institutions.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2.5 text-xs font-bold text-primary-600 shadow-theme-sm transition-all hover:border-primary-300 hover:bg-primary-100"
          >
            <RotateCcw className="h-3 w-3" /> Reset Search & Filters
          </button>
        </div>
      ) : (
        <>
        <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedUniversities.map((uni, index) => (
            <Link
              key={uni._id}
              to={`/study-abroad/university/${uni._id}`}
              data-name={uni.name}
              className="fx-card group flex flex-col items-center rounded-[28px] border border-cream-100 bg-white px-6 py-10 text-center shadow-theme-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-theme-md"
            >
              {/* Logo in a softly glowing circle */}
              <div className="relative flex h-28 w-28 items-center justify-center">
                <div className={`absolute inset-0 rounded-full opacity-50 blur-lg ${GLOW_TINTS[index % GLOW_TINTS.length]}`} />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-theme-sm ring-1 ring-ink-100">
                  {uni.logo ? (
                    <img loading="lazy" decoding="async" src={uni.logo} alt={uni.name} className="h-16 w-16 object-contain" />
                  ) : (
                    <Building2 className="h-9 w-9 text-ink-500" />
                  )}
                </div>
              </div>

              <h3 className="mt-6 font-outfit text-xl font-bold leading-snug text-ink-900 line-clamp-2 transition-colors group-hover:text-primary-600">
                {uni.name}
              </h3>

              <span className="mt-4 inline-flex items-center rounded-full bg-ink-50 px-3.5 py-1.5 text-xs font-medium text-ink-500">
                {formatLocation(uni.location, uni.country)}
              </span>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-100 bg-white text-ink-500 shadow-theme-sm transition-all hover:text-primary-600 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {getPageList(page, totalPages).map((p) =>
              typeof p === 'string' ? (
                <span key={p} className="flex h-11 w-8 items-end justify-center pb-3 text-ink-500">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={`h-11 w-11 rounded-full text-sm font-bold transition-all ${p === page
                    ? 'bg-primary-600 text-white shadow-theme-md'
                    : 'border border-cream-100 bg-white text-ink-500 hover:text-ink-900'
                    }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-100 bg-white text-ink-500 shadow-theme-sm transition-all hover:text-primary-600 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        </>
      )}

      <div className="mt-12">
        <LanguageClubPromo variant="wide" />
      </div>

      <GridProgressPill barRef={barRef} fillRef={fillRef} nameRef={nameRef} label="Exploring universities…" />
    </div>
  );
};

export default Universities;
