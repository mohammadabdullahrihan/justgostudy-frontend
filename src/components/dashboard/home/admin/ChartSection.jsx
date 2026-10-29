import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Area, AreaChart,
} from 'recharts';
import { PieChart as PieChartIcon, Globe, Server, Database, BarChart3 } from 'lucide-react';
import { ChartTooltipStyle } from '../sharedUtils';

const ChartSection = ({ stats, loading, countryData, trendData, systemHealth }) => (
  <>
    {/* Charts Row, 3 charts side by side */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Platform Overview Bar Chart */}
      <div className="bg-white rounded-2xl border border-ink-100/70 p-4 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
            <BarChart3 size={14} className="text-primary-600" />
          </span>
          <p className="font-bold text-ink-900 text-sm">Platform Overview</p>
        </div>
        <p className="text-xs text-ink-600 mb-3 ml-9">Users, agents, courses & more</p>
        {loading ? (
          <div className="h-44 skeleton rounded-xl"></div>
        ) : (
          <ResponsiveContainer width="100%" height={175}>
            <BarChart
              data={[
                { name: 'Users', value: stats.users, fill: '#1834b5' },
                { name: 'Students', value: stats.students, fill: '#788ded' },
                { name: 'Agents', value: stats.agents, fill: '#f4591a' },
                { name: 'Courses', value: stats.courses, fill: '#1ab894' },
                { name: 'Unis', value: stats.universities, fill: '#0d7860' },
                { name: 'Apps', value: stats.totalApps, fill: '#ef9315' },
              ]}
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={ChartTooltipStyle.contentStyle} cursor={ChartTooltipStyle.cursor} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {[
                  { fill: '#1834b5' }, { fill: '#788ded' }, { fill: '#f4591a' },
                  { fill: '#1ab894' }, { fill: '#0d7860' }, { fill: '#ef9315' },
                ].map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Application Status Pie Chart */}
      <div className="bg-white rounded-2xl border border-ink-100/70 p-4 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
            <PieChartIcon size={14} className="text-accent-600" />
          </span>
          <p className="font-bold text-ink-900 text-sm">Application Status</p>
        </div>
        <p className="text-xs text-ink-600 mb-3 ml-9">Breakdown by current status</p>
        {loading ? (
          <div className="h-44 skeleton rounded-xl"></div>
        ) : stats.totalApps === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center">
            <PieChartIcon size={28} className="text-ink-200 mb-2" />
            <p className="text-xs text-ink-600">No applications yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={175}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Pending', value: stats.pending },
                  { name: 'In Review', value: stats.inReview },
                  { name: 'Approved', value: stats.approved },
                  { name: 'Rejected', value: stats.rejected },
                ].filter(d => d.value > 0)}
                cx="50%" cy="45%"
                innerRadius={45} outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                <Cell fill="#ef9315" />
                <Cell fill="#1834b5" />
                <Cell fill="#1ab894" />
                <Cell fill="#f43f5e" />
              </Pie>
              <Tooltip contentStyle={ChartTooltipStyle.contentStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Countries Bar Chart */}
      <div className="bg-white rounded-2xl border border-ink-100/70 p-4 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-7 h-7 rounded-lg bg-coral-50 flex items-center justify-center shrink-0">
            <Globe size={14} className="text-coral-600" />
          </span>
          <p className="font-bold text-ink-900 text-sm">Top Destinations</p>
        </div>
        <p className="text-xs text-ink-600 mb-3 ml-9">Applications by country</p>
        {loading ? (
          <div className="h-44 skeleton rounded-xl"></div>
        ) : countryData.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center">
            <Globe size={28} className="text-ink-200 mb-2" />
            <p className="text-xs text-ink-600">No destination data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={175}>
            <BarChart
              data={countryData}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={ChartTooltipStyle.contentStyle} cursor={ChartTooltipStyle.cursor} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#ef9315" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>

    {/* ── Quick Stats Comparison Row ── */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Students vs Agents ratio */}
      <div className="bg-white rounded-2xl border border-ink-100/70 p-4 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-600 mb-3">Students vs Agents</p>
        <div className="flex items-end gap-3 mb-2">
          <div className="flex-1">
            <p className="text-xs text-primary-600 font-semibold mb-1">Students</p>
            <div className="h-3 rounded-full bg-primary-100 overflow-hidden">
              <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: loading ? '0%' : `${stats.users > 0 ? Math.round((stats.students / stats.users) * 100) : 0}%` }}></div>
            </div>
            <p className="text-lg font-extrabold text-ink-900 mt-1">{loading ? '—' : stats.students}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-coral-600 font-semibold mb-1">Agents</p>
            <div className="h-3 rounded-full bg-coral-100 overflow-hidden">
              <div className="h-full rounded-full bg-coral-400 transition-all" style={{ width: loading ? '0%' : `${stats.users > 0 ? Math.round((stats.agents / stats.users) * 100) : 0}%` }}></div>
            </div>
            <p className="text-lg font-extrabold text-ink-900 mt-1">{loading ? '—' : stats.agents}</p>
          </div>
        </div>
        <p className="text-xs text-ink-600">{loading ? '' : `${stats.users > 0 ? Math.round((stats.students / stats.users) * 100) : 0}% students of total users`}</p>
      </div>

      {/* Approval rate */}
      <div className="bg-white rounded-2xl border border-ink-100/70 p-4 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-600 mb-3">Approval Rate</p>
        {loading ? (
          <div className="h-16 skeleton rounded-xl"></div>
        ) : (
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#ecfdf7" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#1ab894" strokeWidth="4"
                  strokeDasharray={`${stats.totalApps > 0 ? (stats.approved / stats.totalApps) * 88 : 0} 88`}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-secondary-600">
                {stats.totalApps > 0 ? Math.round((stats.approved / stats.totalApps) * 100) : 0}%
              </span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-ink-900">{stats.approved}</p>
              <p className="text-xs text-ink-600">of {stats.totalApps} approved</p>
              <p className="text-xs text-rose-500 font-semibold mt-0.5">{stats.rejected} rejected</p>
            </div>
          </div>
        )}
      </div>

      {/* System Health, live DB/API status from /api/stats/system-health */}
      <div className="bg-white rounded-2xl border border-ink-100/70 p-4 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-600">System Health</p>
          <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border ${
            systemHealth.status === 'operational'
              ? 'text-secondary-600 bg-secondary-50 border-secondary-200'
              : systemHealth.status === 'checking'
                ? 'text-ink-600 bg-cream-100 border-ink-200'
                : 'text-rose-600 bg-rose-50 border-rose-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${
              systemHealth.status === 'operational' ? 'bg-secondary-500 animate-pulse' : systemHealth.status === 'checking' ? 'bg-ink-400' : 'bg-rose-500 animate-pulse'
            }`}></span>
            {systemHealth.status === 'operational' ? 'Operational' : systemHealth.status === 'checking' ? 'Checking…' : 'Degraded'}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-600 flex items-center gap-1.5"><Server size={10} className="text-primary-400" /> API Server</span>
            <span className={`font-bold ${systemHealth.api === 'online' ? 'text-secondary-600' : 'text-rose-600'}`}>
              {systemHealth.api === 'online' ? 'Online' : systemHealth.api === 'checking' ? 'Checking…' : 'Unreachable'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-600 flex items-center gap-1.5"><Database size={10} className="text-coral-400" /> Database</span>
            <span className={`font-bold ${systemHealth.database === 'connected' ? 'text-secondary-600' : 'text-rose-600'}`}>
              {systemHealth.database === 'connected' ? 'Connected' : systemHealth.database === 'checking' ? 'Checking…' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-ink-100 pt-2 mt-1">
            <span className="text-ink-600">Last checked</span>
            <span className="font-semibold text-ink-600 tabular-nums">
              {systemHealth.lastSync.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka' })} BST
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* ── Application Trend Line Chart (full width) ── */}
    <div className="bg-white rounded-2xl border border-ink-100/70 p-5 shadow-theme-sm hover:shadow-theme-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-ink-900 text-sm">Growth Trend</p>
          <p className="text-xs text-ink-600 mt-0.5">Applications & User registrations, last 6 months</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-primary-600 inline-block"></span> Applications</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-coral-400 inline-block"></span> Users</span>
        </div>
      </div>
      {loading ? (
        <div className="h-44 skeleton rounded-xl"></div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1834b5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1834b5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f4591a" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#f4591a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={ChartTooltipStyle.contentStyle} />
            <Area type="monotone" dataKey="Applications" stroke="#1834b5" strokeWidth={2.5} fill="url(#appGrad)" dot={{ r: 4, fill: '#1834b5', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Area type="monotone" dataKey="Users" stroke="#f4591a" strokeWidth={2.5} fill="url(#userGrad)" dot={{ r: 4, fill: '#f4591a', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  </>
);

export default ChartSection;
