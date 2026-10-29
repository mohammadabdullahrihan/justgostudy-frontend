import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Megaphone, PictureInPicture2, Ticket, CalendarDays, FileDown, Users2, RotateCcw } from 'lucide-react';
import * as statsService from '../../services/statsService';
import { ChartTooltipStyle } from '../../components/dashboard/home/sharedUtils';
import { useAdminList } from '../../hooks/useAdminList';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-ink-100 shadow-theme-sm">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-3xl font-bold text-ink-900">{value}</h4>
    <p className="text-sm text-ink-500">{label}</p>
    {sub && <p className="text-sm text-ink-500 mt-1">{sub}</p>}
  </div>
);

const AdminMarketingAnalytics = () => {
  const { data: stats, loading, error, refetch: fetchStats } = useAdminList(
    () => statsService.getMarketingStats(),
    { initialData: null }
  );

  const funnelData = stats ? [
    { name: 'Banner clicks', value: stats.banners.clicks, fill: '#1834b5' },
    { name: 'Popup clicks', value: stats.popups.clicks, fill: '#f4591a' },
    { name: 'Coupon redeems', value: stats.coupons.redemptions, fill: '#1ab894' },
    { name: 'Event signups', value: stats.events.totalRegistered, fill: '#cc7a0c' },
    { name: 'Guide downloads', value: stats.leadMagnets.totalDownloads, fill: '#109677' },
    { name: 'Referrals', value: stats.referrals.totalReferred, fill: '#4a4a4a' },
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Marketing Analytics</h1>
          <p className="text-ink-500">Real performance across every marketing tool — no estimates, just stored counts.</p>
        </div>
        <button onClick={fetchStats} className="text-sm text-coral-600 font-semibold hover:underline flex items-center gap-1">
          <RotateCcw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-36 bg-ink-50 rounded-3xl animate-pulse" />)}
        </div>
      ) : !stats ? null : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={Megaphone}
              label="Banner Click Rate"
              value={`${stats.banners.ctr}%`}
              sub={`% of viewers who clicked — ${stats.banners.clicks} clicks / ${stats.banners.impressions} views · ${stats.banners.active} active`}
              color="bg-primary-50 text-primary-600"
            />
            <StatCard
              icon={PictureInPicture2}
              label="Popup Click Rate"
              value={`${stats.popups.ctr}%`}
              sub={`% of viewers who clicked — ${stats.popups.clicks} clicks / ${stats.popups.impressions} views · ${stats.popups.active} active`}
              color="bg-coral-50 text-coral-600"
            />
            <StatCard
              icon={Ticket}
              label="Coupon Redemptions"
              value={stats.coupons.redemptions}
              sub={`${stats.coupons.active} active coupons`}
              color="bg-secondary-50 text-secondary-600"
            />
            <StatCard
              icon={CalendarDays}
              label="Event Registrations"
              value={stats.events.totalRegistered}
              sub={`${stats.events.upcoming} upcoming events`}
              color="bg-accent-50 text-accent-600"
            />
            <StatCard
              icon={FileDown}
              label="Guide Downloads"
              value={stats.leadMagnets.totalDownloads}
              sub={`${stats.leadMagnets.downloadsThisWeek} this week`}
              color="bg-secondary-50 text-secondary-600"
            />
            <StatCard
              icon={Users2}
              label="Referred Signups"
              value={stats.referrals.totalReferred}
              sub={`${stats.referrals.rewarded} rewarded`}
              color="bg-ink-100 text-ink-700"
            />
          </div>

          <div className="bg-white rounded-3xl border border-ink-100 p-6 shadow-theme-sm">
            <p className="font-bold text-ink-900 mb-1">Engagement Across Tools</p>
            <p className="text-sm text-ink-500 mb-4">Total real actions captured by each marketing tool</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnelData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f6f6f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8a8a8a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8a8a8a' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={ChartTooltipStyle.contentStyle} cursor={ChartTooltipStyle.cursor} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminMarketingAnalytics;
