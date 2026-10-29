import { useState } from 'react';
import { Mail, Send, Download, Users, CheckCircle, XCircle, RotateCcw, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSubscribers, sendBulkEmail, subscribeNewsletter, updateSubscriber, deleteSubscriber } from '../../services/studyService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAdminList } from '../../hooks/useAdminList';

// Friendlier phrasing for the subscriber status badge.
const SUBSCRIBER_STATUS_LABELS = {
  active: 'Subscribed',
  unsubscribed: 'Unsubscribed',
};

const AdminNewsletter = () => {
  const { data: subscribers, loading, error, refetch: fetchSubscribers } = useAdminList(async () => {
    const subscribersRes = await getSubscribers();
    const subscribersData = Array.isArray(subscribersRes) ? subscribersRes :
      (subscribersRes.subscribers || subscribersRes.data?.data || subscribersRes.data || []);
    return Array.isArray(subscribersData) ? subscribersData : [];
  });
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    target: 'active',
  });

  const handleReviewCampaign = (e) => {
    e.preventDefault();
    setShowSendConfirm(true);
  };

  const handleSendEmail = async () => {
    setSending(true);
    const toastId = toast.loading('Sending emails...');
    try {
      await sendBulkEmail(emailData);
      toast.success('Campaign sent successfully!', { id: toastId });
      setShowSendConfirm(false);
      setShowCampaignModal(false);
      setEmailData({ subject: '', body: '', target: 'active' });
    } catch (error) {
      toast.error('Failed to send campaign', { id: toastId });
    } finally {
      setSending(false);
    }
  };

  const recipientCount = emailData.target === 'all'
    ? subscribers.length
    : subscribers.filter(s => s.status === 'active').length;

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      await subscribeNewsletter(newEmail.trim());
      toast.success('Subscriber added successfully');
      setShowAddModal(false);
      setNewEmail('');
      fetchSubscribers();
    } catch (error) {
      toast.error(error.message || 'Failed to add subscriber');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleStatus = async (sub) => {
    const newStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
    try {
      await updateSubscriber(sub._id, { status: newStatus });
      toast.success(`Subscriber ${newStatus === 'active' ? 'activated' : 'unsubscribed'}`);
      fetchSubscribers();
    } catch (error) {
      toast.error('Failed to update subscriber');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubscriber(deleteTarget);
      toast.success('Subscriber deleted successfully');
      fetchSubscribers();
    } catch (error) {
      toast.error('Failed to delete subscriber');
    }
    setDeleteTarget(null);
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Status', 'Date Subscribed'];
    const rows = subscribers.map(s => [s.email, s.status, new Date(s.subscribedAt).toLocaleDateString()]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Newsletter Management</h1>
          <p className="text-ink-500">Manage {subscribers.length} subscribers and send email campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchSubscribers} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-coral-500 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-coral-600 shadow-theme-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Subscriber
          </button>
          <button
            onClick={exportToCSV}
            className="px-5 py-2.5 bg-white border border-ink-300 text-ink-700 font-bold rounded-xl flex items-center gap-2 hover:border-primary-400 hover:text-primary-600 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowCampaignModal(true)}
            className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary-700 shadow-theme-lg shadow-primary-100 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            Send Campaign
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-ink-100 shadow-theme-sm">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-3xl font-bold text-ink-900">{subscribers.length}</h4>
          <p className="text-sm text-ink-500">Total Subscribers</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-ink-100 shadow-theme-sm">
          <div className="w-12 h-12 bg-secondary-50 rounded-2xl flex items-center justify-center text-secondary-600 mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="text-3xl font-bold text-ink-900">
            {subscribers.filter(s => s.status === 'active').length}
          </h4>
          <p className="text-sm text-ink-500">Active Members</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-ink-100 shadow-theme-sm">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
            <XCircle className="w-6 h-6" />
          </div>
          <h4 className="text-3xl font-bold text-ink-900">
            {subscribers.filter(s => s.status === 'unsubscribed').length}
          </h4>
          <p className="text-sm text-ink-500">Unsubscribed</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-ink-100 shadow-theme-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-ink-50/50">
                <th className="px-8 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Email Address</th>
                <th className="px-8 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Joined Date</th>
                <th className="px-8 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                [1, 2, 3].map(i => <tr key={i}><td colSpan="4" className="px-8 py-6 h-16 bg-ink-50/20 animate-pulse"></td></tr>)
              ) : subscribers.map(sub => (
                <tr key={sub._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center text-ink-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-ink-900">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border ${sub.status === 'active'
                        ? 'bg-secondary-50 text-secondary-600 border-secondary-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                      {SUBSCRIBER_STATUS_LABELS[sub.status] || sub.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-ink-500">
                    {new Date(sub.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(sub)}
                        className={`p-2.5 rounded-xl transition-all border ${sub.status === 'active'
                            ? 'text-rose-500 hover:bg-rose-50 hover:text-rose-600 border-rose-100 hover:border-rose-200'
                            : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-600 border-secondary-100 hover:border-secondary-200'
                          }`}
                        title={sub.status === 'active' ? 'Unsubscribe' : 'Activate'}
                      >
                        {sub.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sub._id)}
                        className="p-2.5 text-ink-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-ink-100 hover:border-rose-200"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Add Subscriber Modal */}
    {showAddModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl shadow-theme-lg w-full max-w-md border border-ink-200">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-ink-900 flex items-center gap-3">
                <Plus className="w-6 h-6 text-coral-600" />
                Add Subscriber
              </h2>
              <button onClick={() => { setShowAddModal(false); setNewEmail(''); }} className="p-2 hover:bg-ink-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-ink-500" />
              </button>
            </div>
            <form onSubmit={handleAddSubscriber} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="student@example.com"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setNewEmail(''); }}
                  className="px-8 py-3 text-ink-500 font-bold hover:text-ink-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="bg-coral-500 hover:bg-coral-600 text-white font-bold px-8 py-3 rounded-xl shadow-theme-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {adding ? 'Adding...' : 'Add Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    {/* Campaign Modal */}
    {showCampaignModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50">
        <div className="bg-white rounded-2xl shadow-theme-lg w-full max-w-2xl border border-ink-200 max-h-[85vh] flex flex-col">
          <div className="p-8 pb-4 border-b border-ink-100">
            <h2 className="text-2xl font-bold text-ink-900 flex items-center gap-3">
              <Mail className="w-8 h-8 text-primary-600" />
              New Email Campaign
            </h2>
          </div>
          <form onSubmit={handleReviewCampaign} className="p-8 pt-6 overflow-y-auto space-y-6">
            <div>
              <label className="block text-sm font-bold text-ink-700 mb-2">Subject</label>
              <input
                required
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Important update from Just Go Study..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink-700 mb-2">Target Audience</label>
              <select
                value={emailData.target}
                onChange={(e) => setEmailData({ ...emailData, target: e.target.value })}
                className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="active">Active Subscribers Only ({subscribers.filter(s => s.status === 'active').length})</option>
                <option value="all">All Subscribers ({subscribers.length})</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink-700 mb-2">Email Content (HTML allowed)</label>
              <textarea
                required
                rows="8"
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="<h1>Hello!</h1><p>We have exciting news...</p>"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setShowCampaignModal(false)}
                className="px-8 py-3 text-ink-500 font-bold hover:text-ink-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-12 py-3 rounded-xl shadow-xl shadow-primary-100 transition-all active:scale-95 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Campaign
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Send Campaign Confirmation */}
    <ConfirmModal
      isOpen={showSendConfirm}
      onClose={() => !sending && setShowSendConfirm(false)}
      onConfirm={handleSendEmail}
      title="Send this campaign?"
      message={`This will immediately email ${recipientCount} subscriber${recipientCount === 1 ? '' : 's'}${emailData.target === 'all' ? ' (including unsubscribed)' : ''}. This cannot be undone or unsent, double check the subject and content first.`}
      confirmText={sending ? 'Sending…' : `Send to ${recipientCount}`}
      cancelText="Go back and edit"
      type="danger"
    />

    {/* Delete Confirmation */}
    <ConfirmModal
      isOpen={showDeleteModal}
      onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
      onConfirm={handleDeleteConfirm}
      title="Delete Subscriber?"
      message="This will permanently remove this subscriber from your list. This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
};

export default AdminNewsletter;
