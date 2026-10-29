import {
  Landmark, Users, UserPlus, FileCheck, Rocket,
  ShieldCheck, Globe, Zap, HeartHandshake, BarChart3, Clock, Users2,
  TrendingUp, Activity, PieChart,
} from 'lucide-react';
import { joinUsData } from '../../constants/pageContent';

// Roles come from the shared page-content constants; the dashboard previews
// are decorative and stay in sync with the original JoinUs page.
export const roles = joinUsData.roles.map((role) => ({
  ...role,
  icon: role.id === 'university' ? Landmark : Users,
  previewIcon: role.id === 'university' ? Activity : PieChart,
  preview: {
    title: role.id === 'university' ? 'Institution Portal' : 'Agent Dashboard',
    stats: role.id === 'university' ? [
      { label: 'Applicants', value: '1,240', growth: '+12%' },
      { label: 'Verified', value: '850', growth: '+8%' },
    ] : [
      { label: 'Commission', value: '$12.4k', growth: '+15%' },
      { label: 'Students', value: '142', growth: '+5%' },
    ],
    chart: role.id === 'university' ? [40, 70, 45, 90, 65, 80] : [30, 50, 80, 60, 90, 100],
  },
}));

export const benefits = [
  { title: 'Verified Quality', desc: 'We hold partners to strict standards, so only qualified partners join our network.', icon: ShieldCheck },
  { title: 'Real-time Insights', desc: 'A dashboard with real-time tracking and data analytics.', icon: BarChart3 },
  { title: 'Dedicated Support', desc: 'A personal account manager who supports you throughout the process.', icon: HeartHandshake },
  { title: 'Global Expansion', desc: 'Connect with institutions and students across continents.', icon: Globe },
];

export const steps = [
  { title: 'Choose Your Role', desc: 'Select whether you are joining as a University/College or Agent.', icon: UserPlus },
  { title: 'Verify Details', desc: 'Complete your profile and provide necessary documentation for verification.', icon: FileCheck },
  { title: 'Start Growing', desc: 'Access your dashboard and get started with Just Go Study.', icon: Rocket },
];

export const faqs = [
  { q: 'How long does the verification process take?', a: 'Typically, the verification process for partners takes between 2-5 business days depending on the completeness of your documentation.', icon: Clock },
  { q: 'Are there any joining fees?', a: 'No, joining the Just Go Study network is completely free for all roles. We grow when you grow.', icon: Zap },
  { q: 'What kind of support will I receive?', a: 'All partners get a dedicated account manager and 24/7 technical support.', icon: HeartHandshake },
  { q: 'How do I track my performance?', a: 'Access your real-time dashboard with detailed analytics, conversion rates, and revenue tracking.', icon: BarChart3 },
  { q: 'Can I switch between roles later?', a: 'Yes, you can request to add additional roles to your account after verification.', icon: Users2 },
];

export const comparison = [
  { feature: 'Commission Rate', justGoStudy: 'Lowest in Industry', competitors: '15-25% Higher', icon: TrendingUp },
  { feature: 'Support', justGoStudy: '24/7 Dedicated', competitors: 'Limited Hours', icon: HeartHandshake },
  { feature: 'Global Reach', justGoStudy: '70+ Countries', competitors: 'Limited Regions', icon: Globe },
  { feature: 'Technology', justGoStudy: 'AI-Powered Platform', competitors: 'Basic Systems', icon: Zap },
];
