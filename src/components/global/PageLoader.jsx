import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Module-level (not component state) so a hard page reload is the only thing
// that can make the loader play again, route changes/re-renders never do.
let hasPlayedThisLoad = false;

const PageLoader = ({ children }) => {
  const [isLoading, setIsLoading] = useState(() => !hasPlayedThisLoad);
  const rootRef = useRef(null);
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const progressFillRef = useRef(null);
  const counterRef = useRef(null);
  const curtainRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(
    () => {
      if (hasPlayedThisLoad) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        hasPlayedThisLoad = true;
        setIsLoading(false);
        return;
      }

      document.body.style.overflow = 'hidden';
      gsap.set(logoRef.current, { opacity: 0, scale: 0.8 });

      const counter = { value: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          hasPlayedThisLoad = true;
          setIsLoading(false);
        },
      });

      // 1. Logo fade + scale in
      tl.to(overlayRef.current, { opacity: 1, duration: 0.2 }, 0).to(
        logoRef.current,
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' },
        0.1
      );

      // 2. Progress bar fill + 3. counter, kept in lockstep
      tl.to(progressFillRef.current, { width: '100%', duration: 1.3, ease: 'power1.inOut' }, 0.6).to(
        counter,
        {
          value: 100,
          duration: 1.3,
          ease: 'power1.inOut',
          onUpdate: () => {
            counterRef.current.textContent = Math.round(counter.value);
          },
        },
        0.6
      );

      // 4. Curtain wipe up
      tl.to(curtainRef.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.5, ease: 'power4.inOut' }, 2.0);

      // 5. Page content reveal. contentRef wraps the entire app, so a
      // leftover inline transform here would silently break the
      // containing-block for every position:fixed element on every page
      // (headers, floating nav bars, modals) — always clearProps after.
      tl.fromTo(
        contentRef.current,
        { opacity: 0, scale: 1.03 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => gsap.set(contentRef.current, { clearProps: 'transform' }),
        },
        2.0
      );
    },
    { scope: rootRef }
  );

  // Failsafe: this overlay is `fixed inset-0 z-[9999]` over the entire app —
  // if the GSAP timeline's onComplete never fires for any reason (killed
  // mid-flight, backgrounded tab, etc.), isLoading would stay true forever
  // and silently swallow every click on the site. Force it closed after a
  // generous upper bound so a stuck loader can never brick the whole app.
  useEffect(() => {
    if (!isLoading) return undefined;
    const failsafe = setTimeout(() => {
      document.body.style.overflow = '';
      hasPlayedThisLoad = true;
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(failsafe);
  }, [isLoading]);

  return (
    <div ref={rootRef}>
      {isLoading && (
        <div ref={overlayRef} className="fixed inset-0 z-[9999] opacity-0" aria-hidden="true">
          <div
            ref={curtainRef}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800"
            style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          >
            <div ref={logoRef} className="rounded-2xl bg-white p-4 shadow-xl sm:p-5">
              <img src="/logo.png" alt="JustGo Study" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
            </div>

            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/20 sm:w-56">
              <div ref={progressFillRef} className="h-full w-0 rounded-full bg-secondary-400" />
            </div>

            <div className="flex items-baseline gap-0.5 font-outfit text-white">
              <span ref={counterRef} className="text-2xl font-semibold tabular-nums">
                0
              </span>
              <span className="text-sm text-white/70">%</span>
            </div>
          </div>
        </div>
      )}

      <div ref={contentRef}>{children}</div>
    </div>
  );
};

export default PageLoader;
