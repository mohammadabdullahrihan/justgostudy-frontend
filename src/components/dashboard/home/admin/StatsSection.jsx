import {
  Users, GraduationCap, UserCheck, BookOpen, Building2, Inbox, Clock, CheckCircle, XCircle,
} from 'lucide-react';
import { StatCard } from '../shared';

/* Same fixed primary/coral/secondary/accent rhythm as the role StatsCards,
   so admin's 9-tile grid reads as one system, not a rainbow of unrelated hues. */
const StatsSection = ({ stats, loading }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <StatCard icon={Users} label="Total Users" value={stats.users} color="bg-primary-600 text-white" loading={loading} />
    <StatCard icon={GraduationCap} label="Students" value={stats.students} color="bg-coral-500 text-white" loading={loading} />
    <StatCard icon={UserCheck} label="Agents" value={stats.agents} color="bg-secondary-600 text-white" loading={loading} />
    <StatCard icon={BookOpen} label="Courses" value={stats.courses} color="bg-accent-500 text-white" loading={loading} />
    <StatCard icon={Building2} label="Universities" value={stats.universities} color="bg-primary-600 text-white" loading={loading} />
    <StatCard icon={Inbox} label="Total Applications" value={stats.totalApps} color="bg-coral-500 text-white" loading={loading} />
    <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="bg-accent-500 text-white" loading={loading} />
    <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="bg-secondary-600 text-white" loading={loading} />
    <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="bg-rose-500 text-white" loading={loading} />
  </div>
);

export default StatsSection;
