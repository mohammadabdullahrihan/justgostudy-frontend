import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import LessonSidebar from '../components/LessonSidebar';
import LessonContent from '../components/LessonContent';
import FlagIcon from '../components/FlagIcon';
import ConfirmModal from '../components/common/ConfirmModal';
import SignupPromptModal from '../components/language-club/SignupPromptModal';
import Seo from '../components/common/Seo';
import { getLanguageById, completeLesson as completeLessonRequest } from '../services/languageService';
import { useAchievementGate } from '../hooks/useAchievementGate';

gsap.registerPlugin(useGSAP);

const LanguageLearnPage = () => {
  const { languageId } = useParams();
  const pageRef = useRef(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const { modalContent, closeModal, gate } = useAchievementGate();

  // Load initial progress from localStorage
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem(`lang_progress_${languageId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track progress when completed lessons or languageId changes
  useEffect(() => {
    if (languageId) {
      try {
        localStorage.setItem(`lang_progress_${languageId}`, JSON.stringify(completedLessons));
      } catch (e) {
        console.error(e);
      }
    }
  }, [completedLessons, languageId]);

  // Sync progress when languageId changes (e.g. via URL navigation)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`lang_progress_${languageId}`);
      const parsed = saved ? JSON.parse(saved) : [];
      setCompletedLessons(parsed);
    } catch {
      setCompletedLessons([]);
    }
  }, [languageId]);

  const [language, setLanguage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLanguage(null);

    getLanguageById(languageId)
      .then((data) => {
        if (cancelled) return;
        setLanguage(data);
        if (data && data.lessons.length > 0) {
          setActiveLessonId(data.lessons[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setLanguage(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [languageId]);

  useGSAP(
    () => {
      if (!pageRef.current || isLoading) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' });
    },
    { scope: pageRef, dependencies: [isLoading] }
  );

  // Not Found
  if (!isLoading && !language) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1
            className="text-3xl font-extrabold text-gray-900 mb-3"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
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
    );
  }

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-[300px] bg-white border-r border-gray-100 p-5 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div>
              <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-14 h-3 bg-gray-100 rounded"></div>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full mb-6"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                <div className="w-28 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="flex-1 p-8 animate-pulse">
          <div className="max-w-4xl mx-auto">
            <div className="w-40 h-3 bg-gray-200 rounded mb-4"></div>
            <div className="w-60 h-8 bg-gray-200 rounded mb-8"></div>
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)]">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-200"></div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)]">
              <div className="space-y-3">
                <div className="w-1/2 h-6 bg-gray-200 rounded"></div>
                <div className="w-full h-3 bg-gray-100 rounded"></div>
                <div className="w-5/6 h-3 bg-gray-100 rounded"></div>
                <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeLesson = language.lessons.find((l) => l.id === activeLessonId);
  const activeLessonIndex = language.lessons.findIndex((l) => l.id === activeLessonId);
  const hasNext = activeLessonIndex < language.lessons.length - 1;
  const hasPrev = activeLessonIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      // Mark current lesson as completed when user clicks "Next"
      if (!completedLessons.includes(activeLessonId)) {
        setCompletedLessons((prev) => [...prev, activeLessonId]);
        gate(
          { title: 'Lesson complete!', message: 'Sign up to save your progress, points, and streak.' },
          () => completeLessonRequest(language.languageId, activeLessonId)
        );
      }
      setActiveLessonId(language.lessons[activeLessonIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompleteCurrent = () => {
    if (!completedLessons.includes(activeLessonId)) {
      setCompletedLessons((prev) => [...prev, activeLessonId]);
      gate(
        { title: 'Lesson complete!', message: 'Sign up to save your progress, points, and streak.' },
        () => completeLessonRequest(language.languageId, activeLessonId)
      );
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      setActiveLessonId(language.lessons[activeLessonIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectLesson = (lessonId) => {
    setActiveLessonId(lessonId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setShowRestartModal(true);
  };

  const confirmRestart = () => {
    setCompletedLessons([]);
    if (language && language.lessons.length > 0) {
      setActiveLessonId(language.lessons[0].id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden"
    >
      <Seo
        title={`${language.name} Lessons - Just Go Study Language Club`}
        description={`Work through structured ${language.name} lessons with Just Go Study's Language Club, track your progress lesson by lesson.`}
      />
      {/* Mobile Header */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 left-4 z-30 flex items-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold text-sm rounded-xl shadow-xl shadow-red-500/30 hover:bg-red-700 transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Lessons
      </button>

      {/* Sidebar */}
      <LessonSidebar
        language={language}
        lessons={language.lessons}
        activeLessonId={activeLessonId}
        completedLessons={completedLessons}
        onSelectLesson={handleSelectLesson}
        onRestart={handleRestart}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar with Progress */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <span className="text-xl flex items-center shrink-0">
                <FlagIcon languageId={language.languageId} className="w-9 h-9 rounded-full shadow-sm" />
              </span>
              <span className="text-base font-semibold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {language.name}
              </span>
              <span className="text-gray-500">·</span>
              <span className="text-sm text-gray-500">
                Lesson {activeLessonIndex + 1} of {language.lessons.length}
              </span>
              {/* Progress chip */}
              {completedLessons.length > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {completedLessons.length}/{language.lessons.length} done
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Compact percentage display */}
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.round((completedLessons.length / language.lessons.length) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-red-600 min-w-[32px]">
                  {Math.round((completedLessons.length / language.lessons.length) * 100)}%
                </span>
              </div>
              <Link
                to={`/language-club/flashcards/${language.languageId}`}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-full hover:bg-red-600 hover:text-white transition-all duration-200"
              >
                Flashcards
              </Link>
              <Link
                to="/language-club/explore"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Explore
              </Link>
            </div>
          </div>
          {/* Full-width thin progress bar at very bottom of topbar */}
          <div className="h-1 bg-gray-100 -mx-4 sm:-mx-6 lg:-mx-8">
            <div
              className="h-full bg-gradient-to-r from-red-400 via-red-500 to-red-600 transition-all duration-700 ease-out"
              style={{ width: `${Math.round((completedLessons.length / language.lessons.length) * 100)}%` }}
            />
          </div>
        </div>

        {/* Lesson Content */}
        {activeLesson && (
          <LessonContent
            lesson={activeLesson}
            onNext={handleNext}
            onPrev={handlePrev}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onComplete={handleCompleteCurrent}
          />
        )}
      </div>
      {/* Confirm Restart Modal */}
      <ConfirmModal
        isOpen={showRestartModal}
        onClose={() => setShowRestartModal(false)}
        onConfirm={confirmRestart}
        title="Restart Course?"
        message="Are you sure you want to restart this course? All your progress for this language will be cleared and you'll start from the first lesson."
        confirmText="Yes, Restart"
        cancelText="No, Keep Progress"
        type="danger"
      />
      <SignupPromptModal
        isOpen={!!modalContent}
        onClose={closeModal}
        {...modalContent}
      />
    </div>
  );
};

export default LanguageLearnPage;
