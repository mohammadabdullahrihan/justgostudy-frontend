import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { Headphones, BookOpen, PenLine, Mic, Info, Sparkles, ArrowUpRight, GraduationCap, ArrowRight, ArrowLeft, ExternalLink, Calculator } from 'lucide-react';
import Seo from '../../components/common/Seo';
import { getStudyPrograms } from '../../services/studyService';
import { flagUrlFor } from '../../constants/countries';
import {
  LISTENING_BAND_TABLE,
  READING_ACADEMIC_BAND_TABLE,
  rawToBand,
  roundOverallBand,
} from '../../constants/ieltsBandTables';

const formatMoney = (amount, currency) => {
  if (amount == null || Number.isNaN(amount)) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
};

const SKILLS = [
  { key: 'listening', label: 'Listening', icon: Headphones, mode: 'raw', max: 40 },
  { key: 'reading', label: 'Reading (Academic)', icon: BookOpen, mode: 'raw', max: 40 },
  { key: 'writing', label: 'Writing', icon: PenLine, mode: 'band', max: 9 },
  { key: 'speaking', label: 'Speaking', icon: Mic, mode: 'band', max: 9 },
];

const bandLabel = (band) => {
  if (band >= 8.5) return 'Expert user';
  if (band >= 7.5) return 'Very good user';
  if (band >= 6.5) return 'Good user';
  if (band >= 5.5) return 'Competent user';
  if (band >= 4.5) return 'Modest user';
  return 'Limited user';
};

const IELTSBandCalculator = () => {
  const [scores, setScores] = useState({ listening: 20, reading: 20, writing: 6, speaking: 6 });
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  // Result only appears once the user explicitly clicks "Get Result" — not
  // recalculated live on every keystroke. Any further edit to a score
  // invalidates the last result until they click again.
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleScoreChange = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }));
    setHasCalculated(false);
  };

  const pageRef = useRef(null);
  const headingRef = useRef(null);

  // Real StudyProgram data, fetched once, matched against the computed band
  // below, no fabricated "you qualify for X" claims.
  useEffect(() => {
    let ignore = false;
    getStudyPrograms()
      .then((res) => {
        if (ignore) return;
        setPrograms(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoadingPrograms(false);
      });
    return () => { ignore = true; };
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

  const bands = useMemo(() => ({
    listening: rawToBand(scores.listening, LISTENING_BAND_TABLE),
    reading: rawToBand(scores.reading, READING_ACADEMIC_BAND_TABLE),
    writing: Number(scores.writing),
    speaking: Number(scores.speaking),
  }), [scores]);

  const overall = useMemo(() => {
    const average = (bands.listening + bands.reading + bands.writing + bands.speaking) / 4;
    return roundOverallBand(average);
  }, [bands]);

  // Only programs with a real, published IELTS requirement, at or below the
  // user's band. Grouped by requirement tier and taken round-robin (closest
  // tier first) rather than a flat sort+slice, so a Band 9 result spans the
  // whole 5.0–9.0 qualifying range instead of the display limit filling up
  // entirely with whichever single tier happens to have the most published
  // programs (e.g. a wall of "IELTS 7+" listings and nothing lower).
  const QUALIFYING_DISPLAY_LIMIT = 9;
  const qualifyingPrograms = useMemo(() => {
    const matches = programs.filter((p) => p.requirements?.ielts > 0 && p.requirements.ielts <= overall);

    const byRequirement = new Map();
    matches.forEach((p) => {
      const key = p.requirements.ielts;
      if (!byRequirement.has(key)) byRequirement.set(key, []);
      byRequirement.get(key).push(p);
    });
    const tiers = [...byRequirement.keys()].sort((a, b) => b - a).map((key) => byRequirement.get(key));

    const result = [];
    let round = 0;
    while (result.length < QUALIFYING_DISPLAY_LIMIT && tiers.some((tier) => round < tier.length)) {
      tiers.forEach((tier) => {
        if (result.length < QUALIFYING_DISPLAY_LIMIT && tier[round]) result.push(tier[round]);
      });
      round += 1;
    }
    return result;
  }, [programs, overall]);

  const hasAnyIeltsData = programs.some((p) => p.requirements?.ielts > 0);

  const inputClass = 'w-full rounded-full border border-cream-200 bg-white px-4 py-3 font-semibold text-ink-900 outline-none transition-all focus:border-primary-400 focus:shadow-focus-ring';
  const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-widest text-ink-500';

  return (
    <div ref={pageRef} className="min-h-screen bg-cream-50 pb-20 font-sans">
      <Seo
        title="IELTS Band Score Calculator - Just Go Study"
        description="Convert your Listening and Reading raw scores plus Writing and Speaking bands into your estimated overall IELTS band score, using the official conversion tables."
      />

      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 pt-8 pb-20 text-white">
        <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-6 bottom-0 h-56 w-56 rounded-full bg-accent-400/20 blur-2xl" />
        <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Link
              to="/study-abroad/tools"
              className="group mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-white py-2.5 pl-4 pr-5 text-sm font-bold text-primary-700 shadow-theme-sm transition-all duration-300 hover:bg-primary-50 hover:shadow-theme-md"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" /> Back to Tools
            </Link>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              Exam Prep
            </div>
            <h1 ref={headingRef} className="mb-4 font-outfit text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              IELTS Band Score Calculator
            </h1>
            <p className="max-w-xl text-lg text-primary-100">
              Enter your four skill scores to see your estimated overall band, using the official IELTS conversion tables.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SKILLS.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/10 py-5 text-center backdrop-blur-sm">
                <Icon className="h-5 w-5 text-accent-300" />
                <span className="text-xs font-bold text-primary-100">{label.split(' (')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Inputs */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-cream-100 bg-white p-8 shadow-theme-lg">
              <div className="space-y-6">
                {SKILLS.map(({ key, label, icon: Icon, mode, max }) => (
                  <div key={key}>
                    <label className={labelClass}>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-primary-500" />
                        {label} {mode === 'raw' ? `(raw score out of ${max})` : `(band, 0-9)`}
                      </span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={max}
                      step={mode === 'raw' ? 1 : 0.5}
                      value={scores[key]}
                      onChange={(e) => handleScoreChange(key, e.target.value)}
                      className={inputClass}
                    />
                    {mode === 'raw' && hasCalculated && (
                      <p className="mt-1.5 text-[11px] text-ink-500">≈ Band {rawToBand(scores[key], key === 'listening' ? LISTENING_BAND_TABLE : READING_ACADEMIC_BAND_TABLE)}</p>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setHasCalculated(true)}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-4 text-sm font-bold text-white shadow-theme-md transition-all duration-200 hover:bg-primary-500"
              >
                <Calculator className="h-4 w-4" />
                Get Result
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="lg:col-span-2">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-primary-700 via-primary-800 to-ink-900 p-8 text-center text-white shadow-theme-lg">
              {hasCalculated ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-accent-300">Estimated Overall Band</p>
                  <p className="mt-3 font-outfit text-6xl font-black">{overall}</p>
                  <p className="mt-2 text-sm text-primary-200">{bandLabel(overall)}</p>

                  <div className="mt-6 space-y-2 text-left">
                    {SKILLS.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between border-b border-white/10 py-2 text-sm">
                        <span className="text-primary-100">{label}</span>
                        <span className="font-bold text-white">{bands[key]}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <Calculator className="mx-auto h-9 w-9 text-accent-300" />
                  <p className="mt-4 font-outfit text-lg font-bold text-white">No result yet</p>
                  <p className="mt-2 text-sm leading-relaxed text-primary-200">
                    Enter your four skill scores and click <span className="font-semibold text-white">Get Result</span> to see your estimated overall band.
                  </p>
                </>
              )}

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
                <div>
                  <p className="text-xs leading-relaxed text-primary-200">
                    Based on the official IELTS Listening and Reading (Academic) conversion tables. Your actual band depends on the test version and examiner assessment for Writing/Speaking, use this as a study-planning estimate only.
                  </p>
                  <a
                    href="https://www.ielts.org/for-organisations/ielts-scoring-in-detail"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-accent-300 hover:text-accent-200"
                  >
                    View official IELTS scoring guide
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <Link
                to="/language-club/exam-prep/ielts"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-400 px-6 py-4 text-sm font-bold text-ink-900 shadow-theme-md transition-all duration-200 hover:bg-accent-300"
              >
                Get IELTS Prep Resources
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>

        {/* Compare My Score: real StudyProgram matches, not a fabricated
            "you qualify" claim, only programs with a published IELTS
            requirement at or below the computed band are shown. */}
        <div className="mt-16">
          <h2 className="mb-1 font-outfit text-2xl font-bold text-ink-900">Universities You May Qualify For</h2>
          <p className="mb-6 text-sm text-ink-500">
            {hasCalculated
              ? `Based on your estimated Band ${overall}, matched against published IELTS requirements.`
              : 'Click "Get Result" above to see programs matched against your estimated band.'}
          </p>

          {!hasCalculated ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-cream-100 bg-white p-10 text-center shadow-theme-sm">
              <Calculator className="h-8 w-8 text-ink-500" />
              <p className="text-sm text-ink-500">Enter your scores and click Get Result first.</p>
            </div>
          ) : loadingPrograms ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-cream-100" />)}
            </div>
          ) : qualifyingPrograms.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {qualifyingPrograms.map((p) => (
                <Link
                  key={p._id}
                  to={`/study-abroad/course/${p._id}`}
                  className="group flex flex-col rounded-2xl border border-cream-100 bg-white p-5 shadow-theme-sm transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-theme-md"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <img src={flagUrlFor(p.country)} alt={p.country} loading="lazy" className="h-5 w-5 shrink-0 rounded-full object-cover" />
                    <span className="text-xs font-semibold text-ink-500">{p.university?.name || p.country}</span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 font-outfit text-base font-bold text-ink-900">{p.title}</h3>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700">
                      IELTS {p.requirements.ielts}+
                    </span>
                    <span className="text-xs font-semibold text-ink-500">{formatMoney(p.tuitionFee, p.currency)}/yr</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-cream-100 bg-white p-10 text-center shadow-theme-sm">
              <GraduationCap className="h-8 w-8 text-ink-500" />
              <p className="text-sm text-ink-500">
                {hasAnyIeltsData
                  ? "No listed programs match your current band yet, keep preparing or explore programs without a strict cutoff."
                  : "We don't have published IELTS requirements loaded to match against right now."}
              </p>
              <Link to="/study-abroad/courses" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700">
                Browse all courses <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IELTSBandCalculator;
