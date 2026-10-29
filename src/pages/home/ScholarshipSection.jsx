import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import * as studyService from '../../services/studyService';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ScholarshipSection = () => {
  const sectionRef = useRef(null);
  const trophyRef = useRef(null);
  const diplomaRef = useRef(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let ignore = false;
    studyService
      .getScholarships()
      .then((data) => {
        if (ignore || !Array.isArray(data)) return;
        // India is intentionally excluded from Bangladeshi-student-facing
        // content site-wide, so this count stays consistent with the "70+
        // countries" figure used everywhere else on the site.
        const active = data.filter((d) => d.country !== 'India');
        const total = active.reduce((sum, d) => sum + (d.scholarshipsData?.length || 0), 0);
        setStats({ total, countries: active.length });
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.from('[data-reveal]', {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      });

      // Gentle continuous float on the 3D pieces — trophy and diploma drift
      // out of sync so the pair reads as alive, not a static sticker.
      gsap.to(trophyRef.current, {
        y: -14,
        rotate: 2,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to(diplomaRef.current, {
        y: 10,
        rotate: -10,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.4,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-cream-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-reveal
          className="group relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-accent-400 via-accent-500 to-accent-700 shadow-theme-md ring-1 ring-primary-900/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-theme-lg"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-white/15 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />

          <div className="relative grid grid-cols-1 items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:gap-6 lg:p-16">
            {/* Image composition — trophy as the main 3D piece, diploma
                peeking from behind for depth, same "real asset, no stock
                photo" convention as the rest of the homepage. Both pieces
                float continuously (see useGSAP above); hover adds a soft
                glow pulse behind the trophy for extra polish. */}
            <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
              <div
                aria-hidden="true"
                className="absolute h-40 w-40 rounded-full bg-white/20 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100 sm:h-52 sm:w-52"
              />
              <img
                ref={diplomaRef}
                src="/diploma-with-hat.webp"
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute left-2 top-6 h-36 w-36 -rotate-6 object-contain opacity-80 sm:h-44 sm:w-44"
              />
              <img
                ref={trophyRef}
                src="/trophy-3d-illustration_13391041.webp"
                alt="Scholarships"
                loading="lazy"
                decoding="async"
                className="relative h-56 w-56 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 sm:h-72 sm:w-72"
              />
            </div>

            <div data-reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-ink-900/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-ink-900 ring-1 ring-ink-900/10">
                <Award className="h-3.5 w-3.5" /> Scholarships
              </span>
              <h2 className="mt-5 font-outfit text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
                Real funding for your study abroad dream
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-800 sm:text-lg">
                {stats
                  ? `${stats.total}+ verified scholarships across ${stats.countries} destination countries — merit-based, need-based, and full government-funded options like Chevening, Fulbright, and DAAD.`
                  : 'Verified scholarships across dozens of destination countries — merit-based, need-based, and full government-funded options like Chevening, Fulbright, and DAAD.'}
              </p>

              <Link
                to="/study-abroad/scholarships"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-sm font-bold text-white shadow-theme-lg shadow-primary-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700"
              >
                All Scholarships
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipSection;
