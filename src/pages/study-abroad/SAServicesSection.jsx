import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Hand, ArrowRight } from 'lucide-react';
import { services } from '../../constants/ourServices';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ServiceCard = ({ service }) => (
  <div className="group relative flex h-[440px] w-[320px] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-primary-700 to-primary-800 p-8 shadow-theme-md transition-all duration-300 hover:-translate-y-1 hover:shadow-theme-lg sm:w-[360px]">
    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-theme-md ${service.tint.bg}`}>
      <service.icon className="h-7 w-7" />
    </div>

    <h3 className="mt-6 font-outfit text-2xl font-bold leading-snug text-white">
      {service.title}
    </h3>

    <p className="mt-4 text-base leading-relaxed text-primary-200">
      {service.desc}
    </p>

    <Link
      to="/our-services"
      className="mt-auto inline-flex items-center gap-1.5 pt-6 text-base font-semibold text-white transition-colors hover:text-accent-300"
    >
      Read More <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

const DragHint = () => {
  const handRef = useRef(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.to(handRef.current, {
      x: 6,
      duration: 0.9,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-theme-md">
        <Hand ref={handRef} className="h-5 w-5 text-ink-500" />
      </div>
      <span className="text-xs font-medium text-ink-500">Slide to Read</span>
    </div>
  );
};

const SAServicesSection = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion || !trackRef.current?.children.length) return;

      gsap.set(trackRef.current.children, { opacity: 0, y: 30 });
      gsap.to(trackRef.current.children, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
        onComplete: () => gsap.set(trackRef.current.children, { clearProps: 'transform' }),
      });
    },
    { scope: sectionRef }
  );

  const onPointerDown = (e) => {
    drag.current = { active: true, startX: e.pageX, scrollLeft: trackRef.current.scrollLeft };
    trackRef.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    trackRef.current.scrollLeft = drag.current.scrollLeft - (e.pageX - drag.current.startX);
  };
  const onPointerUp = () => {
    drag.current.active = false;
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-cream-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 font-outfit text-4xl font-bold text-ink-900 sm:text-5xl">
          Services for Students
        </h2>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="flex snap-x snap-mandatory scroll-smooth cursor-grab select-none gap-6 overflow-x-auto py-2 pl-4 pr-4 active:cursor-grabbing sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8 xl:pl-[calc((100vw-80rem)/2+2rem)] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {services.map((service) => (
          <ServiceCard key={service.title} service={service} />
        ))}
      </div>

      <DragHint />
    </section>
  );
};

export default SAServicesSection;
