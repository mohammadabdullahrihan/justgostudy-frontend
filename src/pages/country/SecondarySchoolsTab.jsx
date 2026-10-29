import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { School, Info, ShieldCheck } from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import SubTabs from '../../components/study/SubTabs';
import { openConsultationModal } from '../../hooks/useConsultationModal';
import sanitizeHtml from '../../utils/sanitizeHtml';

const SecondarySchoolsTab = ({ guide, country }) => {
  const schools = guide?.secondarySchools;

  const sections = [
    { id: 'overview', label: 'Overview', content: schools?.overview },
    { id: 'calendar', label: 'Calendar & Style', content: schools?.schoolCalendarAndStyle },
    { id: 'types', label: 'School Types', content: schools?.schoolTypes },
    { id: 'exchange', label: 'Exchange & Summer', content: schools?.exchangeAndSummerPrograms },
    { id: 'transition', label: 'Transition to Higher Ed', content: schools?.transitionToHigherEd },
  ].filter((s) => s.content);

  const [activeSub, setActiveSub] = useState(sections[0]?.id);

  useEffect(() => {
    setActiveSub(sections[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const active = sections.find((s) => s.id === activeSub) || sections[0];
  const hasContent = sections.length > 0 || schools?.juniorVisaInfo;

  return (
    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
          <School className="w-6 h-6 text-accent-500" />
          Secondary Schools in {country}
        </h2>
      </ScrollReveal>

      {hasContent ? (
        <div className="space-y-8">
          {sections.length > 0 && (
            <div>
              <SubTabs items={sections} activeId={active.id} onChange={setActiveSub} layoutId="secondary-subtab-pill" />
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
          )}

          {schools?.juniorVisaInfo && (
            <div className="flex items-start gap-4 p-6 bg-secondary-50 rounded-2xl border border-secondary-100">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wide font-bold text-secondary-500 mb-1">Visas for Junior Students</span>
                <p className="text-secondary-900 leading-relaxed whitespace-pre-line">{schools.juniorVisaInfo}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <ScrollReveal delay={100}>
          <div className="bg-cream-50 p-12 rounded-[3rem] text-center border-2 border-dashed border-cream-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Info className="w-10 h-10 text-ink-500" />
            </div>
            <h3 className="text-xl font-bold text-ink-900 mb-2">Secondary School Info Coming Soon</h3>
            <p className="text-black font-medium text-[17px] max-w-sm mx-auto">
              We&apos;re gathering secondary school details for {country}. Please check back later or contact our consultants.
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

export default SecondarySchoolsTab;
