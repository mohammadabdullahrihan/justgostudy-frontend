import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check, ArrowRight, MoreHorizontal } from 'lucide-react';
import { roles } from './data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const RolesSection = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

      gsap.set(headerRef.current.children, { opacity: 0, y: 40 });
      gsap.set(gridRef.current.children, { opacity: 0, y: 60 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(headerRef.current.children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
          gsap.to(gridRef.current.children, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.2 });
        },
      });

      // Dashboard-preview chart bars grow in when each card enters
      gsap.utils.toArray('.role-chart').forEach((chart) => {
        const bars = chart.querySelectorAll('.role-bar');
        gsap.set(bars, { scaleY: 0, transformOrigin: 'bottom center' });
        ScrollTrigger.create({
          trigger: chart,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(bars, { scaleY: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out' }),
        });
      });

      // 3D tilt + glowing border on hover
      const cleanups = gsap.utils.toArray('.role-card').map((card) => {
        const glow = card.querySelector('.role-glow');
        const rxTo = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
        const ryTo = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        gsap.set(card, { transformPerspective: 1000 });

        const onMove = (e) => {
          const rect = card.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          ryTo(relX * 8);
          rxTo(-relY * 8);
        };
        const onEnter = () => gsap.to(glow, { opacity: 1, duration: 0.4 });
        const onLeave = () => {
          gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
          gsap.to(glow, { opacity: 0, duration: 0.4 });
        };

        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);
        return () => {
          card.removeEventListener('mousemove', onMove);
          card.removeEventListener('mouseenter', onEnter);
          card.removeEventListener('mouseleave', onLeave);
        };
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: sectionRef }
  );

  return (
    <section id="roles" ref={sectionRef} className="relative z-10 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div ref={headerRef} className="mb-20 text-center">
          <h2 className="mb-6 font-outfit text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            Tailored Solutions for <span className="text-primary-600">Every Partner</span>
          </h2>
          <p className="mx-auto max-w-xl text-base font-medium text-ink-500 sm:text-lg">
            Specialized tools and dedicated support for growing your institution.
          </p>
        </div>

        <div ref={gridRef} className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2" style={{ perspective: '1200px' }}>
          {roles.map((role) => (
            <div
              key={role.id}
              className="role-card group relative flex h-full flex-col rounded-[3.5rem] border border-cream-100 bg-white p-4 transition-colors duration-700 will-change-transform"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Glowing border (revealed on hover) */}
              {/* Brand navy halo. The middle stop used to be secondary-500
                  (rgba(26,184,148), the teal), so hovering lit a green band
                  across the card. Now it runs logo navy -> primary-400 -> navy. */}
              <div
                className="role-glow pointer-events-none absolute -inset-px rounded-[3.5rem] opacity-0"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(14,31,109,0.40), rgba(52,84,229,0.28), rgba(14,31,109,0.40))',
                  filter: 'blur(14px)',
                  zIndex: -1,
                }}
              />

              {/* Dashboard Preview / Mockup Area */}
              <div className="relative mb-8 h-64 w-full overflow-hidden rounded-[2.8rem] border border-cream-100 bg-cream-50 transition-colors duration-500 group-hover:border-primary-100 sm:h-72">
                <div className="absolute inset-0 flex flex-col p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                        <role.previewIcon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-ink-900">
                        {role.preview.title}
                      </span>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-ink-500" />
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-3">
                    {role.preview.stats.map((stat, i) => (
                      <div key={i} className="rounded-2xl border border-cream-100 bg-white p-4 shadow-theme-sm">
                        <div className="mb-1 text-[8px] font-bold uppercase tracking-widest text-ink-500">{stat.label}</div>
                        <div className="flex items-end justify-between">
                          <span className="text-sm font-bold text-ink-900">{stat.value}</span>
                          <span className="text-[8px] font-bold text-secondary-500">{stat.growth}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="role-chart flex flex-grow items-end gap-1.5 rounded-2xl border border-cream-100 bg-white p-4 shadow-theme-sm">
                    {role.preview.chart.map((val, i) => (
                      <div
                        key={i}
                        className="role-bar flex-grow rounded-t-md bg-primary-600/10 transition-colors duration-500 group-hover:bg-primary-600/30"
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0 bg-primary-600/0 transition-colors duration-500 group-hover:bg-primary-600/5" />
              </div>

              {/* Content Area */}
              <div className="px-6 pb-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-all duration-500 group-hover:bg-primary-600 group-hover:text-white">
                  <role.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-4 font-outfit text-2xl font-bold text-ink-900">{role.title}</h3>
                <p className="mb-4 text-sm font-medium leading-relaxed text-ink-500">{role.description}</p>
                <p className="mb-8 text-sm font-medium leading-relaxed text-ink-500">{role.strategy}</p>
                <div className="mb-10 space-y-3.5">
                  {role.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-ink-600">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50">
                        <Check className="h-3 w-3 text-primary-600" />
                      </div>
                      <span className="text-xs font-bold">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to={role.link}
                  className="flex w-full items-center justify-center rounded-full bg-primary-600 px-6 py-4 font-bold text-white shadow-theme-md transition-all duration-300 hover:bg-primary-500"
                >
                  Partner with Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
