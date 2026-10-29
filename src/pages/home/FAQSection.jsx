import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, MessageCircle, Plus } from 'lucide-react';
import * as faqService from '../../services/faqService';
import FaqSchema from '../../components/common/FaqSchema';

const FAQItem = ({ faq, isOpen, onToggle, isLast }) => {
  return (
    <div
      className={`transition-colors duration-300 ${
        isOpen ? 'rounded-3xl bg-primary-600 px-6 py-6 sm:px-8' : `px-1 py-6 ${!isLast ? 'border-b border-ink-100' : ''}`
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-6 text-left"
      >
        <div className="flex-1">
          <span className={`text-lg font-bold sm:text-xl ${isOpen ? 'text-white' : 'text-ink-900'}`}>{faq.question}</span>
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="mt-3 leading-relaxed text-primary-100">{faq.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            isOpen ? 'bg-primary-400 text-white' : 'text-ink-500'
          }`}
        >
          {isOpen ? <Minus size={16} /> : <Plus size={20} />}
        </div>
      </button>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    let ignore = false;
    faqService.getFaqs({ activeOnly: 'true', category: 'homepage' })
      .then((data) => { if (!ignore && Array.isArray(data)) setFaqs(data); })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="relative bg-cream-50 py-24">
      <FaqSchema faqs={faqs} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-primary-500 px-4 py-1.5 text-xs font-semibold text-primary-100">
            Frequently Asked Questions
          </span>
          <h2 className="mt-4 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
            Your Questions, Answered
          </h2>
          <p className="mt-4 text-ink-600">
            Explore the answers to frequently asked questions about our platform and application process.
          </p>
        </div>

        <div>
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq._id}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
              isLast={index === faqs.length - 1}
            />
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-primary-600 p-8 text-center">
          <h3 className="mb-2 text-xl font-bold text-white">Still have questions?</h3>
          <p className="mb-4 text-primary-100">Can&apos;t find what you&apos;re looking for? Contact our support team.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-400"
          >
            <MessageCircle size={18} />
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
