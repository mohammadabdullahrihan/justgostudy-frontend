import { Link } from 'react-router-dom';
import {
  Clock, Check, X, Loader2, Search, CheckCircle, Zap, PhoneCall, MessageCircle,
} from 'lucide-react';
import EmptyState from '../../EmptyState';

const RecentActivitySection = ({
  loading,
  adminPrefix,
  pendingAgents,
  agentActionLoading,
  handleAgentAction,
  pendingAppsList,
  appActionLoading,
  handleAppStatus,
  pendingConsultationsList,
  consultationsPending,
  consultationActionLoading,
  handleConsultationStatus,
  activityFeed,
  stats,
  isSuperAdmin,
}) => (
  <>
    {/* ── Pending Agent Approvals ── */}
    {(loading || pendingAgents.length > 0) && (
      <div className="bg-white rounded-2xl border border-accent-200 overflow-hidden shadow-theme-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-accent-100 bg-accent-50/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-100 border border-accent-200 flex items-center justify-center">
              <Clock size={12} className="text-accent-600" />
            </div>
            <p className="font-bold text-ink-900 text-sm">Pending Agent Approvals</p>
            {!loading && (
              <span className="ml-1 text-xs font-bold bg-accent-500 text-white px-2 py-0.5 rounded-full">{pendingAgents.length}</span>
            )}
          </div>
          <Link to={`${adminPrefix}/users`} className="text-xs font-semibold text-accent-600 hover:underline">Manage all →</Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{[1, 2].map(i => <div key={i} className="h-14 skeleton rounded-xl"></div>)}</div>
        ) : (
          <div className="divide-y divide-ink-100">
            {pendingAgents.map((agent) => (
              <div key={agent.userInfo._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-accent-50/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center shrink-0 text-sm font-bold text-primary-600">
                    {agent.userInfo.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{agent.userInfo.name}</p>
                    <p className="text-sm text-ink-600 truncate">{agent.userInfo.email}{agent.companyName ? ` · ${agent.companyName}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => handleAgentAction(agent.userInfo._id, 'approved')}
                    disabled={!!agentActionLoading[agent.userInfo._id]}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary-600 text-white hover:bg-secondary-700 transition-colors disabled:opacity-60"
                  >
                    {agentActionLoading[agent.userInfo._id] === 'approved'
                      ? <Loader2 size={10} className="animate-spin" />
                      : <Check size={10} />
                    }
                    Approve
                  </button>
                  <button
                    onClick={() => handleAgentAction(agent.userInfo._id, 'rejected')}
                    disabled={!!agentActionLoading[agent.userInfo._id]}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-60"
                  >
                    {agentActionLoading[agent.userInfo._id] === 'rejected'
                      ? <Loader2 size={10} className="animate-spin" />
                      : <X size={10} />
                    }
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ── Pending Applications + Pending Consultations + Activity Feed ── */}
    <div className={`grid grid-cols-1 gap-6 ${isSuperAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>

      {/* Pending Applications Quick Action */}
      <div className="bg-white rounded-2xl border border-ink-100/70 overflow-hidden shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-coral-50 border border-coral-100 flex items-center justify-center">
              <Clock size={12} className="text-coral-500" />
            </div>
            <p className="font-bold text-ink-900 text-sm">Pending Applications</p>
            {!loading && stats.pending > 0 && (
              <span className="ml-1 text-xs font-bold bg-coral-500 text-white px-2 py-0.5 rounded-full">{stats.pending}</span>
            )}
          </div>
          <Link to={`${adminPrefix}/applications`} className="text-xs font-semibold text-coral-600 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 skeleton rounded-xl"></div>)}</div>
        ) : pendingAppsList.length === 0 ? (
          <EmptyState icon={CheckCircle} iconClassName="text-secondary-200" padded={false} message="No pending applications!" />
        ) : (
          <div className="divide-y divide-ink-100">
            {pendingAppsList.map((app) => (
              <div key={app._id} className="flex items-center justify-between px-5 py-3 hover:bg-cream-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900 truncate">{app.studentId?.name || 'Student'}</p>
                  <p className="text-sm text-ink-600 truncate mt-0.5">{app.courseId?.name || '—'} · {app.universityId?.name || '—'}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <button
                    onClick={() => handleAppStatus(app._id, 'under_review')}
                    disabled={!!appActionLoading[app._id]}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100 transition-colors disabled:opacity-50"
                    title="Mark Under Review"
                  >
                    {appActionLoading[app._id] ? <Loader2 className="animate-spin" /> : <Search />}
                  </button>
                  <button
                    onClick={() => handleAppStatus(app._id, 'accepted')}
                    disabled={!!appActionLoading[app._id]}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-secondary-50 text-secondary-600 border border-secondary-200 hover:bg-secondary-100 transition-colors disabled:opacity-50"
                    title="Accept"
                  >
                    {appActionLoading[app._id] ? <Loader2 className="animate-spin" /> : <Check />}
                  </button>
                  <button
                    onClick={() => handleAppStatus(app._id, 'rejected')}
                    disabled={!!appActionLoading[app._id]}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
                    title="Reject"
                  >
                    {appActionLoading[app._id] ? <Loader2 className="animate-spin" /> : <X />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Consultations Quick Action */}
      <div className="bg-white rounded-2xl border border-ink-100/70 overflow-hidden shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary-50 border border-secondary-100 flex items-center justify-center">
              <MessageCircle size={12} className="text-secondary-600" />
            </div>
            <p className="font-bold text-ink-900 text-sm">Pending Consultations</p>
            {!loading && consultationsPending > 0 && (
              <span className="ml-1 text-xs font-bold bg-secondary-600 text-white px-2 py-0.5 rounded-full">{consultationsPending}</span>
            )}
          </div>
          <Link to={`${adminPrefix}/consultations`} className="text-xs font-semibold text-secondary-600 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 skeleton rounded-xl"></div>)}</div>
        ) : pendingConsultationsList.length === 0 ? (
          <EmptyState icon={CheckCircle} iconClassName="text-secondary-200" padded={false} message="No pending consultations!" />
        ) : (
          <div className="divide-y divide-ink-100">
            {pendingConsultationsList.map((c) => (
              <div key={c._id} className="flex items-center justify-between px-5 py-3 hover:bg-cream-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900 truncate">{c.firstName} {c.lastName}</p>
                  <p className="text-sm text-ink-600 truncate mt-0.5">{c.subject || '—'}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <button
                    onClick={() => handleConsultationStatus(c._id, 'contacted')}
                    disabled={!!consultationActionLoading[c._id]}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100 transition-colors disabled:opacity-50"
                    title="Mark Contacted"
                  >
                    {consultationActionLoading[c._id] ? <Loader2 className="animate-spin" /> : <PhoneCall />}
                  </button>
                  <button
                    onClick={() => handleConsultationStatus(c._id, 'closed')}
                    disabled={!!consultationActionLoading[c._id]}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-secondary-50 text-secondary-600 border border-secondary-200 hover:bg-secondary-100 transition-colors disabled:opacity-50"
                    title="Close"
                  >
                    {consultationActionLoading[c._id] ? <Loader2 className="animate-spin" /> : <Check />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed, owner-only */}
      {isSuperAdmin && (
        <div className="bg-white rounded-2xl border border-ink-100/70 overflow-hidden shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center">
                <Zap size={12} className="text-primary-500" />
              </div>
              <p className="font-bold text-ink-900 text-sm">Recent Activity</p>
            </div>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-10 skeleton rounded-xl"></div>)}
            </div>
          ) : activityFeed.length === 0 ? (
            <EmptyState icon={Zap} padded={false} message="No recent activity yet." />
          ) : (
            <div className="p-4 space-y-1 overflow-y-auto max-h-80">
              {activityFeed.map((event, idx) => (
                <div key={`${event.id}-${idx}`} className="flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-cream-100 transition-colors">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs mt-0.5 ${event.color}`}>
                    <event.icon size={12} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink-700 leading-snug font-medium">{event.text}</p>
                    <p className="text-[12px] text-ink-600 mt-0.5 tabular-nums">
                      {event.time ? new Date(event.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka' }) : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </>
);

export default RecentActivitySection;
