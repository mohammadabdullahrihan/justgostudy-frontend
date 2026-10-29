import { motion } from 'framer-motion';

// Lighter-weight sibling of the main country-page tab bar (CountryDetailPage.jsx),
// same sliding-pill technique but visually one step down so the "page tab vs.
// in-tab sub-tab" hierarchy stays obvious. `layoutId` must be unique per mounted
// instance so multiple sub-tab groups on the page don't animate into each other.
const SubTabs = ({ items, activeId, onChange, layoutId }) => (
  <div className="inline-flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 mb-8">
    {items.map((item) => {
      const isActive = activeId === item.id;
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            isActive ? 'text-primary-950' : 'text-white/70 hover:text-white'
          }`}
        >
          {isActive && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 bg-accent-500 rounded-xl shadow-sm"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative z-10">{item.label}</span>
        </button>
      );
    })}
  </div>
);

export default SubTabs;
