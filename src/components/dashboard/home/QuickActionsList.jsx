import { Users, Briefcase, CircleUser, Search, Building2, Star, Book, FileText, GraduationCap } from 'lucide-react';
import { ShortcutCard } from './shared';

const ROLE_SHORTCUTS = {
  agent: [
    { icon: Users, title: 'My Students', desc: 'View all students assigned to your profile.', to: '/agent/students', accentClass: 'bg-coral-50 text-coral-600' },
    { icon: Briefcase, title: 'Applications', desc: 'Review and manage student applications.', to: '/agent/applications', accentClass: 'bg-primary-50 text-primary-600' },
    { icon: CircleUser, title: 'My Profile', desc: 'Update your consultancy profile details.', to: '/agent/profile', accentClass: 'bg-secondary-50 text-secondary-600' },
  ],
  student: [
    { icon: Search, title: 'Browse Courses', desc: 'Find programs from top universities.', to: '/study-abroad/courses', accentClass: 'bg-coral-50 text-coral-600' },
    { icon: Building2, title: 'Universities', desc: 'Explore our university directory.', to: '/study-abroad/universities', accentClass: 'bg-primary-50 text-primary-600' },
    { icon: Star, title: 'Favorites', desc: 'Review your saved courses shortlist.', to: '/student/favorites', accentClass: 'bg-accent-50 text-accent-600' },
    { icon: Book, title: 'News & Vlogs', desc: 'Latest educational vlogs & news.', to: '/student-resources', accentClass: 'bg-primary-50 text-primary-600' },
    { icon: CircleUser, title: 'My Profile', desc: 'Update your personal & academic details.', to: '/student/profile', accentClass: 'bg-secondary-50 text-secondary-600' },
  ],
  university: [
    { icon: FileText, title: 'Applications', desc: 'Review received student applications.', to: '/university/applications', accentClass: 'bg-coral-50 text-coral-600' },
    { icon: GraduationCap, title: 'Our Courses', desc: 'Manage your listed academic programs.', to: '/university/courses', accentClass: 'bg-primary-50 text-primary-600' },
    { icon: Building2, title: 'University Profile', desc: 'Update your institution details.', to: '/university/profile', accentClass: 'bg-secondary-50 text-secondary-600' },
  ],
};

const QuickActionsList = ({ role }) => (
  <div>
    <h3 className="font-bold text-ink-900 text-sm uppercase tracking-wider mb-2">Quick Actions</h3>
    <div className="bg-primary-50/40 border border-primary-100/60 rounded-2xl p-2.5 space-y-2">
      {ROLE_SHORTCUTS[role].map((shortcut) => (
        <ShortcutCard key={shortcut.title} {...shortcut} />
      ))}
    </div>
  </div>
);

export default QuickActionsList;
