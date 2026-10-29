import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowUp, Navigation, X, Check, Share2, MessageSquare, Printer, Info, ShieldCheck } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';
import { openConsultationModal } from '../../hooks/useConsultationModal';
import { useCountUp } from '../../hooks/useCountUp';
import { PANEL_TONES, STAT_TONES } from '../../utils/tabTones';
import sanitizeHtml from '../../utils/sanitizeHtml';
import { formatUpdatedAt } from '../../utils/formatDate';
import { companyData } from '../../constants/companyData';

/* ---------- Single stat pill for a hero's "at a glance" bar — the exact same
   piece used by the Destination/Country page's hero, so University's (and any
   future detail page's) stat bar reads as pixel-identical rather than a
   similar-looking reimplementation. Numeric values get a count-up animation;
   pre-formatted strings (e.g. "10,000+") render as-is. ---------- */
export const StatItem = ({ label, value, Icon, tone }) => {
  const t = STAT_TONES[tone];
  const isNumeric = typeof value === 'number';
  const { count, ref } = useCountUp(isNumeric ? value : 0, 900);
  return (
    <div ref={ref} className="flex items-center gap-3 md:gap-4 px-3 py-5 md:px-8 md:py-7 min-w-0">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${t.bg}`}>
        <Icon className={`w-5 h-5 ${t.text}`} />
      </div>
      <div className="min-w-0">
        <p className="text-lg md:text-2xl font-bold text-white leading-none">
          {isNumeric ? count.toLocaleString() : value}
        </p>
        {/* Wraps instead of truncating — a narrower grid (University's 2-up
            mobile layout) was clipping longer labels like "Total Programs"
            into an ellipsis; two lines at this font size still fits the
            row's height cleanly. */}
        <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mt-1.5 leading-snug">{label}</p>
      </div>
    </div>
  );
};

/* ---------- The colored "at a glance" bar itself — gradient pill row sitting
   cleanly below a hero (never overlapping it), matching the Destination page's
   treatment exactly. `gridClassName` sets the column layout (e.g. Destination's
   fixed "grid-cols-3", University's responsive "grid-cols-2 lg:grid-cols-4") —
   left as a caller-supplied Tailwind class rather than computed inline, since
   Tailwind can't pick up a dynamically-built class string. ---------- */
export const StatBar = ({ stats, gridClassName = 'grid-cols-3', maxWidthClassName = 'max-w-3xl' }) => (
  <div className="relative z-10 px-4 mt-6 md:mt-8">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 rounded-[1.75rem] md:rounded-[2rem] shadow-xl shadow-primary-900/20 grid ${gridClassName} divide-x divide-y lg:divide-y-0 divide-white/10 ${maxWidthClassName} mx-auto`}
      >
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </motion.div>
    </div>
  </div>
);

/* ============================== Details-page shared kit ==============================
   Reused across the University and Course detail pages so both follow the exact same
   UI pattern already established by the Destination/Country detail page: a sticky
   gradient sidebar of section tabs, a "Back to Guide Sections" button above the
   footer, a fixed bottom apply bar, and a share modal off the hero's action rail.
   Keep this file the single source of truth for that shell — don't re-implement it
   per page. */

/* ---------- Rich profile text — the one shared renderer for every long-form
   paragraph on the University detail page, so type size/weight/color and inline
   <a href> link support are identical everywhere, matching the Destination/Country
   guide pages' `guide-content-links` pattern exactly (same class, same sanitizer,
   same text-black font-medium text-[17px] treatment) instead of each tab picking
   its own ad-hoc size. Renders nothing for empty content. ---------- */
export const RichText = ({ content, className = '' }) => {
  if (!content) return null;
  return (
    <p
      className={`guide-content-links text-black font-medium text-[17px] leading-relaxed whitespace-pre-line ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
    />
  );
};

/* ---------- Sticky left-nav section tabs ---------- */
export const SidebarNav = ({ tabs, activeTab, setActiveTab, activeTabButtonRef, heading = 'Guide Sections' }) => (
  <nav className="lg:self-stretch">
    <div className="sticky top-20 z-40 lg:top-24 bg-gradient-to-b from-primary-600 to-primary-700 rounded-3xl shadow-xl shadow-primary-900/20 p-2.5">
      <div className="hidden lg:flex items-center gap-2 px-3.5 pt-3 pb-2.5">
        <span className="h-px w-4 bg-accent-400" />
        <p className="text-xs font-bold uppercase tracking-widest text-accent-400">{heading}</p>
      </div>
      <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible -mx-1 px-1 lg:mx-0 lg:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabButtonRef : undefined}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-base text-left whitespace-nowrap lg:whitespace-normal flex-shrink-0 transition-all ${
                isActive
                  ? 'bg-accent-500 text-primary-950 shadow-md shadow-accent-900/30'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-950' : 'text-white/50'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);

/* ---------- Compact, non-sticky help card, sits below the nav card in the
   same sidebar column so it's visible on load without competing with the
   sticky tab list once the student scrolls. ---------- */
export const SidebarHelpCard = ({ title = 'Need Help Deciding?', message, phone, officeHours }) => (
  <div className="hidden lg:block mt-6 bg-white rounded-3xl border border-cream-100 shadow-sm p-6">
    <h4 className="font-bold text-ink-900 mb-2">{title}</h4>
    {message && <p className="text-ink-500 text-sm font-medium leading-relaxed mb-5">{message}</p>}
    <button
      onClick={openConsultationModal}
      className="w-full py-3 bg-primary-50 text-primary-600 border border-primary-100 rounded-xl font-bold text-sm hover:bg-primary-100 transition-all mb-4"
    >
      Ask a Consultant
    </button>
    {(phone || officeHours) && (
      <div className="space-y-2 pt-4 border-t border-cream-100">
        {phone && (
          <a href={`tel:${phone}`} className="block text-sm font-bold text-ink-900 hover:text-primary-600 transition-colors">
            {phone}
          </a>
        )}
        {officeHours && <p className="text-xs text-ink-500 font-medium">{officeHours}</p>}
      </div>
    )}
  </div>
);

/* ---------- "Back to Guide Sections" button, above the footer ---------- */
/* ---------- Data-accuracy disclaimer — sits at the bottom of University/Course
   detail pages so the site is never on the hook for a stale fee, deadline, or
   requirement it only surfaced from third-party sources. Pairs with the "last
   updated" trust strip rather than replacing it — one says "here's when we
   last touched this", this one says "verify before you rely on it". ---------- */
export const DataDisclaimer = () => (
  // Deliberately placed right under each page's hero (see call sites), not
  // buried at the bottom past the tab content — a disclaimer nobody scrolls
  // to see isn't doing its job. Navy + gold on purpose too: same premium
  // brand-navy-card/gold-text pairing used elsewhere (e.g. the About page's
  // MD message), so it reads as a deliberate brand moment, not a bolted-on
  // gray legal footnote.
  <div className="relative mx-auto mt-8 flex max-w-4xl items-start gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 px-6 py-5 text-left shadow-theme-md sm:px-7">
    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-400/10 blur-2xl" />
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
      <Info className="h-4 w-4 text-accent-400" />
    </div>
    <p className="relative text-sm leading-relaxed text-primary-100">
      <span className="font-bold text-accent-400">A note on accuracy: </span>
      information on this page is compiled from university publications and public sources for general guidance
      only, and may change without notice. {companyData.name} makes no guarantee of accuracy or completeness and is
      not responsible for outdated fees, deadlines, or requirements — please confirm final details directly with the
      university&apos;s official website or a consultant before making any decision.
    </p>
  </div>
);

export const BackToSectionsButton = ({ onClick, label = 'Back to Guide Sections' }) => (
  <div className="flex justify-center pt-12">
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-primary-600 hover:bg-accent-500 hover:text-primary-950 text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-primary-200 transition-all"
    >
      <ArrowUp className="w-4 h-4" />
      {label}
    </button>
  </div>
);

/* ---------- Fixed bottom apply/CTA bar ---------- */
export const StickyApplyBar = ({ eyebrow = 'Start Today', title, buttonLabel = 'Apply Now', onApply, icon: Icon = Navigation }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-white/90 backdrop-blur-xl border border-cream-200/50 p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 bg-primary-600 text-white rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{eyebrow}</p>
          <p className="text-sm font-semibold text-ink-900 truncate">{title}</p>
        </div>
      </div>
      <button
        onClick={onApply}
        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-200 shrink-0"
      >
        {buttonLabel}
      </button>
    </motion.div>
  </div>
);

/* ---------- Share modal (Copy Link / WhatsApp / Print), off the hero's action rail ---------- */
export const ShareModal = ({ isOpen, onClose, title, whatsappText }) => {
  const modalRef = useModalA11y(isOpen, onClose);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Could not copy link. Please copy it from the address bar.');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(whatsappText || `Check this out: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 id="share-modal-title" className="text-xl font-bold text-ink-900">Share {title}</h3>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-cream-100 transition-colors">
                <X className="w-5 h-5 text-ink-500" />
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-cream-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  {linkCopied ? <Check className="w-5 h-5 text-primary-600" /> : <Share2 className="w-5 h-5 text-primary-600" />}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-ink-900">{linkCopied ? 'Copied!' : 'Copy Link'}</p>
                  <p className="text-sm text-ink-500">Share via any platform</p>
                </div>
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-cream-200 hover:border-green-300 hover:bg-green-50 transition-all"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-ink-900">WhatsApp</p>
                  <p className="text-sm text-ink-500">Share with contacts</p>
                </div>
              </button>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-cream-200 hover:border-accent-300 hover:bg-accent-50 transition-all"
              >
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <Printer className="w-5 h-5 text-accent-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-ink-900">Print / Save as PDF</p>
                  <p className="text-sm text-ink-500">Use your browser&apos;s print dialog</p>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ---------- Section heading, accent bar + title (matches the University/Course
   page's existing heading style) with an optional leading icon. ---------- */
export const SectionHeading = ({ icon: Icon, children, updatedAt }) => {
  const updatedLabel = formatUpdatedAt(updatedAt);
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <h2 className="text-2xl font-bold text-ink-900 flex items-center gap-4">
        {Icon ? <Icon className="w-6 h-6 text-primary-600" /> : <div className="w-2 h-8 bg-primary-600 rounded-full" />}
        {children}
      </h2>
      {updatedLabel && (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Updated {updatedLabel}
        </span>
      )}
    </div>
  );
};

/* ---------- Icon-badge field card, used inside GroupProfilePanel's grid ---------- */
export const FieldCard = ({ icon: Icon, label, value, tone }) => (
  <div className={`${tone.bg} p-8 rounded-[2rem] border ${tone.border} shadow-sm hover:shadow-xl transition-all`}>
    <div className={`w-12 h-12 ${tone.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
      <Icon className={`w-6 h-6 ${tone.iconText}`} />
    </div>
    <h4 className="font-bold text-ink-900 mb-3">{label}</h4>
    <RichText content={value} />
  </div>
);

/* ---------- Empty-state, matches the country page's "Details Coming Soon" fallback ---------- */
export const EmptyState = ({ icon: Icon = Info, title = 'Details Coming Soon', message, ctaLabel = 'Ask a Consultant' }) => (
  <div className="bg-cream-50 p-12 rounded-[3rem] text-center border-2 border-dashed border-cream-200">
    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
      <Icon className="w-10 h-10 text-ink-500" />
    </div>
    <h3 className="text-xl font-bold text-ink-900 mb-2">{title}</h3>
    <p className="text-ink-600 font-medium text-[16px] max-w-sm mx-auto">{message}</p>
    <button
      onClick={openConsultationModal}
      className="mt-8 bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
    >
      {ctaLabel}
    </button>
  </div>
);

/* ---------- Generic renderer for the University model's {overview, ...subfields}
   profile groups (Academics, Tuition & Aid, Campus & Facilities, Student Life,
   Housing, Rankings & Reputation, Research & Innovation, International Student
   Support, Career Outcomes) — one component instead of nine near-duplicates. ---------- */
export const GroupProfilePanel = ({ icon: Icon, title, overview, fields = [], emptyMessage, extra, updatedAt }) => {
  const filledFields = fields.filter((f) => f.value);
  const hasContent = Boolean(overview) || filledFields.length > 0;

  if (!hasContent) {
    return (
      <section>
        <SectionHeading icon={Icon}>{title}</SectionHeading>
        <EmptyState
          message={
            emptyMessage ||
            `We're still gathering ${title.toLowerCase()} details for this university. Reach out to a consultant for the latest information.`
          }
        />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <SectionHeading icon={Icon} updatedAt={updatedAt}>{title}</SectionHeading>
      {overview && (
        <div className="bg-white p-10 md:p-12 rounded-3xl border border-ink-100 shadow-sm">
          <RichText content={overview} />
        </div>
      )}
      {filledFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filledFields.map((f, idx) => (
            <FieldCard key={f.key} icon={f.icon || Icon} label={f.label} value={f.value} tone={PANEL_TONES[idx % PANEL_TONES.length]} />
          ))}
        </div>
      )}
      {extra}
    </section>
  );
};
