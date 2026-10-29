import { useState, useEffect, useCallback } from 'react';
import { Users, User, RotateCcw, Trash2, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import userService from '../../services/userService';
import agentService from '../../services/agentService';
import studentService from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import UserProfileDetailModal from './UserProfileDetailModal';

const ROLES = [
  { value: 'all', label: 'All' },
  { value: 'student', label: 'Student' },
  { value: 'agent', label: 'Agent' },
  { value: 'university', label: 'University/College' },
  { value: 'admin', label: 'Admin' },
];
// Educator was dropped as a public-facing role (see Join Us / Register pages)
// and developer is a privileged super_admin alias granted outside this UI,
// not a role to hand out from a dropdown — so neither is offered here.
const EDITABLE_ROLES = ['student', 'agent', 'university', 'admin', 'super_admin'];
const PAGE_SIZE = 10;

// Turns raw role enum values (e.g. "super_admin") into friendly, title-cased
// labels (e.g. "Super Admin") wherever a role is displayed. 'university'
// gets the same "University/College" wording used on Register/Join Us.
const roleLabel = (role) => {
  if (!role) return '';
  if (role === 'university') return 'University/College';
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Friendlier phrasing for the agent approval status badge.
const AGENT_STATUS_LABELS = {
  pending: 'Awaiting Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [agents, setAgents] = useState([]);
  const [agentProfiles, setAgentProfiles] = useState({});
  const [studentProfiles, setStudentProfiles] = useState({});
  const [detailView, setDetailView] = useState(null); // { type: 'student' | 'agent', profile }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Debounce the search box into `search`, and reset back to page 1 whenever
  // it (or the role tab) changes — matches the CourseManagement convention.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [roleFilter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getUsers({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      const list = Array.isArray(res) ? res : (res?.users || []);
      setUsers(list);
      setTotal(res?.total ?? list.length);
      setTotalPages(res?.pages ?? Math.max(Math.ceil((res?.total ?? list.length) / PAGE_SIZE), 1));
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Approval status per agent, from a single batch call instead of one
  // request per agent. Always unpaginated — this powers the "Assign Agent"
  // dropdown and per-row status badges, independent of which page of the
  // main user list is currently showing.
  const fetchAgentProfiles = useCallback(async () => {
    try {
      const agentProfileList = await agentService.getAllAgents();
      const list = Array.isArray(agentProfileList) ? agentProfileList : [];
      setAgents(list.map((profile) => profile.user).filter(Boolean));
      const profileMap = {};
      list.forEach((profile) => {
        if (profile.user?._id) profileMap[profile.user._id] = profile;
      });
      setAgentProfiles(profileMap);
    } catch {
      setAgents([]);
      setAgentProfiles({});
    }
  }, []);

  useEffect(() => { fetchAgentProfiles(); }, [fetchAgentProfiles]);

  // Full student profiles (for the "View" detail modal), same batch-call
  // pattern as agent profiles above.
  const fetchStudentProfiles = useCallback(async () => {
    try {
      const list = await studentService.getAllStudents();
      const profileMap = {};
      (Array.isArray(list) ? list : []).forEach((profile) => {
        if (profile.user?._id) profileMap[profile.user._id] = profile;
      });
      setStudentProfiles(profileMap);
    } catch {
      setStudentProfiles({});
    }
  }, []);

  useEffect(() => { fetchStudentProfiles(); }, [fetchStudentProfiles]);

  const handleApproveAgent = async (userId) => {
    setActionLoading(userId + '_approve');
    try {
      await userService.updateUser(userId, { agentStatus: 'approved' });
      await Promise.all([fetchUsers(), fetchAgentProfiles()]);
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAgent = async (userId) => {
    setActionLoading(userId + '_reject');
    try {
      await userService.updateUser(userId, { agentStatus: 'rejected' });
      await Promise.all([fetchUsers(), fetchAgentProfiles()]);
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setActionLoading(userId + '_role');
    try {
      await userService.updateUser(userId, { role });
      await Promise.all([fetchUsers(), fetchAgentProfiles()]);
    } catch (err) {
      setError(err.message || 'Failed to update role.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const userId = deleteTarget._id;
    setActionLoading(userId + '_delete');
    try {
      await userService.deleteUser(userId);
      await Promise.all([fetchUsers(), fetchAgentProfiles()]);
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const handleAssignAgent = async (studentId, agentId) => {
    setActionLoading(studentId + '_assign');
    try {
      await studentService.assignAgent(studentId, agentId);
      await Promise.all([fetchUsers(), fetchStudentProfiles()]);
    } catch (err) {
      setError(err.message || 'Failed to assign agent.');
    } finally {
      setActionLoading(null);
    }
  };

  // Role filtering is now server-side (see fetchUsers), so `users` already
  // reflects the active role tab — no client-side subset needed.
  const filtered = users;

  const roleBadge = (role) => {
    const map = {
      student: 'bg-primary-50 text-primary-600 border-primary-200',
      agent: 'bg-accent-50 text-accent-600 border-accent-200',
      university: 'bg-secondary-50 text-secondary-600 border-secondary-200',
      admin: 'bg-rose-50 text-rose-600 border-rose-200',
      super_admin: 'bg-accent-50 text-accent-600 border-accent-200',
      developer: 'bg-accent-50 text-accent-600 border-accent-200',
    };
    return map[role] || 'bg-ink-100 text-ink-600 border-ink-200';
  };

  const getAgentStatus = (userId) => {
    return agentProfiles[userId]?.status || 'pending';
  };

  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-theme-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-bold text-ink-900 text-lg">User Management</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={fetchUsers} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={`text-sm px-3 py-1.5 rounded-lg font-semibold transition-all border ${roleFilter === r.value
                ? 'bg-primary-100 text-primary-600 border-primary-200'
                : 'bg-ink-100 text-ink-600 border-transparent hover:bg-ink-200'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
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
          <Users className="w-8 h-8 mb-3 mx-auto text-ink-500" />
          <p>
            {search
              ? `No users match "${search}".`
              : roleFilter !== 'all'
                ? `No ${roleLabel(roleFilter)} users found.`
                : 'No users found.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-ink-200">
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">User</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Role</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3 pr-4">Verification</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {filtered.map((user) => {
                // A developer account can only be role-changed or deleted by
                // another developer — a plain super_admin can view it but
                // not touch it, so developer accounts can't be demoted or
                // removed out from under that protection.
                const isTargetDeveloper = user.role === 'developer';
                const currentIsAdminTier = currentUser?.role === 'super_admin' || currentUser?.role === 'developer';
                const canManageThisUser = currentIsAdminTier && user._id !== currentUser._id
                  && !(isTargetDeveloper && currentUser?.role !== 'developer');

                return (
                <tr key={user._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-ink-100 border border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3 h-3 text-ink-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-ink-900 font-semibold">{user.name}</p>
                        <p className="text-ink-500 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {canManageThisUser ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        disabled={actionLoading === user._id + '_role'}
                        className={`text-sm px-2 py-1 rounded-lg border font-semibold capitalize cursor-pointer focus:outline-none ${roleBadge(user.role)}`}
                      >
                        {EDITABLE_ROLES.map((r) => (
                          <option key={r} value={r} className="bg-white text-ink-900">{roleLabel(r)}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`text-sm px-2 py-0.5 rounded-full border font-semibold ${roleBadge(user.role)}`}>
                        {roleLabel(user.role)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {user.role === 'agent' ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getAgentStatus(user._id) === 'approved'
                        ? 'bg-secondary-50 text-secondary-600 border-secondary-200'
                        : getAgentStatus(user._id) === 'rejected'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-accent-50 text-accent-600 border-accent-200'
                        }`}>
                        {AGENT_STATUS_LABELS[getAgentStatus(user._id)] || AGENT_STATUS_LABELS.pending}
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${user.isVerified
                        ? 'bg-secondary-50 text-secondary-600 border-secondary-200'
                        : 'bg-ink-100 text-ink-600 border-ink-200'
                        }`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {user.role === 'agent' && getAgentStatus(user._id) !== 'approved' && (
                        <button
                          onClick={() => handleApproveAgent(user._id)}
                          disabled={actionLoading === user._id + '_approve'}
                          className="text-sm px-3 py-1 bg-secondary-50 text-secondary-600 border border-secondary-200 rounded-lg hover:bg-secondary-100 transition-all font-semibold disabled:opacity-40"
                        >
                          {actionLoading === user._id + '_approve' ? '...' : 'Approve'}
                        </button>
                      )}
                      {user.role === 'agent' && getAgentStatus(user._id) === 'approved' && (
                        <button
                          onClick={() => handleRejectAgent(user._id)}
                          disabled={actionLoading === user._id + '_reject'}
                          className="text-sm px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all font-semibold disabled:opacity-40"
                        >
                          {actionLoading === user._id + '_reject' ? '...' : 'Revoke'}
                        </button>
                      )}
                      {(user.role === 'student' || user.role === 'agent') && (
                        <button
                          onClick={() => setDetailView({
                            type: user.role,
                            profile: user.role === 'agent' ? agentProfiles[user._id] : studentProfiles[user._id],
                          })}
                          disabled={user.role === 'agent' ? !agentProfiles[user._id] : !studentProfiles[user._id]}
                          className="text-sm px-3 py-1 bg-primary-50 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-100 transition-all font-semibold disabled:opacity-40 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      )}
                      {user.role === 'student' && agents.length > 0 && (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) handleAssignAgent(user._id, e.target.value);
                          }}
                          disabled={actionLoading === user._id + '_assign'}
                          className="text-sm bg-white border border-ink-200 rounded-lg text-ink-700 py-1 px-2 focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="">Assign Agent</option>
                          {agents.map((a) => (
                            <option key={a._id} value={a._id}>{a.name}</option>
                          ))}
                        </select>
                      )}
                      {canManageThisUser && (
                        <button
                          onClick={() => setDeleteTarget(user)}
                          disabled={actionLoading === user._id + '_delete'}
                          className="text-sm px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all font-semibold disabled:opacity-40 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {actionLoading === user._id + '_delete' ? '...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && total > 0 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-100">
              <p className="text-xs text-ink-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} users &middot; Page {page} of {totalPages}
              </p>
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

      {detailView && (
        <UserProfileDetailModal
          type={detailView.type}
          profile={detailView.profile}
          onClose={() => setDetailView(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete this user?"
        message={`Permanently delete ${deleteTarget?.name}? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default UserManagement;
