import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Seo from '../../components/common/Seo';
import HeroSection from './HeroSection';
import RolesSection from './RolesSection';
import BenefitsSection from './BenefitsSection';
import ProcessSection from './ProcessSection';
import ComparisonSection from './ComparisonSection';
import FAQSection from './FAQSection';
import NewsletterSection from './NewsletterSection';

const JoinUs = () => {
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);

  // Floating button scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingBtn(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white font-sans text-ink-900 selection:bg-primary-100 selection:text-primary-600">
      <Seo
        title="Career & Partnership Opportunities - Just Go Study"
        description="Join Just Go Study as an agent, university partner, or team member. Explore roles and partnership opportunities in Bangladesh's growing study abroad industry."
      />
      <HeroSection />
      <RolesSection />
      <BenefitsSection />
      <ProcessSection />
      <ComparisonSection />
      <FAQSection />
      <NewsletterSection />

      {/* Floating Quick Join Button */}
      <AnimatePresence>
        {showFloatingBtn && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <a
              href="#roles"
              className="group flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-white shadow-theme-lg transition-all duration-300 hover:scale-105 hover:bg-primary-500"
            >
              <span className="text-sm font-bold">Quick Join</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JoinUs;
