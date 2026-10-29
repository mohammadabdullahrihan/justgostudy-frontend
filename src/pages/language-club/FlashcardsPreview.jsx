import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Book, Target, Zap, Layers, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FlashcardsPreview = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const cardWrapRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const contentItems = gsap.utils.toArray(contentRef.current.children);

      if (reduceMotion) {
        gsap.set([...contentItems, cardWrapRef.current], { opacity: 1, x: 0 });
        return;
      }

      gsap.set(contentItems, { opacity: 0, x: 40 });
      gsap.set(cardWrapRef.current, { opacity: 0, x: -40 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(contentItems, {
            opacity: 1,
            x: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power3.out',
            onComplete: () => gsap.set(contentItems, { clearProps: 'transform' }),
          });
          gsap.to(cardWrapRef.current, {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: 'power3.out',
            onComplete: () => {
              gsap.set(cardWrapRef.current, { clearProps: 'transform' });
              // gentle perpetual float + flip loop, driven off the React render cycle
              gsap.to(cardWrapRef.current, { y: -10, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
              gsap
                .timeline({ repeat: -1, repeatDelay: 1.6 })
                .to(cardRef.current, { rotationY: 180, duration: 0.9, ease: 'power2.inOut' })
                .to(cardRef.current, { rotationY: 180, duration: 1.6 })
                .to(cardRef.current, { rotationY: 360, duration: 0.9, ease: 'power2.inOut' })
                .set(cardRef.current, { rotationY: 0 });
            },
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div ref={contentRef} className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full mb-6">
              <Layers size={14} className="fill-red-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Vocabulary Flashcards
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: '\'Outfit\', sans-serif' }}
            >
              Learn with Interactive{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                Flashcards
              </span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Our 3D flashcard system helps you memorize new words faster.
              Each card includes pronunciation and real-world examples.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                {
                  icon: <Zap size={18} className="text-amber-500" />,
                  text: 'Fast Memorization',
                },
                {
                  icon: <Target size={18} className="text-red-500" />,
                  text: 'Correct Pronunciation',
                },
                {
                  icon: <Layers size={18} className="text-red-500" />,
                  text: 'Easy Practice',
                },
                {
                  icon: <Book size={18} className="text-emerald-500" />,
                  text: 'Real Examples',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_10px_-6px_rgba(14,16,23,0.08)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {item.icon}
                  <span className="text-sm font-bold text-gray-700">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/language-club/flashcards"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              Start Flashcards
              <ArrowRight size={20} />
            </Link>
          </div>

          <div ref={cardWrapRef} className="lg:w-1/2 relative will-change-transform">
            {/* Flashcard Preview Animation */}
            <div className="relative h-[350px] w-full max-w-[400px] mx-auto" style={{ perspective: '1200px' }}>
              <div
                ref={cardRef}
                className="w-full h-full bg-white rounded-[32px] shadow-2xl border-2 border-red-100 flex items-center justify-center relative overflow-hidden will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="text-center p-8" style={{ backfaceVisibility: 'hidden' }}>
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">
                    Bonjour
                  </h3>
                  <p className="text-red-600 font-mono italic">/bɔ̃.ʒuʁ/</p>
                </div>
                {/* Back side text (mirror) */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-red-600 text-white [transform:rotateY(180deg)]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-center">
                    <h3 className="text-3xl font-bold mb-2">Hello</h3>
                    <p className="text-red-100 text-sm">French Greeting</p>
                  </div>
                </div>
              </div>
              {/* Decoration */}
              <div className="absolute -z-10 top-10 left-10 w-full h-full bg-red-50 rounded-[32px] transform -rotate-6" />
              <div className="absolute -z-20 top-20 left-20 w-full h-full bg-red-100/50 rounded-[32px] transform rotate-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashcardsPreview;
