import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useCountUp } from '../../hooks/useCountUp';
import { getIcon, parseStatValue } from './icons';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Counter only mounts once the section enters the viewport so useCountUp
// (startOnView: false) starts in lockstep with the ScrollTrigger onEnter.
const StatNumber = ({ value }) => {
  const { prefix, end, suffix } = parseStatValue(value);
  const { count } = useCountUp(end, 2000, false);
  return (
    <p className="font-outfit text-5xl font-extrabold text-white sm:text-6xl">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </p>
  );
};

const StatsSection = ({ stats }) => {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);
  const [started, setStarted] = useState(false);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setStarted(true);
        return;
      }

      gsap.set(cardsRef.current.children, { opacity: 0, y: 40 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          setStarted(true);
          gsap.to(cardsRef.current.children, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-cream-50 py-16">
      <div className="container mx-auto px-6 md:px-12">
        <div
          ref={cardsRef}
          className="grid grid-cols-1 gap-8 rounded-[2.5rem] bg-primary-700 px-8 py-12 shadow-theme-md sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, idx) => (
            <div key={stat._id || idx} className="flex flex-col items-center gap-2 text-center">
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-accent-400">
                {getIcon(stat.icon)}
              </div>
              {started ? (
                <StatNumber value={stat.value} />
              ) : (
                <p className="font-outfit text-5xl font-extrabold text-white sm:text-6xl">
                  {parseStatValue(stat.value).prefix}0{parseStatValue(stat.value).suffix}
                </p>
              )}
              <p className="text-sm font-bold uppercase tracking-widest text-accent-400">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
