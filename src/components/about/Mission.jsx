import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { UserCheck, ShieldCheck, Sparkles, Wallet, Rocket, Building2, Target, Quote } from 'lucide-react';
import { aboutUsData } from '../../constants/pageContent';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Map aboutUsData.values to the format expected by Mission component
const values = aboutUsData.values.map((value, i) => ({
  icon: [UserCheck, ShieldCheck, Sparkles, Wallet][i],
  title: value,
  desc: [
    'Putting the student\'s genuine career and academic goals ahead of corporate partnerships.',
    'Providing honest, transparent assessments of visa chances, costs, and university rankings.',
    'Tailoring strategies directly to a student\'s unique academic and professional profile.',
    'Actively hunting for scholarships and stipends to make global study affordable.',
  ][i],
  color: ['from-primary-400 to-primary-600', 'from-primary-500 to-primary-700', 'from-secondary-400 to-secondary-600', 'from-primary-600 to-primary-800'][i],
}));

// Large philosophical "wing", rotates slowly with scroll (parallax rotation)
const WingSVG = ({ className }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      <path
        key={i}
        d={`M100 100 Q ${130 + i * 14} ${60 - i * 10} ${185 - i * 6} ${30 + i * 18}`}
        stroke="#3454e5"
        strokeOpacity={0.5 - i * 0.08}
        strokeWidth={5 - i * 0.7}
        strokeLinecap="round"
      />
    ))}
    <circle cx="100" cy="100" r="10" fill="#3454e5" fillOpacity="0.35" />
    <circle cx="100" cy="100" r="4" fill="#0e1f6d" />
  </svg>
);

const Mission = () => {
  const sectionRef = useRef(null);
  const wingRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const floatRefs = useRef([]);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Wing rotates slowly as the section scrolls through the viewport
      gsap.fromTo(
        wingRef.current,
        { rotation: -25 },
        {
          rotation: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        }
      );

      gsap.set(headerRef.current.children, { opacity: 0, y: 30 });
      gsap.set(imageRef.current, { opacity: 0, x: -50 });
      gsap.set(contentRef.current.children, { opacity: 0, y: 30 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          tl.to(headerRef.current.children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 })
            .to(imageRef.current, { opacity: 1, x: 0, duration: 0.8 }, 0.2)
            .to(contentRef.current.children, {
              opacity: 1, y: 0, duration: 0.7, stagger: 0.1,
              // release inline transforms so CSS hover lifts on the value cards work
              onComplete: () => gsap.set(contentRef.current.children, { clearProps: 'transform' }),
            }, 0.35);
        },
      });

      // Floating stat cards
      floatRefs.current.forEach((floatCardEl, i) => {
        if (!floatCardEl) return;
        gsap.to(floatCardEl, { y: i % 2 === 0 ? -8 : 8, duration: 4 + i, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-24">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-100 opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary-100 opacity-40 blur-3xl" />

      {/* Scroll-rotating wing */}
      <div ref={wingRef} className="pointer-events-none absolute right-[-60px] top-16 h-64 w-64 opacity-60 will-change-transform md:right-8">
        <WingSVG className="h-full w-full" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div ref={headerRef} className="mb-16 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-600">
            <Target className="h-3 w-3" />
            Our Mission
          </span>
          <h2 className="mt-1 font-outfit text-3xl font-extrabold leading-tight text-ink-900 md:text-4xl lg:text-5xl">
            Making World-Class Education <span className="text-primary-600">Accessible</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-500">
            {aboutUsData.mission}
          </p>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-20">
          {/* Left, Image Panel */}
          <div ref={imageRef} className="relative">
            {/* Decorative dot grid behind image */}
            <div
              className="pointer-events-none absolute -left-5 -top-5 z-0 h-32 w-32 opacity-25"
              style={{ backgroundImage: 'radial-gradient(circle, #3454e5 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}
            />
            {/* Decorative border accent */}
            <div className="absolute left-4 top-4 z-0 h-full w-full rounded-3xl border-2 border-primary-100" />

            <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-3xl shadow-theme-lg">
              <img loading="lazy" decoding="async"
                src="https://images.pexels.com/photos/37324146/pexels-photo-37324146.jpeg"
                alt="University students celebrating graduation"
                className="h-full w-full scale-105 object-cover object-center transition-transform duration-700 hover:scale-100"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-primary-900/10 to-transparent" />
              {/* Bottom text overlay */}
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-sm font-semibold text-white drop-shadow-md">
                  &quot;Turning study-abroad dreams into reality&quot;
                </p>
              </div>
            </div>

            {/* Floating stat cards */}
            <div
              ref={(floatCardEl) => { floatRefs.current[0] = floatCardEl; }}
              className="absolute -bottom-6 -right-4 z-20 min-w-[150px] rounded-2xl border border-primary-50 bg-white px-4 py-3 shadow-theme-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-theme-md">
                  <Rocket className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-ink-900">5,000+</p>
                  <p className="text-[10px] font-medium text-ink-500">Dreams Achieved</p>
                </div>
              </div>
            </div>

            <div
              ref={(floatCardEl) => { floatRefs.current[1] = floatCardEl; }}
              className="absolute -right-4 -top-4 z-20 min-w-[140px] rounded-2xl border border-primary-50 bg-white px-4 py-3 shadow-theme-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-theme-md">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-ink-900">120+</p>
                  <p className="text-[10px] font-medium text-ink-500">Universities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right, Text + Value Cards */}
          <div ref={contentRef}>
            {/* Highlighted quote block */}
            <div className="mb-6 flex gap-3 rounded-2xl border-l-4 border-primary-500 bg-primary-50 p-4">
              <Quote className="mt-0.5 h-6 w-6 shrink-0 text-primary-300" />
              <p className="text-sm font-medium italic leading-relaxed text-primary-800">
                We believe every student deserves access to quality international education,
                regardless of where they come from.
              </p>
            </div>

            <p className="mb-4 text-base leading-relaxed text-ink-600">
              {aboutUsData.history}
            </p>

            {/* Value Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {values.map(({ icon: Icon, title, desc, color }) => (
                <div
                  key={title}
                  className="cursor-default rounded-2xl border border-cream-100 bg-white p-4 shadow-theme-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-theme-md"
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-theme-sm`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="mb-1 text-sm font-bold text-ink-900">{title}</h4>
                  <p className="text-xs leading-relaxed text-ink-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
