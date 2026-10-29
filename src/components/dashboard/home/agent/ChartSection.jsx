import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { ChartTooltipStyle } from '../sharedUtils';

const ChartSection = ({ stats, loading }) => (
  <div className="bg-white rounded-2xl border border-ink-100/70 p-4 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex items-center gap-2 mb-3">
      <span className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
        <BarChart3 size={14} className="text-primary-600" />
      </span>
      <p className="font-bold text-ink-900 text-sm">Pipeline Overview</p>
    </div>
    {loading ? (
      <div className="h-40 skeleton rounded-xl"></div>
    ) : stats.total === 0 ? (
      <div className="h-40 flex flex-col items-center justify-center text-center">
        <BarChart3 size={24} className="text-ink-200 mb-2" />
        <p className="text-xs text-ink-600">No data yet</p>
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={[
            { name: 'Pending', value: stats.pending, fill: '#f4591a' },
            { name: 'In Review', value: stats.inReview, fill: '#1834b5' },
            { name: 'Approved', value: stats.approved, fill: '#1ab894' },
            { name: 'Rejected', value: Math.max(0, stats.total - stats.pending - stats.inReview - stats.approved), fill: '#f43f5e' },
          ].filter(d => d.value > 0)}
          margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={ChartTooltipStyle.contentStyle} cursor={ChartTooltipStyle.cursor} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {[
              { name: 'Pending', value: stats.pending, fill: '#f4591a' },
              { name: 'In Review', value: stats.inReview, fill: '#1834b5' },
              { name: 'Approved', value: stats.approved, fill: '#1ab894' },
              { name: 'Rejected', value: Math.max(0, stats.total - stats.pending - stats.inReview - stats.approved), fill: '#f43f5e' },
            ].filter(d => d.value > 0).map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default ChartSection;
