// Shared colour sets for the PromoCard family (ScholarshipPromoBanner,
// CostCalculatorPromoBanner, ...) — one object per card so every instance
// stays visually distinct without re-typing the same four Tailwind classes.
export const PROMO_TINTS = {
  accent: {
    border: 'border-accent-200',
    wash: 'bg-gradient-to-r from-accent-50 to-accent-100/60',
    bg: 'bg-accent-500',
    icon: 'text-accent-600',
    ring: 'ring-4 ring-accent-50',
  },
  primary: {
    border: 'border-primary-200',
    wash: 'bg-gradient-to-r from-primary-50 to-primary-100/60',
    bg: 'bg-primary-600',
    icon: 'text-primary-600',
    ring: 'ring-4 ring-primary-50',
  },
  secondary: {
    border: 'border-secondary-200',
    wash: 'bg-gradient-to-r from-secondary-50 to-secondary-100/60',
    bg: 'bg-secondary-600',
    icon: 'text-secondary-600',
    ring: 'ring-4 ring-secondary-50',
  },
  coral: {
    border: 'border-coral-200',
    wash: 'bg-gradient-to-r from-coral-50 to-coral-100/60',
    bg: 'bg-coral-500',
    icon: 'text-coral-600',
    ring: 'ring-4 ring-coral-50',
  },
  ink: {
    border: 'border-ink-200',
    wash: 'bg-gradient-to-r from-ink-50 to-ink-100/60',
    bg: 'bg-ink-700',
    icon: 'text-ink-700',
    ring: 'ring-4 ring-ink-50',
  },
};
