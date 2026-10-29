import {
  Trophy, Users, Building2, Globe, Star, GraduationCap, CheckCircle2,
  DollarSign, Calendar, Briefcase, Heart,
} from 'lucide-react';

// Maps stat icon names coming from the DB (including legacy Font Awesome
// class strings on existing records) to Lucide components.
export const getIcon = (iconName) => {
  const iconMap = {
    Trophy, Users, Building: Building2, Globe, Star,
    Graduate: GraduationCap, GraduateCap: GraduationCap, University: Building2,
    Earth: Globe, CheckCircle: CheckCircle2, GraduationCap, DollarSign,
    Calendar, Briefcase, Heart,
    // legacy Font Awesome class strings (existing DB records)
    'fa-solid fa-user-graduate': GraduationCap,
    'fa-solid fa-university': Building2,
    'fa-solid fa-trophy': Trophy,
    'fa-solid fa-earth-americas': Globe,
  };
  const IconComponent = iconMap[iconName] || Trophy;
  return <IconComponent className="h-6 w-6" />;
};

// "5000+" -> { prefix: "", end: 5000, suffix: "+" }
// "$2.5M+" -> { prefix: "$", end: 2.5, suffix: "M+" }, stripping all
// non-digits (the old approach) turned this into "25$.M+" on screen, since
// the decimal point got thrown away along with the "$" and "M+".
export const parseStatValue = (value) => {
  if (typeof value !== 'string') return { prefix: '', end: 0, suffix: '' };
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  if (!match) return { prefix: '', end: 0, suffix: value };
  const [, prefix, num, suffix] = match;
  return { prefix, end: parseFloat(num), suffix };
};

// "5432+" -> "5,432+". Same comma grouping the animated count-up numbers
// land on, for the plain (non-animated) places that quote a stat inline.
export const formatStatValue = (value) => {
  const { prefix, end, suffix } = parseStatValue(value);
  return `${prefix}${end.toLocaleString()}${suffix}`;
};
