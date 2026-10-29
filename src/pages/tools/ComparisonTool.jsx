import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip as RTooltip,
} from 'recharts';
import {
  Search, Crown, X, Scale, Wallet, CreditCard, Briefcase, TrendingUp, ArrowLeft,
  Clock, ListChecks, ShieldCheck, ExternalLink, Info, Sparkles, Globe2,
} from 'lucide-react';
import * as studyService from '../../services/studyService';
import Seo from '../../components/common/Seo';
import { flagUrlFor } from '../../constants/countries';
import { toast } from 'react-hot-toast';

gsap.registerPlugin(useGSAP);

// Approximate FX-to-USD, used only to put mixed-currency metrics on a common
// scale for the radar chart / winner badges. Native amounts are always what's
// actually displayed to the user.
const FX_TO_USD = {
  USD: 1, GBP: 1.27, EUR: 1.09, AUD: 0.66, CAD: 0.73, NZD: 0.61, AED: 0.2723, PLN: 0.25, CHF: 1.12,
};
const toUSD = (amount, currency) => (amount == null ? null : amount * (FX_TO_USD[currency] ?? 1));

const formatMoney = (amount, currency) => {
  if (amount == null || Number.isNaN(amount)) return '—';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
};

// Per-selection-slot brand color (up to 3 destinations compared at once).
const SLOTS = [
  { text: 'text-primary-600', bar: 'bg-primary-600', ring: 'ring-primary-400', border: 'border-primary-400', soft: 'bg-primary-50', radar: '#788ded', dot: 'bg-primary-600' },
  { text: 'text-secondary-600', bar: 'bg-secondary-500', ring: 'ring-secondary-400', border: 'border-secondary-400', soft: 'bg-secondary-50', radar: '#3ed1ae', dot: 'bg-secondary-500' },
  { text: 'text-accent-600', bar: 'bg-accent-500', ring: 'ring-accent-400', border: 'border-accent-400', soft: 'bg-accent-50', radar: '#f7a730', dot: 'bg-accent-500' },
];

// Metrics pulled straight from CalculatorDefault, every value shown is real
// per-country data, nothing fabricated.
const METRICS = [
  { key: 'livingCost', label: 'Avg. Living Cost / Year', icon: Wallet, direction: 'lower', get: (c) => c.avgLivingCostPerYear, currency: (c) => c.currency },
  { key: 'visaFee', label: 'Student Visa Fee', icon: CreditCard, direction: 'lower', get: (c) => c.visaFee, currency: (c) => c.currency },
  { key: 'hourlyRate', label: 'Part-time Hourly Rate', icon: Briefcase, direction: 'higher', get: (c) => c.partTimeHourlyRate, currency: (c) => c.currency },
  { key: 'salary', label: 'Avg. Starting Salary', icon: TrendingUp, direction: 'higher', get: (c) => c.roiStats?.avgStartingSalary, currency: (c) => c.currency },
  { key: 'payback', label: 'Investment Payback', icon: Clock, direction: 'lower', get: (c) => c.roiStats?.paybackPeriodMonths, unit: ' mo', currency: null },
  { key: 'steps', label: 'Visa Process Steps', icon: ListChecks, direction: 'lower', get: (c) => c.visaTimeline?.length, unit: ' steps', currency: null },
];

const ComparisonTool = () => {
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const battleRef = useRef(null);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const res = await studyService.getCalculatorDefaults();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setCountries(list);
      } catch (error) {
        console.error('Error fetching comparison defaults:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDefaults();
  }, []);

  const selected = useMemo(
    () => selectedIds.map((id) => countries.find((c) => c._id === id)).filter(Boolean),
    [selectedIds, countries]
  );

  const toggleCountry = (country) => {
    if (selectedIds.includes(country._id)) {
      setSelectedIds(selectedIds.filter((id) => id !== country._id));
      return;
    }
    if (selectedIds.length >= 3) {
      toast.error('You can compare up to 3 destinations at once');
      return;
    }
    setSelectedIds([...selectedIds, country._id]);
  };

  const filteredCountries = countries.filter((c) =>
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // USD-normalized values per metric, keyed by country id, used for winner
  // badges and the radar chart so mixed currencies stay comparable.
  const normalized = useMemo(() => {
    const map = {};
    selected.forEach((c) => {
      map[c._id] = {};
      METRICS.forEach((m) => {
        const raw = m.get(c);
        map[c._id][m.key] = raw == null ? null : (m.currency ? toUSD(raw, m.currency(c)) : raw);
      });
    });
    return map;
  }, [selected]);

  const winnerFor = (metricKey) => {
    if (selected.length < 2) return null;
    const metric = METRICS.find((m) => m.key === metricKey);
    const values = selected
      .map((c) => ({ id: c._id, val: normalized[c._id]?.[metricKey] }))
      .filter((v) => v.val != null && !Number.isNaN(v.val));
    if (values.length < 2) return null;
    const best = metric.direction === 'lower'
      ? values.reduce((a, b) => (b.val < a.val ? b : a))
      : values.reduce((a, b) => (b.val > a.val ? b : a));
    const tie = values.filter((v) => v.val === best.val).length > 1;
    return tie ? null : best.id;
  };

  // 0-100 "favorability" score per metric, relative to the selected set only,
  // powers both the radar chart and the animated spec-battle bars.
  const scoreFor = (country, metricKey) => {
    const metric = METRICS.find((m) => m.key === metricKey);
    const vals = selected.map((c) => normalized[c._id]?.[metricKey]).filter((v) => v != null);
    const val = normalized[country._id]?.[metricKey];
    if (val == null || vals.length === 0) return 0;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    if (max === min) return 100;
    return metric.direction === 'higher'
      ? Math.round(((val - min) / (max - min)) * 100)
      : Math.round(((max - val) / (max - min)) * 100);
  };

  const overallWinnerId = useMemo(() => {
    if (selected.length < 2) return null;
    const totals = selected.map((c) => ({
      id: c._id,
      total: METRICS.reduce((sum, m) => sum + scoreFor(c, m.key), 0),
    }));
    const best = totals.reduce((a, b) => (b.total > a.total ? b : a));
    const tie = totals.filter((t) => t.total === best.total).length > 1;
    return tie ? null : best.id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, normalized]);

  const radarData = useMemo(() => {
    if (selected.length === 0) return [];
    return METRICS.map((m) => {
      const row = { metric: m.label.replace('Avg. ', '').replace(' / Year', '/yr') };
      selected.forEach((c) => {
        row[c.country] = scoreFor(c, m.key);
      });
      return row;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, normalized]);

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

  // Country picker tiles stagger in once loaded.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (loading) return;
      const tiles = gsap.utils.toArray('.cmp-tile', gridRef.current);
      if (!tiles.length) return;
      gsap.set(tiles, { opacity: 0, y: 20 });
      gsap.to(tiles, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out', overwrite: true,
        onComplete: () => gsap.set(tiles, { clearProps: 'transform' }),
      });
    },
    { scope: pageRef, dependencies: [loading, filteredCountries.length] }
  );

  // Battle panel: reveal on selection change + animate bar widths & count-ups.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!battleRef.current || selected.length === 0) return;
      const scope = battleRef.current;
      const cols = gsap.utils.toArray('.battle-col', scope);
      const bars = gsap.utils.toArray('.battle-bar', scope);

      gsap.from(cols, { opacity: 0, y: 24, duration: 0.5, stagger: 0.1, ease: 'power3.out' });

      bars.forEach((bar) => {
        gsap.fromTo(bar, { width: '0%' }, { width: bar.dataset.targetWidth, duration: 0.9, ease: 'power2.out', delay: 0.15 });
      });
    },
    { scope: pageRef, dependencies: [selectedIds.join(',')] }
  );

  const inputClass = 'w-full rounded-full border border-cream-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-400 focus:shadow-focus-ring';

  return (
    <div ref={pageRef} className="min-h-screen bg-cream-50 pb-20 font-sans">
      <Seo
        title="Compare Study Abroad Destinations - Just Go Study"
        description="Compare real tuition, living cost, visa fees, and starting-salary data across study destinations side by side to find your best-value match."
      />

      {/* Hero, deliberately distinct from the navy-gradient hero used on Visa Tracker / ROI Estimator */}
      <div className="relative overflow-hidden bg-cream-50 pt-8 pb-16">
        <div className="pointer-events-none absolute -left-16 top-16 h-64 w-64 rounded-full bg-secondary-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 top-0 h-72 w-72 rounded-full bg-accent-200/40 blur-2xl" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 text-left">
            <Link
              to="/study-abroad/tools"
              className="group inline-flex w-fit items-center gap-2 rounded-full bg-primary-50 py-2.5 pl-4 pr-5 text-sm font-bold text-primary-700 shadow-theme-sm transition-all duration-300 hover:bg-primary-100 hover:shadow-theme-md"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" /> Back to Tools
            </Link>
          </div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-700 shadow-theme-sm">
            <Scale className="h-3.5 w-3.5 text-accent-500" />
            Destination Comparison
          </div>
          <h1 ref={headingRef} className="mb-4 font-outfit text-4xl font-extrabold text-ink-900 sm:text-5xl lg:text-6xl">
            Which destination <span className="text-primary-600">wins?</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-ink-600">
            Put up to three destinations head-to-head on real living cost, visa fees, and salary data, no guesswork.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Globe2, label: `${countries.length || '—'} Destinations` },
              { icon: Sparkles, label: 'Real Cost & Salary Data' },
              { icon: Crown, label: 'Best-Value Score' },
            ].map(({ icon: ChipIcon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-full border border-cream-200 bg-white px-5 py-2 text-sm font-semibold text-ink-700 shadow-theme-sm">
                <ChipIcon className="h-4 w-4 text-primary-600" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Selection Area */}
        <div className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 p-8 shadow-theme-lg">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl" />
          <div className="relative">
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Pick Your Destinations</h2>
                <p className="text-sm text-primary-200">
                  {selected.length}/3 selected, choose at least 2 to see them go head-to-head
                </p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div ref={gridRef} className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {loading ? (
                [1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />)
              ) : filteredCountries.length === 0 ? (
                <p className="col-span-full py-8 text-center text-sm text-primary-300">No destinations match &quot;{searchTerm}&quot;</p>
              ) : filteredCountries.map((c) => {
                const slotIndex = selectedIds.indexOf(c._id);
                const isSelected = slotIndex !== -1;
                const disabled = !isSelected && selectedIds.length >= 3;
                return (
                  <button
                    key={c._id}
                    onClick={() => toggleCountry(c)}
                    disabled={disabled}
                    title={disabled ? 'Maximum 3 destinations, remove one to add another' : undefined}
                    className={`cmp-tile group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition-all ${
                      isSelected
                        ? `border-primary-400 bg-primary-50 shadow-focus-ring ring-2 ${SLOTS[slotIndex]?.ring}`
                        : disabled
                          ? 'cursor-not-allowed border-white/10 bg-white/5 opacity-40'
                          : 'border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-accent-400/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="relative">
                      <img src={flagUrlFor(c.country)} alt={c.country} loading="lazy" decoding="async" className="h-10 w-10 rounded-full object-cover shadow-sm" />
                      {isSelected && (
                        <span className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white ${SLOTS[slotIndex].dot}`}>
                          {slotIndex + 1}
                        </span>
                      )}
                    </div>
                    <span className={`w-full truncate text-xs font-bold ${isSelected ? 'text-ink-900' : 'text-white'}`}>{c.country}</span>
                    <span className={`text-[10px] font-semibold ${isSelected ? 'text-ink-500' : 'text-primary-300'}`}>
                      from {formatMoney(c.avgLivingCostPerYear, c.currency)}/yr
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Comparison result */}
        {selected.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-cream-200 bg-white py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cream-50">
              <Scale className="h-10 w-10 text-ink-500" />
            </div>
            <h3 className="text-xl font-bold text-ink-900">Start Your Comparison</h3>
            <p className="mt-2 text-ink-500">Select at least two destinations above to see them side by side</p>
          </div>
        ) : (
          <div ref={battleRef} className="space-y-10 pb-4">
            {/* Header row */}
            <div className={`grid grid-cols-1 gap-4 ${selected.length === 2 ? 'md:grid-cols-2' : selected.length === 3 ? 'md:grid-cols-3' : ''}`}>
              {selected.map((c, i) => (
                <div
                  key={c._id}
                  className={`battle-col relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br from-primary-700 to-primary-800 p-6 shadow-theme-md ${overallWinnerId === c._id ? 'border-accent-400' : 'border-white/10'}`}
                >
                  {overallWinnerId === c._id && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-accent-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-ink-900">
                      <Crown className="h-3 w-3" />
                      Best Value
                    </div>
                  )}
                  <button
                    onClick={() => toggleCountry(c)}
                    className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-primary-200 transition-colors hover:bg-red-500/20 hover:text-red-300"
                    aria-label={`Remove ${c.country}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="mt-6 flex flex-col items-center text-center">
                    <img src={flagUrlFor(c.country)} alt={c.country} loading="lazy" decoding="async" className="mb-3 h-14 w-14 rounded-full object-cover shadow-theme-sm" />
                    <h3 className="font-outfit text-xl font-bold text-white">{c.country}</h3>
                    {c.embassyUrl && (
                      <a
                        href={c.embassyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-accent-300 hover:underline"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Official Source
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Radar, needs 2+ to be meaningful */}
            {selected.length >= 2 && (
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 p-6 shadow-theme-lg md:p-10">
                <h3 className="mb-1 font-outfit text-lg font-bold text-white">Best-Value Profile</h3>
                <p className="mb-6 text-sm text-primary-200">Each axis is scored 0–100 relative to your selection, further out is better.</p>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%" debounce={200}>
                    <RadarChart data={radarData} outerRadius="75%">
                      <PolarGrid stroke="rgba(255,255,255,0.15)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#d2d9f9', fontSize: 11, fontWeight: 600 }} />
                      {selected.map((c, i) => (
                        <Radar
                          key={c._id}
                          name={c.country}
                          dataKey={c.country}
                          stroke={SLOTS[i].radar}
                          fill={SLOTS[i].radar}
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      ))}
                      <RTooltip contentStyle={{ background: '#030719', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {selected.map((c, i) => (
                    <div key={c._id} className="flex items-center gap-2 text-xs font-bold text-primary-100">
                      <span className={`h-2.5 w-2.5 rounded-full ${SLOTS[i].dot}`} />
                      {c.country}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spec battle rows */}
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 shadow-theme-lg">
              <div className="border-b border-white/10 bg-white/5 px-6 py-4 md:px-10">
                <h3 className="font-outfit text-lg font-bold text-white">Spec Battle</h3>
              </div>
              <div className="divide-y divide-white/10">
                {METRICS.map((m) => {
                  const winner = winnerFor(m.key);
                  return (
                    <div key={m.key} className="px-6 py-6 md:px-10">
                      <div className="mb-4 flex items-center gap-2">
                        <m.icon className="h-4 w-4 text-accent-400" />
                        <span className="text-sm font-bold text-primary-100">{m.label}</span>
                      </div>
                      <div className={`grid grid-cols-1 gap-4 ${selected.length === 2 ? 'md:grid-cols-2' : selected.length === 3 ? 'md:grid-cols-3' : ''}`}>
                        {selected.map((c, i) => {
                          const raw = m.get(c);
                          const label = raw == null
                            ? 'No data'
                            : m.currency
                              ? formatMoney(raw, m.currency(c))
                              : `${raw}${m.unit || ''}`;
                          const score = scoreFor(c, m.key);
                          const isWinner = winner === c._id;
                          return (
                            <div key={c._id} className="flex items-center gap-3">
                              <img
                                src={flagUrlFor(c.country)}
                                alt={c.country}
                                title={c.country}
                                loading="lazy"
                                decoding="async"
                                className="h-5 w-5 shrink-0 rounded-full object-cover shadow-sm"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-baseline justify-between gap-2">
                                  <span className="truncate text-xs font-semibold text-primary-300">{c.country}</span>
                                  {isWinner && <Crown className="h-3.5 w-3.5 shrink-0 text-accent-400" />}
                                </div>
                                <span className="mb-1.5 block truncate text-sm font-bold text-white">{label}</span>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className={`battle-bar h-full rounded-full ${SLOTS[i].bar}`}
                                    style={{ width: '0%' }}
                                    data-target-width={`${score}%`}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Work permit rules, real per-country text, side by side */}
            <div className={`grid grid-cols-1 gap-6 ${selected.length === 2 ? 'md:grid-cols-2' : selected.length === 3 ? 'md:grid-cols-3' : ''}`}>
              {selected.map((c, i) => (
                <div key={c._id} className="rounded-3xl border border-cream-100 bg-white p-6 shadow-theme-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${SLOTS[i].soft}`}>
                      <Briefcase className={`h-5 w-5 ${SLOTS[i].text}`} />
                    </div>
                    <h4 className="text-sm font-bold text-ink-900">{c.country} Work Rules</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-500">
                    {c.permitsInfo || 'Work permit details for this destination are being finalized, ask a counselor for the latest rules.'}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-accent-100 bg-accent-50 p-6">
              <Info className="mt-0.5 h-6 w-6 shrink-0 text-accent-500" />
              <div>
                <h4 className="mb-1 text-sm font-bold text-accent-900">How the Best-Value Score works</h4>
                <p className="text-xs leading-relaxed text-accent-800">
                  Living cost, visa fees, and salary data are shown in each country&apos;s native currency exactly as sourced from official/embassy guidance. For the radar chart and &quot;Best Value&quot; badge only, amounts are converted to an approximate common currency so mixed currencies stay comparable, actual costs can vary with exchange rates, so always confirm exact fees on the official source link before applying.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonTool;
