import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { toast } from 'react-hot-toast';
import {
  Wallet, Sun, Snowflake, CloudSun, Briefcase, GraduationCap,
  Sparkles, ArrowRight, ArrowLeft, RotateCcw, ArrowUpRight, Mail, Loader2, CheckCircle2,
} from 'lucide-react';
import * as studyService from '../../services/studyService';
import * as quizService from '../../services/quizService';
import Seo from '../../components/common/Seo';
import ShareButtons from '../../components/common/ShareButtons';
import { flagUrlFor } from '../../constants/countries';

const formatMoney = (amount, currency) => {
  if (amount == null || Number.isNaN(amount)) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
};

const BUDGET_OPTIONS = [
  { value: 15000, min: 0, max: 15000, label: 'Under $15,000 / year' },
  { value: 25000, min: 15000, max: 25000, label: '$15,000 – $25,000 / year' },
  { value: 40000, min: 25000, max: 40000, label: '$25,000 – $40,000 / year' },
  { value: 60000, min: 40000, max: Infinity, label: 'Above $40,000 / year' },
];

const CLIMATE_OPTIONS = [
  { value: 'warm', label: 'Warm / Tropical', icon: Sun },
  { value: 'temperate', label: 'Mild / Temperate', icon: CloudSun },
  { value: 'cold', label: 'Cold / Snowy', icon: Snowflake },
  { value: 'any', label: 'No preference', icon: Sparkles },
];

// Destinations describe their climate as free text (e.g. "Cold temperate to
// subarctic", "Mediterranean on the coast, continental inland"). Matching
// generic words like "hot"/"cold"/"mild" against that whole string false-
// positives constantly, since most descriptions mention several seasons
// ("hot summers, cold winters"). Classify by the actual climate family
// instead so each destination lands in exactly one bucket.
const getClimateCategory = (climateText) => {
  if (!climateText) return null;
  if (/cold temperate|subarctic/i.test(climateText)) return 'cold';
  if (/tropical|subtropical|desert|arid|mediterranean/i.test(climateText)) return 'warm';
  if (/^temperate/i.test(climateText)) return 'temperate';
  return null;
};

const LEVEL_OPTIONS = [
  { value: 'bachelor', label: "Bachelor's" },
  { value: 'master', label: "Master's" },
  { value: 'phd', label: 'PhD' },
];

const CAREER_OPTIONS = [
  { value: 'any', label: 'Not sure yet', keywords: [] },
  { value: 'tech', label: 'IT & Computer Science', keywords: ['software', 'developer', 'it ', 'data scientist', 'data analyst', 'cybersecurity', 'cloud architect', 'robotics', 'game developer', 'fintech', 'semiconductor'] },
  { value: 'business', label: 'Business & Management', keywords: ['business', 'marketing', 'financial analyst', 'banking', 'investment', 'mba', 'product manager', 'project manager', 'supply chain', 'logistics', 'consultant', 'hospitality', 'tourism', 'policy'] },
  { value: 'health', label: 'Health & Medicine', keywords: ['nurse', 'medical', 'health', 'doctor', 'clinical', 'pharma'] },
  { value: 'engineering', label: 'Engineering', keywords: ['engineer', 'mechanical', 'civil', 'electrical', 'automotive', 'mining', 'petroleum', 'marine', 'maritime'] },
  { value: 'arts', label: 'Arts & Design', keywords: ['design', 'artist', 'creative', 'media', 'fashion'] },
];

const STEPS = ['budget', 'climate', 'level', 'career'];

const scoreDestination = (dest, answers) => {
  const reasons = [];
  let score = 0;

  const totalAnnualCost = (dest.avgTuition || 0) + (dest.avgLivingCost || 0);
  const budgetOption = BUDGET_OPTIONS.find((b) => b.value === answers.budget);
  if (budgetOption && totalAnnualCost > 0) {
    // The options are cost *ranges*, not single target numbers — any
    // destination inside the chosen range is an equally good budget fit.
    // Scoring toward one exact number meant only the one or two
    // destinations closest to that number could ever win, regardless of
    // climate/career/level answers, so the same few countries always came
    // out on top.
    if (totalAnnualCost >= budgetOption.min && totalAnnualCost <= budgetOption.max) {
      score += 3;
      reasons.push('Fits your budget');
    } else {
      const distance = totalAnnualCost < budgetOption.min
        ? (budgetOption.min - totalAnnualCost) / (budgetOption.min || 1)
        : (totalAnnualCost - budgetOption.max) / budgetOption.max;
      score += Math.max(0, 3 - distance * 4);
    }
  }

  if (answers.climate && answers.climate !== 'any' && getClimateCategory(dest.climate) === answers.climate) {
    score += 2;
    reasons.push(`${dest.climate} climate, as you wanted`);
  }

  if (answers.level && dest.intakes?.[answers.level]) {
    score += 2;
    const levelLabel = LEVEL_OPTIONS.find((l) => l.value === answers.level)?.label;
    reasons.push(`Offers ${levelLabel} programs`);
  }

  const careerChoice = CAREER_OPTIONS.find((c) => c.value === answers.career);
  const roles = dest.careerData?.popularJobRoles || [];
  if (careerChoice && careerChoice.keywords.length && roles.length) {
    const rolesLower = roles.map((r) => r.toLowerCase());
    if (careerChoice.keywords.some((k) => rolesLower.some((r) => r.includes(k)))) {
      score += 2;
      reasons.push(`Strong ${careerChoice.label} career paths`);
    }
  }

  return { ...dest, matchScore: score, reasons };
};

const CountryMatchQuiz = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ budget: null, climate: null, level: null, career: null });
  const [showResults, setShowResults] = useState(false);
  const [emailForm, setEmailForm] = useState({ name: '', email: '' });
  const [sendingResult, setSendingResult] = useState(false);
  const [resultSent, setResultSent] = useState(false);

  const pageRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    studyService.getDestinations({ activeOnly: 'true' })
      .then((data) => setDestinations(Array.isArray(data) ? data : []))
      .catch((error) => console.error('Error fetching destinations for quiz:', error))
      .finally(() => setLoading(false));
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !headingRef.current) return;
      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });
      gsap.from(split.words, { opacity: 0, y: 24, stagger: 0.06, duration: 0.7, ease: 'power3.out' });
      return () => split.revert();
    },
    { scope: pageRef }
  );

  const results = useMemo(() => {
    if (!showResults) return [];
    const scored = destinations
      .map((d) => scoreDestination(d, answers))
      .sort((a, b) => {
        if (Math.abs(b.matchScore - a.matchScore) > 0.01) return b.matchScore - a.matchScore;
        // Equal-score tie-break: cheaper first, rather than silently
        // falling back to the API's fixed { order, country } sort.
        const aCost = (a.avgTuition || 0) + (a.avgLivingCost || 0);
        const bCost = (b.avgTuition || 0) + (b.avgLivingCost || 0);
        return aCost - bCost;
      });
    if (scored.length === 0) return [];

    // Show every destination close to the top score, not a fixed count —
    // out of 70+ destinations a flat "top 3" hid most good options. The
    // margin is relative to the best score so it adapts to how narrow the
    // user's answers were, with a floor/ceiling so the page never looks
    // empty (very specific answers) or overwhelming (very broad ones).
    const topScore = scored[0].matchScore;
    const MATCH_MARGIN = 1.5;
    const MIN_RESULTS = 3;
    const MAX_RESULTS = 12;
    let goodMatches = scored.filter((d) => d.matchScore >= topScore - MATCH_MARGIN);
    if (goodMatches.length < MIN_RESULTS) goodMatches = scored.slice(0, MIN_RESULTS);
    if (goodMatches.length > MAX_RESULTS) goodMatches = goodMatches.slice(0, MAX_RESULTS);
    return goodMatches;
  }, [showResults, destinations, answers]);

  const currentStepKey = STEPS[step];
  const canAdvance = Boolean(answers[currentStepKey]);

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else setShowResults(true);
  };
  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };
  const restart = () => {
    setAnswers({ budget: null, climate: null, level: null, career: null });
    setStep(0);
    setShowResults(false);
    setEmailForm({ name: '', email: '' });
    setResultSent(false);
  };

  const handleSendResult = async (e) => {
    e.preventDefault();
    if (!emailForm.email || !top) return;
    setSendingResult(true);
    try {
      await quizService.submitQuiz({
        budget: answers.budget,
        field: answers.career,
        region: answers.climate,
        ieltsBand: answers.level,
        recommendedCountry: top.country,
        name: emailForm.name,
        email: emailForm.email,
      });
      setResultSent(true);
      toast.success('Result emailed to you!');
    } catch (error) {
      toast.error(error.message || 'Could not send the result, please try again');
    } finally {
      setSendingResult(false);
    }
  };

  const optionCardClass = (isActive) => `flex items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left font-semibold transition-all ${
    isActive
      ? 'border-primary-600 bg-primary-600 text-white shadow-theme-md'
      : 'border-cream-200 bg-white text-ink-700 hover:border-primary-300'
  }`;

  const top = results[0];
  const shareMessage = top
    ? `I got matched with ${top.country} for studying abroad on JustTrip Edu! Take the quiz yourself:`
    : '';

  return (
    <div ref={pageRef} className="min-h-screen bg-cream-50 pb-20 font-sans">
      <Seo
        title="Which Country Fits You? Study Abroad Match Quiz - Just Go Study"
        description="Answer a few questions about your budget, climate preference, degree level, and career goals to get matched with real study-abroad destinations."
      />

      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 pt-8 pb-20 text-white">
        <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-6 bottom-0 h-56 w-56 rounded-full bg-accent-400/20 blur-2xl" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
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
            Destination Match
          </div>
          <h1 ref={headingRef} className="mb-4 font-outfit text-4xl font-extrabold sm:text-5xl">
            Which Country Fits You?
          </h1>
          <p className="mx-auto max-w-xl text-lg text-primary-100">
            Answer 4 quick questions, get matched with real destinations based on our actual tuition, climate, and career data.
          </p>
        </div>
      </div>

      <div className={`mx-auto px-6 pt-16 ${showResults ? 'max-w-6xl' : 'max-w-3xl'}`}>
        {loading ? (
          <div className="rounded-3xl border border-cream-100 bg-white p-10 text-center shadow-theme-lg">
            <p className="text-sm text-ink-500">Loading destinations…</p>
          </div>
        ) : !showResults ? (
          <div className="rounded-3xl border border-cream-100 bg-white p-8 shadow-theme-lg md:p-10">
            {/* Progress */}
            <div className="mb-8 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary-600' : 'bg-cream-200'}`} />
              ))}
            </div>

            {currentStepKey === 'budget' && (
              <div>
                <h2 className="mb-1 flex items-center gap-2 font-outfit text-xl font-bold text-ink-900">
                  <Wallet className="h-5 w-5 text-primary-600" /> What&apos;s your annual budget?
                </h2>
                <p className="mb-6 text-sm text-ink-500">Including tuition and living costs, in USD.</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setAnswers({ ...answers, budget: opt.value })} className={optionCardClass(answers.budget === opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStepKey === 'climate' && (
              <div>
                <h2 className="mb-1 flex items-center gap-2 font-outfit text-xl font-bold text-ink-900">
                  <Sun className="h-5 w-5 text-primary-600" /> What climate do you prefer?
                </h2>
                <p className="mb-6 text-sm text-ink-500">We&apos;ll match this against each destination&apos;s real climate profile.</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CLIMATE_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setAnswers({ ...answers, climate: opt.value })} className={optionCardClass(answers.climate === opt.value)}>
                      <opt.icon className="h-4 w-4 shrink-0" /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStepKey === 'level' && (
              <div>
                <h2 className="mb-1 flex items-center gap-2 font-outfit text-xl font-bold text-ink-900">
                  <GraduationCap className="h-5 w-5 text-primary-600" /> What degree level are you planning?
                </h2>
                <p className="mb-6 text-sm text-ink-500">We&apos;ll only count destinations that actually offer this level.</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {LEVEL_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setAnswers({ ...answers, level: opt.value })} className={optionCardClass(answers.level === opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStepKey === 'career' && (
              <div>
                <h2 className="mb-1 flex items-center gap-2 font-outfit text-xl font-bold text-ink-900">
                  <Briefcase className="h-5 w-5 text-primary-600" /> What&apos;s your career goal?
                </h2>
                <p className="mb-6 text-sm text-ink-500">We&apos;ll favor destinations with strong career data in this field.</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CAREER_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setAnswers({ ...answers, career: opt.value })} className={optionCardClass(answers.career === opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={step === 0}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-ink-500 transition-all disabled:opacity-0"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={goNext}
                disabled={!canAdvance}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-theme-md transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {step === STEPS.length - 1 ? 'See My Matches' : 'Next'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="rounded-3xl border border-cream-100 bg-white p-10 text-center shadow-theme-lg">
                <p className="text-sm text-ink-500">No destinations are set up yet to match against. Check back soon.</p>
              </div>
            ) : (
              <>
                {top && (
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-700 via-primary-800 to-ink-900 p-8 text-white shadow-theme-lg md:p-10">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-accent-300">Your Top Match</p>
                    <div className="mb-4 flex items-center gap-3">
                      <img src={flagUrlFor(top.country)} alt={top.country} loading="lazy" className="h-9 w-9 rounded-full object-cover" />
                      <h2 className="font-outfit text-3xl font-black">{top.country}</h2>
                    </div>
                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-primary-200">Avg. Tuition</p>
                        <p className="font-outfit text-lg font-bold">{formatMoney(top.avgTuition, top.currency)}/yr</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-primary-200">Avg. Living Cost</p>
                        <p className="font-outfit text-lg font-bold">{formatMoney(top.avgLivingCost, top.currency)}/yr</p>
                      </div>
                      {top.climate && (
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-primary-200">Climate</p>
                          <p className="font-outfit text-lg font-bold">{top.climate}</p>
                        </div>
                      )}
                    </div>
                    {top.reasons.length > 0 && (
                      <ul className="mb-6 space-y-1.5">
                        {top.reasons.map((r) => (
                          <li key={r} className="flex items-center gap-2 text-sm text-primary-100">
                            <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent-300" /> {r}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link
                        to={`/book-appointment?country=${encodeURIComponent(top.country)}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent-400 px-6 py-4 text-sm font-bold text-ink-900 shadow-theme-md transition-all hover:bg-accent-300"
                      >
                        Book a Free Session
                        <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                      </Link>
                    </div>
                    <div className="mt-3">
                      <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} message={shareMessage} />
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-5">
                      {resultSent ? (
                        <p className="flex items-center gap-2 text-sm font-semibold text-primary-100">
                          <CheckCircle2 className="h-4 w-4 text-secondary-300" /> Sent! Check your inbox for this result.
                        </p>
                      ) : (
                        <form onSubmit={handleSendResult} className="flex flex-col gap-3 sm:flex-row">
                          <input
                            type="text"
                            placeholder="Your name"
                            value={emailForm.name}
                            onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-primary-200 focus:outline-none focus:ring-2 focus:ring-white/30 sm:w-32"
                          />
                          <input
                            type="email"
                            required
                            placeholder="Email this result to me"
                            value={emailForm.email}
                            onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                            className="w-full flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-primary-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                          />
                          <button
                            type="submit"
                            disabled={sendingResult}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/30 disabled:opacity-50"
                          >
                            {sendingResult ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                            Email me
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {results.length > 1 && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {results.slice(1).map((r) => (
                      <div key={r._id} className="rounded-3xl border border-cream-100 bg-white p-8 shadow-theme-sm">
                        <div className="mb-4 flex items-center gap-3">
                          <img src={flagUrlFor(r.country)} alt={r.country} loading="lazy" className="h-9 w-9 rounded-full object-cover" />
                          <h3 className="font-outfit text-xl font-bold text-ink-900">{r.country}</h3>
                        </div>
                        <p className="text-base text-ink-500">
                          {formatMoney(r.avgTuition, r.currency)}/yr tuition · {formatMoney(r.avgLivingCost, r.currency)}/yr living
                        </p>
                        {r.reasons.length > 0 && (
                          <p className="mt-3 text-sm text-ink-500">{r.reasons.join(' · ')}</p>
                        )}
                        <Link
                          to={`/study-abroad/destination/${encodeURIComponent(r.country)}`}
                          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700"
                        >
                          Explore {r.country} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <button
              onClick={restart}
              className="mx-auto flex items-center gap-1.5 rounded-full border border-cream-200 bg-white px-5 py-2.5 text-sm font-bold text-ink-600 transition-all hover:border-primary-300"
            >
              <RotateCcw className="h-4 w-4" /> Retake the Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryMatchQuiz;
