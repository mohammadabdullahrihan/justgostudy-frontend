import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, ChevronDown, Building2 } from 'lucide-react';
import StudyAbroadFooter from '../components/StudyAbroadFooter';
import ConsultationModal from '../components/study/ConsultationModal';
import { useConsultationModalOpen, closeConsultationModal } from '../hooks/useConsultationModal';
import { getDestinations } from '../services/studyService';
import courseService from '../services/courseService';
import { getUniversities } from '../services/universityService';

// Nav items that open the full-width mega panel below the whole navbar
// (real data, fetched lazily the first time that item is hovered) instead of
// a small anchored dropdown. Tools has a small, fixed list, so it gets its
// own compact anchored dropdown instead (see the per-item render below).
const MEGA_ITEMS = ['Destinations', 'Courses', 'Universities'];

const MegaSectionHeader = ({ label }) => (
  <div className="mb-5 flex items-center gap-3">
    <span className="h-px flex-1 bg-secondary-400/50" />
    <h4 className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-white">{label}</h4>
    <span className="h-px flex-1 bg-secondary-400/50" />
  </div>
);

const megaSkeletonRows = Array.from({ length: 15 });

const DestinationsMegaContent = ({ list }) => (
  <div>
    <MegaSectionHeader label="All Destinations" />
    {list === null ? (
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        {megaSkeletonRows.map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-white/5" />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((country) => (
          <Link
            key={country}
            to={`/study-abroad/destination/${encodeURIComponent(country)}`}
            className="truncate text-[15px] font-medium text-primary-100 transition-colors duration-150 hover:text-secondary-300"
          >
            {country}
          </Link>
        ))}
      </div>
    )}
  </div>
);

const CoursesMegaContent = ({ list }) => (
  <div>
    <MegaSectionHeader label="Featured Courses" />
    {list === null ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-lg bg-white/5" />
        ))}
      </div>
    ) : list.length === 0 ? (
      <p className="text-sm text-primary-300">No courses available yet.</p>
    ) : (
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <Link key={c._id} to={`/study-abroad/course/${c._id}`} className="group block min-w-0">
            <span className="block truncate text-[15px] font-semibold text-white transition-colors duration-150 group-hover:text-secondary-300">
              {c.name}
            </span>
            <span className="block truncate text-xs text-primary-300">{c.universityId?.name || 'University'}</span>
          </Link>
        ))}
      </div>
    )}
    <Link
      to="/study-abroad/courses"
      className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-accent-300 hover:underline"
    >
      View All Courses
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

const UniversitiesMegaContent = ({ list }) => (
  <div>
    <MegaSectionHeader label="Top-Ranked Universities" />
    {list === null ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-white/5" />
        ))}
      </div>
    ) : list.length === 0 ? (
      <p className="text-sm text-primary-300">No universities available yet.</p>
    ) : (
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((uni) => (
          <Link key={uni._id} to={`/study-abroad/university/${uni._id}`} className="group flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
              {uni.logo ? (
                <img src={uni.logo} alt="" className="h-7 w-7 object-contain" />
              ) : (
                <Building2 className="h-4 w-4 text-ink-500" />
              )}
            </div>
            <div className="min-w-0">
              <span className="block truncate text-[15px] font-semibold text-white transition-colors duration-150 group-hover:text-secondary-300">
                {uni.name}
              </span>
              <span className="block truncate text-xs text-primary-300">{uni.country}</span>
            </div>
          </Link>
        ))}
      </div>
    )}
    <Link
      to="/study-abroad/universities"
      className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-accent-300 hover:underline"
    >
      View All Universities
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

const StudyAbroadLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [previewData, setPreviewData] = useState({ destinations: null, courses: null, universities: null });
  const location = useLocation();
  const isConsultationModalOpen = useConsultationModalOpen();
  const closeDropdownTimerRef = useRef(null);

  // The mega/anchored panels are absolutely positioned below the nav bar, so
  // there's a small gap (the mt-3 offset) that isn't part of the nav row's
  // own hoverable box. Moving the cursor straight down into the panel briefly
  // crosses that gap, which used to fire mouseleave and close the dropdown
  // before the cursor ever reached it. Delaying the close (and cancelling it
  // if the cursor re-enters in time, e.g. onto the panel itself) bridges that
  // gap without changing the visual layout.
  const cancelScheduledClose = () => {
    if (closeDropdownTimerRef.current) {
      clearTimeout(closeDropdownTimerRef.current);
      closeDropdownTimerRef.current = null;
    }
  };
  const scheduleDropdownClose = () => {
    cancelScheduledClose();
    closeDropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
      closeDropdownTimerRef.current = null;
    }, 200);
  };
  const openDropdown = (name) => {
    cancelScheduledClose();
    setActiveDropdown(name);
  };

  useEffect(() => () => cancelScheduledClose(), []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lazy-load each preview list the first time its nav item is hovered, then
  // cache it in state so re-hovering doesn't refetch for the rest of the visit.
  useEffect(() => {
    const type = { Destinations: 'destinations', Courses: 'courses', Universities: 'universities' }[activeDropdown];
    if (!type || previewData[type]) return;
    let cancelled = false;
    (async () => {
      try {
        if (type === 'destinations') {
          const res = await getDestinations({ activeOnly: 'true' });
          const list = (Array.isArray(res) ? res : res?.data || [])
            .map((d) => d?.country?.trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
          if (!cancelled) setPreviewData((prev) => ({ ...prev, destinations: list }));
        } else if (type === 'courses') {
          const res = await courseService.getCourses({ featured: 'true', limit: 9 });
          const list = Array.isArray(res?.courses) ? res.courses : [];
          if (!cancelled) setPreviewData((prev) => ({ ...prev, courses: list }));
        } else if (type === 'universities') {
          const res = await getUniversities({ select: 'name,country,logo,ranking' });
          // Already ranking-sorted by the API, so the first 9 are the top-ranked.
          const list = (Array.isArray(res) ? res : res?.data || []).slice(0, 9);
          if (!cancelled) setPreviewData((prev) => ({ ...prev, universities: list }));
        }
      } catch (error) {
        console.error('Failed to load Study Abroad nav preview:', error.message);
      }
    })();
    return () => { cancelled = true; };
  }, [activeDropdown, previewData]);

  // Hierarchical back target, mirroring LanguageNavbar's getBackTarget: a
  // detail/tool page steps up to its own listing/hub first, and only the
  // Study Abroad home itself steps all the way out to the main site. Used
  // instead of a flat "always go to /" button so deep pages (a tool, a
  // course, an apply form) return you to where you actually came from.
  const getBackTarget = (pathname) => {
    if (pathname === '/study-abroad') return '/';
    if (pathname.startsWith('/study-abroad/tools/')) return '/study-abroad/tools';
    if (pathname.startsWith('/study-abroad/course/')) return '/study-abroad/courses';
    if (pathname.startsWith('/study-abroad/university/')) return '/study-abroad/universities';
    if (pathname.startsWith('/study-abroad/destination/')) return '/study-abroad/destinations';
    if (pathname.startsWith('/study-abroad/blog/')) return '/study-abroad/blog';
    const applyMatch = pathname.match(/^\/study-abroad\/apply\/[^/]+\/([^/]+)$/);
    if (applyMatch) return `/study-abroad/course/${applyMatch[1]}`;
    return '/study-abroad';
  };
  const backTarget = getBackTarget(location.pathname);

  const navLinks = [
    { name: 'Home', href: '/study-abroad' },
    { name: 'Destinations', href: '/study-abroad/destinations', mega: true },
    { name: 'Universities', href: '/study-abroad/universities', mega: true },
    { name: 'Courses', href: '/study-abroad/courses', mega: true },
    { name: 'Scholarship', href: '/study-abroad/scholarships' },
    {
      name: 'Tools',
      href: '/study-abroad/tools',
      dropdown: [
        { name: 'Cost Calculator', href: '/study-abroad/cost-calculator' },
        { name: 'Which Country Fits You?', href: '/study-abroad/tools/country-match-quiz' },
        { name: 'IELTS Band Calculator', href: '/study-abroad/tools/ielts-band-calculator' },
        { name: 'Visa Tracker', href: '/study-abroad/tools/visa-tracker' },
        { name: 'ROI Estimator', href: '/study-abroad/tools/roi-estimator' },
        { name: 'Comparison Tool', href: '/study-abroad/tools/comparison' },
        { name: 'Course Comparison', href: '/study-abroad/tools/course-comparison' },
      ],
    },
    { name: 'Blog', href: '/study-abroad/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-poppins relative overflow-x-hidden">
      {/* Subtle Gradient Background - Optimized */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-50/50 via-white to-accent-50/30"></div>
      </div>

      {/* Navbar, floating pill header, brand colors */}
      <header className="sticky top-0 z-50 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <div
          className="max-w-7xl mx-auto relative"
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={scheduleDropdownClose}
        >
          <div
            className={`flex items-center justify-between h-16 gap-3 pl-3 pr-2 sm:pl-4 sm:pr-3 rounded-full bg-white border border-ink-100 transition-shadow duration-300 ${
              isScrolled ? 'shadow-theme-lg' : 'shadow-theme-sm'
            }`}
          >
            {/* Back, steps up one level (tool -> Tools, course -> Courses, ...), not always straight to Home */}
            <Link
              to={backTarget}
              title={backTarget === '/' ? 'Back to Home' : 'Back'}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-150 shrink-0"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>

            {/* Desktop Nav Links, flat, image-style spacing */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-2">
              {navLinks.map((link) => {
                const hasFlyout = !!(link.dropdown || link.mega);
                const isMega = MEGA_ITEMS.includes(link.name);
                const isActive = hasFlyout
                  ? location.pathname.startsWith(link.href)
                  : location.pathname === link.href;

                return (
                  <div
                    key={link.name}
                    className={hasFlyout ? 'relative' : undefined}
                    onMouseEnter={hasFlyout ? () => openDropdown(link.name) : undefined}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-150 ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-ink-600 hover:text-primary-600'
                      }`}
                    >
                      {link.name}
                      {hasFlyout && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            activeDropdown === link.name ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </Link>

                    {/* Compact anchored dropdown, sized to its own content
                        (unlike the shared full-width mega panel), for
                        smaller flyouts such as Tools. */}
                    {link.dropdown && !isMega && (
                      <AnimatePresence>
                        {activeDropdown === link.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute left-0 top-full z-50 mt-3 w-64 origin-top-left rounded-2xl border border-white/10 bg-gradient-to-br from-primary-600 to-primary-800 p-2 shadow-theme-lg"
                          >
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${
                                  location.pathname === item.href
                                    ? 'bg-white/10 text-white'
                                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <Link
                to="/book-appointment"
                className="px-5 py-2.5 text-sm font-semibold text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-full transition-colors duration-150 whitespace-nowrap"
              >
                Book Appointment
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-accent-500 hover:bg-accent-600 rounded-full transition-colors duration-150 whitespace-nowrap"
              >
                Apply Now
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-ink-700 hover:bg-ink-50 transition-colors duration-150 shrink-0"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Full-width mega panel, spans the whole navbar (not just the hovered item) */}
          <AnimatePresence>
            {activeDropdown && MEGA_ITEMS.includes(activeDropdown) && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.99 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                data-lenis-prevent
                className="absolute left-0 right-0 top-full z-50 mt-3 max-h-[75vh] origin-top overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-br from-primary-600 to-primary-800 p-8 shadow-theme-lg lg:p-10"
              >
                {activeDropdown === 'Destinations' && <DestinationsMegaContent list={previewData.destinations} />}
                {activeDropdown === 'Courses' && <CoursesMegaContent list={previewData.courses} />}
                {activeDropdown === 'Universities' && <UniversitiesMegaContent list={previewData.universities} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            data-lenis-prevent
            className="fixed inset-0 z-40 bg-white lg:hidden flex flex-col overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 sm:px-6 h-20 border-b border-ink-100 shrink-0">
              <Link
                to={backTarget}
                title={backTarget === '/' ? 'Back to Home' : 'Back'}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-150"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full text-ink-700 hover:bg-ink-50 transition-colors duration-150"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 sm:px-6 py-8 flex flex-col gap-1">
              {navLinks.map((link) => {
                if (link.dropdown) {
                  return (
                    <div key={link.name}>
                      <button
                        onClick={() =>
                          setActiveDropdown(activeDropdown === link.name ? null : link.name)
                        }
                        className={`w-full flex items-center justify-between py-3.5 text-xl font-semibold transition-colors duration-150 ${
                          location.pathname.startsWith(link.href) ? 'text-primary-700' : 'text-ink-900'
                        }`}
                      >
                        {link.name}
                        <ChevronDown
                          className={`w-5 h-5 text-ink-500 transition-transform duration-200 ${
                            activeDropdown === link.name ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {activeDropdown === link.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden pl-4"
                          >
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block py-2.5 text-base font-medium transition-colors duration-150 ${
                                  location.pathname === item.href ? 'text-primary-700' : 'text-ink-600'
                                }`}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-3.5 text-xl font-semibold transition-colors duration-150 ${
                      location.pathname === link.href ? 'text-primary-700' : 'text-ink-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 sm:px-6 py-6 border-t border-ink-100 shrink-0 space-y-2">
              <Link
                to="/book-appointment"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center block px-5 py-3 text-sm font-semibold text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-full transition-colors duration-150"
              >
                Book Appointment
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center block px-5 py-3 text-sm font-semibold text-white bg-accent-500 hover:bg-accent-600 rounded-full transition-colors duration-150"
              >
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <StudyAbroadFooter />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={closeConsultationModal}
      />
    </div>
  );
};

export default StudyAbroadLayout;
