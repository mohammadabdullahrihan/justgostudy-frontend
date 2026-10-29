import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../../services/favoriteService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { AlertTriangle, GraduationCap, Search, Star, Trash2 } from 'lucide-react';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);

  const loadFavorites = useCallback(() => {
    setLoading(true);
    setError('');
    return getFavorites()
      .then((favoritesRes) => {
        const list = favoritesRes.data?.favorites || favoritesRes.data || favoritesRes || [];
        setFavorites(Array.isArray(list) ? list : []);
      })
      .catch((err) => setError(err.message || 'Failed to load favorites.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    const courseId = removeTarget.courseId;
    setRemoving(courseId);
    try {
      await removeFavorite(courseId);
      setFavorites((prev) => prev.filter((f) => (f.courseId?._id || f.courseId || f._id) !== courseId));
    } catch (err) {
      setError(err.message || 'Failed to remove favorite.');
    } finally {
      setRemoving(null);
      setRemoveTarget(null);
    }
  };

  return (
    <>
    <div className="max-w-4xl">

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={loadFavorites} className="font-bold underline shrink-0">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-ink-100/70 shadow-theme-sm animate-pulse h-16"></div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-ink-100/70 shadow-theme-md text-center max-w-lg mx-auto my-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
          <div className="w-20 h-20 rounded-2xl bg-white border border-ink-100 flex items-center justify-center mx-auto mb-6 shadow-theme-lg relative group-hover:border-accent-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-accent-500/10 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <Star className="text-accent-600 relative z-10" size={32} />
          </div>
          <h3 className="text-xl font-bold text-ink-900 mb-2 font-display">No Favorites Saved</h3>
          <p className="text-sm text-ink-600 max-w-sm mx-auto mb-6 leading-relaxed">
            You haven&apos;t saved any courses to your favorites yet. Explore our extensive list of programs and save them to plan your future studies.
          </p>
          <Link
            to="/study-abroad/courses"
            className="inline-flex items-center gap-2 text-sm font-bold py-2.5 px-5 bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 hover:border-primary-300 rounded-xl transition-all shadow-theme-sm"
          >
            <Search /> Browse All Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => {
            const course = fav.courseId || fav.course || fav;
            const courseId = course?._id || fav.courseId;
            return (
              <div key={fav._id || courseId} className="bg-white p-5 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center shrink-0">
                    <GraduationCap className="text-primary-600" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900 text-sm truncate">{course?.name || 'Saved Course'}</p>
                    <p className="text-sm text-ink-500 mt-0.5">
                      {course?.universityId?.name || course?.university || '—'}
                      {course?.level && <span className="ml-2 px-1.5 py-0.5 bg-cream-100 rounded text-xs text-ink-600">{course.level}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {courseId && (
                    <Link
                      to={`/student/apply?courseId=${courseId}&universityId=${course?.universityId?._id || ''}`}
                      className="text-sm px-3 py-1.5 bg-primary-50 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-100 transition-all font-semibold"
                    >
                      Apply
                    </Link>
                  )}
                  <button
                    onClick={() => setRemoveTarget({ courseId, name: course?.name || 'this course' })}
                    disabled={removing === courseId}
                    className="text-sm px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all font-semibold disabled:opacity-40"
                  >
                    {removing === courseId ? 'Removing...' : <><Trash2 className="mr-1" />Remove</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    <ConfirmModal
      isOpen={!!removeTarget}
      onClose={() => setRemoveTarget(null)}
      onConfirm={handleRemoveConfirm}
      title="Remove from favorites?"
      message={`"${removeTarget?.name}" will be removed from your saved courses.`}
      confirmText="Remove"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
};

export default Favorites;
