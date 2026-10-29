import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, RotateCcw, AlertCircle } from 'lucide-react';
import applicationService from '../../services/applicationService';
import StudentApplicationDetailModal from './StudentApplicationDetailModal';
import { StatusBadge } from '../../components/dashboard/home/shared';

const StudentApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const applicationsRes = await applicationService.getMyApplications();
      const apps = applicationsRes.data || applicationsRes || [];
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <>
    <div className="bg-white rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-ink-900">My Applications</h2>
          <p className="text-sm text-ink-500 mt-0.5">{applications.length} total</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchApplications} className="text-sm text-coral-500 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => navigate('/student/apply')}
            className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-theme-sm hover:shadow-theme-md active:scale-[0.97]"
          >
            <Plus size={14} /> New Application
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm mb-4">{error}</div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="h-14 bg-cream-50 rounded-xl animate-pulse"></div>)}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={36} className="mx-auto mb-3 text-ink-200" />
          <p className="text-ink-500 mb-3">No applications yet.</p>
          <button onClick={() => navigate('/student/apply')} className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-theme-sm hover:shadow-theme-md active:scale-[0.97]">Start your first application</button>
        </div>
      ) : (
        <div className="divide-y divide-cream-100">
          {applications.map((app, idx) => (
            <button
              key={app._id}
              type="button"
              onClick={() => setSelectedApp(app)}
              className={`w-full flex items-center justify-between py-4 hover:bg-primary-50/40 px-2 rounded-xl transition-colors text-left ${idx % 2 === 1 ? 'bg-cream-50/60' : ''}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-900">{app.courseId?.name || 'Application'}</p>
                <p className="text-sm text-ink-500 mt-0.5">{app.universityId?.name || '—'} · {new Date(app.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {app.status === 'rejected' && (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
                <StatusBadge status={app.status} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>

    {selectedApp && (
      <StudentApplicationDetailModal application={selectedApp} onClose={() => setSelectedApp(null)} />
    )}
    </>
  );
};

export default StudentApplicationsPage;
