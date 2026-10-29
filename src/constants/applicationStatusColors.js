export const APPLICATION_STATUS_COLORS = {
  pending: 'bg-accent-50 text-accent-600 border-accent-200',
  under_review: 'bg-primary-50 text-primary-600 border-primary-200',
  accepted: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  rejected: 'bg-rose-50 text-rose-600 border-rose-200',
  visa_applied: 'bg-coral-50 text-coral-600 border-coral-200',
  visa_approved: 'bg-secondary-100 text-secondary-700 border-secondary-300',
  departed: 'bg-ink-100 text-ink-600 border-ink-200',
};

// Solid dot color to pair with the pill above (StatusBadge) — same hue family,
// just the -500/-600 solid instead of the -50 tint.
export const APPLICATION_STATUS_DOT_COLORS = {
  pending: 'bg-accent-500',
  under_review: 'bg-primary-500',
  accepted: 'bg-secondary-500',
  rejected: 'bg-rose-500',
  visa_applied: 'bg-coral-500',
  visa_approved: 'bg-secondary-700',
  departed: 'bg-ink-400',
};

// Ordered stages for the student "Journey Timeline" — rejected is a separate
// terminal branch, not part of this linear progression.
export const APPLICATION_JOURNEY_STAGES = [
  { key: 'pending', label: 'Applied' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'visa_applied', label: 'Visa Applied' },
  { key: 'visa_approved', label: 'Visa Approved' },
  { key: 'departed', label: 'Departed' },
];
