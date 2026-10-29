import { useState, useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Info, Sparkles, ArrowLeft,
  Globe2, Wallet, ListChecks, Search, ArrowUpRight,
  ShieldCheck, ExternalLink,
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import * as studyService from '../../services/studyService';
import Seo from '../../components/common/Seo';
import { DataDisclaimer } from '../../components/study/DetailsPageKit';
import { flagUrlFor } from '../../constants/countries';
import { CURRENCIES, getCurrencyMeta } from '../../constants/currencies';
import { getExchangeRates } from '../../services/exchangeRateService';
import CostComparisonWidget from '../../components/country/CostComparisonWidget';

gsap.registerPlugin(useGSAP);

// Donut sits on the dark outcome panel, gold investment vs. teal returns for contrast.
const COLORS = ['#f7a730', '#3ed1ae'];

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

const formatMoney = (amount, currency) => {
  if (amount == null || Number.isNaN(amount)) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
};

const currencyPrefix = (currency) => {
  try {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).formatToParts(0);
    return parts.filter((p) => p.type === 'currency').map((p) => p.value).join('');
  } catch {
    return '';
  }
};

// Underlying figures are entered in the selected country's native currency;
// this rescales them into whatever currency the user picks to view results in.
const convertAmount = (amount, fromCode, toCode, liveRates) => {
  if (fromCode === toCode) return amount;
  const from = getCurrencyMeta(fromCode, liveRates).rate;
  const to = getCurrencyMeta(toCode, liveRates).rate;
  return amount * (to / from);
};

const animateCountUps = (elements) => {
  elements.forEach((el) => {
    const target = parseFloat(el.dataset.value || '0');
    if (Number.isNaN(target)) return;
    const decimals = el.dataset.decimals ? Number(el.dataset.decimals) : 0;
    // The tween's actual target is `obj`, not `el`, so a stale tween from a
    // previous switch has to be killed via this stored reference,
    // gsap.killTweensOf(el) wouldn't find it and the old tween would keep
    // overwriting el.textContent alongside the new one.
    if (el._roiCountUpTween) el._roiCountUpTween.kill();
    const obj = { val: 0 };
    el._roiCountUpTween = gsap.to(obj, {
      val: target,
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => {
        const rounded = decimals ? obj.val.toFixed(decimals) : Math.round(obj.val).toLocaleString();
        el.textContent = (el.dataset.prefix || '') + rounded + (el.dataset.suffix || '');
      },
    });
  });
};

const ROIEstimator = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [liveRates, setLiveRates] = useState(null);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState(null);
  const [data, setData] = useState({
    courseCost: 30000,
    livingCost: 15000,
    duration: 2,
    startingSalary: 60000,
    salaryGrowth: 5,
    livingExpensesPostStudy: 15000,
  });

  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const resultsRef = useRef(null);
  const hasRevealedOnce = useRef(false);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const res = await studyService.getCalculatorDefaults();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          setCountries(list);
          applyCountry(list[0]);
        }
      } catch (error) {
        console.error('Error fetching ROI defaults:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDefaults();
  }, []);

  // Live FX rates, backend refreshes these daily; falls back to the static
  // table in constants/currencies.js if the provider is unreachable.
  useEffect(() => {
    getExchangeRates()
      .then((rates) => {
        setLiveRates(rates.rates);
        setRatesUpdatedAt(rates.fetchedAt);
      })
      .catch((error) => {
        console.error('Error fetching live exchange rates, using offline rates:', error);
      });
  }, []);

  const applyCountry = (country) => {
    setSelectedCountry(country);
    setData({
      courseCost: country?.roiStats?.avgCourseCost ?? 30000,
      livingCost: country?.avgLivingCostPerYear ?? 15000,
      duration: 2,
      startingSalary: country?.roiStats?.avgStartingSalary ?? 60000,
      salaryGrowth: 5,
      livingExpensesPostStudy: country?.avgLivingCostPerYear ?? 15000,
    });
  };

  const nativeCurrency = selectedCountry?.currency || 'USD';

  const filteredCountries = useMemo(
    () => countries.filter((c) => c.country.toLowerCase().includes(searchTerm.toLowerCase())),
    [countries, searchTerm]
  );

  // Memoized so scroll-triggered re-renders (e.g. from the layout above) don't
  // re-run this math or hand Recharts a brand-new chartData array every frame.
  const results = useMemo(() => {
    // courseCost is the total program cost (not per-year), only living costs scale with duration.
    const totalInvestment = data.courseCost + data.livingCost * data.duration;
    const monthlyNetSalary = (data.startingSalary / 12) * 0.75; // Assuming 25% tax
    const monthlyExpenses = data.livingExpensesPostStudy / 12;
    const monthlySavings = monthlyNetSalary - monthlyExpenses;

    const paybackMonths = monthlySavings > 0 ? Math.round(totalInvestment / monthlySavings) : Infinity;
    const paybackYears = paybackMonths !== Infinity ? (paybackMonths / 12).toFixed(1) : 'N/A';

    let totalEarnings = 0;
    let currentSalary = data.startingSalary;
    for (let i = 0; i < 5; i++) {
      totalEarnings += currentSalary * 0.75;
      currentSalary *= (1 + data.salaryGrowth / 100);
    }
    const fiveYearROI = (((totalEarnings - (data.livingExpensesPostStudy * 5)) / totalInvestment) * 100).toFixed(0);

    return { totalInvestment, paybackYears, fiveYearROI, monthlySavings };
  }, [data]);

  // Decorative fills for the outcome panel: ring caps at a 5-year horizon, bar caps at 300% ROI.
  const paybackYearsNum = results.paybackYears === 'N/A' ? 0 : parseFloat(results.paybackYears);
  const paybackProgress = Math.max(0, Math.min(paybackYearsNum / 5, 1));
  const ringTargetOffset = RING_C * (1 - paybackProgress);
  const growthBarPct = Math.max(0, Math.min(100, Number(results.fiveYearROI) / 3));

  const chartData = useMemo(() => [
    { name: 'Investment', value: results.totalInvestment },
    { name: '5-Year Net Earnings', value: Math.max(0, results.totalInvestment * (results.fiveYearROI / 100)) },
  ], [results]);

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

  // Result cards pop in once, on first real data load. Switching countries
  // after that only re-plays the ring/bar fill and number count-up, the big
  // outcome panel itself no longer fades/shrinks and pops back in on every
  // click, that full-panel replay was what read as the whole thing "shaking".
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!selectedCountry || !resultsRef.current) return;
      const ring = resultsRef.current.querySelector('.roi-ring-fill');
      const growthBar = resultsRef.current.querySelector('.roi-growth-bar');

      // Kill any in-flight tweens from a previous switch before starting new
      // ones, so clicking through countries quickly can't leave overlapping
      // tweens fighting over the same ring/bar/text.
      if (ring) gsap.killTweensOf(ring);
      if (growthBar) gsap.killTweensOf(growthBar);

      if (!hasRevealedOnce.current) {
        const cards = gsap.utils.toArray('.roi-card', resultsRef.current);
        gsap.from(cards, { opacity: 0, y: 30, scale: 0.95, duration: 0.6, stagger: 0.12, ease: 'power3.out' });
        hasRevealedOnce.current = true;
      }

      if (ring) {
        gsap.set(ring, { strokeDashoffset: RING_C });
        gsap.to(ring, { strokeDashoffset: Number(ring.dataset.targetOffset), duration: 1.2, ease: 'power2.out', delay: 0.2 });
      }
      if (growthBar) {
        gsap.fromTo(growthBar, { width: '0%' }, { width: growthBar.dataset.targetWidth, duration: 1.2, ease: 'power2.out', delay: 0.2 });
      }

      animateCountUps(gsap.utils.toArray('.roi-stat-value', resultsRef.current));
    },
    { scope: pageRef, dependencies: [selectedCountry?._id] }
  );

  // Currency-denominated figures (Total Investment / Est. Monthly Savings)
  // also re-count whenever the display currency changes or live rates arrive,
  // independent of the country-switch effect above so picking a currency
  // doesn't replay the ring/growth-bar animation.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!resultsRef.current) return;
      animateCountUps(gsap.utils.toArray('.roi-stat-value-fx', resultsRef.current));
    },
    { scope: pageRef, dependencies: [selectedCountry?._id, displayCurrency, liveRates] }
  );

  const inputClass = 'w-full rounded-full border border-cream-200 bg-white px-4 py-3 font-semibold text-ink-900 outline-none transition-all focus:border-primary-400 focus:shadow-focus-ring';
  const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-widest text-ink-500';

  return (
    <div ref={pageRef} className="min-h-screen bg-cream-50 pb-20 font-sans">
      <Seo
        title="Study Abroad ROI Estimator - Just Go Study"
        description="Estimate the return on investment for studying abroad, real per-country tuition and salary data, compared against your total cost and years to break even."
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-accent-300" />
            Financial Planning
          </div>
          <h1 ref={headingRef} className="mb-4 font-outfit text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            ROI Estimator
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-100">
            Real per-country tuition and starting-salary data, see how long it takes to recover your investment.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Globe2, label: `${countries.length || '—'} Destinations` },
              { icon: Wallet, label: 'Real Cost Data' },
              { icon: ListChecks, label: '5-Year Projection' },
            ].map(({ icon: ChipIcon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm font-semibold">
                <ChipIcon className="h-4 w-4 text-accent-300" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8">
        <div className="mb-10">
          <DataDisclaimer />
        </div>

        {/* Country picker */}
        <div className="mb-8">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-500">
              <Globe2 className="h-4 w-4 text-primary-500" />
              Choose your destination
            </p>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputClass} !rounded-full !py-2.5 pl-9`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => <div key={i} className="h-11 animate-pulse rounded-full bg-cream-100" />)
            ) : filteredCountries.length === 0 ? (
              <p className="col-span-full py-6 text-center text-sm text-ink-500">No destinations match &quot;{searchTerm}&quot;</p>
            ) : filteredCountries.map((c) => {
              const isActive = selectedCountry?._id === c._id;
              return (
                <button
                  key={c._id}
                  onClick={() => applyCountry(c)}
                  className={`flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-bold transition-all ${isActive
                    ? 'border-primary-600 bg-primary-600 text-white shadow-theme-md'
                    : 'border-cream-200 bg-white text-ink-600 hover:border-primary-300'
                    }`}
                >
                  <img src={flagUrlFor(c.country)} alt={c.country} loading="lazy" decoding="async" className="h-5 w-5 shrink-0 rounded-full object-cover" />
                  <span className="truncate">{c.country}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Inputs */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-3xl border border-cream-100 bg-white p-8 shadow-theme-lg">
              <div className="mb-6 border-t-2 border-primary-600 pt-3">
                <span className="font-outfit text-3xl font-black text-primary-100">01</span>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-ink-500">Step One</p>
                <h3 className="text-base font-bold text-ink-900">Investment Details</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Total Tuition Cost ({currencyPrefix(nativeCurrency)})</label>
                  <input type="number" value={data.courseCost} onChange={(e) => setData({ ...data, courseCost: Number(e.target.value) })} className={inputClass} />
                  <p className="mt-1.5 text-[11px] text-ink-500">Full program cost, not per year</p>
                </div>
                <div>
                  <label className={labelClass}>Annual Living Cost ({currencyPrefix(nativeCurrency)})</label>
                  <input type="number" value={data.livingCost} onChange={(e) => setData({ ...data, livingCost: Number(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Course Duration (Years)</label>
                  <select value={data.duration} onChange={(e) => setData({ ...data, duration: Number(e.target.value) })} className={inputClass}>
                    {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y} {y === 1 ? 'Year' : 'Years'}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-6 mt-10 border-t-2 border-secondary-500 pt-3">
                <span className="font-outfit text-3xl font-black text-secondary-100">02</span>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-ink-500">Step Two</p>
                <h3 className="text-base font-bold text-ink-900">Future Earnings</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Expected Starting Salary ({currencyPrefix(nativeCurrency)}/yr)</label>
                  <input type="number" value={data.startingSalary} onChange={(e) => setData({ ...data, startingSalary: Number(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Salary Growth (%)</label>
                  <input
                    type="range" min="0" max="20" value={data.salaryGrowth}
                    onChange={(e) => setData({ ...data, salaryGrowth: Number(e.target.value) })}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-cream-200 accent-primary-600"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-bold uppercase text-ink-500">
                    <span>0%</span>
                    <span className="text-primary-600">{data.salaryGrowth}%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results, a single dark "outcome" panel instead of stacked light tiles */}
          <div ref={resultsRef} className="lg:col-span-2">
            <div className="roi-card relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-700 via-primary-800 to-ink-900 p-8 text-white shadow-theme-lg md:p-10">
              <div className="relative">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-outfit text-xl font-bold">Your Financial Outcome</h3>
                    {selectedCountry?.embassyUrl && (
                      <a
                        href={selectedCountry.embassyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-primary-100 backdrop-blur-md transition-colors hover:bg-white/15 hover:text-white"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verify {selectedCountry.country} figures on official site
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="sm:text-right">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-primary-200 sm:text-right">Currency</label>
                    <select
                      value={displayCurrency}
                      onChange={(e) => setDisplayCurrency(e.target.value)}
                      className="rounded-2xl border border-accent-400/20 bg-white/10 px-5 py-3 text-sm font-bold text-accent-300 outline-none transition-all focus:border-accent-400"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code} className="text-ink-900">{c.code} ({c.symbol.trim()})</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-primary-200">
                      {ratesUpdatedAt
                        ? `Live rates · updated ${new Date(ratesUpdatedAt).toLocaleDateString()}`
                        : 'Using offline rates'}
                    </p>
                  </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {/* Payback period ring */}
                  <div className="flex items-center gap-6">
                    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
                      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
                        <circle cx="60" cy="60" r={RING_R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
                        <circle
                          className="roi-ring-fill"
                          cx="60" cy="60" r={RING_R} fill="none" stroke="#f7a730" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={RING_C}
                          strokeDashoffset={RING_C}
                          data-target-offset={ringTargetOffset}
                        />
                      </svg>
                      <p className="font-outfit text-3xl font-black text-white">
                        <span className="roi-stat-value" data-value={paybackYearsNum} data-decimals={1}>
                          {results.paybackYears}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-accent-300">Payback Period</p>
                      <p className="mt-1 text-sm text-primary-200">Years to recover your full investment</p>
                    </div>
                  </div>

                  {/* 5-year ROI bar */}
                  <div className="flex flex-col justify-center">
                    <div className="mb-1 flex items-center gap-2 text-secondary-300">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">5-Year ROI</span>
                    </div>
                    <p className="font-outfit text-4xl font-black text-white">
                      <span className="roi-stat-value" data-value={results.fiveYearROI} data-suffix="%">{results.fiveYearROI}%</span>
                    </p>
                    <div className="mt-3 h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-white/10">
                      <div className="roi-growth-bar h-full rounded-full bg-secondary-400" style={{ width: '0%' }} data-target-width={`${growthBarPct}%`} />
                    </div>
                    <p className="mt-2 text-sm text-primary-200">Net gain over 5 years</p>
                  </div>
                </div>

                <div className="mb-8 h-px w-full bg-white/10" />

                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%" debounce={200}>
                      <RechartsPie>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatMoney(convertAmount(value, nativeCurrency, displayCurrency, liveRates), displayCurrency)} contentStyle={{ background: '#050b26', border: 'none', borderRadius: 12, color: '#fff' }} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <div className="divide-y divide-white/10">
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm font-semibold text-primary-100">Total Investment</span>
                        <span
                          className="roi-stat-value-fx font-outfit text-lg font-bold text-white"
                          data-value={convertAmount(results.totalInvestment, nativeCurrency, displayCurrency, liveRates)}
                          data-prefix={currencyPrefix(displayCurrency)}
                        >
                          {formatMoney(convertAmount(results.totalInvestment, nativeCurrency, displayCurrency, liveRates), displayCurrency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm font-semibold text-primary-100">Est. Monthly Savings</span>
                        <span
                          className="roi-stat-value-fx font-outfit text-lg font-bold text-secondary-300"
                          data-value={Math.round(convertAmount(results.monthlySavings, nativeCurrency, displayCurrency, liveRates))}
                          data-prefix={currencyPrefix(displayCurrency)}
                        >
                          {formatMoney(Math.round(convertAmount(results.monthlySavings, nativeCurrency, displayCurrency, liveRates)), displayCurrency)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
                      <p className="text-xs leading-relaxed text-primary-200">
                        Tuition and salary defaults come from our per-country data, updated periodically. Actual ROI depends on tax rates, currency fluctuations, and individual spending habits.
                      </p>
                    </div>

                    {selectedCountry && (
                      <Link
                        to={`/book-appointment?country=${encodeURIComponent(selectedCountry.country)}`}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-400 px-6 py-4 text-sm font-bold text-ink-900 shadow-theme-md transition-all duration-200 hover:bg-accent-300"
                      >
                        Book a Free Session to Plan Your {selectedCountry.country} Finances
                        <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedCountry && (
          <div className="mt-8">
            <CostComparisonWidget
              country={selectedCountry.country}
              avgLivingCost={selectedCountry.avgLivingCostPerYear}
              currency={nativeCurrency}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ROIEstimator;
