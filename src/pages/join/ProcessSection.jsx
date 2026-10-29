import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { steps } from './data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* A three-step timeline: each rail segment draws from one step to the next and
   hands off to that step's icon, which lights from soft primary to solid navy,
   so the reveal reads in the order the steps are meant to be read.

   This replaced a pinned horizontal-scroll track. That version measured its
   travel as `track.scrollWidth - pinRef.offsetWidth`, mixing two reference
   widths, the track sits in a max-w-7xl padded column while the pin spans the
   viewport, so it pinned the whole screen and then slid the panels ~200px,
   most of which was the pr-[20vw] spacer. Three cards fit on one row anyway,
   so there was never anything to scroll through. */
const ProcessSection = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const chips = gsap.utils.toArray('.process-chip');
      const cards = gsap.utils.toArray('.process-card');
      const rails = gsap.utils.toArray('.process-rail');
      const mm = gsap.matchMedia();

      const LIT = { backgroundColor: '#0e1f6d', color: '#ffffff' };
      const DIM = { backgroundColor: '#e8ecfc', color: '#0e1f6d' };

      const build = (withRails) => {
        gsap.set(chips, { scale: 0.8, opacity: 0, ...DIM });
        gsap.set(cards, { y: 40, opacity: 0 });
        if (withRails) gsap.set(rails, { scaleX: 0, transformOrigin: 'left center' });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
        });

        chips.forEach((chip, i) => {
          // Each step lands, then its rail runs on to hand off to the next.
          const at = i * 0.55;
          tl.to(chip, { scale: 1, opacity: 1, ...LIT, duration: 0.45, ease: 'back.out(1.6)' }, at);
          if (withRails && rails[i]) {
            tl.to(rails[i], { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, at + 0.25);
          }
        });

        tl.to(
          cards,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.14,
            ease: 'power3.out',
            // The cards carry a hover lift; a leftover inline transform blocks it.
            onComplete: () => gsap.set(cards, { clearProps: 'transform' }),
          },
          0.15
        );
      };

      mm.add('(min-width: 1024px)', () => build(true));
      mm.add('(max-width: 1023px)', () => build(false));
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative z-10 bg-white py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="mb-16 text-center lg:mb-20">
          <h2 className="mb-6 font-outfit text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            Get Started in <span className="text-primary-600">3 Steps</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-medium text-ink-500">
            Get started in minutes, not days. Our process is simple, so you can begin right away.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center">
              {/* Segment runs from this chip's centre to the next one's: one full
                  column plus the 3rem gap. Deriving it from the column instead of
                  a hand-tuned percentage keeps it exact at every lg width. The
                  chip paints over both ends. */}
              {i < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-8 hidden h-px w-[calc(100%+3rem)] bg-cream-200 lg:block"
                >
                  <div className="process-rail h-full w-full origin-left bg-primary-600" />
                </div>
              )}

              {/* Classes carry the LIT end state so a reduced-motion visitor,
                  who skips the timeline entirely, still gets the finished design.
                  GSAP sets the dim start itself. */}
              <div className="process-chip relative z-10 mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-theme-sm ring-4 ring-white">
                <step.icon className="h-7 w-7" />
              </div>

              <div className="process-card flex w-full flex-1 flex-col rounded-[2.5rem] border border-cream-100 bg-white p-8 text-center shadow-theme-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-theme-lg sm:p-10">
                <span className="mb-3 font-outfit text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-4 font-outfit text-2xl font-bold text-ink-900">{step.title}</h3>
                <p className="font-medium leading-relaxed text-ink-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
