import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Earth } from 'lucide-react';
import FlagIcon from '../../components/FlagIcon';
import { getLanguages } from '../../services/languageService';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ─── Language difficulty styles ──────────────────────────────────────── */
const difficultyStyles = {
  Easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Hard: 'bg-red-100 text-red-700 border-red-200',
};

const LevelsSection = () => {
  const [languages, setLanguages] = useState([]);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    getLanguages()
      .then((data) => setLanguages(data))
      .catch(() => setLanguages([]));
  }, []);

  const previewLanguages = languages.slice(0, 8);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;

      const headerItems = gsap.utils.toArray(headerRef.current.children);
      gsap.set(headerItems, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: headerRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () =>
          gsap.to(headerItems, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            onComplete: () => gsap.set(headerItems, { clearProps: 'transform' }),
          }),
      });

      const cards = gsap.utils.toArray(gridRef.current.children);
      gsap.set(cards, { opacity: 0, y: 30, scale: 0.85 });
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () =>
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.06,
            ease: 'back.out(1.7)',
            onComplete: () => gsap.set(cards, { clearProps: 'transform' }),
          }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 bg-gray-50/60 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(14,16,23,0.04)_1px,transparent_0)] [background-size:28px_28px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={headerRef} className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -z-10"></div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-6">
            <Earth className="w-4 h-4 text-red-500" />
            <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">
              Available Languages
            </span>
          </div>

          <h2
            className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-2 mb-6"
            style={{ fontFamily: '\'Outfit\', sans-serif' }}
          >
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
              Language
            </span>
          </h2>

          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto mb-8">
            Pick any language and start learning right away, {' '}
            <span className="text-gray-900 font-semibold italic">
              no sign-up required.
            </span>
          </p>

          {/* Difficulty Legend */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">
              Difficulty:
            </span>
            {[
              {
                label: 'Easy',
                color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
              },
              {
                label: 'Medium',
                color: 'bg-amber-50 text-amber-600 border-amber-100',
              },
              {
                label: 'Hard',
                color: 'bg-red-50 text-red-600 border-red-100',
              },
            ].map((d) => (
              <span
                key={d.label}
                className={`text-xs font-bold px-4 py-1.5 rounded-xl border shadow-sm transition-transform hover:scale-105 cursor-default ${d.color}`}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>

        <div
          ref={gridRef}
          className="flex flex-wrap items-start justify-center gap-8 sm:gap-10 lg:gap-14"
        >
          {previewLanguages.map((lang) => (
            <Link
              key={lang.languageId}
              to={`/language-club/language/${lang.languageId}`}
              className="group flex flex-col items-center gap-3 will-change-transform"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-red-50 to-white border-2 border-red-100 shadow-[0_4px_16px_-6px_rgba(14,16,23,0.1)] group-hover:border-red-400 group-hover:shadow-lg group-hover:shadow-red-500/20 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center transition-all duration-300">
                <FlagIcon
                  languageId={lang.languageId}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-sm"
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600 transition-colors duration-200">
                {lang.name}
              </span>
              {lang.difficulty && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyStyles[lang.difficulty]}`}
                >
                  {lang.difficulty}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/language-club/explore"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-gray-50 text-red-600 font-semibold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100"
          >
            View All Languages
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LevelsSection;
