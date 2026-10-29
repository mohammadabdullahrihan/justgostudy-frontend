import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Send } from 'lucide-react';
import { subscribeNewsletter } from '../../services/studyService';
import { openNewsletterSuccessModal } from '../../hooks/useNewsletterSuccessModal';
import { toast } from 'react-hot-toast';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const NewsletterSection = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.set(contentRef.current.children, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () =>
          gsap.to(contentRef.current.children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }),
      });
    },
    { scope: sectionRef }
  );

  const handleSubscribe = async () => {
    if (!email) return;
    setSubscribing(true);
    try {
      await subscribeNewsletter(email);
      openNewsletterSuccessModal();
      setEmail('');
    } catch (error) {
      if (error.message === 'Already subscribed') {
        openNewsletterSuccessModal('primary', 'already');
        setEmail('');
      } else {
        toast.error(error.message || 'Subscription failed');
      }
    } finally {
      setSubscribing(false);
    }
  };

  return (
    /* mb-* matters here: the footer is its own primary-600->primary-950 card with
       no top margin, so this section's navy used to run straight into it and the
       two read as one block. The gap gives the footer card its own edge back. */
    <section
      ref={sectionRef}
      className="relative z-10 mb-16 overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 py-24 md:mb-24 md:py-32"
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/5 blur-[80px]" />
      <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-[60px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-8 lg:px-12">
        <div ref={contentRef}>
          <h2 className="mb-6 font-outfit text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Get Early Access &amp; Updates
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-primary-100">
            Be the first to know about new features, exclusive partnerships, and educational insights.
            Join our community of forward-thinking educators and institutions.
          </p>

          <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-full border-2 border-white/20 bg-white/10 px-6 py-4 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 focus:border-white/40 focus:bg-white/20 focus:outline-none"
            />
            <button
              disabled={subscribing}
              onClick={handleSubscribe}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-primary-600 shadow-theme-lg transition-all duration-300 hover:bg-primary-50 disabled:opacity-70 sm:w-auto"
            >
              {subscribing ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600/30 border-t-primary-600" />
              ) : (
                <>
                  Subscribe
                  <Send className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          <p className="mt-6 text-sm font-medium text-primary-200">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
