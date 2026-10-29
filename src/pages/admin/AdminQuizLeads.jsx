import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, RotateCcw, Trash2, Download, MapPin, ClipboardList } from 'lucide-react';
import * as quizService from '../../services/quizService';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/dashboard/EmptyState';
import { useAdminList } from '../../hooks/useAdminList';

const QuizLeadsManagement = () => {
  const { data: results, loading, error, refetch: fetchResults } = useAdminList(async () => {
    const data = await quizService.getQuizResults();
    return Array.isArray(data) ? data : [];
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await quizService.deleteQuizResult(deleteTarget);
      toast.success('Quiz lead deleted');
      fetchResults();
    } catch (error) {
      toast.error(error.message || 'Error deleting quiz lead');
    } finally {
      setDeleteTarget(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Budget', 'Field', 'Region', 'IELTS', 'Recommended', 'Date'];
    const rows = results.map((r) => [
      r.name, r.email, r.phone, r.answers?.budget, r.answers?.field, r.answers?.region, r.answers?.ieltsBand,
      r.recommendedCountry, new Date(r.createdAt).toLocaleDateString(),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'quiz-leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">&ldquo;Which Country Fits You?&rdquo; Leads</h2>
          <p className="text-ink-500 text-sm">Everyone who completed the study-finder quiz.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchResults} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="px-5 py-2.5 bg-white border border-ink-300 text-ink-700 font-bold rounded-xl flex items-center gap-2 hover:border-primary-400 hover:text-primary-600 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm mb-4">{error}</div>
      )}

      <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-ink-50/50">
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Recommended</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 text-primary-600 animate-spin mx-auto" /></td></tr>
              ) : !error && results.length === 0 ? (
                <tr><td colSpan="5">
                  <EmptyState icon={ClipboardList} iconClassName="text-ink-200" message="No quiz leads yet — this fills in as visitors complete the country-match quiz." />
                </td></tr>
              ) : results.map((r) => (
                <tr key={r._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="px-6 py-5 font-bold text-ink-900">{r.name || '—'}</td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-ink-700">{r.email}</p>
                    <p className="text-sm text-ink-500">{r.phone}</p>
                  </td>
                  <td className="px-6 py-5">
                    {r.recommendedCountry && (
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-600">
                        <MapPin className="w-3.5 h-3.5" /> {r.recommendedCountry}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm text-ink-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => setDeleteTarget(r._id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-ink-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete this quiz lead?"
        message="This will permanently delete this captured lead. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const AdminQuizLeads = () => (
  <QuizLeadsManagement />
);

export default AdminQuizLeads;
