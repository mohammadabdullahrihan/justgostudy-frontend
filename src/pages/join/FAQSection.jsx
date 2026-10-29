import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PlusCircle, MinusCircle, MessageSquare } from 'lucide-react';
import * as faqService from '../../services/faqService';
import FaqSchema from '../../components/common/FaqSchema';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* Monochrome accordion inside a white card on a flat grey field. The palette is
   the neutral end of the brand system, ink-* for type, cream-* for the field,
   dividers and the open row, so the flat grey look never reaches for a colour
   outside the tokens. This section intentionally drops the uppercase badge pill
   the other sections share; the reference has no badge above the heading. */
const FAQSection = () => {
  const sectionRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(0);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    let ignore = false;
    faqService.getFaqs({ activeOnly: 'true', category: 'join' })
      .then((data) => { if (!ignore && Array.isArray(data)) setFaqs(data); })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useGSAP(
    () => {
      if (faqs.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const header = sectionRef.current.querySelector('.section-header');
      const faqItems = gsap.utils.toArray(sectionRef.current.querySelectorAll('.faq-item'));

      gsap.set(header.children, { opacity: 0, y: 40 });
      gsap.set(faqItems, { opacity: 0, y: 40 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(header.children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
          gsap.to(faqItems, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.2 });
        },
      });
    },
    { scope: sectionRef, dependencies: [faqs] }
  );

  if (faqs.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative z-10 bg-cream-100 py-16 md:py-24">
      <FaqSchema faqs={faqs} />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-[2.5rem] border border-cream-200 bg-white px-5 py-14 shadow-theme-sm sm:px-10 md:px-16 md:py-20">
          <div className="section-header text-center">
            <h2 className="font-outfit text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-500">
              Everything you need to know about joining our global network.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-cream-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-theme-sm transition-colors hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-ink-900 text-white">
                <MessageSquare className="h-3 w-3" />
              </span>
              More Questions
            </Link>
          </div>

          <div className="mt-12">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              const isLast = i === faqs.length - 1;

              return (
                <div key={faq._id} className={`faq-item ${isOpen ? 'rounded-2xl bg-cream-100' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className={`flex w-full items-start justify-between gap-6 px-5 text-left transition-colors ${
                      isOpen ? 'pb-3 pt-5' : 'py-5'
                    } ${
                      // The open row is a filled card, so it carries no rule; the
                      // last closed row has nothing under it to divide from.
                      !isOpen && !isLast ? 'border-b border-cream-200' : ''
                    }`}
                  >
                    <span
                      className={`text-base leading-snug text-ink-900 sm:text-lg ${
                        isOpen ? 'font-bold' : 'font-medium'
                      }`}
                    >
                      {faq.question}
                    </span>
                    <span className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true">
                      {isOpen ? <MinusCircle className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 pr-12 text-sm leading-relaxed text-ink-500">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
