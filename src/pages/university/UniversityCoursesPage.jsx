import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import universityCourseService from '../../services/universityCourseService';
import { useAuth } from '../../context/AuthContext';
import { useModalA11y } from '../../hooks/useModalA11y';
import { Plus, GraduationCap, Clock, Calendar, X } from 'lucide-react';

const UniversityCoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const modalRef = useModalA11y(isModalOpen, () => setIsModalOpen(false));
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    duration: '',
    tuitionFee: '',
    currency: 'USD',
    ieltsRequirement: '',
    intake: [],
    description: '',
  });

  const fetchUniversityCourses = useCallback(async () => {
    if (!user?.universityId) return;
    setLoading(true);
    setError('');
    try {
      const courseList = await universityCourseService.getMyCourses();
      setCourses(Array.isArray(courseList) ? courseList : []);
    } catch (err) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchUniversityCourses(); }, [fetchUniversityCourses]);

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      level: '',
      duration: '',
      tuitionFee: '',
      currency: 'USD',
      ieltsRequirement: '',
      intake: [],
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      level: course.level,
      duration: course.duration,
      tuitionFee: course.tuitionFee,
      currency: course.currency,
      ieltsRequirement: course.ieltsRequirement,
      intake: Array.isArray(course.intake) ? course.intake : [],
      description: course.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await universityCourseService.deleteCourse(deleteTarget._id);
      setCourses(courses.filter(c => c._id !== deleteTarget._id));
      toast.success('Course deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete course.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedCourse;
      if (editingCourse) {
        updatedCourse = await universityCourseService.updateCourse(editingCourse._id, formData);
        setCourses(courses.map(c => c._id === updatedCourse._id ? updatedCourse : c));
        toast.success('Course updated');
      } else {
        updatedCourse = await universityCourseService.createCourse(formData);
        setCourses([...courses, updatedCourse]);
        toast.success('Course created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save course.');
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
    return 'bg-ink-50 text-ink-600 border-ink-200';
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-ink-900">Our Courses</h2>
        <button
          onClick={handleOpenCreateModal}
          className="bg-coral-500 hover:bg-coral-600 text-white font-semibold px-6 py-3 rounded-xl shadow-theme-sm transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Course
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-white border border-ink-100/70 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ink-100/70 shadow-theme-sm">
          <GraduationCap className="w-12 h-12 mb-4 mx-auto text-ink-200" />
          <h3 className="text-lg font-bold text-ink-900">No courses listed</h3>
          <p className="text-ink-500 mt-1 mb-4">Your university doesn&apos;t have any courses listed yet.</p>
          <button
            onClick={handleOpenCreateModal}
            className="bg-coral-500 hover:bg-coral-600 text-white font-semibold px-6 py-3 rounded-xl shadow-theme-sm transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${levelBadge(course.level)}`}>
                  {course.level}
                </span>
                <p className="text-primary-600 font-bold text-sm">{course.currency} {course.tuitionFee?.toLocaleString()}</p>
              </div>
              <h3 className="font-bold text-ink-900 group-hover:text-primary-600 transition-colors mb-2 line-clamp-1">{course.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Calendar className="w-4 h-4" />
                  <span>{(course.intake || []).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <GraduationCap className="w-4 h-4" />
                  <span>IELTS: {course.ieltsRequirement}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEditModal(course)}
                  className="flex-1 border border-ink-300 text-ink-700 hover:border-primary-400 hover:text-primary-600 font-semibold px-3 py-2 rounded-xl transition-all text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(course)}
                  className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold px-3 py-2 rounded-xl transition-all text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Add/Edit Course Modal */}
    {isModalOpen && (
      <div
        className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
        onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
      >
        <div ref={modalRef} className="bg-white rounded-2xl border border-ink-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-theme-lg">
          <div className="p-6 border-b border-ink-100 flex justify-between items-center">
            <h3 id="course-modal-title" className="text-xl font-bold text-ink-900">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h3>
            <button onClick={() => setIsModalOpen(false)} aria-label="Close" className="w-8 h-8 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-500 hover:text-ink-700 flex items-center justify-center transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="course-name" className="block text-sm font-semibold text-ink-700 mb-2">Course Name *</label>
              <input
                id="course-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all"
                placeholder="e.g., Bachelor of Computer Science"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="course-level" className="block text-sm font-semibold text-ink-700 mb-2">Level *</label>
                <select
                  id="course-level"
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all"
                >
                  <option value="">Select level</option>
                  <option value="Foundation (pathway)">Foundation (pathway)</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label htmlFor="course-duration" className="block text-sm font-semibold text-ink-700 mb-2">Duration *</label>
                <input
                  id="course-duration"
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all"
                  placeholder="e.g., 4 Years"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="course-tuition" className="block text-sm font-semibold text-ink-700 mb-2">Tuition Fee *</label>
                <input
                  id="course-tuition"
                  type="number"
                  required
                  value={formData.tuitionFee}
                  onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all"
                  placeholder="e.g., 25000"
                />
              </div>
              <div>
                <label htmlFor="course-currency" className="block text-sm font-semibold text-ink-700 mb-2">Currency *</label>
                <select
                  id="course-currency"
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all"
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="course-ielts" className="block text-sm font-semibold text-ink-700 mb-2">IELTS Requirement</label>
                <input
                  id="course-ielts"
                  type="number"
                  step="0.5"
                  value={formData.ieltsRequirement}
                  onChange={(e) => setFormData({ ...formData, ieltsRequirement: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all"
                  placeholder="e.g., 6.5"
                />
              </div>
              <div>
                <label htmlFor="course-intakes" className="block text-sm font-semibold text-ink-700 mb-2">Intakes (comma separated)</label>
                <input
                  id="course-intakes"
                  type="text"
                  value={(formData.intake || []).join(', ')}
                  onChange={(e) => setFormData({ ...formData, intake: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all"
                  placeholder="e.g., September, January"
                />
              </div>
            </div>
            <div>
              <label htmlFor="course-description" className="block text-sm font-semibold text-ink-700 mb-2">Description</label>
              <textarea
                id="course-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all min-h-[100px]"
                placeholder="Brief description of the course..."
              ></textarea>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border border-ink-300 text-ink-700 hover:border-primary-400 hover:text-primary-600 font-semibold px-6 py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-6 py-3 rounded-xl shadow-theme-sm transition-all"
              >
                {editingCourse ? 'Update Course' : 'Create Course'}
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
      message={`"${deleteTarget?.name}" will be permanently removed from your course listings. This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
};

export default UniversityCoursesPage;
