import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subscribeNewsletter } from '../../services/studyService';
import { openNewsletterSuccessModal } from '../../hooks/useNewsletterSuccessModal';
import { companyData } from '../../constants/companyData';
import UniversityDisclaimer from './UniversityDisclaimer';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Dark, rounded floating footer card, Meko reference layout:
 * Contact | CTA + newsletter | Social  →  Logo + links + legal  →  Copyright
 */
const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const footerLinks = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about-us' },
    { label: 'Courses', to: '/study-abroad/courses' },
    { label: 'Universities', to: '/study-abroad/universities' },
    { label: 'Blog', to: '/study-abroad/blog' },
    { label: 'Our Success', to: '/our-success' },
    { label: 'Join Us', to: '/join-us' },
    { label: 'Contact Us', to: '/contact' },
  ];

  const socialLinks = [
    {
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
      label: 'Facebook',
      href: companyData.socialLinks.facebook,
    },
    {
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
      label: 'Twitter / X',
      href: companyData.socialLinks.twitter,
    },
    {
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
      label: 'LinkedIn',
      href: companyData.socialLinks.linkedin,
    },
    {
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
      label: 'Instagram',
      href: companyData.socialLinks.instagram,
    },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribing(true);
    try {
      await subscribeNewsletter(email);
      openNewsletterSuccessModal();
      setEmail('');
    } catch (error) {
      if (error.message === 'Already subscribed') {
        openNewsletterSuccessModal('primary', 'already');
        setEmail('');
      } else {
        toast.error(error.message || 'Subscription failed');
      }
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
    <UniversityDisclaimer />
    <footer>
      <motion.div
        className="w-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 overflow-hidden"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
      >
        {/* Top: Contact | CTA + Newsletter | Social */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y divide-white/10 lg:divide-y-0 lg:divide-x">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-3 flex flex-col items-center justify-center text-center gap-2 px-8 py-10"
          >
            <span className="text-xs font-medium text-primary-200 uppercase tracking-wider">Contact Us</span>
            <a href={`tel:${companyData.phone}`} className="text-white font-medium hover:text-primary-300 transition-colors duration-150">
              {companyData.phone}
            </a>
            <a href={`mailto:${companyData.email}`} className="text-sm text-primary-200 hover:text-white transition-colors duration-150">
              {companyData.email}
            </a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="lg:col-span-6 flex flex-col items-center justify-center text-center gap-4 px-6 sm:px-10 py-10"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-outfit">
              Start Your Study Abroad Journey Today!
            </h3>
            <p className="text-sm text-primary-100 max-w-sm">
              Get a free consultation and take the first step toward the university you want.
            </p>
            <form onSubmit={handleSubscribe} className="w-full max-w-sm flex items-center gap-1.5 rounded-full border border-white/15 focus-within:border-white/40 focus-within:ring-2 focus-within:ring-white/20 transition-colors pl-5 pr-1.5 py-1.5 mt-1">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-primary-200 focus:outline-none focus:shadow-none"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="shrink-0 rounded-full bg-white text-ink-900 text-sm font-semibold px-5 py-2.5 hover:bg-primary-50 transition-colors duration-150 disabled:opacity-60"
              >
                {subscribing ? '...' : 'Subscribe'}
              </button>
              <span className="shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <ArrowUpRight size={16} className="text-ink-900" />
              </span>
            </form>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="lg:col-span-3 flex flex-col items-center justify-center text-center gap-3 px-8 py-10"
          >
            <span className="text-xs font-medium text-primary-200 uppercase tracking-wider">Social Media</span>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-full bg-white hover:bg-primary-300 flex items-center justify-center transition-colors duration-200"
                >
                  <span className="text-ink-900">{icon}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Middle: Logo | Links | Address */}
        <motion.div
          variants={itemVariants}
          className="border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 px-6 sm:px-10 py-6"
        >
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="JustGo Study" className="h-8 w-auto object-contain" loading="lazy" />
            <span className="text-white font-semibold font-outfit">
              Just <span className="text-primary-300">Go Study</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.map(({ label, to }) => (
              <Link key={to} to={to} className="text-sm text-primary-200 hover:text-white transition-colors duration-150">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-start gap-2 shrink-0 max-w-xs text-center md:text-right">
            <MapPin size={15} className="text-primary-300 shrink-0 mt-0.5 hidden md:block" />
            <span className="text-sm text-primary-200">{companyData.address}</span>
          </div>
        </motion.div>

        {/* Bottom: Copyright + legal links */}
        <motion.div
          variants={itemVariants}
          className="border-t border-white/10 px-6 sm:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left"
        >
          <p className="text-sm text-primary-200">
            &copy; {new Date().getFullYear()} Just Go Study. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy-policy" className="text-sm text-primary-200 hover:text-white transition-colors duration-150">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-primary-200 hover:text-white transition-colors duration-150">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
    </>
  );
};

export default Footer;
