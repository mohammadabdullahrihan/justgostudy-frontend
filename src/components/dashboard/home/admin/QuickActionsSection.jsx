import { Link } from 'react-router-dom';
import { Users, Building2, GraduationCap, Inbox } from 'lucide-react';
import { ShortcutCard, StatusBadge } from '../shared';
import EmptyState from '../../EmptyState';

const QuickActionsSection = ({ adminPrefix, recentApps, loading }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left col: shortcuts */}
    <div className="space-y-2">
      <h3 className="font-bold text-ink-900 text-sm uppercase tracking-wider">Management</h3>
      <ShortcutCard icon={Users} title="User Management" desc="Approve agents, assign students, manage roles." to={`${adminPrefix}/users`} accentClass="bg-coral-50 text-coral-600" />
      <ShortcutCard icon={Building2} title="Universities" desc="Maintain the university directory." to={`${adminPrefix}/universities`} accentClass="bg-primary-50 text-primary-600" />
      <ShortcutCard icon={GraduationCap} title="Courses" desc="Add, edit and remove course listings." to={`${adminPrefix}/courses`} accentClass="bg-secondary-50 text-secondary-600" />
      <ShortcutCard icon={Inbox} title="Applications" desc="Review and update all application statuses." to={`${adminPrefix}/applications`} accentClass="bg-accent-50 text-accent-600" />
    </div>

    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-ink-900 text-sm uppercase tracking-wider">Recent Applications</h3>
        <Link to={`${adminPrefix}/applications`} className="text-xs text-coral-600 font-semibold hover:underline">View all</Link>
      </div>
      <div className="bg-white rounded-2xl border border-ink-100/70 shadow-theme-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 skeleton rounded-xl"></div>)}
          </div>
        ) : recentApps.length === 0 ? (
          <EmptyState icon={Inbox} message="No applications yet." />
        ) : (
          <div className="divide-y divide-ink-100">
            {recentApps.map((app) => (
              <div key={app._id} className="flex items-center justify-between p-4 hover:bg-cream-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{app.studentId?.name || 'Student'}</p>
                  <p className="text-sm text-ink-600 mt-0.5">{app.courseId?.name || '—'} · {app.universityId?.name || '—'}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default QuickActionsSection;
