import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, ArrowRight, Calendar, Building2, Users } from 'lucide-react';
import successService from '../../services/successService';
import { formatStatValue } from '../../pages/success/icons.jsx';
import { FALLBACK_STUDENTS_PLACED, FALLBACK_PARTNER_UNIVERSITIES } from '../../constants/successStats';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const AboutIntroSection = () => {
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const imageRef = useRef(null);
  const imgTagRef = useRef(null);
  const glowRef = useRef(null);
  const [studentsGuided, setStudentsGuided] = useState(FALLBACK_STUDENTS_PLACED);
  const [partnerUniversities, setPartnerUniversities] = useState(FALLBACK_PARTNER_UNIVERSITIES);

  useEffect(() => {
    let ignore = false;
    successService
      .getAllSuccess()
      .then((res) => {
        if (ignore) return;
        const stat = res?.data?.find((s) => /student/i.test(s.title || ''));
        if (stat?.value) setStudentsGuided(stat.value);
        const uniStat = res?.data?.find((s) => /universit/i.test(s.title || ''));
        if (uniStat?.value) setPartnerUniversities(uniStat.value);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;

      gsap.set(leftRef.current.children, { opacity: 0, y: 24 });
      gsap.set(imageRef.current, { opacity: 0, scale: 0.96 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
      });

      tl.to(leftRef.current.children, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }).to(
        imageRef.current,
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' },
        0.1
      );

      // Gentle continuous float on the illustration itself, plus a slow
      // breathing glow behind it — keeps the hero visual alive instead of
      // going static once the entrance reveal finishes.
      gsap.to(imgTagRef.current, {
        y: -16,
        rotate: 1.5,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to(glowRef.current, {
        scale: 1.15,
        opacity: 0.8,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div ref={leftRef}>
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-ink-500" />
            <span className="h-px w-10 border-t border-dashed border-ink-300" />
            <span className="rounded-full border border-ink-200 px-4 py-1.5 text-xs font-semibold text-ink-600">
              About Us
            </span>
            <span className="h-px w-10 border-t border-dashed border-ink-300" />
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-500" />
          </div>

          <h2 className="mt-6 font-outfit text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
            Hello, We are Just Go Study
          </h2>

          <p className="mt-5 max-w-lg text-ink-500">
            Just Go Study was established with a mission to simplify international education for students in
            Bangladesh. By combining one-on-one expert counseling with digital tools, the agency ensures a
            transparent, student-first approach to studying abroad.
          </p>

          <Link
            to="/about-us#about-story"
            className="group mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 transition-colors hover:text-primary-700"
          >
            Read More <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="relative mt-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 p-4 sm:p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-500/15 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary-300">001</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/15 text-accent-300 ring-1 ring-accent-400/20">
                    <Calendar className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-4 font-outfit text-4xl font-bold tracking-tight text-white">2024</p>
                <p className="mt-1 text-sm text-primary-200">Founded</p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary-300">002</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/15 text-accent-300 ring-1 ring-accent-400/20">
                    <Building2 className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-4 font-outfit text-4xl font-bold tracking-tight text-white">{partnerUniversities}</p>
                <p className="mt-1 text-sm text-primary-200">Universities We Work With</p>
              </div>

              <div className="col-span-2 flex items-center justify-between rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6">
                <div>
                  <p className="font-outfit text-4xl font-bold tracking-tight text-white sm:text-5xl">{formatStatValue(studentsGuided)}</p>
                  <p className="mt-1 text-sm text-primary-200">Students Successfully Guided</p>
                </div>
                <div className="flex flex-col items-end justify-between self-stretch">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/15 text-accent-300 ring-1 ring-accent-400/20">
                    <Users className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium text-primary-300">003</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={imageRef} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div ref={glowRef} className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-gradient-to-br from-primary-50 via-accent-50 to-transparent blur-2xl" />
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[40px] bg-gradient-to-br from-primary-50 via-cream-50 to-secondary-50 p-10 shadow-theme-lg sm:p-14">
            <img
              ref={imgTagRef}
              loading="lazy"
              decoding="async"
              src="/books-and-cup-3d-illustration.webp"
              alt="Books and a cup, study guidance illustration"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutIntroSection;
