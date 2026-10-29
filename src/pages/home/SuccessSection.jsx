import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Users, Star, Award } from 'lucide-react';
import successService from '../../services/successService';
import {
  FALLBACK_STUDENTS_PLACED,
  FALLBACK_SUCCESS_RATE,
  FALLBACK_PARTNER_UNIVERSITIES,
  FALLBACK_SCHOLARSHIPS_SECURED,
  FALLBACK_COUNTRIES_COVERED,
} from '../../constants/successStats';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Used only if the live stats (admin-managed on the 'Our Success' page) fail
// to load, kept in sync with that same content so a fallback never drifts
// into showing different numbers than the rest of the site.
const FALLBACK_ACHIEVEMENTS = [
  {
    icon: Users,
    title: `${FALLBACK_STUDENTS_PLACED} Students Placed`,
    desc: 'Over 5,000 students placed at universities worldwide since we started.',
  },
  {
    icon: Star,
    title: `${FALLBACK_SUCCESS_RATE} Success Rate`,
    desc: 'Our visa approval rate comes from careful, accurate documentation on every application.',
  },
  {
    icon: Award,
    title: `${FALLBACK_PARTNER_UNIVERSITIES} Universities We Work With`,
    desc: `We help students apply to ${FALLBACK_PARTNER_UNIVERSITIES} universities across the globe.`,
  },
];
const FALLBACK_SCHOLARSHIPS = FALLBACK_SCHOLARSHIPS_SECURED;
const FALLBACK_COUNTRIES = FALLBACK_COUNTRIES_COVERED;

const SuccessSection = () => {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const imgRef = useRef(null);
  const [achievements, setAchievements] = useState(FALLBACK_ACHIEVEMENTS);
  const [scholarships, setScholarships] = useState(FALLBACK_SCHOLARSHIPS);
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);

  // Same admin-managed source the 'Our Success' page uses, so this section
  // can't drift out of sync with the numbers shown there.
  useEffect(() => {
    let ignore = false;
    successService
      .getAllSuccess()
      .then((res) => {
        if (ignore || !(res?.data?.length > 0)) return;
        const byTitle = Object.fromEntries(res.data.map((s) => [s.title, s]));

        const placed = byTitle['Students Placed'];
        const rate = byTitle['Success Rate'];
        const unis = byTitle['Universities We Work With'];
        const nextAchievements = [
          placed && { icon: Users, title: `${placed.value} Students Placed`, desc: placed.description },
          rate && { icon: Star, title: `${rate.value} Success Rate`, desc: rate.description },
          unis && { icon: Award, title: `${unis.value} Universities We Work With`, desc: unis.description },
        ].filter(Boolean);
        if (nextAchievements.length > 0) setAchievements(nextAchievements);

        if (byTitle['Scholarships Secured']) setScholarships(byTitle['Scholarships Secured'].value);
        if (byTitle['Countries Covered']) setCountries(byTitle['Countries Covered'].value);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useGSAP(
    () => {
      gsap.set(listRef.current.children, { opacity: 0, y: 20 });
      gsap.set('.success-card', { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      });

      tl.to('.success-card', { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' }).to(
        listRef.current.children,
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
        0.2
      );

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.to(imgRef.current, {
        y: -14,
        rotate: -2,
        duration: 3.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: sectionRef, dependencies: [achievements] }
  );

  return (
    <section ref={sectionRef} className="relative bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary-500 px-4 py-1.5 text-xs font-semibold text-primary-100">
            Our Success
          </span>
          <h2 className="mt-4 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
            Our Results So Far
          </h2>
          <p className="mt-4 text-ink-600">
            Helping every student succeed is what we focus on, and these are the real numbers
            behind it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: achievements list */}
          <div className="success-card rounded-[32px] bg-primary-600 p-8 sm:p-10">
            <div ref={listRef}>
              {achievements.map((item, index) => (
                <div
                  key={item.title}
                  className={`flex items-start gap-4 ${
                    index < achievements.length - 1 ? 'mb-6 border-b border-white/10 pb-6' : ''
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-400">
                    <item.icon className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <h3 className="font-outfit text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-primary-100">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: big stat + photo, premium navy card */}
          <div className="success-card relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 p-8 shadow-2xl shadow-primary-900/25 ring-1 ring-white/10 sm:p-10">
            {/* soft gold glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-accent-400/25 blur-3xl" />

            <div className="relative">
              <p className="max-w-[10rem] font-outfit text-sm font-bold text-primary-100 sm:max-w-[14rem]">
                Scholarships Secured for Our Students
              </p>
              <p className="mt-2 font-outfit text-6xl font-extrabold text-white sm:text-7xl">{scholarships}</p>

              <div className="mt-10">
                <p className="font-outfit text-3xl font-bold text-white">{countries}</p>
                <p className="mt-1 max-w-[12rem] text-primary-200">Countries where our students study</p>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-2 right-0 hidden h-[85%] w-[42%] overflow-hidden rounded-tl-[40px] p-4 sm:block">
              <img ref={imgRef} loading="lazy" decoding="async"
                src="/graduation-hat-with-rolled-certificate-3d.webp"
                alt="Just Go Study student success story"
                className="h-full w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessSection;
