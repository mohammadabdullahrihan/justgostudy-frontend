import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { ArrowUpRight, Languages } from 'lucide-react';
import successService from '../../services/successService';
import HeroLogoCycler from './HeroLogoCycler';
import { formatStatValue } from '../success/icons.jsx';
import { FALLBACK_STUDENTS_PLACED, FALLBACK_PARTNER_UNIVERSITIES } from '../../constants/successStats';

gsap.registerPlugin(useGSAP);


const HERO_CUTOUTS = [
  { src: '/logo.png', alt: 'Just Go Study Logo' },
];


const CUTOUT_LAYOUTS = {
  1: [{ height: '60%', z: 'z-30', center: true }],
};

const PLACEHOLDER_COUNT = 2;

const PROOF_AVATAR_COUNT = 3;

const FALLBACK_PROOF = [
  { key: 'AR', initials: 'AR', className: 'bg-primary-600' },
  { key: 'SK', initials: 'SK', className: 'bg-secondary-600' },
  { key: 'MH', initials: 'MH', className: 'bg-accent-500' },
];

const INITIAL_COLORS = ['bg-primary-600', 'bg-secondary-600', 'bg-accent-500'];

// Admin leaves placehold.co URLs on testimonials that have no real photo yet.
const hasRealPhoto = (testimonial) =>
  Boolean(testimonial?.image) && !testimonial.image.includes('placehold.co');

const toInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('') || 'JT';

/* Photos first, so the strip reads as faces rather than a wall of monograms. */
const buildProofAvatars = (testimonials) => {
  if (!testimonials?.length) return FALLBACK_PROOF;

  const photoFirst = [
    ...testimonials.filter(hasRealPhoto),
    ...testimonials.filter((testimonial) => !hasRealPhoto(testimonial)),
  ].slice(0, PROOF_AVATAR_COUNT);

  return photoFirst.map((testimonial, i) => ({
    key: testimonial._id ?? `${testimonial.name}-${i}`,
    name: testimonial.name,
    image: hasRealPhoto(testimonial) ? testimonial.image : null,
    initials: toInitials(testimonial.name),
    className: INITIAL_COLORS[i % INITIAL_COLORS.length],
  }));
};

const HeroSection = ({ testimonials }) => {
  const [studentsPlaced, setStudentsPlaced] = useState(FALLBACK_STUDENTS_PLACED);
  const [partnerUniversities, setPartnerUniversities] = useState(FALLBACK_PARTNER_UNIVERSITIES);

  // Same admin-managed source the Stats section below uses, so these proof
  // numbers show a real, current count instead of a static hardcoded claim.
  useEffect(() => {
    let ignore = false;
    successService
      .getAllSuccess()
      .then((res) => {
        if (ignore) return;
        const stat = res?.data?.find((s) => /student/i.test(s.title || ''));
        if (stat?.value) setStudentsPlaced(stat.value);
        const uniStat = res?.data?.find((s) => /universit/i.test(s.title || ''));
        if (uniStat?.value) setPartnerUniversities(uniStat.value);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const ctaRef = useRef(null);
  const archGroupRef = useRef(null);
  const archFillRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const orbRefs = useRef([]);
  const quickX = useRef(null);
  const quickY = useRef(null);

  // Real cutouts once supplied, silhouettes until then. Either way the arch
  // composition is driven by how many figures there are.
  const figureCount = Math.min(HERO_CUTOUTS.length || PLACEHOLDER_COUNT, 3);
  const layouts = CUTOUT_LAYOUTS[figureCount];
  const figures = layouts.map((layout, i) => ({
    layout,
    src: HERO_CUTOUTS[i]?.src ?? null,
    alt: HERO_CUTOUTS[i]?.alt ?? '',
  }));

  const proofAvatars = buildProofAvatars(testimonials);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const root = sectionRef.current;

      quickX.current = gsap.quickTo(archGroupRef.current, 'x', { duration: 0.8, ease: 'power3.out' });
      quickY.current = gsap.quickTo(archGroupRef.current, 'y', { duration: 0.8, ease: 'power3.out' });

      if (reduceMotion) {
        gsap.set([subheadingRef.current, ...ctaRef.current.children], { opacity: 1, y: 0 });
        gsap.set(archFillRef.current, { clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set('.hero-cutout, .hero-stat, .hero-proof', { opacity: 1, scale: 1, y: 0 });
        gsap.set('.hero-underline, .arch-ring', { strokeDashoffset: 0 });
        return;
      }

      const splitHeading = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });

      gsap.set(subheadingRef.current, { opacity: 0, y: 20 });
      gsap.set(ctaRef.current.children, { opacity: 0, y: 20 });
      gsap.set(archFillRef.current, { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set('.hero-cutout', { opacity: 0, y: 40 });
      gsap.set('.hero-stat', { opacity: 0, scale: 0.85 });
      gsap.set('.hero-proof', { opacity: 0, y: 20 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.from(splitHeading.words, { y: 60, opacity: 0, duration: 0.8, stagger: 0.1 })
        .fromTo(
          root.querySelector('.hero-underline'),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' },
          '-=0.3'
        )
        .to(subheadingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.8)
        .to(
          ctaRef.current.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            // Inline transform would otherwise block `active:scale` / hover.
            onComplete: () => gsap.set(ctaRef.current.children, { clearProps: 'transform' }),
          },
          1.2
        )
        // Proof strip lands just after the buttons it sits under.
        .to('.hero-proof', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.5)
        // The arch draws itself, then fills, then the student steps into it.
        .fromTo(
          root.querySelector('.arch-ring'),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' },
          0.2
        )
        .to(
          archFillRef.current,
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut' },
          0.7
        )
        // Figures step into the arch back-to-front, lead figure last.
        .to(
          '.hero-cutout',
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
          1.1
        )
        .to(
          '.hero-stat',
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.7)' },
          1.4
        );

      // Infinite slow float, stat cards. No Tailwind hover:-translate on these,
      // so the persistent inline transform is safe.
      gsap.utils.toArray('.hero-stat').forEach((statEl, i) => {
        gsap.to(statEl, {
          y: i % 2 === 0 ? -10 : 10,
          duration: 3.5 + i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2 + i * 0.2,
        });
      });

      // Infinite slow float, background orbs
      orbRefs.current.forEach((orbEl, i) => {
        if (!orbEl) return;
        gsap.to(orbEl, {
          y: i % 2 === 0 ? 20 : -24,
          x: i % 2 === 0 ? -10 : 10,
          duration: 5 + i,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      gsap.to(scrollIndicatorRef.current, {
        y: 8,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      return () => splitHeading.revert();
    },
    { scope: sectionRef }
  );

  const handleMouseMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { innerWidth, innerHeight } = window;
    const relX = (e.clientX / innerWidth - 0.5) * 2;
    const relY = (e.clientY / innerHeight - 0.5) * 2;
    quickX.current?.(relX * 12);
    quickY.current?.(relY * 12);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative mx-3 mb-3 mt-3 flex min-h-[calc(100vh-6.5rem)] items-center overflow-hidden rounded-[2rem] bg-gradient-to-b from-primary-700 via-primary-700 to-primary-600 pt-28 pb-20 sm:mx-4 sm:mb-4 sm:mt-4 sm:min-h-[calc(100vh-7rem)] sm:rounded-[2.5rem] sm:pt-32"
    >
      {/* Background orbs, blur-2xl (not 3xl) keeps older hardware smooth */}
      <div
        ref={(orbEl) => (orbRefs.current[0] = orbEl)}
        className="pointer-events-none absolute -top-10 left-0 h-72 w-72 rounded-full blur-2xl"
      />
      <div
        ref={(orbEl) => (orbRefs.current[1] = orbEl)}
        className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-accent-500/20 blur-2xl"
      />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-14 px-4 sm:px-6 lg:grid-cols-[52%_48%] lg:gap-8 lg:px-8">
        {/* LEFT, copy */}
        <div className="flex flex-col justify-center gap-5">
          <h1
            ref={headingRef}
            className="font-outfit text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]"
          >
            Your <span className="text-accent-400">Global Education</span> Starts Here
          </h1>

          {/* Gold underline that draws under the heading (shared hero pattern) */}
          <svg
            className="-mt-1 h-3 w-56 max-w-full"
            viewBox="0 0 240 12"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="hero-underline"
              d="M2 8 C 60 2, 180 2, 238 8"
              stroke="#f7a730"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength="1"
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
          </svg>

          <p ref={subheadingRef} className="max-w-md text-base leading-relaxed text-primary-200 sm:text-lg">
            {partnerUniversities} universities. 70+ countries. One trusted partner.
          </p>

          <div ref={ctaRef} className="mt-2 flex items-center gap-3">
            <Link
              to="/book-appointment"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent-400 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-900 shadow-theme-md transition-all duration-200 hover:bg-accent-300 hover:shadow-theme-lg active:scale-[0.97]"
            >
              Get Started
            </Link>
            <Link
              to="/study-abroad/courses"
              aria-label="Explore programs"
              className="group inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white shadow-theme-sm transition-colors duration-200 hover:bg-primary-400"
            >
              <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Social proof, faces of students who already went, sitting right
              under the CTA they're meant to justify. */}
          <div className="hero-proof mt-4 flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-primary-600 px-4 py-3 shadow-theme-md">
            <div className="flex -space-x-2.5">
              {proofAvatars.map((avatar, i) =>
                avatar.image ? (
                  <img
                    key={avatar.key}
                    src={avatar.image}
                    alt={avatar.name}
                    loading="eager"
                    decoding="async"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-600"
                    style={{ zIndex: proofAvatars.length - i }}
                  />
                ) : (
                  <div
                    key={avatar.key}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-primary-600 ${avatar.className}`}
                    style={{ zIndex: proofAvatars.length - i }}
                  >
                    {avatar.initials}
                  </div>
                )
              )}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white ring-2 ring-primary-600">
                +
              </div>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-white">{formatStatValue(studentsPlaced)}</p>
              <p className="text-xs text-primary-100">Students Helped</p>
            </div>
          </div>

          {/* Cross-promo, low-key so it doesn't compete with the primary CTA above it */}
          <Link
            to="/language-club"
            className="hero-proof mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-primary-100 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Languages className="h-3.5 w-3.5 text-accent-400" />
            Prepping for IELTS? Join our free Language Club
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* RIGHT, the prestige arch. Cutout stands in front of it and
            deliberately breaks the apex, so it is never clipped. */}
        <div className="flex items-end justify-center lg:justify-end">
          <div
            ref={archGroupRef}
            className="relative h-[364px] w-[280px] origin-bottom scale-100 sm:h-[442px] sm:w-[340px] xl:h-[520px] xl:w-[400px]"
          >
            {/* Gold ring, drawn on load. Same box as the arch, so no distortion. */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 400 520"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="arch-ring"
                d="M1 520 L1 200 A199 199 0 0 1 399 200 L399 520"
                stroke="#788ded"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
                pathLength="1"
                style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
              />
            </svg>

            {/* The archway opening, lit from within, so the dark graduation
                gowns read as clean silhouettes against it. */}
            <div
              ref={archFillRef}
              // Stays lighter than the section behind it, that gap is what
              // makes the opening read as lit from within.
              className="absolute inset-x-[3.5%] top-[2.7%] bottom-0 overflow-hidden rounded-t-full bg-gradient-to-b from-white via-accent-50 to-accent-200"
            >
              {/* Engraved concentric arches, cheap depth, no blur cost */}
              <div className="absolute inset-x-[8%] top-[6%] bottom-0 rounded-t-full border border-primary-900/10" />
              <div className="absolute inset-x-[17%] top-[13%] bottom-0 rounded-t-full border border-primary-900/[0.07]" />
              {/* Warm light pooling at the base, behind the subjects */}
              <div className="absolute -bottom-16 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-accent-400/50 blur-2xl" />
            </div>

            {/* Keystone at the apex */}
            <div className="absolute left-1/2 top-[1.5%] h-3 w-3 -translate-x-1/2 rotate-45 border border-primary-300 bg-primary-300 sm:h-3.5 sm:w-3.5" />

            {/* The cutout slots, each figure sits in front of the arch and is
                never clipped, so the lead one can break the apex. */}
            {figures.map((figure, i) => (
              <div
                key={figure.src ?? `placeholder-${i}`}
        
                style={
                  figure.layout.center
                    ? undefined
                    : {
                        height: figure.layout.height,
                        ...(figure.layout.crop
                          ? {
                              clipPath: `inset(0 -100% ${figure.layout.crop}% -100%)`,
                              transform: `translateY(${figure.layout.crop}%)`,
                            }
                          : null),
                      }
                }
                className={
                  figure.layout.center
                    ? `absolute inset-0 flex items-center justify-center ${figure.layout.z}`
                    : `absolute inset-x-0 bottom-0 flex justify-center ${figure.layout.z}`
                }
              >
                {figure.src === '/logo.png' ? (
                  <HeroLogoCycler height={figure.layout.center ? figure.layout.height : '100%'} />
                ) : figure.src ? (
                  <img
                    src={figure.src}
                    alt={figure.alt}
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    style={figure.layout.center ? { height: figure.layout.height } : undefined}
                    // max-w-none is load-bearing: the preflight `img{max-width:100%}`
                    // would otherwise cap the figure at the arch width and letterbox it.
                    className={
                      figure.layout.center
                        ? 'hero-cutout w-auto max-w-none drop-shadow-[0_18px_28px_rgba(14,31,109,0.35)]'
                        : 'hero-cutout h-full w-auto max-w-none drop-shadow-[0_18px_28px_rgba(14,31,109,0.35)]'
                    }
                  />
                ) : (
                  /* Silhouette stand-in, drops out as soon as HERO_CUTOUTS is filled */
                  <svg
                    viewBox="0 0 300 620"
                    className="hero-cutout h-full w-auto drop-shadow-[0_18px_28px_rgba(14,31,109,0.35)]"
                    role="img"
                    aria-label="Illustration of a graduating student"
                  >
                    <defs>
                      <linearGradient id={`hero-figure-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3454e5" />
                        <stop offset="100%" stopColor="#1834b5" />
                      </linearGradient>
                    </defs>
                    <g fill={`url(#hero-figure-${i})`} stroke="#f7a730" strokeWidth="1.5">
                      <path d="M150 250 C110 250 78 282 70 330 L52 620 L248 620 L230 330 C222 282 190 250 150 250 Z" />
                      <ellipse cx="150" cy="205" rx="46" ry="54" />
                      <path d="M150 118 L232 152 L150 186 L68 152 Z" />
                    </g>
                    <path
                      d="M232 152 L236 198"
                      stroke="#f7a730"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="236" cy="204" r="7" fill="#f7a730" />
                  </svg>
                )}
              </div>
            ))}

            {/* Plinth the subject stands on */}
            <div className="absolute -bottom-px left-1/2 z-40 h-px w-[124%] -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-400 to-transparent" />

            <div className="hero-stat absolute -right-2 -top-4 z-40 hidden w-[5.5rem] rotate-6 lg:block xl:-right-8 xl:w-28">
              <img
                src="/trophy-3d-illustration_13391041.webp"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="w-full object-contain drop-shadow-[0_18px_28px_rgba(14,31,109,0.35)]"
              />
            </div>

            <div className="hero-stat absolute -left-14 top-11 z-40 hidden w-28 -rotate-6 lg:block xl:-left-28 xl:w-36">
              <img
                src="/hat-map-icon.webp"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="w-full object-contain drop-shadow-[0_18px_28px_rgba(14,31,109,0.35)]"
              />
            </div>

            <div className="hero-stat absolute -left-[4.5rem] bottom-5 z-40 hidden w-24 rotate-3 lg:block xl:-left-36 xl:w-32">
              <img
                src="/diploma-with-hat.webp"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="w-full object-contain drop-shadow-[0_18px_28px_rgba(14,31,109,0.35)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-300">Scroll</span>
        <div className="flex h-9 w-6 justify-center rounded-full border-2 border-primary-400 pt-1.5">
          <div ref={scrollIndicatorRef} className="h-1.5 w-1.5 rounded-full bg-primary-300" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
