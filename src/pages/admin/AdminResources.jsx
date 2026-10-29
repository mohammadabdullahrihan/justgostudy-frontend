import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Video, Newspaper, Edit, Trash,
  Search, Filter, Save, X,
  Image as ImageIcon, Loader2, AlertCircle, CheckCircle,
  AlertTriangle, RotateCcw, ChevronLeft, ChevronRight,
  Award, Plane, Trophy, FlaskConical
} from 'lucide-react';
import resourceService from '../../services/resourceService';
import uploadService from '../../services/uploadService';

const PAGE_SIZE = 20;

const todayISODate = () => new Date().toISOString().slice(0, 10);

const RESOURCE_TYPES = [
  { value: 'vlog', label: 'Vlog', icon: Video },
  { value: 'news', label: 'News', icon: Newspaper },
  { value: 'guide', label: 'Guide', icon: FileText },
  { value: 'scholarship', label: 'Scholarship', icon: Award },
  { value: 'visa', label: 'Visa', icon: Plane },
  { value: 'success story', label: 'Success Story', icon: Trophy },
  { value: 'stem', label: 'STEM', icon: FlaskConical },
];

const AdminResources = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'create'
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'vlog',
    content: '',
    image: '',
    isActive: true,
    publishedAt: todayISODate()
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Debounce the search box into `search`, and reset back to page 1 whenever it changes.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const resourceData = await resourceService.getResourcesAdmin({
        limit: PAGE_SIZE, page, search: search || undefined, type: typeFilter || undefined,
      });
      setResources(resourceData.resources || []);
      setTotal(resourceData.total ?? 0);
    } catch (err) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (resource) => {
    setEditTarget(resource);
    setFormData({
      title: resource.title,
      type: resource.type,
      content: resource.content,
      image: resource.image,
      isActive: resource.isActive,
      publishedAt: resource.publishedAt ? new Date(resource.publishedAt).toISOString().slice(0, 10) : todayISODate()
    });
    setImagePreview(resource.image);
    setActiveTab('create');
  };

  const handleDeleteClick = (id) => {
    setResourceToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;
    setDeleting(true);
    try {
      await resourceService.deleteResource(resourceToDelete);
      setSuccess('Resource deleted successfully');
      setDeleteModalOpen(false);
      setResourceToDelete(null);
      fetchResources();
    } catch (err) {
      setError('Failed to delete resource');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setResourceToDelete(null);
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let imageUrl = formData.image;

      // Upload image if a new one is selected
      if (imageFile) {
        const uploadRes = await uploadService.uploadFile(imageFile);
        imageUrl = uploadRes.url;
      }

      const payload = { ...formData, image: imageUrl };

      if (editTarget) {
        await resourceService.updateResource(editTarget._id, payload);
        setSuccess('Resource updated successfully');
      } else {
        await resourceService.createResource(payload);
        setSuccess('Resource created successfully');
      }

      // Reset form and refresh
      setEditTarget(null);
      setFormData({ title: '', type: 'vlog', content: '', image: '', isActive: true, publishedAt: todayISODate() });
      setImageFile(null);
      setImagePreview('');
      setActiveTab('all');
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditTarget(null);
    setFormData({ title: '', type: 'vlog', content: '', image: '', isActive: true, publishedAt: todayISODate() });
    setImageFile(null);
    setImagePreview('');
    setActiveTab('all');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-white rounded-[32px] p-6 md:p-10 shadow-theme-sm border border-primary-50"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 mb-2">Manage News & Vlogs</h1>
          <p className="text-ink-500">Create, edit and manage student resources</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchResources} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <div className="flex p-1 bg-primary-50 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'all'
                ? 'bg-white text-primary-600 shadow-theme-sm'
                : 'text-ink-500 hover:text-primary-600'
                }`}
            >
              All Resources
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab('create');
              }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'create'
                ? 'bg-white text-primary-600 shadow-theme-sm'
                : 'text-ink-500 hover:text-primary-600'
                }`}
            >
              {editTarget ? 'Edit Resource' : 'Create New'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium"
          >
            <AlertCircle size={20} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 bg-secondary-50 border border-secondary-100 rounded-2xl flex items-center gap-3 text-secondary-600 text-sm font-medium"
          >
            <CheckCircle size={20} />
            {success}
            <button onClick={() => setSuccess(null)} className="ml-auto"><X size={18} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleDeleteCancel();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-2xl border border-ink-200 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-8 pt-8 pb-4">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
                  <AlertTriangle className="text-rose-600" size={32} />
                </div>
                <h3 className="text-2xl font-extrabold text-ink-900 mb-2">Delete Resource?</h3>
                <p className="text-ink-500 text-sm leading-relaxed">
                  Are you sure you want to delete this resource? This action cannot be undone and the resource will be permanently removed from the system.
                </p>
              </div>

              {/* Footer */}
              <div className="px-8 pb-8 pt-4 flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="flex-1 py-4 bg-ink-100 text-ink-700 rounded-2xl font-bold hover:bg-ink-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-theme-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash size={20} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'all' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title..."
                className="w-full pl-9 pr-3 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-ink-500">
              <Filter size={14} />
              {['', ...RESOURCE_TYPES.map((rt) => rt.value)].map((t) => (
                <button
                  key={t || 'all'}
                  onClick={() => { setTypeFilter(t); setPage(1); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                    typeFilter === t ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {t ? (RESOURCE_TYPES.find((rt) => rt.value === t)?.label || t) : 'All'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
              <p className="text-ink-500 font-medium">Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-20 bg-primary-50/30 rounded-[32px] border border-dashed border-primary-200">
              <FileText className="mx-auto text-primary-200 mb-4" size={60} />
              <h3 className="text-xl font-bold text-ink-900 mb-2">{search || typeFilter ? 'No resources match your filters' : 'No resources yet'}</h3>
              <p className="text-ink-500 mb-8">{search || typeFilter ? 'Try a different search term or filter.' : 'Start by creating your first student resource.'}</p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-theme-lg shadow-primary-600/20"
              >
                Create Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-primary-50">
                    <th className="text-left py-4 px-4 text-xs font-bold text-primary-600 uppercase tracking-wider">Resource</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-primary-600 uppercase tracking-wider">Type</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-primary-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-primary-600 uppercase tracking-wider">Date</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-primary-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {resources.map((resource) => (
                    <tr key={resource._id} className="odd:bg-white even:bg-cream-50/60 group hover:bg-primary-50/40 transition-all">
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary-100 overflow-hidden flex-shrink-0 border border-white shadow-theme-sm">
                            {resource.image ? (
                              <img src={resource.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary-400">
                                {(() => {
                                  const Icon = RESOURCE_TYPES.find((rt) => rt.value === resource.type)?.icon || Newspaper;
                                  return <Icon size={20} />;
                                })()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-ink-900 group-hover:text-primary-600 transition-colors">{resource.title}</p>
                            <p className="text-xs text-ink-500">By {resource.author?.name || 'Admin'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${resource.type === 'vlog'
                          ? 'bg-accent-50 text-accent-600'
                          : 'bg-primary-50 text-primary-600'
                          }`}>
                          {RESOURCE_TYPES.find((rt) => rt.value === resource.type)?.label || resource.type}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${resource.isActive
                          ? 'bg-secondary-50 text-secondary-600'
                          : 'bg-ink-100 text-ink-500'
                          }`}>
                          {resource.isActive ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <p className="text-sm text-ink-500 font-medium">
                          {new Date(resource.publishedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleEdit(resource)}
                            className="w-10 h-10 rounded-xl bg-white border border-primary-100 text-primary-600 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all shadow-theme-sm"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(resource._id)}
                            className="w-10 h-10 rounded-xl bg-white border border-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-theme-sm"
                          >
                            <Trash size={18} />
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
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} resources
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-primary-100 text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-ink-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-primary-100 text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleResourceSubmit} className="max-w-4xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter resource title"
                  className="w-full px-5 py-4 bg-primary-50/50 border border-primary-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-700 mb-2">Resource Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {RESOURCE_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: value })}
                      className={`py-3 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${formData.type === value
                        ? 'bg-primary-600 text-white border-primary-600 shadow-theme-lg shadow-primary-600/20'
                        : 'bg-white text-ink-500 border-ink-100 hover:border-primary-200'
                        }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-700 mb-2">Publish Date</label>
                <input
                  type="date"
                  required
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  className="w-full px-5 py-4 bg-primary-50/50 border border-primary-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
                />
                <p className="mt-1.5 text-xs text-ink-500">Sets when this resource was published — backdate or future-date it as needed.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-700 mb-2">Content</label>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full content here (supports basic HTML)..."
                  className="w-full px-5 py-4 bg-primary-50/50 border border-primary-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Right Column: Image Upload */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-2">Featured Image</label>
                <div
                  className={`relative aspect-video rounded-[32px] border-2 border-dashed transition-all overflow-hidden ${imagePreview ? 'border-primary-600' : 'border-primary-100 bg-primary-50/30'
                    }`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setFormData({ ...formData, image: '' });
                        }}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md text-rose-600 rounded-full flex items-center justify-center shadow-theme-lg hover:bg-white transition-all"
                      >
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group">
                      <div className="w-16 h-16 bg-primary-100 rounded-3xl flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-sm font-bold text-ink-700">Click to upload image</p>
                      <p className="text-xs text-ink-500 mt-1">WebP, JPG or PNG (Max 1200px)</p>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="p-6 bg-primary-50/50 rounded-[32px] border border-primary-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-ink-700">Publication Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed">
                  When active, this resource will be visible to all students on the resources page.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-coral-500 text-white rounded-2xl font-bold hover:bg-coral-600 transition-all shadow-theme-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {editTarget ? 'Update Resource' : 'Publish Resource'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-4 bg-white border border-ink-100 text-ink-500 rounded-2xl font-bold hover:bg-ink-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default AdminResources;
