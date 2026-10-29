import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HIGHLIGHTS = [
  {
    title: 'Global Academic Network',
    description:
      'Partnerships with over 500 accredited universities and colleges across 70+ countries in the world, providing end-to-end guidance across diverse study levels, including Diploma, Bachelor’s, Master’s and Ph.D. programs.',
  },
  {
    title: 'High Success Rate',
    description: 'Maintains an impressive 90% visa success rate due to meticulous documentation and mock visa interview preparation.',
  },
  {
    title: 'Scholarship & Financial Aid Focus',
    description: 'Has helped students secure $2.5M+ in scholarships and financial grants.',
  },
  {
    title: 'Comprehensive Level Coverage',
    description: 'Programs mapped specifically for pre-university diplomas, undergraduate degrees, postgraduate studies, and research-focused doctorates (Ph.D.).',
  },
  {
    title: 'Student-First Philosophy',
    description: 'Profile shortlisting based strictly on student academic goals, career ambitions and budget.',
  },
];

const SERVICES = [
  {
    title: 'Personalized University & Program Shortlisting',
    description: 'Matching academic profiles, IELTS/PTE scores, and financial preferences with the best-fit global universities and courses.',
  },
  {
    title: 'Application & Profile Building',
    description: 'Assistance with crafting compelling Statements of Purpose (SOPs), Letters of Recommendation (LORs), resumes, and portfolio preparation.',
  },
  {
    title: 'Scholarship Search & Filing',
    description: 'Identifying merit-based and need-based institutional scholarships to reduce the overall tuition burden.',
  },
  {
    title: 'Visa Guidance & Counseling',
    description: 'Step-by-step assistance with financial documentation, embassy compliance, and simulated visa interview coaching.',
  },
  {
    title: 'Test Prep & Language Support',
    description: 'Free resources and Language Club access for IELTS, PTE, and TOEFL preparation.',
  },
  {
    title: 'Pre-Departure Briefing & Settlement',
    description: 'Orientation on flight booking, accommodation search, foreign exchange (Forex), and local lifestyle integration prior to departure.',
  },
];

const WHY_PREFER = [
  {
    title: 'Transparency',
    description: 'Clear, upfront policies with no hidden charges or misleading promises.',
  },
  {
    title: 'Experienced Counselors',
    description: 'Counselors with international exposure who offer real, actionable advice based on lived experience abroad.',
  },
  {
    title: 'Interactive Tools',
    description: 'Access to online calculators for estimating living costs, ROI on education, IELTS score bands, and visa timelines.',
  },
];

// Shared heading style for "About Just Go Study" + the three TextGroup
// labels below it, so all four read as one consistent family of section
// headings (same size, same brand-gold color) rather than one being a
// small white kicker and the rest being something else.
const SectionHeading = ({ children }) => (
  <h3 className="flex items-center gap-3 font-outfit text-2xl font-bold text-accent-400 sm:text-3xl">
    <span className="h-2 w-2 shrink-0 rounded-full bg-accent-400" />
    {children}
  </h3>
);

const TextGroup = ({ eyebrow, items }) => (
  <div className="mt-16">
    <SectionHeading>{eyebrow}</SectionHeading>
    <div className="mt-6 space-y-6">
      {items.map((item) => (
        <div key={item.title}>
          <h4 className="font-outfit text-lg font-bold text-white">{item.title}</h4>
          <p className="mt-1 text-lg leading-relaxed text-primary-100">{item.description}</p>
        </div>
      ))}
    </div>
  </div>
);

const AboutStorySection = () => {
  const sectionRef = useRef(null);
  const blobRef = useRef(null);
  const imageWrapRef = useRef(null);
  const captionRef = useRef(null);

  // The homepage "About Us" card's Read More link points at /about-us#about-story
  // — React Router doesn't auto-scroll to a hash on navigation, so land here
  // ourselves once this section has mounted. Routed through Lenis (same
  // convention as ScrollToTop/BookAppointment) rather than native
  // scrollIntoView, since Lenis owns the scroll position on this site and a
  // native call would just get fought/overridden by it. The small delay lets
  // the global ScrollToTop's jump-to-0 (which fires on every route change)
  // finish first, so this isn't immediately undone.
  useEffect(() => {
    if (window.location.hash !== '#about-story') return;
    const timer = setTimeout(() => {
      if (window.lenis) {
        window.lenis.scrollTo(sectionRef.current, { offset: -24 });
      } else {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return; // image + caption stay in their final, visible state

      gsap.set(blobRef.current, { opacity: 0, scale: 0.8, willChange: 'transform, opacity' });
      gsap.set(imageWrapRef.current, { opacity: 0, y: 40, scale: 0.85, rotate: -6, willChange: 'transform, opacity' });
      gsap.set(captionRef.current, { opacity: 0, y: 16, willChange: 'transform, opacity' });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          tl.to(blobRef.current, { opacity: 1, scale: 1, duration: 1 })
            .to(imageWrapRef.current, { opacity: 1, y: 0, scale: 1, rotate: -4, duration: 1, ease: 'back.out(1.5)' }, 0.1)
            .to(captionRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
            .add(() => {
              // gentle, continuous float once the entrance settles
              gsap.to(imageWrapRef.current, { y: -14, rotation: -2, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
            });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="about-story" ref={sectionRef} className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-700 to-primary-900 py-20 sm:py-28">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-16 lg:px-8">
        {/* ── Image, sticky on desktop so it stays in view while the long text scrolls ── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
            <div ref={blobRef} className="absolute inset-0 rounded-[46%_54%_61%_39%/56%_44%_56%_44%] bg-white/5 ring-1 ring-white/10" />
            <div ref={imageWrapRef} className="relative z-10 w-[64%]">
              <img
                src="/hat-map-icon.webp"
                alt="Graduation cap and rolled diploma, Just Go Study's mission to make world-class education accessible"
                className="w-full object-contain drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <p ref={captionRef} className="mx-auto mt-6 max-w-xs rounded-full border border-white/10 bg-white/10 px-5 py-2 text-center text-sm font-semibold italic text-white backdrop-blur-md">
            &quot;Turning study-abroad dreams into reality&quot;
          </p>
        </div>

        {/* ── Text, capped so lines stay comfortable to read on wide screens ── */}
        <div className="max-w-2xl">
          <SectionHeading>About Just Go Study</SectionHeading>

          <div className="mt-6 space-y-5">
            <p className="text-lg leading-relaxed text-primary-100">
              Just Go Study was established with a mission to simplify international education for students in
              Bangladesh. By combining one-on-one expert counseling with digital tools, the agency ensures a
              transparent, student-first approach to studying abroad.
            </p>
            <p className="text-lg leading-relaxed text-primary-100">
              From profile assessment to post-arrival orientation, the firm guides students through every step of
              their application journey, helping them gain admission to renowned institutions across the UK, USA,
              Canada, Australia, New Zealand, Europe, Gulf countries and Asia.
            </p>
          </div>

          <TextGroup eyebrow="Key Highlights & Strengths" items={HIGHLIGHTS} />
          <TextGroup eyebrow="Core Student Services" items={SERVICES} />
          <TextGroup eyebrow="Why Students Prefer Just Go Study" items={WHY_PREFER} />
        </div>
      </div>
    </section>
  );
};

export default AboutStorySection;
