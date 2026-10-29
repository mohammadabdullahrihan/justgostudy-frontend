import { useState, useEffect } from 'react';
import { Users, Building, Globe, Trophy, List, Plus, AlertCircle, X, Check, Edit, Trash2, RotateCcw } from 'lucide-react';
import successService from '../../services/successService';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminSuccess = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
  const [editingId, setEditingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    value: '',
    icon: 'Trophy',
    description: '',
    order: 0,
    isActive: true
  });

  const icons = ['Trophy', 'Users', 'Building', 'Globe', 'Star'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await successService.getAllSuccess();
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch success stories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      value: '',
      icon: 'Trophy',
      description: '',
      order: 0,
      isActive: true
    });
    setEditingId(null);
    setActiveTab('list');
  };

  const handleSuccessStorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await successService.updateSuccess(editingId, formData);
      } else {
        await successService.createSuccess(formData);
      }
      fetchStats();
      resetForm();
    } catch (err) {
      console.error('Error saving stat:', err);
      setError(err.message || 'Failed to save success story');
    }
  };

  const handleEdit = (stat) => {
    setFormData({
      title: stat.title,
      value: stat.value,
      icon: stat.icon || 'Trophy',
      description: stat.description || '',
      order: stat.order || 0,
      isActive: stat.isActive
    });
    setEditingId(stat._id);
    setActiveTab('add');
  };

  const handleDeleteClick = (stat) => {
    setItemToDelete(stat);
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    try {
      await successService.deleteSuccess(itemToDelete._id);
      fetchStats();
      setIsDeleting(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting stat:', err);
      setError('Failed to delete success story');
    }
  };

  const getIconComponent = (iconName) => {
    switch(iconName) {
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Building': return <Building className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  return (
    <>
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Manage Success Stories</h1>
          <p className="text-ink-500 mt-1">Add or update the statistics shown on the &quot;Our Success&quot; page.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchStats} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <div className="flex bg-white p-1 rounded-xl shadow-theme-sm border border-ink-200">
            <button
              onClick={() => { setActiveTab('list'); setEditingId(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'list' ? 'bg-primary-600 text-white shadow-theme-md' : 'text-ink-600 hover:bg-ink-100'}`}
            >
              <List className="w-4 h-4" />
              All Stats
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'add' ? 'bg-primary-600 text-white shadow-theme-md' : 'text-ink-600 hover:bg-ink-100'}`}
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Edit Stat' : 'Add New'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 flex items-center gap-3 rounded-r-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-5 h-5" /></button>
        </div>
      )}

      {activeTab === 'list' ? (
        <div className="bg-white rounded-2xl shadow-theme-sm border border-ink-200 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-ink-500">Loading statistics...</p>
            </div>
          ) : stats.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                <Trophy className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-2">No stats found</h3>
              <p className="text-ink-500 mb-6">Start by adding your first success achievement.</p>
              <button
                onClick={() => setActiveTab('add')}
                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                Add Your First Stat
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-ink-50 border-bottom border-ink-200">
                    <th className="px-6 py-4 text-sm font-semibold text-ink-600 uppercase tracking-wider">Display Order</th>
                    <th className="px-6 py-4 text-sm font-semibold text-ink-600 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-4 text-sm font-semibold text-ink-600 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-4 text-sm font-semibold text-ink-600 uppercase tracking-wider">Icon</th>
                    <th className="px-6 py-4 text-sm font-semibold text-ink-600 uppercase tracking-wider">Visibility</th>
                    <th className="px-6 py-4 text-sm font-semibold text-ink-600 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {stats.map((stat) => (
                    <tr key={stat._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-medium text-ink-500">#{stat.order}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-ink-900">{stat.title}</div>
                          <div className="text-sm text-ink-500 truncate max-w-xs">{stat.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full font-bold text-sm">
                          {stat.value}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-ink-100 rounded-lg flex items-center justify-center text-ink-600">
                          {getIconComponent(stat.icon)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {stat.isActive ? (
                          <span className="flex items-center gap-1.5 text-secondary-600 text-sm font-medium">
                            <span className="bg-secondary-100 rounded-full p-1 inline-flex"><Check className="w-3 h-3 text-secondary-600" /></span>
                            Visible
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-ink-500 text-sm font-medium">
                            <span className="bg-ink-100 rounded-full p-1 inline-flex"><X className="w-3 h-3" /></span>
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(stat)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(stat)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-theme-sm border border-ink-200 overflow-hidden p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-ink-900 mb-6">{editingId ? 'Edit Success Story' : 'Add New Success Story'}</h2>
          <form onSubmit={handleSuccessStorySubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Students Placed"
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Value</label>
                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="e.g. 5000+"
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Icon</label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                >
                  {icons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
                <p className="text-xs text-ink-500 mt-1">Lower numbers show first (1, 2, 3...).</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Small description of this achievement..."
                className="w-full px-4 py-3 rounded-xl border border-ink-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex items-center gap-3 p-4 bg-ink-50 rounded-xl">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-ink-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-ink-700 cursor-pointer">
                Show on Website? (checked = visible, unchecked = hidden)
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-grow px-6 py-4 bg-coral-500 text-white rounded-xl font-bold hover:bg-coral-600 transition-colors shadow-theme-md"
              >
                {editingId ? 'Update Achievement' : 'Save Achievement'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-4 bg-white text-ink-600 border border-ink-200 rounded-xl font-bold odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>

    <ConfirmModal
      isOpen={isDeleting}
      onClose={() => setIsDeleting(false)}
      onConfirm={confirmDelete}
      title="Delete Success Story?"
      message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
      type="danger"
    />
    </>
  );
};

export default AdminSuccess;
