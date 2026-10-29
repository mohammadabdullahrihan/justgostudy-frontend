import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit, X, Loader2, RotateCcw, Users2, Ticket } from 'lucide-react';
import * as referralService from '../../services/referralService';
import EmptyState from '../../components/dashboard/EmptyState';
import { useAdminList } from '../../hooks/useAdminList';

const STATUS_BADGES = {
  pending: 'bg-ink-200 text-ink-600',
  contacted: 'bg-secondary-100 text-secondary-600',
  converted: 'bg-accent-100 text-accent-600',
  rewarded: 'bg-secondary-100 text-secondary-600',
};

const emptyForm = { rewardStatus: 'pending', rewardType: 'cash', rewardAmount: 0, notes: '' };

const ReferralManagement = () => {
  const { data: rows, loading, error, refetch: fetchReferrals } = useAdminList(async () => {
    const data = await referralService.getReferrals();
    return Array.isArray(data) ? data : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleOpenModal = (row) => {
    setEditTarget(row);
    setForm({
      rewardStatus: row.reward?.rewardStatus || 'pending',
      rewardType: row.reward?.rewardType || 'cash',
      rewardAmount: row.reward?.rewardAmount || 0,
      notes: row.reward?.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, rewardAmount: parseFloat(form.rewardAmount) || 0 };
      const result = await referralService.upsertReferralReward(editTarget.referredUser._id, payload);
      if (result.issuedCoupon) {
        toast.success(`Coupon issued: ${result.issuedCoupon.code}`);
      } else {
        toast.success('Reward updated');
      }
      setShowModal(false);
      fetchReferrals();
    } catch (error) {
      toast.error(error.message || 'Error saving reward');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-theme-sm border border-ink-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Referral Rewards</h2>
          <p className="text-ink-500 text-sm">Real signups tracked via each user&apos;s referral code — manage payouts here.</p>
        </div>
        <button onClick={fetchReferrals} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
          <RotateCcw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm mb-4">{error}</div>
      )}

      <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-ink-50/50">
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Referrer</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Referred Signup</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest">Reward</th>
                <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 text-primary-600 animate-spin mx-auto" /></td></tr>
              ) : !error && rows.length === 0 ? (
                <tr><td colSpan="5">
                  <EmptyState icon={Users2} iconClassName="text-ink-200" message="No referred signups yet — this fills in automatically as users sign up through someone's referral link." />
                </td></tr>
              ) : rows.map((row) => (
                <tr key={row.referredUser._id} className="odd:bg-white even:bg-cream-50/60 hover:bg-primary-50/40 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-ink-900">{row.referrer?.name || 'Unknown'}</p>
                    <p className="text-sm text-ink-500">{row.referrer?.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-ink-900">{row.referredUser.name}</p>
                    <p className="text-sm text-ink-500 capitalize">{row.referredUser.role}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-ink-500">{new Date(row.referredUser.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${STATUS_BADGES[row.reward?.rewardStatus || 'pending']}`}>
                      {row.reward?.rewardStatus || 'pending'}
                    </span>
                    {row.reward?.couponCode && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-mono font-bold text-primary-600">
                        <Ticket className="w-3 h-3" /> {row.reward.couponCode}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => handleOpenModal(row)} className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-ink-100">
                      <Edit className="w-4 h-4" />
                    </button>
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
                <Users2 className="w-5 h-5 text-primary-600" />
                Manage Reward
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-ink-200 rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto">
              <div className="bg-ink-50 rounded-2xl p-4 text-sm">
                <p className="text-ink-500">Referrer</p>
                <p className="font-bold text-ink-900">{editTarget.referrer?.name}</p>
                <p className="text-ink-500 mt-2">Referred signup</p>
                <p className="font-bold text-ink-900">{editTarget.referredUser.name}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Status</label>
                  <select
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.rewardStatus}
                    onChange={(e) => setForm({ ...form, rewardStatus: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="rewarded">Rewarded</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase">Reward Type</label>
                  <select
                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                    value={form.rewardType}
                    onChange={(e) => setForm({ ...form, rewardType: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="coupon">Coupon (auto-generated)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Reward Amount</label>
                <input
                  type="number"
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                  value={form.rewardAmount}
                  onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })}
                />
                {form.rewardType === 'coupon' && (
                  <p className="text-xs text-ink-500">Setting status to &ldquo;Rewarded&rdquo; will auto-issue a single-use coupon for this amount.</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-500 uppercase">Notes</label>
                <textarea
                  className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium h-20"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-ink-700 border border-ink-300 hover:border-primary-400 hover:text-primary-600 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="bg-coral-500 text-white px-8 py-3 rounded-xl font-bold shadow-theme-md hover:bg-coral-600 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminReferrals = () => (
  <ReferralManagement />
);

export default AdminReferrals;
