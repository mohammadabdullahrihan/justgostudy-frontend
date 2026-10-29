import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ArrowRight, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subscribeNewsletter, getDestinations } from '../services/studyService';
import { openNewsletterSuccessModal } from '../hooks/useNewsletterSuccessModal';
import { FacebookIcon, XIcon, LinkedinIcon, InstagramIcon } from './common/BrandIcons';
import { companyData } from '../constants/companyData';
import UniversityDisclaimer from './common/UniversityDisclaimer';

// Curated countries shown first, in this order; a handful of other active
// destinations are appended after these. Capped, not the full live list —
// with 60+ active destinations that column ran far taller than the rest of
// the footer and broke the layout, so anything past the cap is reachable via
// the "View All Destinations" link instead of being listed inline.
const STATIC_DESTINATIONS = ['UK', 'Canada', 'USA', 'Australia', 'Germany', 'New Zealand'];
const MAX_FOOTER_DESTINATIONS = 12;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const footerSections = [
  {
    title: 'Quick Resources',
    links: [
      { name: 'Find Courses', href: '/study-abroad/courses' },
      { name: 'University Search', href: '/study-abroad/universities' },
      { name: 'Cost Calculator', href: '/study-abroad/cost-calculator' },
      { name: 'Success Stories', href: '/our-success' },
      { name: 'Scholarships', href: '/study-abroad/blog?category=scholarships' },
      { name: 'Student Visa Guide', href: '/study-abroad/blog?category=visa' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about-us' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Book Appointment', href: '/book-appointment' },
      { name: 'Partner with Us', href: '/join-us' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  },
];

const socialLinks = [
  { Icon: FacebookIcon, href: companyData.socialLinks.facebook, label: 'Facebook' },
  { Icon: XIcon, href: companyData.socialLinks.twitter, label: 'Twitter' },
  { Icon: LinkedinIcon, href: companyData.socialLinks.linkedin, label: 'LinkedIn' },
  { Icon: InstagramIcon, href: companyData.socialLinks.instagram, label: 'Instagram' },
];

const StudyAbroadFooter = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [extraDestinations, setExtraDestinations] = useState([]);

  // Footer used to hardcode just 6 destinations, fetch the full live list so
  // every active country shows up here, not only the curated 6.
  useEffect(() => {
    let ignore = false;
    getDestinations({ activeOnly: 'true' })
      .then((res) => {
        if (ignore) return;
        const list = Array.isArray(res) ? res : (res?.data || []);
        const seen = new Set(STATIC_DESTINATIONS.map((c) => c.toLowerCase()));
        const extra = list
          .map((d) => d?.country?.trim())
          .filter((country) => {
            if (!country) return false;
            const key = country.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a, b) => a.localeCompare(b));
        setExtraDestinations(extra);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  const remainingSlots = Math.max(0, MAX_FOOTER_DESTINATIONS - STATIC_DESTINATIONS.length);
  const destinationCountries = [...STATIC_DESTINATIONS, ...extraDestinations.slice(0, remainingSlots)];
  const hasMoreDestinations = extraDestinations.length > remainingSlots;

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
    <footer className="relative z-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 pt-4 sm:pt-6">
      <motion.div
        className="w-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 overflow-hidden"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        {/* Newsletter */}
        <motion.div
          variants={itemVariants}
          className="border-b border-white/10 px-6 sm:px-10 py-14 text-center"
        >
          <h2 className="mx-auto max-w-2xl text-2xl sm:text-3xl font-bold text-white font-outfit">
            Stay Ahead in Your <span className="text-primary-300">Global Education</span> Journey
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-primary-200">
            Get weekly updates on new scholarships, university deadlines, and visa tips.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="mx-auto mt-6 flex w-full max-w-sm items-center gap-1.5 rounded-full border border-white/15 focus-within:border-white/40 focus-within:ring-2 focus-within:ring-white/20 transition-colors pl-5 pr-1.5 py-1.5"
          >
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-primary-200 focus:outline-none focus:shadow-none"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors duration-150 hover:bg-primary-50 disabled:opacity-60"
            >
              {subscribing ? '...' : 'Subscribe'}
            </button>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
              <ArrowUpRight size={16} className="text-ink-900" />
            </span>
          </form>
        </motion.div>

        {/* Brand + Link Columns */}
        <div className="grid grid-cols-2 gap-12 border-b border-white/10 px-6 sm:px-10 py-14 md:grid-cols-4 lg:grid-cols-5">
          <motion.div variants={itemVariants} className="col-span-2 space-y-6">
            <Link to="/" className="flex w-fit items-center gap-2">
              <img src="/logo.jpg" alt="Just Go Study" className="h-10 w-auto object-contain" loading="lazy" />
              <span className="font-outfit text-lg font-bold text-white">
                Just <span className="text-primary-300">Go Study</span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-primary-200">
              Helping students reach their international education goals with clear guidance and a
              straightforward application process.
            </p>

            <div className="flex items-center gap-2">
              {socialLinks.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white transition-colors duration-200 hover:bg-primary-300"
                >
                  <Icon className="h-4 w-4 text-ink-900" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="col-span-1">
            <h4 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-300"></span>
              Study Destinations
            </h4>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-3">
              {destinationCountries.map((country) => (
                <li key={country}>
                  <Link
                    to={`/study-abroad/destination/${encodeURIComponent(country)}`}
                    className="group flex items-start text-sm text-primary-200 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight className="mr-1 mt-0.5 h-3 w-3 shrink-0 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    <span>{country}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {hasMoreDestinations && (
              <Link
                to="/study-abroad/destinations"
                className="group mt-3.5 flex items-center text-sm font-semibold text-primary-300 transition-colors duration-200 hover:text-white"
              >
                View All Destinations
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </motion.div>

          {footerSections.map((section) => (
            <motion.div key={section.title} variants={itemVariants} className="col-span-1">
              <h4 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-300"></span>
                {section.title}
              </h4>
              <ul className="space-y-3.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="group flex items-center text-sm text-primary-200 transition-colors duration-200 hover:text-white"
                    >
                      <ArrowRight className="mr-1.5 h-3.5 w-3.5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact Strip */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-6 border-b border-white/10 px-6 sm:px-10 py-8 md:grid-cols-3"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-300">Email Us</p>
              <p className="font-semibold text-white">{companyData.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-300">Call Anytime</p>
              <p className="font-semibold text-white">{companyData.phoneIntl}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-300">Visit Office</p>
              <p className="text-sm font-semibold leading-relaxed text-white">{companyData.address}</p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center gap-6 px-6 sm:px-10 py-6 md:flex-row"
        >
          <p className="text-sm text-primary-200">
            &copy; {currentYear} Just Go Study. All rights reserved.
            <span className="mx-2 hidden text-primary-400 md:inline">|</span>
            <span className="block md:inline">Built for Future Leaders</span>
          </p>
        </motion.div>
      </motion.div>
    </footer>
    </>
  );
};

export default StudyAbroadFooter;
