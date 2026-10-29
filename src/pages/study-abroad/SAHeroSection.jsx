import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { Globe, ShieldCheck, Award, Languages, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const SAHeroSection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const ctaRef = useRef(null);
  const cardsRef = useRef(null);
  const orbRefs = useRef([]);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        gsap.set([subheadingRef.current, ctaRef.current, cardsRef.current.children], { opacity: 1, y: 0 });
        return;
      }

      const splitHeading = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });

      gsap.set(subheadingRef.current, { opacity: 0, y: 20 });
      gsap.set(ctaRef.current, { opacity: 0, y: 20 });
      gsap.set(cardsRef.current.children, { opacity: 0, y: 40 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.from(splitHeading.words, { y: 60, opacity: 0, duration: 0.8, stagger: 0.1 })
        .to(subheadingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.8)
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.0)
        .to(
          cardsRef.current.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            onComplete: () => gsap.set(cardsRef.current.children, { clearProps: 'transform' }),
          },
          1.15
        );

      return () => splitHeading.revert();
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      orbRefs.current.forEach((orbEl, i) => {
        if (!orbEl) return;
        gsap.to(orbEl, {
          y: i % 2 === 0 ? 20 : -24,
          x: i % 2 === 0 ? -10 : 10,
          duration: 5 + i,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 px-4 pb-20 pt-16 sm:px-6 lg:px-8"
    >
      <div
        ref={(orbEl) => (orbRefs.current[0] = orbEl)}
        className="pointer-events-none absolute -top-10 left-0 h-72 w-72 rounded-full bg-accent-500/15 blur-3xl"
      />
      <div
        ref={(orbEl) => (orbRefs.current[1] = orbEl)}
        className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-secondary-500/15 blur-3xl"
      />

      <div className="relative flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <h1
          ref={headingRef}
          className="font-outfit text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]"
        >
          500+ Universities. <span className="text-accent-400">One Application</span> Journey.
        </h1>

        <p ref={subheadingRef} className="max-w-xl text-base leading-relaxed text-primary-100 sm:text-lg">
          Compare countries, shortlist courses, and track your visa timeline, all backed by counsellors who&apos;ve done this before.
        </p>

        <Link
          ref={ctaRef}
          to="/study-abroad/destinations"
          className="mt-2 rounded-full bg-accent-500 px-10 py-4 text-sm font-bold text-primary-900 shadow-theme-md transition-colors duration-200 hover:bg-accent-400 active:scale-[0.97]"
        >
          Explore Destinations
        </Link>

        {/* Cross-promo, static (not tied to the heading/CTA GSAP timeline above) so it doesn't compete for attention */}
        <Link
          to="/language-club"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-primary-100 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Languages className="h-3.5 w-3.5 text-accent-400" />
          Prepping for IELTS? Join our free Language Club
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div ref={cardsRef} className="relative mt-16 grid w-full max-w-6xl grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Visa success */}
        <div className="rounded-3xl border border-secondary-100 bg-secondary-50 p-7 transition-transform duration-300 hover:-translate-y-1">
          <div className="mb-7 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-secondary-700 shadow-theme-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Visa Success
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-theme-sm">
              <Award className="h-4 w-4 text-secondary-600" />
            </span>
          </div>
          <svg className="mb-4 h-6 w-16 text-secondary-300" viewBox="0 0 64 24" fill="none">
            <path
              d="M2 20C10 4 16 20 24 10C32 0 38 18 46 8C50 4 54 6 58 2"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p className="font-outfit text-4xl font-bold text-ink-900">90%</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Visa approval rate. Our counselors help with documents and interview prep.
          </p>
        </div>

        {/* Community */}
        <div className="rounded-3xl border border-accent-100 bg-accent-50 p-7 transition-transform duration-300 hover:-translate-y-1">
          <p className="font-outfit text-lg font-bold text-ink-900">Join Our Community</p>
          <div className="mt-4 flex h-48 w-full items-center justify-center">
            <img loading="lazy" decoding="async"
              src="/people-studying-together.webp"
              alt="Students who studied abroad with Just Go Study"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Explore destinations */}
        <div className="rounded-3xl border border-primary-100 bg-primary-50 p-7 transition-transform duration-300 hover:-translate-y-1">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-primary-700 shadow-theme-sm">
            <Globe className="h-3.5 w-3.5" />
            Explore Destinations
          </span>
          <Link
            to="/study-abroad/destinations"
            className="flex h-48 w-full items-center justify-center transition-transform duration-200 hover:scale-[1.02]"
          >
            <img loading="lazy" decoding="async"
              src="/luggage-planning.webp"
              alt="Plan your study abroad trip, explore destinations"
              className="h-full w-full object-contain"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SAHeroSection;
