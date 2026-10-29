import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { journeySteps as steps } from './data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Per-step brand accents, the peeking top edge of each stacked card shows
// its own colour, so the deck reads as a layered ladder of brand tones.
const accents = [
  { bar: 'from-primary-400 via-primary-500 to-primary-700', tile: 'bg-primary-600', dot: 'bg-primary-500', ghost: 'text-primary-100', glow: 'bg-primary-500/10', eyebrow: 'text-primary-500' },
  { bar: 'from-accent-300 via-accent-400 to-accent-500', tile: 'bg-accent-500', dot: 'bg-accent-500', ghost: 'text-accent-200', glow: 'bg-accent-400/10', eyebrow: 'text-accent-600' },
  { bar: 'from-secondary-300 via-secondary-400 to-secondary-600', tile: 'bg-secondary-500', dot: 'bg-secondary-500', ghost: 'text-secondary-100', glow: 'bg-secondary-400/10', eyebrow: 'text-secondary-600' },
  { bar: 'from-primary-500 via-primary-600 to-primary-800', tile: 'bg-primary-700', dot: 'bg-primary-600', ghost: 'text-primary-100', glow: 'bg-primary-600/10', eyebrow: 'text-primary-600' },
];

// Sticky-stack geometry, cards pin just below the 80px navbar (top-0 z-40)
// and each successive card rests PEEK px lower, leaving a coloured sliver of
// the one beneath visible.
const STICK_BASE = 112;
const PEEK = 64;

const JourneySection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const introRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Base markup starts hidden (opacity-0 class) so there's no shadow flash
        // before GSAP takes over, reduced-motion users still need it forced visible.
        gsap.set('.jb-card', { opacity: 1 });
        return;
      }

      // Heading + intro reveal (word split, per the shared animation system).
      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });
      gsap.set(introRef.current.children, { opacity: 0, y: 20 });
      ScrollTrigger.create({
        trigger: headingRef.current,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap
            .timeline({ defaults: { ease: 'power3.out' } })
            .from(split.words, { opacity: 0, y: 28, stagger: 0.06, duration: 0.7 })
            .to(introRef.current.children, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, 0.15);
        },
      });

      const items = gsap.utils.toArray('.jb-item', cardsRef.current);
      const cards = items.map((el) => el.querySelector('.jb-card'));

      // Each card lifts into place once as it first enters the viewport.
      cards.forEach((card) => {
        gsap.set(card, { opacity: 0, y: 64, scale: 0.96 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 90%',
          once: true,
          onEnter: () =>
            gsap.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out' }),
        });
      });

      // As the next card scrolls up and covers this one, scrub it back into the
      // stack: a touch of scale plus a darkening veil for real depth.
      items.forEach((item, i) => {
        if (i === items.length - 1) return;
        const veil = item.querySelector('.jb-veil');
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: items[i + 1],
              start: 'top 92%',
              end: `top ${STICK_BASE + (i + 1) * PEEK + 40}px`,
              scrub: 0.6,
            },
          })
          .to(cards[i], { scale: 0.93, transformOrigin: 'center top' }, 0)
          .to(veil, { opacity: 0.14 }, 0);
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-primary-800 py-24 sm:py-28">
      {/* Header */}
      <div className="mx-auto mb-16 max-w-2xl px-6 text-center sm:mb-20 md:px-12">
        <div className="flex items-center justify-center gap-3 text-sm">
          <span className="font-sans font-semibold tracking-widest text-primary-300">[03]</span>
          <span className="font-semibold uppercase tracking-widest text-primary-100">The Process</span>
        </div>
        <h2
          ref={headingRef}
          className="mt-6 font-outfit text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Your Success <span className="text-accent-400">Blueprint</span>
        </h2>
        <div ref={introRef}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-primary-100 sm:text-lg">
            Four steps, one process, from the first conversation to the moment you land on
            campus.
          </p>
        </div>
      </div>

      {/* Sticky-stack deck */}
      <div ref={cardsRef} className="mx-auto max-w-3xl px-6 md:px-12">
        {steps.map((item, i) => {
          const a = accents[i % accents.length];
          return (
            <div
              key={item.step}
              className="jb-item sticky"
              style={{ top: `${STICK_BASE + i * PEEK}px`, zIndex: i + 1 }}
            >
              <article className="jb-card relative flex min-h-[16rem] flex-col overflow-hidden rounded-[2rem] border border-ink-100 bg-white p-8 opacity-0 shadow-theme-lg sm:p-10">
                {/* Recede veil, scrubbed 0 → 0.14 as the next card covers this one */}
                <span aria-hidden="true" className="jb-veil pointer-events-none absolute inset-0 rounded-[2rem] bg-primary-950 opacity-0" />
                {/* Coloured top edge, this is the sliver that peeks in the stack */}
                <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${a.bar}`} />
                {/* Soft brand glow in the corner */}
                <span aria-hidden="true" className={`pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl ${a.glow}`} />
                {/* Oversized ghost step number */}
                <span aria-hidden="true" className={`pointer-events-none absolute -bottom-8 right-2 select-none font-outfit text-[9.5rem] font-black leading-none ${a.ghost}`}>
                  {item.step}
                </span>

                {/* Header row, the part that stays visible while stacked */}
                <div className="relative flex items-center gap-5">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${a.tile} text-white shadow-theme-md`}>
                    <item.icon className="h-7 w-7" strokeWidth={1.6} />
                  </div>
                  <div>
                    <p className={`font-outfit text-xs font-extrabold uppercase tracking-[0.28em] ${a.eyebrow}`}>
                      Step {item.step}
                    </p>
                    <h3 className="mt-1 font-outfit text-2xl font-bold leading-tight text-ink-900 sm:text-[1.7rem]">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <p className="relative mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
                  {item.desc}
                </p>

                {/* Footer, phase progress derived from the real step order */}
                <div className="relative mt-auto flex items-center gap-4 pt-8">
                  <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
                    Phase {item.step} / 0{steps.length}
                  </span>
                  <span className="h-px flex-1 bg-ink-100" />
                  <span className="flex gap-1.5">
                    {steps.map((s, d) => (
                      <span
                        key={s.step}
                        className={`h-1.5 w-1.5 rounded-full ${d <= i ? a.dot : 'bg-ink-200'}`}
                      />
                    ))}
                  </span>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default JourneySection;
