import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Shared scroll-reveal system (see src/pages/LanguageClubHome.jsx).
 * Wrap a block with data-reveal to fade+rise it in; add
 * data-reveal-children to stagger its direct children instead.
 * data-reveal-scale fades+scales a single element in.
 */
export default function useScrollReveal(scopeRef) {
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.utils.toArray('[data-reveal]').forEach((group) => {
        const targets = group.hasAttribute('data-reveal-children') ? group.children : [group];
        gsap.set(targets, { opacity: 0, y: 32 });
        ScrollTrigger.create({
          trigger: group,
          start: 'top 85%',
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.1,
              ease: 'power3.out',
              onComplete: () => gsap.set(targets, { clearProps: 'transform' }),
            }),
        });
      });

      gsap.utils.toArray('[data-reveal-scale]').forEach((el) => {
        gsap.set(el, { opacity: 0, scale: 0.95 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 82%',
          once: true,
          onEnter: () => gsap.to(el, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }),
        });
      });
    },
    { scope: scopeRef }
  );
}
