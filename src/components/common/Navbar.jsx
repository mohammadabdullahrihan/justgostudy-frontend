import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  PlaneTakeoff,
  Trophy,
  Info,
  Building2,
  Mail,
  CalendarCheck,
  BookOpen,
  Languages,
  GraduationCap,
  Landmark,
  ChevronDown,
  Gauge,
  FilePen,
  Star,
  Calculator,
  MapPin,
  LogOut,
  Globe,
  User,
  Menu,
  X,
  ArrowUpRight,
  Wrench,
  Newspaper,
  Compass,
  Layers,
  CalendarDays,
  Award,
  Handshake,
} from 'lucide-react';

/* Meko-style signature CTA: a pill label paired with a small circular
   arrow button, both pointing at the same destination. */
const PillCta = ({ to, onClick, children }) => (
  <span className="flex items-center gap-1.5 shrink-0">
    {to ? (
      <Link
        to={to}
        className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-full transition-colors duration-150 whitespace-nowrap"
      >
        {children}
      </Link>
    ) : (
      <button
        type="button"
        onClick={onClick}
        className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-full transition-colors duration-150 whitespace-nowrap"
      >
        {children}
      </button>
    )}
    {to && (
      <Link
        to={to}
        aria-hidden="true"
        tabIndex={-1}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-ink-900 text-white hover:bg-ink-800 transition-colors duration-150 shrink-0"
      >
        <ArrowUpRight size={16} />
      </Link>
    )}
  </span>
);

/* Magnetic hover wrapper, pulls the element toward the cursor (GSAP quickTo) */
const MagneticLink = React.forwardRef(function MagneticLink(
  { as: Component = 'div', className, children, strength = 0.35, ...props },
  forwardedRef
) {
  const innerRef = useRef(null);
  const quickX = useRef(null);
  const quickY = useRef(null);

  const setRefs = useCallback(
    (node) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  useEffect(() => {
    if (!innerRef.current) return;
    quickX.current = gsap.quickTo(innerRef.current, 'x', { duration: 0.45, ease: 'power3.out' });
    quickY.current = gsap.quickTo(innerRef.current, 'y', { duration: 0.45, ease: 'power3.out' });
  }, []);

  const handleMouseMove = (e) => {
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    quickX.current?.(relX * strength);
    quickY.current?.(relY * strength);
  };

  const handleMouseLeave = () => {
    gsap.to(innerRef.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <Component
      ref={setRefs}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
});

const mobileListVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(null);

  const headerRef = useRef(null);

  const dropdownRef = useRef(null);
  const navDropdownRef = useRef(null);

  const dashboardPath =
    user?.role === 'student'
      ? '/student/dashboard'
      : user?.role === 'agent'
        ? '/agent/dashboard'
        : user?.role === 'university'
          ? '/university/dashboard'
          : user?.role === 'educator'
            ? '/educator/dashboard'
            : '/admin/dashboard';

  const navLinks = [
    { label: 'Home', to: '/', Icon: Home },
    {
      label: 'About',
      Icon: Info,
      dropdown: [
        { label: 'About Us', to: '/about-us', Icon: Building2 },
        { label: 'Events', to: '/events', Icon: CalendarDays },
        { label: 'Contact Us', to: '/contact', Icon: Mail },
        { label: 'Book Appointment', to: '/book-appointment', Icon: CalendarCheck },
        { label: 'News & Vlogs', to: '/student-resources', Icon: BookOpen },
      ],
    },
    { label: 'Our Services', to: '/our-services', Icon: Handshake },
    {
      label: 'Study Abroad',
      to: '/study-abroad',
      Icon: PlaneTakeoff,
      dropdown: [
        { label: 'Destinations', to: '/study-abroad/destinations', Icon: MapPin },
        { label: 'Courses', to: '/study-abroad/courses', Icon: GraduationCap },
        { label: 'Universities', to: '/study-abroad/universities', Icon: Landmark },
        { label: 'Scholarship', to: '/study-abroad/scholarships', Icon: Award },
        { label: 'Tools', to: '/study-abroad/tools', Icon: Wrench },
        { label: 'Blog', to: '/study-abroad/blog', Icon: Newspaper },
      ],
    },
    {
      label: 'Language Club',
      to: '/language-club',
      Icon: Languages,
      dropdown: [
        { label: 'Explore Languages', to: '/language-club/explore', Icon: Compass },
        { label: 'Leaderboard', to: '/language-club/leaderboard', Icon: Trophy },
        { label: 'Flashcards', to: '/language-club/flashcards', Icon: Layers },
      ],
    },
    { label: 'Our Success', to: '/our-success', Icon: Trophy },
  ];

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  /* ---------------- Scroll behavior: solid white bar, hide on scroll-down ---------------- */
  useEffect(() => {
    const scrolledState = { current: false };
    const hiddenState = { current: false };

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = window.scrollY;

        const isScrolled = y > 80;
        if (isScrolled !== scrolledState.current) {
          scrolledState.current = isScrolled;
          setScrolled(isScrolled);
        }

        const shouldHide = self.direction === 1 && y > 160;
        if (shouldHide !== hiddenState.current) {
          hiddenState.current = shouldHide;
          setHidden(shouldHide);
        }
      },
    });

    return () => st.kill();
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.to(headerRef.current, {
      boxShadow: scrolled ? '0px 8px 30px -8px rgba(14,16,23,0.12)' : '0px 1px 0px rgba(14,16,23,0.06)',
      duration: 0.45,
      ease: 'power2.out',
    });
  }, [scrolled]);

  useEffect(() => {
    if (!headerRef.current) return;
    // Slide + fade together; the driving ScrollTrigger is updated by Lenis's
    // raf loop, so this stays in sync with the smoothed scroll position.
    const isHidden = hidden && !mobileOpen;
    gsap.to(headerRef.current, {
      yPercent: isHidden ? -100 : 0,
      autoAlpha: isHidden ? 0 : 1,
      duration: 0.5,
      ease: 'power3.inOut',
      force3D: true,
    });
  }, [hidden, mobileOpen]);

  /* ---------------- Misc effects (unchanged behavior) ---------------- */
  useEffect(() => {
    setMobileOpen(false);
    setMobileDropdownOpen(null);
    setDropdownOpen(false);
    setNavDropdownOpen(null);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target)) {
        setNavDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 border-b border-ink-100 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-6">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img
                src="/logo.png"
                alt="JustGo Study"
                className="h-12 w-auto object-contain transition-opacity duration-200 hover:opacity-80"
              />
              <span className="font-bold text-lg tracking-tight text-ink-900">
                Just <span className="text-primary-600">Go Study</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav
              className="hidden lg:flex flex-1 items-center justify-center gap-1 relative"
              ref={navDropdownRef}
            >
              {navLinks.map((link) => {
                const { label, to, dropdown } = link;
                const isDropdown = !!dropdown;
                const isActiveLink = !isDropdown && isActive(to);
                const isDropdownActive = isDropdown && ((to && isActive(to)) || dropdown.some((item) => isActive(item.to)));

                if (isDropdown) {
                  return (
                    <div
                      key={label}
                      className="relative"
                      onMouseEnter={() => setNavDropdownOpen(label)}
                      onMouseLeave={() => setNavDropdownOpen(null)}
                    >
                      <MagneticLink
                        as={to ? Link : 'button'}
                        {...(to ? { to } : {})}
                        onClick={() => setNavDropdownOpen(navDropdownOpen === label ? null : label)}
                        onFocus={() => setNavDropdownOpen(label)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors duration-150 ${isDropdownActive
                          ? 'text-primary-700 bg-primary-50'
                          : 'text-ink-600 hover:text-primary-600'
                          }`}
                      >
                        {label}
                        <ChevronDown size={14} className={`transition-transform duration-200 ${navDropdownOpen === label ? 'rotate-180' : ''}`} />
                      </MagneticLink>
                      <AnimatePresence>
                        {navDropdownOpen === label && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-full left-0 z-50 mt-3 w-64 origin-top-left overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-primary-600 to-primary-800 p-2 shadow-theme-lg"
                          >
                            {dropdown.map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150 ${isActive(item.to)
                                  ? 'bg-white/10 text-white'
                                  : 'text-primary-200 hover:bg-white/10 hover:text-white'
                                  }`}
                              >
                                <item.Icon size={15} className="shrink-0 text-primary-300 transition-colors duration-150 group-hover:text-white" />
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <MagneticLink
                    key={to}
                    as={Link}
                    to={to}
                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors duration-150 ${isActiveLink ? 'text-primary-700 bg-primary-50' : 'text-ink-600 hover:text-primary-600'
                      }`}
                  >
                    {label}
                  </MagneticLink>
                );
              })}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-1.5 shrink-0">
              {user ? (
                <>
                  <PillCta to="/join-us">Join Us</PillCta>

                  <Link
                    to={dashboardPath}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 whitespace-nowrap ${location.pathname.startsWith('/student') ||
                      location.pathname.startsWith('/agent') ||
                      location.pathname.startsWith('/admin')
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-ink-600 hover:text-primary-600 hover:bg-primary-50/60'
                      }`}
                  >
                    Dashboard
                  </Link>

                  {/* Avatar Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((p) => !p)}
                      className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg border border-ink-100 hover:border-primary-200 hover:bg-primary-50/60 transition-colors duration-150 shrink-0"
                    >
                      <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <span className="text-xs font-medium text-ink-700 max-w-[60px] truncate">
                        {user.name?.split(' ')[0] || 'Account'}
                      </span>
                      <ChevronDown size={12} className={`text-ink-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-theme-lg border border-ink-100 py-1 overflow-hidden z-50"
                        >
                          <div className="px-4 py-2.5 border-b border-ink-100">
                            <p className="text-xs font-semibold text-ink-900 truncate">{user.name}</p>
                            <p className="text-xs text-primary-600 font-semibold truncate">{user.role === 'super_admin' ? 'Super Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                            <p className="text-[11px] text-ink-500 truncate">{user.email}</p>
                          </div>
                          <Link
                            to={dashboardPath}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50/60 hover:text-primary-700 transition-colors duration-150"
                          >
                            <Gauge size={14} className="shrink-0" />
                            Dashboard
                          </Link>
                          {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'developer') && (
                            <Link
                              to="/admin/resources"
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50/60 hover:text-primary-700 transition-colors duration-150"
                            >
                              <FilePen size={14} className="shrink-0" />
                              Manage Resources
                            </Link>
                          )}
                          {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'developer') && (
                            <Link
                              to="/admin/success"
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50/60 hover:text-primary-700 transition-colors duration-150"
                            >
                              <Trophy size={14} className="shrink-0" />
                              Manage Success
                            </Link>
                          )}
                          {user.role === 'student' && (
                            <Link
                              to="/student/profile"
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50/60 hover:text-primary-700 transition-colors duration-150"
                            >
                              <User size={14} className="shrink-0" />
                              My Profile
                            </Link>
                          )}
                          {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'developer') && (
                            <Link
                              to="/admin/profile"
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50/60 hover:text-primary-700 transition-colors duration-150"
                            >
                              <User size={14} className="shrink-0" />
                              My Profile
                            </Link>
                          )}
                          {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'developer') && (
                            <>
                              <div className="px-4 py-1.5 text-[10px] font-bold text-ink-500 uppercase tracking-widest bg-ink-50">
                                Study Abroad
                              </div>
                              <Link
                                to="/admin/country-guides"
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50/60 hover:text-primary-700 transition-colors duration-150"
                              >
                                <Globe size={14} className="shrink-0" />
                                Country Guides
                              </Link>
                              <Link
                                to="/admin/testimonials"
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50/60 hover:text-primary-700 transition-colors duration-150"
                              >
                                <Star size={14} className="shrink-0" />
                                Testimonials
                              </Link>
                              <Link
                                to="/admin/calculator-defaults"
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50/60 hover:text-primary-700 transition-colors duration-150"
                              >
                                <Calculator size={14} className="shrink-0" />
                                Calculator Defaults
                              </Link>
                              <Link
                                to="/admin/destinations"
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50/60 hover:text-primary-700 transition-colors duration-150"
                              >
                                <MapPin size={14} className="shrink-0" />
                                Destinations
                              </Link>
                            </>
                          )}
                          <div className="border-t border-ink-100 mt-1 pt-1">
                            <button
                              onClick={logout}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150"
                            >
                              <LogOut size={14} className="shrink-0" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/join-us"
                    className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 hover:border-primary-400 rounded-full transition-colors duration-150"
                  >
                    Join Us
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-primary-600 hover:bg-primary-50/60 rounded-full transition-colors duration-150"
                  >
                    Sign In
                  </Link>
                  <PillCta to="/register">Get Started</PillCta>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-ink-700 hover:bg-primary-50/60 transition-colors duration-150"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            data-lenis-prevent
            className="fixed inset-0 z-50 bg-white lg:hidden flex flex-col overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 sm:px-6 h-20 border-b border-ink-100 shrink-0">
              <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <img src="/logo.png" alt="JustGo Study" className="h-10 w-auto object-contain" />
                <span className="font-bold text-lg tracking-tight text-ink-900">
                  Just <span className="text-primary-600">Go Study</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-ink-700 hover:bg-primary-50/60 transition-colors duration-150"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <motion.nav
              variants={mobileListVariants}
              initial="hidden"
              animate="show"
              className="flex-1 px-4 sm:px-6 py-8 flex flex-col gap-1"
            >
              {navLinks.map((link) => {
                const { label, to, dropdown, Icon } = link;
                const isDropdown = !!dropdown;
                const isActiveLink = !isDropdown && isActive(to);
                const isDropdownActive = isDropdown && ((to && isActive(to)) || dropdown.some((item) => isActive(item.to)));
                const isMobileOpen = mobileDropdownOpen === label;

                if (isDropdown) {
                  return (
                    <motion.div key={label} variants={mobileItemVariants}>
                      <button
                        onClick={() => setMobileDropdownOpen(isMobileOpen ? null : label)}
                        className={`w-full flex items-center justify-between gap-3 py-3.5 text-2xl font-semibold transition-colors duration-150 ${isDropdownActive ? 'text-primary-700' : 'text-ink-900'
                          }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={20} className="text-ink-500" />
                          {label}
                        </span>
                        <ChevronDown size={20} className={`text-ink-500 transition-transform duration-200 ${isMobileOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isMobileOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden pl-9"
                          >
                            {dropdown.map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2.5 py-2.5 text-base font-medium transition-colors duration-150 ${isActive(item.to) ? 'text-primary-700' : 'text-ink-600'
                                  }`}
                              >
                                <item.Icon size={15} className="shrink-0" />
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }

                return (
                  <motion.div key={to} variants={mobileItemVariants}>
                    <Link
                      to={to}
                      className={`flex items-center gap-3 py-3.5 text-2xl font-semibold transition-colors duration-150 ${isActiveLink ? 'text-primary-700' : 'text-ink-900'
                        }`}
                    >
                      <Icon size={20} className="text-ink-500" />
                      {label}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Auth Section */}
            <motion.div
              variants={mobileItemVariants}
              initial="hidden"
              animate="show"
              className="px-4 sm:px-6 py-6 border-t border-ink-100 shrink-0"
            >
              {user ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 pb-4">
                    <div className="w-11 h-11 rounded-lg bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{user.name}</p>
                      <p className="text-xs text-primary-600 font-semibold truncate">{user.role === 'super_admin' ? 'Super Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                    </div>
                  </div>
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-2.5 py-2.5 text-sm font-medium text-ink-700"
                  >
                    <Gauge size={16} className="text-ink-500" />
                    Dashboard
                  </Link>
                  {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'developer') && (
                    <Link to="/admin/profile" className="flex items-center gap-2.5 py-2.5 text-sm font-medium text-ink-700">
                      <User size={16} className="text-ink-500" />
                      My Profile
                    </Link>
                  )}
                  {user.role === 'student' && (
                    <Link to="/student/profile" className="flex items-center gap-2.5 py-2.5 text-sm font-medium text-ink-700">
                      <User size={16} className="text-ink-500" />
                      My Profile
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center gap-2.5 py-2.5 text-sm font-medium text-red-500 mt-1"
                  >
                    <LogOut size={16} className="shrink-0" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-5 py-3 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-full transition-colors duration-150"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/join-us"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-5 py-3 text-sm font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-full transition-colors duration-150"
                  >
                    Join Us
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-5 py-3 text-sm font-medium text-ink-600 hover:text-primary-600 rounded-full transition-colors duration-150"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
