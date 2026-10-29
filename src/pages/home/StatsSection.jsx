import { Fragment, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useCountUp } from '../../hooks/useCountUp';
import successService from '../../services/successService';
import { parseStatValue } from '../success/icons.jsx';
import {
  FALLBACK_STUDENTS_PLACED,
  FALLBACK_COUNTRIES_COVERED,
  FALLBACK_PARTNER_UNIVERSITIES,
  FALLBACK_SUCCESS_RATE,
} from '../../constants/successStats';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Only stats whose title clearly matches a real destination page get turned
// into links, an unrecognised admin-entered title stays plain text rather
// than risk pointing somewhere wrong.
const STAT_LINKS = [
  { test: /student/i, to: '/our-success' },
  { test: /countr/i, to: '/study-abroad/destinations' },
  { test: /university|universities/i, to: '/study-abroad/universities' },
  { test: /success|rate/i, to: '/our-success' },
];

const linkForStat = (title = '') => STAT_LINKS.find((s) => s.test.test(title))?.to;

// Used only if the live stats (admin-managed on the 'Our Success' page) fail
// to load, kept in sync with that same content so a fallback never drifts
// into showing different numbers than the rest of the site.
const FALLBACK_STATS = [
  { title: 'Students Placed', value: FALLBACK_STUDENTS_PLACED },
  { title: 'Countries Covered', value: FALLBACK_COUNTRIES_COVERED },
  { title: 'Universities We Work With', value: FALLBACK_PARTNER_UNIVERSITIES },
  { title: 'Success Rate', value: FALLBACK_SUCCESS_RATE },
];

// Count animation only mounts once the section enters the viewport, so the
// existing useCountUp hook (`startOnView: false`) starts in lockstep with
// the GSAP ScrollTrigger onEnter callback instead of its own IntersectionObserver.
const StatNumber = ({ value }) => {
  const { prefix, end, suffix } = parseStatValue(value);
  const { count } = useCountUp(end, 2000, false);
  return (
    <p className="font-outfit text-5xl font-extrabold text-white sm:text-6xl lg:text-7xl">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </p>
  );
};

const StatsSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [stats, setStats] = useState(FALLBACK_STATS);

  // Same admin-managed source the 'Our Success' page uses, so a number
  // updated there (e.g. Universities We Work With) doesn't go stale here.
  useEffect(() => {
    let ignore = false;
    successService
      .getAllSuccess()
      .then((res) => {
        if (ignore) return;
        if (res?.data?.length > 0) setStats(res.data);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useGSAP(
    () => {
      gsap.set(cardsRef.current.children, { opacity: 0, y: 30 });

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
    { scope: sectionRef, dependencies: [stats] }
  );

  return (
    <section ref={sectionRef} className="relative py-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={cardsRef}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-8 rounded-3xl border border-white/10 bg-primary-700 px-6 py-10 sm:gap-x-5 sm:px-10"
        >
          {stats.map((stat, i) => {
            const to = linkForStat(stat.title);
            const StatWrap = to ? Link : 'div';
            const wrapProps = to ? { to } : {};
            return (
              <Fragment key={stat._id || stat.title}>
                <StatWrap
                  {...wrapProps}
                  className={`flex flex-col items-center gap-1 px-2 text-center ${to ? 'transition-opacity hover:opacity-80' : ''}`}
                >
                  {started ? (
                    <StatNumber value={stat.value} />
                  ) : (
                    <p className="font-outfit text-5xl font-extrabold text-white sm:text-6xl lg:text-7xl">
                      {parseStatValue(stat.value).prefix}0{parseStatValue(stat.value).suffix}
                    </p>
                  )}
                  <p className="text-sm text-primary-100">{stat.title}</p>
                </StatWrap>
                {i < stats.length - 1 && (
                  <span className="hidden text-5xl font-bold text-primary-500 sm:block sm:text-6xl">.</span>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
