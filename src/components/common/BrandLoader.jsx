import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Sits directly on the page's own (usually white) background instead of a
// solid color card — a navy block popping up mid-page reads as jarring, this
// is meant to feel like a lightweight in-place cue instead.
//
// Deliberately no visible "LOADING" caption — a spinning two-tone ring with
// wide-tracked uppercase text under it is the single most recognizable
// generic/AI-template loader shape, and was called out as such. The logo
// itself breathing + a navy-to-gold gradient arc sweeping around it is the
// actual brand cue; `message` still drives the a11y label for screen
// readers even with nothing printed on screen.
const BrandLoader = ({ message = 'Loading', className = '' }) => {
  const arcRef = useRef(null);
  const markRef = useRef(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.to(arcRef.current, { rotate: 360, duration: 1.4, repeat: -1, ease: 'power1.inOut', transformOrigin: '50% 50%' });
    gsap.to(markRef.current, { scale: 1.05, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }, []);

  return (
    <div
      role="status"
      aria-label={message}
      className={`flex min-h-[60vh] w-full items-center justify-center ${className}`}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg ref={arcRef} viewBox="0 0 80 80" className="absolute inset-0 h-full w-full">
          <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="3" className="text-cream-200" />
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            stroke="url(#brandLoaderArc)"
            strokeDasharray="220"
            strokeDashoffset="150"
          />
          <defs>
            <linearGradient id="brandLoaderArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0e1f6d" />
              <stop offset="100%" stopColor="#f7a730" />
            </linearGradient>
          </defs>
        </svg>
        <div ref={markRef} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-theme-md">
          <img src="/logo.png" alt="JustGo Study" className="h-8 w-8 object-contain" />
        </div>
      </div>
    </div>
  );
};

export default BrandLoader;
