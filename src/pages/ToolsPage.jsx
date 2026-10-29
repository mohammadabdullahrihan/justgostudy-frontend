import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import {
  FileText,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Calculator,
  Globe,
  GraduationCap,
  Building2,
  Scale,
  Compass,
  Check,
  Target,
} from 'lucide-react';
import Seo from '../components/common/Seo';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const heroChips = [
  { label: 'Clear Decisions', icon: Target },
  { label: 'Real Data', icon: BarChart3 },
  { label: 'Global Coverage', icon: Globe },
];

// One consistent brand-navy header across every card (the same canonical
// gradient used site-wide for hero/CTA panels) instead of a different
// mixed-hue gradient per card — six clashing rainbow blocks read as a
// generic template, one calm premium treatment reads as a brand.
// Only the icon tint rotates, for a touch of variety without the noise.
const tools = [
  {
    name: 'Which Country Fits You?',
    description: 'Answer a few questions about budget, climate, and career goals, get matched to real destinations.',
    icon: Compass,
    href: '/study-abroad/tools/country-match-quiz',
    iconAccent: 'text-accent-300',
    features: ['5-question quiz', 'Matched to real destination data', 'Shareable result', 'Book a session CTA'],
  },
  {
    name: 'IELTS Band Calculator',
    description: 'Convert your Listening/Reading raw scores and Writing/Speaking bands into an estimated overall score.',
    icon: GraduationCap,
    href: '/study-abroad/tools/ielts-band-calculator',
    iconAccent: 'text-secondary-300',
    features: ['Official conversion tables', 'All 4 skills', 'Instant estimate', 'Exam prep resources'],
  },
  {
    name: 'Visa Tracker',
    description: 'Track your visa application progress with real-time updates and timeline management.',
    icon: FileText,
    href: '/study-abroad/tools/visa-tracker',
    iconAccent: 'text-accent-300',
    features: ['Real-time tracking', 'Document checklist', 'Timeline management', 'Status updates'],
  },
  {
    name: 'ROI Estimator',
    description: 'Calculate the return on investment for your education abroad.',
    icon: TrendingUp,
    href: '/study-abroad/tools/roi-estimator',
    iconAccent: 'text-secondary-300',
    features: ['Cost analysis', 'Salary projections', 'Break-even calculation', 'Country comparison'],
  },
  {
    name: 'Comparison Tool',
    description: 'Compare destinations side by side on real living cost, visa fees, and salary data.',
    icon: BarChart3,
    href: '/study-abroad/tools/comparison',
    iconAccent: 'text-accent-300',
    features: ['Side-by-side comparison', 'Cost & visa fee data', 'Salary insights', 'Best-value score'],
  },
  {
    name: 'Course Comparison',
    description: 'Compare courses side by side on real tuition, IELTS requirements, and university ranking.',
    icon: Scale,
    href: '/study-abroad/tools/course-comparison',
    iconAccent: 'text-secondary-300',
    features: ['Tuition & total cost', 'IELTS requirements', 'University ranking', 'Best-value score'],
  },
];

const relatedTools = [
  { name: 'Cost Calculator', description: 'Estimate total study abroad costs including tuition, living, and other expenses.', icon: Calculator, href: '/study-abroad/cost-calculator' },
  { name: 'Course Finder', description: 'Find a course based on your preferences and career goals.', icon: GraduationCap, href: '/study-abroad/courses' },
  { name: 'University Explorer', description: 'Explore universities worldwide and find your best match.', icon: Building2, href: '/study-abroad/universities' },
  { name: 'Destination Guide', description: 'See popular study destinations and what each one offers.', icon: Globe, href: '/study-abroad/destinations' },
];

const ToolsPage = () => {
  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Hero heading word-reveal.
      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });
      gsap.from(split.words, { opacity: 0, y: 26, stagger: 0.07, duration: 0.7, ease: 'power3.out' });

      // 3D staggered entry for the main tool cards: they swing in on the Y axis.
      const cards = gsap.utils.toArray('.tool-card', cardsRef.current);
      gsap.set(cards, { transformPerspective: 900, transformOrigin: 'left center' });
      gsap.from(cards, {
        opacity: 0,
        rotationY: -55,
        y: 40,
        duration: 0.9,
        stagger: 0.18,
        ease: 'power3.out',
        scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', once: true },
      });
    },
    { scope: pageRef }
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-cream-50 font-sans">
      <Seo
        title="Free Study Abroad Tools & Calculators - Just Go Study"
        description="Free tools to track your visa timeline, estimate ROI, and compare universities and programs side by side."
      />
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-6 bottom-6 h-56 w-56 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
          <h1 ref={headingRef} className="mb-6 font-outfit text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Study Abroad Tools
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-primary-100">
            Tools to help you make informed decisions about studying abroad.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {heroChips.map((chip) => (
              <div
                key={chip.label}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold backdrop-blur-sm"
              >
                <chip.icon className="h-4 w-4 text-accent-300" />
                {chip.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main tools */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl">
            Essential Tools for Studying Abroad
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-ink-600">
            Everything you need to plan and track your study abroad experience.
          </p>
        </div>

        <div ref={cardsRef} className="mb-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <div key={tool.name} className="tool-card group will-change-transform">
              <Link to={tool.href} className="block h-full">
                <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-cream-100 bg-white shadow-theme-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-theme-lg">
                  <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent-400/20 blur-2xl" />
                    <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                      <tool.icon className={`h-7 w-7 ${tool.iconAccent}`} />
                    </div>
                    <h3 className="relative mb-2 font-outfit text-2xl font-bold">{tool.name}</h3>
                    <p className="relative text-sm text-primary-100/90">{tool.description}</p>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-6 space-y-3">
                      {tool.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-50">
                            <Check className="h-3 w-3 text-secondary-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm text-ink-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-sm font-bold text-primary-600 transition-colors group-hover:text-primary-700">
                        Use This Tool
                      </span>
                      <ArrowRight className="h-4 w-4 text-primary-600 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Related tools */}
        <div className="rounded-[2rem] border border-cream-100 bg-white p-8 shadow-theme-md">
          <h3 className="mb-6 font-outfit text-2xl font-bold text-ink-900">Related Tools &amp; Resources</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTools.map((tool) => (
              <Link
                key={tool.name}
                to={tool.href}
                className="group rounded-2xl border border-cream-200 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-theme-md"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 transition-colors group-hover:bg-primary-100">
                  <tool.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="mb-1 font-bold text-ink-900 transition-colors group-hover:text-primary-600">
                  {tool.name}
                </h4>
                <p className="line-clamp-2 text-sm text-ink-600">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
