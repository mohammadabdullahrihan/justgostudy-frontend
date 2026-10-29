import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import FlagIcon from './FlagIcon';

const LessonSidebar = ({ language, lessons, activeLessonId, completedLessons = [], onSelectLesson, onRestart, isOpen, onClose }) => {
  const completedCount = completedLessons.length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        ></motion.div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-[85vw] max-w-[300px] bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ minHeight: '100vh' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Close lesson sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Language Info */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl flex items-center shrink-0">
              <FlagIcon languageId={language.languageId} className="w-10 h-10 rounded-full shadow-sm" />
            </span>
            <div>
              <h2 className="font-bold text-gray-900 text-xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {language.name}
              </h2>
              <p className="text-sm text-gray-500">{lessons.length} lessons</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Progress</span>
              <span className="text-sm font-bold text-red-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
              ></motion.div>
            </div>

            {/* Restart Button */}
            <button
              onClick={onRestart}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-100 text-gray-500 hover:text-red-600 rounded-xl text-sm font-bold transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restart Course
            </button>
          </div>
        </div>

        {/* Lessons List */}
        <nav data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1.5">
          {lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLessonId;
            const isCompleted = completedLessons.includes(lesson.id);

            return (
              <motion.button
                key={lesson.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelectLesson(lesson.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                    : isCompleted
                      ? 'bg-emerald-50 border border-emerald-100 text-emerald-800 hover:bg-emerald-100'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                {/* Number/Check */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-500'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Title + Done badge */}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium truncate block ${isActive ? 'text-white' : ''}`}>
                    {lesson.title}
                  </span>
                  {isCompleted && !isActive && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide"
                    >
                      ✓ Completed
                    </motion.span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* Back Link */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          {/* Achievement Mini-Card */}
          {progressPercent >= 100 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/20 text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Achievement</p>
                  <p className="text-sm font-bold leading-tight">Course Master!</p>
                </div>
              </div>
            </motion.div>
          )}

          <a
            href="/language-club/explore"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Explore</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default LessonSidebar;
