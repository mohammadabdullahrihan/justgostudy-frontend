import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '../components/common/Seo';
import ScrollReveal from '../components/study/ScrollReveal';
import SubTabs from '../components/study/SubTabs';
import { services } from '../constants/ourServices';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

const tabItems = services.map((service, idx) => ({ id: String(idx), label: service.title }));

const OurServices = () => {
  const [activeId, setActiveId] = useState('0');
  const active = services[Number(activeId)];

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen bg-cream-50"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <Seo
          title="Our Services - Just Go Study"
          description="Explore the full range of services Just Go Study provides Bangladeshi students, from university shortlisting to visa counseling and pre-departure settlement."
        />

        <section className="relative overflow-hidden bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h1 className="font-outfit text-4xl font-bold text-ink-900 sm:text-5xl">
                  Our Services
                </h1>
                <span className="mx-auto mt-5 block h-1 w-20 rounded-full bg-accent-400" />
                <p className="mt-6 text-ink-500">
                  Pick a service below to see exactly how we help, from your first free consultation to the day you land.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={60}>
              <div className="flex justify-center">
                <SubTabs items={tabItems} activeId={activeId} onChange={setActiveId} layoutId="our-services-subtab-pill" />
              </div>
            </ScrollReveal>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-10 grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 p-8 shadow-theme-md sm:p-10 lg:grid-cols-2"
              >
                <div className="relative mx-auto flex h-56 w-56 items-center justify-center rounded-[28px] bg-white shadow-theme-sm sm:h-64 sm:w-64">
                  <img
                    src={active.image}
                    alt={active.title}
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-40 object-contain sm:h-48 sm:w-48"
                  />
                </div>

                <div>
                  <h2 className="font-outfit text-2xl font-bold leading-snug text-white sm:text-3xl">
                    {active.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-primary-200">{active.detail}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <ScrollReveal delay={100}>
              <div className="mt-14 text-center">
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-4 font-bold text-white transition-colors hover:bg-primary-700"
                >
                  Book a Free Consultation <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
};

export default OurServices;
