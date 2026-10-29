import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { MessageCircle, ClipboardList, FileCheck2, PlaneTakeoff, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const steps = [
  {
    icon: MessageCircle,
    title: 'Free Consultation',
    desc: 'Talk to an expert counselor about your goals, budget, and preferred destinations.',
    tint: 'secondary',
  },
  {
    icon: ClipboardList,
    title: 'University & Course Match',
    desc: 'We shortlist universities and programs that fit your profile and career plans.',
    tint: 'accent',
  },
  {
    icon: FileCheck2,
    title: 'Application & Visa',
    desc: 'End-to-end help with documentation, applications, and visa interview prep.',
    tint: 'primary',
  },
  {
    icon: PlaneTakeoff,
    title: 'Fly & Settle In',
    desc: 'Pre-departure briefing and post-arrival support so you land ready to thrive.',
    tint: 'secondary',
  },
];

const tintClasses = {
  primary: { bg: 'bg-primary-400/20', text: 'text-primary-200' },
  secondary: { bg: 'bg-secondary-400/20', text: 'text-secondary-300' },
  accent: { bg: 'bg-accent-400/20', text: 'text-accent-300' },
};

const SAProcessSection = () => {
  const sectionRef = useRef(null);
  const stepsRef = useRef(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        gsap.set(stepsRef.current.children, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(stepsRef.current.children, { opacity: 0, y: 30 });

      gsap.to(stepsRef.current.children, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
        onComplete: () => gsap.set(stepsRef.current.children, { clearProps: 'transform' }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-cream-100 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
              How It Works
            </span>
            <h2 className="mt-3 font-outfit text-4xl font-bold text-ink-900 sm:text-5xl">
              How we work
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-ink-500 sm:text-right">
            A simple, guided process from your first consultation to landing at your dream university.
          </p>
        </div>

        <div ref={stepsRef} className="flex flex-col gap-5">
          {steps.map((step, i) => {
            const tint = tintClasses[step.tint];
            return (
              <div
                key={step.title}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary-700 to-primary-800 p-6 shadow-theme-md transition-all duration-300 hover:-translate-y-1 hover:shadow-theme-lg sm:p-8"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                  <div className="flex flex-col items-start gap-4 sm:w-64 sm:shrink-0">
                    <span className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-primary-200">
                      Step-{String(i + 1).padStart(3, '0')}
                    </span>
                    <h3 className="font-outfit text-2xl font-bold text-white sm:text-3xl">
                      {step.title}
                    </h3>
                  </div>

                  <div
                    className={`flex h-24 w-24 shrink-0 items-center justify-center self-center rounded-2xl sm:h-28 sm:w-32 ${tint.bg}`}
                  >
                    <step.icon className={`h-10 w-10 sm:h-12 sm:w-12 ${tint.text}`} />
                  </div>

                  <p className="text-sm leading-relaxed text-primary-200 sm:flex-1 sm:text-base">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-4 font-bold text-white shadow-theme-md transition-colors duration-200 hover:bg-primary-700"
          >
            Book Your Free Consultation
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SAProcessSection;
