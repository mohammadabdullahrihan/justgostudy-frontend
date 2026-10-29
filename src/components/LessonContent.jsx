import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import sanitizeHtml from '../utils/sanitizeHtml';

const LessonContent = ({ lesson, onNext, onPrev, hasNext, hasPrev, onComplete }) => {
  const isQuiz = lesson.id === 'quiz';
  const [interactiveMode, setInteractiveMode] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [shakeId, setShakeId] = useState(null);
  const [isMarkedComplete, setIsMarkedComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Reset mark when lesson changes
  useEffect(() => {
    setIsMarkedComplete(false);
    setShowCelebration(false);
  }, [lesson.id]);

  const handleMarkComplete = () => {
    if (!isMarkedComplete) {
      setIsMarkedComplete(true);
      setShowCelebration(true);
      if (onComplete) onComplete();

      // Hide celebration after 3 seconds
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const handleNextWithComplete = () => {
    if (!isQuiz && !isMarkedComplete) {
      setIsMarkedComplete(true);
      if (onComplete) onComplete();
    }
    onNext();
  };

  // Parse questions from lesson content
  const quizData = useMemo(() => {
    if (!isQuiz) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(lesson.content, 'text/html');
    const quizDivs = doc.querySelectorAll('.space-y-6 > div, div[class*="bg-red"]');
    const parsedQuestions = [];

    quizDivs.forEach((div) => {
      const qTextEl = div.querySelector('p:first-child');
      const aTextEl = div.querySelector('strong');

      if (qTextEl && aTextEl) {
        let questionText = qTextEl.textContent.trim();
        questionText = questionText.replace(/^Q\d+:\s*/i, '');
        const correctAnswer = aTextEl.textContent.trim();

        parsedQuestions.push({
          question: questionText,
          correctAnswer: correctAnswer,
        });
      }
    });

    // Regex fallback
    if (parsedQuestions.length === 0) {
      const regex = /<p class="font-semibold text-gray-900 mb-2">Q\d+:\s*(.*?)<\/p>\s*<p class="text-gray-600">Answer:\s*<strong>(.*?)<\/strong><\/p>/gi;
      let match;
      while ((match = regex.exec(lesson.content)) !== null) {
        parsedQuestions.push({
          question: match[1].trim(),
          correctAnswer: match[2].trim(),
        });
      }
    }

    const allCorrectAnswers = parsedQuestions.map(q => q.correctAnswer);

    // Build structured questions with options
    const finalQuestions = parsedQuestions.map((q) => {
      const optionsSet = new Set([q.correctAnswer]);

      // Add other correct answers as distractors
      allCorrectAnswers.forEach(ans => {
        if (ans !== q.correctAnswer) optionsSet.add(ans);
      });

      // Distractors bank
      const distractors = [
        'Good morning',
        'Hola',
        '안녕하세요',
        'Thank you',
        'Subject + Object + Verb',
        'Subject + Verb + Object',
        'None of the above',
        'We go'
      ];

      let dIdx = 0;
      while (optionsSet.size < Math.min(3, parsedQuestions.length + 1) && dIdx < distractors.length) {
        if (distractors[dIdx] !== q.correctAnswer) optionsSet.add(distractors[dIdx]);
        dIdx++;
      }

      // Shuffle options deterministically for this lesson/question
      const options = Array.from(optionsSet).sort((a, b) => a.localeCompare(b));

      return {
        ...q,
        options,
      };
    });

    const h2 = doc.querySelector('h2');
    const p = doc.querySelector('p');

    return {
      title: h2 ? h2.textContent.trim() : lesson.title,
      description: p ? p.textContent.trim() : 'Review what you have learned!',
      questions: finalQuestions,
    };
  }, [lesson, isQuiz]);

  // Reset quiz state when active lesson changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  }, [lesson]);

  // Call onComplete when the quiz finishes
  useEffect(() => {
    if (quizFinished && onComplete) {
      onComplete();
    }
  }, [quizFinished, onComplete]);

  const handleOptionSelect = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      // Trigger shake animation
      setShakeId(currentQuestionIndex);
      setTimeout(() => setShakeId(null), 400);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50/50 overflow-x-hidden">
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-10 right-10 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">Great Job!</p>
              <p className="text-emerald-100 text-sm">Progress updated successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={lesson.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
      >
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>{isQuiz ? 'Quiz' : 'Lesson'}</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {lesson.title}
          </h1>
          <div className="w-16 h-1 bg-red-600 rounded-full"></div>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 lg:p-10 mb-8">
          {isQuiz && quizData && quizData.questions.length > 0 ? (
            <div>
              {/* Shake and custom keyframes styles */}
              <style>{`
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  20%, 60% { transform: translateX(-6px); }
                  40%, 80% { transform: translateX(6px); }
                }
                .animate-shake {
                  animation: shake 0.4s ease-in-out;
                }
              `}</style>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-2">
                <p className="text-sm font-semibold text-gray-500">
                  {quizData.description}
                </p>
                <button
                  onClick={() => setInteractiveMode(!interactiveMode)}
                  className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors select-none shrink-0 align-self-start"
                >
                  {interactiveMode ? 'View Answer Key' : 'Take Interactive Quiz'}
                </button>
              </div>

              {interactiveMode ? (
                /* Interactive Quiz View */
                <div>
                  {quizFinished ? (
                    /* Score Screen */
                    <div className="text-center py-8">
                      <div className="w-24 h-24 rounded-full border-4 border-red-500 bg-red-50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
                        <span className="text-3xl font-extrabold text-red-600" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {score}/{quizData.questions.length}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Quiz Completed!
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                        {score === quizData.questions.length
                          ? 'Perfect score! You are mastering this language! 🌟'
                          : score >= quizData.questions.length / 2
                            ? 'Great job! Keep practicing to get a perfect score! 👍'
                            : 'Keep studying and try again! You can do it! 💪'}
                      </p>
                      <button
                        onClick={handleRestartQuiz}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all duration-200"
                      >
                        Restart Quiz
                      </button>
                    </div>
                  ) : (
                    /* Active Question Screen */
                    <div className={shakeId === currentQuestionIndex ? 'animate-shake' : ''}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                          Question {currentQuestionIndex + 1} of {quizData.questions.length}
                        </span>
                        <span className="text-xs text-gray-500">Score: {score}</span>
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">
                        {quizData.questions[currentQuestionIndex].question}
                      </h4>

                      <div className="space-y-3 mb-8">
                        {quizData.questions[currentQuestionIndex].options.map((option, idx) => {
                          const isCurrentOption = selectedOption === option;
                          const isCorrectAns = option === quizData.questions[currentQuestionIndex].correctAnswer;

                          let btnStyle = 'bg-gray-50 text-gray-800 border-gray-100 hover:bg-red-50/50 hover:border-red-200 hover:text-red-600';

                          if (isAnswered) {
                            if (isCorrectAns) {
                              btnStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm shadow-emerald-500/5';
                            } else if (isCurrentOption) {
                              btnStyle = 'bg-rose-50 text-red-700 border-rose-300';
                            } else {
                              btnStyle = 'bg-gray-50/50 text-gray-500 border-gray-100 cursor-not-allowed opacity-60';
                            }
                          }

                          return (
                            <button
                              key={idx}
                              disabled={isAnswered}
                              onClick={() => handleOptionSelect(option)}
                              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-left font-medium text-sm transition-all duration-200 select-none ${btnStyle}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  isAnswered && isCorrectAns
                                    ? 'bg-emerald-600 text-white'
                                    : isAnswered && isCurrentOption
                                      ? 'bg-red-600 text-white'
                                      : 'bg-white text-gray-500 border border-gray-200'
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span>{option}</span>
                              </div>
                              {isAnswered && isCorrectAns && (
                                <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {isAnswered && isCurrentOption && !isCorrectAns && (
                                <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          {currentQuestionIndex === quizData.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Static Plain Text Answer Key View */
                <div
                  className="prose prose-gray max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-li:text-gray-700
                    prose-strong:text-gray-900
                    prose-ul:space-y-1"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
                />
              )}
            </div>
          ) : (
            /* Regular Lesson View */
            <div
              className="prose prose-gray max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-li:text-gray-700
                prose-strong:text-gray-900
                prose-ul:space-y-1"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
            />
          )}
        </div>

        {/* Illustration SVG (Only show on non-quiz regular lessons) */}
        {!isQuiz && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex items-center justify-center">
            <svg width="280" height="180" viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
              <rect x="20" y="30" width="100" height="120" rx="12" fill="#FEE2E2" />
              <rect x="35" y="50" width="70" height="8" rx="4" fill="#FECACA" />
              <rect x="35" y="66" width="55" height="8" rx="4" fill="#FECACA" />
              <rect x="35" y="82" width="60" height="8" rx="4" fill="#FECACA" />
              <rect x="35" y="98" width="45" height="8" rx="4" fill="#FECACA" />
              <rect x="35" y="114" width="50" height="8" rx="4" fill="#FECACA" />
              <circle cx="200" cy="70" r="40" fill="#FEE2E2" />
              <g transform="translate(182, 52) scale(1.5)" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </g>
              <rect x="160" y="120" width="80" height="32" rx="16" fill="#DC2626" />
              <text x="200" y="141" textAnchor="middle" fontSize="12" fill="white" fontWeight="600">Learn</text>
            </svg>
          </div>
        )}

        {/* Mark as Complete button for regular lessons */}
        {!isQuiz && (
          <div className="mb-6">
            {isMarkedComplete ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm w-full justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lesson Completed!
              </div>
            ) : (
              <button
                onClick={handleMarkComplete}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm w-full justify-center hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Complete
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              hasPrev
                ? 'bg-white border border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-600 hover:shadow-md hover:-translate-y-0.5'
                : 'bg-gray-50 border border-gray-100 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <button
            onClick={hasNext ? handleNextWithComplete : handleMarkComplete}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              hasNext || (!hasNext && !isMarkedComplete)
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
          >
            {hasNext ? (
              <>
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              <>
                {isMarkedComplete ? 'Course Completed' : 'Finish Course'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LessonContent;
