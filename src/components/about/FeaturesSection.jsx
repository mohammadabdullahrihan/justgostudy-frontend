import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check, ChevronRight, TrendingUp, Award } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const features = [
  { label: 'University & Program Shortlisting', desc: 'Matching your academic profile, IELTS/PTE scores, and budget with the best-fit global universities and courses.' },
  { label: 'Application & Profile Building', desc: 'Crafting compelling SOPs, LORs, resumes, and portfolios that make your application stand out.' },
  { label: 'Scholarship Search & Filing', desc: 'Identifying merit- and need-based institutional scholarships to reduce your overall tuition burden.' },
  { label: 'Visa Guidance & Counseling', desc: 'Step-by-step help with financial documentation, embassy compliance, and mock visa interviews.' },
  { label: 'Test Prep & Language Support', desc: 'Free resources and Language Club access for IELTS, PTE, and TOEFL preparation.' },
  { label: 'Pre-Departure Briefing & Settlement', desc: 'Orientation on flights, accommodation, forex, and local lifestyle before you depart.' },
];

const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const imageRef = useRef(null);

  useGSAP(
    () => {
      gsap.set(listRef.current.children, { opacity: 0, y: 20 });
      gsap.set('.feature-image', { opacity: 0, scale: 0.9 });
      gsap.set('.feature-badge', { opacity: 0, scale: 0.7, y: 10 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });

      tl.to('.feature-image', { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' })
        .to('.feature-badge', { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.15, ease: 'back.out(1.6)' }, 0.3)
        .to(listRef.current.children, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, 0.2);

      // subtle parallax on the image as the section scrolls
      gsap.to(imageRef.current, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-primary-600 p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Image + floating cards */}
            <div className="relative h-[380px] sm:h-[440px]">
              {/* Doodle decorations */}
              <svg className="pointer-events-none absolute -top-2 left-6 h-14 w-14 text-primary-200" viewBox="0 0 64 64" fill="none">
                <path d="M4 40C10 16 16 40 22 22C28 6 34 30 40 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <svg className="pointer-events-none absolute right-8 top-2 h-10 w-10 text-secondary-400" viewBox="0 0 40 40" fill="none">
                <path d="M4 4C10 10 4 16 10 22C16 28 10 34 16 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>

              <div
                ref={imageRef}
                className="feature-image absolute inset-x-4 bottom-0 top-6 flex items-center justify-center overflow-hidden rounded-[40px] bg-gradient-to-br from-primary-100 via-cream-50 to-secondary-100 p-10 shadow-2xl shadow-primary-900/10 ring-1 ring-white/60"
              >
                {/* soft radial spotlight behind the object */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.55),transparent_62%)]" />
                <img loading="lazy" decoding="async"
                  src="/book-for-education.webp"
                  alt="Graduation cap on a stack of books"
                  className="relative h-full w-full object-contain drop-shadow-xl"
                />
              </div>

              <div className="feature-badge absolute -left-4 top-10 w-44 rounded-2xl border border-ink-100 bg-white/90 p-4 shadow-2xl shadow-primary-900/10 ring-1 ring-white/60 backdrop-blur-md sm:-left-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Visa Success</p>
                </div>
                <p className="mt-3 font-outfit text-3xl font-extrabold leading-none text-ink-900">90%</p>
                <Link
                  to="/study-abroad"
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  View all <ChevronRight size={14} />
                </Link>
              </div>

              <div className="feature-badge absolute -right-4 bottom-8 w-56 rounded-2xl border border-ink-100 bg-white/90 p-4 shadow-2xl shadow-primary-900/10 ring-1 ring-white/60 backdrop-blur-md sm:-right-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 shadow-sm">
                    <Award className="h-4 w-4 text-white" />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Scholarship Match</p>
                </div>
                <p className="mt-3 font-outfit text-3xl font-extrabold leading-none text-ink-900">72%</p>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary-600 to-secondary-500" />
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <span className="inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-ink-600 shadow-sm">
                Core Student Services
              </span>
              <h2 className="mt-4 font-outfit text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Everything You Need to Study Abroad
              </h2>
              <p className="mt-4 text-primary-100">
                From your first shortlist to the day you land, we cover every step of the journey.
              </p>

              <ul ref={listRef} className="mt-8">
                {features.map((feature, index) => (
                  <li
                    key={feature.label}
                    className={`flex items-start gap-4 py-5 ${index < features.length - 1 ? 'border-b border-white/10' : ''}`}
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500">
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </span>
                    <div>
                      <h3 className="font-outfit text-lg font-bold text-white">{feature.label}</h3>
                      <p className="mt-0.5 text-primary-100">{feature.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
