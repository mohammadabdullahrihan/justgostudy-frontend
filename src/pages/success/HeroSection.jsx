import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { Users, Building2 } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const HeroSection = ({ stats }) => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const underlineRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const imageRefs = useRef([]);
  const badgeRefs = useRef([]);
  const orbRefs = useRef([]);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

      const badges = badgeRefs.current.filter(Boolean);
      const images = imageRefs.current.filter(Boolean);

      gsap.set(subRef.current, { opacity: 0, y: 24 });
      gsap.set(ctaRef.current.children, { opacity: 0, y: 24 });
      gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: 'left center' });
      // Trophy rests with a slight counter-tilt, hat-map with a slight forward tilt,
      // an intentional collage lean rather than two symmetric boxes.
      gsap.set(images[0], { opacity: 0, y: 50, scale: 0.8, rotate: -18, transformOrigin: 'bottom center' });
      gsap.set(images[1], { opacity: 0, y: 40, scale: 0.75, rotate: 22, transformOrigin: 'bottom center' });
      gsap.set(badges, { opacity: 0, scale: 0.6 });

      // Character-by-character reveal with a letter-spacing settle.
      const split = new SplitType(headingRef.current, { types: 'words,chars', tagName: 'span' });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from(split.chars, { opacity: 0, y: 46, letterSpacing: '0.35em', duration: 0.7, stagger: 0.018 })
        .addLabel('headlineDone')
        .to(underlineRef.current, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, 'headlineDone-=0.1')
        .to(subRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 'headlineDone+=0.1')
        .to(ctaRef.current.children, {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          // release inline transforms so the CSS hover lift on the CTA works
          onComplete: () => gsap.set(ctaRef.current.children, { clearProps: 'transform' }),
        }, 'headlineDone+=0.3')
        .to(images[0], { opacity: 1, y: 0, scale: 1, rotate: -4, duration: 0.9, ease: 'back.out(1.4)' }, 'headlineDone')
        .to(images[1], { opacity: 1, y: 0, scale: 1, rotate: 6, duration: 0.9, ease: 'back.out(1.4)' }, 'headlineDone+=0.15')
        .to(badges, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.7)' }, 'headlineDone+=0.6');

      badges.forEach((badgeEl, i) => {
        gsap.to(badgeEl, {
          y: i % 2 === 0 ? -10 : 10,
          duration: 3 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2.2,
        });
      });

      // Slow float + gentle rotational wobble around each image's resting tilt.
      const restTilt = [-4, 6];
      images.forEach((imgEl, i) => {
        gsap.to(imgEl, {
          y: i % 2 === 0 ? -16 : 14,
          rotate: restTilt[i] + (i % 2 === 0 ? -3 : 3),
          duration: 4.5 + i * 0.7,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.8,
        });
      });

      // Slow-floating background orbs
      orbRefs.current.forEach((orbEl, i) => {
        if (!orbEl) return;
        gsap.to(orbEl, {
          x: i % 2 === 0 ? 30 : -40,
          y: i % 2 === 0 ? -30 : 30,
          scale: 1.08,
          duration: 14 + i * 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      return () => split.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative mx-3 mt-3 flex min-h-[75vh] items-center overflow-hidden rounded-[2rem] bg-gradient-to-b from-primary-700 via-primary-700 to-primary-600 pb-24 pt-20 sm:mx-4 sm:mt-4 sm:rounded-[2.5rem]"
    >
      {/* soft background orbs + dot grid */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          ref={(el) => { orbRefs.current[0] = el; }}
          className="absolute left-[-5%] top-[-10%] h-[70%] w-[50%] rounded-full bg-primary-500/30 blur-[120px] will-change-transform"
        />
        <div
          ref={(el) => { orbRefs.current[1] = el; }}
          className="absolute bottom-[-10%] right-[-5%] h-[60%] w-[40%] rounded-full bg-accent-500/15 blur-[120px] will-change-transform"
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="container relative mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="text-left lg:w-1/2">
            <h1
              ref={headingRef}
              className="mb-6 font-outfit text-4xl font-bold leading-[1.1] tracking-tighter text-white md:text-6xl"
            >
              The Future of{' '}
              <span className="relative inline-block">
                <span className="text-accent-400">Global Education</span>
                <span
                  ref={underlineRef}
                  className="absolute -bottom-1 left-0 right-0 h-2 rounded-full bg-gradient-to-r from-accent-300/70 to-accent-500/70"
                />
              </span>
            </h1>

            <p ref={subRef} className="mb-10 max-w-xl text-lg font-medium leading-relaxed text-primary-100">
              We build careers, not just handle applications. Over 5,000 students have already
              joined Just Go Study to do the same.
            </p>

            <div ref={ctaRef} className="flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="rounded-full bg-accent-400 px-10 py-5 text-lg font-bold text-ink-900 transition-all hover:-translate-y-1 hover:bg-accent-300 hover:shadow-theme-lg"
              >
                Get Started
              </Link>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-primary-600 px-5 py-3 shadow-theme-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Users className="h-5 w-5 text-accent-400" />
                </span>
                <div>
                  <p className="font-outfit text-lg font-bold leading-none text-white">
                    {stats[0]?.value || '5,000+'}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-accent-400">Success Stories</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2">
            <div className="relative mx-auto flex h-[380px] w-full max-w-md items-center justify-center sm:h-[440px]">
              {/* organic blob backdrop, asymmetric radius reads as hand-designed, not a stock card */}
              <div className="absolute inset-0 rounded-[46%_54%_61%_39%/56%_44%_56%_44%] bg-gradient-to-br from-primary-50 via-white to-accent-50 shadow-theme-lg ring-1 ring-white/30" />
              <div className="pointer-events-none absolute inset-8 rounded-[46%_54%_61%_39%/56%_44%_56%_44%] border border-primary-100/50" />

              {/* trophy, large, anchored front-and-center */}
              <div
                ref={(el) => { imageRefs.current[0] = el; }}
                className="absolute bottom-4 left-3 w-[58%] will-change-transform sm:left-6"
              >
                <img
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  src="/trophy-3d-illustration_13391041.webp"
                  alt="Award-winning study abroad consultancy, Just Go Study"
                  className="w-full object-contain drop-shadow-2xl"
                />
              </div>

              {/* global reach, smaller, overlapping upper-right */}
              <div
                ref={(el) => { imageRefs.current[1] = el; }}
                className="absolute right-1 top-2 w-[46%] will-change-transform sm:right-4"
              >
                <img
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  src="/hat-map-icon.webp"
                  alt="Global study destinations mapped for Just Go Study students"
                  className="w-full object-contain drop-shadow-2xl"
                />
              </div>

              <div
                ref={(badgeEl) => { badgeRefs.current[0] = badgeEl; }}
                className="absolute -top-4 left-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-primary-500 px-4 py-3 shadow-theme-md sm:left-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Building2 className="h-5 w-5 text-accent-400" />
                </span>
                <div>
                  <p className="font-outfit text-lg font-extrabold leading-none text-white">
                    {stats[1]?.value || '500+'}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-accent-400">
                    {stats[1]?.title || 'Universities We Work With'}
                  </p>
                </div>
              </div>
              <div
                ref={(badgeEl) => { badgeRefs.current[1] = badgeEl; }}
                className="absolute -bottom-4 right-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-primary-500 px-4 py-3 shadow-theme-md sm:right-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Users className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="font-outfit text-lg font-extrabold leading-none text-white">
                    {stats[0]?.value || '5000+'}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-accent-400">
                    {stats[0]?.title || 'Students Placed'}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-400/25 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
