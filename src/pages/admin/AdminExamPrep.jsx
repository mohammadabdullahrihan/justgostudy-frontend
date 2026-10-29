import { useState, useEffect, useCallback } from 'react';
import { Plus, GraduationCap, X, RotateCcw, Edit, Trash2 } from 'lucide-react';
import examPrepService from '../../services/examPrepService';
import ConfirmModal from '../../components/common/ConfirmModal';

const TABS = [
  { key: 'cards', label: 'Exam Cards' },
  { key: 'compareRows', label: 'Compare Table' },
  { key: 'faqs', label: 'FAQs' },
];

const emptyCardForm = {
  examId: '', name: '', fullName: '', tagline: '', path: '', scoreLabel: '', duration: '', bestFor: '', officialUrl: '', order: 0,
};
const emptyRowForm = { label: '', ielts: '', pte: '', toefl: '', greGmat: '', order: 0 };
const emptyFaqForm = { q: '', a: '', order: 0 };

const RESOURCE_CONFIG = {
  cards: {
    emptyForm: emptyCardForm,
    create: examPrepService.createExamCard,
    update: examPrepService.updateExamCard,
    remove: examPrepService.deleteExamCard,
    toForm: (item) => ({
      examId: item.examId || '', name: item.name || '', fullName: item.fullName || '', tagline: item.tagline || '',
      path: item.path || '', scoreLabel: item.scoreLabel || '', duration: item.duration || '', bestFor: item.bestFor || '',
      officialUrl: item.officialUrl || '', order: item.order ?? 0,
    }),
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'examId', label: 'Exam ID' },
      { key: 'tagline', label: 'Tagline' },
      { key: 'order', label: 'Display Order' },
    ],
  },
  compareRows: {
    emptyForm: emptyRowForm,
    create: examPrepService.createCompareRow,
    update: examPrepService.updateCompareRow,
    remove: examPrepService.deleteCompareRow,
    toForm: (item) => ({
      label: item.label || '', ielts: item.ielts || '', pte: item.pte || '', toefl: item.toefl || '',
      greGmat: item.greGmat || '', order: item.order ?? 0,
    }),
    columns: [
      { key: 'label', label: 'Attribute' },
      { key: 'ielts', label: 'IELTS' },
      { key: 'pte', label: 'PTE' },
      { key: 'toefl', label: 'TOEFL' },
      { key: 'greGmat', label: 'GRE/GMAT' },
      { key: 'order', label: 'Display Order' },
    ],
  },
  faqs: {
    emptyForm: emptyFaqForm,
    create: examPrepService.createFaq,
    update: examPrepService.updateFaq,
    remove: examPrepService.deleteFaq,
    toForm: (item) => ({ q: item.q || '', a: item.a || '', order: item.order ?? 0 }),
    columns: [
      { key: 'q', label: 'Question' },
      { key: 'order', label: 'Display Order' },
    ],
  },
};

const AdminExamPrep = () => {
  const [activeTab, setActiveTab] = useState('cards');
  const [data, setData] = useState({ cards: [], compareRows: [], faqs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyCardForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const config = RESOURCE_CONFIG[activeTab];
  const items = data[activeTab] || [];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await examPrepService.getExamPrepData();
      setData({ cards: res.cards || [], compareRows: res.compareRows || [], faqs: res.faqs || [] });
    } catch (err) {
      setError(err.message || 'Failed to load exam prep content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(config.emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setForm(config.toForm(item));
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, order: parseInt(form.order) || 0 };
      if (activeTab === 'cards' && payload.examId) {
        payload.examId = payload.examId.toLowerCase().trim();
      }
      if (editTarget) {
        await config.update(editTarget._id, payload);
      } else {
        await config.create(payload);
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      setFormError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await config.remove(deleteTarget);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Delete failed.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-bold text-ink-900 text-lg">Exam Prep Management</h2>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button onClick={openCreate} className="text-sm px-4 py-2 bg-coral-500 text-white rounded-xl hover:bg-coral-600 transition-all font-semibold shadow-theme-sm">
            <Plus className="w-4 h-4 mr-2 inline" />Add {TABS.find((t) => t.key === activeTab)?.label.replace(/s$/, '')}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-ink-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-ink-100 border border-ink-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-ink-500">
          <GraduationCap className="w-8 h-8 mb-3 mx-auto text-ink-500" />
          <p>No {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-ink-200">
                {config.columns.map((col) => (
                  <th key={col.key} className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">{col.label}</th>
                ))}
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {items.map((item) => (
                <tr key={item._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  {config.columns.map((col) => (
                    <td key={col.key} className="py-3 pr-4 text-ink-600 max-w-xs truncate">{item[col.key]}</td>
                  ))}
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-sm px-3 py-1 bg-ink-100 text-ink-700 border border-ink-200 rounded-lg hover:bg-ink-200 transition-all font-semibold flex items-center gap-1">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => setDeleteTarget(item._id)} className="text-sm px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all font-semibold flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white border border-ink-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-ink-200">
              <h3 className="font-bold text-ink-900">
                {editTarget ? 'Edit' : 'Add'} {TABS.find((t) => t.key === activeTab)?.label.replace(/s$/, '')}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-500 flex items-center justify-center transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{formError}</div>
              )}

              {activeTab === 'cards' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-ink-600 text-sm font-semibold mb-1">Exam ID *</label>
                      <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.examId} onChange={(e) => setForm({ ...form, examId: e.target.value })} placeholder="ielts" required />
                    </div>
                    <div>
                      <label className="block text-ink-600 text-sm font-semibold mb-1">Name *</label>
                      <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-ink-600 text-sm font-semibold mb-1">Full Name *</label>
                    <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-ink-600 text-sm font-semibold mb-1">Tagline *</label>
                    <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-ink-600 text-sm font-semibold mb-1">Path *</label>
                    <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} placeholder="/language-club/exam-prep/ielts" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-ink-600 text-sm font-semibold mb-1">Score Label *</label>
                      <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.scoreLabel} onChange={(e) => setForm({ ...form, scoreLabel: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-ink-600 text-sm font-semibold mb-1">Duration *</label>
                      <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-ink-600 text-sm font-semibold mb-1">Best For *</label>
                    <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.bestFor} onChange={(e) => setForm({ ...form, bestFor: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-ink-600 text-sm font-semibold mb-1">Official URL *</label>
                    <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.officialUrl} onChange={(e) => setForm({ ...form, officialUrl: e.target.value })} required />
                  </div>
                </>
              )}

              {activeTab === 'compareRows' && (
                <>
                  <div>
                    <label className="block text-ink-600 text-sm font-semibold mb-1">Attribute Label *</label>
                    <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Format" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-ink-600 text-sm font-semibold mb-1">IELTS *</label>
                      <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.ielts} onChange={(e) => setForm({ ...form, ielts: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-ink-600 text-sm font-semibold mb-1">PTE *</label>
                      <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.pte} onChange={(e) => setForm({ ...form, pte: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-ink-600 text-sm font-semibold mb-1">TOEFL *</label>
                      <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.toefl} onChange={(e) => setForm({ ...form, toefl: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-ink-600 text-sm font-semibold mb-1">GRE/GMAT *</label>
                      <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.greGmat} onChange={(e) => setForm({ ...form, greGmat: e.target.value })} required />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'faqs' && (
                <>
                  <div>
                    <label className="block text-ink-600 text-sm font-semibold mb-1">Question *</label>
                    <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-ink-600 text-sm font-semibold mb-1">Answer *</label>
                    <textarea rows={5} className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })} required />
                  </div>
                </>
              )}

              <div>
                <label className="block text-ink-600 text-sm font-semibold mb-1">Display Order</label>
                <input type="number" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                <p className="text-xs text-ink-500 mt-1">Lower numbers show first (1, 2, 3...).</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-sm font-semibold text-ink-700 border border-ink-300 hover:border-primary-400 hover:text-primary-600 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 text-sm font-semibold text-white bg-coral-500 hover:bg-coral-600 rounded-xl transition-colors disabled:opacity-40">
                  {saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    <ConfirmModal
      isOpen={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      onConfirm={handleDeleteConfirm}
      title="Delete this entry?"
      message="This will permanently delete this entry. This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
};

export default AdminExamPrep;
