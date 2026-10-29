import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { ArrowUpRight } from 'lucide-react';
import successService from '../../services/successService';
import { formatStatValue } from './icons.jsx';
import { FALLBACK_STUDENTS_PLACED } from '../../constants/successStats';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CTASection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const trustRef = useRef(null);
  const actionsRef = useRef(null);
  const [studentsGuided, setStudentsGuided] = useState(FALLBACK_STUDENTS_PLACED);

  useEffect(() => {
    let ignore = false;
    successService
      .getAllSuccess()
      .then((res) => {
        if (ignore) return;
        const stat = res?.data?.find((s) => /student/i.test(s.title || ''));
        if (stat?.value) setStudentsGuided(stat.value);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });
      gsap.set(trustRef.current, { opacity: 0, y: 20 });
      gsap.set(actionsRef.current.children, { opacity: 0, y: 24 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          tl.from(split.words, { opacity: 0, y: 40, stagger: 0.08, duration: 0.7 })
            .to(trustRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.3)
            .to(
              actionsRef.current.children,
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.12,
                // release the reveal transform so the button's CSS hover lift works
                onComplete: () => gsap.set(actionsRef.current.children, { clearProps: 'transform' }),
              },
              0.4
            );
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="overflow-hidden bg-white py-4 sm:py-6">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-primary-700 via-primary-700 to-primary-600 py-16 sm:rounded-[2.5rem] sm:py-20">
          {/* Faint vertical guide lines echo the reference's grid framing */}
          <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
            <span className="absolute inset-y-0 left-1/3 w-px bg-white/10" />
            <span className="absolute inset-y-0 left-2/3 w-px bg-white/10" />
          </div>

          <div className="relative flex flex-col gap-10 px-6 md:flex-row md:items-end md:justify-between md:px-12">
            <h2
              ref={headingRef}
              className="font-outfit text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Ready for <br /> <span className="text-accent-400">Takeoff?</span>
            </h2>

            <p
              ref={trustRef}
              className="max-w-[15rem] text-base font-medium leading-relaxed text-primary-100 md:self-center"
            >
              Trusted by {formatStatValue(studentsGuided)} students who found their path to 70+ countries with us.
            </p>

            <div ref={actionsRef} className="flex shrink-0 flex-col items-start gap-4 md:items-end">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-base font-semibold text-white shadow-theme-md transition-all hover:-translate-y-1 hover:bg-accent-400 hover:shadow-theme-lg"
              >
                Start Now
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-100 transition-colors hover:text-accent-400"
              >
                or talk to an advisor
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
