import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import applicationService from '../../../services/applicationService';
import { getFavorites } from '../../../services/favoriteService';
import userService from '../../../services/userService';
import {
  Shield, Send, Search, GraduationCap, Users, Share2, Copy,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getGreeting } from './sharedUtils';
import { ErrorBanner } from './shared';
import RecentApplicationsCard from './RecentApplicationsCard';
import RecommendedForYou from './RecommendedForYou';
import JourneyTimeline from './JourneyTimeline';
import StatsCards from './StatsCards';
import QuickActionsList from './QuickActionsList';
import ApplicationStatusChart from './ApplicationStatusChart';

/* ═══════════════════════════════════════════════════════════
   STUDENT HOME
═══════════════════════════════════════════════════════════ */
const StudentHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ apps: 0, favs: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [recentApps, setRecentApps] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [referrals, setReferrals] = useState(null);
  const [referralsError, setReferralsError] = useState(false);

  useEffect(() => {
    const loadReferrals = async () => {
      try {
        const data = await userService.getMyReferrals();
        setReferrals(data);
      } catch (err) {
        console.error('Failed to load referral data', err);
        setReferralsError(true);
      }
    };
    loadReferrals();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoadError(null);
      try {
        const [appsRes, favsRes] = await Promise.all([
          applicationService.getMyApplications(),
          getFavorites(),
        ]);
        const apps = Array.isArray(appsRes?.data || appsRes) ? (appsRes?.data || appsRes) : [];
        const favs = Array.isArray(favsRes?.data?.favorites || favsRes?.data || favsRes)
          ? (favsRes?.data?.favorites || favsRes?.data || favsRes)
          : [];
        setStats({
          apps: apps.length,
          favs: favs.length,
          pending: apps.filter((a) => a.status === 'pending').length,
          approved: apps.filter((a) => a.status === 'accepted').length,
        });
        setRecentApps(apps.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setLoadError('Could not load your applications. Please try again.');
      }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const referralLink = referrals?.referralCode
    ? `${window.location.origin}/register?ref=${referrals.referralCode}`
    : '';

  const handleCopyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Link copied!');
    } catch {
      toast.error('Could not copy link. Please copy it manually.');
    }
  };

  const handleWhatsAppShareReferral = () => {
    if (!referralLink) return;
    const text = encodeURIComponent(`Join me on Just Go Study to explore universities abroad: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <ErrorBanner message={loadError} />
      {/* ── Hero Welcome Banner ── */}
      <div className="relative rounded-2xl overflow-hidden shadow-theme-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-accent-400/20 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row">

          {/* LEFT, Greeting */}
          <div className="flex-1 p-8 lg:p-10">
            {/* Access badge */}
            <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6">
              <Shield size={10} className="text-accent-300" />
              <span className="text-[12px] font-bold tracking-widest uppercase text-white/90">Student Portal</span>
            </div>

            {/* Big greeting */}
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight font-outfit">
              {getGreeting()},
            </h2>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mt-1 text-accent-300 font-outfit">
              {user?.name}
            </h2>

            {/* Tagline */}
            <p className="text-white/70 italic text-sm mt-4 font-medium">&ldquo;Your study-abroad journey starts here.&rdquo;</p>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/50 mt-1">Student &bull; Just Go Study Portal</p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-7">
              <button
                onClick={() => navigate('/student/apply')}
                className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all bg-white text-primary-700 shadow-theme-md hover:bg-cream-50"
              >
                <Send size={12} /> New Application
              </button>
              <button
                onClick={() => navigate('/study-abroad/courses')}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all"
              >
                <Search size={12} /> Browse Courses
              </button>
            </div>

            {/* Quote card */}
            <div className="mt-6 flex items-start gap-3 bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl px-4 py-3 max-w-sm">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <GraduationCap size={12} className="text-accent-300" />
              </div>
              <div>
                <p className="text-[12px] font-bold tracking-widest uppercase text-accent-300 mb-1">Tip of the Day</p>
                <p className="text-xs text-white/80 leading-relaxed">&ldquo;Apply early and aim high.&rdquo;</p>
              </div>
            </div>
          </div>

          {/* RIGHT, Info Cards */}
          <div className="lg:w-72 p-6 flex flex-col gap-3 lg:border-l border-white/10">
            <div className="rounded-xl p-4 border border-white/15 bg-white/10 backdrop-blur-sm">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white/60 mb-1">Applications</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.apps} Total</p>
            </div>
            <div className="rounded-xl p-4 border border-white/15 bg-white/10 backdrop-blur-sm">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white/60 mb-1">Pending Review</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.pending} Awaiting</p>
            </div>
            <div className="rounded-xl p-4 border border-secondary-300/30 bg-secondary-400/15">
              <p className="text-[12px] font-bold uppercase tracking-widest text-secondary-200 mb-1">Approved</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.approved} Accepted</p>
            </div>
            <div className="rounded-xl p-4 border border-accent-300/30 bg-accent-400/15">
              <p className="text-[12px] font-bold uppercase tracking-widest text-accent-200 mb-1">Saved Courses</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.favs} Favorites</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Refer a Friend ── */}
      <div className="rounded-2xl overflow-hidden border border-ink-100/70 bg-white shadow-theme-lg shadow-primary-500/10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 border border-secondary-200 bg-secondary-50 rounded-full px-3 py-1 mb-4">
              <Share2 size={10} className="text-secondary-600" />
              <span className="text-[12px] font-bold tracking-widest uppercase text-secondary-600">Refer a Friend</span>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed max-w-md">
              Invite a friend to Just Go Study using your link below.
            </p>

            {referralsError ? (
              <p className="text-xs text-ink-600 mt-4">Referral info isn&apos;t available right now.</p>
            ) : !referrals ? (
              <p className="text-xs text-ink-600 mt-4">Loading your referral link…</p>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-2 mt-4 max-w-lg">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    onClick={(e) => e.target.select()}
                    className="flex-1 text-xs sm:text-sm font-mono bg-cream-100 border border-ink-200 rounded-xl px-4 py-3 text-ink-700 truncate outline-none"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handleCopyReferralLink}
                      className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-all"
                    >
                      <Copy size={14} /> Copy Link
                    </button>
                    <button
                      onClick={handleWhatsAppShareReferral}
                      className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl border border-ink-300 text-ink-700 hover:border-secondary-400 hover:text-secondary-600 transition-all"
                    >
                      Share on WhatsApp
                    </button>
                  </div>
                </div>

                <p className="text-xs text-ink-600 mt-3">
                  {referrals.referredCount > 0
                    ? `${referrals.referredCount} friend${referrals.referredCount === 1 ? '' : 's'} joined using your link.`
                    : 'No friends joined yet — share your link to get started.'}
                </p>
              </>
            )}
          </div>

          <div className="lg:w-48 flex flex-col items-center justify-center gap-2 rounded-xl p-5 border border-primary-200 bg-primary-50 shrink-0">
            <Users size={20} className="text-primary-500" />
            <p className="text-2xl font-extrabold text-ink-900">{referrals ? referrals.referredCount : '—'}</p>
            <p className="text-[12px] font-bold uppercase tracking-widest text-ink-600 text-center">Friends Joined</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsCards role="student" stats={stats} loading={loading} />

      {/* Charts + Shortcuts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: pie chart + shortcuts */}
        <div className="space-y-4">
          <ApplicationStatusChart role="student" stats={stats} loading={loading} />
          <QuickActionsList role="student" />
        </div>

        {/* Recent Applications */}
        <RecentApplicationsCard role="student" recentApps={recentApps} loading={loading} />
      </div>

      <JourneyTimeline />

      <RecommendedForYou />
    </div>
  );
};

export default StudentHome;
