import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Stylised wireframe globe emblem for the Destinations hero. The meridian
// cage turns slowly, location pins pulse, and a great-circle arc keeps drawing
// between two hubs, a lightweight "global reach" motif in brand tones.
// All motion is guarded by prefers-reduced-motion.
const pins = [
  { cx: 118, cy: 96, c: '#f4591a' },
  { cx: 232, cy: 128, c: '#1ab894' },
  { cx: 150, cy: 214, c: '#3454e5' },
  { cx: 258, cy: 210, c: '#f4591a' },
];

const HeroGlobe = () => {
  const wrapRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.to('.globe-cage', {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: 48,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.globe-pin', {
        scale: 1.35,
        transformOrigin: 'center',
        duration: 1.1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.35, from: 'random' },
      });

      const arc = wrapRef.current.querySelector('.globe-arc');
      gsap.fromTo(
        arc,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 2.4, ease: 'power1.inOut', repeat: -1, repeatDelay: 0.6, yoyo: true }
      );
    },
    { scope: wrapRef }
  );

  return (
    <div ref={wrapRef} className="relative h-[380px] w-[380px]" aria-hidden="true">
      {/* soft gold + teal orbs, tuned for the navy hero banner */}
      <div className="absolute -right-6 top-4 h-52 w-52 rounded-full bg-accent-400/20 blur-3xl" />
      <div className="absolute bottom-2 -left-4 h-44 w-44 rounded-full bg-secondary-400/15 blur-3xl" />

      <svg viewBox="0 0 380 380" className="relative h-full w-full">
        {/* outer sphere */}
        <circle cx="190" cy="190" r="150" fill="url(#globe-fill)" stroke="#f7a730" strokeOpacity="0.25" strokeWidth="1.5" />

        {/* turning meridian + parallel cage */}
        <g className="globe-cage" stroke="#ffffff" strokeOpacity="0.2" fill="none" strokeWidth="1.2">
          <ellipse cx="190" cy="190" rx="150" ry="150" />
          <ellipse cx="190" cy="190" rx="112" ry="150" />
          <ellipse cx="190" cy="190" rx="58" ry="150" />
          <ellipse cx="190" cy="190" rx="150" ry="112" />
          <ellipse cx="190" cy="190" rx="150" ry="58" />
          <line x1="40" y1="190" x2="340" y2="190" />
          <line x1="190" y1="40" x2="190" y2="340" />
        </g>

        {/* great-circle route arc */}
        <path
          className="globe-arc"
          d="M118 96 Q 210 40 258 210"
          fill="none"
          stroke="#f7a730"
          strokeOpacity="0.9"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />

        {/* location pins */}
        {pins.map((p, i) => (
          <g key={i} className="globe-pin">
            <circle cx={p.cx} cy={p.cy} r="9" fill={p.c} fillOpacity="0.3" />
            <circle cx={p.cx} cy={p.cy} r="4" fill={p.c} />
          </g>
        ))}

        <defs>
          <radialGradient id="globe-fill" cx="38%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#16226b" />
            <stop offset="60%" stopColor="#0f1a52" />
            <stop offset="100%" stopColor="#0a164d" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default HeroGlobe;
