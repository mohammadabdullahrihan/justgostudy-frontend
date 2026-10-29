import { useState, useEffect, useCallback, useMemo } from 'react';
import { Flame, Languages, Search, ChevronLeft, ChevronRight, Pencil, RotateCcw, X } from 'lucide-react';
import userService from '../../services/userService';
import ConfirmModal from '../../components/common/ConfirmModal';

const PAGE_SIZE = 10;

const totalLessonsCompleted = (member) =>
  (member.languageProgress || []).reduce((sum, p) => sum + (p.completedLessonIds?.length || 0), 0);

const EditMemberModal = ({ member, onClose, onSave, saving }) => {
  const [points, setPoints] = useState(member.points || 0);
  const [streak, setStreak] = useState(member.streak || 0);
  const [badges, setBadges] = useState((member.badges || []).join(', '));

  if (!member) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(member._id, {
      points: Number(points) || 0,
      streak: Number(streak) || 0,
      badges: badges.split(',').map((b) => b.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-ink-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink-900">Edit {member.name}</h3>
          <button type="button" onClick={onClose} className="text-ink-500 hover:text-ink-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Points</span>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm bg-white border border-ink-200 rounded-xl outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Streak (days)</span>
            <input
              type="number"
              value={streak}
              onChange={(e) => setStreak(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm bg-white border border-ink-200 rounded-xl outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Badges (comma-separated)</span>
            <input
              type="text"
              value={badges}
              onChange={(e) => setBadges(e.target.value)}
              placeholder="first-lesson, streak-7"
              className="mt-1 w-full px-3 py-2 text-sm bg-white border border-ink-200 rounded-xl outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10"
            />
          </label>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-ink-600 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-coral-500 hover:bg-coral-600 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

const LanguageClubMembers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editTarget, setEditTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getUsers({ limit: 10000 });
      const list = Array.isArray(res) ? res : (res?.users || []);
      setUsers(list);
    } catch (err) {
      setError(err.message || 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const members = useMemo(
    () => users.filter((u) => u.role === 'student' && ((u.points || 0) > 0 || (u.languageProgress || []).length > 0)),
    [users]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((u) => [u.name, u.email].filter(Boolean).join(' ').toLowerCase().includes(q));
  }, [members, search]);

  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSaveEdit = async (userId, data) => {
    setActionLoading(userId + '_edit');
    try {
      await userService.updateUser(userId, data);
      await fetchUsers();
      setEditTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to update member.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetConfirm = async () => {
    if (!resetTarget) return;
    const userId = resetTarget._id;
    setActionLoading(userId + '_reset');
    try {
      await userService.updateUser(userId, { points: 0, level: 1, streak: 0, badges: [], languageProgress: [] });
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to reset member.');
    } finally {
      setActionLoading(null);
      setResetTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-bold text-ink-900 text-lg">Language Club Members</h2>
        <button onClick={fetchUsers} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
          <RotateCcw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-ink-200 rounded-xl text-ink-900 placeholder-ink-400 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all"
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-ink-500">
          <Languages className="w-8 h-8 mb-3 mx-auto text-ink-500" />
          <p>{members.length === 0 ? 'No students have joined Language Club yet.' : 'No members match your search.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-ink-200">
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Student</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Points</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Level</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Streak</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Badges</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Languages</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Lessons Done</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {paginated.map((member) => (
                <tr key={member._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="text-ink-900 font-semibold">{member.name}</p>
                    <p className="text-ink-500 text-sm">{member.email}</p>
                  </td>
                  <td className="py-3 pr-4 font-bold text-primary-600">{member.points || 0}</td>
                  <td className="py-3 pr-4">{member.level || 1}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1 text-coral-600 font-semibold">
                      <Flame className="w-3.5 h-3.5 fill-coral-500" />
                      {member.streak || 0}d
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-ink-700">{(member.badges || []).length}</td>
                  <td className="py-3 pr-4 text-ink-700">{(member.languageProgress || []).length}</td>
                  <td className="py-3 pr-4 text-ink-700">{totalLessonsCompleted(member)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditTarget(member)}
                        className="text-sm px-3 py-1 bg-primary-50 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-100 transition-all font-semibold flex items-center gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setResetTarget(member)}
                        disabled={actionLoading === member._id + '_reset'}
                        className="text-sm px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all font-semibold disabled:opacity-40 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        {actionLoading === member._id + '_reset' ? '...' : 'Reset'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-100">
              <p className="text-xs text-ink-500">Page {page} of {totalPages} &middot; {filtered.length} members</p>
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

      {editTarget && (
        <EditMemberModal
          member={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
          saving={actionLoading === editTarget._id + '_edit'}
        />
      )}

      <ConfirmModal
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        onConfirm={handleResetConfirm}
        title="Reset this member's progress?"
        message={`This clears ${resetTarget?.name}'s points, streak, badges, and lesson history. This cannot be undone.`}
        confirmText="Reset"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default LanguageClubMembers;
