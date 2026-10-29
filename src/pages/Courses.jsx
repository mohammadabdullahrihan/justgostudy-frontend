import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import {
  Search, RotateCcw, AlertTriangle, GraduationCap,
  Building2, MapPin, ChevronLeft, ChevronRight, Clock,
  DollarSign, ChevronDown, X, Trophy, Calendar,
  Award,
} from 'lucide-react';
import courseService from '../services/courseService';
import { getUniversityCountries } from '../services/universityService';
import { getDestinations } from '../services/studyService';
import Seo from '../components/common/Seo';
import { companyData } from '../constants/companyData';
import GridProgressPill from '../components/study/GridProgressPill';
import LanguageClubPromo from '../components/home/LanguageClubPromo';
import useCardGridFX from '../hooks/useCardGridFX';
import { formatTuitionUSD, hasTuitionFee } from '../utils/formatTuition';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Kept in natural academic progression, never re-sort or alphabetize these.
const LEVELS = [
  { label: 'All Levels', value: 'All' },
  { label: 'Foundation', value: 'Foundation' },
  { label: 'Diploma', value: 'Diploma' },
  { label: 'Undergraduate', value: 'Undergraduate' },
  { label: 'Postgraduate', value: 'Postgraduate' },
  { label: 'PhD (Research)', value: 'PhD' },
];
const BUDGETS = [
  { label: 'Any Budget', value: '' },
  { label: 'Under $10k', value: '10000' },
  { label: 'Under $20k', value: '20000' },
  { label: 'Under $30k', value: '30000' },
  { label: 'Under $50k', value: '50000' },
];
const PAGE_SIZE = 9;

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

// Solid brand-navy ring that fades in on card hover.
const HOVER_RING = {
  background: 'linear-gradient(135deg, #0e1f6d, #3454e5)',
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

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [countries, setCountries] = useState(['All']);

  const pageRef = useRef(null);
  const gridRef = useRef(null);
  const barRef = useRef(null);
  const fillRef = useRef(null);
  const nameRef = useRef(null);
  const headingRef = useRef(null);
  const filterBarRef = useRef(null);

  const [openFilter, setOpenFilter] = useState(null);

  const [filters, setFilters] = useState({
    country: searchParams.get('country') || 'All',
    level: searchParams.get('level') || 'All',
    minIelts: '',
    maxFee: '',
    search: searchParams.get('search') || '',
    universityId: searchParams.get('universityId') || '',
  });

  // Reflect filters into the URL (one-way: filters -> URL). A reverse
  // effect that read the URL back into filters used to exist here too, but
  // it raced with setSearchParams on every keystroke, the async URL update
  // could resolve after a later keystroke and overwrite the input with a
  // stale value, which looked like random backspacing while typing fast.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.country && filters.country !== 'All') params.set('country', filters.country);
    if (filters.level && filters.level !== 'All') params.set('level', filters.level);
    if (filters.search) params.set('search', filters.search);
    if (filters.universityId) params.set('universityId', filters.universityId);
    setSearchParams(params, { replace: true });
  }, [filters.country, filters.level, filters.search, filters.universityId, setSearchParams]);

  // Destination options merge every university's country with every
  // country JustTrip has set up as a destination (Destination collection),
  // so a country shows up here as soon as it's onboarded as a destination,
  // even before a university is added under it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [universityCountries, destinations] = await Promise.all([
          getUniversityCountries(),
          getDestinations({ activeOnly: true }),
        ]);
        if (cancelled) return;
        const destinationCountries = destinations.map((d) => d.country).filter(Boolean);
        const merged = Array.from(new Set([...universityCountries, ...destinationCountries])).sort((a, b) =>
          a.localeCompare(b)
        );
        setCountries(['All', ...merged]);
      } catch {
        /* Destination filter just keeps 'All' if this fails */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE };
      if (filters.country !== 'All') params.country = filters.country;
      if (filters.level !== 'All') params.level = filters.level;
      if (filters.minIelts) params.ielts = filters.minIelts;
      if (filters.maxFee) params.feeMax = filters.maxFee;
      if (filters.search) params.name = filters.search;
      if (filters.universityId) params.universityId = filters.universityId;

      const courseListData = await courseService.getCourses(params);
      // Now the backend returns { courses, total }
      const list = Array.isArray(courseListData) ? courseListData : (courseListData.courses || courseListData.data || []);
      const count = courseListData.total || courseListData.count || list.length;
      setCourses(list);
      setTotal(count);
    } catch (err) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, [page, filters.country, filters.level, filters.minIelts, filters.maxFee, filters.search, filters.universityId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useCardGridFX(pageRef, gridRef, { barRef, fillRef, nameRef }, [courses, loading]);

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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ country: 'All', level: 'All', minIelts: '', maxFee: '', search: '', universityId: '' });
    setPage(1);
    setSearchParams({}, { replace: true });
  };

  const clearUniversityFilter = () => {
    setFilters((prev) => ({ ...prev, universityId: '' }));
    setPage(1);
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

  const hasActiveFilters =
    filters.search || filters.country !== 'All' || filters.level !== 'All' || filters.maxFee || filters.universityId;

  const filteredUniversityName = filters.universityId
    ? courses.find((c) => (c.universityId?._id || c.universityId) === filters.universityId)?.universityId?.name
    : null;

  return (
    <div ref={pageRef} className="relative mx-auto max-w-[1440px] px-8 pb-12 pt-8 font-sans sm:px-12 lg:px-20">
      <Seo
        title="Study Abroad Programs & Courses - Just Go Study"
        description="Browse foundation, diploma, undergraduate, postgraduate and PhD programs from universities in the UK, USA, Canada, Australia and more. Filter by country, level and budget."
        canonical={`${companyData.siteUrl}/study-abroad/courses`}
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
            Explore <span className="text-accent-400">Global Programs</span>
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
          <p className="max-w-2xl text-lg leading-relaxed text-primary-100">
            Find your academic match across programs at top global universities.
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
              id="course-search"
              type="text"
              autoComplete="off"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onFocus={() => {
                setOpenFilter(null);
                setSearchFocused(true);
              }}
              onBlur={() => setSearchFocused(false)}
              placeholder="Find your program, Data Science, MBA, Bachelor…"
              className="min-w-0 flex-1 bg-transparent font-outfit text-lg font-bold text-ink-900 outline-none focus:shadow-none focus-visible:outline-none placeholder:font-semibold placeholder:text-ink-500 sm:text-xl"
            />

            {filters.search && (
              <button
                type="button"
                onClick={() => handleFilterChange('search', '')}
                title="Clear search"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-500 outline-none transition-colors hover:bg-cream-200 hover:text-ink-700 focus:shadow-none"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {!loading && !error && (
              <div className="flex shrink-0 items-baseline gap-1 rounded-2xl bg-cream-50 px-3 py-2 sm:gap-1.5 sm:px-4 sm:py-2.5">
                <span className="font-outfit text-base font-black leading-none text-primary-700 sm:text-lg">
                  {total}
                </span>
                <span className="hidden text-[10px] font-bold uppercase leading-tight tracking-wide text-ink-500 sm:inline">
                  {total === 1 ? 'match' : 'matches'}
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
            value={filters.country === 'All' ? 'All Countries' : filters.country}
            isActive={filters.country !== 'All'}
            isOpen={openFilter === 'country'}
            onToggle={() => toggleFilter('country')}
          >
            {countries.map((c) => (
              <FilterOption
                key={c}
                active={filters.country === c}
                onClick={() => {
                  handleFilterChange('country', c);
                  setOpenFilter(null);
                }}
              >
                {c === 'All' ? 'All Countries' : c}
              </FilterOption>
            ))}
          </FilterChip>

          <FilterChip
            icon={GraduationCap}
            label="Level"
            value={LEVELS.find((l) => l.value === filters.level)?.label || 'All Levels'}
            isActive={filters.level !== 'All'}
            isOpen={openFilter === 'level'}
            onToggle={() => toggleFilter('level')}
          >
            {LEVELS.map((l) => (
              <FilterOption
                key={l.value}
                active={filters.level === l.value}
                onClick={() => {
                  handleFilterChange('level', l.value);
                  setOpenFilter(null);
                }}
              >
                {l.label}
              </FilterOption>
            ))}
          </FilterChip>

          <FilterChip
            icon={DollarSign}
            label="Budget"
            value={BUDGETS.find((b) => b.value === filters.maxFee)?.label || 'Any Budget'}
            isActive={!!filters.maxFee}
            isOpen={openFilter === 'budget'}
            onToggle={() => toggleFilter('budget')}
          >
            {BUDGETS.map((b) => (
              <FilterOption
                key={b.label}
                active={filters.maxFee === b.value}
                onClick={() => {
                  handleFilterChange('maxFee', b.value);
                  setOpenFilter(null);
                }}
              >
                {b.label}
              </FilterOption>
            ))}
          </FilterChip>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset filters"
              className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-primary-200 outline-none transition-colors focus:shadow-none hover:text-red-400"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          )}
        </div>
        </div>
      </div>

      {filters.universityId && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary-100 bg-primary-50/60 px-5 py-3.5">
          <p className="flex items-center gap-2 text-sm font-bold text-primary-700">
            <Building2 className="h-4 w-4" />
            Showing programs from {filteredUniversityName || 'this university'}
          </p>
          <button
            type="button"
            onClick={clearUniversityFilter}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3.5 py-1.5 text-xs font-bold text-primary-700 transition-colors hover:border-primary-400"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      )}

      {/* Courses Grid */}
      <div>
        {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-[1.75rem] border border-cream-100 bg-white p-3 shadow-theme-sm">
                  <div className="h-44 animate-pulse rounded-[1.35rem] bg-cream-100" />
                  <div className="space-y-3 px-2 py-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-cream-100" />
                    <div className="h-4 w-full animate-pulse rounded bg-cream-100" />
                    <div className="h-10 w-full animate-pulse rounded-full bg-cream-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-100 bg-red-50 p-8 text-center text-red-700">
              <AlertTriangle className="mx-auto mb-4 h-8 w-8" />
              <p className="text-lg font-bold">{error}</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="mx-auto my-12 max-w-xl rounded-[3rem] border-2 border-dashed border-cream-200 bg-cream-50 p-16 text-center">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-theme-lg">
                <GraduationCap className="h-8 w-8 text-ink-500" />
              </div>
              <h3 className="mb-3 font-outfit text-2xl font-bold text-ink-900">No Programs Found</h3>
              <p className="mb-8 text-lg font-medium leading-relaxed text-ink-600">
                We couldn&apos;t find any courses matching your specific criteria. Try broadening your search or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 rounded-full border-2 border-cream-200 bg-white px-8 py-4 text-base font-bold text-ink-900 transition-all hover:border-ink-900"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <>
              <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {courses.map((course) => {
                  const uni = course.universityId || {};
                  const uniLogo = uni.logo;
                  const meta = course.duration;
                  const city = uni.location;
                  const country = uni.country || 'Global';
                  const location = city && country ? `${city}, ${country}` : country;
                  const ranking = uni.ranking;
                  const hasScholarships = uni.scholarshipsData?.length > 0;
                  const intakes = course.intake?.filter(Boolean).slice(0, 2) || [];
                  const description = course.description?.trim();
                  const requirements = course.requirements?.filter(Boolean).slice(0, 3) || [];

                  return (
                    <div
                      key={course._id}
                      data-name={course.name}
                      className="fx-card group relative h-full transition-transform duration-300 hover:-translate-y-2 will-change-transform"
                    >
                      {/* solid brand-navy ring, fades in on hover */}
                      <div className="fx-ring pointer-events-none absolute -inset-[2px] rounded-[1.85rem] opacity-0" style={HOVER_RING} />

                      <div className="relative flex h-full flex-col rounded-[1.75rem] border border-cream-100 bg-white p-3 shadow-theme-sm transition-shadow duration-300 group-hover:shadow-theme-lg">
                        {/* Thumbnail */}
                        <div className="relative">
                          <Link to={`/study-abroad/course/${course._id}`} className="block overflow-hidden rounded-[1.35rem]">
                            <div className="h-44 w-full overflow-hidden bg-white">
                              {uniLogo ? (
                                <img
                                  src={uniLogo}
                                  alt={`${uni.name || 'University'} logo`}
                                  loading="lazy"
                                  className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-400 transition-transform duration-700 group-hover:scale-105">
                                  <GraduationCap className="h-10 w-10 text-white/70" />
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Ranking badge (top-left) */}
                          {ranking && (
                            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-ink-900 shadow-theme-md">
                              <Trophy className="h-3 w-3 fill-ink-900" />
                              QS #{ranking}
                            </span>
                          )}

                          {/* Level tag (top-right) */}
                          <span className="absolute right-3 top-3 rounded-full bg-accent-100 px-3 py-1.5 text-xs font-bold text-accent-900 shadow-theme-sm">
                            {course.level}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                          {/* Row 1: Location + Duration */}
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-200 bg-cream-50/70 px-3 py-1 text-xs font-bold text-ink-700">
                              <MapPin className="h-3.5 w-3.5 text-primary-500" />
                              <span className="line-clamp-1">{location}</span>
                            </span>
                            {meta && (
                              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-ink-500">
                                <Clock className="h-3.5 w-3.5" />
                                {meta}
                              </span>
                            )}
                          </div>

                          {/* Row 2: Intake + Scholarship chips */}
                          {(intakes.length > 0 || hasScholarships) && (
                            <div className="mb-3 flex flex-wrap items-center gap-1.5">
                              {intakes.length > 0 && intakes.map((it, i) => (
                                <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700">
                                  <Calendar className="h-3 w-3" />
                                  {it}
                                </span>
                              ))}
                              {hasScholarships && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                  <Award className="h-3 w-3" />
                                  Funding
                                </span>
                              )}
                            </div>
                          )}

                          {/* Title */}
                          <Link to={`/study-abroad/course/${course._id}`} className="group/title block">
                            <h3 className="mb-1.5 line-clamp-2 text-lg font-extrabold leading-snug text-ink-900 transition-colors group-hover/title:text-primary-600">
                              {course.name}
                            </h3>
                          </Link>

                          {/* University */}
                          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-500">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="line-clamp-1">{uni.name || 'University'}</span>
                          </p>

                          {/* Short description — 2 lines max */}
                          {description && (
                            <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-ink-500">
                              {description}
                            </p>
                          )}

                          {/* Entry requirements preview */}
                          {requirements.length > 0 && (
                            <div className="mb-3 space-y-1">
                              {requirements.map((req, i) => (
                                <p key={i} className="flex items-start gap-1.5 text-[11px] text-ink-500">
                                  <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-primary-400" />
                                  <span className="line-clamp-1">{req}</span>
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Spacer so Tuition/IELTS always sit at bottom */}
                          <div className="mt-auto" />

                          {/* Divider */}
                          <div className="my-3 border-t border-dashed border-cream-200" />

                          {/* Price + IELTS */}
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-ink-500">Tuition</p>
                              <p className={`font-extrabold leading-none text-ink-900 ${hasTuitionFee(course) ? 'text-2xl' : 'text-base'}`}>
                                {formatTuitionUSD(course)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-ink-500">IELTS</p>
                              <p className="text-xl font-extrabold leading-none text-primary-600">{course.ieltsRequirement || '6.5'}</p>
                            </div>
                          </div>

                          {/* CTA */}
                          <Link
                            to={`/student/apply?courseId=${course._id}&universityId=${uni._id}`}
                            className="relative mt-4 block rounded-full bg-primary-600 py-3 text-center text-sm font-bold uppercase tracking-widest text-white shadow-theme-md transition-all hover:bg-primary-500"
                          >
                            Enroll Course
                            {/* underline drawn on card hover */}
                            <svg className="pointer-events-none absolute bottom-1.5 left-1/2 h-1 w-16 -translate-x-1/2" viewBox="0 0 100 4" preserveAspectRatio="none" fill="none" aria-hidden="true">
                              <path
                                className="fx-underline"
                                pathLength="1"
                                d="M0 2 H100"
                                stroke="#ffffff"
                                strokeWidth="3"
                                strokeLinecap="round"
                                style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
        </div>

      <div className="mt-12">
        <LanguageClubPromo variant="wide" />
      </div>

      <GridProgressPill barRef={barRef} fillRef={fillRef} nameRef={nameRef} label="Exploring programs…" />
    </div>
  );
};

export default Courses;
