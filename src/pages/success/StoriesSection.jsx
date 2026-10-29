import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Portrait for the active story. Owns its own error state (reset via `key` on
// the parent) so one broken DB image URL falls back to initials without
// affecting the other slides.
const StudentPhoto = ({ name, image }) => {
  const [errored, setErrored] = useState(false);
  const showImg = image && !image.includes('placehold.co') && !errored;

  return (
    <div className="relative aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-2xl bg-white shadow-theme-lg ring-1 ring-white/10">
      {showImg ? (
        <img loading="lazy" decoding="async"
          src={image}
          alt={name}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-outfit text-7xl font-bold text-primary-600/70">
          {name?.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

const AUTO_ADVANCE_INTERVAL = 6000;

const StoriesSection = ({ testimonials }) => {
  const sectionRef = useRef(null);
  const isTransitioning = useRef(false);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchParams] = useSearchParams();
  const requestedCountry = searchParams.get('country');
  const [activeCountry, setActiveCountry] = useState(requestedCountry || 'All');

  const countries = useMemo(
    () => ['All', ...new Set(testimonials.map((t) => t.country).filter(Boolean))],
    [testimonials]
  );

  // A testimonial card on the homepage can deep-link here with ?country=X — once
  // the real testimonials load, snap to that country (if it actually has any
  // stories) and scroll the section into view so the link lands somewhere useful.
  useEffect(() => {
    if (!requestedCountry || !testimonials.length) return;
    if (countries.includes(requestedCountry)) {
      setActiveCountry(requestedCountry);
      setIndex(0);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedCountry, testimonials.length]);

  const filtered = useMemo(
    () => (activeCountry === 'All' ? testimonials : testimonials.filter((t) => t.country === activeCountry)),
    [testimonials, activeCountry]
  );

  const count = filtered.length;
  const safeIndex = count ? index % count : 0;
  const active = filtered[safeIndex];

  const handleFilterChange = (country) => {
    setActiveCountry(country);
    setIndex(0);
  };

  // Two-phase crossfade: fade the current slide out, swap the index only
  // once it's invisible, then the fade-in effect below brings the new one
  // in. Swapping content while still fully opaque is what read as a "blink".
  const go = (dir) => {
    if (count < 2 || isTransitioning.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setIndex((prev) => (prev + dir + count) % count);
      return;
    }

    isTransitioning.current = true;
    gsap.to(sectionRef.current.querySelectorAll('.tm-fade'), {
      opacity: 0,
      y: -16,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power2.in',
      onComplete: () => setIndex((prev) => (prev + dir + count) % count),
    });
  };

  // Auto-advance to the next story; pauses on hover and resets whenever the
  // slide changes (manual or automatic) so the interval stays consistent.
  useEffect(() => {
    if (count < 2 || isPaused) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const timer = setInterval(() => go(1), AUTO_ADVANCE_INTERVAL);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, isPaused, safeIndex]);

  // Re-run on every slide change: fade the photo, quote and attribution in.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.fromTo(
        '.tm-fade',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power2.out',
          onComplete: () => {
            isTransitioning.current = false;
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [safeIndex] }
  );

  if (!count || !active) return null;

  const name = active.studentName || active.name;
  const role = active.university || active.country;
  const quote = active.quote || active.content;

  return (
    <section id="stories" ref={sectionRef} className="bg-primary-800 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-[minmax(0,340px)_1fr]">
          {/* LEFT COLUMN, label, intro, portrait */}
          <div className="flex flex-col lg:border-r lg:border-white/10 lg:pr-10">
            <div className="flex items-baseline gap-3">
              <span className="font-outfit text-sm font-medium text-primary-300">[04]</span>
              <span className="text-sm font-semibold tracking-wide text-primary-100">What Students Say</span>
            </div>

            <p className="mt-8 max-w-xs text-base leading-relaxed text-primary-100">
              Honest reflections from Bangladeshi students we&rsquo;ve guided &mdash; from the first
              counselling session all the way to campus abroad.
            </p>

            {countries.length > 2 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => handleFilterChange(country)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                      activeCountry === country
                        ? 'border-accent-400 bg-accent-400 text-ink-900'
                        : 'border-white/15 text-primary-100 hover:border-accent-300 hover:text-accent-300'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            )}

            <div className="tm-fade mt-10 lg:mt-auto lg:pt-10" key={`photo-${safeIndex}`}>
              <StudentPhoto name={name} image={active.image} />
            </div>
          </div>

          {/* RIGHT COLUMN, headline, quote, attribution + controls */}
          <div className="flex flex-col lg:pl-12">
            <h2 className="font-outfit text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              What They
              <br />
              Say <span className="text-accent-400">About Us</span>
            </h2>

            <blockquote className="tm-fade mt-10 border-t border-white/10 pt-10 font-outfit text-2xl font-medium leading-snug text-white sm:text-3xl lg:mt-12 lg:text-[2.15rem]">
              &ldquo;{quote}&rdquo;
            </blockquote>

            <div className="mt-auto flex items-end justify-between gap-6 border-t border-white/10 pt-6 lg:mt-16">
              <div className="tm-fade">
                <div className="font-outfit text-xl font-bold text-white sm:text-2xl">{name}</div>
                <div className="mt-1 text-sm text-accent-400 sm:text-base">{role}</div>
              </div>

              <div
                className="flex shrink-0 items-center gap-4"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <span className="hidden font-outfit text-sm tabular-nums text-primary-300 sm:inline">
                  {String(safeIndex + 1).padStart(2, '0')}
                  <span className="mx-1 text-primary-500">/</span>
                  {String(count).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous story"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white transition-colors hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next story"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-400 text-ink-900 transition-colors hover:bg-accent-300"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoriesSection;
