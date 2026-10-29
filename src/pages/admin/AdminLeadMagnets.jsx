import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Loader2, RotateCcw, FileDown, Download, Upload, Inbox } from 'lucide-react';
import * as leadMagnetService from '../../services/leadMagnetService';
import uploadService from '../../services/uploadService';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/dashboard/EmptyState';

const emptyForm = { title: '', description: '', fileUrl: '', coverImage: '', category: 'guide', isActive: true };

const LeadMagnetManagement = () => {
  const [tab, setTab] = useState('magnets');

  const [magnets, setMagnets] = useState([]);
  const [loadingMagnets, setLoadingMagnets] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [downloads, setDownloads] = useState([]);
  const [loadingDownloads, setLoadingDownloads] = useState(true);
  const [deleteDownloadTarget, setDeleteDownloadTarget] = useState(null);

  useEffect(() => {
    fetchMagnets();
    fetchDownloads();
  }, []);

  const fetchMagnets = async () => {
    try {
      const data = await leadMagnetService.getLeadMagnets();
      setMagnets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching lead magnets:', error);
      setMagnets([]);
    } finally {
      setLoadingMagnets(false);
    }
  };

  const fetchDownloads = async () => {
    try {
      const data = await leadMagnetService.getLeadDownloads();
      setDownloads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching lead downloads:', error);
      setDownloads([]);
    } finally {
      setLoadingDownloads(false);
    }
  };

  const handleOpenModal = (magnet = null) => {
    if (magnet) {
      setEditTarget(magnet);
      setForm({ ...magnet });
    } else {
      setEditTarget(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const uploadRes = await uploadService.uploadFile(file);
      setForm(prev => ({ ...prev, fileUrl: uploadRes.url || uploadRes.data?.url }));
      toast.success('File uploaded');
    } catch (error) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await leadMagnetService.updateLeadMagnet(editTarget._id, form);
      } else {
        await leadMagnetService.createLeadMagnet(form);
      }
      setShowModal(false);
      fetchMagnets();
    } catch (error) {
      toast.error(error.message || 'Error saving lead magnet');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await leadMagnetService.deleteLeadMagnet(deleteTarget);
      toast.success('Lead magnet deleted');
      fetchMagnets();
    } catch (error) {
      toast.error(error.message || 'Error deleting lead magnet');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDeleteDownloadConfirm = async () => {
    if (!deleteDownloadTarget) return;
    try {
      await leadMagnetService.deleteLeadDownload(deleteDownloadTarget);
      toast.success('Lead entry removed');
      fetchDownloads();
    } catch (error) {
      toast.error(error.message || 'Error deleting lead entry');
    } finally {
      setDeleteDownloadTarget(null);
    }
  };

  const exportLeadsToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Guide', 'Date'];
    const rows = downloads.map(d => [d.name, d.email, d.phone, d.leadMagnet?.title || '', new Date(d.createdAt).toLocaleDateString()]);
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'lead-magnet-downloads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Lead Magnets</h2>
          <p className="text-ink-500 text-sm">Downloadable guides that capture emails, and the leads they collect.</p>
        </div>
        <div className="flex items-center gap-3">
          {tab === 'magnets' ? (
            <>
              <button onClick={fetchMagnets} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Refresh
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="bg-coral-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-coral-600 transition-all shadow-theme-md"
              >
                <Plus className="w-5 h-5" /> Add Guide
              </button>
            </>
          ) : (
            <button
              onClick={exportLeadsToCSV}
              className="px-5 py-2.5 bg-white border border-ink-300 text-ink-700 font-bold rounded-xl flex items-center gap-2 hover:border-primary-400 hover:text-primary-600 transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-8 border-b border-ink-100">
        <button
          onClick={() => setTab('magnets')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${tab === 'magnets' ? 'border-primary-600 text-primary-600' : 'border-transparent text-ink-500 hover:text-ink-600'}`}
        >
          Guides ({magnets.length})
        </button>
        <button
          onClick={() => setTab('downloads')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${tab === 'downloads' ? 'border-primary-600 text-primary-600' : 'border-transparent text-ink-500 hover:text-ink-600'}`}
        >
          Captured Leads ({downloads.length})
        </button>
      </div>

      {tab === 'magnets' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingMagnets ? (
            <div className="col-span-full flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
          ) : magnets.length === 0 ? (
            <div className="col-span-full py-16 bg-ink-50 rounded-[32px] border-2 border-dashed border-ink-200">
              <EmptyState icon={FileDown} iconClassName="text-ink-200" message="No lead magnets yet.">
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-4 h-4" /> Add your first downloadable guide
                </button>
              </EmptyState>
            </div>
          ) : magnets.map(m => (
            <div key={m._id} className="bg-ink-50 rounded-[32px] p-6 border border-ink-100 relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(m)} className="p-2 bg-white rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-theme-sm border border-ink-100">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(m._id)} className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-theme-sm border border-ink-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                <FileDown className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-ink-900 pr-8">{m.title}</h4>
              <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mt-1">{m.category}</p>
              <p className="text-ink-500 text-sm mt-2 line-clamp-2">{m.description}</p>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-ink-200/50">
                <span className="text-sm text-ink-500">{m.downloadCount} downloads</span>
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${m.isActive ? 'bg-secondary-100 text-secondary-600' : 'bg-ink-200 text-ink-500'}`}>
                  {m.isActive ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-ink-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Guide</th>
                  <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {loadingDownloads ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 text-primary-600 animate-spin mx-auto" /></td></tr>
                ) : downloads.length === 0 ? (
                  <tr><td colSpan="5">
                    <EmptyState icon={Inbox} iconClassName="text-ink-200" message="No leads captured yet — this fills in as visitors download a guide." />
                  </td></tr>
                ) : downloads.map(d => (
                  <tr key={d._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                    <td className="px-6 py-5 font-bold text-ink-900">{d.name || '—'}</td>
                    <td className="px-6 py-5 text-sm text-ink-700">{d.email}</td>
                    <td className="px-6 py-5 text-sm text-ink-500">{d.leadMagnet?.title || '—'}</td>
                    <td className="px-6 py-5 text-sm text-ink-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-5 text-right">
                      <button onClick={() => setDeleteDownloadTarget(d._id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-ink-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-ink-100 flex justify-between items-center bg-ink-50/50">
              <h3 className="text-xl font-bold text-ink-900 flex items-center gap-2">
                <FileDown className="w-5 h-5 text-primary-600" />
                {editTarget ? 'Edit Guide' : 'Add Guide'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-ink-200 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Title</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Description</label>
                <textarea
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium h-20"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">PDF File</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-ink-200 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all">
                    {uploadingFile ? <Loader2 className="w-4 h-4 text-primary-600 animate-spin" /> : <Upload className="w-4 h-4 text-ink-500" />}
                    <span className="text-sm font-semibold text-ink-600">{uploadingFile ? 'Uploading...' : (form.fileUrl ? 'Replace file' : 'Upload PDF')}</span>
                    <input type="file" accept="application/pdf" onChange={handleFileUpload} disabled={uploadingFile} className="hidden" />
                  </label>
                </div>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium text-sm"
                  placeholder="Or paste a file URL"
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Topic</label>
                  <input
                    list="leadmagnet-topic-suggestions"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="guide, checklist, template..."
                  />
                  <datalist id="leadmagnet-topic-suggestions">
                    <option value="guide" />
                    <option value="checklist" />
                    <option value="template" />
                    <option value="ebook" />
                  </datalist>
                  <p className="text-xs text-ink-400">Groups related items together on the website.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Show on Website?</label>
                  <select
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Visible (students can see it)</option>
                    <option value="false">Hidden (not shown yet)</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-ink-700 border border-ink-300 hover:border-primary-400 hover:text-primary-600 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="bg-coral-500 text-white px-8 py-3 rounded-xl font-bold shadow-theme-md hover:bg-coral-600 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Guide'}
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
        title="Delete this guide?"
        message="This will permanently delete this lead magnet. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmModal
        isOpen={!!deleteDownloadTarget}
        onClose={() => setDeleteDownloadTarget(null)}
        onConfirm={handleDeleteDownloadConfirm}
        title="Remove this lead?"
        message="This will permanently remove this captured lead entry. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const AdminLeadMagnets = () => (
  <LeadMagnetManagement />
);

export default AdminLeadMagnets;
