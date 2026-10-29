import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Ghost } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary-100 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-100 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Animated 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative inline-block"
        >
          <motion.h1
            animate={{
              y: [0, -10, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="font-outfit text-[150px] sm:text-[200px] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 select-none"
          >
            404
          </motion.h1>

          {/* Floating Ghost Icon */}
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              x: [0, 5, -5, 0],
              y: [0, -5, 5, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-8 text-primary-400 opacity-20"
          >
            <Ghost size={120} />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 space-y-4"
        >
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-gray-900">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl shadow-sm border border-gray-200 hover:border-primary-200 hover:bg-primary-50 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl shadow-lg shadow-primary-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
        </motion.div>

        {/* Search Suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 pt-8 border-t border-gray-100"
        >
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2 flex-wrap">
            <Search className="w-4 h-4" />
            Looking for something else? Try searching our <Link to="/study-abroad/courses" className="text-primary-600 hover:underline font-medium">courses</Link> or <Link to="/language-club" className="text-primary-600 hover:underline font-medium">language club</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
