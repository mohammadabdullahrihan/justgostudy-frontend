import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Generic cross-sell card family — one visual language (white image box +
// coloured icon badge + title/subtitle + arrow), stretched or shrunk to fit
// wherever it's dropped: a full-width banner on a details page (size="lg"),
// the default inline teaser (size="md"), or a tight sidebar slot (size="sm").
// `orientation="column"` stacks image-above-text instead of side-by-side,
// for narrow vertical spaces. Every concrete promo (Scholarship, Cost
// Calculator, Visa Tracker, ...) is a thin wrapper around this, so adding a
// new one later is just new copy + an image, not a new layout.
const SIZE = {
  sm: {
    wrapRow: 'gap-3 p-3.5 rounded-2xl',
    wrapCol: 'gap-2 p-4 rounded-2xl',
    imageBox: 'h-12 w-12',
    image: 'h-8 w-8',
    badge: 'h-5 w-5 -bottom-1 -right-1',
    badgeIcon: 'h-2.5 w-2.5',
    title: 'text-sm font-bold',
    subtitle: 'text-xs mt-0.5',
    arrow: 'h-4 w-4',
  },
  md: {
    wrapRow: 'gap-6 p-5 rounded-[28px] sm:p-6',
    wrapCol: 'gap-3 p-6 rounded-[28px]',
    imageBox: 'h-20 w-20 sm:h-24 sm:w-24',
    image: 'h-14 w-14 sm:h-16 sm:w-16',
    badge: 'h-8 w-8 -bottom-2 -right-2 ring-4',
    badgeIcon: 'h-4 w-4',
    title: 'text-lg font-bold sm:text-xl',
    subtitle: 'text-sm mt-1',
    arrow: 'h-5 w-5',
  },
  lg: {
    wrapRow: 'gap-7 p-7 rounded-[32px] sm:p-8',
    wrapCol: 'gap-4 p-8 rounded-[32px]',
    imageBox: 'h-28 w-28 sm:h-32 sm:w-32',
    image: 'h-20 w-20 sm:h-24 sm:w-24',
    badge: 'h-10 w-10 -bottom-2.5 -right-2.5 ring-4',
    badgeIcon: 'h-5 w-5',
    title: 'text-xl font-bold sm:text-2xl',
    subtitle: 'text-base mt-1.5',
    arrow: 'h-6 w-6',
  },
};

const PromoCard = ({
  to,
  image,
  icon: Icon,
  title,
  subtitle,
  tint,
  size = 'md',
  orientation = 'row',
  className = '',
}) => {
  const s = SIZE[size] || SIZE.md;
  const isColumn = orientation === 'column';

  return (
    <Link
      to={to}
      className={`group flex overflow-hidden border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isColumn ? `flex-col items-center text-center ${s.wrapCol}` : `items-center ${s.wrapRow}`
      } ${tint.border} ${tint.wash} ${className}`}
    >
      <span className={`relative flex shrink-0 items-center justify-center rounded-2xl bg-white shadow-theme-sm ${s.imageBox}`}>
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className={`object-contain transition-transform duration-300 group-hover:scale-105 ${s.image}`}
        />
        {Icon && (
          <span className={`absolute flex items-center justify-center rounded-full text-white shadow-theme-sm ${tint.bg} ${tint.ring} ${s.badge}`}>
            <Icon className={s.badgeIcon} />
          </span>
        )}
      </span>
      <span className={isColumn ? '' : 'flex-1'}>
        <span className={`block font-outfit leading-snug text-ink-900 ${s.title}`}>{title}</span>
        {subtitle && <span className={`block text-ink-500 ${s.subtitle}`}>{subtitle}</span>}
      </span>
      {!isColumn && <ArrowRight className={`shrink-0 transition-transform group-hover:translate-x-1 ${s.arrow} ${tint.icon}`} />}
    </Link>
  );
};

export default PromoCard;
