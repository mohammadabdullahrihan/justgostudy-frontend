import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Flame, Home, Compass, Layers, Trophy, ArrowLeft, ChevronDown, Gauge, User, LogOut, GraduationCap } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const LanguageNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [streak, setStreak] = useState(() => localStorage.getItem('learning_streak') || '0');
  const dropdownRef = useRef(null);
  const flameRef = useRef(null);
  const headerRef = useRef(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    gsap.set(headerRef.current, { y: -24, opacity: 0 });
    gsap.to(headerRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 });
    gsap.to(flameRef.current, { scale: 1.2, rotation: 10, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    return undefined;
  }, []);

  useEffect(() => {
    const updateStreak = () => {
      setStreak(localStorage.getItem('learning_streak') || '0');
    };

    window.addEventListener('streakUpdated', updateStreak);
    return () => window.removeEventListener('streakUpdated', updateStreak);
  }, []);

  // Hierarchical back target: exam detail pages step up to the exam-prep
  // hub, the hub steps up to Language Club home, and only Language Club
  // home itself steps all the way out to the main site.
  const getBackTarget = () => {
    const p = location.pathname;
    if (p === '/language-club') return '/';
    if (p === '/language-club/exam-prep') return '/language-club';
    if (p.startsWith('/language-club/exam-prep/')) return '/language-club/exam-prep';
    return '/language-club';
  };
  const backTarget = getBackTarget();

  const dashboardPath =
    user?.role === 'student'
      ? '/student/dashboard'
      : user?.role === 'agent'
        ? '/agent/dashboard'
        : '/admin/dashboard';

  const navLinks = [
    { label: 'Home', to: '/language-club' },
    { label: 'Explore', to: '/language-club/explore' },
    { label: 'Exam Prep', to: '/language-club/exam-prep' },
    { label: 'Leaderboard', to: '/language-club/leaderboard' },
    { label: 'Flashcards', to: '/language-club/flashcards' },
  ];

  const bottomNavItems = [
    { label: 'Home', to: '/language-club', icon: Home },
    { label: 'Explore', to: '/language-club/explore', icon: Compass },
    { label: 'Exams', to: '/language-club/exam-prep', icon: GraduationCap },
    { label: 'Flashcards', to: '/language-club/flashcards', icon: Layers },
    { label: 'Leaderboard', to: '/language-club/leaderboard', icon: Trophy },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (to) => {
    if (to === '/language-club') return location.pathname === '/language-club';
    return location.pathname.startsWith(to);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <>
      {/* Desktop/Tablet Top Floating Navbar */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 py-2.5 hidden lg:block">
        <div
          className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-xl shadow-red-900/10 border border-red-200/80'
            : 'bg-white/85 backdrop-blur-lg shadow-md shadow-red-900/5 border border-red-100'
            }`}
        >
          <div className="flex items-center justify-between py-3 px-5 sm:px-7 gap-6">
            {/* Back & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(backTarget)}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all duration-200 shrink-0 text-sm font-medium"
                title={backTarget === '/' ? 'Go Back to Main Site' : 'Go Back'}
              >
                <ArrowLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-1" />
                Back
              </button>

              <Link to="/language-club" className="flex items-center gap-2.5 group shrink-0">
                <img
                  src="/logo.png"
                  alt="Just Go Study"
                  className="h-16 w-auto object-contain group-hover:scale-105 transition-all duration-300"
                />
                <span className="font-bold text-lg tracking-tight text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Language{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
                    Club
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Nav Links - Center Aligned */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-1.5">
              {navLinks.map((link) => {
                const isActiveLink = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 group ${isActiveLink
                      ? 'text-red-600 bg-red-50/80 shadow-inner shadow-red-500/5'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50/40'
                      }`}
                  >
                    {link.label}
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-600 rounded-full transition-all duration-300 origin-center ${
                      isActiveLink
                        ? 'scale-x-100 opacity-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70'
                    }`} />
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Daily Streak */}
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-xl border border-orange-100 cursor-default hover:scale-105 transition-transform duration-200"
                title="Daily Streak"
              >
                <div ref={flameRef} className="will-change-transform">
                  <Flame size={18} className="text-orange-500 fill-orange-500" />
                </div>
                <span className="text-sm font-bold text-orange-600">{streak}d</span>
              </div>

              {user ? (
                <>
                  <Link
                    to="/language-club/profile"
                    className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${location.pathname === '/language-club/profile'
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                  >
                    My Profile
                  </Link>

                  {/* Avatar Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((p) => !p)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-[90px] truncate">
                        {user.name?.split(' ')[0] || 'Account'}
                      </span>
                      <ChevronDown className={`w-2.5 h-2.5 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-100 py-1.5 overflow-hidden z-50">
                        <div className="px-4 py-2.5 border-b border-gray-50">
                          <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-red-600 font-semibold truncate">{user.role === 'super_admin' ? 'Super Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          to={dashboardPath}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                        >
                          <Gauge className="w-4 text-center text-xs text-gray-500" />
                          Dashboard
                        </Link>
                        <Link
                          to={
                            user.role === 'student' ? '/student/profile' :
                            user.role === 'agent' ? '/agent/profile' :
                            user.role === 'university' ? '/university/profile' :
                            '/admin/profile'
                          }
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                        >
                          <User className="w-4 text-center text-xs text-gray-500" />
                          My Profile
                        </Link>
                        <div className="border-t border-gray-50 mt-1 pt-1">
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150"
                          >
                            <LogOut className="w-4 text-center text-xs" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/language-club/explore"
                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Start Learning
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Bottom Floating Navigation */}
      <nav className="lg:hidden fixed bottom-4 left-3 right-3 z-50">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl shadow-gray-900/15 border border-red-100/80 px-3 py-2">
          <div className="flex items-center justify-around">
            {bottomNavItems.map((item) => {
              const isActiveLink = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center justify-center min-w-[46px] py-1.5 px-1 rounded-xl transition-all duration-200 ${isActiveLink ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-all duration-200 ${isActiveLink ? 'bg-red-50' : 'bg-transparent'
                    }`}>
                    <item.icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                </Link>
              );
            })}

            {/* Account/Login Button */}
            {user ? (
              <button
                onClick={() => setDropdownOpen((p) => !p)}
                className={`flex flex-col items-center justify-center min-w-[46px] py-1.5 px-1 rounded-xl transition-all duration-200 ${dropdownOpen ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                  }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-all duration-200 ${dropdownOpen ? 'bg-red-50' : 'bg-transparent'
                  }`}>
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-medium leading-tight">Account</span>
              </button>
            ) : (
              <Link
                to="/login"
                className={`flex flex-col items-center justify-center min-w-[46px] py-1.5 px-1 rounded-xl transition-all duration-200 ${isActive('/login') ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                  }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-all duration-200 ${isActive('/login') ? 'bg-red-50' : 'bg-transparent'
                  }`}>
                  <User className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[10px] font-medium leading-tight">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Account Dropup for Mobile */}
        {dropdownOpen && user && (
          <div className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-2xl shadow-2xl shadow-gray-900/15 border border-red-100 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3 bg-gradient-to-r from-red-50/50 to-white">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <div className="p-2">
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-orange-50 text-orange-600 mb-1">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Flame size={18} className="fill-orange-500" />
                </div>
                <span className="text-sm font-bold">{streak} Day Streak!</span>
              </div>
              <Link
                to={dashboardPath}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Gauge className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <Link
                to={
                  user.role === 'student' ? '/student/profile' :
                  user.role === 'agent' ? '/agent/profile' :
                  user.role === 'university' ? '/university/profile' :
                  '/admin/profile'
                }
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm font-medium">My Profile</span>
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-150 mt-1"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Backdrop for closing dropdowns/sheets */}
        {dropdownOpen && (
          <div
            className="fixed inset-0 z-[-1] bg-black/20 backdrop-blur-sm"
            onClick={() => setDropdownOpen(false)}
          ></div>
        )}
      </nav>
    </>
  );
};

export default LanguageNavbar;
