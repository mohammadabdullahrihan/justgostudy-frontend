import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { flagUrlFor } from '../../constants/countries';
import { getDestinations } from '../../services/studyService';

/* Cycles the hero arch centerpiece: brand logo (rest) -> every active
   destination's flag -> 4 service highlights -> back to the logo. Stands
   in for the real graduate cutout photo HERO_CUTOUTS will eventually hold. */
const FALLBACK_COUNTRIES = [
  { name: 'United Kingdom' },
  { name: 'USA' },
  { name: 'Canada' },
];

// 3D renders (public/) instead of flat line icons, same illustration set
// already used on About/Success/Study-abroad — reads more premium than a
// lucide icon on a color tile.
const FEATURED_SERVICES = [
  { label: 'University Matching', image: '/hat-book-3d-illustration_13391082.webp' },
  { label: 'Visa Counseling', image: '/visa-and-ticket-3d-icon-png-download-8304615.webp' },
  { label: 'Scholarship Guidance', image: '/trophy-3d-illustration_13391041.webp' },
  { label: 'Application Assistance', image: '/pencil-red-checkmarks_69732480.webp' },
];

const LOGO_HOLD_MS = 5000;
const FLAG_HOLD_MS = 2200;
const SERVICE_HOLD_MS = 2400;

// Only this many flags show per loop; `offset` slides forward by this much
// every time the loop wraps back to the logo, so successive loops work
// through the full destination list instead of showing all of it at once.
const FLAGS_PER_LOOP = 3;

const pickWindow = (list, offset, size) => {
  if (!list.length) return [];
  const n = Math.min(size, list.length);
  return Array.from({ length: n }, (_, i) => list[(offset + i) % list.length]);
};

// w320 (not w80) since the flag now fills the card at a much larger size —
// the low-res source would look blurry stretched to that size.
const flagSrc = (country) =>
  country.code ? `https://flagcdn.com/w320/${country.code.toLowerCase()}.png` : flagUrlFor(country.name, 320);

const SLIDE_OUT_MS = 450;
const SLIDE_IN_MS = 550;

const HeroLogoCycler = ({ height }) => {
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [offset, setOffset] = useState(0);
  const [step, setStep] = useState(0);
  const slotRef = useRef(null);
  const timeoutRef = useRef(null);
  const reducedMotionRef = useRef(false);

  // Same active-destinations source DestinationsPage uses, so the cycle
  // always reflects whatever countries are actually live on the site.
  useEffect(() => {
    let ignore = false;
    getDestinations({ activeOnly: true })
      .then((res) => {
        if (ignore) return;
        const list = Array.isArray(res) ? res : res?.data || [];
        const mapped = list
          .filter((d) => d?.country)
          .map((d) => ({ name: d.country, code: d.countryCode }));
        if (mapped.length) setCountries(mapped);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  // Warms the browser cache for every flag + service illustration right
  // away, well ahead of the ~5s logo hold before the loop first reaches
  // them. Without this, each <img> only starts downloading the moment its
  // slide-in animation begins, so it visibly pops in a second or two after
  // the label text (which renders instantly).
  useEffect(() => {
    FEATURED_SERVICES.forEach(({ image }) => {
      const img = new Image();
      img.src = image;
    });
  }, []);

  useEffect(() => {
    countries.forEach((country) => {
      const img = new Image();
      img.src = flagSrc(country);
    });
  }, [countries]);

  const sequence = useMemo(
    () => [
      { type: 'logo', duration: LOGO_HOLD_MS },
      ...pickWindow(countries, offset, FLAGS_PER_LOOP).map((data) => ({
        type: 'flag',
        data,
        duration: FLAG_HOLD_MS,
      })),
      ...FEATURED_SERVICES.map((data) => ({ type: 'service', data, duration: SERVICE_HOLD_MS })),
    ],
    [countries, offset]
  );

  // The fetched country list can change length after mount, so keep `step`
  // in range rather than letting it point past the new sequence's end.
  useEffect(() => {
    setStep((s) => (s < sequence.length ? s : 0));
  }, [sequence]);

  // Right-to-left slide: tween the slot out to the left, swap its content
  // once it's off-screen, then tween the new content in from the right.
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotionRef.current) return undefined;

    const slotEl = slotRef.current;

    timeoutRef.current = setTimeout(() => {
      gsap.to(slotEl, {
        x: -60,
        opacity: 0,
        scale: 0.94,
        duration: SLIDE_OUT_MS / 1000,
        ease: 'power2.in',
        onComplete: () => {
          setStep((s) => {
            const next = (s + 1) % sequence.length;
            // Loop wrapped back to the logo: slide the flag window forward
            // so the next pass shows a different set of countries.
            if (next === 0 && countries.length) {
              setOffset((o) => (o + FLAGS_PER_LOOP) % countries.length);
            }
            return next;
          });
        },
      });
    }, sequence[step].duration);

    return () => {
      clearTimeout(timeoutRef.current);
      gsap.killTweensOf(slotEl);
    };
  }, [step, sequence, countries.length]);

  // Entrance for whatever just landed in the slot (including first mount).
  useEffect(() => {
    if (reducedMotionRef.current || !slotRef.current) return;
    gsap.fromTo(
      slotRef.current,
      { x: 60, opacity: 0, scale: 0.94 },
      { x: 0, opacity: 1, scale: 1, duration: SLIDE_IN_MS / 1000, ease: 'power3.out' }
    );
  }, [step]);

  const current = sequence[step];

  return (
    // `.hero-cutout` keeps this in the arch's one-time GSAP step-in tween;
    // the inner slot below is animated independently by this component.
    <div className="hero-cutout relative flex w-auto items-center justify-center" style={{ height }}>
      <div ref={slotRef} className="flex h-full items-center justify-center">
        {current.type === 'logo' && (
          <img
            src="/logo.png"
            alt="Just Go Study Logo"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="h-full w-auto max-w-none drop-shadow-[0_18px_28px_rgba(14,31,109,0.35)]"
          />
        )}

        {current.type === 'flag' && (
          <div className="flex w-36 flex-col items-center gap-3 sm:w-44">
            <img
              src={flagSrc(current.data)}
              alt=""
              aria-hidden="true"
              className="h-24 w-36 rounded-2xl object-cover shadow-theme-lg ring-2 ring-white/30 sm:h-28 sm:w-44"
            />
            {/* Darker navy chip (not the hero's own navy) plus a thin white
                ring so it still reads as a distinct badge, with gold text
                for the contrast/pop against it. */}
            <span className="rounded-full bg-primary-800 px-4 py-1.5 text-center text-sm font-extrabold uppercase tracking-wide text-accent-400 shadow-theme-md ring-1 ring-white/10 sm:text-base">
              {current.data.name}
            </span>
          </div>
        )}

        {current.type === 'service' && (
          // These illustrations are square with a lot of built-in padding
          // (unlike the flag photos), so they need a bigger, square box to
          // not look tiny — the old flag-shaped h-24 w-36 rectangle wasted
          // height on them.
          <div className="flex w-44 flex-col items-center gap-3 sm:w-56">
            <img
              src={current.data.image}
              alt=""
              aria-hidden="true"
              className="h-40 w-40 object-contain drop-shadow-xl sm:h-52 sm:w-52"
            />
            {/* Inverse of the flag chip (navy bg / gold text) — gold bg /
                navy text — so the two card types read as a matched pair. */}
            <span className="rounded-full bg-accent-400 px-4 py-1.5 text-center text-xs font-extrabold tracking-wide text-primary-800 shadow-theme-md ring-1 ring-white/10 sm:text-sm">
              {current.data.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroLogoCycler;
