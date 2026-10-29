import { useState, useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { ArrowLeft, ArrowRight, Search, MapPin, Loader2, GraduationCap, DollarSign, Building2, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as studyService from '../services/studyService';
import Seo from '../components/common/Seo';
import HeroGlobe from '../components/study/HeroGlobe';
import CountryMatchQuizPromoBanner from '../components/study/CountryMatchQuizPromoBanner';
import LanguageClubPromo from '../components/home/LanguageClubPromo';
import GridProgressPill from '../components/study/GridProgressPill';
import ComparisonTable from '../components/study/ComparisonTable';
import useCardGridFX from '../hooks/useCardGridFX';
import { REGIONS } from '../constants/regions';
import sanitizeHtml from '../utils/sanitizeHtml';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const regionOptions = ['All', ...REGIONS];
const flagUrl = (countryCode) => (countryCode ? `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png` : null);

// Solid brand-navy hover ring (not the old rainbow conic gradient).
const CONIC_RING = {
  '--fx-angle': '0deg',
  background: 'linear-gradient(135deg, #0e1f6d, #3454e5)',
};

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridLoading, setGridLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const barRef = useRef(null);
  const fillRef = useRef(null);
  const nameRef = useRef(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      if (!isFirstLoad.current) setGridLoading(true);
      try {
        const params = { activeOnly: true };
        if (selectedRegion !== 'All') params.region = selectedRegion;
        const destinationsRes = await studyService.getDestinations(params);
        setDestinations(Array.isArray(destinationsRes) ? destinationsRes : (destinationsRes.data || []));
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        if (isFirstLoad.current) {
          setLoading(false);
          isFirstLoad.current = false;
        }
        setGridLoading(false);
      }
    };
    fetchDestinations();
  }, [selectedRegion]);

  const addToCompare = (country) => {
    if (compareList.length >= 3) return;
    if (compareList.find(c => c.name === country.country)) return;

    const currency = country.currency || 'USD';
    // Nullish coalescing, not ||: a country with genuinely free public
    // tuition (avgTuition: 0, e.g. Germany) must show "0", not get silently
    // overwritten by the placeholder default.
    const tuitionAmount = country.avgTuition ?? 15000;
    const livingAmount = country.avgLivingCost ?? 12000;
    const countryData = {
      name: country.country,
      code: country.countryCode || 'US',
      data: {
        // avgTuition and avgLivingCost are both stored as yearly figures.
        tuition: `${currency} ${tuitionAmount.toLocaleString()}/yr`,
        living: `${currency} ${livingAmount.toLocaleString()}/yr`,
        visa: 'High Success',
        income: '$15-20/hr',
        work: '2-3 Years',
      },
      total: `${currency} ${(tuitionAmount + livingAmount).toLocaleString()}/yr`
    };

    setCompareList([...compareList, countryData]);
    setShowCompare(true);
  };

  const removeFromCompare = (index) => {
    const newList = [...compareList];
    newList.splice(index, 1);
    setCompareList(newList);
    if (newList.length === 0) setShowCompare(false);
  };

  const filteredDestinations = useMemo(() => {
    // Region is already filtered server-side (see fetchDestinations above);
    // only the free-text search is applied client-side here.
    return destinations.filter(d =>
      d && d.country && typeof d.country === 'string' &&
      d.country.toLowerCase().includes((searchQuery || '').toLowerCase())
    );
  }, [destinations, searchQuery]);

  // Heading word-reveal, matching the shared animation system.
  useGSAP(
    () => {
      if (loading || !headingRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });
      gsap.from(split.words, { opacity: 0, y: 28, stagger: 0.06, duration: 0.7, ease: 'power3.out' });
    },
    { scope: pageRef, dependencies: [loading] }
  );

  useCardGridFX(pageRef, gridRef, { barRef, fillRef, nameRef }, [filteredDestinations, loading]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white pt-20">
      <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
    </div>
  );

  return (
    <div ref={pageRef} className="relative mx-auto max-w-[1440px] px-8 pb-16 pt-8 font-sans sm:px-12 lg:px-20">
      <Seo
        title="Study Destinations: USA, UK, Canada, Australia & More - Just Go Study"
        description="Compare study abroad destinations by cost, culture, and career opportunities. Explore country guides for the USA, UK, Canada, Australia and more with Just Go Study."
      />
      {/* Navigation */}
      <div className="mb-10">
        <Link
          to="/study-abroad"
          className="group inline-flex items-center gap-2 rounded-full bg-primary-50 py-2.5 pl-4 pr-5 text-sm font-bold text-primary-700 shadow-theme-sm transition-all duration-300 hover:bg-primary-100 hover:shadow-theme-md"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Study Abroad
        </Link>
      </div>

      {/* Comparison Section */}
      {showCompare && (
        <div className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-outfit text-2xl font-bold text-ink-900">Comparison Tool</h2>
              <p className="text-sm font-medium text-ink-500">Compare top study destinations side by side</p>
            </div>
            <button
              onClick={() => setShowCompare(false)}
              className="flex items-center gap-2 text-sm font-bold text-ink-500 transition-colors hover:text-ink-900"
            >
              <X className="h-4 w-4" /> Hide Comparison
            </button>
          </div>
          <ComparisonTable
            countries={compareList}
            onRemove={removeFromCompare}
            onAdd={() => setShowCompare(false)}
          />
        </div>
      )}

      {/* Hero: navy premium banner, heading left, animated globe right */}
      <div className="relative mb-14 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 px-6 py-14 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-secondary-500/10 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <h1 ref={headingRef} className="mb-5 font-outfit text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Explore Your <span className="text-accent-400">Dream Destination</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-primary-100">
              Compare tuition, living costs, and visa outcomes across our study destinations, then pick where you actually want to go.
            </p>

            {/* Search Bar */}
            <div className="relative mb-6 max-w-xl">
              <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                placeholder="Search by country name..."
                className="w-full rounded-full border border-transparent bg-white py-4 pl-16 pr-8 text-lg font-medium text-ink-900 shadow-theme-lg outline-none transition-all focus:border-accent-400 focus:shadow-focus-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {regionOptions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${selectedRegion === region
                    ? 'bg-accent-500 text-primary-900 shadow-theme-md'
                    : 'border border-white/20 bg-white/10 text-white hover:border-accent-400/50 hover:text-accent-300'
                    }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <HeroGlobe />
          </div>
        </div>
      </div>

      <CountryMatchQuizPromoBanner size="lg" />

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-ink-500">
          Showing <span className="font-bold text-ink-900">{filteredDestinations.length}</span> of{' '}
          <span className="font-bold text-ink-900">{destinations.length}</span> destinations
        </p>
      </div>

      {/* Destinations Grid */}
      {gridLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="mx-auto my-6 max-w-2xl rounded-[3rem] border-2 border-dashed border-cream-200 bg-cream-50 py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-theme-lg">
            <MapPin className="h-9 w-9 text-ink-500" />
          </div>
          <h3 className="mb-3 font-outfit text-2xl font-bold text-ink-900">No Destinations Found</h3>
          <p className="mx-auto mb-6 max-w-md text-ink-500">
            We couldn&apos;t find any countries matching &quot;{searchQuery}&quot;{selectedRegion !== 'All' && ` in ${selectedRegion}`}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedRegion('All'); }}
            className="inline-flex items-center gap-2 font-bold text-primary-600 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((dest) => (
            <div
              key={dest._id}
              data-name={dest.country}
              className="fx-card group relative h-full transition-transform duration-300 hover:-translate-y-2.5 will-change-transform"
            >
              {/* rotating conic-gradient border (revealed on hover) */}
              <div className="fx-ring pointer-events-none absolute -inset-[2px] rounded-[2.1rem] opacity-0" style={CONIC_RING} />

              <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-cream-100 bg-white shadow-theme-md transition-shadow duration-500 group-hover:shadow-theme-lg">
                {/* Cover: flag-only, no stock photo needed */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-500/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-secondary-500/10 blur-2xl" />

                  <div className="relative flex h-[calc(100%-4.5rem)] items-center justify-center pt-6">
                    <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/90 bg-white shadow-theme-lg transition-transform duration-500 group-hover:scale-110">
                      {dest.countryCode ? (
                        <img src={flagUrl(dest.countryCode)} alt={dest.country} className="h-full w-full object-cover" />
                      ) : (
                        <MapPin className="h-8 w-8 text-ink-500" />
                      )}
                    </div>
                  </div>

                  {/* Country Info Overlay */}
                  <div className="absolute inset-x-6 bottom-4">
                    <h3 className="mb-1 text-2xl font-bold text-white">{dest.country}</h3>
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary-100">
                      <MapPin className="h-4 w-4" />
                      <span>{dest.region || 'Popular Destination'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="border-b border-cream-100 bg-cream-50 px-6 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center text-primary-600">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-bold text-ink-900">
                        {dest.universityCount > 0 ? dest.universityCount : 'Soon'}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-ink-500">Universities</p>
                    </div>
                    <div className="border-l border-cream-200 text-center">
                      <div className="mb-1 flex items-center justify-center text-secondary-600">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-bold text-ink-900">
                        {dest.programCount > 0 ? dest.programCount : 'Soon'}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-ink-500">Programs</p>
                    </div>
                    <div className="border-l border-cream-200 text-center">
                      <div className="mb-1 flex items-center justify-center text-accent-600">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-bold text-ink-900">{dest.currency || '$'} {typeof dest.avgTuition === 'number' ? dest.avgTuition.toLocaleString() : '15k'}</p>
                      <p className="text-[10px] uppercase tracking-wider text-ink-500">Avg/Year</p>
                    </div>
                  </div>
                </div>

                {/* Description + CTAs */}
                <div className="flex flex-grow flex-col p-6">
                  <p
                    className="guide-content-links mb-6 line-clamp-2 text-sm leading-relaxed text-ink-600"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        dest.description || `Study in ${dest.country} and get access to strong universities, a new culture, and solid career prospects.`
                      ),
                    }}
                  />

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link
                      to={`/study-abroad/destination/${encodeURIComponent(dest.country)}`}
                      className="group/btn relative flex items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-3.5 font-bold text-white shadow-theme-md transition-all hover:bg-primary-500 active:scale-95"
                    >
                      <span>View Programs</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
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
                    <button
                      onClick={() => addToCompare(dest)}
                      className="flex items-center justify-center gap-2 rounded-full border border-cream-200 bg-white px-4 py-3.5 font-bold text-ink-700 transition-all hover:border-primary-300 hover:text-primary-600 active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Compare</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12">
        <LanguageClubPromo variant="wide" />
      </div>

      <GridProgressPill barRef={barRef} fillRef={fillRef} nameRef={nameRef} label="Exploring destinations…" />
    </div>
  );
};

export default DestinationsPage;
