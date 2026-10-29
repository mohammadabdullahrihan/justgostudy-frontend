import { Link } from 'react-router-dom';
import { Wallet, Languages, ThermometerSun, Clock, Briefcase, UserPlus } from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import { QUICK_INFO_TONES } from '../../utils/tabTones';
import sanitizeHtml from '../../utils/sanitizeHtml';

/* Three matched cards replacing the old plain "Currency/Language/Climate/
   Timezone" divider bar. Sits right under the hero so intake dates and the
   career pitch are visible without scrolling, instead of being buried in a
   sidebar that only appears once the 3-column grid starts. */
const AtAGlanceSection = ({ guide, onViewCareers }) => {
  const quickInfo = [
    { label: 'Currency', value: guide?.currency || 'USD', Icon: Wallet },
    { label: 'Language', value: guide?.language || 'English', Icon: Languages },
    { label: 'Climate', value: guide?.climate || 'Temperate', Icon: ThermometerSun },
    { label: 'Time Zone', value: guide?.timezone || 'UTC+0', Icon: Clock },
  ];

  const intakes = [
    { label: "Bachelor's", value: guide?.intakes?.bachelor },
    { label: "Master's", value: guide?.intakes?.master },
    { label: 'PhD', value: guide?.intakes?.phd },
  ];

  const hasOpportunities = Boolean(guide?.opportunities);

  return (
    <ScrollReveal delay={100}>
      <div className={`grid grid-cols-1 ${hasOpportunities ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 max-w-6xl mx-auto mb-12 items-stretch`}>
        {/* Quick Info */}
        <div className="bg-white rounded-3xl border border-cream-100 shadow-sm p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-600 mb-4">At a Glance</p>
          <div className="divide-y divide-cream-100">
            {quickInfo.map((item, idx) => {
              const tone = QUICK_INFO_TONES[idx % QUICK_INFO_TONES.length];
              return (
                <div key={item.label} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone.iconBg}`}>
                    <item.Icon className={`w-[18px] h-[18px] ${tone.iconText}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-600">{item.label}</p>
                    <p className="text-sm font-bold text-ink-900 leading-snug">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Intakes */}
        <div className="bg-primary-600 rounded-3xl p-7 text-white shadow-xl shadow-primary-100 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <h3 className="text-base font-bold mb-4 relative z-10">Application Intakes</h3>
          <div className="space-y-2.5 relative z-10 flex-1">
            {intakes.map((row) => (
              <div
                key={row.label}
                className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 flex items-center justify-between gap-3"
              >
                <p className="text-primary-100 text-xs font-semibold uppercase shrink-0">{row.label}</p>
                <p className="text-sm font-bold text-right">{row.value || 'N/A'}</p>
              </div>
            ))}
          </div>
          <Link
            to="/register"
            className="relative z-10 flex items-center justify-center gap-2 w-full bg-white text-primary-600 py-3 rounded-xl font-bold text-center mt-6 hover:bg-primary-50 transition-all shadow-lg"
          >
            <UserPlus className="w-4 h-4" /> Create Free Account
          </Link>
        </div>

        {/* Career Opportunities */}
        {hasOpportunities && (
          <div className="bg-gradient-to-br from-white to-secondary-50/50 rounded-3xl p-7 border border-cream-100 shadow-sm flex flex-col">
            <h3 className="text-base font-bold text-ink-900 mb-3">Career Opportunities</h3>
            <p
              data-lenis-prevent
              className="guide-content-links text-black font-medium text-[17px] leading-relaxed mb-5 flex-1 max-h-[260px] overflow-y-auto pr-1"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.opportunities) }}
            />
            <div className="space-y-2.5 mb-6">
              {['Post-study Work Visas', 'High Employment Rates', 'Global Networking'].map((t) => (
                <div key={t} className="flex items-center gap-2.5 text-black text-xs font-medium">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0" /> {t}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onViewCareers}
              className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all mt-auto"
            >
              <Briefcase className="w-4 h-4" /> Explore Careers
            </button>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
};

export default AtAGlanceSection;
