import { Briefcase, Clock, Search, CheckCircle, FileText, Star, GraduationCap } from 'lucide-react';
import { StatCard } from './shared';

/* Fixed brand-token rhythm reused across every role, so the four tiles read as
   one system instead of a different random hue per card: primary = volume,
   accent (gold) = pending/attention, secondary (teal) = success, coral = the
   role's one distinguishing metric. */
const ROLE_CARDS = {
  agent: [
    { icon: Briefcase, label: 'Total Applications', key: 'total', color: 'bg-primary-600 text-white' },
    { icon: Clock, label: 'Pending', key: 'pending', color: 'bg-accent-500 text-white' },
    { icon: Search, label: 'In Review', key: 'inReview', color: 'bg-coral-500 text-white' },
    { icon: CheckCircle, label: 'Approved', key: 'approved', color: 'bg-secondary-600 text-white' },
  ],
  student: [
    { icon: FileText, label: 'Total Applications', key: 'apps', color: 'bg-primary-600 text-white' },
    { icon: Clock, label: 'Pending', key: 'pending', color: 'bg-accent-500 text-white' },
    { icon: CheckCircle, label: 'Approved', key: 'approved', color: 'bg-secondary-600 text-white' },
    { icon: Star, label: 'Favorites', key: 'favs', color: 'bg-coral-500 text-white' },
  ],
  university: [
    { icon: FileText, label: 'Applications', key: 'apps', color: 'bg-primary-600 text-white' },
    { icon: Clock, label: 'Pending', key: 'pending', color: 'bg-accent-500 text-white' },
    { icon: CheckCircle, label: 'Approved', key: 'approved', color: 'bg-secondary-600 text-white' },
    { icon: GraduationCap, label: 'Courses', key: 'courses', color: 'bg-coral-500 text-white' },
  ],
};

const StatsCards = ({ role, stats, loading }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {ROLE_CARDS[role].map((card) => (
      <StatCard key={card.label} icon={card.icon} label={card.label} value={stats[card.key]} color={card.color} loading={loading} />
    ))}
  </div>
);

export default StatsCards;
