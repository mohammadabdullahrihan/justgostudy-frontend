import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import successService from '../../services/successService';
import { FALLBACK_PARTNER_UNIVERSITIES } from '../../constants/successStats';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const StudyAbroadCTA = () => {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const statCardRef = useRef(null);
  const [partnerUniversities, setPartnerUniversities] = useState(FALLBACK_PARTNER_UNIVERSITIES);

  // Same admin-managed source (/admin/success) the rest of the site reads
  // from, so this number never drifts from the real, current count.
  useEffect(() => {
    let ignore = false;
    successService
      .getAllSuccess()
      .then((res) => {
        if (ignore) return;
        const stat = res?.data?.find((s) => /universit/i.test(s.title || ''));
        if (stat?.value) setPartnerUniversities(stat.value);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.utils.toArray('[data-reveal]').forEach((group) => {
        const targets = group.hasAttribute('data-reveal-children') ? group.children : [group];
        gsap.set(targets, { opacity: 0, y: 32 });
        ScrollTrigger.create({
          trigger: group,
          start: 'top 85%',
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.1,
              ease: 'power3.out',
              onComplete: () => gsap.set(targets, { clearProps: 'transform' }),
            }),
        });
      });

      // Continuous float on the illustration and an out-of-sync float on
      // the stat card, so the hero visual stays alive after the reveal.
      gsap.to(imgRef.current, {
        y: -14,
        rotate: 2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to(statCardRef.current, {
        y: -8,
        duration: 2.4,
        delay: 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-cream-50 py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div data-reveal className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">

          {/* Left, image + floating stat card */}
          <div className="relative">
            <div className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-white to-secondary-50 shadow-2xl shadow-primary-500/15 min-h-[340px] md:min-h-[440px] p-6">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(circle, #0e1f6d 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
              />
              <img
                ref={imgRef}
                src="/hat-book-3d-illustration_13391082.webp"
                alt="Graduation cap on a book, ready to study abroad"
                className="relative z-10 h-full w-full max-w-md object-contain drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Floating stat card */}
            <div ref={statCardRef} className="absolute top-6 left-6 w-52 rounded-2xl bg-white p-5 shadow-xl border border-cream-100">
              <p className="text-xs font-bold text-ink-900 leading-snug">Student visa success rate</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-bold text-accent-700">
                <TrendingUp className="w-3 h-3" />
                4.9★ rated
              </span>
              <p className="mt-3 text-3xl font-black text-ink-900 leading-none">90%</p>
            </div>
          </div>

          {/* Right, heading, stats & CTAs */}
          <div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-ink-900 leading-tight">
              Ready to study{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">
                abroad?
              </span>
            </h3>
            <p className="mt-4 max-w-md text-ink-500 leading-relaxed">
              Join thousands of Bangladeshi students who&apos;ve secured admissions at top
              universities worldwide with Just Go Study&apos;s expert, end-to-end guidance.
            </p>

            {/* Stat cards */}
            <div className="mt-7 grid max-w-md grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-accent-400 to-accent-500 p-5 shadow-theme-sm">
                <p className="text-2xl md:text-3xl font-black text-white leading-none">5,000+</p>
                <p className="mt-2 text-xs font-semibold text-white/85 leading-snug">
                  Students placed at universities abroad
                </p>
              </div>
              <div className="rounded-2xl bg-primary-700 p-5 shadow-theme-sm">
                <p className="text-2xl md:text-3xl font-black text-white leading-none">{partnerUniversities}</p>
                <p className="mt-2 text-xs font-semibold text-primary-100 leading-snug">
                  Universities we work with across 70+ countries
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-7 py-3.5 text-sm font-bold text-white shadow-theme-lg shadow-accent-500/30 transition-all duration-200 hover:bg-accent-600 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/study-abroad/courses"
                className="inline-flex items-center gap-2 rounded-full border-2 border-cream-200 bg-white px-7 py-3.5 text-sm font-bold text-ink-900 transition-all duration-200 hover:border-accent-400 hover:-translate-y-0.5"
              >
                Browse Courses
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default StudyAbroadCTA;
