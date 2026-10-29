import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Site-wide smooth scroll (Lenis) synced with GSAP ScrollTrigger.
// Mounted once from App; `enabled` toggles it off for dashboard/auth shells,
// which scroll inside their own containers and must keep native behavior.
// The instance is exposed as `window.lenis` so ScrollToTop (route changes)
// and the Navbar can drive/read the same scroller.
const SmoothScroll = ({ enabled = true }) => {
  useEffect(() => {
    if (!enabled) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    window.lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // Lenis drives the frame loop; lag smoothing would fight it on slow frames.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      if (window.lenis === lenis) window.lenis = null;
      ScrollTrigger.refresh();
    };
  }, [enabled]);

  return null;
};

export default SmoothScroll;
