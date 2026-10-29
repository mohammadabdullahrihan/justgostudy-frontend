import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import applicationService from '../../services/applicationService';
import agentService from '../../services/agentService';
import Button from '../../components/common/Button';
import ApplicationDetail from './ApplicationDetail';
import { Clock, Users, FolderOpen, RotateCcw, Search, XCircle } from 'lucide-react';
import { StatusBadge } from '../../components/dashboard/home/shared';

const AgentApplicationsPage = () => {
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [agentProfile, setAgentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchApplications = async () => {
    try {
      setError('');
      const applicationsRes = await applicationService.getAgentApplications();
      const list = applicationsRes.data || applicationsRes || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((app) => {
      const haystack = [app.studentId?.name, app.studentId?.email, app.courseId?.name, app.universityId?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [applications, search]);

  useEffect(() => {
    const init = async () => {
      setProfileLoading(true);
      try {
        const profile = await agentService.getMyProfile();
        setAgentProfile(profile);
      } catch (err) { console.error('Failed to load agent profile', err); }
      finally { setProfileLoading(false); }
      fetchApplications();
    };
    init();
  }, []);

  const handleUpdated = (updated) => {
    setApplications((prev) => prev.map((a) => a._id === updated._id ? updated : a));
    setSelectedApp(updated);
  };

  if (profileLoading) {
    return null;
  }

  if (agentProfile?.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent-50 border border-accent-200 flex items-center justify-center mb-4">
          <Clock className="text-accent-500" size={24} />
        </div>
        <h3 className="text-xl font-bold text-ink-900 mb-2">Approval Pending</h3>
        <p className="text-sm text-ink-500 max-w-sm mb-4">Your agent account is awaiting admin approval.</p>
        <Button onClick={logout} variant="secondary" className="text-sm py-2 px-4">Sign Out</Button>
      </div>
    );
  }

  if (agentProfile?.status === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <XCircle className="text-rose-500" size={24} />
        </div>
        <h3 className="text-xl font-bold text-ink-900 mb-2">Application Not Approved</h3>
        <p className="text-sm text-ink-500 max-w-sm mb-4">Your agent application was not approved. Please contact support if you believe this is a mistake.</p>
        <Button onClick={logout} variant="secondary" className="text-sm py-2 px-4">Sign Out</Button>
      </div>
    );
  }

  return (
    <>
    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white border border-ink-100/70 rounded-2xl p-4 text-center shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200">
        <span className="block text-2xl font-bold text-ink-900 mb-1">{applications.length}</span>
        <span className="text-xs uppercase tracking-wider text-ink-500 font-bold">Total</span>
      </div>
      <div className="bg-white border border-ink-100/70 rounded-2xl p-4 text-center shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200">
        <span className="block text-2xl font-bold text-ink-900 mb-1">{applications.filter((a) => a.status === 'pending').length}</span>
        <span className="text-xs uppercase tracking-wider text-ink-500 font-bold">Pending</span>
      </div>
      <div className="bg-white border border-ink-100/70 rounded-2xl p-4 text-center shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200">
        <span className="block text-2xl font-bold text-ink-900 mb-1">{applications.filter((a) => a.status === 'under_review').length}</span>
        <span className="text-xs uppercase tracking-wider text-ink-500 font-bold">In Review</span>
      </div>
    </div>

    {/* Table */}
    <div className="bg-white rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 overflow-hidden">
      <div className="p-5 border-b border-ink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-ink-900 text-sm uppercase tracking-wider shrink-0">
          <Users className="mr-2 text-coral-500" size={16} />
          Assigned Student Applications
        </h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or course…"
              className="pl-8 pr-3 py-1.5 text-sm bg-cream-50 border border-ink-200 rounded-lg text-ink-900 placeholder-ink-400 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all w-full sm:w-48"
            />
          </div>
          <button onClick={fetchApplications} className="text-sm text-coral-500 font-semibold hover:underline flex items-center gap-1 shrink-0">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="p-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-cream-50 rounded-xl border border-ink-100 animate-pulse"></div>
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-12 text-center">
          <FolderOpen className="text-ink-200 mb-3 block" size={32} />
          <p className="text-sm text-ink-500">
            {applications.length === 0
              ? 'No applications assigned yet. Students you are assigned to will appear here once they apply.'
              : 'No applications match your search.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-ink-100">
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold p-4 pr-4">Student</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold p-4 pr-4">Course</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold p-4 pr-4">Status</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-500 font-bold p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filteredApplications.map((app) => (
                <tr key={app._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="p-4 pr-4">
                    <p className="text-ink-900 font-semibold">{app.studentId?.name || 'Unknown'}</p>
                    <p className="text-ink-500 text-sm mt-0.5">{app.studentId?.email || '—'}</p>
                  </td>
                  <td className="p-4 pr-4">
                    <p className="text-ink-700 text-sm">{app.courseId?.name || '—'}</p>
                    <p className="text-ink-500 text-sm mt-0.5">{app.universityId?.name || '—'}</p>
                  </td>
                  <td className="p-4 pr-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-xs px-3 py-1.5 bg-coral-50 text-coral-600 border border-coral-200 rounded-xl hover:bg-coral-100 transition-all font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {selectedApp && (
      <ApplicationDetail
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onUpdated={handleUpdated}
      />
    )}
    </>
  );
};

export default AgentApplicationsPage;
