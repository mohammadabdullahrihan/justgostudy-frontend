import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Plus, ArrowUpRight } from 'lucide-react';
import * as faqService from '../../services/faqService';
import FaqSchema from '../../components/common/FaqSchema';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FAQSection = () => {
  const sectionRef = useRef(null);
  const asideRef = useRef(null);
  const listRef = useRef(null);
  const contentRefs = useRef([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    let ignore = false;
    faqService.getFaqs({ activeOnly: 'true', category: 'success' })
      .then((data) => { if (!ignore && Array.isArray(data)) setFaqs(data); })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useGSAP(
    () => {
      if (faqs.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.set(asideRef.current.children, { opacity: 0, y: 40 });
      gsap.set(listRef.current.children, { opacity: 0, y: 40 });
      gsap.set(contentRefs.current.filter(Boolean), { height: 0, opacity: 0 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(asideRef.current.children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
          gsap.to(listRef.current.children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.15 });
        },
      });
    },
    { scope: sectionRef, dependencies: [faqs] }
  );

  if (faqs.length === 0) return null;

  const toggleFaq = (idx) => {
    const opening = activeFaq !== idx;

    if (activeFaq !== null && activeFaq !== idx && contentRefs.current[activeFaq]) {
      gsap.to(contentRefs.current[activeFaq], { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut' });
    }
    if (contentRefs.current[idx]) {
      gsap.to(contentRefs.current[idx], {
        height: opening ? 'auto' : 0,
        opacity: opening ? 1 : 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    }
    setActiveFaq(opening ? idx : null);
  };

  return (
    <section ref={sectionRef} className="bg-cream-50 py-24 sm:py-28">
      <FaqSchema faqs={faqs} />
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-12">
          {/* Left rail, marker, headline, expert CTA */}
          <div ref={asideRef} className="lg:col-span-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-sans font-semibold tracking-widest text-ink-500">[05]</span>
              <span className="font-semibold uppercase tracking-widest text-ink-700">FAQ</span>
            </div>

            <h2 className="mt-8 font-outfit text-4xl font-extrabold leading-[0.98] tracking-tight text-ink-900 sm:text-5xl">
              Got <br /> Questions?
            </h2>

            <p className="mt-6 max-w-sm text-base leading-relaxed text-ink-500">
              We&apos;ve compiled the questions students ask us most. Still can&apos;t find what
              you&apos;re looking for?
            </p>

            {/* Brand-accent expert card */}
            <div className="mt-8 rounded-3xl bg-primary-700 p-8 text-white shadow-theme-lg">
              <h4 className="font-outfit text-xl font-bold">Talk to an Expert</h4>
              <p className="mt-2 text-sm leading-relaxed text-primary-100">
                Our senior counselors are ready to help you, for free.
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-accent-600 transition-all hover:-translate-y-0.5 hover:shadow-theme-md"
              >
                Book Free Session
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right, numbered accordion */}
          <div className="lg:col-span-8">
            <div ref={listRef} className="border-t border-ink-100">
              {faqs.map((item, idx) => {
                const open = activeFaq === idx;
                return (
                  <div key={item._id} className="border-b border-ink-100">
                    <button
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={open}
                      className="group flex w-full items-center gap-5 py-7 text-left sm:gap-6"
                    >
                      <span
                        className={`font-outfit text-lg font-bold tabular-nums transition-colors ${
                          open ? 'text-accent-500' : 'text-ink-500'
                        }`}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`flex-1 font-outfit text-lg font-bold transition-colors md:text-xl ${
                          open ? 'text-ink-900' : 'text-ink-800 group-hover:text-primary-600'
                        }`}
                      >
                        {item.question}
                      </span>
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                          open
                            ? 'bg-accent-500 text-white'
                            : 'bg-white text-ink-500 shadow-theme-sm group-hover:text-primary-600'
                        }`}
                      >
                        <Plus
                          className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
                          strokeWidth={2.5}
                        />
                      </span>
                    </button>
                    <div
                      ref={(el) => {
                        contentRefs.current[idx] = el;
                      }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-8 pl-10 text-base leading-relaxed text-ink-500 sm:pl-11">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
