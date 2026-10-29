import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, BarChart3, Scale, Compass, GraduationCap, ArrowRight } from 'lucide-react';
import useCardGridFX from '../../hooks/useCardGridFX';

// Solid brand-navy diagonal ring on hover — same convention as
// Courses/DestinationsPage (not the old rainbow conic gradient).
const HOVER_RING = {
  background: 'linear-gradient(135deg, #0e1f6d, #3454e5)',
};

// Icon-chip tint cycles through the three brand tokens (never raw rainbow
// hues) so the row reads as varied without looking like a generic
// mixed-hue template.
const TINTS = [
  { bg: 'bg-primary-50 group-hover:bg-primary-100', icon: 'text-primary-600' },
  { bg: 'bg-secondary-50 group-hover:bg-secondary-100', icon: 'text-secondary-600' },
  { bg: 'bg-accent-50 group-hover:bg-accent-100', icon: 'text-accent-600' },
];

const tools = [
  {
    name: 'Which Country Fits You?',
    description: 'Answer a few questions, get matched to real destinations.',
    icon: Compass,
    href: '/study-abroad/tools/country-match-quiz',
    cta: 'Take the quiz',
    featured: true,
  },
  {
    name: 'IELTS Band Calculator',
    description: 'Convert your raw scores into an estimated overall band.',
    icon: GraduationCap,
    href: '/study-abroad/tools/ielts-band-calculator',
    cta: 'Calculate your band',
  },
  {
    name: 'Visa Tracker',
    description: 'Track your visa application step by step.',
    icon: FileText,
    href: '/study-abroad/tools/visa-tracker',
    cta: 'Track your visa',
  },
  {
    name: 'ROI Estimator',
    description: 'See how fast your investment pays off.',
    icon: TrendingUp,
    href: '/study-abroad/tools/roi-estimator',
    cta: 'Estimate your ROI',
  },
  {
    name: 'Compare Destinations',
    description: 'Living cost, visa fees, and salaries side by side.',
    icon: BarChart3,
    href: '/study-abroad/tools/comparison',
    cta: 'Compare destinations',
  },
  {
    name: 'Compare Courses',
    description: 'Tuition, IELTS score, and ranking side by side.',
    icon: Scale,
    href: '/study-abroad/tools/course-comparison',
    cta: 'Compare courses',
  },
];

const ToolsTeaserSection = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useCardGridFX(sectionRef, gridRef);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-cream-50 py-20 sm:py-24">
      {/* faint blueprint dot-grid, on theme with "plan with real numbers" — fades toward the edges so it reads as texture, not a repeating pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.6]"
        style={{
          backgroundImage: 'radial-gradient(circle, #0e1f6d1a 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 0%, transparent 75%)',
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary-100/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-accent-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            Free Planning Tools
          </span>
          <h2 className="mt-3 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
            Plan with <span className="text-accent-500">real numbers</span>, not guesswork
          </h2>
          <p className="mt-4 text-sm font-semibold text-ink-500">
            {tools.length} calculators &amp; trackers &mdash; free, no signup to try one.
          </p>
        </div>

        {/* lg:grid-flow-row-dense + row-span-2 on the featured tile: six
            identical cards was the "generic AI tool grid" look — this gives
            the quiz real size hierarchy (like the bento treatment used
            elsewhere on the homepage) and dense packing auto-fills the
            other five around it with no manual col/row math needed. */}
        <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:grid-flow-row-dense">
          {tools.map((tool, idx) => {
            const tint = TINTS[idx % TINTS.length];
            return (
              <Link
                key={tool.name}
                to={tool.href}
                data-name={tool.name}
                className={`fx-card group relative h-full will-change-transform ${tool.featured ? 'lg:row-span-2' : ''}`}
              >
                {/* solid brand-navy ring on white cards, gold ring on the
                    navy featured card (a navy ring wouldn't read against a
                    navy card) — fades in + spins slowly on hover */}
                {tool.featured ? (
                  <div className="fx-ring pointer-events-none absolute -inset-[2px] rounded-[30px] bg-gradient-to-br from-accent-300 to-accent-500 opacity-0" />
                ) : (
                  <div className="fx-ring pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-0" style={HOVER_RING} />
                )}

                {tool.featured ? (
                  // Featured tool gets the same "navy contained panel"
                  // treatment used across the rest of the homepage
                  // (HowWeHelpSection's featured card, DestinationsSection's
                  // bento panel) instead of just a small badge on a white
                  // card like the other five.
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-primary-600 p-7 shadow-theme-md transition-shadow duration-300 group-hover:shadow-theme-lg lg:p-9">
                    <div className="relative mb-5 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm transition-all duration-300 group-hover:-rotate-6 lg:h-14 lg:w-14">
                        <tool.icon className="h-6 w-6 text-accent-300 lg:h-7 lg:w-7" />
                      </div>
                      <span className="rounded-full bg-accent-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-950">
                        Start here
                      </span>
                    </div>

                    <h3 className="relative mb-1.5 font-outfit text-lg font-bold text-white lg:text-2xl">{tool.name}</h3>
                    <p className="relative mb-6 flex-1 text-sm leading-relaxed text-white/70 lg:text-base">{tool.description}</p>

                    <span className="relative inline-flex w-fit flex-col text-sm font-bold text-accent-300 transition-colors group-hover:text-accent-200">
                      <span className="flex items-center gap-1.5">
                        {tool.cta}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <svg className="pointer-events-none mt-1 h-1 w-full" viewBox="0 0 100 4" preserveAspectRatio="none" fill="none" aria-hidden="true">
                        <path
                          className="fx-underline"
                          pathLength="1"
                          d="M0 2 H100"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                        />
                      </svg>
                    </span>
                  </div>
                ) : (
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-cream-100 bg-white p-7 shadow-theme-sm transition-shadow duration-300 group-hover:shadow-theme-lg">
                    <div className="relative mb-5 flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:-rotate-6 ${tint.bg}`}
                      >
                        <tool.icon className={`h-6 w-6 ${tint.icon}`} />
                      </div>
                    </div>

                    <h3 className="relative mb-1.5 font-outfit text-lg font-bold text-ink-900">{tool.name}</h3>
                    <p className="relative mb-6 flex-1 text-sm leading-relaxed text-ink-600">{tool.description}</p>

                    <span className="relative inline-flex w-fit flex-col text-sm font-bold text-primary-600 transition-colors group-hover:text-primary-700">
                      <span className="flex items-center gap-1.5">
                        {tool.cta}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <svg className="pointer-events-none mt-1 h-1 w-full" viewBox="0 0 100 4" preserveAspectRatio="none" fill="none" aria-hidden="true">
                        <path
                          className="fx-underline"
                          pathLength="1"
                          d="M0 2 H100"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                        />
                      </svg>
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ToolsTeaserSection;
