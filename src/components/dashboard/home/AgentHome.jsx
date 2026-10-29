import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import applicationService from '../../../services/applicationService';
import agentService from '../../../services/agentService';
import {
  Shield, Users, Briefcase, UserCheck, Clock, XCircle,
} from 'lucide-react';
import { getGreeting } from './sharedUtils';
import { ErrorBanner } from './shared';
import RecentApplicationsCard from './RecentApplicationsCard';
import StatsCards from './StatsCards';
import QuickActionsList from './QuickActionsList';

import AgentChartSection from './agent/ChartSection';
import ReferralLeaderboard from './agent/ReferralLeaderboard';

/* ═══════════════════════════════════════════════════════════
   AGENT HOME
═══════════════════════════════════════════════════════════ */
const AgentHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, inReview: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [recentApps, setRecentApps] = useState([]);
  const [agentProfile, setAgentProfile] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadError(null);
      try {
        const [profile, appsRes] = await Promise.all([
          agentService.getMyProfile(),
          applicationService.getAgentApplications(),
        ]);
        setAgentProfile(profile);
        const apps = Array.isArray(appsRes?.data || appsRes) ? (appsRes?.data || appsRes) : [];
        setStats({
          total: apps.length,
          pending: apps.filter((a) => a.status === 'pending').length,
          inReview: apps.filter((a) => a.status === 'under_review').length,
          approved: apps.filter((a) => a.status === 'accepted').length,
        });
        setRecentApps(apps.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setLoadError('Could not load your applications. Please try again.');
      }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (!loading && agentProfile?.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent-50 border border-accent-200 flex items-center justify-center mb-4">
          <Clock size={24} className="text-accent-500" />
        </div>
        <h3 className="text-xl font-bold text-ink-900 mb-2">Approval Pending</h3>
        <p className="text-sm text-ink-600 max-w-sm">Your agent account is awaiting admin approval. You&apos;ll be notified once it&apos;s reviewed.</p>
      </div>
    );
  }

  if (!loading && agentProfile?.status === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <XCircle size={24} className="text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-ink-900 mb-2">Application Not Approved</h3>
        <p className="text-sm text-ink-600 max-w-sm">Your agent application was not approved. Please contact support if you believe this is a mistake.</p>
      </div>
    );
  }

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
              <span className="text-[12px] font-bold tracking-widest uppercase text-white/90">Agent Portal</span>
            </div>

            {/* Big greeting */}
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight font-outfit">
              {getGreeting()},
            </h2>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mt-1 text-accent-300 font-outfit">
              {user?.name}
            </h2>

            {/* Tagline */}
            <p className="text-white/70 italic text-sm mt-4 font-medium">&ldquo;Helping students, one application at a time.&rdquo;</p>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/50 mt-1">Agent &bull; Just Go Study Portal</p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-7">
              <button
                onClick={() => navigate('/agent/students')}
                className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all bg-white text-primary-700 shadow-theme-md hover:bg-cream-50"
              >
                <Users size={12} /> My Students
              </button>
              <button
                onClick={() => navigate('/agent/applications')}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all"
              >
                <Briefcase size={12} /> Applications
              </button>
            </div>

            {/* Quote card */}
            <div className="mt-6 flex items-start gap-3 bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl px-4 py-3 max-w-sm">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck size={12} className="text-accent-300" />
              </div>
              <div>
                <p className="text-[12px] font-bold tracking-widest uppercase text-accent-300 mb-1">Agent Insight</p>
                <p className="text-xs text-white/80 leading-relaxed">&ldquo;Every student you guide has the chance to succeed.&rdquo;</p>
              </div>
            </div>
          </div>

          {/* RIGHT, Info Cards */}
          <div className="lg:w-72 p-6 flex flex-col gap-3 lg:border-l border-white/10">
            <div className="rounded-xl p-4 border border-white/15 bg-white/10 backdrop-blur-sm">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white/60 mb-1">Total Applications</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.total} Total</p>
            </div>
            <div className="rounded-xl p-4 border border-white/15 bg-white/10 backdrop-blur-sm">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white/60 mb-1">Pending</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.pending} Awaiting</p>
            </div>
            <div className="rounded-xl p-4 border border-coral-300/30 bg-coral-400/15">
              <p className="text-[12px] font-bold uppercase tracking-widest text-coral-200 mb-1">In Review</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.inReview} Active</p>
            </div>
            <div className="rounded-xl p-4 border border-secondary-300/30 bg-secondary-400/15">
              <p className="text-[12px] font-bold uppercase tracking-widest text-secondary-200 mb-1">Approved</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.approved} Success</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsCards role="agent" stats={stats} loading={loading} />

      {/* Chart + Shortcuts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: bar chart + shortcuts */}
        <div className="space-y-4">
          <AgentChartSection stats={stats} loading={loading} />
          <QuickActionsList role="agent" />
        </div>

        <RecentApplicationsCard role="agent" recentApps={recentApps} loading={loading} />
      </div>

      <ReferralLeaderboard />
    </div>
  );
};

export default AgentHome;
