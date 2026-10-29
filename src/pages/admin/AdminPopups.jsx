import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Loader2, RotateCcw, PictureInPicture2 } from 'lucide-react';
import * as popupService from '../../services/popupService';
import uploadService from '../../services/uploadService';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/dashboard/EmptyState';
import { useAdminList } from '../../hooks/useAdminList';

const emptyForm = {
  title: '', content: '', imageUrl: '', ctaText: '', ctaLink: '',
  trigger: 'delay', delaySeconds: 5, targetPages: 'all', isActive: true,
  startDate: '', endDate: '',
};

const PopupManagement = () => {
  const { data: popups, loading, error, refetch: fetchPopups } = useAdminList(async () => {
    const data = await popupService.getPopups();
    return Array.isArray(data) ? data : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const handleOpenModal = (popup = null) => {
    if (popup) {
      setEditTarget(popup);
      setForm({
        ...popup,
        startDate: popup.startDate ? popup.startDate.substring(0, 10) : '',
        endDate: popup.endDate ? popup.endDate.substring(0, 10) : '',
      });
    } else {
      setEditTarget(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadRes = await uploadService.uploadImage(file);
      setForm(prev => ({ ...prev, imageUrl: uploadRes.url || uploadRes.data?.url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        delaySeconds: parseInt(form.delaySeconds) || 0,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editTarget) {
        await popupService.updatePopup(editTarget._id, payload);
      } else {
        await popupService.createPopup(payload);
      }
      setShowModal(false);
      fetchPopups();
    } catch (error) {
      toast.error(error.message || 'Error saving popup');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await popupService.deletePopup(deleteTarget);
      toast.success('Popup deleted');
      fetchPopups();
    } catch (error) {
      toast.error(error.message || 'Error deleting popup');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Popup Campaigns</h2>
          <p className="text-ink-500 text-sm">Manage exit-intent and timed lead-capture popups.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchPopups} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-coral-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-coral-600 transition-all shadow-theme-md"
          >
            <Plus className="w-5 h-5" /> Add Popup
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
        ) : !error && popups.length === 0 ? (
          <div className="col-span-full py-16 bg-ink-50 rounded-[32px] border-2 border-dashed border-ink-200">
            <EmptyState icon={PictureInPicture2} iconClassName="text-ink-200" message="No popup campaigns yet.">
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" /> Add your first popup
              </button>
            </EmptyState>
          </div>
        ) : popups.map(p => (
          <div key={p._id} className="bg-ink-50 rounded-[32px] p-6 border border-ink-100 relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenModal(p)} className="p-2 bg-white rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-theme-sm border border-ink-100">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => setDeleteTarget(p._id)} className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-theme-sm border border-ink-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h4 className="font-bold text-ink-900 pr-16">{p.title}</h4>
            <p className="text-ink-500 text-sm mt-2 line-clamp-2">{p.content}</p>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-ink-200/50">
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-ink-200 text-ink-600">
                {p.trigger === 'delay' ? `${p.delaySeconds}s delay` : p.trigger.replace('_', ' ')}
              </span>
              <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${p.isActive ? 'bg-secondary-100 text-secondary-600' : 'bg-ink-200 text-ink-500'}`}>
                {p.isActive ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-ink-100 flex justify-between items-center bg-ink-50/50">
              <h3 className="text-xl font-bold text-ink-900 flex items-center gap-2">
                <PictureInPicture2 className="w-5 h-5 text-primary-600" />
                {editTarget ? 'Edit Popup' : 'Add Popup'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-ink-200 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>
            <div className="px-8 pt-6">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-widest mb-2">Live preview</p>
              <div className="bg-ink-900/5 rounded-2xl p-6 flex items-center justify-center">
                <div className="bg-white rounded-2xl w-full max-w-[260px] shadow-theme-lg overflow-hidden">
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="" className="w-full h-24 object-cover" />
                  )}
                  <div className="p-5 text-center">
                    <h4 className="text-sm font-bold text-ink-900 mb-1">{form.title || 'Popup title'}</h4>
                    <p className="text-ink-500 text-xs mb-3 line-clamp-3">{form.content || 'Popup content will appear here'}</p>
                    {form.ctaText && (
                      <span className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold">
                        {form.ctaText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Title</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Content</label>
                <textarea
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium h-20"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Image</label>
                <div className="flex items-center gap-4">
                  {form.imageUrl && <img src={form.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-ink-100" />}
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-ink-200 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 text-primary-600 animate-spin" /> : <span className="text-sm font-semibold text-ink-600">Upload Image</span>}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">CTA Text</label>
                  <input
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">CTA Link</label>
                  <input
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Trigger</label>
                  <select
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.trigger}
                    onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                  >
                    <option value="delay">Time Delay</option>
                    <option value="exit_intent">Exit Intent (shown when visitor is about to leave the page)</option>
                    <option value="scroll">On Scroll</option>
                  </select>
                  <p className="text-xs text-ink-400">Choose when this popup should appear to visitors.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Delay (seconds)</label>
                  <input
                    type="number"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.delaySeconds}
                    onChange={(e) => setForm({ ...form, delaySeconds: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Target Pages</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                  value={form.targetPages}
                  onChange={(e) => setForm({ ...form, targetPages: e.target.value })}
                  placeholder="all"
                />
                <p className="text-xs text-ink-400">Type &apos;all&apos; to show on every page, or list specific page addresses separated by commas (e.g. /courses, /universities).</p>
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
                  {saving ? 'Saving...' : 'Save Popup'}
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
        title="Delete this popup?"
        message="This will permanently delete this popup campaign. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const AdminPopups = () => (
  <PopupManagement />
);

export default AdminPopups;
