import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const quotes = [
  'Education is the most powerful investment you can make in your future.',
  "At Just Go Study, we don't just help you apply to universities—we help you discover your potential, navigate global opportunities, and step confidently onto the world stage.",
];

const stats = [
  { value: '2024', label: 'Founded' },
  { value: '5K+', label: 'Students' },
];

const MessageFromMD = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const portraitRef = useRef(null);
  const captionRef = useRef(null);
  const cardRef = useRef(null);
  const doodleRef = useRef(null);
  const messageRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

      // Split the heading into words for a staggered rise
      const hWords = new SplitType(headingRef.current, { types: 'words' });

      const doodlePaths = doodleRef.current.querySelectorAll('path');
      const message = messageRef.current.children;

      gsap.set(hWords.words, { opacity: 0, y: 36 });
      gsap.set(portraitRef.current, { opacity: 0, x: -48 });
      gsap.set(captionRef.current, { opacity: 0, y: 20 });
      gsap.set(cardRef.current, { opacity: 0, scale: 0.7, y: 20 });
      gsap.set(doodlePaths, { strokeDashoffset: 1 });
      gsap.set(message, { opacity: 0, y: 22 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          tl.to(hWords.words, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 })
            .to(portraitRef.current, {
              opacity: 1,
              x: 0,
              duration: 0.8,
              // release inline transform so the CSS hover-lift keeps working
              onComplete: () => gsap.set(portraitRef.current, { clearProps: 'transform' }),
            }, '-=0.4')
            .to(doodlePaths, { strokeDashoffset: 0, duration: 1, stagger: 0.15 }, '-=0.6')
            .to(cardRef.current, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.6,
              ease: 'back.out(1.7)',
              onComplete: () => gsap.set(cardRef.current, { clearProps: 'transform' }),
            }, '-=0.7')
            .to(captionRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.4')
            .to(message, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.5');
        },
      });

      return () => hWords.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-primary-800 py-24">
      {/* Soft brand-tinted background glow */}
      <div className="pointer-events-none absolute -left-40 top-8 h-[440px] w-[440px] rounded-full bg-primary-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-44 bottom-0 h-[400px] w-[400px] rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-16 text-center">
          <h2 ref={headingRef} className="font-outfit text-3xl font-extrabold leading-tight text-white md:text-4xl">
            A Word from Our <span className="text-accent-400">Managing Director</span>
          </h2>
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* ── Portrait side ── */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[360px]">
              {/* Hand-drawn doodle accents */}
              <svg
                ref={doodleRef}
                className="pointer-events-none absolute -right-6 -top-8 z-20 h-24 w-28 text-accent-400"
                viewBox="0 0 112 96"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 40C18 22 30 14 44 20s10 26 22 24 20-24 34-20"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength="1"
                  style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                />
                <path
                  d="M92 60l6 8M100 54l8 4M88 72l2 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength="1"
                  style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                />
              </svg>

              {/* Dotted texture behind */}
              <div
                className="pointer-events-none absolute -left-6 bottom-8 z-0 h-28 w-28 opacity-40"
                style={{
                  backgroundImage: 'radial-gradient(currentColor 1.5px, transparent 1.5px)',
                  backgroundSize: '14px 14px',
                  color: 'rgba(255,255,255,0.6)',
                }}
              />

              <div ref={portraitRef} className="group relative z-10">
                {/* Offset brand panel peeking behind the portrait */}
                <div className="absolute -bottom-4 -right-4 h-full w-full rounded-t-[4.5rem] rounded-b-[2rem] bg-gradient-to-br from-accent-400 to-accent-500 transition-transform duration-500 ease-out group-hover:-bottom-5 group-hover:-right-5" />

                {/* Arched portrait */}
                <div className="relative overflow-hidden rounded-t-[4.5rem] rounded-b-[2rem] bg-white shadow-theme-lg ring-1 ring-white transition-transform duration-500 ease-out group-hover:-translate-y-1">
                  <img
                    src="/image8.jpg"
                    alt="Mohammad Akteruzzaman Bhuiyan, Managing Director"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full scale-[1.02] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-100"
                  />
                </div>

                {/* Floating credential card */}
                <div
                  ref={cardRef}
                  className="absolute -bottom-6 -left-5 z-20 flex items-stretch gap-4 rounded-2xl border border-cream-100 bg-white/95 px-5 py-3.5 shadow-theme-lg backdrop-blur-sm"
                >
                  {stats.map((s, i) => (
                    <div key={s.label} className={`text-center ${i > 0 ? 'border-l border-cream-200 pl-4' : ''}`}>
                      <p className="font-outfit text-2xl font-extrabold leading-none text-primary-600">{s.value}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Name + role caption */}
            <div ref={captionRef} className="mx-auto mt-14 flex max-w-[360px] items-center gap-3">
              <span className="h-11 w-1 rounded-full bg-gradient-to-b from-accent-300 to-accent-500" />
              <div>
                <h3 className="font-outfit text-lg font-extrabold leading-snug text-white">
                  Mohammad Akteruzzaman Bhuiyan
                </h3>
                <p className="text-sm font-semibold text-accent-400">
                  Managing Director
                  <span className="font-medium text-primary-200"> · Just Go Study · Since 2024</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Message side ── */}
          <div ref={messageRef} className="lg:col-span-7">
            {/* Editorial opening quote glyph */}
            <span className="block select-none font-serif text-7xl leading-none text-accent-400" aria-hidden="true">
              &ldquo;
            </span>

            {/* Lead statement */}
            <p className="-mt-4 font-outfit text-2xl font-bold leading-snug text-white md:text-[1.7rem]">
              {quotes[0]}
            </p>

            {/* Supporting belief */}
            <p className="mt-6 text-base leading-relaxed text-primary-100">{quotes[1]}</p>

            <p className="mt-4 text-base leading-relaxed text-primary-100">
              Your dream destination is closer than you think. We, Just Go Study, are by your side at
              every step of your educational journey.
            </p>

            {/* Signature */}
            <div className="mt-8">
              <p className="font-outfit text-xl font-extrabold text-accent-400">
                Mohammad Akteruzzaman Bhuiyan
              </p>
              <svg className="mt-1 h-3 w-40 text-accent-300" viewBox="0 0 160 12" fill="none" aria-hidden="true">
                <path
                  d="M2 8c26-6 52-8 78-4s52 6 78-2"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessageFromMD;
