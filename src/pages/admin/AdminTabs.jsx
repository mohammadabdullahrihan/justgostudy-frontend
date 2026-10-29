import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Loader2, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import * as tabService from '../../services/tabService';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminTabs = () => {
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const emptyForm = {
    id: '',
    label: '',
    icon: 'Globe',
    isActive: true,
    order: 0
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTabs();
  }, []);

  const fetchTabs = async () => {
    try {
      const tabsRes = await tabService.getTabsAdmin();
      const tabsData = Array.isArray(tabsRes) ? tabsRes : (tabsRes.tabs || tabsRes.data || []);
      setTabs(Array.isArray(tabsData) ? tabsData : []);
    } catch (error) {
      console.error('Error fetching tabs:', error);
      setTabs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tab = null) => {
    if (tab) {
      setEditTarget(tab);
      setForm({ ...emptyForm, ...tab });
    } else {
      setEditTarget(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await tabService.updateTab(editTarget.id, form);
      } else {
        await tabService.createTab(form);
      }
      setShowModal(false);
      fetchTabs();
    } catch (error) {
      toast.error(error.message || 'Error saving tab');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await tabService.deleteTab(deleteTarget);
      toast.success('Tab deleted');
      fetchTabs();
    } catch (error) {
      toast.error(error.message || 'Error deleting tab');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleReorder = async (index, direction) => {
    const newTabs = [...tabs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newTabs[index], newTabs[targetIndex]] = [newTabs[targetIndex], newTabs[index]];

    const tabOrders = newTabs.map((tab, i) => ({ id: tab.id, order: i }));

    try {
      await tabService.reorderTabs(tabOrders);
      fetchTabs();
    } catch (error) {
      toast.error('Error reordering tabs');
    }
  };

  return (
    <>
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Tabs</h2>
          <p className="text-ink-500 text-sm">Manage tabs for country detail pages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTabs} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-coral-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-coral-600 transition-all shadow-theme-md"
          >
            <Plus className="w-5 h-5" /> Add New Tab
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-ink-500 text-sm font-bold uppercase tracking-wider">
                <th className="px-6 py-2">Display Order</th>
                <th className="px-6 py-2">ID</th>
                <th className="px-6 py-2">Label</th>
                <th className="px-6 py-2">Icon</th>
                <th className="px-6 py-2">Visibility</th>
                <th className="px-6 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tabs.map((tab, index) => (
                <tr key={tab.id || tab._id} className="bg-ink-50 hover:bg-ink-100/80 transition-all group rounded-2xl">
                  <td className="px-6 py-5 rounded-l-2xl">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => index > 0 && handleReorder(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-ink-200 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4 text-ink-500" />
                      </button>
                      <button
                        onClick={() => index < tabs.length - 1 && handleReorder(index, 'down')}
                        disabled={index === tabs.length - 1}
                        className="p-1 hover:bg-ink-200 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4 text-ink-500" />
                      </button>
                      <span className="text-sm font-bold text-ink-700">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-mono text-sm text-ink-600">{tab.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-ink-900">{tab.label}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-ink-600">{tab.icon}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tab.isActive ? 'bg-secondary-100 text-secondary-600' : 'bg-ink-200 text-ink-500'}`}>
                      {tab.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-5 rounded-r-2xl text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(tab)} aria-label={`Edit ${tab.label}`} className="p-2 bg-white rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-theme-sm border border-ink-100">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(tab.id)} aria-label={`Delete ${tab.label}`} className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-theme-sm border border-ink-100">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="px-8 py-6 border-b border-ink-100 flex justify-between items-center bg-ink-50/50">
              <h3 className="text-xl font-bold text-ink-900">{editTarget ? 'Edit Tab' : 'Add New Tab'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-ink-200 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-700">Tab ID (unique)</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  value={form.id}
                  onChange={(e) => setForm({...form, id: e.target.value})}
                  required
                  disabled={!!editTarget}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-700">Label</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  value={form.label}
                  onChange={(e) => setForm({...form, label: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-700">Icon</label>
                <select
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  value={form.icon}
                  onChange={(e) => setForm({...form, icon: e.target.value})}
                >
                  <option value="Globe">Globe</option>
                  <option value="GraduationCap">Graduation Cap</option>
                  <option value="Heart">Heart</option>
                  <option value="DollarSign">Dollar Sign</option>
                  <option value="Plane">Plane</option>
                  <option value="Award">Award</option>
                  <option value="Briefcase">Briefcase</option>
                  <option value="UserCheck">User Check</option>
                  <option value="BookOpen">Book Open</option>
                  <option value="Users">Users</option>
                  <option value="Star">Star</option>
                  <option value="Lightbulb">Lightbulb</option>
                  <option value="Compass">Compass</option>
                  <option value="School">School</option>
                  <option value="Wrench">Wrench</option>
                  <option value="Home">Home</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-700">Show on Website?</label>
                <select
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  value={form.isActive}
                  onChange={(e) => setForm({...form, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Visible (students can see it)</option>
                  <option value="false">Hidden (not shown yet)</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editTarget ? 'Update Tab' : 'Create Tab')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>

    <ConfirmModal
      isOpen={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      onConfirm={handleDeleteConfirm}
      title="Delete this tab?"
      message="This will permanently delete this tab. This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
};

export default AdminTabs;
