import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageNavbar from '../../components/LanguageNavbar';
import LanguageFooter from '../../components/LanguageFooter';
import ExamPrepBackLink from '../../components/language-club/ExamPrepBackLink';
import Seo from '../../components/common/Seo';
import useScrollReveal from '../../hooks/useScrollReveal';
import useCountUp from '../../hooks/useCountUp';
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Clock,
  Award,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Check,
  ExternalLink,
  Globe2,
  ShieldCheck,
} from 'lucide-react';

const MODULES = [
  {
    icon: Headphones,
    name: 'Listening',
    duration: '30 min',
    detail: '4 recorded sections, 40 questions — everyday conversations to academic lectures.',
  },
  {
    icon: BookOpen,
    name: 'Reading',
    duration: '60 min',
    detail: '3 passages, 40 questions. Academic uses journal/textbook extracts; General Training uses workplace & everyday texts.',
  },
  {
    icon: PenTool,
    name: 'Writing',
    duration: '60 min',
    detail: 'Task 1 (150 words — describe a chart/graph for Academic, or write a letter for General) + Task 2 (250-word essay).',
  },
  {
    icon: Mic,
    name: 'Speaking',
    duration: '11–14 min',
    detail: 'Face-to-face or video-call interview in 3 parts: introduction, a 2-minute cue-card talk, then a discussion.',
  },
];

const BAND_SCALE = [
  { band: 9, label: 'Expert User' },
  { band: 8, label: 'Very Good User' },
  { band: 7, label: 'Good User' },
  { band: 6, label: 'Competent User' },
  { band: 5, label: 'Modest User' },
  { band: 4, label: 'Limited User' },
  { band: 3, label: 'Extremely Limited User' },
];

const PREP_WEEKS = [
  { week: '1–2', focus: 'Diagnostic test + vocabulary foundations', detail: 'Take a full practice test to find your baseline band, then build topic-based vocabulary (education, environment, technology).' },
  { week: '3–4', focus: 'Listening & Reading drills', detail: 'Practise note-completion and matching-headings question types daily; time yourself strictly under 60 minutes for Reading.' },
  { week: '5–6', focus: 'Writing Task 1 & 2 structure', detail: 'Learn the standard paragraph structures, practise 2 essays a week, and get feedback on task achievement and coherence.' },
  { week: '7', focus: 'Speaking fluency', detail: 'Record yourself answering Part 1–3 questions; focus on natural pausing, linking words, and extending short answers.' },
  { week: '8', focus: 'Full mock tests', detail: 'Sit at least 2 complete timed mock exams under real test conditions before test day.' },
];

const FAQS = [
  { q: 'IELTS Academic or General Training — which do I need?', a: 'Academic is for university/college admission and professional registration. General Training is for immigration (UK, Australia, Canada, New Zealand) and secondary education or work experience. Check your specific visa or university requirement before booking.' },
  { q: 'How is IELTS scored?', a: 'Each of the 4 modules gets a band from 0–9, and your Overall Band Score is the rounded average of all four (rounded to the nearest whole or half band).' },
  { q: 'Is IELTS on paper or computer?', a: 'Both are offered at most test centres — IELTS on paper and Computer-delivered IELTS give identical scores and format, so pick whichever you\'re more comfortable with.' },
  { q: 'How long is my IELTS score valid?', a: 'Two years from the test date, after which most institutions require a fresh result.' },
];

const IELTSPage = () => {
  const pageRef = useRef(null);
  const [mode, setMode] = useState('academic');
  const [openFaq, setOpenFaq] = useState(null);
  useScrollReveal(pageRef);
  const { count: bandCount, ref: gaugeRef } = useCountUp(9, 1400);

  return (
    <div ref={pageRef} className="min-h-screen bg-white overflow-x-hidden">
      <Seo
        title="IELTS Prep Guide - Just Go Study Language Club"
        description="Everything you need to know about IELTS: the 4 modules, band scale, Academic vs General Training, an 8-week study plan, and verified links to book your test."
      />
      <LanguageNavbar />
      <ExamPrepBackLink />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-16 lg:pt-44 lg:pb-24 overflow-hidden bg-gradient-to-b from-red-50/60 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(220,38,38,0.08)_1px,transparent_0)] [background-size:26px_26px] pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div data-reveal data-reveal-children>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-6">
              <Globe2 className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">
                Accepted by 12,500+ Organisations
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.05]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Master the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">IELTS</span>
            </h1>

            <p className="text-gray-500 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
              The International English Language Testing System is the world&apos;s most widely
              taken English proficiency test — the standard choice for UK, Australian and Canadian
              visas and thousands of universities.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.ielts.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                Visit Official IELTS Site
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                to="/book-appointment"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:border-red-200 transition-all duration-200"
              >
                Get Free Guidance
              </Link>
            </div>
          </div>

          {/* Band Scale Gauge */}
          <div data-reveal-scale ref={gaugeRef} className="relative mx-auto">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-red-600 via-red-600 to-red-700 shadow-2xl shadow-red-500/30 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:18px_18px] opacity-40" />
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/25 flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-1">Band Scale</span>
                <span className="text-white text-6xl sm:text-7xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {bandCount}
                </span>
                <span className="text-red-100 text-sm font-semibold mt-1">Expert User (top score)</span>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-lg text-xs font-bold text-red-600 whitespace-nowrap">
              Scored 0–9 in half-band steps
            </div>
          </div>
        </div>
      </section>

      {/* ── Test Format Timeline ─────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
              <Clock className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">2h 44m Total</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              The 4{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Modules</span>
            </h2>
          </div>

          <div data-reveal data-reveal-children className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MODULES.map((m, i) => (
              <div key={m.name} className="relative bg-white border border-gray-100 hover:border-red-200 rounded-3xl p-7 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)] hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1.5 transition-all duration-300">
                <span className="absolute top-5 right-6 text-3xl font-extrabold text-red-50">0{i + 1}</span>
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5">
                  <m.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{m.name}</h3>
                <span className="inline-block text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full mb-3">{m.duration}</span>
                <p className="text-sm text-gray-500 leading-relaxed">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Academic vs General Training Toggle ──────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Academic{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">vs</span>{' '}
              General Training
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">Same Listening &amp; Speaking modules — Reading and Writing differ by purpose.</p>
          </div>

          <div data-reveal className="flex justify-center mb-8">
            <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm">
              {['academic', 'general'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    mode === m ? 'bg-red-600 text-white shadow-lg shadow-red-500/25' : 'text-gray-500 hover:text-red-600'
                  }`}
                >
                  {m === 'academic' ? 'Academic' : 'General Training'}
                </button>
              ))}
            </div>
          </div>

          <div data-reveal className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)]">
            {mode === 'academic' ? (
              <div className="space-y-4">
                <p className="text-sm font-bold text-red-600 uppercase tracking-wide">For: university and college admission, professional registration</p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-3"><Check className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> Reading passages are from academic journals, books and magazines.</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> Writing Task 1 asks you to describe a graph, chart, diagram or process.</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> Required by most universities worldwide for degree programs.</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-bold text-red-600 uppercase tracking-wide">For: immigration (UK, Australia, Canada, NZ), secondary education, work experience</p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-3"><Check className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> Reading passages come from everyday sources — notices, advertisements, workplace materials.</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> Writing Task 1 asks you to write a letter (formal, semi-formal or informal).</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> The standard route for skilled-migration visa applications.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Band Scale Breakdown ─────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
              <Award className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">Official Band Descriptors</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              What Each{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Band Means</span>
            </h2>
          </div>

          <div data-reveal data-reveal-children className="space-y-3">
            {BAND_SCALE.map((b) => (
              <div key={b.band} className="flex items-center gap-4 bg-white border border-gray-100 hover:border-red-200 rounded-2xl px-5 py-4 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.05)] hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 group">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-red-600 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center text-white font-extrabold text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {b.band}
                </div>
                <div className="flex-1 h-2 rounded-full bg-red-50 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full" style={{ width: `${(b.band / 9) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{b.label}</span>
              </div>
            ))}
            <p className="text-xs text-gray-500 text-center pt-2">Most university programs typically ask for an Overall Band of 6.0–7.5 — always confirm the exact figure with your target institution.</p>
          </div>

          <div data-reveal className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Already have your raw scores?</h3>
              <p className="mt-1 text-sm text-gray-500">Use our free calculator to estimate your overall band instantly.</p>
            </div>
            <Link
              to="/study-abroad/tools/ielts-band-calculator"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-red-700"
            >
              Calculate My Band
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8-Week Prep Plan ──────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              An 8-Week{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Study Plan</span>
            </h2>
          </div>

          <div data-reveal data-reveal-children className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-red-100">
            {PREP_WEEKS.map((w) => (
              <div key={w.week} className="relative">
                <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-red-600 ring-4 ring-white shadow-md" />
                <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Week {w.week}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{w.focus}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{w.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verified Links ────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div data-reveal data-reveal-children className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'IELTS.org', desc: 'Official test information & score guides', url: 'https://www.ielts.org' },
              { name: 'British Council', desc: 'Book your test & free practice materials', url: 'https://www.britishcouncil.org/exam/ielts' },
              { name: 'IDP IELTS', desc: 'Book your test & official prep resources', url: 'https://ielts.idp.com' },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white border border-gray-100 hover:border-red-200 rounded-2xl p-6 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.05)] hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{link.name}</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </div>
                <p className="text-sm text-gray-500">{link.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              IELTS{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">FAQ</span>
            </h2>
          </div>
          <div data-reveal data-reveal-children className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === i ? 'border-red-200 shadow-lg shadow-red-500/10 ring-1 ring-red-100' : 'border-gray-100 hover:border-red-100'}`}>
                <button className="w-full flex items-center justify-between px-6 py-5 text-left group" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className={`font-semibold text-sm sm:text-base pr-4 ${openFaq === i ? 'text-red-600' : 'text-gray-900 group-hover:text-red-600'}`}>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-400 ${openFaq === i ? 'rotate-180 text-red-600' : 'text-gray-500'}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-400 ease-in-out ${openFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4 mx-6 mb-1">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-3xl px-8 sm:px-12 lg:px-20 py-16 lg:py-20 text-center shadow-2xl shadow-red-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Ready to Book Your IELTS?
              </h2>
              <p className="text-red-100 text-lg mb-10 max-w-xl mx-auto">Let our counsellors guide your test date around your application deadlines.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://www.ielts.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  Book on IELTS.org <ExternalLink className="w-4 h-4" />
                </a>
                <Link to="/language-club/exam-prep" className="inline-flex items-center gap-2 px-8 py-4 bg-red-700/40 hover:bg-red-700/60 text-white font-bold rounded-2xl border border-white/20 transition-all duration-300">
                  Compare Other Exams <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LanguageFooter />
    </div>
  );
};

export default IELTSPage;
