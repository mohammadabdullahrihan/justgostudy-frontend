import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import applicationService from '../../../services/applicationService';
import courseService from '../../../services/courseService';
import agentService from '../../../services/agentService';
import userService from '../../../services/userService';
import { getUniversities } from '../../../services/universityService';
import { getSystemHealth } from '../../../services/statsService';
import { getConsultations, updateConsultationStatus } from '../../../services/studyService';
import {
  Shield, Users, Inbox, FilePen, SlidersHorizontal, UserPlus, FilePlus,
} from 'lucide-react';
import { getGreeting } from './sharedUtils';
import { ErrorBanner } from './shared';

import AdminStatsSection from './admin/StatsSection';
import AdminChartSection from './admin/ChartSection';
import AdminQuickActionsSection from './admin/QuickActionsSection';
import AdminRecentActivitySection from './admin/RecentActivitySection';

/* ═══════════════════════════════════════════════════════════
   ADMIN HOME
═══════════════════════════════════════════════════════════ */
const AdminHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'super_admin';
  // 'developer' has the same dashboard depth/access as 'super_admin' (owner-
  // only charts, activity feed, route prefix) — kept separate from
  // `isSuperAdmin` above because that one also gates the hardcoded
  // name/title below, which is specific to the actual super_admin person,
  // not something a developer account should inherit.
  const hasFullAdminAccess = isSuperAdmin || user?.role === 'developer';
  const adminPrefix = user?.role === 'developer' ? '/developer' : hasFullAdminAccess ? '/super-admin' : '/admin';
  const [stats, setStats] = useState({ users: 0, students: 0, agents: 0, courses: 0, universities: 0, pending: 0, approved: 0, rejected: 0, inReview: 0, totalApps: 0 });
  const [loading, setLoading] = useState(true);
  const [recentApps, setRecentApps] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [pendingAgents, setPendingAgents] = useState([]);
  const [agentActionLoading, setAgentActionLoading] = useState({});
  const [activityFeed, setActivityFeed] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [pendingAppsList, setPendingAppsList] = useState([]);
  const [appActionLoading, setAppActionLoading] = useState({});
  const [systemHealth, setSystemHealth] = useState({ status: 'checking', database: 'checking', api: 'checking', lastSync: new Date() });
  const [pendingConsultationsList, setPendingConsultationsList] = useState([]);
  const [consultationsPending, setConsultationsPending] = useState(0);
  const [consultationActionLoading, setConsultationActionLoading] = useState({});
  const [loadError, setLoadError] = useState(null);

  const loadDashboardOverview = async () => {
    setLoadError(null);
    try {
      const [userListRes, coursesRes, appList, uniRes, agentProfiles] = await Promise.all([
        userService.getUsers({ limit: 10000 }),
        courseService.getCourses({ limit: 1 }),
        applicationService.getAllApplications(),
        getUniversities(),
        agentService.getAllAgents(),
      ]);
      const userList = Array.isArray(userListRes) ? userListRes : (userListRes?.users || []);
      const courseCount = coursesRes?.total || coursesRes?.count || (coursesRes?.courses || coursesRes?.data || []).length || 0;
      const uniList = Array.isArray(uniRes) ? uniRes : (uniRes?.universities || uniRes?.data || []);
      const uniCount = Array.isArray(uniList) ? uniList.length : 0;

      /* ── Country breakdown ── */
      const countryCounts = {};
      appList.forEach((a) => {
        const country = a.universityId?.country || a.courseId?.country || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });
      setCountryData(
        Object.entries(countryCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      );

      /* ── Pending agents (single batch call, matched against user list) ── */
      const agentUsers = userList.filter((u) => u.role === 'agent');
      const agentProfilesWithUser = agentProfiles.map((p) => ({ ...p, userInfo: p.user }));
      setPendingAgents(agentProfilesWithUser.filter((p) => p.status === 'pending'));

      /* ── Activity feed: merge users + apps sorted by createdAt desc ── */
      const userEvents = userList.slice(0, 20).map((u) => ({
        id: u._id,
        type: 'register',
        icon: UserPlus,
        color: 'bg-primary-50 text-primary-500',
        text: `${u.name} registered as ${u.role}`,
        time: u.createdAt,
      }));
      const appEvents = appList.slice(0, 20).map((a) => ({
        id: a._id,
        type: 'application',
        icon: FilePlus,
        color: 'bg-secondary-50 text-secondary-600',
        text: `${a.studentId?.name || 'A student'} applied for ${a.courseId?.name || 'a course'}`,
        time: a.createdAt,
      }));
      const feed = [...userEvents, ...appEvents]
        .filter((e) => e.time)
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 8);
      setActivityFeed(feed);

      /* ── Monthly trend (last 6 months) ── */
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
          label: d.toLocaleString('en-US', { month: 'short' }),
          year: d.getFullYear(),
          month: d.getMonth(),
          apps: 0,
          users: 0,
        };
      });
      appList.forEach((a) => {
        if (!a.createdAt) return;
        const d = new Date(a.createdAt);
        const m = months.find((x) => x.year === d.getFullYear() && x.month === d.getMonth());
        if (m) m.apps += 1;
      });
      userList.forEach((u) => {
        if (!u.createdAt) return;
        const d = new Date(u.createdAt);
        const m = months.find((x) => x.year === d.getFullYear() && x.month === d.getMonth());
        if (m) m.users += 1;
      });
      setTrendData(months.map(({ label, apps, users }) => ({ name: label, Applications: apps, Users: users })));

      /* ── Pending applications list ── */
      setPendingAppsList(appList.filter((a) => a.status === 'pending').slice(0, 6));

      setStats({
        users: userList.length,
        students: userList.filter((u) => u.role === 'student').length,
        agents: agentUsers.length,
        courses: courseCount,
        universities: uniCount,
        pending: appList.filter((a) => a.status === 'pending').length,
        approved: appList.filter((a) => a.status === 'accepted').length,
        rejected: appList.filter((a) => a.status === 'rejected').length,
        inReview: appList.filter((a) => a.status === 'under_review').length,
        totalApps: appList.length,
      });
      setRecentApps(appList.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setLoadError('Could not load dashboard data. Please try again.');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDashboardOverview(); }, []);

  /* ── Live platform health (DB connectivity + API) ── */
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await getSystemHealth();
        setSystemHealth({ ...health, lastSync: new Date() });
      } catch (err) {
        setSystemHealth({ status: 'degraded', database: 'unknown', api: 'unreachable', lastSync: new Date() });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ── Pending consultations (kept separate so a failure here doesn't
   * take down the rest of the dashboard) ── */
  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const data = await getConsultations();
        const list = Array.isArray(data) ? data : (data?.data || []);
        const pending = list.filter((c) => c.status === 'pending');
        setConsultationsPending(pending.length);
        setPendingConsultationsList(pending.slice(0, 6));
      } catch (err) { console.error('Failed to load consultations', err); }
    };
    loadConsultations();
  }, []);

  /* ── Agent approve/reject ── */
  const handleAgentAction = async (agentUserId, action) => {
    setAgentActionLoading((p) => ({ ...p, [agentUserId]: action }));
    try {
      await userService.updateUser(agentUserId, { agentStatus: action });
      setPendingAgents((prev) => prev.filter((a) => a.userInfo._id !== agentUserId));
      setStats((p) => ({ ...p, agents: p.agents }));
    } catch (err) { console.error('Failed to update agent status', err); }
    finally { setAgentActionLoading((p) => { const n = { ...p }; delete n[agentUserId]; return n; }); }
  };

  /* ── App quick status update ── */
  const handleAppStatus = async (appId, status) => {
    setAppActionLoading((p) => ({ ...p, [appId]: true }));
    try {
      await applicationService.updateApplicationStatus(appId, status);
      setPendingAppsList((prev) => prev.filter((a) => a._id !== appId));
      setStats((p) => ({
        ...p,
        pending: Math.max(0, p.pending - 1),
        ...(status === 'accepted' ? { approved: p.approved + 1 } : {}),
        ...(status === 'rejected' ? { rejected: p.rejected + 1 } : {}),
        ...(status === 'under_review' ? { inReview: p.inReview + 1 } : {}),
      }));
    } catch (err) { console.error('Failed to update application status', err); }
    finally { setAppActionLoading((p) => { const n = { ...p }; delete n[appId]; return n; }); }
  };

  /* ── Consultation quick status update ── */
  const handleConsultationStatus = async (consultationId, status) => {
    setConsultationActionLoading((p) => ({ ...p, [consultationId]: true }));
    try {
      await updateConsultationStatus(consultationId, status);
      setPendingConsultationsList((prev) => prev.filter((c) => c._id !== consultationId));
      setConsultationsPending((prev) => Math.max(0, prev - 1));
    } catch (err) { console.error('Failed to update consultation status', err); }
    finally { setConsultationActionLoading((p) => { const n = { ...p }; delete n[consultationId]; return n; }); }
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
              <span className="text-[12px] font-bold tracking-widest uppercase text-white/90">{user?.role?.replace('_', ' ')} Access</span>
            </div>

            {/* Big greeting */}
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight font-outfit">
              {getGreeting()},
            </h2>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mt-1 bg-gradient-to-r from-accent-300 via-accent-200 to-white bg-clip-text text-transparent font-outfit">
              {user?.role === 'super_admin' ? 'Mohammad Akteruzzaman Bhuiyan Sir' : user?.name}
            </h2>

            {/* Tagline */}
            <p className="text-accent-200 text-sm mt-4 font-medium"> Where Dreams Take Off </p>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/50 mt-1">{user?.role === 'super_admin' ? 'Managing Director' : user?.role?.replace('_', ' ')} &bull; Just Go Study</p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-7">
              <button
                onClick={() => navigate(`${adminPrefix}/users`)}
                className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all bg-white text-primary-700 shadow-theme-md hover:bg-cream-50"
              >
                <Users size={12} /> Manage Users
              </button>
              <button
                onClick={() => navigate(`${adminPrefix}/applications`)}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all"
              >
                <Inbox size={12} /> Applications
              </button>
              <button
                onClick={() => navigate(`${adminPrefix}/resources`)}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all"
              >
                <FilePen size={12} /> News & Vlogs
              </button>
            </div>

            {/* Quote card, reflects live DB/API health from /api/stats/system-health */}
            <div className={`mt-6 flex items-start gap-3 rounded-xl px-4 py-3 max-w-sm border backdrop-blur-sm ${
              systemHealth.status === 'degraded' ? 'bg-rose-500/15 border-rose-300/30' : 'bg-white/10 border-white/15'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                systemHealth.status === 'degraded' ? 'bg-rose-400/20' : 'bg-white/15'
              }`}>
                <SlidersHorizontal size={12} className={systemHealth.status === 'degraded' ? 'text-rose-300' : 'text-accent-300'} />
              </div>
              <div>
                <p className={`text-[12px] font-bold tracking-widest uppercase mb-1 ${
                  systemHealth.status === 'degraded' ? 'text-rose-300' : 'text-accent-300'
                }`}>Platform Status</p>
                <p className="text-xs text-white/80 leading-relaxed">
                  {systemHealth.status === 'checking' && '“Checking platform status…”'}
                  {systemHealth.status === 'operational' && '“All systems operational.”'}
                  {systemHealth.status === 'degraded' && '“Database connectivity issue detected. Some features may be affected.”'}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT, Info Cards */}
          <div className="lg:w-72 p-6 flex flex-col gap-3 lg:border-l border-white/10">
            <div className="rounded-xl p-4 border border-white/15 bg-white/10 backdrop-blur-sm">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white/60 mb-1 font-outfit">Total Users</p>
              <p className="text-lg font-extrabold text-white font-outfit">{loading ? '—' : stats.users} Registered</p>
            </div>
            <div className="rounded-xl p-4 border border-white/15 bg-white/10 backdrop-blur-sm">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white/60 mb-1 font-outfit">Agents</p>
              <p className="text-lg font-extrabold text-white font-outfit">{loading ? '—' : stats.agents} Active</p>
            </div>
            <div className="rounded-xl p-4 border border-white/15 bg-white/10 backdrop-blur-sm">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white/60 mb-1 font-outfit">Total Applications</p>
              <p className="text-lg font-extrabold text-white font-outfit">{loading ? '—' : stats.totalApps} Submitted</p>
            </div>
            <div className="rounded-xl p-4 border border-accent-300/30 bg-accent-400/15">
              <p className="text-[12px] font-bold uppercase tracking-widest text-accent-200 mb-1 font-outfit">Pending Review</p>
              <p className="text-lg font-extrabold text-white font-outfit">{loading ? '—' : stats.pending} Awaiting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <AdminStatsSection stats={stats} loading={loading} />

      {/* Detailed charts, trend & system health, owner-only */}
      {hasFullAdminAccess && (
        <AdminChartSection
          stats={stats}
          loading={loading}
          countryData={countryData}
          trendData={trendData}
          systemHealth={systemHealth}
        />
      )}

      {/* Pending agents, pending apps and pending consultations are
          actionable for both; activity feed is owner-only */}
      <AdminRecentActivitySection
        loading={loading}
        adminPrefix={adminPrefix}
        pendingAgents={pendingAgents}
        agentActionLoading={agentActionLoading}
        handleAgentAction={handleAgentAction}
        pendingAppsList={pendingAppsList}
        appActionLoading={appActionLoading}
        handleAppStatus={handleAppStatus}
        pendingConsultationsList={pendingConsultationsList}
        consultationsPending={consultationsPending}
        consultationActionLoading={consultationActionLoading}
        handleConsultationStatus={handleConsultationStatus}
        activityFeed={activityFeed}
        stats={stats}
        isSuperAdmin={hasFullAdminAccess}
      />

      {/* Management shortcuts + recent applications */}
      <AdminQuickActionsSection adminPrefix={adminPrefix} recentApps={recentApps} loading={loading} />
    </div>
  );
};

export default AdminHome;
