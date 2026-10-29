import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Building2, X, RotateCcw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getUniversities, createUniversity, updateUniversity, deleteUniversity } from '../../services/universityService';
import { getDestinations } from '../../services/studyService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useModalA11y } from '../../hooks/useModalA11y';
import UNIVERSITY_SUB_REGIONS from '../../constants/universitySubRegions';

const emptyForm = {
  name: '', country: '', destination: '', location: '', description: '', website: '', ranking: '', establishedYear: '', logo: '', subRegion: '', institutionType: '',
};
const PAGE_SIZE = 10;

const UniversityManagement = () => {
  const [universities, setUniversities] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const modalRef = useModalA11y(showModal, () => setShowModal(false));

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const universitiesRes = await getUniversities();
      const list = Array.isArray(universitiesRes) ? universitiesRes : (universitiesRes.universities || universitiesRes.data || []);
      setUniversities(list);
    } catch (err) {
      setError(err.message || 'Failed to load universities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUniversities(); }, [fetchUniversities]);

  useEffect(() => {
    getDestinations().then((res) => {
      const list = Array.isArray(res) ? res : (res.destinations || res.data || []);
      setDestinations(Array.isArray(list) ? list : []);
    }).catch(() => setDestinations([]));
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (uni) => {
    setEditTarget(uni);
    setForm({
      name: uni.name || '',
      country: uni.country || '',
      destination: uni.destination?._id || uni.destination || '',
      location: uni.location || '',
      description: uni.description || '',
      website: uni.website || '',
      ranking: uni.ranking ?? '',
      establishedYear: uni.establishedYear ?? '',
      logo: uni.logo || '',
      subRegion: uni.subRegion || '',
      institutionType: uni.institutionType || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDestinationSelect = (destinationId) => {
    const dest = destinations.find((d) => d._id === destinationId);
    const nextCountry = dest ? dest.country : '';
    setForm((prev) => {
      // Clear subRegion when switching to a country with a different (or no)
      // sub-region list, so a stale value from the old country can't linger.
      const options = UNIVERSITY_SUB_REGIONS[nextCountry] || [];
      const subRegion = options.includes(prev.subRegion) ? prev.subRegion : '';
      return { ...prev, destination: destinationId, country: nextCountry || prev.country, subRegion };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.destination || !form.location) {
      setFormError('Name, destination and location are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        ranking: form.ranking !== '' ? parseInt(form.ranking) : null,
        establishedYear: form.establishedYear !== '' ? parseInt(form.establishedYear) : null,
      };
      if (editTarget) {
        await updateUniversity(editTarget._id, payload);
        toast.success('University updated');
      } else {
        await createUniversity(payload);
        toast.success('University created');
      }
      setShowModal(false);
      await fetchUniversities();
    } catch (err) {
      setFormError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUniversity(deleteTarget._id);
      toast.success('University deleted');
      await fetchUniversities();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredUniversities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter((u) => [u.name, u.country, u.location].filter(Boolean).join(' ').toLowerCase().includes(q));
  }, [universities, search]);

  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(Math.ceil(filteredUniversities.length / PAGE_SIZE), 1);
  const paginatedUniversities = filteredUniversities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-theme-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-bold text-ink-900 text-lg">University Management</h2>
        <div className="flex items-center gap-2">
          <button onClick={fetchUniversities} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button onClick={openCreate} className="text-sm px-4 py-2 bg-coral-500 text-white rounded-xl hover:bg-coral-600 transition-all font-semibold shadow-theme-sm">
            <Plus className="w-4 h-4 mr-2 inline" />Add University
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, country, or city…"
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-ink-200 rounded-xl text-ink-900 placeholder-ink-400 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all"
        />
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
      ) : filteredUniversities.length === 0 ? (
        <div className="text-center py-12 text-ink-500">
          <Building2 className="w-8 h-8 mb-3 mx-auto text-ink-500" />
          <p>{universities.length === 0 ? 'No universities yet.' : 'No universities match your search.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-ink-200">
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">University</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Country</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Sub-Region</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Type</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Ranking</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {paginatedUniversities.map((uni) => (
                <tr key={uni._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {uni.logo ? (
                        <img src={uni.logo} alt="" className="w-8 h-8 rounded-lg object-cover bg-ink-100" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-ink-100 border border-ink-200 flex items-center justify-center shrink-0">
                          <Building2 className="w-3 h-3 text-ink-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-ink-900 font-semibold">{uni.name}</p>
                        <p className="text-ink-500 text-sm">{uni.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-ink-600">{uni.country}</td>
                  <td className="py-3 pr-4 text-ink-500 text-xs">{uni.subRegion || '—'}</td>
                  <td className="py-3 pr-4 text-ink-500 text-xs">{uni.institutionType || '—'}</td>
                  <td className="py-3 pr-4 text-ink-600">{uni.ranking ? `#${uni.ranking}` : '—'}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(uni)} className="text-sm px-3 py-1 bg-ink-100 text-ink-700 border border-ink-200 rounded-lg hover:bg-ink-200 transition-all font-semibold">
                        Edit
                      </button>
                      <button onClick={() => setDeleteTarget(uni)} className="text-sm px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all font-semibold">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-100">
              <p className="text-xs text-ink-500">Page {page} of {totalPages} &middot; {filteredUniversities.length} universities</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="university-modal-title"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div ref={modalRef} className="bg-white border border-ink-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-ink-200">
              <h3 id="university-modal-title" className="font-bold text-ink-900 font-display">{editTarget ? 'Edit University' : 'Add University'}</h3>
              <button onClick={() => setShowModal(false)} aria-label="Close" className="w-8 h-8 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-500 flex items-center justify-center transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{formError}</div>
              )}
              <div>
                <label htmlFor="uni-name" className="block text-ink-600 text-sm font-semibold mb-1">Name *</label>
                <input id="uni-name" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="University of London" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="uni-country" className="block text-ink-600 text-sm font-semibold mb-1">Destination (Country) *</label>
                  <select id="uni-country" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.destination} onChange={(e) => handleDestinationSelect(e.target.value)} required>
                    <option value="">Select a destination</option>
                    {destinations.map((d) => (
                      <option key={d._id} value={d._id}>{d.country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="uni-location" className="block text-ink-600 text-sm font-semibold mb-1">Location *</label>
                  <input id="uni-location" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="London" required />
                </div>
                <div>
                  <label htmlFor="uni-ranking" className="block text-ink-600 text-sm font-semibold mb-1">Ranking</label>
                  <input id="uni-ranking" type="number" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.ranking} onChange={(e) => setForm({ ...form, ranking: e.target.value })} placeholder="50" />
                  <p className="text-xs text-ink-400 mt-1">The university&apos;s global ranking number, if known (e.g. 50).</p>
                </div>
                <div>
                  <label htmlFor="uni-established" className="block text-ink-600 text-sm font-semibold mb-1">Established Year</label>
                  <input id="uni-established" type="number" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.establishedYear} onChange={(e) => setForm({ ...form, establishedYear: e.target.value })} placeholder="1836" />
                </div>
                <div>
                  <label htmlFor="uni-institution-type" className="block text-ink-600 text-sm font-semibold mb-1">Institution Type</label>
                  <select id="uni-institution-type" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.institutionType} onChange={(e) => setForm({ ...form, institutionType: e.target.value })}>
                    <option value="">Not set</option>
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                {UNIVERSITY_SUB_REGIONS[form.country] && (
                  <div className="sm:col-span-2">
                    <label htmlFor="uni-subregion" className="block text-ink-600 text-sm font-semibold mb-1">Sub-Region</label>
                    <select id="uni-subregion" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.subRegion} onChange={(e) => setForm({ ...form, subRegion: e.target.value })}>
                      <option value="">Not set (shows in a flat list)</option>
                      {UNIVERSITY_SUB_REGIONS[form.country].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <p className="text-xs text-ink-400 mt-1">Groups this university on the Country Detail page&apos;s Universities tab.</p>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="uni-website" className="block text-ink-600 text-sm font-semibold mb-1">Website</label>
                <input id="uni-website" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://university.ac.uk" />
              </div>
              <div>
                <label htmlFor="uni-logo" className="block text-ink-600 text-sm font-semibold mb-1">Logo URL</label>
                <input id="uni-logo" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label htmlFor="uni-description" className="block text-ink-600 text-sm font-semibold mb-1">Description</label>
                <textarea id="uni-description" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-20 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete this university?"
        message={`"${deleteTarget?.name}" will be permanently deleted. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default UniversityManagement;
