import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Shared card-grid animation system for the Courses / Universities pages.
 *
 * Cards need:
 *  - class "fx-card" and data-name="<label>" on the card root
 *  - optional ".fx-ring" child, a conic-gradient ring that spins on hover
 *    (style must define `--fx-angle` and use it in a conic-gradient)
 *  - optional ".fx-underline" SVG path (pathLength=1, dash-hidden inline)
 *    drawn out under "View Details" on hover
 *
 * Optionally pass progress refs to get a floating scroll-progress pill that
 * fills as the grid scrolls by and live-updates the current card's name.
 */
export const useCardGridFX = (scopeRef, gridRef, progress = {}, deps = []) => {
  const { barRef, fillRef, nameRef } = progress;

  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return undefined;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cards = gsap.utils.toArray(grid.querySelectorAll('.fx-card'));
      if (!cards.length) return undefined;

      /* stagger reveal */
      if (!reduceMotion) {
        gsap.set(cards, { opacity: 0, y: 50 });
        ScrollTrigger.batch(cards, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              // release the inline transform so CSS hover lifts still work
              onComplete: () => gsap.set(batch, { clearProps: 'transform' }),
            }),
        });
      }

      /* floating scroll-progress pill: fill tracks the grid, label tracks
         whichever card is crossing the viewport center */
      if (barRef?.current && fillRef?.current && nameRef?.current) {
        gsap.set(fillRef.current, { scaleX: 0, transformOrigin: 'left center' });
        gsap.to(fillRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: grid, start: 'top 60%', end: 'bottom 40%', scrub: true },
        });
        gsap.set(barRef.current, { xPercent: -50, autoAlpha: 0, y: 16 });
        ScrollTrigger.create({
          trigger: grid,
          start: 'top 60%',
          end: 'bottom 40%',
          onToggle: (self) =>
            gsap.to(barRef.current, { autoAlpha: self.isActive ? 1 : 0, y: self.isActive ? 0 : 16, duration: 0.3 }),
        });
        cards.forEach((card) => {
          ScrollTrigger.create({
            trigger: card,
            start: 'top center',
            end: 'bottom center',
            onToggle: (self) => {
              if (self.isActive && card.dataset.name) nameRef.current.textContent = card.dataset.name;
            },
          });
        });
      }

      if (reduceMotion) return undefined;

      /* hover: spin the conic ring + draw the View Details underline */
      const setCard = (card, hovered) => {
        const ring = card.querySelector('.fx-ring');
        const underline = card.querySelector('.fx-underline');
        if (ring) {
          if (!ring._spin) {
            ring._spin = gsap.to(ring, { '--fx-angle': '360deg', duration: 2.5, ease: 'none', repeat: -1, paused: true });
          }
          gsap.to(ring, { opacity: hovered ? 1 : 0, duration: 0.35 });
          if (hovered) ring._spin.play();
          else ring._spin.pause();
        }
        if (underline) {
          gsap.to(underline, {
            strokeDashoffset: hovered ? 0 : 1,
            duration: hovered ? 0.5 : 0.35,
            ease: hovered ? 'power2.out' : 'power2.in',
          });
        }
      };
      const onOver = (e) => {
        const card = e.target.closest?.('.fx-card');
        if (card && !card.contains(e.relatedTarget)) setCard(card, true);
      };
      const onOut = (e) => {
        const card = e.target.closest?.('.fx-card');
        if (card && !card.contains(e.relatedTarget)) setCard(card, false);
      };
      grid.addEventListener('mouseover', onOver);
      grid.addEventListener('mouseout', onOut);
      return () => {
        grid.removeEventListener('mouseover', onOver);
        grid.removeEventListener('mouseout', onOut);
      };
    },
    { scope: scopeRef, dependencies: deps }
  );
};

export default useCardGridFX;
