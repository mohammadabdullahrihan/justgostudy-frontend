import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { whyPillars, yearsExperience } from './data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WhySection = () => {
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });

      gsap.set(leftRef.current.children, { opacity: 0, y: 24 });
      gsap.set(cardsRef.current.children, { opacity: 0, y: 32 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          tl.from(split.words, { opacity: 0, y: 30, stagger: 0.08, duration: 0.7 })
            .to(leftRef.current.children, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.1)
            .to(
              cardsRef.current.children,
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.1,
                // Wrappers carry the reveal transform; clearing it keeps the
                // inner card's CSS rotate/hover (per the clearProps gotcha).
                onComplete: () => gsap.set(cardsRef.current.children, { clearProps: 'transform' }),
              },
              0.25
            );
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
          {/* Left rail, section marker, intro copy, experience stat */}
          <div ref={leftRef} className="lg:col-span-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-sans font-semibold tracking-widest text-ink-500">[02]</span>
              <span className="font-semibold uppercase tracking-widest text-ink-700">Why Choose Us</span>
            </div>

            <p className="mt-10 max-w-xs text-base leading-relaxed text-ink-500">
              We support your international education from initial planning to post-landing
              help, every step of the way.
            </p>

            <div className="mt-10 flex items-baseline gap-3">
              <span className="font-outfit text-5xl font-extrabold leading-none text-primary-600">
                {yearsExperience}
              </span>
              <span className="text-sm font-medium leading-tight text-ink-500">
                Founded,
                <br />
                Built to Last
              </span>
            </div>
          </div>

          {/* Right, headline + benefit grid */}
          <div className="lg:col-span-8">
            <h2
              ref={headingRef}
              className="font-outfit text-4xl font-extrabold leading-[0.98] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
            >
              Beyond Just <br /> Consultancy.
            </h2>

            <div ref={cardsRef} className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {whyPillars.map((pillar, i) => {
                const highlight = i === 0;
                return (
                  <div key={pillar.title} className="why-card-wrap">
                    <article
                      className={`flex h-full min-h-[15rem] flex-col rounded-3xl p-8 transition-all duration-300 ${
                        highlight
                          ? 'bg-accent-500 text-white shadow-theme-lg sm:-rotate-2 sm:hover:rotate-0'
                          : 'bg-primary-700 text-white hover:-translate-y-1 hover:shadow-theme-md'
                      }`}
                    >
                      <pillar.icon
                        className={`h-8 w-8 shrink-0 ${highlight ? 'text-white' : 'text-accent-400'}`}
                        strokeWidth={1.5}
                      />
                      <div className="mt-auto pt-14">
                        <h3 className="font-outfit text-2xl font-bold leading-tight">{pillar.title}</h3>
                        <p
                          className={`mt-2 text-sm leading-relaxed ${
                            highlight ? 'text-white/85' : 'text-primary-100'
                          }`}
                        >
                          {pillar.description}
                        </p>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
