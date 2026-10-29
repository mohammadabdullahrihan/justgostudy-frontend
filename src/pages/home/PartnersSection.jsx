import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { fadeInUp } from './animations';
import { getUniversities } from '../../services/universityService';

gsap.registerPlugin(useGSAP);

const MAX_PARTNERS = 20;
const ROW_DURATION = 30;

// Alternating big/small widths mirror the reference bento grid.
const LogoChip = ({ uni, big }) => (
  <div
    title={uni.name}
    className={`mx-3 flex h-16 shrink-0 items-center justify-center rounded-xl border border-ink-100 bg-white shadow-theme-sm sm:h-20 ${
      big ? 'w-44 p-4 sm:w-60' : 'w-28 p-2.5 sm:w-36'
    }`}
  >
    <img src={uni.logo} alt={uni.name} loading="lazy" className="max-h-full max-w-full object-contain" />
  </div>
);

// GSAP-driven duplex marquee: track content is duplicated once, so animating
// `x` from 0 to -(single set width) and repeating (-1) loops seamlessly.
// Lenis already ticks the shared GSAP ticker (see SmoothScroll.jsx), so this
// tween rides the same smooth-scroll frame loop for free.
const MarqueeRow = ({ items, direction }) => {
  const rowRef = useRef(null);
  const trackRef = useRef(null);
  const tweenRef = useRef(null);
  const track = [...items, ...items];

  useGSAP(
    () => {
      if (!trackRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const setWidth = trackRef.current.scrollWidth / 2;
      const fromX = direction === 'right' ? -setWidth : 0;
      const toX = direction === 'right' ? 0 : -setWidth;

      gsap.set(trackRef.current, { x: fromX, willChange: 'transform' });
      tweenRef.current = gsap.to(trackRef.current, {
        x: toX,
        duration: ROW_DURATION,
        ease: 'none',
        repeat: -1,
      });
    },
    { scope: rowRef, dependencies: [items, direction] }
  );

  return (
    <div
      ref={rowRef}
      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.play()}
      className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
    >
      <div ref={trackRef} className="flex w-max">
        {track.map((uni, i) => (
          <LogoChip key={`${uni._id}-${i}`} uni={uni} big={i % 3 === 1} />
        ))}
      </div>
    </div>
  );
};

const PartnersSection = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        // Only name + logo ever get rendered here (a logo marquee), but the
        // endpoint's default response is every field on every university —
        // ~7.4MB for 546 docs. `select` trims that down to what this
        // component actually reads.
        const data = await getUniversities({ select: 'name,logo' });
        const list = Array.isArray(data) ? data : data.universities || data.data || [];
        const withLogo = list.filter((uni) => uni.logo);
        if (!ignore) setPartners(withLogo.slice(0, MAX_PARTNERS));
      } catch {
        if (!ignore) setPartners([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  if (!loading && partners.length === 0) return null;

  const half = Math.ceil(partners.length / 2);
  const row1 = partners.slice(0, half);
  const row2 = partners.slice(half).length ? partners.slice(half) : row1;

  return (
    <section className="relative bg-cream-100 pt-16 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeInUp}
          className="mb-8 text-center text-lg font-medium text-ink-500"
        >
          Universities we work with
        </motion.p>

        {loading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-ink-100 bg-white sm:h-20" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <MarqueeRow items={row1} direction="right" />
            <MarqueeRow items={row2} direction="left" />
          </div>
        )}
      </div>
    </section>
  );
};

export default PartnersSection;
