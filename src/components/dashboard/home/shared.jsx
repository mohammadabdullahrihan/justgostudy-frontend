import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_DOT_COLORS } from '../../../constants/applicationStatusColors';

/* ─── inline error banner ────────────────────────────────── */
export const ErrorBanner = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <AlertTriangle size={16} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
};

/* ─── stat card ──────────────────────────────────────────── */
export const StatCard = ({ icon: Icon, color, label, value, loading, sub, trend, trendUp }) => (
  <div className="bg-white rounded-2xl p-5 border border-ink-100/70 flex flex-col gap-3 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex items-center justify-between">
      <p className="text-sm text-ink-600 font-medium">{label}</p>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 shadow-theme-sm ${color}`}>
        <Icon size={17} />
      </div>
    </div>
    <div>
      {loading
        ? <div className="h-8 w-16 skeleton rounded-lg"></div>
        : <p className="text-3xl font-extrabold text-ink-900 leading-none font-display">{value}</p>
      }
    </div>
    {(sub || trend) && (
      <div className="flex items-center gap-2">
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${trendUp ? 'bg-secondary-50 text-secondary-600' : 'bg-rose-50 text-rose-500'}`}>
            {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend}
          </span>
        )}
        {sub && <span className="text-xs text-ink-600">{sub}</span>}
      </div>
    )}
  </div>
);

/* ─── shortcut card ──────────────────────────────────────── */
export const ShortcutCard = ({ icon: Icon, title, desc, to, accentClass }) => (
  <Link to={to}
    className="relative flex items-center gap-3 p-3.5 rounded-xl border border-ink-100/70 bg-white hover:border-primary-200 hover:bg-primary-50/40 transition-all shadow-theme-sm hover:shadow-theme-md group overflow-hidden"
    >
    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-accent-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-theme-sm ${accentClass}`}>
      <Icon size={17} />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-ink-800 group-hover:text-primary-700 leading-tight">{title}</p>
      <p className="text-sm text-ink-600 mt-0.5 leading-tight">{desc}</p>
    </div>
  </Link>
);

/* ─── status badge (single source of truth for application-status pills) ── */
export const StatusBadge = ({ status, title, uppercase = false }) => (
  <span
    title={title}
    className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${uppercase ? 'uppercase tracking-wider' : 'capitalize'} ${APPLICATION_STATUS_COLORS[status] || 'bg-ink-50 text-ink-500 border-ink-200'}`}
  >
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${APPLICATION_STATUS_DOT_COLORS[status] || 'bg-ink-400'}`} />
    {status?.replace('_', ' ')}
  </span>
);
