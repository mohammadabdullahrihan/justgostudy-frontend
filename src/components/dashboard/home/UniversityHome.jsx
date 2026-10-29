import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import applicationService from '../../../services/applicationService';
import courseService from '../../../services/courseService';
import { Shield, FileText, GraduationCap, Building2 } from 'lucide-react';
import { getGreeting } from './sharedUtils';
import { ErrorBanner } from './shared';
import RecentApplicationsCard from './RecentApplicationsCard';
import StatsCards from './StatsCards';
import QuickActionsList from './QuickActionsList';
import ApplicationStatusChart from './ApplicationStatusChart';

/* ═══════════════════════════════════════════════════════════
   UNIVERSITY HOME
═══════════════════════════════════════════════════════════ */
const UniversityHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ apps: 0, pending: 0, approved: 0, courses: 0 });
  const [loading, setLoading] = useState(true);
  const [recentApps, setRecentApps] = useState([]);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadError(null);
      try {
        if (!user?.universityId) {
          setLoading(false);
          return;
        }

        const [appsRes, coursesRes] = await Promise.all([
          applicationService.getUniversityApplications(),
          courseService.getCourses({ universityId: user.universityId, limit: 100 }),
        ]);

        const apps = Array.isArray(appsRes?.data || appsRes) ? (appsRes?.data || appsRes) : [];
        const courses = Array.isArray(coursesRes?.courses || coursesRes?.data || coursesRes)
          ? (coursesRes?.courses || coursesRes?.data || coursesRes)
          : [];

        setStats({
          apps: apps.length,
          pending: apps.filter((a) => a.status === 'pending').length,
          approved: apps.filter((a) => a.status === 'accepted').length,
          courses: courses.length,
        });
        setRecentApps(apps.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setLoadError('Could not load your applications. Please try again.');
      }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (!user?.universityId && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent-50 border border-accent-200 flex items-center justify-center mb-4">
          <Building2 size={24} className="text-accent-500" />
        </div>
        <h3 className="text-xl font-bold text-ink-900 mb-2">Setup Required</h3>
        <p className="text-sm text-ink-600 max-w-sm">Your account is not yet linked to a university. Please contact the administrator.</p>
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
          <div className="flex-1 p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6">
              <Shield size={10} className="text-accent-300" />
              <span className="text-[12px] font-bold tracking-widest uppercase text-white/90">University Portal</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight font-outfit">
              {getGreeting()},
            </h2>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mt-1 text-accent-300 font-outfit">
              {user?.name}
            </h2>
            <p className="text-white/70 italic text-sm mt-4 font-medium">&ldquo;Connecting your programs with students worldwide.&rdquo;</p>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/50 mt-1">University Representative &bull; Just Go Study</p>

            <div className="flex flex-wrap gap-3 mt-7">
              <button
                onClick={() => navigate('/university/applications')}
                className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all bg-white text-primary-700 shadow-theme-md hover:bg-cream-50"
              >
                <FileText size={12} /> View Applications
              </button>
              <button
                onClick={() => navigate('/university/courses')}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all"
              >
                <GraduationCap size={12} /> Our Courses
              </button>
            </div>
          </div>

          <div className="lg:w-72 p-6 flex flex-col gap-3 lg:border-l border-white/10">
            <div className="rounded-xl p-4 border border-white/15 bg-white/10 backdrop-blur-sm">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white/60 mb-1">Total Applications</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.apps} Received</p>
            </div>
            <div className="rounded-xl p-4 border border-accent-300/30 bg-accent-400/15">
              <p className="text-[12px] font-bold uppercase tracking-widest text-accent-200 mb-1">Pending Review</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.pending} Awaiting</p>
            </div>
            <div className="rounded-xl p-4 border border-secondary-300/30 bg-secondary-400/15">
              <p className="text-[12px] font-bold uppercase tracking-widest text-secondary-200 mb-1">Active Courses</p>
              <p className="text-lg font-extrabold text-white">{loading ? '—' : stats.courses} Programs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards role="university" stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <ApplicationStatusChart role="university" stats={stats} loading={loading} />
          <QuickActionsList role="university" />
        </div>

        <RecentApplicationsCard role="university" recentApps={recentApps} loading={loading} />
      </div>
    </div>
  );
};

export default UniversityHome;
