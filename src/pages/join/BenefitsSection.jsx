import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { benefits } from './data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BenefitsSection = () => {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const quoteRef = useRef(null);
  const headingRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.set(headingRef.current, { opacity: 0, y: 40 });
      gsap.set(listRef.current.children, { opacity: 0, y: 40 });
      gsap.set(quoteRef.current, { opacity: 0, x: 60 });

      const underlines = gsap.utils.toArray('.benefit-underline');
      gsap.set(underlines, { strokeDasharray: 1, strokeDashoffset: 1 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.7 })
            .to(listRef.current.children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.15)
            // Hand-drawn underline strokes in after each benefit lands
            .to(underlines, { strokeDashoffset: 0, duration: 0.7, stagger: 0.12, ease: 'power2.inOut' }, 0.55)
            .to(quoteRef.current, { opacity: 1, x: 0, duration: 0.8 }, 0.4);
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative z-10 bg-cream-50/60 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <h2 ref={headingRef} className="mb-10 font-outfit text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              Built for <span className="text-primary-600">Results.</span>
            </h2>
            <div ref={listRef} className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="group">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cream-100 bg-white text-primary-600 shadow-theme-sm transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div className="relative inline-block">
                    <h4 className="mb-2 text-lg font-bold text-ink-900">{benefit.title}</h4>
                    {/* SVG underline drawn on scroll */}
                    <svg
                      className="absolute -bottom-1 left-0 h-2 w-full"
                      viewBox="0 0 100 8"
                      preserveAspectRatio="none"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        className="benefit-underline"
                        pathLength="1"
                        d="M2 5 Q 25 2 50 5 T 98 4"
                        stroke="#3ed1ae"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-ink-500">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* A pull quote from a real person, so it's built from one: his actual
              portrait carries it instead of the decorative amber star that used to
              sit on top, and figure/blockquote/figcaption says what it is. Brand
              navy (primary-600, the logo colour) gradient, the same surface the
              footer and newsletter use, not a flat near-black. */}
          <figure
            ref={quoteRef}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-600 to-primary-800 p-10 shadow-theme-lg sm:p-12"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 right-4 select-none font-outfit text-[13rem] leading-none text-white/[0.09]"
            >
              &rdquo;
            </span>

            <blockquote className="relative">
              <span className="mb-7 block h-1 w-12 rounded-full bg-accent-400" />
              <p className="font-outfit text-2xl font-semibold leading-snug text-white sm:text-[1.75rem]">
                We built this platform to remove the friction partners usually deal
                with, so working with us is simple from day one.
              </p>
            </blockquote>

            <figcaption className="relative mt-10 flex items-center gap-4 border-t border-white/10 pt-8">
              <img
                src="/image8.jpg"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-14 w-14 shrink-0 rounded-full object-cover object-top ring-2 ring-accent-400/60"
              />
              <div className="min-w-0">
                <div className="font-outfit font-bold text-white">Mohammad Akteruzzaman Bhuiyan</div>
                <div className="text-sm font-medium text-primary-200">Managing Director, Just Go Study</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
