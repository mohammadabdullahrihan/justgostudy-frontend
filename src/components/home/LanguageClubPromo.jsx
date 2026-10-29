import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Languages, Trophy, Layers, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Cross-promo for Language Club (flashcards, leaderboard, exam prep) — red
 * brand theme, matching Language Club's own pages (LanguageClubHome,
 * LanguageFooter). Four shapes so the same banner doesn't repeat visually
 * everywhere it's dropped:
 *   - "lg"   full hero card (Home, Study Abroad landing)
 *   - "wide" slim full-width strip (listing pages — Destinations, Universities, Courses)
 *   - "sm"   compact card (narrower content columns — a country guide tab)
 *   - "mini" tiny sidebar chip (SidebarHelpCard-style slots)
 */
const LanguageClubPromo = ({ variant = 'lg' }) => {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from(ref.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      });
    },
    { scope: ref }
  );

  if (variant === 'mini') {
    return (
      <Link
        ref={ref}
        to="/language-club"
        className="group flex items-center gap-3 rounded-2xl border border-red-400/20 bg-gradient-to-br from-red-500 to-red-700 p-4 text-white shadow-theme-sm transition-all hover:-translate-y-0.5 hover:shadow-theme-md"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Languages className="h-4.5 w-4.5 text-white" />
        </span>
        <span className="flex-1 text-sm font-bold leading-snug">Join Language Club, free</span>
        <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
      </Link>
    );
  }

  if (variant === 'wide') {
    return (
      <div
        ref={ref}
        className="flex flex-col items-center gap-4 rounded-2xl border border-red-400/20 bg-gradient-to-r from-red-500 to-red-700 px-6 py-5 text-center text-white shadow-theme-sm sm:flex-row sm:justify-between sm:text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Languages className="h-5 w-5 text-white" />
          </span>
          <p className="font-outfit text-base font-bold sm:text-lg">
            Prepping for your move? Join Language Club, free.
          </p>
        </div>
        <Link
          to="/language-club"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-red-600 shadow-theme-sm transition-all duration-200 hover:bg-red-50"
        >
          Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  if (variant === 'sm') {
    return (
      <div
        ref={ref}
        className="rounded-2xl border border-red-400/20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-6 text-white shadow-theme-sm"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
          <Languages className="h-5 w-5 text-white" />
        </span>
        <h3 className="mt-4 font-outfit text-lg font-bold leading-snug">
          Prepping for your move? Join Language Club, free.
        </h3>
        <p className="mt-1 text-sm text-red-100">Flashcards, leaderboard, and IELTS/PTE/TOEFL prep.</p>
        <Link
          to="/language-club"
          className="group mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-red-600 shadow-theme-sm transition-all duration-200 hover:bg-red-50"
        >
          Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  // "lg" (default) — full hero card
  return (
    <section className="bg-cream-50 px-4 py-10 sm:px-6 lg:px-8">
      <div
        ref={ref}
        className="mx-auto flex max-w-7xl flex-col items-center gap-6 rounded-[28px] border border-red-400/20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-8 text-center text-white shadow-theme-md sm:flex-row sm:justify-between sm:text-left"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Languages className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="font-outfit text-xl font-bold sm:text-2xl">Prepping for your move? Join Language Club, free.</h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-red-100">
              <span className="inline-flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-white" /> Flashcards</span>
              <span className="inline-flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-white" /> Leaderboard</span>
              <span>+ IELTS/PTE/TOEFL prep</span>
            </p>
          </div>
        </div>
        <Link
          to="/language-club"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-red-600 shadow-theme-md transition-all duration-200 hover:bg-red-50"
        >
          Explore Language Club
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default LanguageClubPromo;
