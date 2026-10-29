import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes so a caller's `className` wins over conflicting
// variant/size utilities (e.g. custom rounded/padding) instead of both
// landing in the DOM and fighting.
const cn = (...inputs) => twMerge(clsx(inputs));

const variantStyles = {
  primary:
    'bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-sm hover:shadow-md active:scale-[0.97]',
  secondary:
    'bg-transparent hover:bg-primary-50 text-primary-700 font-semibold border-2 border-primary-600 hover:border-primary-700 active:scale-[0.97]',
  cta: 'bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg hover:shadow-xl active:scale-[0.97]',
  ghost:
    'bg-transparent hover:bg-ink-100 text-ink-700 font-medium active:scale-[0.97]',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm hover:shadow-md active:scale-[0.97]',
  outline:
    'bg-transparent hover:bg-ink-50 text-ink-700 font-semibold border border-ink-300 hover:border-ink-400 active:scale-[0.97]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-8 py-4 text-base rounded-xl',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  to,
  href,
  onClick,
  disabled = false,
  type = 'button',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-primary-500/40';
  const classes = cn(
    base,
    variantStyles[variant] || variantStyles.primary,
    sizeStyles[size] || sizeStyles.md,
    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
