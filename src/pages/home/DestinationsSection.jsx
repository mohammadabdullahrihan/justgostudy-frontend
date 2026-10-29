import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe2,
  X,
  GraduationCap,
  Briefcase,
  Users,
  Heart,
  Award,
  ShieldCheck,
  Zap,
  Star,
} from 'lucide-react';
import * as studyService from '../../services/studyService';
import { flagSvgUrlFor } from '../../constants/countries';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Same icon map as the destination detail page's "Why Study Here" section
// (src/pages/country/OverviewSection.jsx) — reusing it here so the two
// spots stay visually/semantically consistent for the same underlying
// `whyStudyHere` field.
const WHY_ICONS = { GraduationCap, Briefcase, Users, Heart, Award, ShieldCheck, Zap, Star };

// `span` is the desktop (lg+) bento placement — a 3-column, 2-row grid,
// symmetric-framed: USA sits centered and tall, the other 4 sit evenly at
// its four corners.
//   UK (top-left)    | USA (center, tall) | Australia (top-right)
//   Canada (bot-left) | (USA continues)    | New Zealand (bot-right)
// Below lg every card is a uniform stacked tile.
// `focus` is the object-position crop point, tuned per photo by hand so the
// actual landmark stays in frame instead of a generic center-crop cutting
// it off — e.g. New Zealand's source photo is 55% sky, so a center crop
// would show mostly cloud; `focus` pulls the crop down to the mountains/lake.
const HERO_DESTINATIONS = [
  { country: 'USA', image: '/usa.webp', span: 'lg:col-start-2 lg:row-start-1 lg:row-span-2', focus: '50% 35%' },
  { country: 'UK', image: '/uk.webp', span: 'lg:col-start-1 lg:row-start-1', focus: '50% 45%' },
  { country: 'Australia', image: '/australia.webp', span: 'lg:col-start-3 lg:row-start-1', focus: '50% 25%' },
  { country: 'Canada', image: '/canada.webp', span: 'lg:col-start-1 lg:row-start-2', focus: '50% 50%' },
  { country: 'New Zealand', image: '/newzealand.webp', span: 'lg:col-start-3 lg:row-start-2', focus: '50% 85%' },
];

const norm = (value) => (value || '').trim().toLowerCase();

// Pure photo tile — no caption, no overlay, nothing fighting the image for
// attention. Name/description live in the lightbox instead (see below),
// opened by clicking the tile.
const DestinationTile = ({ dest, image, span, focus, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    // bg-primary-800 (not cream-100) as the pre-image placeholder, so a
    // not-yet-loaded tile reads as "part of the navy card" instead of a
    // stray light box. Gold ring is the "brand gold touch in the bento
    // grid" — faint at rest, brightens on hover instead of the old plain
    // shadow-only hover.
    className={`group relative h-[240px] w-full overflow-hidden rounded-3xl bg-primary-800 shadow-theme-sm ring-1 ring-accent-400/0 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-theme-lg hover:ring-accent-400/50 lg:h-full ${span || ''}`}
  >
    <img
      src={image}
      alt={dest.country}
      loading="lazy"
      decoding="async"
      style={{ objectPosition: focus }}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
    />
    {/* Just enough of a bottom scrim to keep the flag chip legible over any
        photo — not a text caption, so it stays a sliver, not a band. */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-950/50 to-transparent" />
    <div className="absolute bottom-3 left-3 h-6 w-9 overflow-hidden rounded-md border border-accent-300/60 shadow-theme-sm">
      <img src={flagSvgUrlFor(dest.country)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </div>
  </button>
);

const DestinationsSection = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lightbox is always mounted (never conditionally removed) so GSAP can
  // fully own its open/close animation, including the closing tween —
  // conditional-rendering it (the framer-motion way) would rip it out of
  // the DOM before a GSAP exit tween ever got to play. `openIndex` is the
  // source of truth for "is it open"; `visible` just keeps it mounted a
  // moment longer while the close tween finishes.
  const [openIndex, setOpenIndex] = useState(null);
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState(1);

  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const dragState = useRef({ startX: 0, dragging: false });
  // Distinguishes "first open" (bounce in) from "navigated to a new
  // country" (slide) inside the single openIndex-driven effect below.
  const firstOpenRef = useRef(true);

  useEffect(() => {
    let ignore = false;
    studyService
      .getDestinations({ activeOnly: 'true' })
      .then((res) => {
        if (ignore) return;
        const list = Array.isArray(res) ? res : (res?.data || []);
        setDestinations(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Match the curated HERO_DESTINATIONS list against whatever's actually
  // live in the DB — a country missing from the DB (or not yet active) is
  // simply skipped rather than rendered with fake data.
  const shown = HERO_DESTINATIONS.map(({ country, image, span, focus }) => {
    const dest = destinations.find((d) => norm(d.country) === norm(country));
    return dest ? { dest, image, span, focus } : null;
  }).filter(Boolean);

  useGSAP(
    () => {
      if (!gridRef.current?.children.length) return;
      const cards = gsap.utils.toArray(gridRef.current.children);
      gsap.set(cards, { opacity: 0, y: 24 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        onComplete: () => gsap.set(cards, { clearProps: 'transform' }),
      });
    },
    { scope: sectionRef, dependencies: [shown.length] }
  );

  const openLightbox = (index) => {
    setDirection(1);
    setOpenIndex(index);
    setVisible(true);
  };

  const closeLightbox = () => {
    if (!overlayRef.current || !panelRef.current) {
      setOpenIndex(null);
      firstOpenRef.current = true;
      return;
    }
    gsap.to(panelRef.current, { opacity: 0, scale: 0.92, y: 12, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setVisible(false);
        setOpenIndex(null);
        firstOpenRef.current = true;
      },
    });
  };

  // Two-phase transition: the WHOLE card (panelRef — the entire white
  // rounded box, not just the text/image inside it) slides/fades OUT
  // first, then (only once it's fully gone) the state swaps to the new
  // country and the "enter" tween below slides the whole card back IN from
  // the opposite side — a real directional swipe of the card itself.
  const swapTo = (index, dir) => {
    if (openIndex === null || index === openIndex) return;
    if (!panelRef.current) {
      setDirection(dir);
      setOpenIndex(index);
      return;
    }
    gsap.to(panelRef.current, {
      opacity: 0,
      x: -dir * 80,
      scale: 0.96,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setDirection(dir);
        setOpenIndex(index);
      },
    });
  };

  const move = (dir) => {
    if (openIndex === null) return;
    swapTo((openIndex + dir + shown.length) % shown.length, dir);
  };

  const goTo = (index) => {
    if (openIndex === null) return;
    swapTo(index, index > openIndex ? 1 : -1);
  };

  // GSAP entrance for the overlay — only fires when it first opens.
  useGSAP(
    () => {
      if (!visible || !overlayRef.current) return;
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    },
    { dependencies: [visible] }
  );

  // GSAP for the whole card (panelRef — the entire white rounded box, not
  // just its inner text/image): a bouncier pop-in the very first time it
  // opens, and a directional slide every time the country changes after
  // that (prev/next, dot click, swipe release, or arrow keys — all funnel
  // through `move`/`goTo`/`swapTo` above). One effect, not two, so they
  // never fight over the same opacity/scale properties on first open.
  //
  // Three layers move as one timeline, not one flat block: the card itself
  // slides in first, the photo settles from a slight zoom (a small
  // Ken Burns move, not a hard cut), and the text/stats/button cascade in
  // with a short stagger just after — each layer overlapping the previous
  // (negative offsets) so it reads as one continuous, considered motion
  // instead of three separate animations. `expo.out` on the card is a
  // sharper, more "designed" deceleration than the default `power3.out`.
  useGSAP(
    () => {
      if (openIndex === null || !panelRef.current) return;
      const isFirstOpen = firstOpenRef.current;
      firstOpenRef.current = false;

      const image = panelRef.current.querySelector('.js-reveal-image');
      const items = panelRef.current.querySelectorAll('.js-reveal-item');
      const tl = gsap.timeline();

      if (isFirstOpen) {
        tl.fromTo(
          panelRef.current,
          { opacity: 0, scale: 0.92, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }
        );
      } else {
        tl.fromTo(
          panelRef.current,
          { opacity: 0, x: direction * 80, scale: 0.96 },
          { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: 'expo.out' }
        );
      }

      if (image) {
        tl.fromTo(
          image,
          { scale: 1.12, opacity: 0.5 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out' },
          isFirstOpen ? '-=0.3' : '-=0.4'
        );
      }
      if (items.length) {
        tl.fromTo(
          items,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' },
          isFirstOpen ? '-=0.25' : '-=0.35'
        );
      }
    },
    { dependencies: [openIndex] }
  );

  // Escape/arrow keys + body-scroll lock while the lightbox is up.
  useEffect(() => {
    if (openIndex === null) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, shown.length]);

  // Drag-to-swipe: GSAP tracks the pointer directly (no library). The
  // whole card (panelRef) follows the finger 1:1 while dragging — same
  // element the click/keyboard navigation slides — then either completes
  // the swipe (past the threshold) or snaps back.
  const onPointerDown = (e) => {
    dragState.current = { startX: e.clientX, dragging: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragState.current.dragging || !panelRef.current) return;
    const dx = e.clientX - dragState.current.startX;
    gsap.set(panelRef.current, { x: dx });
  };
  const onPointerUp = (e) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    dragState.current.dragging = false;
    if (Math.abs(dx) > 80) {
      // Reset the drag offset immediately (no tween) — swapTo's own exit
      // tween takes over the card's motion from here, so it must start
      // clean at x:0 instead of carrying the drag offset into it.
      gsap.set(panelRef.current, { x: 0 });
      move(dx < 0 ? 1 : -1);
    } else {
      gsap.to(panelRef.current, { x: 0, duration: 0.3, ease: 'power2.out' });
    }
  };

  if (!loading && shown.length === 0) return null;

  const current = openIndex !== null ? shown[openIndex] : null;

  // Real, admin-entered numbers only — a field left at its schema default
  // (0 / unset) is skipped rather than shown as "$0" or "0 universities".
  // Raw "Universities" count and "Avg. tuition/yr" were dropped in favor of
  // a set that's both more distinctive (Students Abroad is a warmer,
  // social-proof number) and fully reliable for every hero destination —
  // tuition/university-count stay on the destination detail page. Each
  // stat also carries a `tone` so the grid alternates brand navy/gold
  // instead of reading as one flat block.
  const currentStats = current
    ? [
        current.dest.studentCount && {
          label: 'Students Abroad',
          value: current.dest.studentCount,
          tone: 'primary',
        },
        current.dest.avgLivingCost > 0 && {
          label: 'Avg. living/yr',
          value: `${current.dest.currency || 'USD'} ${current.dest.avgLivingCost.toLocaleString()}`,
          tone: 'primary',
        },
        current.dest.visaFee > 0 && {
          label: 'Visa fee',
          value: `${current.dest.currency || 'USD'} ${current.dest.visaFee.toLocaleString()}`,
          tone: 'accent',
        },
        // Bangladeshi-specific visa outcome — matches this section's own
        // subhead promise ("...and visa outcomes") when an admin has set it.
        current.dest.bangladeshiDetails?.visaSuccessRate && {
          label: 'Visa success rate',
          value: current.dest.bangladeshiDetails.visaSuccessRate,
          tone: 'accent',
        },
      ].filter(Boolean)
    : [];

  return (
    // bg-cream-50 + two 30%-opacity blur-3xl orbs is the exact background
    // recipe every other homepage section uses (HowWeHelpSection,
    // ToolsTeaserSection, WhyChooseSection, UniversitySection, ...) — this
    // section was the odd one out with a full navy background, which read
    // as inconsistent against its neighbors. Brand navy now lives inside a
    // contained panel below (same pattern HowWeHelpSection uses for its
    // navy featured card), not as the page-width background.
    <section ref={sectionRef} className="relative overflow-hidden bg-cream-50 py-20 sm:py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100 opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-accent-100 opacity-30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary-600">
            <Globe2 className="h-3.5 w-3.5" /> Destinations
          </span>
          <h2 className="mt-3 font-outfit text-4xl font-bold text-ink-900 sm:text-5xl">
            Where Are You <span className="text-accent-500">Headed</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-500">
            Tap a country for the numbers that matter — tuition, living costs, and real visa outcomes for Bangladeshi students.
          </p>
        </div>

        {/* Brand navy as one contained panel (rounded-[2.5rem], border-white/10,
            shadow-theme-md) around the whole bento grid — same treatment
            HowWeHelpSection uses for its featured card. A faint gold ring frames
            the panel itself (the "brand gold touch"), and each tile gets a
            gold ring only on hover — restrained accents instead of the
            earlier solid-gold grid lines, which is what read as "not
            premium" next to the rest of the homepage. Gaps between tiles
            are just the panel's own navy showing through — no extra color
            needed there. */}
        {loading ? (
          <div className="rounded-[2.5rem] border border-white/10 bg-primary-600 p-4 shadow-theme-md ring-1 ring-accent-400/20 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 lg:auto-rows-[240px]">
              {HERO_DESTINATIONS.map(({ country, span }) => (
                <div
                  key={country}
                  className={`h-[240px] animate-pulse rounded-3xl bg-white/10 lg:h-full ${span}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-white/10 bg-primary-600 p-4 shadow-theme-md ring-1 ring-accent-400/20 sm:p-6">
            <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 lg:auto-rows-[240px]">
              {shown.map(({ dest, image, span, focus }, i) => (
                <DestinationTile
                  key={dest._id}
                  dest={dest}
                  image={image}
                  span={span}
                  focus={focus}
                  onOpen={() => openLightbox(i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Same gold-button recipe as WhyChooseSection/StudyAbroadCTA's CTAs
            (bg-accent-400 + text-ink-900 + shadow-accent-400/30 + lift on
            hover) instead of a one-off accent-500/primary-950 combo, so
            every "go look at more" button on the homepage matches. */}
        <div className="mt-12 text-center">
          <Link
            to="/study-abroad/destinations"
            className="group inline-flex items-center gap-2 rounded-full bg-accent-400 px-7 py-3.5 text-sm font-bold text-ink-900 shadow-theme-lg shadow-accent-400/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-300"
          >
            View All Destinations
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Lightbox — click a tile to open, swipe/drag or arrows to browse
          the other 4 countries, X / backdrop click / Escape to close.
          Stays mounted (invisible + non-interactive) while closed so its
          GSAP open/close tweens have a real element to animate. */}
      {visible && current && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/85 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              move(-1);
            }}
            aria-label="Previous destination"
            className="absolute left-2 top-1/2 flex h-11 w-11 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              move(1);
            }}
            aria-label="Next destination"
            className="absolute right-2 top-1/2 flex h-11 w-11 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* grid + place-items-center (not flex items-center) so an
              overlay taller than the viewport stays scrollable to its very
              top — flex centering clips the overflowing edge instead of
              letting you scroll to it. py-10 keeps the panel off the
              close/nav buttons when it's short enough to center. */}
          <div className="grid min-h-full place-items-center p-4 py-10" onClick={closeLightbox}>
            <div
              ref={panelRef}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-theme-lg"
            >
              <div className="flex flex-col sm:flex-row">
                <div
                  className="relative h-64 shrink-0 touch-pan-y overflow-hidden sm:h-auto sm:w-2/5"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                >
                  <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
                    <img
                      src={current.image}
                      alt=""
                      draggable={false}
                      style={{ objectPosition: current.focus }}
                      className="js-reveal-image pointer-events-none h-full w-full select-none object-cover"
                    />
                  </div>
                </div>
                {/* No internal scroll here on purpose — the whole overlay
                    scrolls as one (see the grid wrapper above) instead of
                    trapping this column in its own little scrollbox. Flat
                    primary-600 — the recognizable brand navy (see
                    design-system conventions) — not the gradient variant;
                    user wanted a solid navy card, not a fade. Two soft glow
                    orbs still add depth the same way page-hero sections do
                    (blur-2xl, not blur-3xl — kept light for older
                    hardware). */}
                <div className="relative flex flex-1 flex-col bg-primary-600 p-6 sm:p-10">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-400/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5 blur-2xl" />

                  <div className="js-reveal-item relative h-7 w-11 overflow-hidden rounded-md border border-accent-300/60 shadow-theme-sm">
                    <img src={flagSvgUrlFor(current.dest.country)} alt="" className="h-full w-full object-cover" draggable={false} />
                  </div>
                  <h3 className="js-reveal-item relative mt-4 font-outfit text-3xl font-bold leading-tight text-white sm:text-4xl">
                    {current.dest.country}
                  </h3>
                  {current.dest.description && (
                    <p className="js-reveal-item relative mt-3 text-[15px] leading-relaxed text-white/75">
                      {current.dest.description}
                    </p>
                  )}

                  {/* Same `whyStudyHere` field the destination detail page's
                      "Why Study Here" section renders (see
                      src/pages/country/OverviewSection.jsx) — pulled in here
                      so the quick-preview card carries real substance
                      instead of just the one description paragraph.
                      Glassmorphic badges (bg-white/10 + ring) match the icon
                      treatment used on other navy brand surfaces (e.g.
                      ToolsPage cards). */}
                  {current.dest.whyStudyHere?.length > 0 && (
                    <div className="js-reveal-item relative mt-5 space-y-3">
                      {current.dest.whyStudyHere.slice(0, 2).map((item, idx) => {
                        const Icon = WHY_ICONS[item.icon] || GraduationCap;
                        // Alternate white/gold icon tint per badge — same
                        // "vary only the icon tint" treatment used on
                        // ToolsPage cards, so the two highlights don't read
                        // as one flat block.
                        const isGold = idx % 2 === 1;
                        return (
                          <div key={item.title} className="flex items-start gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm ${
                                isGold ? 'text-accent-300' : 'text-white'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold leading-snug text-white">{item.title}</p>
                              {item.desc && <p className="text-xs leading-relaxed text-white/60">{item.desc}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentStats.length > 0 && (
                    <div className="js-reveal-item relative mt-5 grid grid-cols-2 gap-3">
                      {currentStats.map((stat) => (
                        <div
                          key={stat.label}
                          className={`rounded-xl px-3 py-2.5 ring-1 ${
                            stat.tone === 'accent' ? 'bg-accent-400/15 ring-accent-300/30' : 'bg-white/10 ring-white/15'
                          }`}
                        >
                          <p
                            className={`font-outfit text-base font-bold leading-none ${
                              stat.tone === 'accent' ? 'text-accent-300' : 'text-white'
                            }`}
                          >
                            {stat.value}
                          </p>
                          <p
                            className={`mt-1 text-[11px] font-semibold uppercase tracking-wide ${
                              stat.tone === 'accent' ? 'text-accent-200/80' : 'text-white/60'
                            }`}
                          >
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    to={`/study-abroad/destination/${encodeURIComponent(current.dest.country)}`}
                    className="js-reveal-item relative mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-primary-950 shadow-md shadow-accent-900/30 transition-colors hover:bg-accent-400"
                  >
                    Learn More <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* dot indicators */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-6">
            {shown.map((s, i) => (
              <button
                key={s.dest._id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(i);
                }}
                aria-label={`Go to ${s.dest.country}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === openIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default DestinationsSection;
