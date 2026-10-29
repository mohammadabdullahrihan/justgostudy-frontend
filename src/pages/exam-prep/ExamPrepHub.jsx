import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageNavbar from '../../components/LanguageNavbar';
import LanguageFooter from '../../components/LanguageFooter';
import Seo from '../../components/common/Seo';
import useScrollReveal from '../../hooks/useScrollReveal';
import examPrepService from '../../services/examPrepService';
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Award,
  ChevronDown,
} from 'lucide-react';

const EXAM_ICONS = {
  ielts: BookOpen,
  pte: Mic,
  toefl: Headphones,
  'gre-gmat': PenTool,
};
const DEFAULT_EXAM_ICON = Award;

// The compare table's columns are keyed as 'greGmat' (camelCase) while the
// matching exam card's examId is 'gre-gmat' — preserved from the original
// hardcoded data; this just bridges the two so the table can look up each
// column's exam name from the ExamCard collection instead of duplicating it.
const COMPARE_COLUMN_KEYS = ['ielts', 'pte', 'toefl', 'greGmat'];
const COMPARE_KEY_TO_EXAM_ID = { ielts: 'ielts', pte: 'pte', toefl: 'toefl', greGmat: 'gre-gmat' };

const ExamPrepHub = () => {
  const pageRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [exams, setExams] = useState([]);
  const [compareRows, setCompareRows] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useScrollReveal(pageRef);

  const fetchExamPrepData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await examPrepService.getExamPrepData();
      setExams(data.cards || []);
      setCompareRows(data.compareRows || []);
      setFaqs(data.faqs || []);
    } catch (err) {
      console.error('Failed to fetch exam prep data:', err);
      setError(err.message || 'Failed to load exam prep guides');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExamPrepData();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-white overflow-x-hidden">
      <Seo
        title="Exam Prep: IELTS, PTE, TOEFL, GRE & GMAT - Just Go Study Language Club"
        description="Free, in-depth prep guides for IELTS, PTE Academic, TOEFL iBT, GRE and GMAT — real test formats, scoring scales, timelines and verified links to every official test site."
      />
      <LanguageNavbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-gradient-to-b from-red-50/60 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(220,38,38,0.08)_1px,transparent_0)] [background-size:26px_26px] pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-red-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div data-reveal data-reveal-children>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-7">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">
                Study Abroad Exam Prep
              </span>
            </div>

            <h1
              className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.05]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Every Score{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                Your Application
              </span>{' '}
              Needs
            </h1>

            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Real test formats, real scoring scales, real timelines — no fluff. Four dedicated,
              deeply-researched guides for the exams that open the door to studying abroad, each
              linking straight to the official test owner for registration and the latest rules.
            </p>
          </div>
        </div>
      </section>

      {/* ── Exam Cards ────────────────────────────────────────────────── */}
      <section className="py-4 lg:py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-center sm:text-left">
              <p className="text-sm text-red-600 font-semibold">Couldn&apos;t load exam prep guides right now.</p>
              <button
                onClick={fetchExamPrepData}
                className="shrink-0 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-3xl p-8 animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 mb-6" />
                  <div className="w-2/3 h-6 bg-gray-100 rounded mb-3" />
                  <div className="w-full h-4 bg-gray-50 rounded mb-2" />
                  <div className="w-3/4 h-4 bg-gray-50 rounded" />
                </div>
              ))}
            </div>
          ) : (
          <div data-reveal data-reveal-children className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {exams.map((exam) => {
              const Icon = EXAM_ICONS[exam.examId] || DEFAULT_EXAM_ICON;
              return (
                <Link
                  key={exam._id}
                  to={exam.path}
                  className="group relative overflow-hidden bg-white border border-gray-100 hover:border-red-200 rounded-3xl p-8 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)] hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-50 rounded-full group-hover:scale-125 group-hover:bg-red-100/70 transition-all duration-500" />
                  <div className="relative flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>

                  <h3
                    className="relative text-2xl font-extrabold text-gray-900 mb-2"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {exam.name}
                  </h3>
                  <p className="relative text-sm text-gray-500 leading-relaxed mb-6">{exam.tagline}</p>

                  <div className="relative flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 group-hover:bg-red-50 border border-gray-100 group-hover:border-red-100 rounded-full text-xs font-semibold text-gray-600 group-hover:text-red-600 transition-colors duration-300">
                      <Award className="w-3 h-3" /> {exam.scoreLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 group-hover:bg-red-50 border border-gray-100 group-hover:border-red-100 rounded-full text-xs font-semibold text-gray-600 group-hover:text-red-600 transition-colors duration-300">
                      <Clock className="w-3 h-3" /> {exam.duration}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* ── Quick Comparison ─────────────────────────────────────────── */}
      {compareRows.length > 0 && (
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">
                Quick Comparison
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              At a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Glance</span>
            </h2>
          </div>

          <div data-reveal className="overflow-x-auto rounded-3xl border border-gray-100 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)]">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="text-left font-bold px-6 py-4 rounded-tl-3xl">Test</th>
                  {compareRows.map((row, i) => (
                    <th
                      key={row._id}
                      className={`text-left font-bold px-6 py-4 ${i === compareRows.length - 1 ? 'rounded-tr-3xl' : ''}`}
                    >
                      {row.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_COLUMN_KEYS.map((key, i) => {
                  const exam = exams.find((e) => e.examId === COMPARE_KEY_TO_EXAM_ID[key]);
                  return (
                    <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-red-50/30'}>
                      <td className="px-6 py-4 font-bold text-gray-900">{exam?.name || key}</td>
                      {compareRows.map((row) => (
                        <td key={row._id} className="px-6 py-4 text-gray-600">
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      )}

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Common{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Questions</span>
            </h2>
          </div>

          <div data-reveal data-reveal-children className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={faq._id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  openFaq === i ? 'border-red-200 shadow-lg shadow-red-500/10 ring-1 ring-red-100' : 'border-gray-100 hover:border-red-100'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className={`font-semibold text-sm sm:text-base pr-4 ${openFaq === i ? 'text-red-600' : 'text-gray-900 group-hover:text-red-600'}`}>
                    {faq.q}
                  </span>
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
      )}

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-3xl px-8 sm:px-12 lg:px-20 py-16 lg:py-20 text-center shadow-2xl shadow-red-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Not Sure Which Test to Take?
              </h2>
              <p className="text-red-100 text-lg mb-10 max-w-xl mx-auto">
                Our counsellors can match the right exam to your target university and country —
                free of charge.
              </p>
              <Link
                to="/book-appointment"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Book a Free Consultation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LanguageFooter />
    </div>
  );
};

export default ExamPrepHub;
