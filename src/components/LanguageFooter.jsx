import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { toast } from 'react-hot-toast';
import FlagIcon from './FlagIcon';
import { FacebookIcon, XIcon, InstagramIcon, YoutubeIcon } from './common/BrandIcons';
import { subscribeNewsletter } from '../services/studyService';
import { openNewsletterSuccessModal } from '../hooks/useNewsletterSuccessModal';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LanguageFooter = () => {
  const footerRef = useRef(null);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribing(true);
    try {
      await subscribeNewsletter(email);
      openNewsletterSuccessModal('red');
      setEmail('');
    } catch (error) {
      if (error.message === 'Already subscribed') {
        openNewsletterSuccessModal('red', 'already');
        setEmail('');
      } else {
        toast.error(error.message || 'Subscription failed');
      }
    } finally {
      setSubscribing(false);
    }
  };

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const cols = gsap.utils.toArray(footerRef.current.querySelectorAll('[data-footer-col]'));
      gsap.set(cols, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: footerRef.current,
        start: 'top 90%',
        once: true,
        onEnter: () =>
          gsap.to(cols, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            onComplete: () => gsap.set(cols, { clearProps: 'transform' }),
          }),
      });
    },
    { scope: footerRef }
  );

  return (
    <footer ref={footerRef} className="bg-gradient-to-b from-white via-red-50/10 to-red-100/15 border-t-2 border-red-100 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute -bottom-10 left-10 w-64 h-64 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-10 w-64 h-64 bg-red-100/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative">
        {/* Top Newsletter Row */}
        <div className="border-b border-red-100 pb-10 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md text-center md:text-left">
            <h3 className="font-bold text-lg text-gray-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Join our newsletter
            </h3>
            <p className="text-sm text-gray-500">
              Get weekly language challenges, key vocabulary lists and travel hacks sent to your inbox.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-sm items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-white border border-gray-200 focus:border-red-400 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-4 focus:ring-red-500/10 shadow-sm transition-all duration-200"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-200 shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {subscribing ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div data-footer-col className="lg:col-span-1">
            <Link to="/language-club" className="inline-flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="Just Go Study"
                className="h-16 w-auto object-contain"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-xl text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Just Go <span className="text-red-600">Study</span>
                </span>
                <span className="font-bold text-lg text-gray-600" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Language <span className="text-red-600">Club</span>
                  <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-1 mb-0.5 animate-pulse"></span>
                </span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Master languages for free with interactive lessons, expert-curated content, and a supportive global community.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { Icon: FacebookIcon, href: '#' },
                { Icon: XIcon, href: '#' },
                { Icon: InstagramIcon, href: '#' },
                { Icon: YoutubeIcon, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white border border-gray-100 hover:border-red-500/20 hover:bg-red-600 flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 hover:scale-110 hover:-rotate-6 shadow-[0_2px_10px_-4px_rgba(14,16,23,0.08)] hover:shadow-lg hover:shadow-red-500/25"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div data-footer-col>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', to: '/language-club' },
                { label: 'Explore Languages', to: '/language-club/explore' },
                { label: 'Exam Prep (IELTS, PTE, TOEFL, GRE/GMAT)', to: '/language-club/exam-prep' },
                { label: 'About Us', to: '/about-us' },
                { label: 'Contact', to: '/contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-red-300 rounded-full"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Languages */}
          <div data-footer-col>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Popular Languages</h4>
            <ul className="space-y-3">
              {[
                { id: 'english', name: 'English', to: '/language-club/learn/english' },
                { id: 'spanish', name: 'Spanish', to: '/language-club/learn/spanish' },
                { id: 'french', name: 'French', to: '/language-club/learn/french' },
                { id: 'japanese', name: 'Japanese', to: '/language-club/learn/japanese' },
                { id: 'korean', name: 'Korean', to: '/language-club/learn/korean' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <FlagIcon languageId={link.id} className="w-4 h-4 rounded-full shadow-sm shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Back to Main */}
          <div data-footer-col>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Just Go Study</h4>
            <ul className="space-y-3">
              {[
                { label: 'Main Website', to: '/' },
                { label: 'Courses', to: '/study-abroad/courses' },
                { label: 'Universities', to: '/study-abroad/universities' },
                { label: 'Student Resources', to: '/student-resources' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-red-300 rounded-full"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()}Language Club by Just Go Study. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-xs text-gray-500 hover:text-red-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-red-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LanguageFooter;
