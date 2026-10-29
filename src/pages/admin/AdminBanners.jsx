import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Loader2, RotateCcw, Megaphone } from 'lucide-react';
import * as bannerService from '../../services/bannerService';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/dashboard/EmptyState';
import { BANNER_STYLE_CLASSES } from '../../constants/bannerStyles';
import { useAdminList } from '../../hooks/useAdminList';

const STYLE_BADGES = {
  info: 'bg-secondary-50 text-secondary-600 border-secondary-100',
  success: 'bg-secondary-50 text-secondary-600 border-secondary-100',
  warning: 'bg-accent-50 text-accent-600 border-accent-100',
  promo: 'bg-primary-50 text-primary-600 border-primary-100',
};

const emptyForm = {
  message: '', link: '', linkText: '', style: 'info', isActive: true,
  startDate: '', endDate: '', order: 0,
};

const BannerManagement = () => {
  const { data: banners, loading, error, refetch: fetchBanners } = useAdminList(async () => {
    const data = await bannerService.getBanners();
    return Array.isArray(data) ? data : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditTarget(banner);
      setForm({
        ...banner,
        startDate: banner.startDate ? banner.startDate.substring(0, 10) : '',
        endDate: banner.endDate ? banner.endDate.substring(0, 10) : '',
      });
    } else {
      setEditTarget(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editTarget) {
        await bannerService.updateBanner(editTarget._id, payload);
      } else {
        await bannerService.createBanner(payload);
      }
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      toast.error(error.message || 'Error saving banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await bannerService.deleteBanner(deleteTarget);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (error) {
      toast.error(error.message || 'Error deleting banner');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Site Banners</h2>
          <p className="text-ink-500 text-sm">Manage the site-wide announcement bar.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchBanners} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-coral-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-coral-600 transition-all shadow-theme-md"
          >
            <Plus className="w-5 h-5" /> Add Banner
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm mb-4">{error}</div>
      )}

      <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-ink-50/50">
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Message</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Style</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Window</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Visibility</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 text-primary-600 animate-spin mx-auto" /></td></tr>
              ) : !error && banners.length === 0 ? (
                <tr><td colSpan="5">
                  <EmptyState icon={Megaphone} iconClassName="text-ink-200" message="No banners yet.">
                    <button
                      onClick={() => handleOpenModal()}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="w-4 h-4" /> Add your first banner
                    </button>
                  </EmptyState>
                </td></tr>
              ) : banners.map(b => (
                <tr key={b._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="px-6 py-5 max-w-md">
                    <p className="font-bold text-ink-900 truncate">{b.message}</p>
                    {b.link && <p className="text-sm text-ink-500 truncate">{b.linkText || b.link}</p>}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border ${STYLE_BADGES[b.style]}`}>{b.style}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-ink-500">
                    {b.startDate ? new Date(b.startDate).toLocaleDateString() : 'Always'} — {b.endDate ? new Date(b.endDate).toLocaleDateString() : 'No end'}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${b.isActive ? 'bg-secondary-100 text-secondary-600' : 'bg-ink-200 text-ink-500'}`}>
                      {b.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(b)} className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-ink-100">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(b._id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-ink-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-ink-100 flex justify-between items-center bg-ink-50/50">
              <h3 className="text-xl font-bold text-ink-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary-600" />
                {editTarget ? 'Edit Banner' : 'Add Banner'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-ink-200 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>
            <div className="px-8 pt-6">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-widest mb-2">Live preview</p>
              <div className="rounded-2xl overflow-hidden border border-ink-100">
                <div className={`relative px-4 py-2.5 text-sm font-semibold text-center ${BANNER_STYLE_CLASSES[form.style] || BANNER_STYLE_CLASSES.info}`}>
                  <span>{form.message || 'Your announcement message will appear here'}</span>
                  {form.link && (
                    <span className="ml-2 underline underline-offset-2">{form.linkText || 'Learn more'}</span>
                  )}
                </div>
              </div>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Message</label>
                <textarea
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium h-20"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Link URL</label>
                  <input
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Link Text</label>
                  <input
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.linkText}
                    onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Style</label>
                  <select
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.style}
                    onChange={(e) => setForm({ ...form, style: e.target.value })}
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="promo">Promo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Display Order</label>
                  <input
                    type="number"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-ink-400">Lower numbers show first (1, 2, 3...).</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">End Date</label>
                  <input
                    type="date"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Show on Website?</label>
                <select
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                  value={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Visible (students can see it)</option>
                  <option value="false">Hidden (not shown yet)</option>
                </select>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-ink-700 border border-ink-300 hover:border-primary-400 hover:text-primary-600 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="bg-coral-500 text-white px-8 py-3 rounded-xl font-bold shadow-theme-md hover:bg-coral-600 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete this banner?"
        message="This will permanently delete this banner. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const AdminBanners = () => (
  <BannerManagement />
);

export default AdminBanners;
