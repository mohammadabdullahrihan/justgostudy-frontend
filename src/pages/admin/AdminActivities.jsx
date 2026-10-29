import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Activity, Search, UserPlus, FilePlus, FileEdit, CheckCircle, XCircle, MessageCircle,
  LogIn, ShieldAlert, Mail, KeyRound, Download, ClipboardList, UploadCloud, Crown,
  Flag, X, RefreshCw, ArrowUpCircle, Lightbulb,
} from 'lucide-react';
import { getActivities } from '../../services/activityService';
import EmptyState from '../../components/dashboard/EmptyState';
import { ErrorBanner } from '../../components/dashboard/home/shared';

// Grouped role filters — a non-technical reader shouldn't need to know
// 'super_admin' and 'developer' are the same access level under two
// account labels; "Owner" covers both in one pill (see the comma-separated
// `role` param support in activityController.js). "Visitors" covers the
// public, not-logged-in lead-capture actions (consultation/newsletter/quiz/
// lead-magnet — see the `role: 'visitor'` actor those hooks log with).
const ROLE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Students', value: 'student' },
  { label: 'Agents', value: 'agent' },
  { label: 'Universities', value: 'university' },
  { label: 'Admins', value: 'admin' },
  { label: 'Owner', value: 'super_admin,developer' },
  { label: 'Visitors', value: 'visitor' },
];

// Mirrors ACTION_GROUPS in activityController.js — grouping by verb suffix
// instead of an exhaustive list of every possible 'resource.verb' key.
const ACTION_GROUP_FILTERS = [
  { label: 'All actions', value: 'all' },
  { label: 'Created', value: 'creates' },
  { label: 'Updated', value: 'updates' },
  { label: 'Deleted', value: 'deletes' },
  { label: 'Security events', value: 'security' },
  { label: 'Denied access', value: 'forbidden' },
  { label: 'Agent decisions', value: 'agent_decisions' },
];

// Same palette UserManagement.jsx's roleBadge() uses for student/agent/
// admin/super_admin/developer — 'university' and 'visitor' aren't in that
// map, extended here with brand tokens not already claimed by another role.
const ROLE_STYLES = {
  student: { badge: 'bg-primary-50 text-primary-600 border-primary-200', avatar: 'bg-primary-100 text-primary-700' },
  agent: { badge: 'bg-accent-50 text-accent-600 border-accent-200', avatar: 'bg-accent-100 text-accent-700' },
  university: { badge: 'bg-secondary-50 text-secondary-600 border-secondary-200', avatar: 'bg-secondary-100 text-secondary-700' },
  admin: { badge: 'bg-rose-50 text-rose-600 border-rose-200', avatar: 'bg-rose-100 text-rose-700' },
  super_admin: { badge: 'bg-accent-50 text-accent-600 border-accent-200', avatar: 'bg-accent-100 text-accent-700' },
  developer: { badge: 'bg-accent-50 text-accent-600 border-accent-200', avatar: 'bg-accent-100 text-accent-700' },
  visitor: { badge: 'bg-coral-50 text-coral-600 border-coral-200', avatar: 'bg-coral-100 text-coral-700' },
};
const DEFAULT_ROLE_STYLE = { badge: 'bg-ink-100 text-ink-600 border-ink-200', avatar: 'bg-ink-100 text-ink-600' };

// "super_admin"/"developer" read as internal jargon on a page explicitly
// meant to be readable by non-technical staff — shown as "Owner" instead,
// matching the "Owner" filter pill above.
const roleLabel = (role) => (role === 'super_admin' || role === 'developer' ? 'Owner' : role);

const ACTION_ICON = {
  'user.register': UserPlus,
  'user.login': LogIn,
  'user.update': FileEdit,
  'user.super_admin_created': Crown,
  'user.verification_email_requested': Mail,
  'user.password_reset_requested': KeyRound,
  'application.create': FilePlus,
  'application.status_change': FileEdit,
  'agent.approve': CheckCircle,
  'agent.reject': XCircle,
  'consultation.create': MessageCircle,
  'consultation.status_change': MessageCircle,
  'newsletter.subscribe': Mail,
  'newsletter.bulk_send': Mail,
  'quiz.submit': ClipboardList,
  'lead_magnet.download': Download,
  'upload.create': UploadCloud,
};

// Any dynamic 'resource.forbidden' key from the generic logger's 403
// handling — checked separately since it's not a fixed key like the others.
const iconForAction = (action) => (action?.endsWith('.forbidden') ? ShieldAlert : ACTION_ICON[action] || Activity);

// Paths an 'agent' role hits on their OWN dashboard pages that are gated by
// the `agentApproved` middleware (see middleware/agentApproved.js) — these
// 403 purely because the agent's account isn't approved yet, not because
// they tried to reach something they were never meant to see. Worth calling
// out separately from the generic "blocked from an admin-only page" case
// below, since the fix (go approve them) is completely different.
const AGENT_APPROVAL_GATED_PATHS = ['/api/applications/agent', '/api/agents/my-students', '/api/agents/referral-leaderboard'];

// Turns a raw 'resource.forbidden' entry into a plain-language "what
// happened / what do I do" pair for non-technical staff reading this page —
// sits alongside (not instead of) the raw technical fields below it.
const explainForbidden = (log) => {
  const name = log.actor?.name || 'This person';
  const role = roleLabel(log.actor?.role) || 'user';
  const path = log.meta?.path || '';

  if (log.actor?.role === 'agent' && AGENT_APPROVAL_GATED_PATHS.some((p) => path.startsWith(p))) {
    return {
      problem: `${name}'s agent account hasn't been approved yet, so the system is blocking their own dashboard pages (Applications, Students, or Referral Leaderboard) — this isn't them trying to access anything they shouldn't.`,
      solution: `Go to User Management, find ${name}, and click "Approve". That stops this error right away.`,
    };
  }

  return {
    problem: `${name} (${role}) tried to open a page or feature their account type isn't allowed to use, so the system correctly blocked it.`,
    solution: log.flagged
      ? `This happened 5+ times in a short window, which is why it's marked "Flagged" — worth a quick look to make sure ${name} isn't probing around, but it's often just repeated page reloads or a confused click. If their account should have access, check their role is set correctly in User Management.`
      : `No action needed — this is normal and expected. Only worth investigating if it keeps happening or gets "Flagged".`,
  };
};

const PAGE_SIZE = 30;
const AUTO_REFRESH_MS = 20000;
const EXPORT_CAP = 2000;

const dayKey = (iso) => new Date(iso).toDateString();

const dayLabel = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Dhaka' });
};

const timeLabel = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka' });

const fullTimestamp = (iso) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Dhaka' });

// CSV field quoting — doubles any embedded quote, wraps every field in
// quotes so commas/newlines inside a description never break the column
// count (same technique AdminQuizLeads.jsx's exportToCSV uses, just applied
// to every field here since descriptions are free text).
const csvField = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const AdminActivities = () => {
  const [role, setRole] = useState('all');
  const [actionGroup, setActionGroup] = useState('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [actorFilter, setActorFilter] = useState(null); // { id, name } | null — per-user drill-down
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [refreshTick, setRefreshTick] = useState(0);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [newActivityAvailable, setNewActivityAvailable] = useState(false);
  const [detailLog, setDetailLog] = useState(null);
  const requestIdRef = useRef(0);
  const newestIdRef = useRef(null); // latest loaded entry's _id, for the auto-refresh peek to compare against

  const filterParams = useMemo(
    () => ({
      role,
      actionGroup: actionGroup !== 'all' ? actionGroup : undefined,
      flagged: flaggedOnly ? 'true' : undefined,
      from: from || undefined,
      to: to || undefined,
      q: debouncedQuery || undefined,
      actorId: actorFilter?.id || undefined,
    }),
    [role, actionGroup, flaggedOnly, from, to, debouncedQuery, actorFilter]
  );

  const hasActiveFilters =
    role !== 'all' || actionGroup !== 'all' || flaggedOnly || from || to || debouncedQuery || actorFilter;

  // Light debounce so a search doesn't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(id);
  }, [query]);

  // Changing a filter always restarts pagination — a stale "load more"
  // offset from the previous filter would otherwise skip/duplicate rows.
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [role, actionGroup, flaggedOnly, from, to, debouncedQuery, actorFilter]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const isLoadMore = limit > PAGE_SIZE;
    (isLoadMore ? setLoadingMore : setLoading)(true);
    setError('');
    getActivities({ ...filterParams, page: 1, limit })
      .then((res) => {
        if (requestId !== requestIdRef.current) return; // a newer request superseded this one
        setLogs(res.logs || []);
        setTotal(res.total || 0);
        newestIdRef.current = res.logs?.[0]?._id || null;
        setNewActivityAvailable(false);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setError(err.message || 'Failed to load activity.');
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
        setLoadingMore(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams, limit, refreshTick]);

  // Auto-refresh: only peeks (limit: 1) while viewing the freshest page —
  // never silently reshuffles what's on screen while someone's reading it.
  // Surfaces a banner instead; clicking it is what actually reloads.
  useEffect(() => {
    if (limit !== PAGE_SIZE) return undefined;
    const interval = setInterval(() => {
      getActivities({ ...filterParams, page: 1, limit: 1 })
        .then((res) => {
          const latestId = res.logs?.[0]?._id;
          if (latestId && latestId !== newestIdRef.current) setNewActivityAvailable(true);
        })
        .catch(() => {}); // a failed background peek is never worth surfacing as an error
    }, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [filterParams, limit]);

  const handleRefresh = useCallback(() => {
    setNewActivityAvailable(false);
    setRefreshTick((t) => t + 1);
  }, []);

  const clearFilters = () => {
    setRole('all');
    setActionGroup('all');
    setFlaggedOnly(false);
    setFrom('');
    setTo('');
    setQuery('');
    setActorFilter(null);
  };

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await getActivities({ ...filterParams, page: 1, limit: Math.min(total || PAGE_SIZE, EXPORT_CAP) });
      const rows = (res.logs || []).map((l) => [
        fullTimestamp(l.createdAt),
        l.actor?.name || '',
        roleLabel(l.actor?.role) || '',
        l.action,
        l.description,
        l.ip || '',
      ]);
      const header = ['Date', 'Actor', 'Role', 'Action', 'Description', 'IP'].map(csvField).join(',');
      const csv = `data:text/csv;charset=utf-8,${header}\n${rows.map((r) => r.map(csvField).join(',')).join('\n')}`;
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csv));
      link.setAttribute('download', `activities-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.message || 'Failed to export activity.');
    } finally {
      setExporting(false);
    }
  };

  const groups = useMemo(() => {
    const byDay = new Map();
    for (const log of logs) {
      const key = dayKey(log.createdAt);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(log);
    }
    return Array.from(byDay.values());
  }, [logs]);

  const hasMore = logs.length < total;

  return (
    <div className="bg-white rounded-3xl border border-ink-100 shadow-theme-sm p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Activity size={17} />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-ink-900">Activities</h2>
            <p className="text-sm text-ink-500">See what students, agents, and admins are doing across the platform.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 text-ink-500 transition-colors hover:border-primary-300 hover:text-primary-600"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || logs.length === 0}
            className="flex items-center gap-2 rounded-xl border border-ink-300 bg-white px-4 py-2.5 text-sm font-bold text-ink-700 transition-all hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* "New activity" banner — auto-refresh surfaces here instead of
          silently reordering rows underneath someone reading them. */}
      {newActivityAvailable && (
        <button
          type="button"
          onClick={handleRefresh}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-50 py-2.5 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100"
        >
          <ArrowUpCircle className="h-4 w-4" /> New activity — tap to refresh
        </button>
      )}

      {actorFilter && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-accent-50 px-4 py-2.5 text-sm">
          <span className="font-semibold text-accent-700">Viewing activity for {actorFilter.name}</span>
          <button
            type="button"
            onClick={() => setActorFilter(null)}
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-full text-accent-600 transition-colors hover:bg-accent-100"
            aria-label="Clear this filter"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setRole(f.value)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
              role === f.value
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-ink-200 text-ink-600 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setFlaggedOnly((v) => !v)}
          className={`ml-auto flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
            flaggedOnly
              ? 'border-rose-500 bg-rose-500 text-white'
              : 'border-rose-200 text-rose-600 hover:border-rose-400'
          }`}
        >
          <Flag className="h-3 w-3" /> Flagged only
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <select
          value={actionGroup}
          onChange={(e) => setActionGroup(e.target.value)}
          className="rounded-xl border border-ink-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-ink-700 outline-none transition-colors focus:border-primary-400"
        >
          {ACTION_GROUP_FILTERS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          max={to || undefined}
          aria-label="From date"
          className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none transition-colors focus:border-primary-400"
        />
        <span className="text-xs text-ink-400">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          min={from || undefined}
          aria-label="To date"
          className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none transition-colors focus:border-primary-400"
        />
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activity..."
            className="w-full rounded-xl border border-ink-200 py-2.5 pl-9 pr-3 text-sm text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-primary-400"
          />
        </div>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="text-xs font-bold text-primary-600 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
        </div>
      ) : !error && logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          iconClassName="text-ink-200"
          message={hasActiveFilters ? 'No activity matches these filters.' : 'No activity yet — actions will show up here as people use the platform.'}
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group[0]._id}>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">
                {dayLabel(group[0].createdAt)}
              </p>
              <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100">
                {group.map((log) => {
                  const ActionIcon = iconForAction(log.action);
                  const style = ROLE_STYLES[log.actor?.role] || DEFAULT_ROLE_STYLE;
                  return (
                    // A <div role="button"> here, not a real <button> — the
                    // clickable actor avatar inside it is itself a real
                    // <button>, and nesting interactive elements inside a
                    // native <button> is invalid HTML (some browsers mishandle
                    // the inner element's own click/focus behavior).
                    <div
                      key={log._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setDetailLog(log)}
                      onKeyDown={(e) => e.key === 'Enter' && setDetailLog(log)}
                      className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-cream-50 ${
                        log.flagged ? 'border-l-2 border-l-rose-400 bg-rose-50/40 hover:bg-rose-50/60' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (log.actor?.id) setActorFilter({ id: log.actor.id, name: log.actor.name });
                        }}
                        disabled={!log.actor?.id}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${style.avatar} ${log.actor?.id ? 'hover:ring-2 hover:ring-primary-300' : 'cursor-default'}`}
                        title={log.actor?.id ? `View ${log.actor.name}'s activity` : undefined}
                      >
                        {(log.actor?.name || '?').charAt(0).toUpperCase()}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-ink-900">{log.actor?.name || 'Someone'}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}>
                            {roleLabel(log.actor?.role)}
                          </span>
                          {log.flagged && (
                            <span className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
                              <Flag className="h-2.5 w-2.5" /> Flagged
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 flex items-start gap-1.5 text-sm leading-snug text-ink-700">
                          <ActionIcon size={13} className="mt-0.5 shrink-0 text-ink-400" />
                          {log.description}
                        </p>
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-xs text-ink-400 tabular-nums">{timeLabel(log.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                disabled={loadingMore}
                className="rounded-full border border-ink-200 px-6 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:opacity-60"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Entry detail — raw meta/IP/user-agent, for the rare case the plain-
          language description isn't enough. */}
      {detailLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4 backdrop-blur-sm"
          onClick={() => setDetailLog(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-theme-lg"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <p className="font-bold text-ink-900">Activity detail</p>
              <button
                type="button"
                onClick={() => setDetailLog(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              <p className="text-sm leading-relaxed text-ink-800">{detailLog.description}</p>

              {/* Plain-language explanation — sits next to the technical
                  fields below, not instead of them, so a non-technical
                  reader gets "what happened / what do I do" without needing
                  to decode the action key or raw JSON. */}
              {detailLog.action?.endsWith('.forbidden') && (() => {
                const explanation = explainForbidden(detailLog);
                return (
                  <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-700">
                      <Lightbulb className="h-3.5 w-3.5" /> In plain language
                    </p>
                    <p className="text-sm leading-relaxed text-ink-800">
                      <span className="font-bold">What happened: </span>{explanation.problem}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-800">
                      <span className="font-bold">What to do: </span>{explanation.solution}
                    </p>
                  </div>
                );
              })()}

              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="font-bold uppercase tracking-wide text-ink-400">Actor</dt>
                  <dd className="mt-0.5 text-ink-700">{detailLog.actor?.name || '—'} ({roleLabel(detailLog.actor?.role)})</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-ink-400">Action</dt>
                  <dd className="mt-0.5 font-mono text-ink-700">{detailLog.action}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-ink-400">When</dt>
                  <dd className="mt-0.5 text-ink-700">{fullTimestamp(detailLog.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-ink-400">IP address</dt>
                  <dd className="mt-0.5 text-ink-700">{detailLog.ip || '—'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-bold uppercase tracking-wide text-ink-400">Device / browser</dt>
                  <dd className="mt-0.5 break-words text-ink-700">{detailLog.userAgent || '—'}</dd>
                </div>
              </dl>
              {detailLog.meta && Object.keys(detailLog.meta).length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">Raw data</p>
                  <pre className="overflow-x-auto rounded-xl bg-ink-950 p-3 text-[11px] leading-relaxed text-cream-100">
                    {JSON.stringify(detailLog.meta, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivities;
