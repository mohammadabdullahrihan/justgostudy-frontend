import { useState, useEffect, useCallback } from 'react';
import { Plus, GraduationCap, X, RotateCcw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import courseService from '../../services/courseService';
import { getUniversities } from '../../services/universityService';
import ConfirmModal from '../../components/common/ConfirmModal';

const PAGE_SIZE = 20;

const emptyForm = {
  name: '', universityId: '', level: '', duration: '', tuitionFee: '', currency: 'USD',
  ieltsRequirement: '', intake: '', description: '',
};

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [universities, setUniversities] = useState([]);
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

  useEffect(() => {
    getUniversities().then((uniRes) => {
      const uniList = Array.isArray(uniRes) ? uniRes : (uniRes?.universities || uniRes?.data || []);
      setUniversities(uniList);
    }).catch(() => setUniversities([]));
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const coursesRes = await courseService.getCourses({ limit: PAGE_SIZE, page, name: search || undefined });
      const courseList = Array.isArray(coursesRes) ? coursesRes : (coursesRes?.courses || coursesRes?.data || []);
      setCourses(courseList);
      setTotal(coursesRes?.total ?? courseList.length);
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditTarget(course);
    setForm({
      name: course.name || '',
      universityId: course.universityId?._id || course.universityId || '',
      level: course.level || '',
      duration: course.duration || '',
      tuitionFee: course.tuitionFee ?? '',
      currency: course.currency || 'USD',
      ieltsRequirement: course.ieltsRequirement ?? '',
      intake: (course.intake || []).join(', '),
      description: course.description || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.universityId || !form.level || !form.duration || !form.tuitionFee) {
      setFormError('Name, university, level, duration and tuition fee are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        tuitionFee: parseFloat(form.tuitionFee),
        ieltsRequirement: form.ieltsRequirement !== '' ? parseFloat(form.ieltsRequirement) : 0,
        intake: form.intake.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (editTarget) {
        await courseService.updateCourse(editTarget._id, payload);
      } else {
        await courseService.createCourse(payload);
      }
      setShowModal(false);
      await fetchCourses();
    } catch (err) {
      setFormError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await courseService.deleteCourse(deleteTarget);
      await fetchCourses();
    } catch (err) {
      setError(err.message || 'Delete failed.');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Levels are free text ('Foundation (pathway)', 'Higher Diploma in...',
  // 'Undergraduate (with Foundation Year)'), so match by keyword rather than
  // an exact key — checked most-specific-first (Foundation before
  // Undergraduate) so a foundation-year degree still reads as Foundation.
  const levelBadge = (level) => {
    const s = (level || '').toLowerCase();
    if (s.includes('foundation')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (s.includes('diploma')) return 'bg-accent-50 text-accent-600 border-accent-200';
    if (s.includes('phd') || s.includes('doctor')) return 'bg-rose-50 text-rose-600 border-rose-200';
    if (s.includes('postgraduate') || s.includes('graduate') || s.includes('master')) return 'bg-secondary-50 text-secondary-600 border-secondary-200';
    if (s.includes('undergraduate') || s.includes('bachelor')) return 'bg-primary-50 text-primary-600 border-primary-200';
    return 'bg-ink-100 text-ink-600 border-ink-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-theme-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-bold text-ink-900 text-lg">Course Management</h2>
        <div className="flex items-center gap-2">
          <button onClick={fetchCourses} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button onClick={openCreate} className="text-sm px-4 py-2 bg-coral-500 text-white rounded-xl hover:bg-coral-600 transition-all font-semibold shadow-theme-sm">
            <Plus className="w-4 h-4 mr-2 inline" />Add Course
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search courses by name..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-ink-300 rounded-xl text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-ink-500">
          <GraduationCap className="w-8 h-8 mb-3 mx-auto text-ink-500" />
          <p>{search ? `No courses match "${search}".` : 'No courses yet.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-ink-200">
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Course</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">University</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Degree Level</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Fee</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {courses.map((course) => (
                <tr key={course._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="text-ink-900 font-semibold">{course.name}</p>
                    <p className="text-ink-500 text-sm">{course.duration}</p>
                  </td>
                  <td className="py-3 pr-4 text-ink-600 text-sm">
                    {course.universityId?.name || '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${levelBadge(course.level)}`}>
                      {course.level}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-ink-600 text-sm">
                    {course.currency} {course.tuitionFee?.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(course)} className="text-sm px-3 py-1 bg-ink-100 text-ink-700 border border-ink-200 rounded-lg hover:bg-ink-200 transition-all font-semibold">
                        Edit
                      </button>
                      <button onClick={() => setDeleteTarget(course._id)} className="text-sm px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all font-semibold">
                        Delete
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
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} courses
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
              <h3 className="font-bold text-ink-900 font-display">{editTarget ? 'Edit Course' : 'Add Course'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-500 flex items-center justify-center transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{formError}</div>
              )}
              <div>
                <label className="block text-ink-600 text-sm font-semibold mb-1">Course Name *</label>
                <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="BSc Computer Science" required />
              </div>
              <div>
                <label className="block text-ink-600 text-sm font-semibold mb-1">University *</label>
                <select className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.universityId} onChange={(e) => setForm({ ...form, universityId: e.target.value })} required>
                  <option value="">Select university</option>
                  {universities.map((u) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-600 text-sm font-semibold mb-1">Degree Level *</label>
                  <select className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required>
                    <option value="">Select</option>
                    <option value="Foundation (pathway)">Foundation (pathway)</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ink-600 text-sm font-semibold mb-1">Duration *</label>
                  <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 Years" required />
                </div>
                <div>
                  <label className="block text-ink-600 text-sm font-semibold mb-1">Tuition Fee *</label>
                  <input type="number" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.tuitionFee} onChange={(e) => setForm({ ...form, tuitionFee: e.target.value })} placeholder="15000" required />
                </div>
                <div>
                  <label className="block text-ink-600 text-sm font-semibold mb-1">Currency</label>
                  <select className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ink-600 text-sm font-semibold mb-1">IELTS Requirement</label>
                  <input type="number" step="0.5" min="0" max="9" className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.ieltsRequirement} onChange={(e) => setForm({ ...form, ieltsRequirement: e.target.value })} placeholder="6.5" />
                </div>
              </div>
              <div>
                <label className="block text-ink-600 text-sm font-semibold mb-1">Intake Months</label>
                <input className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={form.intake} onChange={(e) => setForm({ ...form, intake: e.target.value })} placeholder="January, September" />
                <p className="text-xs text-ink-400 mt-1">List the months this course accepts students, separated by commas (e.g. January, September).</p>
              </div>
              <div>
                <label className="block text-ink-600 text-sm font-semibold mb-1">Description</label>
                <textarea className="w-full px-3 py-2 bg-white border border-ink-300 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-20 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief course description..." />
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
        title="Delete this course?"
        message="This will permanently delete this course. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CourseManagement;
