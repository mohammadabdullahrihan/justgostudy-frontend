import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Star, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import { getStudyPrograms, createStudyProgram, updateStudyProgram, deleteStudyProgram, getDestinations } from '../../services/studyService';
import universityService from '../../services/universityService';

// "Sept:2026-09-15, Jan:2027-01-10" <-> [{ season, deadline }], mirrors the
// plain comma-separated convention the `intakes` field already uses here,
// so admins get real countdown dates without a dedicated sub-form.
const parseIntakeDeadlines = (str) =>
  str.split(',').map((part) => part.trim()).filter(Boolean).map((part) => {
    const [season, deadline] = part.split(':').map((s) => s.trim());
    return { season, deadline };
  }).filter((d) => d.season && d.deadline);

const serializeIntakeDeadlines = (arr) =>
  (arr || []).map((d) => `${d.season}:${new Date(d.deadline).toISOString().slice(0, 10)}`).join(', ');

const PAGE_SIZE = 50;

const AdminStudyPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    university: '',
    country: '',
    destination: '',
    level: 'bachelor',
    duration: '',
    tuitionFee: '',
    currency: 'USD',
    intakes: '',
    intakeDeadlines: '',
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    fetchStudyPrograms();
  }, []);

  const fetchStudyPrograms = async () => {
    try {
      const [progRes, uniRes, destRes] = await Promise.all([
        getStudyPrograms(),
        universityService.getAllUniversities(),
        getDestinations()
      ]);

      // Handle programs
      const progData = Array.isArray(progRes) ? progRes :
        (progRes.studyPrograms || progRes.data?.data || progRes.data || []);
      setPrograms(Array.isArray(progData) ? progData : []);

      // Handle universities
      const uniList = Array.isArray(uniRes) ? uniRes :
        (uniRes.universities || uniRes.data || []);
      setUniversities(Array.isArray(uniList) ? uniList : []);

      // Handle destinations
      const destList = Array.isArray(destRes) ? destRes :
        (destRes.destinations || destRes.data || []);
      setDestinations(Array.isArray(destList) ? destList : []);
    } catch (error) {
      console.error('Error loading study programs:', error);
      toast.error('Failed to load data');
      setPrograms([]);
      setUniversities([]);
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStudyProgramSubmit = async (e) => {
    e.preventDefault();
    const programPayload = {
      ...formData,
      intakes: formData.intakes.split(',').map(i => i.trim()),
      intakeDeadlines: parseIntakeDeadlines(formData.intakeDeadlines),
      tuitionFee: Number(formData.tuitionFee)
    };

    try {
      if (currentProgram) {
        await updateStudyProgram(currentProgram._id, programPayload);
        toast.success('Program updated!');
      } else {
        await createStudyProgram(programPayload);
        toast.success('Program created!');
      }
      setIsModalOpen(false);
      fetchStudyPrograms();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (program) => {
    setCurrentProgram(program);
    setFormData({
      ...program,
      university: program.university?._id || program.university,
      destination: program.destination?._id || program.destination || '',
      intakes: program.intakes.join(', '),
      intakeDeadlines: serializeIntakeDeadlines(program.intakeDeadlines),
    });
    setIsModalOpen(true);
  };

  const handleDestinationSelect = (destinationId) => {
    const dest = destinations.find((d) => d._id === destinationId);
    setFormData((prev) => ({ ...prev, destination: destinationId, country: dest ? dest.country : prev.country }));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStudyProgram(deleteTarget);
      toast.success('Program deleted');
      fetchStudyPrograms();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [p.title, p.university?.name, p.country].filter(Boolean).join(' ').toLowerCase().includes(q);
  });

  const totalPages = Math.max(Math.ceil(filteredPrograms.length / PAGE_SIZE), 1);
  const paginatedPrograms = filteredPrograms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <>
    <div className="bg-white rounded-3xl border border-ink-100 shadow-theme-sm overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-ink-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Study Programs</h1>
          <p className="text-ink-500">Manage all international study programs</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search programs..."
              className="pl-10 pr-4 py-2 bg-ink-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64"
            />
          </div>
          <button onClick={fetchStudyPrograms} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => {
              setCurrentProgram(null);
              setFormData({
                title: '', university: '', country: '', destination: '', level: 'bachelor',
                duration: '', tuitionFee: '', currency: 'USD', intakes: '', intakeDeadlines: '',
                isFeatured: false, isActive: true
              });
              setIsModalOpen(true);
            }}
            className="bg-coral-500 hover:bg-coral-600 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-theme-sm"
          >
            <Plus className="w-4 h-4" />
            Add Program
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="bg-ink-50/50">
              <th className="px-8 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Program & University</th>
              <th className="px-8 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Degree Level</th>
              <th className="px-8 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Fee</th>
              <th className="px-8 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Featured</th>
              <th className="px-8 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-8 py-6 h-16 bg-ink-50/30"></td>
                </tr>
              ))
            ) : filteredPrograms.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center text-ink-500">
                  {programs.length === 0 ? 'No study programs yet.' : 'No programs match your search.'}
                </td>
              </tr>
            ) : paginatedPrograms.map(program => (
              <tr key={program._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                      {program.university?.logo ? (
                        <img src={program.university.logo} className="w-full h-full object-contain p-1" alt="" />
                      ) : (
                        <Star className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-ink-900">{program.title}</h4>
                      <p className="text-sm text-ink-500">{program.university?.name || 'Unknown Uni'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-ink-100 text-ink-600 text-xs font-bold rounded-full uppercase">
                    {program.level}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-ink-900">{program.currency} {program.tuitionFee.toLocaleString()}</p>
                </td>
                <td className="px-8 py-6">
                  <button
                    onClick={() => updateStudyProgram(program._id, { isFeatured: !program.isFeatured }).then(fetchStudyPrograms).catch((err) => toast.error(err.message || 'Failed to update'))}
                    className={`p-2 rounded-lg transition-colors ${program.isFeatured ? 'text-coral-500 bg-coral-50' : 'text-ink-500 hover:bg-ink-50'}`}
                  >
                    <Star className={`w-5 h-5 ${program.isFeatured ? 'fill-current' : ''}`} />
                  </button>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(program)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(program._id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && filteredPrograms.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-5 border-t border-ink-50">
          <p className="text-xs text-ink-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredPrograms.length)} of {filteredPrograms.length} programs
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-ink-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-ink-200">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-ink-900 mb-8">
              {currentProgram ? 'Edit Program' : 'Add New Program'}
            </h2>
            <form onSubmit={handleStudyProgramSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-ink-700 mb-2">Program Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">University</label>
                  <select
                    required
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select University</option>
                    {universities.map(uni => <option key={uni._id} value={uni._id}>{uni.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">Destination (Country)</label>
                  <select
                    required
                    value={formData.destination}
                    onChange={(e) => handleDestinationSelect(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select Destination</option>
                    {destinations.map(d => <option key={d._id} value={d._id}>{d.country}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">Degree Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="bachelor">Bachelor</option>
                    <option value="master">Master</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">Tuition Fee</label>
                  <input
                    required
                    type="number"
                    value={formData.tuitionFee}
                    onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">Duration</label>
                  <input
                    required
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 4 Years"
                    className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">Intake Months</label>
                  <input
                    required
                    type="text"
                    value={formData.intakes}
                    onChange={(e) => setFormData({ ...formData, intakes: e.target.value })}
                    placeholder="e.g. Sept, Jan, May"
                    className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <p className="mt-1 text-xs text-ink-400">List the months this program accepts new students, separated by commas (e.g. January, September).</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-2">Real Intake Deadlines (optional)</label>
                  <input
                    type="text"
                    value={formData.intakeDeadlines}
                    onChange={(e) => setFormData({ ...formData, intakeDeadlines: e.target.value })}
                    placeholder="e.g. Sept:2026-06-15, Jan:2026-10-01"
                    className="w-full px-5 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <p className="mt-1 text-xs text-ink-400">Add specific deadline dates if known, e.g. Fall:2026-09-01, Spring:2027-01-15. Leave blank if not sure.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-5 h-5 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="font-bold text-ink-700">Featured Program</span>
                  </label>
                  <p className="mt-1 text-xs text-ink-400">Show in the Featured Programs section on the homepage.</p>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="font-bold text-ink-700">Show on Website?</span>
                  </label>
                  <p className="mt-1 text-xs text-ink-400">Checked = visible to students, unchecked = hidden.</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 text-ink-700 border border-ink-300 font-bold hover:border-primary-400 hover:text-primary-600 transition-colors rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-coral-500 hover:bg-coral-600 text-white font-bold px-12 py-3 rounded-xl shadow-theme-md transition-all active:scale-95"
                >
                  {currentProgram ? 'Update Program' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    <ConfirmModal
      isOpen={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      onConfirm={handleDeleteConfirm}
      title="Delete this program?"
      message="This will permanently delete this study program. This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
};

export default AdminStudyPrograms;
