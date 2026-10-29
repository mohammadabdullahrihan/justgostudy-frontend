import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import LanguageNavbar from '../components/LanguageNavbar';
import LanguageFooter from '../components/LanguageFooter';
import Seo from '../components/common/Seo';
import { Trophy, TrendingUp, Zap, Share2, Loader2 } from 'lucide-react';
import { getLeaderboard } from '../services/leaderboardService';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LanguageLeaderboard = () => {
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'weekly'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const bannerRef = useRef(null);
  const podiumRef = useRef(null);
  const rankRef = useRef(null);
  const tabRefs = useRef([]);
  const tabPillRef = useRef(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getLeaderboard();
        setUsers(response.data || []); // Because response from leaderboardService is {success: true, data: [...]}
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError(err.message || 'Failed to load leaderboard');
        // Fallback to mock data
        setUsers([
          { _id: '1', name: 'Abdullah Rihan', points: 12450, rank: 1, avatar: 'https://ui-avatars.com/api/?name=Abdullah+Rihan&background=b91c1c&color=fff&bold=true&size=150', country: '🇧🇩', badges: ['AI Master', 'Polyglot'], level: 42, streak: 15 },
          { _id: '2', name: 'Sarah Islam', points: 11200, rank: 2, avatar: 'https://ui-avatars.com/api/?name=Sarah+Islam&background=dc2626&color=fff&bold=true&size=150', country: '🇧🇩', badges: ['Fast Learner'], level: 38, streak: 12 },
          { _id: '3', name: 'Hasan Mahmud', points: 10850, rank: 3, avatar: 'https://ui-avatars.com/api/?name=Hasan+Mahmud&background=ea580c&color=fff&bold=true&size=150', country: '🇧🇩', badges: ['Early Bird'], level: 35, streak: 20 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleShare = (user) => {
    const text = `I'm ranked #${user.rank} on the Just Go Study Language Club Leaderboard with ${user.points} points! Join me and start learning!`;
    if (navigator.share) {
      navigator.share({
        title: 'Language Club Leaderboard',
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for desktop or non-supported browsers
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  // Ensure each user has all required properties (for fallback/mock data)
  const normalizedUsers = users.map(user => ({
    ...user,
    points: user.points || 0,
    badges: user.badges || [],
    level: user.level || 1,
    streak: user.streak || 0,
    avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'JGS')}&background=b91c1c&color=fff&bold=true&size=150`,
    country: user.country || '🌍'
  }));

  // Ensure we have at least 3 users for the podium
  const fallbackUser = {
    _id: 'fallback',
    name: 'Coming Soon',
    points: 0,
    rank: 0,
    avatar: 'https://ui-avatars.com/api/?name=Coming+Soon&background=fee2e2&color=b91c1c&bold=true&size=150',
    country: '🌍',
    badges: [],
    level: 1,
    streak: 0
  };
  const topThree = [...normalizedUsers, fallbackUser, fallbackUser, fallbackUser].slice(0, 3);
  const remainingUsers = normalizedUsers.slice(3);

  // Slide the active-tab pill under whichever tab is selected. Depends on
  // isLoading too: the tabs only mount once loading finishes, so without it
  // this effect would never fire on first render (pill stays 0-width/invisible
  // until a tab click changes `activeTab` and retriggers it).
  useGSAP(() => {
    const btn = tabRefs.current[activeTab === 'global' ? 0 : 1];
    if (!btn || !tabPillRef.current) return;
    gsap.to(tabPillRef.current, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: 0.4,
      ease: 'power2.out',
    });
  }, [activeTab, isLoading]);

  // Reveal everything once the leaderboard content is actually on screen.
  useGSAP(
    () => {
      if (isLoading || error) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const headerItems = gsap.utils.toArray(headerRef.current.children);
      gsap.set(headerItems, { opacity: 0, y: -16 });
      gsap.set(bannerRef.current, { opacity: 0, x: -20 });
      const podiumCards = gsap.utils.toArray(podiumRef.current.children);
      gsap.set(podiumCards, { opacity: 0, y: 50 });
      gsap.set(rankRef.current, { y: 60, opacity: 0 });

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to(headerItems, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 })
        .to(bannerRef.current, { opacity: 1, x: 0, duration: 0.5 }, '-=0.2')
        .to(podiumCards, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'back.out(1.4)',
          onComplete: () => gsap.set(podiumCards, { clearProps: 'transform' }),
        }, '-=0.15')
        .to(rankRef.current, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2');

      const rows = gsap.utils.toArray('[data-lb-row]');
      if (rows.length) {
        gsap.set(rows, { opacity: 0, y: 20 });
        ScrollTrigger.create({
          trigger: rows[0],
          start: 'top 90%',
          once: true,
          onEnter: () =>
            gsap.to(rows, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'power3.out',
              onComplete: () => gsap.set(rows, { clearProps: 'transform' }),
            }),
        });
      }
    },
    { scope: pageRef, dependencies: [isLoading, error] }
  );

  return (
    <div ref={pageRef} className="relative min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Seo
        title="Leaderboard - Just Go Study Language Club"
        description="See who's leading the Just Go Study Language Club, global and weekly rankings by points, streaks and badges."
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(14,16,23,0.035)_1px,transparent_0)] [background-size:28px_28px] pointer-events-none" />
      <LanguageNavbar />

      <main className="relative flex-grow pt-32 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-16 h-16 animate-spin text-red-600 mb-4" />
              <p className="text-gray-500 text-lg">Loading leaderboard...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-600 text-2xl">!</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load leaderboard</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Leaderboard Content */}
          {!isLoading && !error && (
            <>
          {/* Header Section */}
          <div ref={headerRef} className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-red-600 mb-6">
              <Trophy size={32} />
            </div>
            <h1
              className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Global Leaderboard
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Compare your progress with the world&apos;s best learners and reach the top.
            </p>
          </div>

          {/* AI Insights Banner */}
          <div
            ref={bannerRef}
            className="bg-gradient-to-r from-red-600 to-red-400 rounded-2xl p-6 sm:p-8 mb-12 text-white shadow-xl shadow-red-500/20 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
                <Zap className="text-white fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Smart Ranking</h3>
                <p className="text-red-50 text-sm">Ranking is updated based on your learning speed and accuracy.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 min-w-[120px]">
                <span className="text-xs block text-red-100">Next Update</span>
                <span className="font-mono font-bold">14:20:05</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 min-w-[120px]">
                <span className="text-xs block text-red-100">Active Learners</span>
                <span className="font-bold">1,240</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-36">
            <div className="relative bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
              <div
                ref={tabPillRef}
                className="absolute top-1.5 bottom-1.5 left-0 bg-red-600 rounded-xl shadow-lg shadow-red-500/30 will-change-transform"
              />
              {['global', 'weekly'].map((tab, i) => (
                <button
                  key={tab}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-8 py-2.5 rounded-xl font-bold transition-colors duration-300 ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <span className="relative z-10 capitalize">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Podium (Top 3) */}
          <div ref={podiumRef} className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-12 mb-20 md:mb-16 items-end pt-20 md:pt-12">
            {/* Rank 2 */}
            <div className="order-2 md:order-1">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 relative pt-44 group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <img src={topThree[1].avatar} alt={topThree[1].name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg object-cover" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 text-white w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white text-sm">2</div>
                  </div>
                </div>
                <div className="text-center mt-10">
                  <div className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{topThree[1].name} {topThree[1].country}</div>
                  <div className="text-red-600 font-bold mb-5">{topThree[1].points.toLocaleString()} pts</div>
                  <div className="flex justify-center flex-wrap gap-2">
                    {topThree[1].badges.map(badge => (
                      <span key={badge} className="bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">{badge}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rank 1 */}
            <div className="order-1 md:order-2">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-red-100 relative pt-40 group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-16 sm:-top-20 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 -m-2 rounded-full border-2 border-dashed border-red-400 animate-[spin_10s_linear_infinite]" />
                    <img src={topThree[0].avatar} alt={topThree[0].name} className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl object-cover" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold shadow-md border-4 border-white text-base sm:text-lg">1</div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-500">
                      <Trophy size={32} className="sm:w-10 sm:h-10" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="text-center mt-14">
                  <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">{topThree[0].name} {topThree[0].country}</div>
                  <div className="text-red-600 text-lg sm:text-xl font-bold mb-5">{topThree[0].points.toLocaleString()} pts</div>
                  <div className="flex justify-center flex-wrap gap-2">
                    {topThree[0].badges.map(badge => (
                      <span key={badge} className="bg-red-50 text-red-600 text-[9px] sm:text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">{badge}</span>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-gray-50 flex justify-around">
                    <div className="text-center">
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Level</div>
                      <div className="text-gray-900 font-bold text-sm sm:text-base">{topThree[0].level}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Streak</div>
                      <div className="text-gray-900 font-bold text-sm sm:text-base">{topThree[0].streak}d</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="order-3">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 relative pt-36 group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <img src={topThree[2].avatar} alt={topThree[2].name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg object-cover" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white text-sm">3</div>
                  </div>
                </div>
                <div className="text-center mt-10">
                  <div className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{topThree[2].name} {topThree[2].country}</div>
                  <div className="text-red-600 font-bold mb-5">{topThree[2].points.toLocaleString()} pts</div>
                  <div className="flex justify-center flex-wrap gap-2">
                    {topThree[2].badges.map(badge => (
                      <span key={badge} className="bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">{badge}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="mb-24 md:mb-16">
            {/* Table Header - Desktop Only */}
            <div className="hidden md:grid grid-cols-12 px-8 py-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Learner</div>
              <div className="col-span-2 text-center">Level</div>
              <div className="col-span-2 text-center">Streak</div>
              <div className="col-span-2 text-right">Points</div>
            </div>

            <div className="flex flex-col gap-4">
              {remainingUsers.map((user) => (
                <div
                  key={user._id}
                  data-lb-row
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-[0_2px_14px_-8px_rgba(14,16,23,0.1)] border border-gray-100 hover:shadow-lg hover:shadow-red-500/[0.06] hover:translate-x-1 transition-all duration-300 group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                    {/* Rank */}
                    <div className="col-span-1 flex items-center gap-3 md:block">
                      <span className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-widest">Rank</span>
                      <span className="font-bold text-gray-500 group-hover:text-red-600 transition-colors text-base sm:text-lg">#{user.rank}</span>
                    </div>

                    {/* Learner */}
                    <div className="col-span-5">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative shrink-0">
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-sm" />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 flex items-center gap-2 truncate text-base sm:text-lg">
                            {user.name}
                            <span className="text-sm grayscale group-hover:grayscale-0 transition-all shrink-0">{user.country}</span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">Verified Learner</div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid for Mobile */}
                    <div className="col-span-6 grid grid-cols-3 md:contents gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                      {/* Level */}
                      <div className="md:col-span-2 text-center">
                        <span className="md:hidden block text-[10px] text-gray-500 font-bold uppercase mb-1">Level</span>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 font-bold text-xs sm:text-sm border border-red-100">
                          {user.level}
                        </span>
                      </div>

                      {/* Streak */}
                      <div className="md:col-span-2 text-center">
                        <span className="md:hidden block text-[10px] text-gray-500 font-bold uppercase mb-1">Streak</span>
                        <div className="flex items-center justify-center gap-1.5 text-orange-500 font-bold text-sm">
                          <Zap size={14} fill="currentColor" />
                          <span>{user.streak}d</span>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="md:col-span-2 text-right">
                        <span className="md:hidden block text-[10px] text-gray-500 font-bold uppercase mb-1">Points</span>
                        <div className="font-bold text-gray-900 text-base sm:text-lg">{user.points.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                          <TrendingUp size={12} />
                          +120
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User's Own Rank (Fixed Bottom for Mobile, Normal for Desktop) */}
          {/* bottom-24 (not bottom-0) so this floating bar clears LanguageNavbar's
              fixed bottom-4 mobile nav instead of stacking on top of it below md */}
          <div
            ref={rankRef}
            className="fixed md:relative bottom-24 left-3 right-3 md:bottom-auto md:left-auto md:right-auto z-30 bg-white md:bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)] md:shadow-2xl border md:border-2 border-red-100 flex flex-row items-center justify-between gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="text-xl sm:text-2xl font-bold text-red-600">#42</div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-200 animate-pulse shrink-0"></div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 text-sm sm:text-base truncate">Your Rank</div>
                  <div className="text-[10px] sm:text-sm text-gray-500 truncate">520 more points needed to reach the top</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare({ name: 'Abdullah Rihan', rank: 42, points: 6450 })}
                className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-100 text-gray-600 hover:text-red-600 transition-all"
                title="Share My Rank"
              >
                <Share2 size={18} />
              </button>
              <button className="bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-red-500/30 hover:shadow-red-500/50 active:scale-95 transition-all shrink-0">
                Start Practice
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      </main>

      <LanguageFooter />
    </div>
  );
};

export default LanguageLeaderboard;
