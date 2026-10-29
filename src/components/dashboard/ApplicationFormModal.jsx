import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import { MODAL_SPRING_TRANSITION } from '../../utils/motionPresets';
import userService from '../../services/userService';
import courseService from '../../services/courseService';
import { getUniversities } from '../../services/universityService';

const ApplicationFormModal = ({ isOpen, onClose, onSubmit, mode = 'create', initialData, submitting, error }) => {
  const [studentId, setStudentId] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [courseId, setCourseId] = useState('');

  const [students, setStudents] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Load student/university dropdown options once per open, and prefill
  // fields from initialData when editing.
  useEffect(() => {
    if (!isOpen) return;

    setStudentId(initialData?.studentId?._id || '');
    setUniversityId(initialData?.universityId?._id || '');
    setCourseId(initialData?.courseId?._id || '');

    let cancelled = false;
    setLoadingLists(true);
    Promise.all([
      userService.getUsers({ role: 'student', limit: 10000 }),
      getUniversities(),
    ])
      .then(([studentRes, uniRes]) => {
        if (cancelled) return;
        setStudents(Array.isArray(studentRes) ? studentRes : (studentRes?.users || []));
        setUniversities(Array.isArray(uniRes) ? uniRes : (uniRes?.universities || uniRes?.data || []));
      })
      .catch(() => {
        if (!cancelled) {
          setStudents([]);
          setUniversities([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLists(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, initialData]);

  // Refetch the course list whenever the chosen university changes.
  useEffect(() => {
    if (!isOpen || !universityId) {
      setCourses([]);
      return;
    }
    let cancelled = false;
    setCoursesLoading(true);
    courseService.getCourses({ universityId, limit: 500 })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res?.courses || []);
        setCourses(list);
        // Drop a previously-selected course that doesn't belong to the newly chosen university.
        setCourseId((prev) => (list.some((c) => c._id === prev) ? prev : ''));
      })
      .catch(() => { if (!cancelled) setCourses([]); })
      .finally(() => { if (!cancelled) setCoursesLoading(false); });

    return () => { cancelled = true; };
  }, [isOpen, universityId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, submitting]);

  const isEdit = mode === 'edit';
  const canSubmit = universityId && courseId && (isEdit || studentId) && !submitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const payload = { universityId, courseId };
    if (!isEdit) payload.studentId = studentId;
    onSubmit(payload);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="application-form-title">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && onClose()}
            className="absolute inset-0 bg-slate-900/50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={MODAL_SPRING_TRANSITION}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-ink-200"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-start justify-between p-6 pb-0">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center">
                  <FileText size={22} />
                </div>
                <button
                  type="button"
                  onClick={() => !submitting && onClose()}
                  className="w-8 h-8 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-500 hover:text-ink-700 flex items-center justify-center transition-all"
                  aria-label="Cancel"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 pt-4 space-y-4">
                <h3 id="application-form-title" className="text-lg font-bold text-ink-900">
                  {isEdit ? 'Edit application' : 'New application'}
                </h3>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{error}</div>
                )}

                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Student</label>
                  {isEdit ? (
                    <p className="text-sm text-ink-700 bg-cream-100 border border-ink-200 rounded-xl px-3.5 py-2.5">
                      {initialData?.studentId?.name || '—'} <span className="text-ink-500">({initialData?.studentId?.email || '—'})</span>
                    </p>
                  ) : (
                    <select
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={loadingLists}
                      className="w-full text-sm border border-ink-200 rounded-xl px-3.5 py-2.5 text-ink-900 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:opacity-50"
                    >
                      <option value="">{loadingLists ? 'Loading…' : 'Select a student'}</option>
                      {students.map((s) => (
                        <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">University</label>
                  <select
                    required
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    disabled={loadingLists}
                    className="w-full text-sm border border-ink-200 rounded-xl px-3.5 py-2.5 text-ink-900 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:opacity-50"
                  >
                    <option value="">{loadingLists ? 'Loading…' : 'Select a university'}</option>
                    {universities.map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Course</label>
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    disabled={!universityId || coursesLoading}
                    className="w-full text-sm border border-ink-200 rounded-xl px-3.5 py-2.5 text-ink-900 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:opacity-50"
                  >
                    <option value="">
                      {!universityId ? 'Select a university first' : coursesLoading ? 'Loading…' : 'Select a course'}
                    </option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.level})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 p-6">
                <button
                  type="button"
                  onClick={() => !submitting && onClose()}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-ink-500 hover:bg-cream-100 transition-all duration-200 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bg-coral-500 hover:bg-coral-600 text-white shadow-theme-md shadow-coral-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save changes' : 'Create application'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationFormModal;
