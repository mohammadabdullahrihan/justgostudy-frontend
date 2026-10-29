import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import LanguageNavbar from '../components/LanguageNavbar';
import LanguageFooter from '../components/LanguageFooter';
import FlagIcon from '../components/FlagIcon';
import Seo from '../components/common/Seo';
import flashcardService from '../services/flashcardService';
import { getLanguageById } from '../services/languageService';

const difficultyColor = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Medium: 'bg-amber-50 text-amber-700 border-amber-100',
  Hard: 'bg-rose-50 text-red-700 border-rose-100',
};

const formatSpeakers = (n) => {
  if (!n) return '';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  return n.toLocaleString();
};

const LanguageDetailPage = () => {
  const { languageId } = useParams();
  const [language, setLanguage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [flashcardLanguages, setFlashcardLanguages] = useState([]);

  useEffect(() => {
    flashcardService.getFlashcardLanguages()
      .then((langs) => setFlashcardLanguages(langs))
      .catch((err) => {
        console.error('Failed to load flashcard languages', err);
        setFlashcardLanguages([]);
      });
  }, []);

  const loadLanguage = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);
    setLoadError(null);

    getLanguageById(languageId)
      .then((data) => {
        if (cancelled) return;
        if (!data) setNotFound(true);
        else setLanguage(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load language', err);
        if (err?.status === 404) setNotFound(true);
        else setLoadError(err?.message || 'Could not load this language. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [languageId]);

  useEffect(() => loadLanguage(), [loadLanguage]);

  if (!isLoading && loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LanguageNavbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Something Went Wrong
            </h1>
            <p className="text-gray-500 mb-8">{loadError}</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={loadLanguage}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition-all duration-200"
              >
                Try Again
              </button>
              <Link
                to="/language-club/explore"
                className="inline-flex items-center gap-2 text-red-600 font-semibold"
              >
                Browse Languages
              </Link>
            </div>
          </div>
        </div>
        <LanguageFooter />
      </div>
    );
  }

  if (!isLoading && (notFound || !language)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LanguageNavbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Language Not Found
            </h1>
            <p className="text-gray-500 mb-8">
              We couldn&apos;t find the language you&apos;re looking for. Please check the URL or browse our available languages.
            </p>
            <Link
              to="/language-club/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Browse Languages
            </Link>
          </div>
        </div>
        <LanguageFooter />
      </div>
    );
  }

  if (isLoading || !language) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LanguageNavbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full animate-pulse">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gray-200"></div>
            <div>
              <div className="w-40 h-6 bg-gray-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-100 rounded"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 space-y-3">
            <div className="w-full h-3 bg-gray-100 rounded"></div>
            <div className="w-5/6 h-3 bg-gray-100 rounded"></div>
            <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
          </div>
        </div>
        <LanguageFooter />
      </div>
    );
  }

  const hasFlashcards = flashcardLanguages.some((l) => l.languageId === language.languageId);

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans flex flex-col">
      <Seo
        title={`Learn ${language.name} - Just Go Study Language Club`}
        description={(language.description || `Learn ${language.name} for free with Just Go Study's Language Club, structured lessons, flashcards and progress tracking.`).slice(0, 160)}
      />
      <LanguageNavbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-red-50/30 to-white pt-32 pb-16 flex-1">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-100/20 rounded-full blur-3xl"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link
            to="/language-club/explore"
            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors duration-200 hover:bg-red-100 mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Explore
          </Link>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10 shadow-xl shadow-gray-900/[0.04]">
            {/* Header */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-white border-2 border-red-100 flex items-center justify-center shrink-0">
                <FlagIcon languageId={language.languageId} className="w-12 h-12 rounded-full shadow-sm" />
              </div>
              <div>
                <h1
                  className="text-3xl sm:text-4xl font-extrabold text-gray-900"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {language.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${difficultyColor[language.difficulty] || difficultyColor.Medium}`}>
                    {language.difficulty}
                  </span>
                  <span className="text-gray-500">·</span>
                  <span className="text-sm text-gray-500">{language.totalLessons} lessons</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">{language.description}</p>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-red-50/60 border border-red-100/80 rounded-xl p-4 shadow-[0_2px_10px_-6px_rgba(220,38,38,0.15)]">
                <p className="text-2xl font-extrabold text-red-600" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {formatSpeakers(language.totalSpeakers)}+
                </p>
                <p className="text-xs text-gray-500 mt-1">Speakers worldwide</p>
              </div>
              <div className="bg-red-50/60 border border-red-100/80 rounded-xl p-4 shadow-[0_2px_10px_-6px_rgba(220,38,38,0.15)]">
                <p className="text-2xl font-extrabold text-red-600" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {language.countries.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {language.countries.length === 1 ? 'Country' : 'Countries'}
                </p>
              </div>
            </div>

            {/* Countries */}
            <div className="mb-10">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Spoken In</h3>
              <div className="flex flex-wrap gap-2">
                {language.countries.map((country) => (
                  <span
                    key={country}
                    className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 rounded-full px-3.5 py-1.5"
                  >
                    {country}
                  </span>
                ))}
              </div>
            </div>

            {/* Official Learning Institutes */}
            {language.learningInstitutes?.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  {language.learningInstitutes.length > 1 ? 'Official Learning Institutes' : 'Official Learning Institute'}
                </h3>
                <div className="space-y-3">
                  {language.learningInstitutes.map((institute) => (
                    <a
                      key={institute.url}
                      href={institute.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-4 bg-gray-50 hover:bg-red-50/60 border border-gray-100 hover:border-red-200 rounded-2xl p-5 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 text-red-600 group-hover:scale-105 transition-transform duration-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors duration-200 truncate">
                            {institute.name}
                          </p>
                          <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-500 shrink-0 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        {institute.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {institute.description}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/language-club/learn/${language.languageId}`}
                className="flex items-center justify-center gap-2 flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-500/20 transition-all duration-300"
              >
                Start Learning
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              {hasFlashcards && (
                <Link
                  to={`/language-club/flashcards/${language.languageId}`}
                  className="flex items-center justify-center gap-2 flex-1 py-3.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-sm rounded-xl transition-all duration-300"
                >
                  Practice Flashcards
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <LanguageFooter />
    </div>
  );
};

export default LanguageDetailPage;
