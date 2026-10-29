import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import LanguageNavbar from '../components/LanguageNavbar';
import LanguageFooter from '../components/LanguageFooter';
import FlagIcon from '../components/FlagIcon';
import Seo from '../components/common/Seo';
import { getLanguages } from '../services/languageService';
import {
  Earth,
  Book,
  Target,
  Trophy,
  Zap,
  Layers,
} from 'lucide-react';
import HeroSection from './language-club/HeroSection';
import LevelsSection from './language-club/LevelsSection';
import FlashcardsPreview from './language-club/FlashcardsPreview';
import LeaderboardPreview from './language-club/LeaderboardPreview';
import Testimonials from './language-club/Testimonials';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ─── Animated Counter Hook ─────────────────────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* ─── Intersection Observer Hook ─────────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const LanguageClubHome = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [languages, setLanguages] = useState([]);
  const pageRef = useRef(null);

  useEffect(() => {
    getLanguages()
      .then((data) => setLanguages(data))
      .catch(() => setLanguages([]));
  }, []);

  /* Animated counters */
  const [statsRef, statsInView] = useInView(0.3);
  const countLangs = useCountUp(21, 1400, statsInView);
  const countLessons = useCountUp(420, 1600, statsInView);
  const countLearners = useCountUp(5000, 1800, statsInView);

  /* Generic scroll-reveal system shared across every static section below.
     Wrap a block with data-reveal to fade+rise it in; add
     data-reveal-children to stagger its direct children instead. */
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.utils.toArray('[data-reveal]').forEach((group) => {
        const targets = group.hasAttribute('data-reveal-children') ? group.children : [group];
        gsap.set(targets, { opacity: 0, y: 32 });
        ScrollTrigger.create({
          trigger: group,
          start: 'top 85%',
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.1,
              ease: 'power3.out',
              onComplete: () => gsap.set(targets, { clearProps: 'transform' }),
            }),
        });
      });

      gsap.utils.toArray('[data-reveal-scale]').forEach((el) => {
        gsap.set(el, { opacity: 0, scale: 0.95 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 82%',
          once: true,
          onEnter: () => gsap.to(el, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }),
        });
      });
    },
    { scope: pageRef }
  );

  const features = [
    {
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      title: 'Expert-Curated Lessons',
      description:
        'Lessons built by experienced linguists and native speakers.',
    },
    {
      icon: <Layers className="w-7 h-7" />,
      title: 'Interactive Flashcards',
      description:
        'Memorize words faster with our 3D interactive flashcard system.',
    },
    {
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: 'Global Community',
      description:
        'Join thousands of learners worldwide. Share progress and practice together.',
    },
  ];

  const featuredLang = languages.find((l) => l.languageId === 'japanese');

  const howItWorks = [
    {
      step: '01',
      icon: <Earth className="w-10 h-10" />,
      title: 'Pick a Language',
      desc: 'Browse 21+ languages and choose the one that excites you most.',
    },
    {
      step: '02',
      icon: <Book className="w-10 h-10" />,
      title: 'Start a Lesson',
      desc: 'Follow structured lessons with vocabulary, grammar and real phrases.',
    },
    {
      step: '03',
      icon: <Target className="w-10 h-10" />,
      title: 'Practice & Master',
      desc: 'Test yourself with quizzes, track progress and become fluent.',
    },
  ];

  const faqs = [
    {
      q: 'Do I need to create an account to start learning?',
      a: 'No! You can start learning any language right away without signing up. An account unlocks extra features like progress tracking.',
    },
    {
      q: 'Which language should I start with as a beginner?',
      a: 'We recommend starting with English or Spanish, they are marked as "Easy" and have the most structured beginner content.',
    },
    {
      q: 'Are all the lessons really free?',
      a: 'Yes, 100% free. No hidden fees, no premium tiers. Language Club is built to make language learning accessible for everyone.',
    },
    {
      q: 'How long does it take to finish a language course?',
      a: 'Each language has 20 focused lessons covering everything from greetings to culture and etiquette. Work through them at your own pace to build real conversational skills.',
    },
    {
      q: 'Can I learn multiple languages at the same time?',
      a: 'Absolutely! Many of our learners study two or three languages simultaneously. Just explore them at your own pace.',
    },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-white overflow-x-hidden">
      <Seo
        title="Free Language Learning Club - Just Go Study"
        description="Learn a new language for free with Just Go Study's Language Club, interactive lessons, flashcards, and a leaderboard to track your progress."
      />
      <LanguageNavbar />

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <HeroSection
        statsRef={statsRef}
        countLangs={countLangs}
        countLessons={countLessons}
        countLearners={countLearners}
      />

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-20 lg:py-28 bg-white relative overflow-hidden"
      >
        {/* decorative blobs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-red-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div data-reveal data-reveal-children className="text-center mb-16 relative">
            {/* Decorative element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -z-10"></div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">
                Simple Steps
              </span>
            </div>

            <h2
              className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-2 mb-6"
              style={{ fontFamily: '\'Outfit\', sans-serif' }}
            >
              How It{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                Works
              </span>
            </h2>

            <div className="flex flex-col items-center">
              <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                Getting started takes less than{' '}
                <span className="text-red-600 font-bold">30 seconds</span>,
                <span className="block sm:inline ml-1 text-gray-900 font-medium">
                  no sign-up required.
                </span>
              </p>
              <div className="mt-6 h-1 w-12 bg-gradient-to-r from-red-500 to-red-200 rounded-full"></div>
            </div>
          </div>

          <div data-reveal data-reveal-children className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {howItWorks.map((item, i) => (
              <div
                key={i}
                className="relative group bg-white hover:bg-white border border-gray-100 hover:border-red-200 rounded-3xl p-8 text-center shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-red-500/10"
              >
                {/* connector line (desktop) */}
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-5 w-10 h-0.5 bg-gradient-to-r from-red-300 to-transparent z-10" />
                )}
                <div className="flex justify-center items-center text-red-600 mb-5 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <span className="inline-block px-3 py-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full mb-4">
                  Step {item.step}
                </span>
                <h3
                  className="text-xl font-bold text-gray-900 mb-3"
                  style={{ fontFamily: '\'Outfit\', sans-serif' }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-16 relative">
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -z-10"></div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-6">
              <Zap className="w-4 h-4 text-red-500 fill-red-500/10" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">
                Why Just Go Study Language Club
              </span>
            </div>

            <h2
              className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-2 mb-6"
              style={{ fontFamily: '\'Outfit\', sans-serif' }}
            >
              Everything You{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                Need to Learn
              </span>
            </h2>

            <div className="flex flex-col items-center">
              <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Language learning here is{' '}
                <span className="text-gray-900 font-semibold">
                  enjoyable and effective,
                </span>{' '}
                and it&apos;s
                <span className="text-red-600 font-bold ml-1">
                  completely free.
                </span>
              </p>
              <div className="mt-8 flex gap-2">
                <div className="h-1.5 w-12 bg-red-600 rounded-full"></div>
                <div className="h-1.5 w-4 bg-red-200 rounded-full"></div>
                <div className="h-1.5 w-2 bg-red-100 rounded-full"></div>
              </div>
            </div>
          </div>

          <div data-reveal data-reveal-children className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl border border-gray-100 p-8 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.05)] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 cursor-default"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3
                  className="text-lg font-bold text-gray-900 mb-3"
                  style={{ fontFamily: '\'Outfit\', sans-serif' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exam Prep Teaser ──────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-reveal
            className="relative overflow-hidden bg-white border border-red-100 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-[0_2px_20px_-6px_rgba(14,16,23,0.06)] flex flex-col lg:flex-row items-center gap-8"
          >
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-red-50 rounded-full pointer-events-none" />
            <div className="relative flex-1 text-center lg:text-left">
              <span className="inline-block text-[10px] sm:text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-4">
                Study Abroad Exam Prep
              </span>
              <h3
                className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Applying Abroad? Prep for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                  IELTS, PTE, TOEFL &amp; GRE/GMAT
                </span>
              </h3>
              <p className="text-gray-500 text-sm sm:text-base max-w-xl leading-relaxed">
                Real test formats, real scoring scales, and verified links straight to the official
                test owners. Four guides to help you get the score your application needs.
              </p>
            </div>
            <Link
              to="/language-club/exam-prep"
              className="relative shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              Explore Exam Prep
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Vocabulary Flashcards Preview ────────────────────────────── */}
      <FlashcardsPreview />

      {/* ── Featured Language of the Week ────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-12 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -z-10"></div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
              <Trophy className="w-4 h-4 text-red-500 fill-red-500/10" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">
                Featured This Week
              </span>
            </div>

            <h2
              className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-2"
              style={{ fontFamily: '\'Outfit\', sans-serif' }}
            >
              Language of the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                Week
              </span>
            </h2>
          </div>

          <div
            data-reveal-scale
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-red-500 p-1 shadow-2xl shadow-red-500/25 ring-1 ring-red-900/5"
          >
            <div className="relative rounded-[22px] px-8 sm:px-14 py-12 lg:py-16 flex flex-col lg:flex-row items-center gap-10 overflow-hidden">
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:22px_22px] opacity-30 pointer-events-none" />

              {/* Flag + emoji */}
              <div className="relative flex-shrink-0 text-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/25 flex items-center justify-center mx-auto shadow-xl transition-transform duration-300 hover:scale-105 hover:rotate-6">
                  <FlagIcon
                    languageId="japanese"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full"
                  />
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-300/60 rounded-full shadow-sm shadow-black/10">
                  <span className="text-amber-200 text-xs">⭐</span>
                  <span className="text-amber-100 text-xs font-bold">
                    Featured
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="relative flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full mb-4">
                  <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-semibold uppercase tracking-wide">
                    Hard Difficulty
                  </span>
                </div>
                <h3
                  className="text-3xl sm:text-4xl font-extrabold text-white mb-3 drop-shadow-sm"
                  style={{ fontFamily: '\'Outfit\', sans-serif' }}
                >
                  Japanese 🇯🇵
                </h3>
                <p className="text-red-50 text-base mb-6 max-w-xl leading-relaxed">
                  {featuredLang?.description}
                </p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                  {['Kanji', 'Hiragana', 'Katakana', 'JLPT Ready'].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-full"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
                <Link
                  to="/language-club/learn/japanese"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-red-50 text-red-600 font-bold rounded-2xl shadow-xl shadow-black/20 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-200"
                >
                  Start Japanese Now
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Language Preview with Difficulty Badges ───────────────────── */}
      <LevelsSection />

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <Testimonials />

      {/* ── Leaderboard Preview ─────────────────────────────────────── */}
      <LeaderboardPreview />

      {/* ── FAQ Section ──────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal data-reveal-children className="text-center mb-14 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -z-10"></div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-6">
              <Book className="w-4 h-4 text-red-500 fill-red-500/10" />
              <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">
                Support Center
              </span>
            </div>

            <h2
              className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-2 mb-6"
              style={{ fontFamily: '\'Outfit\', sans-serif' }}
            >
              Frequently Asked{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                Questions
              </span>
            </h2>

            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Everything you need to know about{' '}
              <span className="text-gray-900 font-semibold">
                Just Go Study Language Club.
              </span>
            </p>
          </div>

          <div data-reveal data-reveal-children className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  openFaq === i
                    ? 'border-red-200 shadow-lg shadow-red-500/10 ring-1 ring-red-100'
                    : 'border-gray-100 hover:border-red-100 hover:shadow-md hover:shadow-gray-200/50'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span
                    className={`font-semibold text-sm sm:text-base pr-4 transition-colors duration-300 ${openFaq === i ? 'text-red-600' : 'text-gray-900 group-hover:text-red-600'}`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${
                      openFaq === i
                        ? 'bg-red-600 border-red-600 shadow-lg shadow-red-500/30'
                        : 'border-gray-100 group-hover:border-red-200 group-hover:bg-red-50'
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 transition-all duration-400 ${openFaq === i ? 'rotate-180 text-white' : 'text-gray-500 group-hover:text-red-500'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Pure-CSS grid-rows accordion: no layout measuring needed */}
                <div
                  className={`grid transition-[grid-template-rows] duration-400 ease-in-out ${openFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4 mt-1 mx-6 mb-1 rounded-b-2xl">
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-reveal
            className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-3xl px-8 sm:px-12 lg:px-20 py-16 lg:py-20 text-center shadow-2xl shadow-red-500/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3"></div>
            <div className="relative">
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6"
                style={{ fontFamily: '\'Outfit\', sans-serif' }}
              >
                Ready to Start Your Journey?
              </h2>
              <p className="text-red-100 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of learners already picking up new languages
                every day. It&apos;s free, and it works.
              </p>
              <Link
                to="/language-club/explore"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Get Started Now
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LanguageFooter />
    </div>
  );
};

export default LanguageClubHome;
