import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Languages, Info, ShieldCheck } from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import SubTabs from '../../components/study/SubTabs';
import { openConsultationModal } from '../../hooks/useConsultationModal';
import LanguageClubPromo from '../../components/home/LanguageClubPromo';
import sanitizeHtml from '../../utils/sanitizeHtml';

const LanguageLearningTab = ({ guide, country }) => {
  const lang = guide?.languageLearning;

  const sections = [
    { id: 'overview', label: 'Overview', content: lang?.overview },
    { id: 'courses', label: 'Finding a Course', content: lang?.findingCourses },
    { id: 'certifications', label: 'Certifications', content: lang?.certifications },
  ].filter((s) => s.content);

  const [activeSub, setActiveSub] = useState(sections[0]?.id);

  useEffect(() => {
    setActiveSub(sections[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const active = sections.find((s) => s.id === activeSub) || sections[0];
  const hasContent = sections.length > 0 || lang?.visaForLanguageStudy;

  return (
    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
          <Languages className="w-6 h-6 text-primary-500" />
          Language Learning in {country}
        </h2>
      </ScrollReveal>

      <div className="mb-8 max-w-md">
        <LanguageClubPromo variant="sm" />
      </div>

      {hasContent ? (
        <div className="space-y-8">
          {sections.length > 0 && (
            <div>
              <SubTabs items={sections} activeId={active.id} onChange={setActiveSub} layoutId="language-subtab-pill" />
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

          {lang?.visaForLanguageStudy && (
            <div className="flex items-start gap-4 p-6 bg-accent-50 rounded-2xl border border-accent-100">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wide font-bold text-accent-600 mb-1">Visa for Language Study</span>
                <p
                  className="guide-content-links text-accent-900 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(lang.visaForLanguageStudy) }}
                />
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
            <h3 className="text-xl font-bold text-ink-900 mb-2">Language Learning Info Coming Soon</h3>
            <p className="text-black font-medium text-[17px] max-w-sm mx-auto">
              We&apos;re gathering language-course details for {country}. Please check back later or contact our consultants.
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

export default LanguageLearningTab;
