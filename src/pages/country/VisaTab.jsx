import { CheckCircle2, Circle, ShieldCheck, Wallet, FileCheck2, Plane, Users } from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import VisaTrackerPromoBanner from '../../components/study/VisaTrackerPromoBanner';
import { PANEL_TONES } from '../../utils/tabTones';
import sanitizeHtml from '../../utils/sanitizeHtml';

const VisaTab = ({ guide, country }) => {
  const checklist = guide?.visaChecklist || [];
  const visaTypes = guide?.visaTypes || [];

  return (
    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-secondary-500" />
          Visa Requirements{country ? ` for ${country}` : ''}
        </h2>
      </ScrollReveal>

      <VisaTrackerPromoBanner />

      {guide?.visaOverview && (
        <ScrollReveal delay={25}>
          <div className="mb-8 bg-gradient-to-br from-white via-white to-secondary-50/50 rounded-[2rem] p-8 border border-cream-100 shadow-sm">
            <p
              className="guide-content-links text-black font-medium text-[17px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.visaOverview) }}
            />
          </div>
        </ScrollReveal>
      )}

      {guide?.whoNeedsVisa && (
        <ScrollReveal delay={40}>
          <div className="mb-8 flex items-start gap-4 p-6 bg-primary-50 rounded-2xl border border-primary-100">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide font-bold text-primary-500 mb-1">Who Needs a Visa</span>
              <p
                className="guide-content-links text-primary-900 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.whoNeedsVisa) }}
              />
            </div>
          </div>
        </ScrollReveal>
      )}

      {visaTypes.length > 0 && (
        <ScrollReveal delay={50}>
          <div className="mb-10">
            <h3 className="text-lg font-bold text-ink-900 mb-5 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-primary-500" /> Visa Types
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visaTypes.map((visa, idx) => {
                const tone = PANEL_TONES[idx % PANEL_TONES.length];
                return (
                  <div key={idx} className={`${tone.bg} p-6 rounded-2xl border ${tone.border} shadow-sm`}>
                    <h4 className="font-bold text-ink-900 mb-2">{visa.name}</h4>
                    {visa.description && (
                      <p
                        className="guide-content-links text-black font-medium text-[17px] mb-3"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(visa.description) }}
                      />
                    )}
                    {visa.eligibility && (
                      <p className="guide-content-links text-black font-medium text-[17px]">
                        <span className={`font-bold uppercase tracking-wide ${tone.iconText}`}>Who needs it: </span>
                        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(visa.eligibility) }} />
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      )}

      {checklist.length ? (
        <ScrollReveal delay={100}>
          <div className="bg-gradient-to-br from-white via-white to-secondary-50/50 rounded-[2rem] p-8 border border-cream-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklist.map((req, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${req.required ? 'bg-secondary-50/60 border-secondary-100' : 'bg-cream-50 border-cream-100'
                    }`}
                >
                  {req.required ? (
                    <CheckCircle2 className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-ink-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-ink-800 font-medium">{req.item}</span>
                    {!req.required && (
                      <span className="block text-xs text-ink-500 uppercase tracking-wide font-bold mt-0.5">Optional</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal delay={100}>
          <div className="bg-cream-50 p-10 rounded-[2rem] text-center border-2 border-dashed border-cream-200">
            <p className="text-black font-medium text-[17px]">Detailed visa checklist for this destination is being finalized, talk to a consultant for the latest requirements.</p>
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal delay={150}>
        <div className="mt-6 flex items-center gap-4 p-6 bg-primary-50 rounded-2xl border border-primary-100">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <Wallet className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-primary-900">
            <span className="block text-xs uppercase tracking-wide font-bold text-primary-500 mb-0.5">Visa Fee</span>
            {guide?.visaFee ? `${guide.currency || ''} ${guide.visaFee}`.trim() : 'Contact us for the latest fee details'}
          </p>
        </div>
      </ScrollReveal>

      {guide?.postStudyImmigration && (
        <ScrollReveal delay={200}>
          <div className="mt-6 flex items-start gap-4 p-6 bg-secondary-50 rounded-2xl border border-secondary-100">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <Plane className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide font-bold text-secondary-500 mb-1">After Graduation</span>
              <p
                className="guide-content-links text-secondary-900 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.postStudyImmigration) }}
              />
            </div>
          </div>
        </ScrollReveal>
      )}
    </section>
  );
};

export default VisaTab;
