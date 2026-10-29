import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Calculator, DollarSign, Loader2, RotateCcw } from 'lucide-react';
import * as studyService from '../../services/studyService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAdminList } from '../../hooks/useAdminList';

const CalculatorManagement = () => {
  const { data: defaults, loading, error, refetch: fetchDefaults } = useAdminList(async () => {
    const calculatorRes = await studyService.getCalculatorDefaults();
    const calculatorData = Array.isArray(calculatorRes) ? calculatorRes : (calculatorRes.calculatorDefaults || calculatorRes.data || []);
    return Array.isArray(calculatorData) ? calculatorData : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const emptyForm = {
    country: '',
    avgLivingCostPerYear: 0,
    partTimeHourlyRate: 0,
    visaFee: 0,
    currency: 'USD',
    areaWiseCosts: [],
    incomeSources: [],
    permitsInfo: ''
  };
  const [form, setForm] = useState(emptyForm);

  const handleOpenModal = (def = null) => {
    if (def) {
      setEditTarget(def);
      setForm({ ...def });
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
        await studyService.updateCalculatorDefault(editTarget._id, form);
      } else {
        await studyService.createCalculatorDefault(form);
      }
      setShowModal(false);
      fetchDefaults();
    } catch (error) {
      toast.error(error.message || 'Error saving defaults');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await studyService.deleteCalculatorDefault(deleteTarget);
      toast.success('Defaults deleted');
      fetchDefaults();
    } catch (error) {
      toast.error(error.message || 'Error deleting defaults');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Calculator Defaults</h2>
          <p className="text-ink-500 text-sm">Set default costs and rates for the Study Abroad Calculator.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchDefaults} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-coral-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-coral-600 transition-all shadow-theme-md"
          >
            <Plus className="w-5 h-5" /> Add Country Defaults
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm mb-6">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-ink-500 text-sm font-bold uppercase tracking-wider">
                <th className="px-6 py-2">Country</th>
                <th className="px-6 py-2">Avg. Living Cost</th>
                <th className="px-6 py-2">Hourly Rate</th>
                <th className="px-6 py-2">Visa Fee</th>
                <th className="px-6 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {defaults.map(def => (
                <tr key={def._id} className="bg-cream-50 hover:bg-cream-100/80 transition-all group rounded-2xl">
                  <td className="px-6 py-5 rounded-l-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-theme-sm">
                        <Calculator className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-bold text-ink-900">{def.country}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-ink-700">
                    {def.currency} {def.avgLivingCostPerYear.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-ink-500 text-sm">
                    {def.currency} {def.partTimeHourlyRate}/hr
                  </td>
                  <td className="px-6 py-5 text-ink-500 text-sm">
                    {def.currency} {def.visaFee.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 rounded-r-2xl text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(def)} aria-label={`Edit ${def.country} defaults`} className="p-2 bg-white rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-theme-sm border border-ink-100">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(def._id)} aria-label={`Delete ${def.country} defaults`} className="p-2 bg-white rounded-xl text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-theme-sm border border-ink-100">
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
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-theme-lg flex flex-col">
            <div className="px-8 py-6 border-b border-ink-100 flex justify-between items-center bg-cream-50/50">
              <h3 className="text-xl font-bold text-ink-900">{editTarget ? 'Edit Defaults' : 'Add Defaults'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-cream-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Country</label>
                  <input
                    className="w-full bg-cream-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400/20 font-medium"
                    value={form.country}
                    onChange={(e) => setForm({...form, country: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-500 uppercase">Avg. Living Cost (Year)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                      <input
                        type="number"
                        className="w-full bg-cream-50 border border-ink-100 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400/20 font-medium"
                        value={form.avgLivingCostPerYear}
                        onChange={(e) => setForm({...form, avgLivingCostPerYear: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-500 uppercase">Hourly Rate (Part-time)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                      <input
                        type="number"
                        step="0.01"
                        className="w-full bg-cream-50 border border-ink-100 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400/20 font-medium"
                        value={form.partTimeHourlyRate}
                        onChange={(e) => setForm({...form, partTimeHourlyRate: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-500 uppercase">Visa Fee</label>
                    <input
                      type="number"
                      className="w-full bg-cream-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400/20 font-medium"
                      value={form.visaFee}
                      onChange={(e) => setForm({...form, visaFee: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-500 uppercase">Currency</label>
                    <input
                      className="w-full bg-cream-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400/20 font-medium"
                      value={form.currency}
                      onChange={(e) => setForm({...form, currency: e.target.value})}
                      placeholder="e.g. USD"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Work Permit Information</label>
                  <textarea
                    className="w-full bg-cream-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400/20 font-medium min-h-[100px]"
                    value={form.permitsInfo}
                    onChange={(e) => setForm({...form, permitsInfo: e.target.value})}
                    placeholder="Information about working hours, CPT/OPT etc."
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-ink-700 border border-ink-300 hover:border-primary-400 hover:text-primary-600 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="bg-coral-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-coral-600 transition-all disabled:opacity-50 shadow-theme-md">
                  {saving ? 'Saving...' : 'Save Defaults'}
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
        title="Delete these country defaults?"
        message="This will permanently delete these calculator defaults. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const AdminCalculatorDefaults = () => {
  return (
    <CalculatorManagement />
  );
};

export default AdminCalculatorDefaults;
