import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Info, ChevronDown } from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import SubTabs from '../../components/study/SubTabs';
import sanitizeHtml from '../../utils/sanitizeHtml';

// Above this length the raw text reliably overflows a collapsed preview on
// every screen size, so it's worth the extra "Read more" click.
const COLLAPSE_THRESHOLD = 600;

const AboutCountryTab = ({ guide, country }) => {
  const navigate = useNavigate();
  const about = guide?.aboutCountry;
  const sections = [
    { id: 'overview', label: 'Overview', content: about?.overview },
    { id: 'history', label: 'History & Government', content: about?.historyAndGovernment },
    { id: 'population', label: 'Population & Culture', content: about?.populationAndCulture },
    { id: 'geography', label: 'Geography & Climate', content: about?.geographyAndClimate },
  ].filter((s) => s.content);

  const [activeSub, setActiveSub] = useState(sections[0]?.id);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setActiveSub(sections[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  useEffect(() => {
    setIsExpanded(false);
  }, [activeSub]);

  const active = sections.find((s) => s.id === activeSub) || sections[0];
  const isLong = (active?.content?.length || 0) > COLLAPSE_THRESHOLD;

  return (
    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
          <Compass className="w-6 h-6 text-accent-500" />
          About {country}
        </h2>
      </ScrollReveal>

      {sections.length > 0 ? (
        <div>
          <SubTabs items={sections} activeId={active.id} onChange={setActiveSub} layoutId="about-subtab-pill" />
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
            <h3 className="text-xl font-bold text-ink-900 mb-2">Country Profile Coming Soon</h3>
            <p className="text-black font-medium text-[17px] max-w-sm mx-auto">
              We&apos;re putting together an in-depth profile of {country}. Please check back later or contact our consultants.
            </p>
            <button
              onClick={() => navigate('/contact')}
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

export default AboutCountryTab;
