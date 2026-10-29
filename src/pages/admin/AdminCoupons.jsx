import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Loader2, RotateCcw, Ticket } from 'lucide-react';
import * as couponService from '../../services/couponService';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/dashboard/EmptyState';
import { useAdminList } from '../../hooks/useAdminList';

const emptyForm = {
  code: '', description: '', discountType: 'percentage', discountValue: 0,
  maxUses: '', minPurchase: 0, validFrom: '', validUntil: '', isActive: true,
};

const CouponManagement = () => {
  const { data: coupons, loading, error, refetch: fetchCoupons } = useAdminList(async () => {
    const data = await couponService.getCoupons();
    return Array.isArray(data) ? data : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditTarget(coupon);
      setForm({
        ...coupon,
        maxUses: coupon.maxUses ?? '',
        validFrom: coupon.validFrom ? coupon.validFrom.substring(0, 10) : '',
        validUntil: coupon.validUntil ? coupon.validUntil.substring(0, 10) : '',
      });
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
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        discountValue: parseFloat(form.discountValue) || 0,
        minPurchase: parseFloat(form.minPurchase) || 0,
        maxUses: form.maxUses === '' ? null : parseInt(form.maxUses),
        validFrom: form.validFrom || null,
        validUntil: form.validUntil || null,
      };
      if (editTarget) {
        await couponService.updateCoupon(editTarget._id, payload);
      } else {
        await couponService.createCoupon(payload);
      }
      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.message || 'Error saving coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await couponService.deleteCoupon(deleteTarget);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error(error.message || 'Error deleting coupon');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Discount Coupons</h2>
          <p className="text-ink-500 text-sm">Manage promotional and referral discount codes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchCoupons} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-coral-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-coral-600 transition-all shadow-theme-md"
          >
            <Plus className="w-5 h-5" /> Add Coupon
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
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Discount</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Usage</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Visibility</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 text-primary-600 animate-spin mx-auto" /></td></tr>
              ) : !error && coupons.length === 0 ? (
                <tr><td colSpan="5">
                  <EmptyState icon={Ticket} iconClassName="text-ink-200" message="No coupons yet.">
                    <button
                      onClick={() => handleOpenModal()}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="w-4 h-4" /> Add your first coupon
                    </button>
                  </EmptyState>
                </td></tr>
              ) : coupons.map(c => (
                <tr key={c._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-ink-900 font-mono">{c.code}</p>
                    {c.description && <p className="text-sm text-ink-500 truncate max-w-xs">{c.description}</p>}
                  </td>
                  <td className="px-6 py-5 text-sm text-ink-700 font-semibold">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `৳${c.discountValue}`}
                  </td>
                  <td className="px-6 py-5 text-sm text-ink-500">
                    {c.usedCount} / {c.maxUses ?? '∞'}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${c.isActive ? 'bg-secondary-100 text-secondary-600' : 'bg-ink-200 text-ink-500'}`}>
                      {c.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(c)} className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-ink-100">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(c._id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-ink-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-ink-100 flex justify-between items-center bg-ink-50/50">
              <h3 className="text-xl font-bold text-ink-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary-600" />
                {editTarget ? 'Edit Coupon' : 'Add Coupon'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-ink-200 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Coupon Code</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-mono font-bold uppercase"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Description</label>
                <input
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Discount Type</label>
                  <select
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Discount Value</label>
                  <input
                    type="number"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Max Uses (blank = unlimited)</label>
                  <input
                    type="number"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Min Purchase</label>
                  <input
                    type="number"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.minPurchase}
                    onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Valid From</label>
                  <input
                    type="date"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Valid Until</label>
                  <input
                    type="date"
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  />
                </div>
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
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-ink-700 border border-ink-300 hover:border-primary-400 hover:text-primary-600 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="bg-coral-500 text-white px-8 py-3 rounded-xl font-bold shadow-theme-md hover:bg-coral-600 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Coupon'}
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
        title="Delete this coupon?"
        message="This will permanently delete this coupon code. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const AdminCoupons = () => (
  <CouponManagement />
);

export default AdminCoupons;
