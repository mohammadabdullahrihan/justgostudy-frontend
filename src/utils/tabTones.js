// Single source of truth for the "cycle primary/secondary/accent across
// list-rendered cards" pattern used throughout the country detail page
// (Overview, Scholarships, Careers, Visa, Bangladeshis, Universities, Hero,
// At-a-Glance). Previously each tab redefined its own copy of this and they
// had already drifted (accent icon text 700 vs 600, missing hover states) —
// import from here instead of adding another local array.

// Icon-badge cards: Why-Study-Here, Scholarships, Careers, Visa checklist/types.
export const PANEL_TONES = [
  { bg: 'bg-primary-50/60', border: 'border-primary-100', hoverBorder: 'hover:border-primary-300', iconBg: 'bg-primary-100', iconBgHover: 'group-hover:bg-primary-200', iconText: 'text-primary-600' },
  { bg: 'bg-secondary-50/60', border: 'border-secondary-100', hoverBorder: 'hover:border-secondary-300', iconBg: 'bg-secondary-100', iconBgHover: 'group-hover:bg-secondary-200', iconText: 'text-secondary-600' },
  { bg: 'bg-accent-50/60', border: 'border-accent-100', hoverBorder: 'hover:border-accent-300', iconBg: 'bg-accent-100', iconBgHover: 'group-hover:bg-accent-200', iconText: 'text-accent-700' },
];
export const getPanelTone = (idx) => PANEL_TONES[idx % PANEL_TONES.length];

// University cards: gradient logo badge + rank chip (Overview + Universities tabs).
export const LOGO_TONES = [
  { logoBg: 'bg-gradient-to-br from-primary-500 to-primary-700', chipBg: 'bg-primary-50', chipText: 'text-primary-600', hoverBorder: 'hover:border-primary-200' },
  { logoBg: 'bg-gradient-to-br from-secondary-500 to-secondary-700', chipBg: 'bg-secondary-50', chipText: 'text-secondary-600', hoverBorder: 'hover:border-secondary-200' },
  { logoBg: 'bg-gradient-to-br from-accent-400 to-accent-600', chipBg: 'bg-accent-50', chipText: 'text-accent-700', hoverBorder: 'hover:border-accent-200' },
];
export const getLogoTone = (idx) => LOGO_TONES[idx % LOGO_TONES.length];

// Hero stat strip (Universities / Programs / Students Abroad counters).
export const STAT_TONES = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600' },
  secondary: { bg: 'bg-secondary-50', text: 'text-secondary-600' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
};

// At-a-Glance quick-info rows (Currency / Language / Climate / Time Zone).
export const QUICK_INFO_TONES = [
  { iconBg: 'bg-primary-100', iconText: 'text-primary-600' },
  { iconBg: 'bg-secondary-100', iconText: 'text-secondary-600' },
  { iconBg: 'bg-accent-100', iconText: 'text-accent-700' },
  { iconBg: 'bg-ink-100', iconText: 'text-ink-700' },
];
