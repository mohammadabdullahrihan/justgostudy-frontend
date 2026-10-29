import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import LanguageNavbar from '../components/LanguageNavbar';
import LanguageFooter from '../components/LanguageFooter';
import FlagIcon from '../components/FlagIcon';
import Seo from '../components/common/Seo';
import { getLanguages } from '../services/languageService';

gsap.registerPlugin(useGSAP);

const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
  >
    <div className="flex items-center gap-4 mb-5">
      <div className="w-14 h-14 rounded-full bg-gray-200"></div>
      <div className="flex-1">
        <div className="w-24 h-5 bg-gray-200 rounded mb-2"></div>
        <div className="w-16 h-3 bg-gray-100 rounded"></div>
      </div>
    </div>
    <div className="space-y-2 mb-5">
      <div className="w-full h-3 bg-gray-100 rounded"></div>
      <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
    </div>
    <div className="w-full h-10 bg-gray-200 rounded-xl"></div>
  </motion.div>
);

const difficultyStyles = {
  Easy: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', glow: 'hover:shadow-emerald-500/[0.08] hover:border-emerald-200' },
  Medium: { color: 'bg-amber-50 text-amber-700 border-amber-100', glow: 'hover:shadow-amber-500/[0.08] hover:border-amber-200' },
  Hard: { color: 'bg-rose-50 text-red-700 border-rose-100', glow: 'hover:shadow-red-500/[0.08] hover:border-rose-200' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

const LanguageExplorePage = () => {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const headerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getLanguages()
      .then((data) => {
        if (!cancelled) setLanguages(data);
      })
      .catch(() => {
        if (!cancelled) setLanguages([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useGSAP(
    () => {
      const items = gsap.utils.toArray(headerRef.current.children);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      gsap.set(items, { opacity: 0, y: 20 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.1,
        onComplete: () => gsap.set(items, { clearProps: 'transform' }),
      });
    },
    { scope: headerRef }
  );

  const filtered = languages.filter((lang) => {
    const matchesSearch = lang.name.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || lang.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans">
      <Seo
        title="Explore Languages - Just Go Study Language Club"
        description="Browse every language available in Just Go Study's Language Club and pick one to start learning today, free."
      />
      <LanguageNavbar />

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-red-50/30 to-white pt-32 pb-16">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-100/20 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div ref={headerRef} className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Explore</span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mt-3 mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Choose Your Language
            </h1>
            <p className="text-gray-500 mb-8">
              Browse our collection of languages. Pick one and start learning for free today.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 focus:border-red-400 rounded-2xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-4 focus:ring-red-500/10 shadow-sm transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
              {['All', 'Easy', 'Medium', 'Hard'].map((level) => {
                const isActive = selectedDifficulty === level;
                let pillColor = 'bg-white hover:bg-red-50 text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-600';
                if (isActive) {
                  if (level === 'All') pillColor = 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20';
                  else if (level === 'Easy') pillColor = 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20';
                  else if (level === 'Medium') pillColor = 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20';
                  else if (level === 'Hard') pillColor = 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20';
                }

                return (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 ${pillColor}`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                No languages found
              </h3>
              <p className="text-gray-500 mb-6">Try searching with a different keyword or difficulty filter.</p>
              <button
                onClick={() => { setSearch(''); setSelectedDifficulty('All'); }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/10 transition-all duration-200 active:scale-95"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((lang) => {
                const diff = lang.difficulty ? { label: lang.difficulty, ...difficultyStyles[lang.difficulty] } : null;
                return (
                  <motion.div
                    key={lang.languageId}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className={`group bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 ${
                      diff ? diff.glow : 'hover:shadow-red-500/5 hover:border-red-200'
                    }`}
                  >
                    {/* Flag & Name */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-50 to-white border-2 border-red-100 group-hover:border-red-300 flex items-center justify-center transition-colors duration-300">
                        <FlagIcon languageId={lang.languageId} className="w-8 h-8 rounded-full shadow-sm" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-red-600 transition-colors duration-200" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {lang.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-gray-500">{lang.totalLessons} lessons</p>
                          <span className="text-gray-500 text-[10px]">·</span>
                          {diff && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${diff.color}`}>
                              {diff.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-2">
                      {lang.description}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3">
                      <Link
                        to={`/language-club/language/${lang.languageId}`}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-semibold text-sm rounded-xl transition-all duration-300 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-500/20"
                      >
                        Learn Now
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                      <Link
                        to={`/language-club/flashcards/${lang.languageId}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-100 font-semibold text-xs rounded-xl transition-all duration-300"
                      >
                        Flashcards
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <LanguageFooter />
    </div>
  );
};

export default LanguageExplorePage;
