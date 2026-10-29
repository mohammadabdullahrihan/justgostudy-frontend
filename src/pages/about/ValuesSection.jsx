import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { aboutUsData } from '../../constants/pageContent';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* 4 values, titles come from aboutUsData.values, descriptions kept verbatim.
   Icons are custom drawable stroke paths (no bitmap, no icon lib). */
const valueMeta = [
  {
    // Student-Centric, a person with a check
    desc: "Putting the student's genuine career and academic goals ahead of corporate partnerships.",
    gradient: 'from-primary-400 to-primary-600',
    glow: 'rgba(52,84,229,0.45)',
    spot: 'rgba(52,84,229,0.14)',
    paths: [
      'M12 4a3.2 3.2 0 1 0 0 6.4A3.2 3.2 0 0 0 12 4Z',
      'M5.5 20c0-3.6 2.9-6.2 6.5-6.2 1 0 1.9.2 2.8.6',
      'M14.5 17.8l2 2 3.8-4',
    ],
  },
  {
    // Integrity & Transparency, a shield with a check
    desc: 'Providing honest, transparent assessments of visa chances, costs, and university rankings.',
    gradient: 'from-primary-500 to-primary-700',
    glow: 'rgba(24,52,181,0.45)',
    spot: 'rgba(24,52,181,0.14)',
    paths: [
      'M12 3.5l7 2.6v4.6c0 4.6-3 7.8-7 9.3-4-1.5-7-4.7-7-9.3V6.1l7-2.6Z',
      'M8.8 12.2l2.2 2.2 4.2-4.4',
    ],
  },
  {
    // Personalization, a spark / four-point star
    desc: "Tailoring strategies directly to a student's unique academic and professional profile.",
    gradient: 'from-secondary-400 to-secondary-600',
    glow: 'rgba(30,184,148,0.45)',
    spot: 'rgba(30,184,148,0.16)',
    paths: [
      'M12 3.5l2 5.6 5.6 2-5.6 2-2 5.6-2-5.6-5.6-2 5.6-2 2-5.6Z',
      'M18.6 15.4l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4Z',
    ],
  },
  {
    // Accessibility, an open globe
    desc: 'Actively hunting for scholarships and stipends to make global study affordable.',
    gradient: 'from-primary-600 to-primary-800',
    glow: 'rgba(14,31,109,0.5)',
    spot: 'rgba(14,31,109,0.14)',
    paths: [
      'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z',
      'M3.7 12h16.6',
      'M12 3.5c2.6 2.4 4 5.4 4 8.5s-1.4 6.1-4 8.5c-2.6-2.4-4-5.4-4-8.5s1.4-6.1 4-8.5Z',
    ],
  },
];

const values = aboutUsData.values.map((title, i) => ({ title, ...valueMeta[i] }));

/* Vision pillars, content kept exactly as before */
const pillars = [
  { title: 'Global Standards', desc: 'Setting the benchmark for international education consultancy across Asia and beyond.' },
  { title: 'Ethical Practice', desc: 'Committed to transparency, fairness, and the highest standards of professional conduct.' },
  { title: 'Continuous Growth', desc: 'Expanding our network of universities and agents to serve more students every year.' },
];

/* Build a smooth closed blob path from per-vertex radius multipliers
   (Catmull-Rom → cubic bezier). Lets us morph the shape with no plugin. */
const RADII_A = [1, 0.82, 1.12, 0.9, 1.05, 0.78, 1.15, 0.94];
const RADII_B = [0.88, 1.14, 0.84, 1.08, 0.92, 1.13, 0.86, 1.1];

const blobPath = (cx, cy, base, radii) => {
  const n = radii.length;
  const pts = radii.map((r, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * base * r, cy + Math.sin(a) * base * r];
  });
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return `${d}Z`;
};

const ValuesSection = () => {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const glowRefs = useRef([]);
  const visionRef = useRef(null);
  const visionHeadingRef = useRef(null);
  const pillarRefs = useRef([]);
  const stepLineRef = useRef(null);
  const blobWrapRef = useRef(null);
  const blobPathRef = useRef(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return; // cards + text stay visible, blob keeps its static shape

      const splits = [];

      /* ---------- value cards: fall-in with bounce + icon draw ---------- */
      const cards = cardRefs.current.filter(Boolean);
      gsap.set(cards, { y: -90, opacity: 0, willChange: 'transform, opacity' });
      const cardIconPaths = cards.flatMap((c) => Array.from(c.querySelectorAll('[data-draw]')));
      gsap.set(cardIconPaths, { strokeDasharray: 1, strokeDashoffset: 1 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: 'bounce.out',
            // release inline transform so the hover tilt starts from a clean base
            onComplete: () => gsap.set(cards, { clearProps: 'transform' }),
          });
          gsap.to(cardIconPaths, { strokeDashoffset: 0, duration: 1, stagger: 0.05, ease: 'power2.inOut', delay: 0.35 });
        },
      });

      /* ---------- magnetic 3D tilt + cursor spotlight + icon redraw ----- */
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px) and (hover: hover)', () => {
        const cleanups = [];
        cards.forEach((card, i) => {
          const glow = glowRefs.current[i];
          const icons = Array.from(card.querySelectorAll('[data-draw]'));
          const onMove = (e) => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            card.style.setProperty('--mx', `${x}px`);
            card.style.setProperty('--my', `${y}px`);
            gsap.to(card, {
              rotateY: (x / r.width - 0.5) * 18,
              rotateX: -(y / r.height - 0.5) * 18,
              transformPerspective: 900,
              duration: 0.4,
              ease: 'power2.out',
            });
            if (glow) gsap.to(glow, { opacity: 1, duration: 0.3 });
          };
          const onEnter = () => gsap.fromTo(icons, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.05, ease: 'power2.inOut' });
          const onLeave = () => {
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
            if (glow) gsap.to(glow, { opacity: 0, duration: 0.4 });
          };
          card.addEventListener('mousemove', onMove);
          card.addEventListener('mouseenter', onEnter);
          card.addEventListener('mouseleave', onLeave);
          cleanups.push(() => {
            card.removeEventListener('mousemove', onMove);
            card.removeEventListener('mouseenter', onEnter);
            card.removeEventListener('mouseleave', onLeave);
          });
        });
        return () => cleanups.forEach((fn) => fn());
      });

      /* ---------- Vision block: text + stepper + blob ------------------- */
      const headingWords = new SplitType(visionHeadingRef.current, { types: 'words' });
      splits.push(headingWords);
      const pillarIcons = pillarRefs.current.flatMap((p) => Array.from(p.querySelectorAll('[data-draw]')));
      gsap.set(headingWords.words, { y: 40, opacity: 0, willChange: 'transform, opacity' });
      gsap.set(pillarRefs.current, { x: 40, opacity: 0, willChange: 'transform, opacity' });
      gsap.set(pillarIcons, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(stepLineRef.current, { scaleY: 0, transformOrigin: 'top center' });

      ScrollTrigger.create({
        trigger: visionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(headingWords.words, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' });
          gsap.to(stepLineRef.current, { scaleY: 1, duration: 0.8, ease: 'power2.out', delay: 0.1 });
          gsap.to(pillarRefs.current, { x: 0, opacity: 1, duration: 0.7, stagger: 0.14, ease: 'power3.out', delay: 0.2 });
          gsap.to(pillarIcons, { strokeDashoffset: 0, duration: 0.7, stagger: 0.14, ease: 'power2.inOut', delay: 0.45 });
          gsap.from(blobWrapRef.current, { scale: 0.8, xPercent: -12, opacity: 0, duration: 1.3, ease: 'power3.out' });
        },
      });

      /* ---------- infinite blob morph + slow rotation ------------------ */
      const proxy = { t: 0 };
      const draw = () => {
        const radii = RADII_A.map((a, i) => a + (RADII_B[i] - a) * proxy.t);
        blobPathRef.current.setAttribute('d', blobPath(200, 200, 150, radii));
      };
      draw();
      gsap.to(proxy, { t: 1, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: draw });
      gsap.to(blobWrapRef.current, { rotation: 360, duration: 70, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });

      return () => splits.forEach((s) => s.revert());
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden bg-cream-50 py-24">
      {/* ambient brand blobs */}
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-secondary-100/70 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* eyebrow */}
        <div className="mb-14 flex items-center justify-center gap-4">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary-200 sm:w-12" />
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-600">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
            Our Values
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary-200 sm:w-12" />
        </div>

        {/* ============ 2×2 value cards ============ */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {values.map((value, i) => (
            <div
              key={value.title}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="group relative [transform-style:preserve-3d] will-change-transform"
            >
              {/* soft gradient blur behind the card */}
              <div className={`pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br ${value.gradient} opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-50`} />
              {/* border glow (driven by GSAP on hover) */}
              <div
                ref={(el) => { glowRefs.current[i] = el; }}
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0"
                style={{ boxShadow: `0 0 0 1.5px ${value.glow}, 0 22px 50px -12px ${value.glow}` }}
              />
              {/* card body */}
              <div className="relative flex h-full flex-col rounded-3xl border border-cream-200 bg-white p-7 shadow-theme-md [transform-style:preserve-3d]">
                {/* cursor spotlight (clipped by its own rounded corners) */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(220px circle at var(--mx, 50%) var(--my, 0%), ${value.spot}, transparent 70%)` }}
                />
                {/* top accent bar grows on hover */}
                <div className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 rounded-t-3xl bg-gradient-to-r ${value.gradient} transition-transform duration-500 ease-out group-hover:scale-x-100`} />
                {/* editorial ghost number */}
                <span
                  className="pointer-events-none absolute right-4 top-2 font-outfit text-6xl font-black leading-none opacity-20 [transform:translateZ(20px)] group-hover:opacity-30"
                  style={{ color: value.glow }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* icon tile floats forward in 3D */}
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${value.gradient} shadow-theme-md ring-1 ring-white/40 [transform:translateZ(45px)]`}>
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {value.paths.map((d, pi) => (
                      <path key={pi} data-draw d={d} pathLength="1" />
                    ))}
                  </svg>
                </div>
                <h4 className="relative mb-2 font-outfit text-lg font-bold text-ink-900 [transform:translateZ(28px)]">{value.title}</h4>
                <p className="relative text-sm leading-relaxed text-ink-500 [transform:translateZ(16px)]">{value.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ============ Vision & Global Standards ============ */}
        <div ref={visionRef} className="relative mt-24 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-primary-700 via-primary-700 to-primary-800 p-8 shadow-theme-lg sm:p-12">
          {/* morphing wavy blob background */}
          <div ref={blobWrapRef} className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] opacity-70 blur-[2px] will-change-transform">
            <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="visionBlob" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#d2d9f9" />
                  <stop offset="55%" stopColor="#aebbf4" />
                  <stop offset="100%" stopColor="#a6f3dc" />
                </linearGradient>
              </defs>
              <path
                ref={blobPathRef}
                fill="url(#visionBlob)"
                d="M300,180 C320,240 300,320 240,340 C180,360 100,340 70,290 C40,240 60,150 110,110 C160,70 250,80 285,120 C300,140 295,155 300,180 Z"
              />
            </svg>
          </div>

          <div className="relative grid items-center gap-12 md:grid-cols-2">
            {/* Vision copy */}
            <div className="relative">
              {/* quote watermark for cross-section consistency */}
              <svg viewBox="0 0 100 100" className="pointer-events-none absolute -left-3 -top-6 h-20 w-20 text-white/10" fill="currentColor" aria-hidden="true">
                <path d="M20 55c0-14 9-24 22-27l3 7c-8 3-12 8-12 14h9v20H20V55Zm37 0c0-14 9-24 22-27l3 7c-8 3-12 8-12 14h9v20H57V55Z" />
              </svg>

              <h2 ref={visionHeadingRef} className="font-outfit text-3xl font-extrabold leading-tight text-white md:text-4xl">
                Shaping the Future of <span className="text-accent-400">Global Education</span>
              </h2>
              <span className="mt-4 block h-1 w-16 rounded-full bg-gradient-to-r from-accent-400 to-accent-300" />
              <p className="mt-5 text-base leading-relaxed text-primary-100">
                {aboutUsData.vision}
              </p>
            </div>

            {/* Pillars, vertical stepper */}
            <div className="relative pl-1">
              <span
                ref={stepLineRef}
                className="absolute left-[20px] top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b from-primary-300 via-secondary-300 to-primary-200"
              />
              <div className="space-y-6">
                {pillars.map((pillar, i) => (
                  <div
                    key={pillar.title}
                    ref={(el) => { pillarRefs.current[i] = el; }}
                    className="relative flex items-start gap-4"
                  >
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-500 shadow-theme-sm ring-4 ring-primary-700">
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="#1f1f1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path data-draw d="M5 12.5l4.2 4.2L19 7" pathLength="1" />
                      </svg>
                    </span>
                    <div className="pt-1.5">
                      <h4 className="mb-0.5 text-sm font-bold text-white">{pillar.title}</h4>
                      <p className="text-xs leading-relaxed text-primary-100">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
