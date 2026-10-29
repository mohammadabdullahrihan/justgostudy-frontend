import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Search, Send, Award } from 'lucide-react';
import successService from '../../services/successService';
import { FALLBACK_PARTNER_UNIVERSITIES } from '../../constants/successStats';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// University count in `desc` below is overwritten with the live,
// admin-managed figure once it loads (see the fetch below).
const buildDifferentiators = (partnerUniversities) => [
  {
    icon: Search,
    title: 'Personalized University Matching',
    desc: 'We match you with programs filtered by country, tuition and IELTS score, shortlists built around your goals, never a sales target.',
    chip: 'bg-white/15 text-white',
  },
  {
    icon: Send,
    title: 'Guided Application & Tracking',
    desc: 'A dedicated consultant walks you through every application while you track each step in real time, right up to your offer letter.',
    chip: 'bg-white/15 text-accent-400',
  },
  {
    icon: Award,
    title: 'Visa & Scholarship Support',
    desc: `Expert visa filing and scholarship guidance, backed by a 90% visa success rate across ${partnerUniversities} universities we work with.`,
    chip: 'bg-white/15 text-white',
  },
];

const WhatMakesUsDifferent = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const imgTagRef = useRef(null);
  const contentRef = useRef(null);
  const [partnerUniversities, setPartnerUniversities] = useState(FALLBACK_PARTNER_UNIVERSITIES);
  const differentiators = buildDifferentiators(partnerUniversities);

  // Same admin-managed source (/admin/success) the rest of the site reads
  // from, so this number never drifts from the real, current count.
  useEffect(() => {
    let ignore = false;
    successService
      .getAllSuccess()
      .then((res) => {
        if (ignore) return;
        const stat = res?.data?.find((s) => /universit/i.test(s.title || ''));
        if (stat?.value) setPartnerUniversities(stat.value);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.utils.toArray('[data-reveal]').forEach((group) => {
        const targets = group.hasAttribute('data-reveal-children') ? group.children : [group];
        gsap.set(targets, { opacity: 0, y: 32 });
        ScrollTrigger.create({
          trigger: group,
          start: 'top 85%',
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.1,
              ease: 'power3.out',
              onComplete: () => gsap.set(targets, { clearProps: 'transform' }),
            }),
        });
      });

      // Image slides from left, cards from right
      gsap.set(imageRef.current, { opacity: 0, x: -40 });
      gsap.set(contentRef.current.children, { opacity: 0, x: 40 });
      ScrollTrigger.create({
        trigger: imageRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(imageRef.current, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' });
          gsap.to(contentRef.current.children, {
            opacity: 1,
            x: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: 'power3.out',
            delay: 0.15,
            onComplete: () => gsap.set(contentRef.current.children, { clearProps: 'transform' }),
          });
        },
      });

      // Always-on idle float, independent of the entrance ScrollTrigger so
      // it still runs if the section is already in view on load.
      gsap.to(imgTagRef.current, {
        y: -12,
        rotate: -1.5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-b from-white via-cream-50 to-cream-50 py-24">

      {/* Background decorations */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 -translate-x-0 translate-y-1/2 rounded-full bg-secondary-100 opacity-30 blur-3xl" />
      <div
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #3454e5 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header, title left, intro right */}
        <div data-reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-ink-900 leading-tight">
            What Makes Us{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">
              Different
            </span>
          </h3>
          <p className="text-ink-500 text-sm leading-relaxed md:max-w-sm">
            Unlike generic directories, Just Go Study gives you end-to-end guided support, from
            discovery to enrollment, backed by a network of vetted professionals.
          </p>
        </div>

        {/* Content, image left, feature cards right */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">

          {/* Left, image */}
          <div
            ref={imageRef}
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-white to-secondary-50 shadow-2xl shadow-primary-500/15 min-h-[360px] p-10"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: 'radial-gradient(circle, #0e1f6d 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
            />
            <img
              ref={imgTagRef}
              src="/pencil-red-checkmarks_69732480.webp"
              alt="Application checklist tracked step by step with Just Go Study"
              className="relative z-10 w-full max-w-sm object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="relative z-10 mt-6 text-center">
              <p className="text-ink-900 text-sm font-bold">Expert-Guided Process</p>
              <p className="text-ink-500 text-xs mt-0.5">From application to enrollment</p>
            </div>
          </div>

          {/* Right, feature cards */}
          <div ref={contentRef} className="flex flex-col gap-5">
            {differentiators.map(({ icon: Icon, title, desc, chip }) => (
              <div
                key={title}
                className="group flex-1 rounded-3xl border border-white/10 bg-primary-700 p-6 shadow-theme-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-theme-lg will-change-transform md:p-7"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-theme-sm ${chip}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-5 text-lg md:text-xl font-extrabold text-white leading-snug">
                  {title}
                </h4>
                <p className="mt-2 text-sm text-primary-100 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatMakesUsDifferent;
