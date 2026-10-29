import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Lightbulb, Send, Trash2, RotateCcw, Loader2, MessageSquare, Upload, X } from 'lucide-react';
import * as featureRequestService from '../../services/featureRequestService';
import uploadService from '../../services/uploadService';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/dashboard/EmptyState';
import { useAdminList } from '../../hooks/useAdminList';
import { useAuth } from '../../context/AuthContext';
import { formatRole } from '../../utils/formatRole';

const CATEGORY_LABELS = {
  feature: 'New Feature',
  improvement: 'Improvement',
  bug: 'Bug Report',
  other: 'Other',
};

const STATUS_LABELS = {
  new: 'New',
  planned: 'Planned',
  in_progress: 'In Progress',
  done: 'Done',
  declined: 'Declined',
};

const STATUS_COLORS = {
  new: 'bg-accent-50 text-accent-600 border-accent-200',
  planned: 'bg-primary-50 text-primary-600 border-primary-200',
  in_progress: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  done: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  declined: 'bg-rose-50 text-rose-600 border-rose-200',
};

const emptyForm = { title: '', description: '', category: 'feature', imageUrl: '' };

// Shared board for Admin + Super Admin to send update/change/new-feature
// requests to Developer. Everyone (Admin, Super Admin, Developer) sees the
// same list and can reply in a real per-request thread — but only Developer
// drives the status workflow (New/Planned/In Progress/Done/Declined), since
// they're the one actually doing the work. Delete stays with the app's
// usual super_admin-or-developer split.
const FeatureRequestsBoard = () => {
  const { user } = useAuth();
  const isDeveloper = user?.role === 'developer';
  // Status workflow (New/Planned/In Progress/Done/Declined) is Developer's
  // call only — they're the one actually doing the work. Admin and Super
  // Admin submit requests and can reply/clarify, but don't drive status.
  const canChangeStatus = isDeveloper;
  const canReply = user?.role === 'admin' || user?.role === 'super_admin' || isDeveloper;
  const canDelete = user?.role === 'super_admin' || isDeveloper;

  const { data: requests, loading, error, refetch } = useAdminList(async () => {
    const data = await featureRequestService.getFeatureRequests();
    return Array.isArray(data) ? data : [];
  });

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusSaving, setStatusSaving] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Per-request draft text for the reply composer, keyed by request id.
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySending, setReplySending] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await featureRequestService.createFeatureRequest(form);
      toast.success('Request sent!');
      setForm(emptyForm);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not send the request, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadRes = await uploadService.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: uploadRes.url || uploadRes.data?.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleStatusChange = async (id, status) => {
    setStatusSaving(id);
    try {
      await featureRequestService.updateFeatureRequest(id, { status });
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update the status');
    } finally {
      setStatusSaving(null);
    }
  };

  const handleReplySubmit = async (id) => {
    const text = replyDrafts[id]?.trim();
    if (!text) return;
    setReplySending(id);
    try {
      await featureRequestService.addFeatureRequestReply(id, text);
      setReplyDrafts((prev) => ({ ...prev, [id]: '' }));
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not send the reply');
    } finally {
      setReplySending(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await featureRequestService.deleteFeatureRequest(deleteTarget);
      toast.success('Request deleted');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not delete the request');
    } finally {
      setDeleteTarget(null);
    }
  };

  const requestList = (
    <div className="rounded-3xl border border-ink-100 bg-white shadow-theme-sm">
      <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4 md:px-8">
        <h3 className="font-bold text-ink-900">{isDeveloper ? 'Requests' : 'All Requests'}</h3>
        <button onClick={refetch} className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
          <RotateCcw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <div className="m-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">{error}</div>
      )}

      {loading ? (
        <div className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary-600" /></div>
      ) : !error && requests.length === 0 ? (
        <EmptyState icon={Lightbulb} message={isDeveloper ? 'No requests yet — nothing sent in from Admin/Super Admin so far.' : 'No requests yet — use the form below to send the first one.'} />
      ) : (
        <div className="divide-y divide-ink-50">
          {requests.map((r) => {
            const replyDraft = replyDrafts[r._id] ?? '';
            return (
              <div key={r._id} className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-start md:justify-between md:px-8">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-ink-900">{r.title}</h4>
                    <span className="rounded-full border border-ink-100 bg-ink-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                      {CATEGORY_LABELS[r.category] || r.category}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_COLORS[r.status] || 'bg-ink-50 text-ink-500 border-ink-200'}`}>
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-sm text-ink-600">{r.description}</p>
                  {r.imageUrl && (
                    <a href={r.imageUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block w-fit">
                      <img
                        src={r.imageUrl}
                        alt="Attached screenshot"
                        className="max-h-56 rounded-xl border border-ink-100 object-contain transition-opacity hover:opacity-90"
                      />
                    </a>
                  )}
                  <p className="mt-2 text-xs text-ink-400">
                    {r.requestedBy?.name || 'Someone'} ({r.requestedBy?.role ? formatRole(r.requestedBy.role) : 'Admin'}) · {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>

                  {/* A real thread — Admin, Super Admin, and Developer all
                      reply here, chat-style, each message keeping its own
                      author instead of one shared note overwriting the last. */}
                  {canReply && (
                    <div className="mt-3 space-y-2">
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-ink-500">
                        <MessageSquare className="h-3 w-3" /> Discussion{r.replies?.length ? ` (${r.replies.length})` : ''}
                      </label>

                      {r.replies?.length > 0 && (
                        <div className="max-h-56 space-y-2.5 overflow-y-auto rounded-xl border border-ink-100 bg-ink-50/60 p-3">
                          {r.replies.map((reply, i) => (
                            <div key={reply._id || i} className={reply.author?._id === user?._id ? 'text-right' : ''}>
                              <div className={`inline-block max-w-[85%] rounded-xl px-3 py-2 text-left ${reply.author?._id === user?._id ? 'bg-primary-600 text-white' : 'bg-white text-ink-900 border border-ink-100'}`}>
                                <p className={`mb-0.5 text-[11px] font-bold uppercase tracking-wide ${reply.author?._id === user?._id ? 'text-primary-100' : 'text-ink-400'}`}>
                                  {reply.author?.name || 'Someone'} · {reply.author?.role ? formatRole(reply.author.role) : ''}
                                </p>
                                <p className="whitespace-pre-line text-sm">{reply.text}</p>
                                <p className={`mt-0.5 text-[11px] ${reply.author?._id === user?._id ? 'text-primary-100' : 'text-ink-400'}`}>
                                  {new Date(reply.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-end gap-2">
                        <textarea
                          className="h-12 w-full rounded-xl border border-ink-100 bg-ink-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          value={replyDraft}
                          onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [r._id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleReplySubmit(r._id);
                            }
                          }}
                          placeholder="Write a reply..."
                        />
                        <button
                          onClick={() => handleReplySubmit(r._id)}
                          disabled={!replyDraft.trim() || replySending === r._id}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-all hover:bg-primary-700 disabled:opacity-50"
                          aria-label="Send reply"
                        >
                          {replySending === r._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {(canChangeStatus || canDelete) && (
                  <div className="flex shrink-0 items-center gap-2">
                    {canChangeStatus && (
                      <select
                        value={r.status}
                        disabled={statusSaving === r._id}
                        onChange={(e) => handleStatusChange(r._id, e.target.value)}
                        className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeleteTarget(r._id)}
                        className="rounded-xl border border-ink-100 p-2.5 text-rose-500 transition-all hover:bg-rose-50"
                        aria-label="Delete request"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const submitForm = (
    <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-theme-sm md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50">
          <Lightbulb className="h-5 w-5 text-primary-600" />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Request an Update or New Feature</h2>
          <p className="text-sm text-ink-500">Tell us what should change or what you&apos;d like added — it goes straight to the team maintaining the site.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-ink-500">Title</label>
            <input
              className="w-full rounded-xl border border-ink-100 bg-ink-50 px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Add a filter to the Applications page"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-ink-500">Type</label>
            <select
              className="w-full rounded-xl border border-ink-100 bg-ink-50 px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-ink-500">Details</label>
          <textarea
            className="h-28 w-full rounded-xl border border-ink-100 bg-ink-50 px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe what you need, and why it would help."
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-ink-500">Screenshot (optional)</label>
          {form.imageUrl ? (
            <div className="relative w-fit">
              <img src={form.imageUrl} alt="" className="max-h-48 rounded-xl border border-ink-100 object-contain" />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                className="absolute -right-2 -top-2 rounded-full bg-ink-900 p-1 text-white shadow-theme-md hover:bg-ink-700"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 px-4 py-3 cursor-pointer transition-all hover:border-primary-300 hover:bg-primary-50">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
              ) : (
                <Upload className="h-4 w-4 text-ink-500" />
              )}
              <span className="text-sm font-semibold text-ink-600">
                {uploading ? 'Uploading...' : 'Attach a screenshot'}
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-coral-500 px-6 py-3 font-bold text-white shadow-theme-md transition-all hover:bg-coral-600 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Developer is the recipient, not the sender — just the list, no
          submit form. Admin/Super Admin are the ones sending requests, so
          their form comes first and the list of what they've sent is below. */}
      {isDeveloper ? requestList : (
        <>
          {submitForm}
          {requestList}
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete this request?"
        message="This will permanently delete this request. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const FeatureRequests = () => (
  <FeatureRequestsBoard />
);

export default FeatureRequests;
