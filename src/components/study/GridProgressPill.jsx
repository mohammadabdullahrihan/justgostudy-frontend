// Floating scroll-progress pill used by the Courses/Universities grids.
// The fill and label are driven imperatively by useCardGridFX.
// Horizontal centering lives in the inline transform (not a Tailwind
// -translate-x-1/2 class) because useCardGridFX animates y/autoAlpha on this
// element and GSAP owns the transform once it touches it.
const GridProgressPill = ({ barRef, fillRef, nameRef, label }) => (
  <div
    ref={barRef}
    className="fixed bottom-6 left-1/2 z-40 w-[min(90vw,420px)] rounded-full border border-primary-100 bg-white/90 px-5 py-3 shadow-theme-lg backdrop-blur"
    style={{ opacity: 0, visibility: 'hidden', transform: 'translateX(-50%)' }}
  >
    <p ref={nameRef} className="mb-2 truncate text-xs font-bold text-ink-900">{label}</p>
    <div className="h-1.5 overflow-hidden rounded-full bg-cream-100">
      <div ref={fillRef} className="h-full rounded-full bg-primary-600" />
    </div>
  </div>
);

export default GridProgressPill;
