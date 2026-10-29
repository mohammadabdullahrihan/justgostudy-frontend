import { useReducedMotion } from 'framer-motion';

// Public pages: curtain wipe via clip-path (rises to reveal on enter, falls
// to cover on exit). Pure Framer Motion, no GSAP on this element, per the
// "don't animate the same node with two libraries" rule.
export const curtainVariants = {
  initial: { clipPath: 'inset(100% 0 0 0)' },
  animate: { clipPath: 'inset(0% 0 0 0)', transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } },
  exit: { clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } },
};

// Dashboard pages: simple fade + scale, kept short since staff navigate
// between these frequently.
export const dashboardVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } },
};

const REDUCED_MOTION_VARIANTS = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 1, transition: { duration: 0 } },
};

export function usePageVariants(isDashboard) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return REDUCED_MOTION_VARIANTS;
  return isDashboard ? dashboardVariants : curtainVariants;
}
