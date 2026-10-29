import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Globe, GraduationCap, ShieldCheck, TrendingUp, Eye } from 'lucide-react';
import { aboutUsData } from '../../constants/pageContent';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const pillars = [
  {
    icon: Globe,
    title: 'Global Standards',
    desc: 'Setting the benchmark for international education consultancy across Asia and beyond.',
  },
  {
    icon: ShieldCheck,
    title: 'Ethical Practice',
    desc: 'Committed to transparency, fairness, and the highest standards of professional conduct.',
  },
  {
    icon: TrendingUp,
    title: 'Continuous Growth',
    desc: 'Expanding our network of universities and agents to serve more students every year.',
  },
];

const Vision = () => {
  const sectionRef = useRef(null);
  const visualRef = useRef(null);
  const contentRef = useRef(null);
  const dialRef = useRef(null);
  const compassRef = useRef(null);
  const tagRefs = useRef([]);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Compass ring rotates with scroll (parallax rotation)
      gsap.fromTo(
        compassRef.current,
        { rotation: 0 },
        {
          rotation: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        }
      );

      // Dashed eye dial keeps its slow infinite spin
      gsap.to(dialRef.current, { rotation: 360, duration: 20, repeat: -1, ease: 'none' });

      gsap.set(visualRef.current, { opacity: 0, scale: 0.92 });
      gsap.set(contentRef.current.children, { opacity: 0, x: 40 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          gsap.to(visualRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' });
          gsap.to(contentRef.current.children, { opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.2 });
        },
      });

      tagRefs.current.forEach((tagEl, i) => {
        if (!tagEl) return;
        gsap.to(tagEl, { y: i % 2 === 0 ? -8 : 8, duration: 4 + i, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="overflow-hidden border-b border-t border-cream-100 bg-white py-20">
      {/* Scroll-rotating compass motif */}
      <div ref={compassRef} className="pointer-events-none absolute left-[-80px] hidden h-72 w-72 opacity-30 will-change-transform lg:block">
        <svg viewBox="0 0 200 200" fill="none" className="h-full w-full" aria-hidden="true">
          <circle cx="100" cy="100" r="92" stroke="#aebbf4" strokeWidth="2" strokeDasharray="4 10" />
          <circle cx="100" cy="100" r="60" stroke="#3454e5" strokeWidth="1.5" strokeDasharray="2 8" />
          <path d="M100 30 L110 100 L100 170 L90 100 Z" fill="#3454e5" fillOpacity="0.25" />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-14 md:grid-cols-2">
          {/* Left visual */}
          <div ref={visualRef} className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-theme-lg">
              {/* Background image */}
              <img loading="lazy" decoding="async"
                src="https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80"
                alt="University campus vision"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-primary-950/80" />

              {/* Decorative circles */}
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-white">
                <div
                  ref={dialRef}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-dashed border-white/30 will-change-transform"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="mb-3 text-center font-outfit text-2xl font-extrabold">Our Vision</h3>
                <p className="mx-auto max-w-xs text-center text-sm leading-relaxed text-primary-100">
                  {aboutUsData.vision}
                </p>
              </div>

              {/* Floating tags */}
              <div
                ref={(tagEl) => { tagRefs.current[0] = tagEl; }}
                className="absolute right-4 top-4 rounded-xl border border-white/20 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
              >
                <Globe className="mr-1 inline h-3.5 w-3.5" /> Global Reach
              </div>
              <div
                ref={(tagEl) => { tagRefs.current[1] = tagEl; }}
                className="absolute bottom-4 left-4 rounded-xl border border-white/20 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
              >
                <GraduationCap className="mr-1 inline h-3.5 w-3.5" /> Student First
              </div>
            </div>
          </div>

          {/* Right content */}
          <div ref={contentRef}>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-600">
              <Eye className="h-3 w-3" />
              Our Vision
            </span>
            <h2 className="mb-5 mt-2 font-outfit text-3xl font-extrabold text-ink-900 md:text-4xl">
              Shaping the Future of <span className="text-primary-600">Global Education</span>
            </h2>
            <p className="mb-8 text-base leading-relaxed text-ink-600">
              {aboutUsData.vision}
            </p>

            <div className="space-y-4">
              {pillars.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-2xl border border-cream-100 bg-cream-50 p-4 transition-all duration-300 hover:border-primary-100 hover:bg-primary-50/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-theme-sm">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="mb-0.5 text-sm font-bold text-ink-900">{title}</h4>
                    <p className="text-xs leading-relaxed text-ink-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
