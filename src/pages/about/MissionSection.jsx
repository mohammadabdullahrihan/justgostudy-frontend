import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { aboutUsData } from '../../constants/pageContent';
import successService from '../../services/successService';
import { parseStatValue } from '../success/icons.jsx';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* Stats, content (numbers + labels) kept exactly as before. Both entries are
   overwritten with the real, live counts from /admin/success once they load
   (see liveStatsRef below), these are just the pre-fetch / offline fallback. */
const stats = [
  { display: '5,000+', target: 5000, label: 'Dreams Achieved' },
  { display: '500+', target: 500, label: 'Universities' },
];

/* Tiny inline stat icons (vector, not bitmap) */
const RocketIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3c2.7 1.4 4.4 4.2 4.4 7.3 0 2-.6 3.6-1.7 5.1H9.3C8.2 13.9 7.6 12.3 7.6 10.3 7.6 7.2 9.3 4.4 12 3Z" />
    <circle cx="12" cy="9.5" r="1.4" />
    <path d="M9.3 15.4 7 18l1.8.2M14.7 15.4 17 18l-1.8.2M12 15.5V20" />
  </svg>
);
const BuildingIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 20h16M6 20V6l6-2.4V20M18 20V9l-6-2.5" />
    <path d="M8.6 8.5v0M8.6 11.5v0M8.6 14.5v0" />
  </svg>
);

const MissionSection = () => {
  const sectionRef = useRef(null);
  const rootRef = useRef(null);       // fades in as a whole
  const imageRef = useRef(null);      // 3D mission illustration
  const cardRef = useRef(null);
  const quoteMarkRef = useRef(null);
  const headingRef = useRef(null);
  const missionRef = useRef(null);
  const blockquoteRef = useRef(null);
  const storyCardRef = useRef(null);  // "Our Story" panel, separated from the mission card
  const historyRef = useRef(null);
  const statNumRefs = useRef([]);
  const statCardRefs = useRef([]);
  // Holds the real, live "Dreams Achieved" figure once it loads, keyed by
  // stat index. useGSAP below has no dependency array (runs once on mount),
  // so this state updating later doesn't retrigger or replay the entrance
  // timeline, it's only read fresh inside the ScrollTrigger onEnter closure
  // and in the JSX fallback for reduced-motion users (who skip that timeline
  // entirely and so need the display text itself to already be live).
  const [liveStats, setLiveStats] = useState({});
  const liveStatsRef = useRef(liveStats);
  liveStatsRef.current = liveStats;

  useEffect(() => {
    let ignore = false;
    successService
      .getAllSuccess()
      .then((res) => {
        if (ignore) return;
        const stat = res?.data?.find((s) => /student/i.test(s.title || ''));
        if (stat?.value) {
          const { prefix, end, suffix } = parseStatValue(stat.value);
          setLiveStats((prev) => ({ ...prev, 0: { target: end, display: `${prefix}${end.toLocaleString()}${suffix}` } }));
        }
        const uniStat = res?.data?.find((s) => /universit/i.test(s.title || ''));
        if (uniStat?.value) {
          const { prefix, end, suffix } = parseStatValue(uniStat.value);
          setLiveStats((prev) => ({ ...prev, 1: { target: end, display: `${prefix}${end.toLocaleString()}${suffix}` } }));
        }
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return; // leave everything in its final, readable state

      const splits = [];
      const hideSplit = (el, types) => {
        const s = new SplitType(el, { types });
        splits.push(s);
        const parts = types === 'words' ? s.words : s.lines;
        gsap.set(parts, { y: 40, opacity: 0, willChange: 'transform, opacity' });
        return parts;
      };

      /* --- initial hidden states (only inside the animated branch) --- */
      gsap.set(rootRef.current, { opacity: 0 });
      gsap.set(cardRef.current, { opacity: 0, y: 60, willChange: 'transform, opacity' });
      gsap.set(imageRef.current, { opacity: 0, y: 40, scale: 0.85, rotate: -6, willChange: 'transform, opacity' });
      gsap.set(storyCardRef.current, { opacity: 0, y: 40, willChange: 'transform, opacity' });
      gsap.set(statCardRefs.current, { opacity: 0, y: 30, scale: 0.9, willChange: 'transform, opacity' });

      const headingWords = hideSplit(headingRef.current, 'words');
      const missionLines = hideSplit(missionRef.current, 'lines');
      const quoteLines = hideSplit(blockquoteRef.current, 'lines');

      /* --- infinite motions --- */
      gsap.to(quoteMarkRef.current, { y: -10, rotation: -4, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to(imageRef.current, { y: -14, rotation: -2, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.8 });
      statCardRefs.current.forEach((el, i) => {
        if (el) gsap.to(el, { y: i % 2 === 0 ? -7 : 7, duration: 4 + i, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.6 });
      });

      /* --- reveal timeline (fade whole section + staggered text) --- */
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });
          tl.to(rootRef.current, { opacity: 1, duration: 0.6 })
            .to(imageRef.current, { opacity: 1, y: 0, scale: 1, rotate: -4, duration: 0.9, ease: 'back.out(1.4)' }, 0.1)
            .to(cardRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0.15)
            .to(headingWords, { y: 0, opacity: 1, stagger: 0.08 }, 0.3)
            .to(missionLines, { y: 0, opacity: 1, stagger: 0.08 }, 0.45)
            .to(blockquoteRef.current ? quoteLines : [], { y: 0, opacity: 1, stagger: 0.06 }, '-=0.4');
        },
      });

      /* --- "Our Story" panel: fades in on its own as it enters view --- */
      ScrollTrigger.create({
        trigger: storyCardRef.current,
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to(storyCardRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }),
      });

      /* --- count-up stats: fire when the badges enter the viewport --- */
      ScrollTrigger.create({
        trigger: statCardRefs.current[0],
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(statCardRefs.current, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'back.out(1.7)' });
          stats.forEach((stat, i) => {
            const el = statNumRefs.current[i];
            if (!el) return;
            const live = liveStatsRef.current[i];
            const target = live?.target ?? stat.target;
            const suffix = (live?.display ?? stat.display).replace(/[\d,]/g, ''); // "+"
            const proxy = { v: 0 };
            gsap.to(proxy, {
              v: target,
              duration: 2,
              ease: 'power1.out',
              delay: 0.2 + i * 0.15,
              onUpdate: () => { el.textContent = Math.round(proxy.v).toLocaleString('en-US') + suffix; },
            });
          });
        },
      });

      return () => splits.forEach((s) => s.revert());
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-white to-primary-50/50 py-24"
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-primary-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-secondary-100/70 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(#0e1f6d 1px, transparent 1px)', backgroundSize: '26px 26px' }}
      />

      <div ref={rootRef} className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid w-full items-center gap-12 md:grid-cols-2">
          {/* ============ LEFT, 3D mission illustration ============ */}
          <div className="flex flex-col items-center">
            <div className="relative flex aspect-square w-full max-w-md items-center justify-center">
              {/* organic blob backdrop, brand-tinted, no dark surfaces */}
              <div className="absolute inset-0 rounded-[46%_54%_61%_39%/56%_44%_56%_44%] bg-gradient-to-br from-primary-50 via-white to-accent-50 shadow-theme-lg ring-1 ring-white" />
              <div className="pointer-events-none absolute inset-8 rounded-[46%_54%_61%_39%/56%_44%_56%_44%] border border-primary-100/50" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle, #0e1f6d 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }}
              />

              <div ref={imageRef} className="relative z-10 w-[64%] will-change-transform">
                <img
                  src="/hat-map-icon.webp"
                  alt="Graduation cap and rolled diploma, Just Go Study's mission to make world-class education accessible"
                  className="w-full object-contain drop-shadow-2xl"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* preserved caption */}
            <p className="mt-6 max-w-xs rounded-full border border-primary-100 bg-white/70 px-5 py-2 text-center text-sm font-semibold italic text-primary-700 backdrop-blur-md shadow-theme-sm">
              &quot;Turning study-abroad dreams into reality&quot;
            </p>
          </div>

          {/* ============ RIGHT, glass mission card + floating stats ============ */}
          <div className="relative">
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary-700 via-primary-700 to-primary-800 p-7 shadow-theme-lg sm:p-9"
            >
              {/* animated quotation mark */}
              <svg
                ref={quoteMarkRef}
                viewBox="0 0 100 100"
                className="pointer-events-none absolute -right-2 -top-3 h-24 w-24 text-white/10 will-change-transform"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20 55c0-14 9-24 22-27l3 7c-8 3-12 8-12 14h9v20H20V55Zm37 0c0-14 9-24 22-27l3 7c-8 3-12 8-12 14h9v20H57V55Z" />
              </svg>

              <h2 ref={headingRef} className="font-outfit text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-[2.75rem]">
                Making World-Class Education <span className="text-accent-400">Accessible</span>
              </h2>

              <p ref={missionRef} className="mt-5 text-base leading-relaxed text-primary-100">
                {aboutUsData.mission}
              </p>

              <blockquote
                ref={blockquoteRef}
                className="mt-6 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-medium italic leading-relaxed text-white"
              >
                We believe every student deserves access to quality international education,
                regardless of where they come from.
              </blockquote>
            </div>

            {/* Floating stat badges, overlap the card bottom on desktop, stack on mobile */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:absolute md:-bottom-10 md:left-6 md:right-6 md:mt-0">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  ref={(el) => { statCardRefs.current[i] = el; }}
                  className="flex items-center gap-3 rounded-2xl border border-cream-200 bg-white/85 px-4 py-3 shadow-theme-lg backdrop-blur-xl will-change-transform"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-theme-md">
                    {i === 0 ? <RocketIcon className="h-5 w-5" /> : <BuildingIcon className="h-5 w-5" />}
                  </span>
                  <div>
                    <p
                      ref={(el) => { statNumRefs.current[i] = el; }}
                      className="font-outfit text-xl font-extrabold leading-none text-ink-900"
                    >
                      {liveStats[i]?.display ?? stat.display}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-ink-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============ "Our Story", separated panel so the copy reads as two distinct, scannable pieces rather than one dense block ============ */}
        <div ref={storyCardRef} className="relative mx-auto mt-24 max-w-4xl md:mt-28">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-primary-700 p-8 sm:p-10">
            <p ref={historyRef} className="text-base leading-relaxed text-primary-100">
              {aboutUsData.history}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
