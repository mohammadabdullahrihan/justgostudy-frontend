import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { Earth, Book, Users, BookOpen, Mic, Headphones, GraduationCap, Sparkles } from 'lucide-react';

gsap.registerPlugin(useGSAP);

/* Decorative alphabet glyphs drifting behind the hero, a different letter
   system per glyph to hint at 'many languages' without needing real flags. */
const glyphs = [
  { char: 'A', className: 'top-[15%] left-[8%] text-5xl', duration: 6, rotate: 5 },
  { char: 'あ', className: 'top-[22%] right-[8%] text-6xl', duration: 7.5, rotate: -8 },
  { char: 'ñ', className: 'bottom-[20%] left-[12%] text-5xl', duration: 5.5, rotate: 10 },
  { char: 'ü', className: 'bottom-[25%] right-[10%] text-6xl', duration: 8.5, rotate: -5 },
  { char: 'B', className: 'top-[45%] right-[18%] text-5xl', duration: 7, rotate: 12 },
  { char: 'অ', className: 'top-[45%] left-[18%] text-5xl', duration: 6.5, rotate: -10 },
];

const orbitIcons = [
  {
    className: 'top-1/4 right-[15%] w-10 h-10 opacity-20',
    duration: 3,
    d: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253',
  },
  {
    className: 'top-1/3 left-[10%] w-9 h-9 opacity-15',
    duration: 4,
    d: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
  {
    className: 'bottom-1/4 right-[25%] w-9 h-9 opacity-15',
    duration: 3.5,
    d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
];

const HeroSection = ({ statsRef, countLangs, countLessons, countLearners }) => {
  const sectionRef = useRef(null);
  const badgeRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const masterRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const statsWrapRef = useRef(null);
  const glyphRefs = useRef([]);
  const iconRefs = useRef([]);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const split = new SplitType(line1Ref.current, { types: 'words', tagName: 'span' });

      if (reduceMotion) {
        gsap.set(
          [badgeRef.current, split.words, line2Ref.current, masterRef.current, subRef.current, ctaRef.current, statsWrapRef.current?.children],
          { opacity: 1, y: 0, scale: 1 }
        );
        return () => split.revert();
      }

      gsap.set(split.words, { opacity: 0, y: 28 });
      gsap.set([badgeRef.current, masterRef.current, subRef.current], { opacity: 0, y: 16 });
      gsap.set(line2Ref.current, { opacity: 0, y: 20, scale: 0.96 });
      gsap.set(ctaRef.current?.children, { opacity: 0, y: 14 });
      gsap.set(statsWrapRef.current?.children, { opacity: 0, y: 24 });

      const glyphEls = glyphRefs.current.filter(Boolean);
      const iconEls = iconRefs.current.filter(Boolean);
      gsap.set(glyphEls, { opacity: 0, scale: 0.5 });
      gsap.set(iconEls, { opacity: 0, scale: 0.5 });

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to(badgeRef.current, { opacity: 1, y: 0, duration: 0.5 })
        .to(split.words, { opacity: 1, y: 0, duration: 0.7, stagger: 0.05 }, '-=0.2')
        .to(line2Ref.current, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, '-=0.35')
        .to(masterRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .to(subRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.25')
        .to(ctaRef.current?.children, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.2')
        .to(
          statsWrapRef.current?.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            onComplete: () => gsap.set(statsWrapRef.current?.children, { clearProps: 'transform' }),
          },
          '-=0.15'
        )
        .to(
          [...glyphEls, ...iconEls],
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: 'back.out(2)',
            onComplete: () => {
              glyphEls.forEach((el, i) => {
                const { duration, rotate } = glyphs[i];
                gsap.to(el, { y: -16, rotation: rotate, duration, yoyo: true, repeat: -1, ease: 'sine.inOut' });
              });
              iconEls.forEach((el, i) => {
                const { duration } = orbitIcons[i];
                gsap.to(el, { y: -18, duration, yoyo: true, repeat: -1, ease: 'sine.inOut' });
              });
            },
          },
          '-=0.8'
        );

      return () => split.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-red-50/40 to-red-100/30"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-100/20 rounded-full blur-3xl"></div>

      {/* Floating decorative icons */}
      {orbitIcons.map((icon, i) => (
        <div
          key={i}
          ref={(el) => { iconRefs.current[i] = el; }}
          className={`absolute ${icon.className} will-change-transform`}
        >
          <svg className="w-full h-full text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon.d} />
          </svg>
        </div>
      ))}

      {/* Floating background letters/characters */}
      {glyphs.map((g, i) => (
        <div
          key={g.char}
          ref={(el) => { glyphRefs.current[i] = el; }}
          className={`absolute ${g.className} font-extrabold text-red-500/10 pointer-events-none select-none will-change-transform font-outfit`}
        >
          {g.char}
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-44 lg:pb-36">
        <div className="max-w-4xl mx-auto text-center font-outfit-all">
          {/* Welcome & Headline Section */}
          <div className="mb-10">
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.25]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span
                ref={badgeRef}
                className="block text-lg sm:text-xl lg:text-2xl font-bold text-red-600 mb-6 tracking-[0.2em] uppercase"
              >
                Welcome to
              </span>
              <span ref={line1Ref} className="text-gray-900 inline-block">Just Go Study </span>
              <br />
              <span
                ref={line2Ref}
                className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-600 inline-block pb-2"
              >
                Language Club
              </span>
            </h1>

            <div ref={masterRef} className="mt-8 flex items-center justify-center gap-4">
              <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-red-200"></div>
              <p className="text-lg sm:text-2xl font-semibold text-gray-700 flex items-center gap-2">
                Master{' '}
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg font-bold border border-red-100 shadow-sm">
                  21+
                </span>{' '}
                Languages
              </p>
              <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-red-200"></div>
            </div>
          </div>

          {/* Subtext */}
          <p ref={subRef} className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Learn from scratch. Free. Interactive.
            <br className="hidden sm:block" />
            Start learning a new language today.
          </p>

          {/* CTA */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/language-club/explore"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-red-600 font-bold rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-red-100"
            >
              <span className="relative z-10">Start Exploring</span>
              <svg
                className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-4 text-gray-600 hover:text-red-600 font-medium transition-colors duration-200"
            >
              Learn More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>

          {/* Animated Stats */}
          <div ref={statsRef} className="mt-20">
            <div ref={statsWrapRef} className="grid grid-cols-3 gap-4 sm:gap-8">
              {[
                { value: countLangs, suffix: '+', label: 'Languages', icon: <Earth className="w-5 h-5 sm:w-6 sm:h-6" /> },
                { value: countLessons, suffix: '+', label: 'Lessons', icon: <Book className="w-5 h-5 sm:w-6 sm:h-6" /> },
                { value: countLearners, suffix: '+', label: 'Learners', icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" /> },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative p-4 sm:p-6 bg-white/50 backdrop-blur-sm border border-red-100 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex justify-center text-red-500 mb-3 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <p className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {stat.value.toLocaleString()}
                    <span className="text-red-600">{stat.suffix}</span>
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mt-2 uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Exam prep marketing strip */}
            <div className="mt-14 pt-10 border-t border-red-100/70">
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-[0.2em]">
                    Also Preparing You For
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-8">
                {[
                  { label: 'IELTS', score: '9', unit: 'Band Scale', icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />, to: '/language-club/exam-prep/ielts' },
                  { label: 'PTE', score: '90', unit: 'Score Scale', icon: <Mic className="w-5 h-5 sm:w-6 sm:h-6" />, to: '/language-club/exam-prep/pte' },
                  { label: 'TOEFL', score: '120', unit: 'Score Scale', icon: <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />, to: '/language-club/exam-prep/toefl' },
                  { label: 'GRE', score: '340', unit: 'Max Score', icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />, to: '/language-club/exam-prep/gre-gmat' },
                  { label: 'GMAT', score: '805', unit: 'Max Score', icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />, to: '/language-club/exam-prep/gre-gmat' },
                ].map((exam) => (
                  <Link
                    key={exam.label}
                    to={exam.to}
                    className="relative p-4 sm:p-6 bg-white/50 backdrop-blur-sm border border-red-100 hover:border-red-300 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group text-center"
                  >
                    <div className="flex justify-center text-red-500 mb-3 group-hover:scale-110 transition-transform duration-300">
                      {exam.icon}
                    </div>
                    <p className="text-3xl sm:text-5xl font-extrabold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {exam.score}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mt-2 uppercase tracking-widest">
                      {exam.label}
                    </p>
                    <p className="text-[10px] sm:text-xs font-semibold text-red-600 mt-1">
                      {exam.unit}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
