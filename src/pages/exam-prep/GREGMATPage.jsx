import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageNavbar from '../../components/LanguageNavbar';
import LanguageFooter from '../../components/LanguageFooter';
import ExamPrepBackLink from '../../components/language-club/ExamPrepBackLink';
import Seo from '../../components/common/Seo';
import useScrollReveal from '../../hooks/useScrollReveal';
import useCountUp from '../../hooks/useCountUp';
import {
  Calculator,
  BookOpen,
  BarChart3,
  PenTool,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Check,
  GraduationCap,
} from 'lucide-react';

const TEST_DATA = {
  gre: {
    name: 'GRE General Test',
    owner: 'ETS',
    duration: '~1h 58m',
    bestFor: 'Graduate programs of every kind — STEM, humanities, social sciences, and a growing number of MBA programs',
    scoreMax: 340,
    scoreLabel: '260–340 (Verbal + Quant)',
    cost: '$220 in the US (fees vary by country)',
    validity: '5 years',
    results: '8–10 days for official scores',
    officialUrl: 'https://www.ets.org/gre.html',
    sections: [
      { icon: PenTool, name: 'Analytical Writing', detail: '1 "Analyze an Issue" essay — 30 minutes. Scored 0–6 in half-point steps.' },
      { icon: BookOpen, name: 'Verbal Reasoning', detail: 'Two sections (12 questions/18 min, then 15 questions/23 min), section-level adaptive — your Section 2 difficulty depends on Section 1 performance.' },
      { icon: Calculator, name: 'Quantitative Reasoning', detail: 'Two sections (12 questions/21 min, then 15 questions/26 min), also section-level adaptive.' },
    ],
  },
  gmat: {
    name: 'GMAT Focus Edition',
    owner: 'GMAC',
    duration: '2h 15m (+ optional 10-min break)',
    bestFor: 'MBA and other business/management graduate programs',
    scoreMax: 805,
    scoreLabel: '205–805 total score',
    cost: 'Varies by country — check mba.com for local pricing',
    validity: '5 years',
    results: 'Unofficial score shown immediately · official within 3–5 business days',
    officialUrl: 'https://www.mba.com/exams/gmat-exam',
    sections: [
      { icon: Calculator, name: 'Quantitative Reasoning', detail: '21 questions in 45 minutes. Scored 60–90.' },
      { icon: BookOpen, name: 'Verbal Reasoning', detail: '23 questions in 45 minutes. Scored 60–90.' },
      { icon: BarChart3, name: 'Data Insights', detail: '20 questions in 45 minutes — replaced the old Integrated Reasoning section. Scored 60–90.' },
    ],
  },
};

const FAQS = [
  { q: 'Should I take the GRE or the GMAT?', a: 'If you\'re applying to an MBA or other business program, check whether it prefers GMAT — many still do, though GRE acceptance has grown fast. For any other graduate program (STEM, humanities, law-adjacent, social sciences), GRE is the standard and far more widely accepted.' },
  { q: 'Does the GMAT Focus Edition still have an essay?', a: 'No — the Analytical Writing Assessment (AWA) was removed entirely in the GMAT Focus Edition. The GRE still includes one AWA essay ("Analyze an Issue").' },
  { q: 'Can I choose the order of sections?', a: 'On the GMAT Focus Edition, yes — you pick the order of all 3 sections and when to take your optional break. The GRE follows a fixed section order.' },
  { q: 'How long are GRE and GMAT scores valid?', a: 'Both are valid for 5 years from your test date.' },
];

const PREP_TRACKS = [
  { phase: 'Weeks 1–2', title: 'Diagnose & plan', detail: 'Sit one official practice test for your chosen exam to find your baseline, then build a study plan around your weakest section.' },
  { phase: 'Weeks 3–6', title: 'Core quant & verbal reasoning', detail: 'Both exams reward the same underlying skills — algebra, data interpretation, and close critical reading — so daily timed drills transfer across either test.' },
  { phase: 'Weeks 7–8', title: 'Test-specific finishing', detail: 'GRE candidates: polish your Analytical Writing essay structure. GMAT candidates: drill Data Insights (multi-source reasoning, table analysis) since it\'s unique to the Focus Edition.' },
  { phase: 'Weeks 9–10', title: 'Full mocks & booking', detail: 'Sit 2+ full-length timed mocks under real conditions, review error patterns, then book your test date around your application deadline.' },
];

const GREGMATPage = () => {
  const pageRef = useRef(null);
  const [tab, setTab] = useState('gre');
  const [openFaq, setOpenFaq] = useState(null);
  useScrollReveal(pageRef);
  const active = TEST_DATA[tab];
  const { count: scoreCount, ref: gaugeRef } = useCountUp(active.scoreMax, 1400);

  return (
    <div ref={pageRef} className="min-h-screen bg-white overflow-x-hidden">
      <Seo
        title="GRE vs GMAT Prep Guide - Just Go Study Language Club"
        description="A side-by-side GRE and GMAT Focus Edition guide: sections, timing, scoring scales, costs, a 10-week study track, and verified links to ETS and mba.com."
      />
      <LanguageNavbar />
      <ExamPrepBackLink />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-16 lg:pt-44 lg:pb-24 overflow-hidden bg-gradient-to-b from-red-50/60 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(220,38,38,0.08)_1px,transparent_0)] [background-size:26px_26px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div data-reveal data-reveal-children>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-6">
              <GraduationCap className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">Graduate & MBA Admission</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.05]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              GRE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">vs</span>{' '}
              GMAT
            </h1>

            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Two different tests for the same goal: proving you’re ready for graduate study.
              GRE opens doors across every field; GMAT Focus Edition is purpose-built for business
              school. Compare both, then dive into whichever one your program needs.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tab Switcher + Detail ─────────────────────────────────────── */}
      <section className="py-4 lg:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="flex justify-center mb-10">
            <div className="inline-flex bg-gray-50 border border-gray-200 rounded-2xl p-1.5 shadow-sm">
              {['gre', 'gmat'].map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    tab === k ? 'bg-red-600 text-white shadow-lg shadow-red-500/25' : 'text-gray-500 hover:text-red-600'
                  }`}
                >
                  {TEST_DATA[k].name}
                </button>
              ))}
            </div>
          </div>

          <div data-reveal className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 items-start">
            {/* Score Gauge */}
            <div ref={gaugeRef} className="relative bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-3xl p-8 shadow-2xl shadow-red-500/30 overflow-hidden text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:18px_18px] opacity-40" />
              <div className="relative">
                <span className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] block mb-2">{active.name} Score</span>
                <span className="text-white text-6xl font-extrabold block" style={{ fontFamily: "'Outfit', sans-serif" }}>{scoreCount}</span>
                <span className="text-red-100 text-sm font-semibold block mt-2">{active.scoreLabel}</span>

                <div className="mt-6 pt-6 border-t border-white/15 text-left space-y-3">
                  <div className="flex items-center gap-2 text-red-50 text-sm"><Clock className="w-4 h-4 shrink-0" /> {active.duration}</div>
                  <div className="flex items-center gap-2 text-red-50 text-sm"><Check className="w-4 h-4 shrink-0" /> Valid {active.validity}</div>
                  <div className="flex items-center gap-2 text-red-50 text-sm"><ArrowUpRight className="w-4 h-4 shrink-0" /> {active.results}</div>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-red-600 uppercase tracking-wide">Best for: {active.bestFor}</p>
              {active.sections.map((s) => (
                <div key={s.name} className="flex items-start gap-4 bg-white border border-gray-100 hover:border-red-200 rounded-2xl p-5 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.05)] hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Full Comparison Table ─────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Side by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Side</span>
            </h2>
          </div>
          <div data-reveal className="overflow-x-auto rounded-3xl border border-gray-100 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)]">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="text-left font-bold px-6 py-4 rounded-tl-3xl"></th>
                  <th className="text-left font-bold px-6 py-4">GRE General Test</th>
                  <th className="text-left font-bold px-6 py-4 rounded-tr-3xl">GMAT Focus Edition</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Owner', 'ETS', 'GMAC'],
                  ['Duration', TEST_DATA.gre.duration, TEST_DATA.gmat.duration],
                  ['Sections', 'Verbal, Quant, Analytical Writing', 'Verbal, Quant, Data Insights'],
                  ['Score range', TEST_DATA.gre.scoreLabel, TEST_DATA.gmat.scoreLabel],
                  ['Essay / AWA', 'Yes — 1 essay', 'No — removed in Focus Edition'],
                  ['Section order', 'Fixed', 'Your choice'],
                  ['Answer review', 'Within-section only', 'Can revisit up to 3 answers'],
                  ['Best for', TEST_DATA.gre.bestFor, TEST_DATA.gmat.bestFor],
                ].map((row, i) => (
                  <tr key={row[0]} className={i % 2 === 0 ? 'bg-white' : 'bg-red-50/30'}>
                    <td className="px-6 py-4 font-bold text-gray-900">{row[0]}</td>
                    <td className="px-6 py-4 text-gray-600">{row[1]}</td>
                    <td className="px-6 py-4 text-gray-600">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 10-Week Prep Track ────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              A 10-Week{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Prep Track</span>
            </h2>
          </div>
          {/* Horizontal phase bar — 4 connected steps, distinct from both
              the vertical-line and card-grid patterns used elsewhere. */}
          <div data-reveal data-reveal-children className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 sm:gap-4">
            {PREP_TRACKS.map((p, i) => (
              <div key={p.phase} className="relative pt-8">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-full bg-red-100">
                  <div className="absolute left-0 top-0 h-1 w-8 rounded-full bg-red-600" />
                </div>
                <div className="absolute -top-1.5 left-0 w-4 h-4 rounded-full bg-red-600 ring-4 ring-white shadow-md" />
                <span className="inline-block text-[10px] font-extrabold text-white bg-red-600 px-2 py-0.5 rounded-full mb-3">Phase {i + 1}</span>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">{p.phase}</p>
                <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed pr-2">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verified Links ────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">Verified Official Links</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Register &amp; Practice{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Directly</span>
            </h2>
          </div>
          {/* Two cards split by a "VS" badge — echoes the page's core duality theme */}
          <div data-reveal className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-3">
            <a href="https://www.ets.org/gre.html" target="_blank" rel="noopener noreferrer" className="group bg-white border-2 border-gray-100 hover:border-red-300 rounded-2xl p-6 sm:pr-10 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.05)] hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">ETS.org / GRE</span>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
              </div>
              <p className="text-sm text-gray-500">Official registration, practice tests & score reports</p>
            </a>
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-red-600 text-white font-extrabold text-xs items-center justify-center shadow-lg ring-4 ring-white">
              VS
            </div>
            <a href="https://www.mba.com/exams/gmat-exam" target="_blank" rel="noopener noreferrer" className="group bg-white border-2 border-gray-100 hover:border-red-300 rounded-2xl p-6 sm:pl-10 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.05)] hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">mba.com / GMAT</span>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
              </div>
              <p className="text-sm text-gray-500">Official GMAC registration, exam structure & prep tools</p>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              GRE &amp; GMAT{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">FAQ</span>
            </h2>
          </div>
          {/* Left-accent list with a +/- toggle — distinct from the chevron
              accordion and other FAQ treatments used on the other pages. */}
          <div data-reveal data-reveal-children className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className={`border-l-4 bg-white rounded-r-2xl transition-colors duration-300 ${isOpen ? 'border-red-600 shadow-md shadow-red-500/10' : 'border-red-100 hover:border-red-300'}`}>
                  <button className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left" onClick={() => setOpenFaq(isOpen ? null : i)}>
                    <span className={`font-semibold text-sm sm:text-base ${isOpen ? 'text-red-600' : 'text-gray-900'}`}>{faq.q}</span>
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg leading-none transition-colors duration-300 ${isOpen ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-400 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two-column split — one column per path, reinforcing the GRE/GMAT duality instead of one merged box. */}
          <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl shadow-red-500/20">
            <div className="bg-red-700 px-8 py-10 sm:py-12 text-center sm:text-left">
              <h2 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Not Sure Which One Fits?
              </h2>
              <p className="text-red-100 text-sm mb-6 max-w-xs mx-auto sm:mx-0">Our counsellors can check your target program&apos;s exact requirement, free of charge.</p>
              <Link to="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                Book a Free Consultation <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-red-600 px-8 py-10 sm:py-12 text-center sm:text-left border-t sm:border-t-0 sm:border-l border-white/10">
              <h2 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Weighing Other Tests Too?
              </h2>
              <p className="text-red-100 text-sm mb-6 max-w-xs mx-auto sm:mx-0">See how IELTS, PTE and TOEFL stack up alongside your grad-school test.</p>
              <Link to="/language-club/exam-prep" className="inline-flex items-center gap-2 px-6 py-3 bg-red-800/40 hover:bg-red-800/60 text-white font-bold rounded-xl border border-white/20 transition-all duration-300">
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

export default GREGMATPage;
