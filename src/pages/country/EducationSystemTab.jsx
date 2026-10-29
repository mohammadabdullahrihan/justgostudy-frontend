import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Info, School } from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import SubTabs from '../../components/study/SubTabs';
import { openConsultationModal } from '../../hooks/useConsultationModal';
import { PANEL_TONES } from '../../utils/tabTones';
import sanitizeHtml from '../../utils/sanitizeHtml';

const EducationSystemTab = ({ guide, country }) => {
  const system = guide?.educationSystem;
  const institutionTypes = guide?.institutionTypes || [];

  const sections = [
    { id: 'overview', label: 'Overview', type: 'text', content: system?.overview },
    { id: 'levels', label: 'Levels of Study', type: 'text', content: system?.levelsOfStudy },
    { id: 'recognition', label: 'Degree Recognition', type: 'text', content: system?.degreeRecognition },
    { id: 'institutions', label: 'Types of Institutions', type: 'grid', content: institutionTypes.length > 0 ? institutionTypes : null },
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
          <BookOpen className="w-6 h-6 text-primary-500" />
          The Education System in {country}
        </h2>
      </ScrollReveal>

      {sections.length > 0 ? (
        <div>
          <SubTabs items={sections} activeId={active.id} onChange={setActiveSub} layoutId="education-subtab-pill" />

          {active.type === 'text' ? (
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
          ) : (
            /* Full-width stacked sections, not a 2-column grid — these entries
               run to several paragraphs each (e.g. Universities vs. Grandes
               Écoles), and a narrow card column squeezed them into an
               unreadable wall of text with no clear boundary between types. */
            <div className="space-y-6">
              {institutionTypes.map((inst, idx) => {
                const tone = PANEL_TONES[idx % PANEL_TONES.length];
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.05, ease: 'easeOut' }}
                  >
                    <div className={`${tone.bg} rounded-[1.75rem] border ${tone.border} shadow-sm hover:shadow-md transition-all overflow-hidden`}>
                      <div className="flex items-center gap-4 px-6 sm:px-8 py-5 border-b border-black/[0.04]">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone.iconBg}`}>
                          <School className={`w-5 h-5 ${tone.iconText}`} />
                        </div>
                        <h4 className="font-bold text-lg text-ink-900">{inst.name}</h4>
                      </div>
                      <div className="px-6 sm:px-8 py-6">
                        {inst.description && (
                          <p
                            className="guide-content-links text-black font-medium text-[17px] leading-relaxed whitespace-pre-line mb-6"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(inst.description) }}
                          />
                        )}
                        {(inst.bestFor || inst.admissions) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {inst.bestFor && (
                              <div className="bg-white/70 rounded-xl p-4 border border-black/[0.04]">
                                <p className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${tone.iconText}`}>Best For</p>
                                <p className="text-black font-medium text-[17px] leading-relaxed">{inst.bestFor}</p>
                              </div>
                            )}
                            {inst.admissions && (
                              <div className="bg-white/70 rounded-xl p-4 border border-black/[0.04]">
                                <p className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${tone.iconText}`}>Admissions</p>
                                <p
                                  className="guide-content-links text-black font-medium text-[17px] leading-relaxed whitespace-pre-line"
                                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(inst.admissions) }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <ScrollReveal delay={100}>
          <div className="bg-cream-50 p-12 rounded-[3rem] text-center border-2 border-dashed border-cream-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Info className="w-10 h-10 text-ink-500" />
            </div>
            <h3 className="text-xl font-bold text-ink-900 mb-2">Education System Details Coming Soon</h3>
            <p className="text-black font-medium text-[17px] max-w-sm mx-auto">
              We&apos;re documenting how the education system works in {country}. Please check back later or contact our consultants.
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

export default EducationSystemTab;
