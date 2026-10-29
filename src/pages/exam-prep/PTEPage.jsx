import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import LanguageNavbar from '../../components/LanguageNavbar';
import LanguageFooter from '../../components/LanguageFooter';
import ExamPrepBackLink from '../../components/language-club/ExamPrepBackLink';
import Seo from '../../components/common/Seo';
import useScrollReveal from '../../hooks/useScrollReveal';
import useCountUp from '../../hooks/useCountUp';
import {
  Mic,
  BookOpen,
  Headphones,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Timer,
  Repeat,
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

const PARTS = [
  {
    icon: Mic,
    name: 'Speaking & Writing',
    duration: '~54–67 min',
    detail: 'One combined, continuously-timed part: read-aloud, repeat sentence, describe image, retell lecture, essay and summarize-text tasks.',
  },
  {
    icon: BookOpen,
    name: 'Reading',
    duration: '~29–30 min',
    detail: 'Multiple-choice, re-order paragraphs and fill-in-the-blanks tasks drawn from academic and general texts.',
  },
  {
    icon: Headphones,
    name: 'Listening',
    duration: '~30–43 min',
    detail: 'Summarize spoken text, multiple-choice, fill-in-the-blanks and highlight-correct-summary tasks from audio/video clips.',
  },
];

const WHY_PTE = [
  { icon: Zap, title: 'AI-Scored', desc: 'Every response is scored by Pearson\'s automated scoring engine — the same standard for every test-taker, everywhere, removing human/accent bias.' },
  { icon: Timer, title: 'Fastest Results', desc: 'Pearson reports most PTE Academic score results within just 2 days of sitting the test — among the fastest turnarounds of any major English test.' },
  { icon: Repeat, title: 'Single Sitting', desc: 'All parts are completed in one continuous ~2-hour session at a test centre — no splitting Speaking across a separate day.' },
];

const PREP_WEEKS = [
  { week: '1', focus: 'Understand the interface', detail: 'Sit a free scored practice test on the official Pearson platform to get used to the AI-timed, continuous format.' },
  { week: '2–3', focus: 'Template & fluency drills', detail: 'Practise Describe Image and Retell Lecture with a fixed template; record yourself daily to smooth out hesitation, which AI scoring penalizes.' },
  { week: '4', focus: 'Reading & Listening speed', detail: 'Drill re-order paragraphs and fill-in-the-blanks under strict time pressure — these are the highest-leverage question types for score gains.' },
  { week: '5', focus: 'Writing precision', detail: 'Practise Summarize Written Text (1 sentence, 5–75 words) and the essay — grammar and vocabulary range are scored automatically, so precision matters more than flair.' },
  { week: '6', focus: 'Full mock + booking', detail: 'Sit one full-length timed mock, review your weakest item types, then book your real test.' },
];

const FAQS = [
  { q: 'Is PTE Academic really scored only by AI?', a: 'Yes — every response (spoken and written) is scored automatically by Pearson\'s AI scoring engine, with no human grading. This is what makes results so fast and consistent.' },
  { q: 'Is PTE accepted for university and visa applications?', a: 'Yes. Thousands of universities worldwide accept PTE Academic, and it is an approved English test for UK, Australian and New Zealand visa applications — always confirm on the official institution/visa page first.' },
  { q: 'How long is a PTE score valid?', a: 'Two years from your test date.' },
  { q: 'Can I retake PTE Academic?', a: 'Yes, there is no mandatory waiting period between attempts — you can rebook as soon as a seat is available, though Pearson recommends only retaking once you\'ve addressed specific weak areas.' },
];

const PTEPage = () => {
  const pageRef = useRef(null);
  const waveRef = useRef(null);
  useScrollReveal(pageRef);
  const { count: scoreCount, ref: gaugeRef } = useCountUp(90, 1500);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const bars = gsap.utils.toArray(waveRef.current?.children || []);
      bars.forEach((bar, i) => {
        gsap.to(bar, {
          scaleY: gsap.utils.random(0.35, 1),
          duration: 0.5 + Math.random() * 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.06,
        });
      });
    },
    { scope: pageRef }
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-white overflow-x-hidden">
      <Seo
        title="PTE Academic Prep Guide - Just Go Study Language Club"
        description="A complete PTE Academic guide: the 3-part AI-scored format, the 10-90 score scale, why results come back fast, a 6-week study plan, and verified links to Pearson."
      />
      <LanguageNavbar />
      <ExamPrepBackLink />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-16 lg:pt-44 lg:pb-24 overflow-hidden bg-gradient-to-b from-red-50/60 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(220,38,38,0.08)_1px,transparent_0)] [background-size:26px_26px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div data-reveal data-reveal-children>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-6">
              <Zap className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">100% AI-Scored</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.05]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Master{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">PTE Academic</span>
            </h1>

            <p className="text-gray-500 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
              Pearson&apos;s computer-delivered English test — one continuous ~2-hour session,
              scored entirely by AI, with results typically back in days, not weeks.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="https://www.pearsonpte.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-200">
                Visit Official Pearson PTE Site <ExternalLink className="w-4 h-4" />
              </a>
              <Link to="/book-appointment" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:border-red-200 transition-all duration-200">
                Get Free Guidance
              </Link>
            </div>
          </div>

          {/* Waveform + Score Meter */}
          <div data-reveal-scale className="relative mx-auto w-full max-w-sm">
            <div className="relative bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-3xl p-8 shadow-2xl shadow-red-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:18px_18px] opacity-40" />
              <div className="relative flex items-center justify-between mb-6">
                <span className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Live Response</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> AI Scoring
                </span>
              </div>
              <div ref={waveRef} className="relative flex items-end justify-center gap-1.5 h-24 mb-8">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="w-2 rounded-full bg-white/70" style={{ height: '100%', transformOrigin: 'bottom' }} />
                ))}
              </div>
              <div ref={gaugeRef} className="relative text-center">
                <span className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] block mb-1">Score Scale</span>
                <span className="text-white text-6xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>{scoreCount}</span>
                <span className="text-red-100 text-sm font-semibold block mt-1">out of 10–90</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Part Format ─────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">One Continuous Session</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              The 3{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Parts</span>
            </h2>
          </div>

          <div data-reveal data-reveal-children className="space-y-6">
            {PARTS.map((p, i) => (
              <div key={p.name} className={`flex flex-col md:flex-row items-center gap-6 bg-white border border-gray-100 hover:border-red-200 rounded-3xl p-7 sm:p-8 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)] hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <p.icon className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{p.name}</h3>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">{p.duration}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why PTE ───────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Why Choose{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">PTE</span>
            </h2>
          </div>
          <div data-reveal data-reveal-children className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_PTE.map((w) => (
              <div key={w.title} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.05)] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                  <w.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>{w.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6-Week Prep Plan ──────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              A 6-Week{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Fast-Track Plan</span>
            </h2>
          </div>
          {/* Horizontal step cards — no timeline, deliberately distinct from
              the vertical-line pattern used on the IELTS page. */}
          <div data-reveal data-reveal-children className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {PREP_WEEKS.map((w) => (
              <div key={w.week} className="relative bg-white border border-gray-100 hover:border-red-200 rounded-2xl p-5 shadow-[0_2px_16px_-6px_rgba(14,16,23,0.06)] hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-extrabold text-sm mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {w.week}
                </div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Week {w.week}</span>
                <h3 className="text-sm font-bold text-gray-900 mt-1 mb-2 leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>{w.focus}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{w.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verified Links ────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-6">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">Verified Official Links</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Book &amp; Practice{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Directly</span>
            </h2>
          </div>
          {/* Stacked list rows inside one panel — distinct from IELTS's separate cards */}
          <div data-reveal className="bg-white border border-gray-100 rounded-3xl shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)] divide-y divide-gray-100 overflow-hidden">
            {[
              { name: 'PearsonPTE.com', desc: 'Official test info, booking & scored practice tests', url: 'https://www.pearsonpte.com' },
              { name: 'PTE Academic Scoring Guide', desc: 'How your 10–90 score is calculated, skill by skill', url: 'https://www.pearsonpte.com/pte-academic/scoring/' },
            ].map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 px-6 py-5 hover:bg-red-50/50 transition-colors duration-200">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{link.name}</p>
                  <p className="text-sm text-gray-500 truncate">{link.desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
              <Zap className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">Instant Answers, No Clicking Required</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              PTE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">FAQ</span>
            </h2>
          </div>
          {/* Always-open grid — fits PTE's "fast, no waiting" theme; no accordion clicks needed */}
          <div data-reveal data-reveal-children className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_16px_-6px_rgba(14,16,23,0.05)]">
                <p className="font-bold text-gray-900 mb-2">{faq.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Split panel on a light card — deliberately not a solid gradient
              box, so it doesn't read the same as the IELTS/other CTAs. */}
          <div data-reveal className="relative overflow-hidden bg-white border-2 border-red-100 rounded-3xl p-8 sm:p-12 shadow-[0_2px_24px_-6px_rgba(220,38,38,0.1)] flex flex-col lg:flex-row items-center gap-8">
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-red-50 rounded-full pointer-events-none" />
            <div className="relative flex-1 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Ready for Fast, Fair Results?
              </h2>
              <p className="text-gray-500 max-w-md">Book your PTE Academic session and get your score back in days.</p>
            </div>
            <div className="relative flex flex-wrap justify-center gap-3 shrink-0">
              <a href="https://www.pearsonpte.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all duration-300">
                Book on PearsonPTE.com <ExternalLink className="w-4 h-4" />
              </a>
              <Link to="/language-club/exam-prep" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:border-red-200 transition-all duration-300">
                Compare Other Exams <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LanguageFooter />
    </div>
  );
};

export default PTEPage;
