import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Target, Trophy, Zap, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const topLearners = [
  {
    name: 'Abdullah Rihan',
    pts: '12,450',
    rank: 1,
    color: 'bg-amber-400',
    avatar: 'AR',
  },
  {
    name: 'Sarah Jenkins',
    pts: '11,200',
    rank: 2,
    color: 'bg-gray-400',
    avatar: 'SJ',
  },
  {
    name: 'Hiroshi Tanaka',
    pts: '10,850',
    rank: 3,
    color: 'bg-orange-400',
    avatar: 'HT',
  },
];

const LeaderboardPreview = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const cardWrapRef = useRef(null);
  const rowsRef = useRef(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const contentItems = gsap.utils.toArray(contentRef.current.children);
      const rows = gsap.utils.toArray(rowsRef.current.children);

      if (reduceMotion) {
        gsap.set([...contentItems, cardWrapRef.current, ...rows], { opacity: 1, x: 0, y: 0 });
        return;
      }

      gsap.set(contentItems, { opacity: 0, x: -40 });
      gsap.set(cardWrapRef.current, { opacity: 0, x: 40 });
      gsap.set(rows, { opacity: 0, x: 20 });

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
            onComplete: () => gsap.set(cardWrapRef.current, { clearProps: 'transform' }),
          });
          gsap.to(rows, {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.12,
            delay: 0.3,
            ease: 'power3.out',
            onComplete: () => gsap.set(rows, { clearProps: 'transform' }),
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div ref={contentRef} className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full mb-6">
              <Trophy size={14} className="fill-red-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Global Leaderboard
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: '\'Outfit\', sans-serif' }}
            >
              Compete with others and{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                reach the top
              </span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Our AI system analyzes your learning speed and accuracy to rank
              you against other learners. Start today and see how you compare.
            </p>

            <div className="space-y-4 mb-10">
              {[
                {
                  icon: <Zap size={20} className="text-amber-500 fill-amber-500" />,
                  title: 'Real-time Ranking',
                  desc: 'Every correct answer moves you up the ranks.',
                },
                {
                  icon: <Target size={20} className="text-red-500" />,
                  title: 'AI Smart Score',
                  desc: 'Scoring is based on your proficiency, not just points.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-[0_2px_10px_-6px_rgba(14,16,23,0.08)]">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/language-club/leaderboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              View Full Leaderboard
              <ArrowRight size={20} />
            </Link>
          </div>

          <div ref={cardWrapRef} className="lg:w-1/2 relative will-change-transform">
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50" />

            <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-red-900/5 overflow-hidden p-2">
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-gray-900">Top 3 Learners</h3>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-red-300" />
                    <div className="w-2 h-2 rounded-full bg-red-200" />
                  </div>
                </div>

                <div ref={rowsRef} className="space-y-4">
                  {topLearners.map((user, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer hover:translate-x-2.5 transition-transform duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-white font-bold text-xs`}
                        >
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {user.pts} Points
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-full ${user.color} text-white flex items-center justify-center font-bold text-sm`}
                      >
                        {user.rank}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-medium italic">
                    &quot;AI system captures the latest progress of learners
                    worldwide&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;
