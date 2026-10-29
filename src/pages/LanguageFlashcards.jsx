import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import LanguageNavbar from '../components/LanguageNavbar';
import LanguageFooter from '../components/LanguageFooter';
import FlagIcon from '../components/FlagIcon';
import Seo from '../components/common/Seo';
import SignupPromptModal from '../components/language-club/SignupPromptModal';
import { BookOpen, RefreshCw, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Loader2, Info, Volume2 } from 'lucide-react';
import flashcardService from '../services/flashcardService';
import { useAchievementGate } from '../hooks/useAchievementGate';

gsap.registerPlugin(useGSAP);

// Maps our languageId (seed data) to a BCP-47 locale for the Web Speech API
const SPEECH_LANG_CODES = {
  english: 'en-US',
  spanish: 'es-ES',
  french: 'fr-FR',
  german: 'de-DE',
  italian: 'it-IT',
  portuguese: 'pt-PT',
  dutch: 'nl-NL',
  russian: 'ru-RU',
  chinese: 'zh-CN',
  japanese: 'ja-JP',
  korean: 'ko-KR',
  arabic: 'ar-SA',
  hindi: 'hi-IN',
  bangla: 'bn-BD',
  urdu: 'ur-PK',
  turkish: 'tr-TR',
  vietnamese: 'vi-VN',
  thai: 'th-TH',
  persian: 'fa-IR',
  malay: 'ms-MY',
  swahili: 'sw-KE',
};

const SPEECH_SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window;

const LanguageFlashcards = () => {
  const headerRef = useRef(null);

  useGSAP(
    () => {
      if (!headerRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const items = gsap.utils.toArray(headerRef.current.children);
      gsap.set(items, { opacity: 0, y: -14 });
      gsap.to(items, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out' });
    },
    { scope: headerRef }
  );

  const { languageId } = useParams();
  const { modalContent, closeModal, gate } = useAchievementGate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [flashcards, setFlashcards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(!!languageId);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [masteredIds, setMasteredIds] = useState(() => {
    const saved = localStorage.getItem(`mastered_${languageId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [learningIds, setLearningIds] = useState(() => {
    const saved = localStorage.getItem(`learning_${languageId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Language picker list (only needed when no languageId is selected yet)
  React.useEffect(() => {
    if (languageId) return;
    setLanguagesLoading(true);
    flashcardService.getFlashcardLanguages()
      .then((langs) => setAvailableLanguages(langs))
      .catch(() => setAvailableLanguages([]))
      .finally(() => setLanguagesLoading(false));
  }, [languageId]);

  // Fetch flashcards for the selected language, and load persisted mastered/learning state
  React.useEffect(() => {
    if (!languageId) {
      setFlashcards([]);
      return;
    }
    let ignore = false;
    setCardsLoading(true);
    setCurrentIndex(0);
    setIsFlipped(false);

    flashcardService.getFlashcards(languageId)
      .then((cards) => {
        if (ignore) return;
        const displayLanguage = languageId.charAt(0).toUpperCase() + languageId.slice(1);
        setFlashcards(cards.map((c) => ({ ...c, id: c._id, language: displayLanguage })));
      })
      .catch(() => { if (!ignore) setFlashcards([]); })
      .finally(() => { if (!ignore) setCardsLoading(false); });

    const mastered = localStorage.getItem(`mastered_${languageId}`);
    const learning = localStorage.getItem(`learning_${languageId}`);
    setMasteredIds(mastered ? JSON.parse(mastered) : []);
    setLearningIds(learning ? JSON.parse(learning) : []);

    return () => { ignore = true; };
  }, [languageId]);

  // Persist mastered/learning status
  React.useEffect(() => {
    if (languageId) {
      localStorage.setItem(`mastered_${languageId}`, JSON.stringify(masteredIds));
    }
  }, [masteredIds, languageId]);

  React.useEffect(() => {
    if (languageId) {
      localStorage.setItem(`learning_${languageId}`, JSON.stringify(learningIds));
    }
  }, [learningIds, languageId]);

  // Streak logic - update last active date
  React.useEffect(() => {
    if (languageId) {
      const today = new Date().toISOString().split('T')[0];
      const lastActive = localStorage.getItem('last_active_date');
      const currentStreak = parseInt(localStorage.getItem('learning_streak') || '0');

      if (lastActive !== today) {
        if (lastActive) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastActive === yesterdayStr) {
            localStorage.setItem('learning_streak', (currentStreak + 1).toString());
          } else {
            localStorage.setItem('learning_streak', '1');
          }
        } else {
          localStorage.setItem('learning_streak', '1');
        }
        localStorage.setItem('last_active_date', today);
        // Trigger a custom event to notify Navbar of streak change
        window.dispatchEvent(new Event('streakUpdated'));
      }
    }
  }, [languageId]);

  React.useEffect(() => {
    return () => {
      if (SPEECH_SUPPORTED) window.speechSynthesis.cancel();
    };
  }, []);

  // Deck complete: every card in the current deck has been marked either
  // mastered or learning. Checked here (not inline in the mark handlers)
  // since those only update the *previous* card's state before advancing.
  React.useEffect(() => {
    if (!languageId || flashcards.length === 0) return;
    if (masteredIds.length + learningIds.length === flashcards.length) {
      gate(
        { title: 'Deck complete!', message: 'Sign up to save your streak and points.' },
        () => flashcardService.completeDeck(languageId)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masteredIds, learningIds, flashcards.length, languageId]);

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (SPEECH_SUPPORTED) window.speechSynthesis.cancel();
    setDirection(1);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 50);
  };

  const handlePrev = () => {
    if (SPEECH_SUPPORTED) window.speechSynthesis.cancel();
    setDirection(-1);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 50);
  };

  const markAsMastered = () => {
    const cardId = flashcards[currentIndex].id;
    if (!masteredIds.includes(cardId)) {
      setMasteredIds(prev => [...prev, cardId]);
      setLearningIds(prev => prev.filter(id => id !== cardId));
    }
    handleNext();
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!SPEECH_SUPPORTED) return;
    const utterance = new SpeechSynthesisUtterance(flashcards[currentIndex].word);
    utterance.lang = SPEECH_LANG_CODES[languageId] || 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const markAsLearning = () => {
    const cardId = flashcards[currentIndex].id;
    if (!learningIds.includes(cardId)) {
      setLearningIds(prev => [...prev, cardId]);
      setMasteredIds(prev => prev.filter(id => id !== cardId));
    }
    handleNext();
  };

  if (!languageId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LanguageNavbar />
        <main className="flex-grow pt-32 pb-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Choose a Language for Flashcards
            </h1>
            <p className="text-gray-500">Pick any language below to start learning vocabulary with flashcards.</p>
            <div className="inline-flex items-center gap-1.5 mt-3 mb-12 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">
              <Info size={12} />
              Every word includes an IPA (International Phonetic Alphabet) pronunciation guide, the same standard used in dictionaries worldwide.
            </div>

            {languagesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              </div>
            ) : availableLanguages.length === 0 ? (
              <p className="text-gray-500">No flashcard decks are available yet. Check back soon!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {availableLanguages.map(({ languageId: lang, count }) => (
                  <Link
                    key={lang}
                    to={`/language-club/flashcards/${lang}`}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] hover:border-red-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 group"
                  >
                    <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      <FlagIcon languageId={lang} className="w-10 h-10 mx-auto rounded-full" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 block">
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">{count} card{count === 1 ? '' : 's'}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
        <LanguageFooter />
      </div>
    );
  }

  if (cardsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LanguageNavbar />
        <main className="flex-grow pt-24 pb-12 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        </main>
        <LanguageFooter />
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LanguageNavbar />
        <main className="flex-grow pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No flashcards found for this language.</h2>
            <Link to="/language-club/explore" className="text-red-600 font-bold hover:underline">Explore Languages</Link>
          </div>
        </main>
        <LanguageFooter />
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Seo
        title={languageId ? `${languageId[0].toUpperCase()}${languageId.slice(1)} Flashcards - Just Go Study Language Club` : 'Flashcards - Just Go Study Language Club'}
        description={languageId ? `Practice ${languageId} vocabulary with free, spaced-repetition flashcards from Just Go Study's Language Club.` : "Pick a language and practice vocabulary with free, spaced-repetition flashcards from Just Go Study's Language Club."}
      />
      <LanguageNavbar />

      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div ref={headerRef} className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-red-600 mb-6">
              <BookOpen size={32} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {languageId ? `${languageId.charAt(0).toUpperCase() + languageId.slice(1)} Vocabulary Flashcards` : 'Vocabulary Flashcards'}
            </h1>
            <p className="text-gray-500">Learn new words and memorize them with interactive flashcards.</p>
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">
              <Info size={12} />
              Pronunciation is shown in IPA (International Phonetic Alphabet), the same standard used in dictionaries worldwide.
            </div>
          </div>

          {/* Stats & Progress */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] border border-gray-100">
              <div className="flex flex-col">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Progress</div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-gray-900">{currentIndex + 1} / {flashcards.length}</div>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-gray-100 hidden sm:block" />

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-0.5">Mastered</div>
                  <div className="text-sm font-bold text-gray-900">{masteredIds.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-0.5">Learning</div>
                  <div className="text-sm font-bold text-gray-900">{learningIds.length}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleShuffle}
              className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
            >
              <RefreshCw size={16} />
              Shuffle Deck
            </button>
          </div>

          {/* Flashcard Container */}
          <div className="relative h-[400px] sm:h-[450px] perspective-1000 mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard.id}
                initial={{ opacity: 0, x: direction * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -50 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="w-full h-full cursor-pointer relative preserve-3d"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Status Badge */}
                {masteredIds.includes(currentCard.id) && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-bold shadow-lg shadow-green-500/30">
                    <CheckCircle2 size={12} />
                    MASTERED
                  </div>
                )}
                {learningIds.includes(currentCard.id) && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-bold shadow-lg shadow-red-500/30">
                    <XCircle size={12} />
                    LEARNING
                  </div>
                )}

                {/* Front Side */}
                <motion.div
                  className={`absolute inset-0 w-full h-full bg-white rounded-[32px] shadow-2xl border-2 border-gray-100 p-8 flex flex-col items-center justify-center backface-hidden transition-all duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <span className="absolute top-8 left-8 text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">
                    {currentCard.language} • {currentCard.category}
                  </span>
                  <div className="text-center">
                    <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
                      {currentCard.word}
                    </h2>
                    <p className="text-gray-500 font-mono text-lg">{currentCard.pronunciation}</p>
                    <span
                      title="International Phonetic Alphabet, the global standard for showing pronunciation in dictionaries"
                      className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-gray-500/70 uppercase tracking-wider cursor-help"
                    >
                      <Info size={10} /> IPA Pronunciation
                    </span>
                  </div>
                  <div className="absolute bottom-8 flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <RefreshCw size={14} className="animate-spin-slow" />
                    Click to flip
                  </div>
                  {SPEECH_SUPPORTED && (
                    <button
                      type="button"
                      onClick={handleSpeak}
                      title="Listen to pronunciation"
                      aria-label="Listen to pronunciation"
                      className={`absolute top-8 right-8 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center transition-colors ${isSpeaking ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-red-500'}`}
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </motion.div>

                {/* Back Side */}
                <motion.div
                  className={`absolute inset-0 w-full h-full bg-gradient-to-br from-red-600 to-red-500 rounded-[32px] shadow-2xl p-8 flex flex-col items-center justify-center backface-hidden transition-all duration-500 ${isFlipped ? '' : 'rotate-y-180'}`}
                  style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                >
                  <div className="text-center text-white">
                    <span className="text-red-100 text-xs font-bold uppercase tracking-widest mb-2 block">Translation</span>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-8">
                      {currentCard.translation}
                    </h2>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-sm">
                      <span className="text-red-100 text-xs font-bold uppercase tracking-widest mb-2 block">Example Usage</span>
                      <p className="text-lg italic leading-relaxed">&quot;{currentCard.example}&quot;</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_-6px_rgba(14,16,23,0.1)] flex items-center justify-center text-gray-600 hover:text-red-600 hover:shadow-lg hover:shadow-red-500/10 transition-all"
              >
                <ArrowLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_-6px_rgba(14,16,23,0.1)] flex items-center justify-center text-gray-600 hover:text-red-600 hover:shadow-lg hover:shadow-red-500/10 transition-all"
              >
                <ArrowRight size={24} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={markAsLearning}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${learningIds.includes(currentCard.id) ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
              >
                <XCircle size={20} />
                Still Learning
              </button>
              <button
                onClick={markAsMastered}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${masteredIds.includes(currentCard.id) ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                <CheckCircle2 size={20} />
                Mastered
              </button>
            </div>
          </div>

        </div>
      </main>

      <LanguageFooter />
      <SignupPromptModal
        isOpen={!!modalContent}
        onClose={closeModal}
        {...modalContent}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default LanguageFlashcards;
