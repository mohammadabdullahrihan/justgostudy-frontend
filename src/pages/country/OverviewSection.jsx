import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, CheckCircle2, DollarSign, Award, Briefcase, GraduationCap,
  Info, Star, Heart, Users, ChevronDown, ShieldCheck, Zap, ArrowRight,
} from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import ScholarshipPromoBanner from '../../components/study/ScholarshipPromoBanner';
import { UniversityGrid } from './cards';
import { PANEL_TONES } from '../../utils/tabTones';
import sanitizeHtml from '../../utils/sanitizeHtml';

const OVERVIEW_UNIVERSITY_PREVIEW = 4;

const OverviewSection = ({ guide, country, universities, expandedSection, setExpandedSection, onNavigateTab }) => (
  <>
    <ScholarshipPromoBanner country={country} />

    {/* Why Study Here, only when we actually have real reasons for this
        country, never a header floating over an empty grid. */}
    {guide?.whyStudyHere?.length > 0 && (
      <section>
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-6 flex items-center gap-3">
            <Star className="w-6 h-6 text-accent-400 fill-current" />
            Why Study in {country}?
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guide.whyStudyHere.map((item, idx) => {
            const IconComponent = { GraduationCap, Briefcase, Users, Heart, Award, ShieldCheck, Zap, Star }[item.icon] || GraduationCap;
            const tone = PANEL_TONES[idx % PANEL_TONES.length];
            return (
              <ScrollReveal key={idx} delay={idx * 100}>
                <div className={`${tone.bg} p-8 rounded-2xl border ${tone.border} shadow-sm hover:shadow-xl ${tone.hoverBorder} transition-all group h-full`}>
                  <div className={`w-12 h-12 ${tone.iconBg} ${tone.iconBgHover} rounded-xl flex items-center justify-center mb-4 transition-colors`}>
                    <IconComponent className={`w-6 h-6 ${tone.iconText}`} />
                  </div>
                  <h4 className="font-bold text-ink-900 mb-3 text-lg">{item.title}</h4>
                  <p
                    className="guide-content-links text-black font-medium text-[17px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc) }}
                  />
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
    )}

    {guide?.requirements && (
      <section>
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-5 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2.5 text-secondary-500" /> Admission Requirements
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <div className="pl-5 border-l-4 border-secondary-200">
            <p
              className="guide-content-links text-black font-medium text-[17px] leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.requirements) }}
            />
          </div>
        </ScrollReveal>
      </section>
    )}

    {(guide?.costing || guide?.living) && (
      <section>
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-5 flex items-center">
            <DollarSign className="w-5 h-5 mr-2.5 text-primary-500" /> Cost of Education & Living
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-5">
            {guide?.costing && (
              <div className="pl-5 border-l-4 border-primary-200">
                <h3 className="font-bold text-ink-900 mb-2">Tuition Fees</h3>
                <p
                  className="guide-content-links text-black font-medium text-[17px] leading-relaxed line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.costing) }}
                />
              </div>
            )}
            {guide?.living && (
              <div className="pl-5 border-l-4 border-cream-300">
                <h3 className="font-bold text-ink-900 mb-2">Yearly Living</h3>
                <p
                  className="guide-content-links text-black font-medium text-[17px] leading-relaxed line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.living) }}
                />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab?.('cost')}
            className="inline-flex items-center gap-1.5 text-primary-600 font-bold text-sm hover:text-primary-700 transition-colors"
          >
            See full cost breakdown <ArrowRight className="w-4 h-4" />
          </button>
        </ScrollReveal>
      </section>
    )}

    {guide?.scholarships && (
      <section>
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-5 flex items-center">
            <Award className="w-5 h-5 mr-2.5 text-accent-500" /> Scholarship Opportunities
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <div className="pl-5 border-l-4 border-accent-200">
            <p
              className="guide-content-links text-black font-medium text-[17px] leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.scholarships) }}
            />
          </div>
        </ScrollReveal>
      </section>
    )}

    {(guide?.studyWork || guide?.workAfterGraduation) && (
      <section>
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-5 flex items-center">
            <Briefcase className="w-5 h-5 mr-2.5 text-primary-500" /> Working in {country}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <div className={`grid grid-cols-1 ${guide?.workAfterGraduation ? 'md:grid-cols-2' : ''} gap-8`}>
            {guide?.studyWork && (
              <div className="pl-5 border-l-4 border-primary-200">
                <h3 className="font-bold text-ink-900 mb-2">During Study</h3>
                <p
                  className="guide-content-links text-black font-medium text-[17px] leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.studyWork) }}
                />
              </div>
            )}
            {guide?.workAfterGraduation && (
              <div className="pl-5 border-l-4 border-secondary-200">
                <h3 className="font-bold text-ink-900 mb-2">After Graduation</h3>
                <p
                  className="guide-content-links text-black font-medium text-[17px] leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.workAfterGraduation) }}
                />
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>
    )}

    {guide?.opportunities && (
      <section>
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-5 flex items-center">
            <Globe className="w-5 h-5 mr-2.5 text-primary-600" /> Future Opportunities
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <div className="pl-5 border-l-4 border-primary-200">
            <p
              className="guide-content-links text-black font-medium text-[17px] leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.opportunities) }}
            />
          </div>
        </ScrollReveal>
      </section>
    )}

    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-5 flex items-center">
          <GraduationCap className="w-5 h-5 mr-2.5 text-primary-600" /> Top Universities in {country}
        </h2>
      </ScrollReveal>
      <UniversityGrid universities={universities.slice(0, OVERVIEW_UNIVERSITY_PREVIEW)} />
      {universities.length > OVERVIEW_UNIVERSITY_PREVIEW && (
        <button
          type="button"
          onClick={() => onNavigateTab?.('universities')}
          className="mt-6 inline-flex items-center gap-1.5 text-primary-600 font-bold text-sm hover:text-primary-700 transition-colors"
        >
          See All <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </section>

    {/* FAQ Accordion */}
    {guide?.faqs?.length > 0 && (
      <section className="mt-16">
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
            <Info className="w-6 h-6 text-primary-600" />
            Frequently Asked Questions
          </h2>
        </ScrollReveal>
        <div className="space-y-4">
          {guide.faqs.map((faq, idx) => {
            const tone = PANEL_TONES[idx % PANEL_TONES.length];
            return (
            <ScrollReveal key={idx} delay={idx * 100}>
              <div className={`bg-white rounded-2xl border-l-4 ${tone.border.replace('border-', 'border-l-')} border-y border-r border-cream-100 overflow-hidden shadow-sm hover:shadow-md transition-all`}>
                <button
                  onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center gap-4 text-left"
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone.iconBg} text-xs font-bold ${tone.iconText}`}>Q</span>
                  <span className="flex-1 font-bold text-ink-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-ink-500 transition-transform ${expandedSection === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedSection === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="guide-content-links px-6 pb-6 text-black font-medium text-[17px] leading-relaxed border-t border-cream-50 pt-4"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer) }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
            );
          })}
        </div>
      </section>
    )}
  </>
);

export default OverviewSection;
