import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Loader2, RotateCcw, Search } from 'lucide-react';
import * as seoMetaService from '../../services/seoMetaService';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/dashboard/EmptyState';

const emptyForm = { pageKey: '', title: '', description: '', keywords: '', ogImage: '', canonicalUrl: '', isActive: true };

const SeoMetaManagement = () => {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchMetas(); }, []);

  const fetchMetas = async () => {
    try {
      const data = await seoMetaService.getSeoMetaList();
      setMetas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching SEO meta:', error);
      setMetas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (meta = null) => {
    if (meta) {
      setEditTarget(meta);
      setForm({ ...meta });
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
      if (editTarget) {
        await seoMetaService.updateSeoMeta(editTarget._id, form);
      } else {
        await seoMetaService.createSeoMeta(form);
      }
      setShowModal(false);
      fetchMetas();
    } catch (error) {
      toast.error(error.message || 'Error saving SEO meta');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await seoMetaService.deleteSeoMeta(deleteTarget);
      toast.success('SEO meta deleted');
      fetchMetas();
    } catch (error) {
      toast.error(error.message || 'Error deleting SEO meta');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Google Search Appearance</h2>
          <p className="text-ink-500 text-sm">Customize how specific pages look when they show up in Google search or get shared on social media.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchMetas} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-coral-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-coral-600 transition-all shadow-theme-md"
          >
            <Plus className="w-5 h-5" /> Add Page Override
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-ink-50/50">
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Website Page</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Search Title</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Visibility</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 text-primary-600 animate-spin mx-auto" /></td></tr>
              ) : metas.length === 0 ? (
                <tr><td colSpan="4">
                  <EmptyState icon={Search} iconClassName="text-ink-200" message="No SEO overrides yet.">
                    <button
                      onClick={() => handleOpenModal()}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="w-4 h-4" /> Add your first override
                    </button>
                  </EmptyState>
                </td></tr>
              ) : metas.map(m => (
                <tr key={m._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-ink-900 font-mono text-sm">{m.pageKey}</p>
                  </td>
                  <td className="px-6 py-5 max-w-md">
                    <p className="text-sm text-ink-700 truncate">{m.title}</p>
                    <p className="text-sm text-ink-500 truncate">{m.description}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${m.isActive ? 'bg-secondary-100 text-secondary-600' : 'bg-ink-200 text-ink-500'}`}>
                      {m.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(m)} className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-ink-100">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(m._id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-ink-100">
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
                <Search className="w-5 h-5 text-primary-600" />
                {editTarget ? 'Edit SEO Override' : 'Add SEO Override'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-ink-200 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Website Page Address</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-mono"
                  value={form.pageKey}
                  onChange={(e) => setForm({ ...form, pageKey: e.target.value })}
                  placeholder="/study-abroad/germany"
                  required
                />
                <p className="text-xs text-ink-400">The exact page address (URL path) you want to customize, e.g. /study-abroad/germany.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Search Result Title</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <p className="text-xs text-ink-400">The headline shown when this page appears in Google search results.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Search Result Description</label>
                <textarea
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium h-20"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <p className="text-xs text-ink-400">A short 1-2 sentence summary shown under the title in Google search results.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Keywords</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  placeholder="comma, separated, keywords"
                />
                <p className="text-xs text-ink-400">Words related to this page, separated by commas (e.g. Germany, study abroad, tuition free).</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Social Share Image</label>
                  <input
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.ogImage}
                    onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                  />
                  <p className="text-xs text-ink-400">Image shown when this page is shared on Facebook or other social media. Paste an image address (URL).</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Preferred Web Address (Advanced)</label>
                  <input
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.canonicalUrl}
                    onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                  />
                  <p className="text-xs text-ink-400">Only needed if this same content also appears at another address. Leave blank if unsure.</p>
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
                  {saving ? 'Saving...' : 'Save Override'}
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
        title="Delete this SEO override?"
        message="This will remove the custom meta tags for this page path. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const AdminSeoMeta = () => (
  <SeoMetaManagement />
);

export default AdminSeoMeta;
