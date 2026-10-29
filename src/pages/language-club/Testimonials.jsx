import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Users, Star, Quote } from 'lucide-react';
import FlagIcon from '../../components/FlagIcon';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Helper: generate a consistent color from a name string (matches TestimonialsSection.jsx)
const getAvatarColor = (name) => {
  const colors = [
    { bg: 'bg-white/20', text: 'text-white' },
    { bg: 'bg-red-900/40', text: 'text-red-100' },
    { bg: 'bg-amber-400/30', text: 'text-amber-50' },
    { bg: 'bg-black/20', text: 'text-white' },
  ];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
};

const testimonials = [
  {
    name: 'Sadia Rahman',
    role: 'Dhaka · learning Japanese',
    languageId: 'japanese',
    stars: 5,
    text: 'I\'m prepping for the MEXT scholarship and needed JLPT N5 basics fast. Three weeks on Language Club and I could already read hiragana and introduce myself, completely free, which mattered a lot while I was also saving for application fees.',
  },
  {
    name: 'Hasan Mahmud',
    role: 'Chittagong · learning German',
    languageId: 'german',
    stars: 5,
    text: 'Applying for an Ausbildung in Germany means proving A2 German before the visa interview. The structured lessons here got my vocabulary interview-ready in about a month, and the quizzes caught the mistakes I kept repeating.',
  },
  {
    name: 'Fatema Akter',
    role: 'Sylhet · learning Korean',
    languageId: 'korean',
    stars: 5,
    text: 'Started because of K-dramas, honestly. Didn\'t expect to actually be able to read Hangul and hold a basic chat with Korean friends online after just a couple of weeks of flashcards on my commute.',
  },
  {
    name: 'Nusrat Jahan',
    role: 'Dhaka · learning Spanish',
    languageId: 'spanish',
    stars: 4,
    text: 'Used the Spanish course to prep for a backpacking trip through Spain. Ordering food, asking directions, small talk with locals, the phrase-first approach here is way more useful than the grammar drills I tried before.',
  },
  {
    name: 'Ariful Islam',
    role: 'Khulna · learning French',
    languageId: 'french',
    stars: 5,
    text: 'I\'m building up to the DELF exam for my Campus France file. The lesson structure lines up surprisingly well with what the exam actually tests, and I like that I can see exactly how many lessons I have left.',
  },
  {
    name: 'Tasnim Ahmed',
    role: 'Dhaka · learning English',
    languageId: 'english',
    stars: 5,
    text: 'My IELTS speaking score was the weak point in my whole university application. A few weeks of daily practice here got my confidence up enough that my actual test felt like a normal conversation.',
  },
];

const Testimonials = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const headerItems = gsap.utils.toArray(headerRef.current.children);
      gsap.set(headerItems, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: headerRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () =>
          gsap.to(headerItems, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            onComplete: () => gsap.set(headerItems, { clearProps: 'transform' }),
          }),
      });

      const cards = gsap.utils.toArray(gridRef.current.children);
      gsap.set(cards, { opacity: 0, y: 36 });
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () =>
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            onComplete: () => gsap.set(cards, { clearProps: 'transform' }),
          }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 bg-gradient-to-br from-red-700 via-red-600 to-red-600 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:26px_26px] opacity-40 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={headerRef} className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-6">
            <Users className="w-4 h-4 text-white" />
            <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-[0.2em]">
              Student Success
            </span>
          </div>

          <h2
            className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-6"
            style={{ fontFamily: '\'Outfit\', sans-serif' }}
          >
            What Our <span className="text-red-200">Learners Say</span>
          </h2>

          <p className="text-red-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join a growing community of{' '}
            <span className="text-white font-bold">language learners</span>{' '}
            around the world.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/30 rounded-3xl p-8 shadow-lg shadow-black/5 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <Quote className="absolute top-6 right-6 w-14 h-14 text-white/10 fill-white/10" strokeWidth={0} />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="relative text-white/95 text-[15px] font-medium leading-relaxed mb-6 flex-1">
                {t.text}
              </p>

              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div
                    className={`flex w-10 h-10 items-center justify-center rounded-full text-sm font-bold shadow-md ring-2 ring-white/20 ${getAvatarColor(t.name).bg} ${getAvatarColor(t.name).text}`}
                  >
                    {t.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-red-600 overflow-hidden">
                    <FlagIcon languageId={t.languageId} className="w-full h-full" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-red-100">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
