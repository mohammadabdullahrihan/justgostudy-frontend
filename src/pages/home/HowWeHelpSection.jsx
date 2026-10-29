import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);


const SERVICES = [
  {
    label: 'Student Counseling',
    title: 'Student Counseling',
    image: '/people-studying-together.webp',
    description:
      'Your first profile assessment and consultation session is completely free. We evaluate your academic background, career goals, and budget before recommending the destinations and universities that actually fit you.',
  },
  {
    label: 'Choose a Suitable University',
    title: 'Choose a Suitable University',
    image: '/hat-map-icon.webp',
    description:
      'We help you shortlist universities across the US, UK, Canada, Australia, New Zealand, and Europe based on your budget, academic profile, and long-term goals, not just rankings.',
  },
  {
    label: 'University & Course Matching',
    title: 'University & Course Matching',
    image: '/hat-book-3d-illustration_13391082.webp',
    description:
      'We shortlist verified universities and programs that fit your profile and career plans, factoring in tuition, IELTS/GPA requirements, and course structure, so every option you see is one you can realistically get into.',
  },
  {
    label: 'Scholarship Guidance',
    title: 'Scholarship Guidance',
    image: '/trophy-3d-illustration_13391041.webp',
    description:
      'Merit-based scholarships, tuition fee waivers of 10-50%, and full-ride government scholarships like Chevening, Fulbright, DAAD, and Stipendium Hungaricum, we actively identify and help you apply for the funding you are eligible for.',
  },
  {
    label: 'Bank Support',
    title: 'Bank Support',
    image: '/statement.webp',
    description:
      'Guidance on education loans, blocked/GIC accounts, forex arrangements, and preparing the bank statements and sponsor documentation your visa application actually needs.',
  },
  {
    label: 'Application Assistance',
    title: 'Application Assistance',
    image: '/pencil-red-checkmarks_69732480.webp',
    description:
      'Expert help crafting SOPs, gathering documents, and submitting a complete, error-free application, including the small requirements first-time applicants usually miss.',
  },
  {
    label: 'Visa Counseling',
    title: 'Visa Counseling',
    image: '/visa-and-ticket-3d-icon-png-download-8304615.webp',
    description:
      'We maintain a visa success rate of over 90% through rigorous document verification, financial proof audits, and mock interview sessions, so you walk into your actual interview prepared, not guessing.',
  },
  {
    label: 'Pre-departure and Arrival Support',
    title: 'Pre-departure and Arrival Support',
    image: '/travel.webp',
    description:
      'Pre-departure briefings on travel, culture, and what to expect, plus real settlement help once you land, from finding on-campus or shared accommodation to coordinating your airport pickup.',
  },
];

// Description opens in a navy popover below the item: on hover for
// mouse/trackpad, on tap for touch screens (no hover there), and on
// keyboard focus via the native button.
const SHOW_ON_HOVER =
  '[@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 group-has-[:focus-visible]:pointer-events-auto group-has-[:focus-visible]:translate-y-0 group-has-[:focus-visible]:opacity-100';

const ServiceItem = ({ service, featured, index }) => {
  const [open, setOpen] = useState(false);
  const imgRef = useRef(null);

  // Each card's illustration floats on its own cadence (varied by index) so
  // the row reads as alive, not eight identical cards bobbing in lockstep.
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.to(imgRef.current, {
      y: -10,
      rotate: index % 2 === 0 ? 3 : -3,
      duration: 2.4 + (index % 4) * 0.3,
      delay: (index % 4) * 0.15,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, [index]);

  return (
    <div
      data-reveal
      onMouseLeave={() => setOpen(false)}
      className="group relative flex w-full flex-col items-center text-center hover:z-20 focus-within:z-20 sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${service.title}: show details`}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-[260px] w-[260px] items-center justify-center rounded-[2.5rem] outline-none transition-[box-shadow,transform] duration-300 group-hover:-translate-y-1 group-hover:shadow-theme-md focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-4 ${
          featured ? 'bg-gradient-to-br from-primary-600 to-primary-800 shadow-theme-md' : 'bg-accent-50'
        }`}
      >
        <img
          ref={imgRef}
          src={service.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="max-h-44 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </button>

      {featured && (
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent-400 px-3 py-1 text-xs font-bold text-primary-950">
          Start here — it&apos;s free
        </span>
      )}

      <h3 className="mt-6 font-outfit text-xl font-semibold text-ink-900">{service.title}</h3>
      <p className="mt-1 text-xs text-ink-400 [@media(hover:hover)]:hidden">Tap the card for details</p>

      {/* Popover */}
      <div
        role="tooltip"
        className={`absolute left-1/2 top-full mt-4 w-80 -translate-x-1/2 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-7 text-left shadow-theme-md transition-[opacity,transform] duration-200 ease-out ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : `pointer-events-none -translate-y-2 opacity-0 ${SHOW_ON_HOVER}`
        }`}
      >
        <span className="absolute bottom-full left-1/2 -mb-1.5 h-3 w-3 -translate-x-1/2 rotate-45 bg-primary-600 [clip-path:polygon(0_0,100%_0,0_100%)]" />
        <span className="mb-3 block h-1 w-8 rounded-full bg-accent-400" />
        <p className="text-[15px] leading-relaxed text-primary-50">{service.description}</p>
        <Link
          to="/our-services"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-300 hover:text-accent-200"
        >
          Read More <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};

const HowWeHelpSection = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from('[data-reveal]', {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-cream-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal className="mb-14 text-center">
          <h2 className="font-outfit text-4xl font-bold text-ink-900 sm:text-5xl">Our Services</h2>
          <span className="mx-auto mt-5 block h-1 w-20 rounded-full bg-accent-400" />
        </div>

        {/* 4 + 4 on desktop; flex-wrap centres any shorter last row. */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-12">
          {SERVICES.map((s, idx) => (
            <ServiceItem key={s.title} service={s} featured={s.title === 'Student Counseling'} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeHelpSection;
