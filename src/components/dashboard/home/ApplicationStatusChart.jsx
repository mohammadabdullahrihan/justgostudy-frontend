import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { ChartTooltipStyle } from './sharedUtils';

const ROLE_TEXT = {
  student: { title: 'Application Status', emptyMessage: 'No data yet' },
  university: { title: 'Pipeline Status', emptyMessage: 'No applications yet' },
};

const ApplicationStatusChart = ({ role, stats, loading }) => {
  const { title, emptyMessage } = ROLE_TEXT[role];

  return (
    <div className="bg-white rounded-2xl border border-ink-100/70 p-4 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
          <PieChartIcon size={14} className="text-primary-600" />
        </span>
        <p className="font-bold text-ink-900 text-sm">{title}</p>
      </div>
      {loading ? (
        <div className="h-40 skeleton rounded-xl"></div>
      ) : stats.apps === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-center">
          <PieChartIcon size={24} className="text-ink-200 mb-2" />
          <p className="text-xs text-ink-600">{emptyMessage}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={[
                { name: 'Pending', value: stats.pending },
                { name: 'Approved', value: stats.approved },
                { name: 'Others', value: Math.max(0, stats.apps - stats.pending - stats.approved) },
              ].filter(d => d.value > 0)}
              cx="50%" cy="50%"
              innerRadius={42} outerRadius={62}
              paddingAngle={3}
              dataKey="value"
            >
              <Cell fill="#f4591a" />
              <Cell fill="#1ab894" />
              <Cell fill="#1834b5" />
            </Pie>
            <Tooltip contentStyle={ChartTooltipStyle.contentStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ApplicationStatusChart;
