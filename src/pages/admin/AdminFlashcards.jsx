import { useState, useEffect, useCallback } from 'react';
import { Plus, BookOpen, X, RotateCcw, Search, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import flashcardService from '../../services/flashcardService';
import ConfirmModal from '../../components/common/ConfirmModal';

const PAGE_SIZE = 20;

const emptyForm = {
  languageId: '', word: '', translation: '', pronunciation: '', example: '', category: 'Basics', order: 0, isActive: true,
};

const FlashcardManagement = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [languageFilter, setLanguageFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Debounce the search box into `search`, and reset back to page 1 whenever it changes.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const fetchFlashcards = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await flashcardService.getFlashcardsAdmin({
        limit: PAGE_SIZE, page, search: search || undefined, languageId: languageFilter || undefined,
      });
      setFlashcards(res.flashcards || []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setError(err.message || 'Failed to load flashcards.');
    } finally {
      setLoading(false);
    }
  }, [page, search, languageFilter]);

  useEffect(() => { fetchFlashcards(); }, [fetchFlashcards]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const openCreate = () => {
    setEditTarget(null);
    setForm(languageFilter ? { ...emptyForm, languageId: languageFilter } : emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (card) => {
    setEditTarget(card);
    setForm({
      languageId: card.languageId || '',
      word: card.word || '',
      translation: card.translation || '',
      pronunciation: card.pronunciation || '',
      example: card.example || '',
      category: card.category || 'Basics',
      order: card.order ?? 0,
      isActive: card.isActive,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.languageId || !form.word || !form.translation) {
      setFormError('Language, word and translation are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, order: parseInt(form.order) || 0, languageId: form.languageId.toLowerCase().trim() };
      if (editTarget) {
        await flashcardService.updateFlashcard(editTarget._id, payload);
      } else {
        await flashcardService.createFlashcard(payload);
      }
      setShowModal(false);
      await fetchFlashcards();
    } catch (err) {
      setFormError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await flashcardService.deleteFlashcard(deleteTarget);
      await fetchFlashcards();
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
        <h2 className="font-bold text-ink-900 text-lg">Flashcard Management</h2>
        <div className="flex items-center gap-2">
          <button onClick={fetchFlashcards} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button onClick={openCreate} className="text-sm px-4 py-2 bg-coral-500 text-white rounded-xl hover:bg-coral-600 transition-all font-semibold shadow-theme-sm">
            <Plus className="w-4 h-4 mr-2 inline" />Add Flashcard
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by word..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-ink-300 rounded-xl text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <input
          value={languageFilter}
          onChange={(e) => { setLanguageFilter(e.target.value.toLowerCase()); setPage(1); }}
          placeholder="Filter by language id (e.g. spanish)"
          className="px-3 py-2 bg-white border border-ink-300 rounded-xl text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-w-xs"
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-ink-100 border border-ink-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : flashcards.length === 0 ? (
        <div className="text-center py-12 text-ink-500">
          <BookOpen className="w-8 h-8 mb-3 mx-auto text-ink-500" />
          <p>{search || languageFilter ? 'No flashcards match your filters.' : 'No flashcards yet.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-ink-200">
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Word</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Translation</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Language</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Topic</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Visibility</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {flashcards.map((card) => (
                <tr key={card._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="text-ink-900 font-semibold">{card.word}</p>
                    {card.pronunciation && <p className="text-ink-500 text-sm">{card.pronunciation}</p>}
                  </td>
                  <td className="py-3 pr-4 text-ink-600">{card.translation}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-0.5 rounded-full border font-semibold bg-primary-50 text-primary-600 border-primary-200 capitalize">
                      {card.languageId}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-ink-600 text-sm">{card.category}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase ${card.isActive ? 'bg-secondary-50 text-secondary-600' : 'bg-ink-100 text-ink-500'}`}>
                      {card.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(card)} className="text-sm px-3 py-1 bg-ink-100 text-ink-700 border border-ink-200 rounded-lg hover:bg-ink-200 transition-all font-semibold flex items-center gap-1">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => setDeleteTarget(card._id)} className="text-sm px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all font-semibold flex items-center gap-1">
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

      {!loading && total > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
          <p className="text-xs text-ink-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} flashcards
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-ink-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white border border-ink-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-ink-200">
              <h3 className="font-bold text-ink-900">{editTarget ? 'Edit Flashcard' : 'Add Flashcard'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-500 flex items-center justify-center transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{formError}</div>
              )}
              <div>
                <label className="block text-ink-600 text-sm font-semibold mb-1">Language ID *</label>
                <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.languageId} onChange={(e) => setForm({ ...form, languageId: e.target.value })} placeholder="spanish" required />
                <p className="text-xs text-ink-500 mt-1">Lowercase id matching the language club&apos;s languageId (e.g. spanish, french, bangla).</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-600 text-sm font-semibold mb-1">Word *</label>
                  <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-ink-600 text-sm font-semibold mb-1">Translation *</label>
                  <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-ink-600 text-sm font-semibold mb-1">Pronunciation</label>
                <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.pronunciation} onChange={(e) => setForm({ ...form, pronunciation: e.target.value })} placeholder="/həˈloʊ/" />
              </div>
              <div>
                <label className="block text-ink-600 text-sm font-semibold mb-1">Example Sentence</label>
                <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-ink-600 text-sm font-semibold mb-1">Topic</label>
                  <input list="flashcard-topic-suggestions" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Basics" />
                  <datalist id="flashcard-topic-suggestions">
                    <option value="Basics" />
                    <option value="Greetings" />
                    <option value="Travel" />
                    <option value="Food" />
                    <option value="Numbers" />
                  </datalist>
                  <p className="text-xs text-ink-500 mt-1">Groups related items together on the website.</p>
                </div>
                <div>
                  <label className="block text-ink-600 text-sm font-semibold mb-1">Display Order</label>
                  <input type="number" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                  <p className="text-xs text-ink-500 mt-1">Lower numbers show first (1, 2, 3...).</p>
                </div>
                <div>
                  <label className="block text-ink-600 text-sm font-semibold mb-1">Show on Website?</label>
                  <select className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                    <option value="true">Visible (students can see it)</option>
                    <option value="false">Hidden (not shown yet)</option>
                  </select>
                </div>
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
      title="Delete this flashcard?"
      message="This will permanently delete this flashcard. This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
};

export default FlashcardManagement;
