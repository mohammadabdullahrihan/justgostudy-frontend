import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, GraduationCap, Calculator, Wallet, MapPin } from 'lucide-react';
import ScrollReveal from '../../components/study/ScrollReveal';
import { useInView } from '../../hooks/useInView';
import CostComparisonWidget from '../../components/country/CostComparisonWidget';

const toneClasses = {
  primary: { bg: 'bg-primary-50', icon: 'text-primary-600', bar: 'bg-primary-500' },
  accent: { bg: 'bg-accent-50', icon: 'text-accent-600', bar: 'bg-accent-500' },
};

/* CSS-only width transition, no rAF loop needed for a single bar fill, so
   this stays effectively free performance-wise. hasData distinguishes "we
   have no figure" from "the real figure is 0" (e.g. Germany's tuition-free
   public universities) — a falsy check on amount alone would wrongly hide
   that second case behind "Ask a consultant". */
const CostBar = ({ label, amount, hasData, currency, max, Icon, tone, delay }) => {
  const { ref, isInView } = useInView({ threshold: 0.4, triggerOnce: true });
  const t = toneClasses[tone];
  const pct = hasData && max ? Math.max(amount === 0 ? 0 : 6, Math.round((amount / max) * 100)) : 0;

  return (
    <div ref={ref} className={`p-5 rounded-2xl ${t.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${t.icon}`} />
          <span className="font-medium text-black">{label}</span>
        </div>
        {hasData ? (
          <span className="font-bold text-ink-900">{amount === 0 ? 'Free' : `${currency} ${amount.toLocaleString()}`}</span>
        ) : (
          <span className="text-xs font-bold text-ink-500 uppercase tracking-wide">Ask a consultant</span>
        )}
      </div>
      {hasData && (
        <div className="h-2.5 rounded-full bg-white/70 overflow-hidden">
          <div
            className={`h-full rounded-full ${t.bar}`}
            style={{
              width: isInView ? `${pct}%` : '0%',
              transition: `width 900ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// State/province (or, for smaller "city-state" countries, major-city)
// breakdown — a country-wide average reads as vague once we have this, since
// living costs swing hugely within one country (NYC vs. rural Ohio, London
// vs. Newcastle). Own pill-selector so it doesn't fight with the page's
// outer country tabs.
const RegionalCostSection = ({ regions }) => {
  const [active, setActive] = useState(0);
  const region = regions[active];

  return (
    <ScrollReveal delay={135}>
      <div className="mt-6 bg-white rounded-[2rem] p-8 border border-cream-100 shadow-sm">
        <h3 className="font-bold text-ink-900 mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-600" />
          Cost by State/Region
        </h3>
        <p className="text-sm text-ink-500 mb-5">Living costs vary a lot within a country — pick where you&apos;re likely to study.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {regions.map((r, i) => (
            <button
              key={r.region}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                active === i
                  ? 'bg-primary-600 text-white'
                  : 'bg-cream-50 text-ink-600 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              {r.region}
            </button>
          ))}
        </div>

        {region?.note && <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-3">{region.note}</p>}

        <div className="divide-y divide-cream-100">
          {(region?.categories || []).map((row, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm py-3 first:pt-0 last:pb-0">
              <span className="text-black">{row.category}</span>
              <span className="font-bold text-ink-800">{row.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
};

const CostTab = ({ guide, country }) => {
  const currency = guide?.currency || '';
  const hasTuition = guide?.avgTuition != null;
  const hasLiving = guide?.avgLivingCost != null;
  const tuition = guide?.avgTuition ?? 0;
  const living = guide?.avgLivingCost ?? 0;
  const max = Math.max(tuition, living);
  const total = tuition + living;

  const rows = [
    { label: 'Average Tuition (Yearly)', amount: tuition, hasData: hasTuition, Icon: GraduationCap, tone: 'primary' },
    { label: 'Living Expenses (Yearly)', amount: living, hasData: hasLiving, Icon: DollarSign, tone: 'accent' },
  ];

  return (
    <section>
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
          <Wallet className="w-6 h-6 text-primary-600" />
          Cost Breakdown
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <div className="bg-gradient-to-br from-white via-white to-primary-50/50 rounded-[2rem] p-8 border border-cream-100 shadow-sm">
          {total > 0 && (
            <div className="mb-6 p-5 rounded-2xl bg-ink-900 text-white flex items-center justify-between">
              <span className="font-medium text-white/70 text-sm">Estimated Total Per Year</span>
              <span className="font-bold text-xl">{currency} {total.toLocaleString()}</span>
            </div>
          )}
          <div className="space-y-4">
            {rows.map((row, idx) => (
              <CostBar key={row.label} {...row} currency={currency} max={max} delay={idx * 120} />
            ))}
          </div>
          <Link to="/study-abroad/cost-calculator" className="mt-8 flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-all">
            <Calculator className="w-5 h-5" /> Calculate Your Costs
          </Link>
        </div>
      </ScrollReveal>

      {guide?.livingCostBreakdown?.length > 0 && (
        <ScrollReveal delay={125}>
          <div className="mt-6 bg-white rounded-[2rem] p-8 border border-cream-100 shadow-sm">
            <h3 className="font-bold text-ink-900 mb-5">Yearly Living Cost Breakdown</h3>
            <div className="divide-y divide-cream-100">
              {guide.livingCostBreakdown.map((row, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-3 first:pt-0 last:pb-0">
                  <span className="text-black">{row.category}</span>
                  <span className="font-bold text-ink-800">{row.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {guide?.regionalLivingCosts?.length > 0 && <RegionalCostSection regions={guide.regionalLivingCosts} />}

      {hasLiving && (
        <ScrollReveal delay={150}>
          <div className="mt-6">
            <CostComparisonWidget country={country} avgLivingCost={living} currency={currency} />
          </div>
        </ScrollReveal>
      )}
    </section>
  );
};

export default CostTab;
