import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import {
  Calendar, Clock, Info, ChevronRight, Search,
  Briefcase, Wallet, TrendingUp, Sparkles, ArrowLeft,
  Globe2, CreditCard, ListChecks, ShieldCheck, ExternalLink,
} from 'lucide-react';
import * as studyService from '../../services/studyService';
import Seo from '../../components/common/Seo';
import { flagUrlFor } from '../../constants/countries';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Mock fallback data, only used if the API call fails outright.
const mockCountries = [
  { _id: '1', country: 'UK' },
  { _id: '2', country: 'USA' },
  { _id: '3', country: 'Canada' },
  { _id: '4', country: 'Australia' },
  { _id: '5', country: 'Germany' },
];

const mockTimeline = [
  { step: 'Document Preparation', duration: '2-4 weeks', description: 'Gather academic records, financial proof, and English proficiency results.' },
  { step: 'University Application', duration: '4-8 weeks', description: 'Apply to your chosen universities and receive an offer letter.' },
  { step: 'Visa Application Submission', duration: '1 week', description: 'Complete online forms and schedule biometrics appointment.' },
  { step: 'Visa Processing', duration: '3-12 weeks', description: 'The embassy reviews your application and makes a decision.' },
  { step: 'Travel & Orientation', duration: '2 weeks', description: 'Book flights and attend pre-departure briefings.' },
];

const formatMoney = (amount, currency) => {
  if (amount == null || Number.isNaN(amount)) return null;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
};

// Currency symbol/code alone, for prefixing an animated count-up number.
const currencyPrefix = (currency) => {
  try {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).formatToParts(0);
    return parts.filter((p) => p.type === 'currency').map((p) => p.value).join('');
  } catch {
    return '';
  }
};

const VisaTimelineTracker = () => {
  const [loading, setLoading] = useState(true);
  const [defaults, setDefaults] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const statsRef = useRef(null);
  const timelineRef = useRef(null);
  const hasRevealedOnce = useRef(false);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const calculatorRes = await studyService.getCalculatorDefaults();
        const calculatorData = calculatorRes?.data || calculatorRes || [];
        const processedData = Array.isArray(calculatorData) ? calculatorData : [];
        setDefaults(processedData.length > 0 ? processedData : mockCountries);
        setSelectedCountry(processedData.length > 0 ? processedData[0] : mockCountries[0]);
      } catch (error) {
        console.error('Error fetching visa data:', error);
        setDefaults(mockCountries);
        setSelectedCountry(mockCountries[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchDefaults();
  }, []);

  const filteredCountries = (defaults || []).filter((d) =>
    d?.country?.toLowerCase().includes(searchTerm?.toLowerCase() || '')
  );

  const timeline = selectedCountry?.visaTimeline?.length > 0 ? selectedCountry.visaTimeline : mockTimeline;
  const feeLabel = formatMoney(selectedCountry?.visaFee, selectedCountry?.currency);
  const livingCostLabel = formatMoney(selectedCountry?.avgLivingCostPerYear, selectedCountry?.currency);
  const salaryLabel = formatMoney(selectedCountry?.roiStats?.avgStartingSalary, selectedCountry?.currency);

  // Hero heading: split into words and reveal once on mount.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !headingRef.current) return;
      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });
      gsap.from(split.words, { opacity: 0, y: 24, stagger: 0.06, duration: 0.7, ease: 'power3.out' });
      return () => split.revert();
    },
    { scope: pageRef }
  );

  // Stat tiles + timeline: scroll-reveal on first paint, instant re-play on country switch.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Skip the transient pre-fetch render (selectedCountry is still null and the
      // list would be mockTimeline), animating that would burn the one-time
      // scroll-reveal before the real data (and real element) is in place.
      if (!selectedCountry) return;
      const scope = timelineRef.current;
      const statScope = statsRef.current;
      if (!scope) return;

      const line = scope.querySelector('.visa-line');
      const steps = gsap.utils.toArray('.visa-step', scope);
      const tiles = statScope ? gsap.utils.toArray('.visa-stat', statScope) : [];
      const values = statScope ? gsap.utils.toArray('.visa-stat-value', statScope) : [];

      gsap.set(line, { scaleY: 0, transformOrigin: 'top center' });
      gsap.set(steps, { opacity: 0, x: -20 });
      gsap.set(tiles, { opacity: 0, y: 16 });

      // Count-up for numeric stat values (skips text like "3 Steps" gracefully, same tween works for both).
      values.forEach((el) => {
        const target = parseFloat(el.dataset.value || '0');
        if (Number.isNaN(target)) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = (el.dataset.prefix || '') + Math.round(obj.val).toLocaleString() + (el.dataset.suffix || '');
          },
        });
      });

      const tl = gsap.timeline(
        hasRevealedOnce.current
          ? {}
          : {
            scrollTrigger: {
              trigger: scope,
              start: 'top 78%',
              once: true,
              // Only the *actual* scroll-triggered reveal counts as "done",
              // this fires exactly when the timeline visually starts playing.
              onEnter: () => { hasRevealedOnce.current = true; },
            },
          }
      );
      tl.to(tiles, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' })
        .to(line, { scaleY: 1, duration: 0.7, ease: 'power2.out' }, '-=0.2')
        .to(steps, { opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out' }, '-=0.4')
        .from(scope.querySelectorAll('.visa-dot'), { scale: 0, duration: 0.35, stagger: 0.12, ease: 'back.out(2)' }, '-=0.6');
    },
    { scope: pageRef, dependencies: [selectedCountry?._id, timeline.length] }
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-cream-50 pb-20 font-sans">
      <Seo
        title="Visa Application Tracker - Just Go Study"
        description="Track your student visa application step by step with real, up-to-date fees, work-permit rules and expected timelines for 16 study destinations."
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 pt-8 pb-20 text-white">
        <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-6 bottom-0 h-56 w-56 rounded-full bg-accent-400/20 blur-2xl" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="mb-6 text-left">
            <Link
              to="/study-abroad/tools"
              className="group inline-flex w-fit items-center gap-2 rounded-full bg-white py-2.5 pl-4 pr-5 text-sm font-bold text-primary-700 shadow-theme-sm transition-all duration-300 hover:bg-primary-50 hover:shadow-theme-md"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" /> Back to Tools
            </Link>
          </div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent-300" />
            Visa &amp; Immigration
          </div>
          <h1 ref={headingRef} className="mb-4 font-outfit text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Visa Timeline Tracker
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-100">
            Real embassy fees, work-permit rules and step-by-step timelines for every destination we place students in.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Globe2, label: `${defaults?.length || '—'} Destinations Covered` },
              { icon: CreditCard, label: 'Official Fee Data' },
              { icon: ListChecks, label: 'Step-by-Step Timelines' },
            ].map(({ icon: ChipIcon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur-sm">
                <ChipIcon className="h-4 w-4 text-accent-300" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Country Selector Sidebar */}
          <div className="space-y-4 lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-cream-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-400 focus:shadow-focus-ring"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-cream-100 bg-white shadow-theme-sm">
              <div className="border-b border-cream-100 bg-cream-50 p-4">
                <h3 className="text-sm font-bold text-ink-900">Destinations</h3>
              </div>
              <div data-lenis-prevent className="max-h-[480px] overflow-y-auto">
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => <div key={i} className="m-2 h-12 animate-pulse rounded-lg bg-cream-50" />)
                ) : filteredCountries.map((c) => {
                  const isActive = selectedCountry?._id === c._id;
                  return (
                    <button
                      key={c._id}
                      onClick={() => setSelectedCountry(c)}
                      className={`group relative flex w-full items-center gap-3 border-l-4 px-4 py-3 text-left transition-all ${isActive
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-transparent text-ink-600 hover:border-primary-200 hover:bg-primary-50/50'
                        }`}
                    >
                      <img src={flagUrlFor(c.country)} alt={c.country} loading="lazy" decoding="async" className="h-6 w-6 shrink-0 rounded-full object-cover shadow-sm" />
                      <span className="text-sm font-semibold">{c.country}</span>
                      {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="space-y-6 lg:col-span-3">
            {/* Country header + quick facts */}
            <div className="relative overflow-hidden rounded-3xl border border-cream-100 bg-white p-8 shadow-theme-lg">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-600 shadow-theme-md">
                    <img src={flagUrlFor(selectedCountry?.country)} alt={selectedCountry?.country} loading="lazy" decoding="async" className="h-11 w-11 rounded-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-ink-900">{selectedCountry?.country} Student Visa</h2>
                    <p className="text-sm text-ink-500">Official fees &amp; process, sourced from embassy guidance</p>
                  </div>
                </div>
                {selectedCountry?.embassyUrl && (
                  <a
                    href={selectedCountry.embassyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2.5 text-xs font-bold text-primary-700 transition-colors hover:bg-primary-100"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Verify on Official Site
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <div ref={statsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="visa-stat flex items-center gap-3 rounded-2xl border border-accent-100 bg-accent-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-accent-600 shadow-theme-sm">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-accent-700">Visa Fee</p>
                    {feeLabel ? (
                      <p className="truncate text-lg font-bold text-ink-900">
                        <span
                          className="visa-stat-value"
                          data-value={selectedCountry?.visaFee ?? 0}
                          data-prefix={currencyPrefix(selectedCountry?.currency)}
                        >
                          {feeLabel}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-ink-500">Ask a counselor</p>
                    )}
                  </div>
                </div>

                <div className="visa-stat flex items-center gap-3 rounded-2xl border border-primary-100 bg-primary-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600 shadow-theme-sm">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700">Avg. Living Cost/Year</p>
                    {livingCostLabel ? (
                      <p className="truncate text-lg font-bold text-ink-900">
                        <span
                          className="visa-stat-value"
                          data-value={selectedCountry?.avgLivingCostPerYear ?? 0}
                          data-prefix={currencyPrefix(selectedCountry?.currency)}
                        >
                          {livingCostLabel}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-ink-500">Ask a counselor</p>
                    )}
                  </div>
                </div>

                <div className="visa-stat flex items-center gap-3 rounded-2xl border border-secondary-100 bg-secondary-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-secondary-600 shadow-theme-sm">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-secondary-700">Application Steps</p>
                    <p className="truncate text-lg font-bold text-ink-900">
                      <span className="visa-stat-value" data-value={timeline.length} data-suffix={timeline.length === 1 ? ' Step' : ' Steps'}>
                        {timeline.length} {timeline.length === 1 ? 'Step' : 'Steps'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative overflow-hidden rounded-3xl border border-cream-100 bg-white p-8 shadow-theme-lg md:p-12">
              <div className="absolute -mr-32 -mt-32 right-0 top-0 h-64 w-64 rounded-full bg-primary-50 opacity-50 blur-2xl" />

              <div className="relative z-10">
                <div className="mb-10 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-bold text-ink-900">Step-by-Step Process</h3>
                </div>

                <div ref={timelineRef} className="relative space-y-12">
                  {/* drawn vertical connector */}
                  <div className="visa-line absolute left-[17px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-600 via-primary-300 to-cream-200" />
                  {timeline.map((item, index) => (
                    <div key={index} className="visa-step group relative pl-12">
                      <div className="visa-dot absolute left-0 top-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-primary-600 bg-white shadow-theme-sm transition-transform duration-300 group-hover:scale-110">
                        <span className="text-xs font-bold text-primary-600">{index + 1}</span>
                      </div>
                      <div className="flex flex-col justify-between gap-4 rounded-2xl p-3 transition-colors duration-300 group-hover:bg-primary-50/40 md:flex-row md:items-center">
                        <div className="flex-1">
                          <h3 className="mb-1 text-lg font-bold text-ink-900">{item.step}</h3>
                          <p className="max-w-xl text-sm leading-relaxed text-ink-500">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2">
                          <Calendar className="h-4 w-4 text-primary-500" />
                          <span className="text-xs font-bold text-primary-600">{item.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Work permits + post-study earnings */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-cream-100 bg-white p-6 shadow-theme-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-ink-900">Work While You Study</h4>
                </div>
                <p className="text-sm leading-relaxed text-ink-500">
                  {selectedCountry?.permitsInfo || 'Work permit details for this destination are being finalized, ask a counselor for the latest rules.'}
                </p>
              </div>

              <div className="rounded-3xl border border-cream-100 bg-white p-6 shadow-theme-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-ink-900">After Graduation</h4>
                </div>
                {salaryLabel ? (
                  <p className="text-sm leading-relaxed text-ink-500">
                    Graduates typically start around <span className="font-bold text-ink-900">{salaryLabel}/year</span>
                    {selectedCountry?.roiStats?.paybackPeriodMonths
                      ? <>, enough to recover your total investment in roughly <span className="font-bold text-ink-900">{selectedCountry.roiStats.paybackPeriodMonths} months</span>.</>
                      : '.'}
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed text-ink-500">Salary benchmarks for this destination are being finalized, ask a counselor for current estimates.</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-accent-100 bg-accent-50 p-6">
              <Info className="mt-0.5 h-6 w-6 shrink-0 text-accent-500" />
              <div>
                <h4 className="mb-1 text-sm font-bold text-accent-900">Important Note</h4>
                <p className="text-xs leading-relaxed text-accent-800">
                  Fees and timelines are sourced from official embassy/immigration guidance and reviewed periodically, but they can change without notice. Actual duration may vary depending on individual circumstances, embassy workload, and time of year. We recommend starting your process at least 6 months before your intended intake.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaTimelineTracker;
