import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Star, Building2, Globe, Trophy } from 'lucide-react';
import successService from '../../services/successService';
import { FALLBACK_PARTNER_UNIVERSITIES } from '../../constants/successStats';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Real figures, mirrors the canonical Success Stories data seeded on the
// backend (seed.js) and used across the Success page (success/data.js).
// Universities we work with is overwritten with the live, admin-managed count
// once it loads (see the fetch in AboutHero below).
const buildStats = (partnerUniversities) => [
  { value: '90%', label: 'Visa success rate', icon: Star, variant: 'light' },
  { value: partnerUniversities, label: 'Universities we work with', icon: Building2, variant: 'dark' },
  { value: '70+', label: 'Countries covered', icon: Globe, variant: 'accent' },
];

const cardStyles = {
  light: { card: 'bg-cream-50 border border-cream-100', iconWrap: 'bg-primary-700 text-white', value: 'text-ink-900', label: 'text-ink-500' },
  dark: { card: 'bg-gradient-to-br from-primary-600 to-primary-800', iconWrap: 'bg-cream-50 text-primary-700', value: 'text-white', label: 'text-white/60' },
  accent: { card: 'bg-gradient-to-br from-accent-400 to-accent-500', iconWrap: 'bg-primary-700 text-white', value: 'text-ink-900', label: 'text-ink-900/70' },
};

const AboutHero = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const imageWrapRef = useRef(null);
  const statsRef = useRef(null);
  const [partnerUniversities, setPartnerUniversities] = useState(FALLBACK_PARTNER_UNIVERSITIES);
  const stats = buildStats(partnerUniversities);

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

      gsap.set(contentRef.current.children, { opacity: 0, y: 24 });
      gsap.set(statsRef.current.children, { opacity: 0, y: 24 });
      gsap.set(imageWrapRef.current, { opacity: 0, x: 40 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          tl.to(contentRef.current.children, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 })
            .to(imageWrapRef.current, { opacity: 1, x: 0, duration: 0.8 }, 0.15)
            .to(statsRef.current.children, {
              opacity: 1, y: 0, duration: 0.55, stagger: 0.08,
              // release inline transforms so the CSS hover lift on stat cards keeps working
              onComplete: () => gsap.set(statsRef.current.children, { clearProps: 'transform' }),
            }, 0.4);
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-cream-50 pt-10 pb-24 lg:pt-14 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══════════════════════════════
             Bold color-block hero card
        ══════════════════════════════ */}
        <div className="relative rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 shadow-theme-lg">

          {/* Decorative layers, zero JS cost */}
          <div className="absolute -top-32 -right-24 w-[420px] h-[420px] bg-secondary-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-16 w-[360px] h-[360px] bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '26px 26px' }}
          />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 xl:gap-16 items-center p-8 sm:p-12 lg:p-16 xl:p-20">

            {/* ── LEFT, text content ── */}
            <div ref={contentRef}>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] xl:text-6xl font-extrabold uppercase leading-[1.05] tracking-tight text-white mb-6">
                Connecting Ambition
                <br />
                with
                <br />
                <span className="inline-block bg-accent-400 text-ink-900 px-4 sm:px-5 py-1 rounded-xl mt-1">
                  Opportunity
                </span>
              </h1>

              <p className="text-white/75 text-lg leading-relaxed max-w-md mb-8">
                Just Go Study is a premium international education consultancy platform dedicated to
                matching ambitious students with world-class universities through trusted agent networks.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/study-abroad/courses" className="group inline-flex items-center">
                  <span className="w-14 h-14 rounded-full bg-accent-400 flex items-center justify-center text-ink-900 shrink-0 z-10 shadow-theme-md group-hover:bg-accent-300 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                  <span className="-ml-6 pl-9 pr-6 py-4 rounded-full bg-accent-400 text-ink-900 text-sm font-bold uppercase tracking-wide group-hover:bg-accent-300 transition-colors">
                    Explore Courses
                  </span>
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-4 rounded-full border-2 border-white/30 text-white text-sm font-bold uppercase tracking-wide hover:bg-white/10 transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>

            {/* ── RIGHT, image ── */}
            <div ref={imageWrapRef} className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="relative w-[320px] xl:w-[360px] aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 bg-gradient-to-br from-cream-50 via-white to-cream-100">
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #0e1f6d 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
                  <div className="absolute inset-0 flex items-center justify-center p-10 pb-24">
                    <img
                      src="/book-with-cup.webp"
                      alt="Trophy and stack of books, celebrating academic achievement"
                      className="w-full h-full object-contain drop-shadow-xl"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                  </div>

                  {/* Bottom overlay card */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="bg-white rounded-2xl p-3.5 shadow-theme-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent-400 flex items-center justify-center text-ink-900 shrink-0">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink-900">#1 Trusted Education Platform</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-2 h-2 text-accent-500 fill-accent-500" />)}
                            <p className="text-[9px] text-ink-500 ml-0.5">5,000+ students</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ══════════════════════════════
               Stat strip, inside the same card
          ══════════════════════════════ */}
          <div className="relative z-10 border-t border-white/10 px-8 sm:px-12 lg:px-16 xl:px-20 py-8 sm:py-10">
            <div ref={statsRef} className="grid grid-cols-1 items-stretch sm:grid-cols-3 gap-4 sm:gap-5">
              {stats.map(({ value, label, icon: Icon, variant }) => {
                const s = cardStyles[variant];
                return (
                  <div
                    key={label}
                    className={`flex h-full min-h-[9.75rem] w-full flex-col justify-center p-5 rounded-2xl shadow-theme-md hover:-translate-y-1 transition-transform duration-300 cursor-default ${s.card}`}
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${s.iconWrap}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-2xl font-extrabold leading-none mb-1 ${s.value}`}>{value}</p>
                    <p className={`text-sm font-medium ${s.label}`}>{label}</p>
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

export default AboutHero;
