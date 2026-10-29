import { Link, useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import EmptyState from '../EmptyState';
import { StatusBadge } from './shared';

const ROLE_CONFIG = {
  agent: {
    title: 'Recent Applications',
    viewAllHref: '/agent/applications',
    emptyMessage: 'No applications assigned yet.',
    getPrimary: (app) => app.studentId?.name || 'Student',
    getSecondary: (app) => app.courseId?.name || '—',
  },
  student: {
    title: 'Recent Applications',
    viewAllHref: '/student/applications',
    emptyMessage: 'No applications yet.',
    emptyActionLabel: 'Start one now →',
    emptyActionHref: '/student/apply',
    getPrimary: (app) => app.courseId?.name || 'Application',
    getSecondary: (app) => app.universityId?.name || '—',
  },
  university: {
    title: 'Recent Received Applications',
    viewAllHref: '/university/applications',
    emptyMessage: 'No applications received yet.',
    getPrimary: (app) => app.studentId?.name || 'Student',
    getSecondary: (app) => app.courseId?.name || '—',
  },
};

const RecentApplicationsCard = ({ role, recentApps, loading }) => {
  const navigate = useNavigate();
  const config = ROLE_CONFIG[role];

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-ink-900 text-sm uppercase tracking-wider">{config.title}</h3>
        <Link to={config.viewAllHref} className="text-xs text-coral-600 font-semibold hover:underline">View all</Link>
      </div>
      <div className="bg-white rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 skeleton rounded-xl"></div>)}
          </div>
        ) : recentApps.length === 0 ? (
          <EmptyState icon={Inbox} message={config.emptyMessage}>
            {config.emptyActionLabel && (
              <button onClick={() => navigate(config.emptyActionHref)} className="mt-3 text-xs text-coral-600 font-semibold hover:underline">
                {config.emptyActionLabel}
              </button>
            )}
          </EmptyState>
        ) : (
          <div className="divide-y divide-ink-100">
            {recentApps.map((app, idx) => (
              <div key={app._id} className={`flex items-center justify-between p-4 hover:bg-primary-50/40 transition-colors ${idx % 2 === 1 ? 'bg-cream-50/60' : ''}`}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{config.getPrimary(app)}</p>
                  <p className="text-sm text-ink-600 mt-0.5">{config.getSecondary(app)}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentApplicationsCard;
