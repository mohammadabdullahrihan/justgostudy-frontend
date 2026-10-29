import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Users, ShieldCheck, Handshake, Sparkles } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Four feature cards + two photos laid out as a bento grid (4-col on desktop):
//   Row 1:  [ card ] [ ── photo ── ] [ card ]
//   Row 2:  [ card ] [ card ] [ ── photo ── ]
const features = [
  {
    Icon: Users,
    title: 'Students first, always',
    desc: 'Every shortlist is built around your goals, grades and budget, never a sales target.',
    tile: 'bg-primary-700 border-primary-800',
    chip: 'bg-white/15 text-white',
    titleColor: 'text-white',
    descColor: 'text-primary-100',
  },
  {
    Icon: Sparkles,
    title: 'Honest, expert advice',
    desc: 'Counsellors who have lived it abroad tell you what actually works, the good and the hard.',
    tile: 'bg-gradient-to-br from-accent-400 to-accent-500 border-accent-500',
    chip: 'bg-white/20 text-white',
    titleColor: 'text-white',
    descColor: 'text-white/85',
  },
  {
    Icon: Handshake,
    title: 'Guided every step',
    desc: 'One dedicated consultant walks with you from shortlist to visa to the day you fly out.',
    tile: 'bg-primary-600 border-primary-700',
    chip: 'bg-white text-primary-600',
    titleColor: 'text-white',
    descColor: 'text-primary-100',
  },
  {
    Icon: ShieldCheck,
    title: 'Verified & transparent',
    desc: 'Only accredited universities and vetted agents. No hidden fees, no false promises, ever.',
    tile: 'bg-gradient-to-br from-secondary-500 to-secondary-700 border-secondary-700',
    chip: 'bg-white/15 text-white',
    titleColor: 'text-white',
    descColor: 'text-secondary-50',
  },
];

const photos = [
  {
    src: '/people-studying-together.webp',
    alt: 'Students studying together',
    stat: '5,000+',
    label: 'Students placed abroad',
  },
  {
    src: '/diploma-with-hat.webp',
    alt: 'Diploma with a graduation cap',
    stat: '90%',
    label: 'Visa success rate',
  },
];

const FeatureCard = ({ Icon, title, desc, tile, chip, titleColor, descColor }) => (
  <div
    className={`bento-tile group flex h-full min-h-[240px] flex-col justify-between rounded-3xl border p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-theme-lg will-change-transform ${tile}`}
  >
    <div>
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-theme-sm ${chip}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className={`mt-5 text-lg md:text-xl font-extrabold leading-snug ${titleColor}`}>
        {title}
      </h3>
    </div>
    <p className={`mt-6 text-sm leading-relaxed ${descColor}`}>{desc}</p>
  </div>
);

const PhotoTile = ({ src, alt, stat, label, className = '', index = 0 }) => {
  const imgRef = useRef(null);

  // Out-of-sync float on each tile's photo so the two don't bob in lockstep.
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.to(imgRef.current, {
      y: -10,
      rotate: index % 2 === 0 ? 2 : -2,
      duration: 2.8 + index * 0.4,
      delay: index * 0.3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, [index]);

  return (
  <div
    className={`bento-tile group relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-primary-100 via-primary-50 to-white shadow-theme-md md:min-h-[320px] ${className}`}
  >
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{ backgroundImage: 'radial-gradient(circle, #0e1f6d 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }}
    />
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="relative z-10 h-full max-h-[260px] w-full object-contain px-4 pb-16 pt-4 drop-shadow-xl transition-transform duration-700 ease-out group-hover:scale-105 md:max-h-[300px]"
    />
    <div className="absolute bottom-5 left-5 z-10 flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-2.5 shadow-theme-sm backdrop-blur-sm">
      <span className="text-2xl md:text-3xl font-black text-ink-900 leading-none">{stat}</span>
      <span className="max-w-[8rem] text-xs font-semibold uppercase leading-tight tracking-wide text-ink-500">
        {label}
      </span>
    </div>
  </div>
  );
};

const WhyTrustUsSection = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Header reveal
      gsap.utils.toArray('[data-reveal]').forEach((group) => {
        gsap.set(group, { opacity: 0, y: 32 });
        ScrollTrigger.create({
          trigger: group,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(group, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }),
        });
      });

      // Bento tiles pop in with a staggered scale
      const tiles = gsap.utils.toArray('.bento-tile');
      gsap.set(tiles, { opacity: 0, y: 40, scale: 0.94 });
      ScrollTrigger.create({
        trigger: '.bento-grid',
        start: 'top 80%',
        once: true,
        onEnter: () =>
          gsap.to(tiles, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'back.out(1.5)',
            // release inline transform so the CSS hover lift keeps working
            onComplete: () => gsap.set(tiles, { clearProps: 'transform' }),
          }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative py-24 bg-cream-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100 blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-accent-100 blur-3xl opacity-30 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div data-reveal className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-ink-900">
            Our promise{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-500 to-primary-400">
              to every student
            </span>
          </h2>
          <p className="mt-4 leading-relaxed text-ink-500">
            Just Go Study pairs Bangladeshi students with the right university abroad, and the right
            people to get them there, every step of the way.
          </p>
        </div>

        {/* ── Bento grid ── */}
        <div className="bento-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* Row 1 */}
          <FeatureCard {...features[0]} />
          <PhotoTile {...photos[0]} index={0} className="md:col-span-2 lg:col-span-2" />
          <FeatureCard {...features[1]} />

          {/* Row 2 */}
          <FeatureCard {...features[2]} />
          <FeatureCard {...features[3]} />
          <PhotoTile {...photos[1]} index={1} className="md:col-span-2 lg:col-span-2" />
        </div>
      </div>
    </section>
  );
};

export default WhyTrustUsSection;
