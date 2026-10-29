import { useRef } from 'react';
import { Link } from 'react-router-dom';
import LanguageNavbar from '../../components/LanguageNavbar';
import LanguageFooter from '../../components/LanguageFooter';
import ExamPrepBackLink from '../../components/language-club/ExamPrepBackLink';
import Seo from '../../components/common/Seo';
import useScrollReveal from '../../hooks/useScrollReveal';
import useCountUp from '../../hooks/useCountUp';
import {
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  Building2,
} from 'lucide-react';

const SECTIONS = [
  { icon: BookOpen, name: 'Reading', duration: '~30 min', items: '50 items', detail: 'Vocabulary-completion, daily-life passages and academic texts — now multistage adaptive, so difficulty adjusts to your performance in real time.' },
  { icon: Headphones, name: 'Listening', duration: '~29 min', items: '47 items', detail: 'Campus conversations, announcements and academic lectures. Also adaptive, which shortens the section for most test-takers.' },
  { icon: PenTool, name: 'Writing', duration: '~23 min', items: '12 items', detail: 'Sentence-construction, email-composition and academic-discussion tasks — a broader mix of task types than the old 2-essay format.' },
  { icon: Mic, name: 'Speaking', duration: '~8 min', items: '11 items', detail: 'Repetition exercises and interview-style responses, replacing the previous stand-alone lecture/discussion prompts.' },
];

const FAQS = [
  { q: 'What changed in the January 2026 TOEFL redesign?', a: 'ETS rebuilt TOEFL iBT around a multistage-adaptive Reading and Listening design, added new Speaking and Writing task types, and cut total testing time from about 2 hours to roughly 90 minutes.' },
  { q: 'Is the new 1.0–6.0 score comparable to the old 0–120 score?', a: 'Yes. The new scale is CEFR-aligned (1.0 = A1, up to 6.0 = C2). During the 2026–2028 transition period, ETS shows both the new 1–6 score and a comparable legacy 0–120 score on every report, so universities have time to update their published requirements.' },
  { q: 'How fast do I get my TOEFL score now?', a: 'Official score reports are typically delivered within 72 hours of your test — much faster than the previous 4–8 day wait.' },
  { q: 'Will universities accept the new scoring scale?', a: 'Yes — ETS designed the transition period specifically so institutions can read both scales side by side through 2028. If you\'re unsure, your target university\'s admissions office can confirm which scale they\'re using.' },
];

const PREP_WEEKS = [
  { week: '1', focus: 'Learn the new adaptive interface', detail: 'The Reading and Listening sections now adjust difficulty as you go — take an official practice test first so test day isn\'t your first exposure to the new format.' },
  { week: '2–3', focus: 'Academic vocabulary & campus English', detail: 'Build vocabulary around lectures, seminars and campus-life scenarios — the core content pool hasn\'t changed even though timing has.' },
  { week: '4–5', focus: 'Writing task variety', detail: 'Practise sentence-construction, email-composition and academic-discussion responses separately — each is now scored as its own item type rather than one long essay.' },
  { week: '6', focus: 'Speaking accuracy under time pressure', detail: 'With only ~8 minutes and 11 items, every response counts — drill repetition and interview-style prompts for clarity and pacing.' },
  { week: '7–8', focus: 'Full adaptive mock tests', detail: 'Sit official ETS practice tests to get used to variable test length, then review your weakest section type before booking.' },
];

const TOEFLPage = () => {
  const pageRef = useRef(null);
  useScrollReveal(pageRef);
  const { count: newScale, ref: newGaugeRef } = useCountUp(6, 1200);
  const { count: legacyScale, ref: legacyGaugeRef } = useCountUp(120, 1400);

  return (
    <div ref={pageRef} className="min-h-screen bg-white overflow-x-hidden">
      <Seo
        title="TOEFL iBT Prep Guide (2026 Format) - Just Go Study Language Club"
        description="An up-to-date TOEFL iBT guide covering ETS's January 2026 redesign: the new adaptive format, the new 1.0-6.0 CEFR-aligned score with legacy 0-120 equivalents, an 8-week study plan, and verified links to ETS."
      />
      <LanguageNavbar />
      <ExamPrepBackLink />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-16 lg:pt-44 lg:pb-24 overflow-hidden bg-gradient-to-b from-red-50/60 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(220,38,38,0.08)_1px,transparent_0)] [background-size:26px_26px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div data-reveal data-reveal-children>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">Newly Redesigned — January 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.05]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Master the New{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">TOEFL iBT</span>
            </h1>

            <p className="text-gray-500 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
              ETS rebuilt TOEFL from the ground up in January 2026: a shorter, multistage-adaptive
              test (~90 minutes) with a new CEFR-aligned score — still the top choice for U.S. and
              Canadian university admission.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="https://www.ets.org/toefl.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-200">
                Visit Official ETS TOEFL Site <ExternalLink className="w-4 h-4" />
              </a>
              <Link to="/book-appointment" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:border-red-200 transition-all duration-200">
                Get Free Guidance
              </Link>
            </div>
          </div>

          {/* Dual Score Scale */}
          <div data-reveal-scale className="relative mx-auto w-full max-w-sm space-y-4">
            <div ref={newGaugeRef} className="relative bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-3xl p-7 shadow-2xl shadow-red-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:18px_18px] opacity-40" />
              <div className="relative flex items-center justify-between">
                <div>
                  <span className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] block mb-1">New CEFR Scale</span>
                  <span className="text-white text-5xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>{newScale}.0</span>
                </div>
                <span className="text-red-100 text-sm font-semibold">out of 1.0–6.0</span>
              </div>
            </div>
            <div ref={legacyGaugeRef} className="relative bg-white border-2 border-red-100 rounded-3xl p-7 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] block mb-1">Legacy Equivalent (shown through 2028)</span>
                  <span className="text-gray-900 text-5xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>{legacyScale}</span>
                </div>
                <span className="text-red-500 text-sm font-semibold">out of 0–120</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Format ────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
              <Clock className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">~90 Minutes, Adaptive</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              The 4{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Sections</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mt-4">Actual test time and item counts vary slightly per candidate since Reading and Listening now adapt to your performance.</p>
          </div>

          <div data-reveal data-reveal-children className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECTIONS.map((s, i) => (
              <div key={s.name} className="relative bg-white border border-gray-100 hover:border-red-200 rounded-3xl p-7 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)] hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1.5 transition-all duration-300">
                <span className="absolute top-5 right-6 text-3xl font-extrabold text-red-50">0{i + 1}</span>
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.name}</h3>
                <div className="flex gap-2 mb-3">
                  <span className="inline-block text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">{s.duration}</span>
                  <span className="inline-block text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">{s.items}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why the redesign matters ──────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Old vs{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">New TOEFL</span>
            </h2>
          </div>
          <div data-reveal className="overflow-x-auto rounded-3xl border border-gray-100 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)]">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="text-left font-bold px-6 py-4 rounded-tl-3xl"></th>
                  <th className="text-left font-bold px-6 py-4">Before Jan 2026</th>
                  <th className="text-left font-bold px-6 py-4 rounded-tr-3xl">From Jan 2026</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Total time', '~2 hours', '~90 minutes (adaptive)'],
                  ['Primary score', '0–120 scale', '1.0–6.0 CEFR-aligned scale'],
                  ['Legacy score', '—', 'Shown alongside through 2028'],
                  ['Results wait', '4–8 days', 'Within 72 hours'],
                ].map((row, i) => (
                  <tr key={row[0]} className={i % 2 === 0 ? 'bg-white' : 'bg-red-50/30'}>
                    <td className="px-6 py-4 font-bold text-gray-900">{row[0]}</td>
                    <td className="px-6 py-4 text-gray-500">{row[1]}</td>
                    <td className="px-6 py-4 text-red-600 font-semibold">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 8-Week Prep Plan ──────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
              <Building2 className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">Top Pick for U.S. & Canada</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              An 8-Week{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Study Plan</span>
            </h2>
          </div>
          {/* Roadmap table — echoes the "Old vs New" table motif above,
              instead of the vertical-dot timeline used elsewhere. */}
          <div data-reveal className="overflow-x-auto rounded-3xl border border-gray-100 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)]">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="text-left font-bold px-6 py-4 rounded-tl-3xl w-24">Week</th>
                  <th className="text-left font-bold px-6 py-4">Focus</th>
                  <th className="text-left font-bold px-6 py-4 rounded-tr-3xl">What to do</th>
                </tr>
              </thead>
              <tbody>
                {PREP_WEEKS.map((w, i) => (
                  <tr key={w.week} className={i % 2 === 0 ? 'bg-white' : 'bg-red-50/30'}>
                    <td className="px-6 py-4 font-extrabold text-red-600" style={{ fontFamily: "'Outfit', sans-serif" }}>{w.week}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{w.focus}</td>
                    <td className="px-6 py-4 text-gray-500">{w.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              Straight From{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">ETS</span>
            </h2>
          </div>
          {/* Single wide resource panel, two rows split by a divider —
              distinct from the separate cards/list patterns elsewhere. */}
          <div data-reveal className="bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-3xl p-1.5 shadow-xl shadow-red-500/20">
            <div className="bg-white rounded-[20px] divide-y divide-gray-100">
              {[
                { name: 'ETS.org / TOEFL', desc: 'Official test info, registration & score guides', url: 'https://www.ets.org/toefl.html' },
                { name: 'TOEFL 2026 Transformation', desc: 'ETS\'s own announcement explaining every format change', url: 'https://www.ets.org/news/press-releases/toefl-transformation-announcement.html' },
              ].map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 px-6 sm:px-8 py-6 hover:bg-red-50/40 transition-colors duration-200 first:rounded-t-[20px] last:rounded-b-[20px]">
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{link.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 shrink-0 text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              TOEFL{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">FAQ</span>
            </h2>
          </div>
          {/* Numbered editorial list — no accordion, no cards; reads like a
              reference sheet rather than a clickable widget. */}
          <div data-reveal data-reveal-children className="divide-y divide-gray-100 border-t border-b border-gray-100">
            {FAQS.map((faq, i) => (
              <div key={i} className="flex gap-5 py-7">
                <span className="shrink-0 text-2xl font-extrabold text-red-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-bold text-gray-900 mb-1.5">{faq.q}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Slim inline banner — deliberately understated next to the big
              gradient boxes used elsewhere. */}
          <div data-reveal className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white border border-gray-100 rounded-2xl px-6 sm:px-10 py-6 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)]">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="hidden sm:flex w-11 h-11 rounded-xl bg-red-50 text-red-600 items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Ready for the New TOEFL?</p>
                <p className="text-sm text-gray-500">Let our counsellors confirm which score scale your target university needs.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 shrink-0">
              <a href="https://www.ets.org/toefl.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-200">
                Register on ETS.org <ExternalLink className="w-4 h-4" />
              </a>
              <Link to="/language-club/exam-prep" className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:border-red-200 transition-all duration-200">
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

export default TOEFLPage;
