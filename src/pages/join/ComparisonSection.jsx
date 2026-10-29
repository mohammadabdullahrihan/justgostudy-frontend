import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check, Minus } from 'lucide-react';
import { comparison } from './data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* A real <table>, the standard shape for a comparison, and the thing this
   section was only ever imitating. It used to be a grid-cols-12 div grid where
   every row floated as its own rounded-[2.5rem] pill, so the three columns never
   lined up and it read as a pile of cards rather than a comparison. One table
   also retires the duplicate desktop/mobile trees that rendered `comparison`
   twice; below ~38rem it scrolls inside its own container instead.

   The Just Go Study column is tinted navy end-to-end so the eye tracks it down
   the table; that column IS the point of the section. */
const ComparisonSection = () => {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const header = sectionRef.current.querySelector('.section-header');
      const rows = gsap.utils.toArray(sectionRef.current.querySelectorAll('.comparison-row'));

      gsap.set(header.children, { opacity: 0, y: 40 });
      gsap.set(cardRef.current, { opacity: 0, y: 40 });
      // Rows fade only: `transform` on a table-row is unreliable across engines,
      // and the card's own rise already supplies the movement.
      gsap.set(rows, { opacity: 0 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(header.children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
          gsap.to(cardRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 });
          gsap.to(rows, { opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.4 });
        },
      });
    },
    { scope: sectionRef }
  );

  const lastIndex = comparison.length - 1;

  return (
    <section ref={sectionRef} className="relative z-10 bg-white py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <div className="section-header mb-14 text-center">
          <h2 className="mb-6 font-outfit text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            The <span className="text-primary-600">Just Go Study</span> Advantage
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-medium text-ink-500">
            We&apos;ve redefined educational partnerships with transparency and technology.
          </p>
        </div>

        <div
          ref={cardRef}
          className="overflow-hidden rounded-[2rem] border border-cream-200 bg-white p-2 shadow-theme-md sm:p-4"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] border-separate border-spacing-0 text-left">
              <caption className="sr-only">
                How Just Go Study compares with other platforms across commission, support, reach and technology
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="w-[38%] px-5 pb-4 align-bottom text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500"
                  >
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="w-[31%] rounded-t-2xl bg-primary-600 px-5 py-4 text-center font-outfit text-sm font-bold text-white"
                  >
                    Just Go Study
                  </th>
                  <th
                    scope="col"
                    className="w-[31%] px-5 pb-4 text-center align-bottom text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500"
                  >
                    Other Platforms
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, i) => (
                  <tr key={item.feature} className="comparison-row">
                    <th scope="row" className="border-t border-cream-200 px-5 py-5 text-left align-middle font-normal">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-primary-600">
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className="font-outfit text-base font-bold text-ink-900">{item.feature}</span>
                      </span>
                    </th>

                    <td
                      className={`border-t border-primary-100 bg-primary-50/60 px-5 py-5 text-center ${
                        i === lastIndex ? 'rounded-b-2xl' : ''
                      }`}
                    >
                      <span className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary-700">
                        <Check className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                        {item.justGoStudy}
                      </span>
                    </td>

                    <td className="border-t border-cream-200 px-5 py-5 text-center">
                      <span className="inline-flex items-center justify-center gap-2 text-sm font-medium text-ink-500">
                        <Minus className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
                        {item.competitors}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
