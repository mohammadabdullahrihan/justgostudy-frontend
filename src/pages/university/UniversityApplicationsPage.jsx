import { useState, useEffect, useCallback, useMemo } from 'react';
import RejectApplicationModal from '../../components/dashboard/RejectApplicationModal';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { RotateCcw, Inbox, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../../components/dashboard/home/shared';

const STATUS_OPTIONS = ['pending', 'under_review', 'accepted', 'rejected', 'visa_applied', 'visa_approved', 'departed'];
const FILTER_TABS = ['all', 'pending', 'under_review', 'accepted', 'rejected', 'visa_applied', 'visa_approved', 'departed'];
const PAGE_SIZE = 10;

const UniversityApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  const fetchUniversityApplications = useCallback(async () => {
    if (!user?.universityId) return;
    setLoading(true);
    setError('');
    try {
      const applicationsRes = await applicationService.getUniversityApplications();
      const apps = Array.isArray(applicationsRes?.data || applicationsRes) ? (applicationsRes?.data || applicationsRes) : [];
      setApplications(apps);
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchUniversityApplications(); }, [fetchUniversityApplications]);
  useEffect(() => { setPage(1); }, [search, filter]);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((app) => {
      if (filter !== 'all' && app.status !== filter) return false;
      if (!q) return true;
      const haystack = [app.studentId?.name, app.studentId?.email, app.courseId?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [applications, search, filter]);

  const totalPages = Math.max(Math.ceil(filteredApps.length / PAGE_SIZE), 1);
  const paginatedApps = filteredApps.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const applyStatusChange = async (appId, newStatus, rejectionReason) => {
    setActionLoading(appId);
    setError('');
    try {
      const updated = await applicationService.updateApplicationStatus(appId, newStatus, rejectionReason);
      setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, status: updated.status, rejectionReason: updated.rejectionReason } : a)));
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = (app, newStatus) => {
    if (newStatus === app.status) return;
    if (newStatus === 'rejected') {
      setRejectTarget(app);
      return;
    }
    applyStatusChange(app._id, newStatus);
  };

  const handleConfirmReject = async (reason) => {
    if (!rejectTarget) return;
    setRejecting(true);
    await applyStatusChange(rejectTarget._id, 'rejected', reason);
    setRejecting(false);
    setRejectTarget(null);
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Applications</h2>
          <p className="text-sm text-ink-500 mt-0.5">{filteredApps.length} of {applications.length} applications</p>
        </div>
        <button onClick={fetchUniversityApplications} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1 shrink-0">
          <RotateCcw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student or course…"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-ink-100/70 rounded-xl text-ink-900 placeholder-ink-400 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-ink-100/70 shadow-theme-sm flex-wrap">
          {FILTER_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                filter === s ? 'bg-primary-600 text-white shadow-theme-sm' : 'text-ink-500 hover:bg-cream-50'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white border border-ink-100/70 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ink-100/70 shadow-theme-sm">
          <Inbox className="w-12 h-12 mb-4 mx-auto text-ink-200" />
          <h3 className="text-lg font-bold text-ink-900">No applications found</h3>
          <p className="text-ink-500 mt-1">
            {applications.length === 0 ? 'No applications have been submitted yet.' : 'Try changing the search or filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-cream-50 border-b border-ink-100">
                  <th className="px-6 py-4 font-bold text-ink-700">Student</th>
                  <th className="px-6 py-4 font-bold text-ink-700">Course</th>
                  <th className="px-6 py-4 font-bold text-ink-700">Status</th>
                  <th className="px-6 py-4 font-bold text-ink-700">Applied Date</th>
                  <th className="px-6 py-4 font-bold text-ink-700">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {paginatedApps.map((app) => (
                  <tr key={app._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold shrink-0">
                          {app.studentId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-ink-900 truncate">{app.studentId?.name}</p>
                          <p className="text-sm text-ink-500 truncate">{app.studentId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-ink-800">{app.courseId?.name}</p>
                      <p className="text-sm text-ink-500">{app.courseId?.level}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={app.status}
                        title={app.status === 'rejected' ? app.rejectionReason || '' : ''}
                        uppercase
                      />
                    </td>
                    <td className="px-6 py-4 text-ink-500 text-sm">
                      {new Date(app.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app, e.target.value)}
                        disabled={actionLoading === app._id}
                        aria-label={`Change status for ${app.studentId?.name || 'application'}`}
                        className="text-sm bg-white border border-ink-200 rounded-lg text-ink-700 py-1.5 px-2 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 cursor-pointer disabled:opacity-40 transition-colors"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-ink-100">
              <p className="text-xs text-ink-500">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-ink-200 text-ink-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-ink-200 text-ink-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    <RejectApplicationModal
      isOpen={!!rejectTarget}
      onClose={() => !rejecting && setRejectTarget(null)}
      onConfirm={handleConfirmReject}
      submitting={rejecting}
      applicantLabel={rejectTarget ? `${rejectTarget.studentId?.name || 'Student'}, ${rejectTarget.courseId?.name || 'Course'}` : ''}
    />
    </>
  );
};

export default UniversityApplicationsPage;
