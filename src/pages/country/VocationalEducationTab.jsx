import { motion } from 'framer-motion';
import { Wrench, Info } from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import { openConsultationModal } from '../../hooks/useConsultationModal';
import { PANEL_TONES } from '../../utils/tabTones';
import sanitizeHtml from '../../utils/sanitizeHtml';

const VocationalEducationTab = ({ guide, country }) => {
  const overview = guide?.vocationalEducation?.overview;
  const programs = guide?.vocationalPrograms || [];
  const hasContent = overview || programs.length > 0;

  return (
    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
          <Wrench className="w-6 h-6 text-primary-500" />
          Vocational Education in {country}
        </h2>
      </ScrollReveal>

      {hasContent ? (
        <div className="space-y-8">
          {overview && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <p
                className="guide-content-links text-black font-medium text-[17px] leading-relaxed max-w-3xl"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(overview) }}
              />
            </motion.div>
          )}

          {programs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programs.map((program, idx) => {
                const tone = PANEL_TONES[idx % PANEL_TONES.length];
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + idx * 0.05, ease: 'easeOut' }}
                  >
                    <div className={`${tone.bg} p-6 rounded-2xl border ${tone.border} shadow-sm hover:shadow-xl transition-all h-full`}>
                      <div className={`w-10 h-10 ${tone.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                        <Wrench className={`w-5 h-5 ${tone.iconText}`} />
                      </div>
                      <h4 className="font-bold text-ink-900 mb-2">{program.name}</h4>
                      <p
                        className="guide-content-links text-black font-medium text-[17px] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(program.description) }}
                      />
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
            <h3 className="text-xl font-bold text-ink-900 mb-2">Vocational Education Info Coming Soon</h3>
            <p className="text-black font-medium text-[17px] max-w-sm mx-auto">
              We&apos;re gathering vocational and technical training details for {country}. Please check back later or contact our consultants.
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

export default VocationalEducationTab;
