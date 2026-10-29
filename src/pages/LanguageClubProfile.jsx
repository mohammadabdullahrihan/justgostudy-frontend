import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Award, Layers, Star, ArrowRight } from 'lucide-react';
import LanguageNavbar from '../components/LanguageNavbar';
import LanguageFooter from '../components/LanguageFooter';
import FlagIcon from '../components/FlagIcon';
import Seo from '../components/common/Seo';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { getLanguages } from '../services/languageService';

const LanguageClubProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([authService.getMe(), getLanguages()])
      .then(([me, langs]) => {
        if (cancelled) return;
        setProfile(me);
        setLanguages(langs || []);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  const initials = (profile?.name || user?.name)
    ? (profile?.name || user.name).split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const languageProgress = profile?.languageProgress || [];
  const languageMeta = (languageId) => languages.find((l) => l.languageId === languageId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Seo
        title="My Profile - Just Go Study Language Club"
        description="Track your Language Club points, streak, badges, and lesson progress."
        noindex
      />
      <LanguageNavbar />

      <main className="flex-grow pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!user ? (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Star size={28} />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Sign up to see your profile
              </h1>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Create a free student account to save your points, streak, badges, and lesson progress across every language you learn.
              </p>
              <Link
                to="/register?role=student"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition-all duration-200"
              >
                Create free account
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : user.role !== 'student' ? (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Star size={28} />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                This profile is for student accounts
              </h1>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {['admin', 'super_admin', 'developer'].includes(user.role)
                  ? "Points, streak, and badges are only tracked on student accounts. You can view and manage every student's Language Club progress from the admin panel."
                  : "Points, streak, and badges are only tracked on student accounts. Log out and create a separate student account to build your own Language Club profile."}
              </p>
              {['admin', 'super_admin', 'developer'].includes(user.role) && (
                <Link
                  to={user.role === 'developer' ? '/developer/language-club' : user.role === 'super_admin' ? '/super-admin/language-club' : '/admin/language-club'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition-all duration-200"
                >
                  Go to Language Club Members
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ) : loading ? (
            <div className="space-y-4">
              <div className="h-40 bg-white border border-gray-100 rounded-[2rem] animate-pulse" />
              <div className="h-24 bg-white border border-gray-100 rounded-2xl animate-pulse" />
              <div className="h-24 bg-white border border-gray-100 rounded-2xl animate-pulse" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] p-8 mb-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-extrabold text-gray-900 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {profile.name}
                  </h1>
                  <p className="text-gray-500 text-sm truncate">{profile.email}</p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                    Level {profile.level || 1}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] p-5 text-center">
                  <div className="text-2xl font-extrabold text-red-600">{profile.points || 0}</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Points</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] p-5 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-2xl font-extrabold text-orange-500">
                    <Flame size={22} className="fill-orange-500" />
                    {profile.streak || 0}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Day Streak</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] p-5 text-center">
                  <div className="text-2xl font-extrabold text-gray-900">{(profile.badges || []).length}</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Badges</div>
                </div>
              </div>

              {/* Badges */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] p-6 mb-6">
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                  <Award size={16} className="text-red-600" /> Badges
                </h2>
                {(profile.badges || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No badges yet — complete lessons to earn your first one!</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-full capitalize"
                      >
                        {badge.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Language progress */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-8px_rgba(14,16,23,0.08)] p-6">
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                  <Layers size={16} className="text-red-600" /> Your Languages
                </h2>
                {languageProgress.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 mb-4">You haven&apos;t started a language yet.</p>
                    <Link to="/language-club/explore" className="text-red-600 font-bold text-sm hover:underline">
                      Explore Languages
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {languageProgress.map((entry) => {
                      const meta = languageMeta(entry.languageId);
                      const total = meta?.totalLessons || entry.completedLessonIds.length || 1;
                      const done = entry.completedLessonIds.length;
                      const pct = Math.min(Math.round((done / total) * 100), 100);
                      return (
                        <Link
                          key={entry.languageId}
                          to={`/language-club/learn/${entry.languageId}`}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                        >
                          <FlagIcon languageId={entry.languageId} className="w-10 h-10 rounded-full shadow-sm shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold text-gray-900 capitalize">
                                {meta?.name || entry.languageId}
                              </span>
                              <span className="text-xs font-bold text-red-600 shrink-0">{done}/{total}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-gray-500 group-hover:text-red-600 transition-colors shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <LanguageFooter />
    </div>
  );
};

export default LanguageClubProfile;
