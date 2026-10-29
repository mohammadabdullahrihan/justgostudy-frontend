import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Info } from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import SubTabs from '../../components/study/SubTabs';
import { openConsultationModal } from '../../hooks/useConsultationModal';
import sanitizeHtml from '../../utils/sanitizeHtml';

const LivingTab = ({ guide, country }) => {
  const living = guide?.livingGuide;

  const sections = [
    { id: 'before', label: 'Before You Go', content: living?.beforeDeparture },
    { id: 'arrival', label: 'Arrival', content: living?.arrival },
    { id: 'accommodation', label: 'Accommodation', content: living?.accommodation },
    { id: 'money', label: 'Money Matters', content: living?.moneyMatters },
    { id: 'safety', label: 'Safety', content: living?.safety },
    { id: 'communications', label: 'Communications', content: living?.communications },
    { id: 'recreation', label: 'Recreation', content: living?.recreation },
    { id: 'adjusting', label: 'Adjusting to Life', content: living?.adjusting },
  ].filter((s) => s.content);

  const [activeSub, setActiveSub] = useState(sections[0]?.id);

  useEffect(() => {
    setActiveSub(sections[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const active = sections.find((s) => s.id === activeSub) || sections[0];

  return (
    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
          <Home className="w-6 h-6 text-accent-500" />
          Living in {country}
        </h2>
      </ScrollReveal>

      {sections.length > 0 ? (
        <div>
          <SubTabs items={sections} activeId={active.id} onChange={setActiveSub} layoutId="living-subtab-pill" />
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <p
              className="guide-content-links text-black font-medium text-[17px] leading-relaxed whitespace-pre-line max-w-3xl"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(active.content) }}
            />
          </motion.div>
        </div>
      ) : (
        <ScrollReveal delay={100}>
          <div className="bg-cream-50 p-12 rounded-[3rem] text-center border-2 border-dashed border-cream-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Info className="w-10 h-10 text-ink-500" />
            </div>
            <h3 className="text-xl font-bold text-ink-900 mb-2">Living Guide Coming Soon</h3>
            <p className="text-black font-medium text-[17px] max-w-sm mx-auto">
              We&apos;re putting together a practical living guide for {country}. Please check back later or contact our consultants.
            </p>
            <button
              onClick={openConsultationModal}
              className="mt-8 bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
            >
              Ask a Consultant
            </button>
          </div>
        </ScrollReveal>
      )}
    </section>
  );
};

export default LivingTab;
