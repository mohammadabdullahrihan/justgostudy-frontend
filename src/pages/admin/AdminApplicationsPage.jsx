import { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Inbox, Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import RejectApplicationModal from '../../components/dashboard/RejectApplicationModal';
import ApplicationFormModal from '../../components/dashboard/ApplicationFormModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import applicationService from '../../services/applicationService';
import { StatusBadge } from '../../components/dashboard/home/shared';

const STATUS_OPTIONS = ['pending', 'under_review', 'accepted', 'rejected', 'visa_applied', 'visa_approved', 'departed'];
const FILTER_TABS = ['all', 'pending', 'under_review', 'accepted', 'rejected', 'visa_applied', 'visa_approved', 'departed'];
const PAGE_SIZE = 10;

const STATUS_LABELS = {
  pending: 'Pending',
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  visa_applied: 'Visa Applied',
  visa_approved: 'Visa Approved',
  departed: 'Departed',
};

const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  const [formMode, setFormMode] = useState('create');
  const [formTarget, setFormTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const applicationData = await applicationService.getAllApplications();
      setApplications(Array.isArray(applicationData) ? applicationData : []);
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const filteredApplications = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        app.studentId?.name,
        app.studentId?.email,
        app.courseId?.name,
        app.universityId?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [applications, search, statusFilter]);

  const totalPages = Math.max(Math.ceil(filteredApplications.length / PAGE_SIZE), 1);
  const paginatedApplications = filteredApplications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const openCreateForm = () => {
    setFormMode('create');
    setFormTarget(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (app) => {
    setFormMode('edit');
    setFormTarget(app);
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setFormOpen(false);
    setFormTarget(null);
  };

  const handleFormSubmit = async (payload) => {
    setFormSubmitting(true);
    setFormError('');
    try {
      if (formMode === 'edit') {
        const updated = await applicationService.updateApplication(formTarget._id, payload);
        setApplications((prev) => prev.map((a) => (a._id === formTarget._id ? updated : a)));
      } else {
        const created = await applicationService.createApplication(payload);
        setApplications((prev) => [created, ...prev]);
      }
      setFormOpen(false);
      setFormTarget(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save application.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await applicationService.deleteApplication(deleteTarget._id);
      setApplications((prev) => prev.filter((a) => a._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to delete application.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-ink-900">All Applications</h2>
          <p className="text-sm text-ink-500 mt-0.5">
            {filteredApplications.length} of {applications.length} applications
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={fetchApplications} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={openCreateForm}
            className="text-sm px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Application
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, course, university…"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-ink-200 rounded-xl text-ink-900 placeholder-ink-400 outline-none focus:border-coral-400 focus:ring-4 focus:ring-coral-500/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-coral-500 text-white shadow-sm'
                  : 'bg-ink-50 text-ink-500 hover:bg-ink-100'
              }`}
            >
              {tab === 'all' ? 'All' : STATUS_LABELS[tab] || tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm mb-4">{error}</div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-ink-50 border border-ink-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-9 h-9 text-ink-200 mb-3 mx-auto" />
          <p className="text-ink-500">
            {applications.length === 0 ? 'No applications found.' : 'No applications match your search or filter.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Student</th>
                  <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Course</th>
                  <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">University</th>
                  <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Status</th>
                  <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Change Status</th>
                  <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {paginatedApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-ink-50/60 transition-colors">
                    <td className="py-3.5 pr-4">
                      <p className="text-ink-900 font-semibold">{app.studentId?.name || '—'}</p>
                      <p className="text-ink-500 text-sm">{app.studentId?.email || '—'}</p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="text-ink-700 text-sm truncate max-w-[140px]" title={app.courseId?.name || ''}>
                        {app.courseId?.name || '—'}
                      </p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="text-ink-500 text-sm truncate max-w-[120px]" title={app.universityId?.name || ''}>
                        {app.universityId?.name || '—'}
                      </p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge
                        status={app.status}
                        title={app.status === 'rejected' ? app.rejectionReason || '' : ''}
                      />
                    </td>
                    <td className="py-3.5 pr-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app, e.target.value)}
                        disabled={actionLoading === app._id}
                        className="text-sm bg-white border border-ink-200 rounded-lg text-ink-700 py-1.5 px-2 focus:outline-none focus:border-coral-400 cursor-pointer disabled:opacity-40 transition-colors"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(app)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 transition-colors"
                          aria-label="Edit application"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(app)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                          aria-label="Delete application"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-ink-50">
              <p className="text-xs text-ink-500">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>

    <RejectApplicationModal
      isOpen={!!rejectTarget}
      onClose={() => !rejecting && setRejectTarget(null)}
      onConfirm={handleConfirmReject}
      submitting={rejecting}
      applicantLabel={rejectTarget ? `${rejectTarget.studentId?.name || 'Student'}, ${rejectTarget.courseId?.name || 'Course'}` : ''}
    />

    <ApplicationFormModal
      isOpen={formOpen}
      onClose={closeForm}
      onSubmit={handleFormSubmit}
      mode={formMode}
      initialData={formTarget}
      submitting={formSubmitting}
      error={formError}
    />

    <ConfirmModal
      isOpen={!!deleteTarget}
      onClose={() => !deleting && setDeleteTarget(null)}
      onConfirm={handleDeleteConfirm}
      title="Delete this application?"
      message={`Permanently delete the application from ${deleteTarget?.studentId?.name || 'this student'} for ${deleteTarget?.courseId?.name || 'this course'}? This cannot be undone.`}
      confirmText={deleting ? 'Deleting…' : 'Delete'}
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
};

export default AdminApplicationsPage;
