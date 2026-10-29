import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { ArrowRight } from 'lucide-react';
import { teamData } from '../../constants/teamData';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Transform teamData to the format expected by MeetTheTeam component
const team = teamData.map((member) => ({
  name: member.name,
  role: member.designation,
  photo: member.image,
  bio: member.bio,
}));

// Cycling brand accents keep the roster cohesive but not monotone
const accents = [
  { panel: 'from-primary-100 to-primary-200', num: 'text-primary-300' },
  { panel: 'from-secondary-100 to-secondary-200', num: 'text-secondary-400' },
  { panel: 'from-accent-100 to-accent-200', num: 'text-accent-400' },
];

const MeetTheTeam = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const introRef = useRef(null);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const [active, setActive] = useState(null);

  // Esc-to-close + body scroll lock while the profile modal is open
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setActive(null); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active]);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

      const splits = [];

      /* header: heading words + intro */
      const hWords = new SplitType(headingRef.current, { types: 'words' });
      splits.push(hWords);
      gsap.set(hWords.words, { y: 40, opacity: 0, willChange: 'transform, opacity' });
      gsap.set(introRef.current, { y: 24, opacity: 0 });
      ScrollTrigger.create({
        trigger: headingRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.timeline({ defaults: { ease: 'power3.out' } })
            .to(hWords.words, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05 })
            .to(introRef.current, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3');
        },
      });

      /* roster cards: staggered rise */
      const cards = cardRefs.current.filter(Boolean);
      gsap.set(cards, { y: 52, opacity: 0, willChange: 'transform, opacity' });
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () =>
          gsap.to(cards, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            // release inline transform so CSS group-hover moves keep working
            onComplete: () => gsap.set(cards, { clearProps: 'transform' }),
          }),
      });

      /* generic reveals for the bottom quote + accolades */
      gsap.utils.toArray('[data-reveal]').forEach((group) => {
        const targets = group.hasAttribute('data-reveal-children') ? group.children : [group];
        gsap.set(targets, { opacity: 0, y: 40 });
        ScrollTrigger.create({
          trigger: group,
          start: 'top 85%',
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              onComplete: () => gsap.set(targets, { clearProps: 'transform' }),
            }),
        });
      });

      return () => splits.forEach((s) => s.revert());
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-t border-cream-100 bg-white py-20">

      {/* ── Background decoration ── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cream-50 via-white to-primary-50/40" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary-100 opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-secondary-100 opacity-15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-16 text-center">
          <h2 ref={headingRef} className="mt-1 font-outfit text-4xl font-extrabold leading-tight text-ink-900 md:text-5xl">
            Meet Our <span className="text-primary-600">Expert Team</span>
          </h2>
          <p ref={introRef} className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-500">
            Decades of combined experience in international education, student counselling,
            and visa consultancy, all under one roof.
          </p>
        </div>

        {/* ── Team roster ── */}
        <div ref={gridRef} className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-20 gap-y-32">
          {team.map((member, i) => {
            const a = accents[i % accents.length];
            return (
              <button
                key={member.name}
                type="button"
                ref={(el) => { cardRefs.current[i] = el; }}
                onClick={() => setActive(member)}
                className="group relative flex w-60 flex-col rounded-3xl text-left will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4 focus-visible:ring-offset-white"
              >
                <div className="relative">
                  {/* offset colored panel peeking behind the portrait */}
                  <div className={`absolute inset-0 translate-x-2.5 translate-y-3 rounded-t-[4.5rem] rounded-b-[1.75rem] bg-gradient-to-br ${a.panel} transition-transform duration-500 ease-out group-hover:translate-x-3.5 group-hover:translate-y-5`} />

                  {/* editorial index numeral */}
                  <span className={`pointer-events-none absolute -left-1 -top-5 z-0 font-outfit text-6xl font-black leading-none ${a.num}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* arched duotone portrait */}
                  <div className="relative z-10 aspect-[3/4] overflow-hidden rounded-t-[4.5rem] rounded-b-[1.75rem] bg-cream-100 shadow-theme-lg ring-1 ring-white transition-transform duration-500 ease-out group-hover:-translate-y-1">
                    <img
                      src={member.photo}
                      alt={member.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full scale-[1.04] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-100"
                    />

                    {/* view-profile affordance */}
                    <span className="absolute bottom-4 right-4 z-20 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-white text-primary-600 opacity-0 shadow-theme-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 17 17 7M9 7h8v8" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* caption below the portrait */}
                <div className="mt-5 pl-1.5">
                  <h3 className="font-outfit text-lg font-extrabold leading-snug text-ink-900 transition-colors duration-300 group-hover:text-primary-700">
                    {member.name}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-ink-500">{member.role}</p>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-500/90">
                    {member.bio}
                  </p>
                  <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-primary-600 transition-colors duration-300 group-hover:text-primary-700">
                    Read Full Bio
                    <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Recognition & credentials ── */}
        <div className="mt-20">
          {/* Leadership statement, navy brand band (distinct from the light MD letter above) */}
          <div
            data-reveal
            className="relative overflow-hidden rounded-[2rem] bg-primary-700 px-8 py-12 shadow-theme-lg md:px-14"
          >
            {/* depth glows */}
            <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-primary-500/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-secondary-500/20 blur-3xl" />
            {/* dotted texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)',
                backgroundSize: '22px 22px',
              }}
            />

            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <span className="block select-none font-serif text-7xl leading-none text-accent-400" aria-hidden="true">
                &ldquo;
              </span>
              <p className="-mt-4 font-outfit text-2xl font-semibold leading-snug text-white md:text-4xl">
                Education is the most powerful investment you can make in your future.
              </p>

              <div className="mt-10 flex items-center justify-center gap-4">
                <img
                  src="/image8.jpg"
                  alt="Mohammad Akteruzzaman Bhuiyan"
                  loading="lazy"
                  decoding="async"
                  className="h-20 w-20 rounded-full object-cover object-top ring-2 ring-white/40"
                />
                <div className="text-left">
                  <p className="text-lg font-bold text-white md:text-xl">Mohammad Akteruzzaman Bhuiyan</p>
                  <p className="text-sm font-medium text-primary-200 md:text-base">Managing Director, Just Go Study</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Profile modal ──
          Portaled to <body>: Lenis wraps the page in a transformed container,
          which turns `position: fixed` into "fixed to that wrapper" instead of
          the viewport, so the modal must escape it to render correctly. */}
      {createPortal(
      <AnimatePresence>
        {active && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-ink-950/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={active.name}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-theme-lg md:grid md:grid-cols-[42%_1fr]"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close profile"
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-theme-md ring-1 ring-cream-200 transition-colors hover:bg-ink-900 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>

              {/* portrait */}
              <div className="relative h-28 shrink-0 sm:h-40 md:h-auto md:min-h-full">
                <img src={active.photo} alt={active.name} className="absolute inset-0 h-full w-full object-cover object-top" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/30 to-transparent md:hidden" />
              </div>

              {/* content */}
              <div data-lenis-prevent className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8">
                <h3 className="font-outfit text-2xl font-extrabold leading-tight text-ink-900">{active.name}</h3>
                <p className="mt-1 text-sm font-semibold text-primary-600">{active.role}</p>
                <div className="mt-5 h-px w-full bg-cream-200" />
                <p className="mt-5 text-sm leading-relaxed text-ink-600">{active.bio}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}

    </section>
  );
};

export default MeetTheTeam;
