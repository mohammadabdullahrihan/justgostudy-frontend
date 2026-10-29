import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { Landmark, Users, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const heroRoles = [
  { icon: Landmark, label: 'Universities/Colleges', desc: 'Recruit globally with smart tools' },
  { icon: Users, label: 'Agents', desc: 'Track commissions & students in real-time' },
];

const HeroSection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const cardsRef = useRef(null);
  const underlineRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

      // Character-by-character reveal with a letter-spacing settle.
      const split = new SplitType(headingRef.current, { types: 'words,chars', tagName: 'span' });

      gsap.set(subRef.current, { opacity: 0, y: 24 });
      gsap.set(ctaRef.current.children, { opacity: 0, y: 24 });
      gsap.set(cardsRef.current.children, { opacity: 0, y: 30 });
      gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: 'left center' });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from(split.chars, {
        opacity: 0,
        y: 46,
        letterSpacing: '0.35em',
        duration: 0.7,
        stagger: 0.018,
      })
        .to(underlineRef.current, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, 0.8)
        .to(subRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.9)
        .to(ctaRef.current.children, {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          onComplete: () => gsap.set(ctaRef.current.children, { clearProps: 'transform' }),
        }, 1.05)
        .to(cardsRef.current.children, {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          // release inline transforms so the CSS hover lift on the role cards works
          onComplete: () => gsap.set(cardsRef.current.children, { clearProps: 'transform' }),
        }, 1.2);

      return () => split.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-10 flex min-h-screen items-center overflow-hidden pb-16 pt-28 md:pb-24 md:pt-40"
    >
      {/* Background, a static brand wash. These two shapes used to float on an
          infinite yoyo tween at blur-[120px]; a 700px blurred gradient re-rasterised
          forever is a standing GPU cost that never pays for itself, and the house
          rule caps animated blur at blur-2xl. Static, they cost one paint. */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-5%] top-[-10%] h-[700px] w-[700px] rounded-full bg-gradient-to-br from-primary-100/60 via-primary-50/30 to-transparent blur-2xl" />
        <div className="absolute bottom-[-15%] right-[-5%] h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-secondary-100/50 via-primary-50/20 to-transparent blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#0e1f6d 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center">
          <h1
            ref={headingRef}
            className="mb-6 max-w-4xl font-outfit text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Your Platform to{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span className="text-primary-500">Shape</span>
              <span
                ref={underlineRef}
                className="absolute -bottom-1 left-0 right-0 h-2 rounded-full bg-gradient-to-r from-primary-200/70 to-secondary-200/70"
              />
            </span>{' '}
            <br className="hidden sm:block" />
            Global Education
          </h1>

          <p ref={subRef} className="mb-10 max-w-xl text-base font-medium leading-relaxed text-ink-500 sm:text-lg">
            Join the world&apos;s most innovative network, whether you&apos;re a university/college or agent,
            we give you the tools to reach, enroll, and impact students across 150+ countries.
          </p>

          <div ref={ctaRef} className="mb-16 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="#roles"
              className="group flex w-full items-center justify-center rounded-full bg-primary-600 px-10 py-4 text-lg font-bold text-white shadow-theme-md transition-all hover:-translate-y-0.5 hover:bg-primary-500 hover:shadow-theme-lg sm:w-auto"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              to="/contact"
              className="group flex w-full items-center justify-center rounded-full border-2 border-primary-200 bg-white px-10 py-4 text-lg font-bold text-primary-600 transition-all duration-300 hover:border-primary-400 hover:shadow-theme-md sm:w-auto"
            >
              Talk to Us
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Role cards row */}
          <div ref={cardsRef} className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
            {heroRoles.map((role) => (
              <a
                key={role.label}
                href="#roles"
                className="group flex items-center gap-5 rounded-3xl border border-primary-100/60 bg-white p-6 text-left shadow-theme-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-200 hover:shadow-theme-lg"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-theme-md">
                  <role.icon className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <h3 className="mb-0.5 text-lg font-bold text-ink-900">{role.label}</h3>
                  <p className="truncate text-sm font-medium text-ink-500">{role.desc}</p>
                </div>
                <div className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
