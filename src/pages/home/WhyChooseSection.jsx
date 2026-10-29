import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { Plane, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const reasons = [
  {
    lead: 'Trusted Since 2024:',
    rest: 'Thousands of students have been placed worldwide.',
  },
  {
    lead: 'High Visa Success Rate:',
    rest: 'Streamlined procedure ensures hassle-free approvals.',
  },
  {
    lead: 'Wide University Network:',
    rest: 'Access to information on top-ranked universities worldwide.',
  },
  {
    lead: 'Scholarships & Financial Aid -',
    rest: 'Maximize your funding opportunities.',
  },
  {
    lead: 'Full-time support -',
    rest: 'From IELTS/PTE training to pre-departure advice.',
  },
];

const WhyChooseSection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const introRef = useRef(null);
  const planeRef = useRef(null);
  const arrowRef = useRef(null);
  const badgeCardRef = useRef(null);
  const imageWrapRef = useRef(null);
  const imageRef = useRef(null);
  const listRef = useRef(null);
  const ctaRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const split = new SplitType(headingRef.current, { types: 'words' });
      gsap.set(split.words, { y: 40, opacity: 0, willChange: 'transform, opacity' });
      gsap.set(introRef.current, { y: 20, opacity: 0 });
      gsap.set(planeRef.current, { x: -30, y: 10, opacity: 0, rotation: -12 });
      gsap.set(arrowRef.current, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(badgeCardRef.current, { opacity: 0, scale: 0.6, y: -12 });
      gsap.set(imageWrapRef.current, { opacity: 0, scale: 0.92 });
      gsap.set(listRef.current.children, { opacity: 0, x: 26 });
      gsap.set('.why-num', { opacity: 0, scale: 0.5 });
      gsap.set(ctaRef.current.children, { opacity: 0, y: 20 });

      // ---- Header: heading + intro + plane doodle + drawing arrow ----
      ScrollTrigger.create({
        trigger: headingRef.current,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap
            .timeline({ defaults: { ease: 'power3.out' } })
            .to(split.words, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06 })
            .to(introRef.current, { y: 0, opacity: 1, duration: 0.6 }, '-=0.35')
            .to(planeRef.current, { x: 0, y: 0, opacity: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.4')
            .to(arrowRef.current, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.3')
            .to(badgeCardRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.5');
        },
      });

      // Idle floats, independent of the one-shot entrance timeline above so
      // they keep running even if the entrance ScrollTrigger never fires
      // (e.g. the section is already in view on load).
      gsap.to(planeRef.current, { y: -6, rotation: 4, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to(badgeCardRef.current, { y: -8, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      // x/rotate only (not y) so this doesn't fight the scroll-scrub
      // parallax below, which already owns imageRef's y.
      gsap.to(imageRef.current, {
        x: 8,
        rotate: 1.5,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // ---- Body: image blob + numbered list ----
      ScrollTrigger.create({
        trigger: imageWrapRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap
            .timeline({ defaults: { ease: 'power3.out' } })
            .to(imageWrapRef.current, { opacity: 1, scale: 1, duration: 0.8 })
            .to('.why-num', { opacity: 1, scale: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(1.7)' }, 0.15)
            .to(
              listRef.current.children,
              {
                opacity: 1,
                x: 0,
                duration: 0.55,
                stagger: 0.12,
                onComplete: () => gsap.set(listRef.current.children, { clearProps: 'transform' }),
              },
              0.2
            )
            .to(
              ctaRef.current.children,
              {
                opacity: 1,
                y: 0,
                duration: 0.55,
                stagger: 0.12,
                onComplete: () => gsap.set(ctaRef.current.children, { clearProps: 'transform' }),
              },
              '-=0.2'
            );
        },
      });

      // subtle parallax on the photo
      gsap.to(imageRef.current, {
        y: -28,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });

      return () => split.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-cream-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Header row: title + doodle arrow + instructor card ── */}
        <div className="relative grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_auto]">
          <div className="relative max-w-2xl">
            <h2
              ref={headingRef}
              className="relative font-outfit text-4xl font-extrabold leading-[1.05] text-ink-900 sm:text-5xl"
            >
              What You Get{' '}
              {/* plane doodle sits after the first word on wide screens */}
              <span ref={planeRef} className="relative -top-1 mx-1 inline-flex h-9 w-9 items-center justify-center text-primary-400">
                <Plane className="h-8 w-8 -rotate-12" strokeWidth={2} />
              </span>
              <br className="hidden sm:block " />
              With Just Go Study
            </h2>
            <p ref={introRef} className="mt-4 max-w-md text-ink-600">
              Choosing the right education consultants makes a real difference to your experience of
              studying abroad. Here&apos;s exactly what&apos;s included when you work with us:
            </p>
          </div>

          {/* Dashed curved arrow (draws on scroll), desktop only */}
          <svg
            className="pointer-events-none absolute left-[46%] top-6 hidden h-16 w-64 text-accent-400 lg:block"
            viewBox="0 0 240 60"
            fill="none"
            aria-hidden="true"
          >
            <path
              ref={arrowRef}
              pathLength="1"
              d="M4 40 C 60 6, 90 60, 130 30 C 165 4, 200 22, 224 20"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8 9"
            />
            <path
              d="M214 12 L226 20 L214 28"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Instructor / trust card */}
          <div
            ref={badgeCardRef}
            className="flex items-center self-start rounded-3xl border border-white/10 bg-primary-600 px-10 py-8 shadow-theme-lg lg:justify-self-end"
          >
            <div>
              <p className="font-outfit text-5xl font-extrabold leading-none text-white">2024</p>
              <p className="mt-2 text-base text-primary-100">Founded</p>
            </div>
          </div>
        </div>

        {/* ── Body: photo blob + numbered reasons ── */}
        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
          {/* Photo on green brand blob */}
          <div className="flex justify-center lg:justify-start">
            <div
              ref={imageWrapRef}
              className="relative flex aspect-[4/5] w-full max-w-md items-center justify-center overflow-hidden rounded-[2.5rem] rounded-tl-[5rem] bg-gradient-to-b from-primary-200 via-primary-300 to-primary-400 p-10"
            >
              {/* soft radial glow behind the 3D object */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.35),transparent_60%)]" />
              <img
                ref={imageRef}
                loading="lazy"
                decoding="async"
                src="/books-and-cup-3d-illustration.webp"
                alt="Just Go Study study essentials"
                className="relative h-full w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Numbered reasons */}
          <div>
            <ul ref={listRef} className="space-y-5">
              {reasons.map((r, i) => (
                <li key={r.lead} className="flex items-start gap-4">
                  <span className="why-num flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-500 font-outfit text-base font-bold text-white shadow-theme-md">
                    {i + 1}
                  </span>
                  <p className="pt-1.5 text-lg leading-snug text-ink-900">
                    <span className="font-bold">{r.lead}</span>{' '}
                    <span className="font-medium text-ink-500">{r.rest}</span>
                  </p>
                </li>
              ))}
            </ul>

            <div ref={ctaRef} className="mt-9">
              <p className="font-outfit text-xl font-bold text-ink-900">
                Your dream university is only a few steps away!
              </p>
              <Link
                to="/book-appointment"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-400 px-7 py-3.5 text-sm font-bold text-ink-900 shadow-theme-lg shadow-accent-400/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-300"
              >
                Book Free Counselling
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
