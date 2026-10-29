import {
  MessageCircle,
  GraduationCap,
  Search,
  Banknote,
  Landmark,
  FileCheck2,
  Stamp,
  PlaneTakeoff,
} from 'lucide-react';

// Single source of truth for the real service list shown on the Study
// Abroad landing page (SAServicesSection) and the standalone "Our Services"
// page (pages/OurServices.jsx) — kept here (not in either component) so
// fast-refresh stays happy and the two pages never drift apart.
//
// `desc` is the short blurb for the homepage/study-abroad carousel card;
// `detail` is the longer, standalone-page version — same facts, more
// context, never contradicting the short version.
export const services = [
  {
    icon: MessageCircle,
    image: '/people-studying-together.webp',
    title: 'Student Counseling',
    desc: 'Your first profile assessment and consultation session is completely free. We evaluate your academic background, career goals, and budget before recommending what actually fits you.',
    detail: "Every journey starts with a free, no-obligation consultation. One of our counselors sits down with you to understand your academic background, budget, career ambitions, and the kind of environment you'd thrive in abroad. Based on that conversation — not a generic checklist — we map out a realistic shortlist of destinations and universities before you spend a single taka on an application.",
    tint: { bg: 'bg-secondary-600', glow: 'bg-secondary-200' },
  },
  {
    icon: GraduationCap,
    image: '/hat-map-icon.webp',
    title: 'Choose a Suitable University',
    desc: 'We help you shortlist universities across the US, UK, Canada, Australia, New Zealand, and Europe based on your budget, academic profile, and long-term goals, not just rankings.',
    detail: 'We help you shortlist universities across the US, UK, Canada, Australia, New Zealand, and Europe based on your budget, academic profile, and long-term goals — not just name recognition or rankings. Every university on your list is one that actually fits where you want to go next.',
    tint: { bg: 'bg-primary-600', glow: 'bg-primary-200' },
  },
  {
    icon: Search,
    image: '/hat-book-3d-illustration_13391082.webp',
    title: 'University & Course Matching',
    desc: 'We shortlist verified universities and programs that fit your profile and career plans, factoring in tuition, IELTS/GPA requirements, and course structure, so every option you see is one you can realistically get into.',
    detail: 'Beyond picking a university, we match you to the right course — factoring in tuition, IELTS/GPA requirements, and course structure, so every programme you see is one you can realistically get into and complete successfully.',
    tint: { bg: 'bg-accent-500', glow: 'bg-accent-200' },
  },
  {
    icon: Banknote,
    image: '/trophy-3d-illustration_13391041.webp',
    title: 'Scholarship Guidance',
    desc: 'Merit-based scholarships, tuition fee waivers of 10-50%, and full-ride government scholarships like Chevening, Fulbright, DAAD, and Stipendium Hungaricum — we help you apply for funding you are eligible for.',
    detail: "We actively search for funding you're eligible for, from university-specific merit scholarships and tuition fee waivers of 10-50%, to competitive full-ride government scholarships like Chevening, Fulbright, DAAD, and Stipendium Hungaricum. We help you understand eligibility, prepare a competitive application, and meet every deadline.",
    tint: { bg: 'bg-ink-700', glow: 'bg-ink-200' },
  },
  {
    icon: Landmark,
    image: '/statement.webp',
    title: 'Bank Support',
    desc: 'Guidance on education loans, blocked/GIC accounts, forex arrangements, and preparing the bank statements and sponsor documentation your visa application actually needs.',
    detail: "Visa applications live or die on financial proof. We guide you through education loan documentation, blocked/GIC accounts where required, forex arrangements, and preparing bank statements and sponsor paperwork in the format your specific embassy expects — so your financial case is solid before you submit.",
    tint: { bg: 'bg-coral-500', glow: 'bg-coral-200' },
  },
  {
    icon: FileCheck2,
    image: '/pencil-red-checkmarks_69732480.webp',
    title: 'Application Assistance',
    desc: 'Expert help crafting SOPs, gathering documents, and submitting a complete, error-free application, including the small requirements first-time applicants usually miss.',
    detail: 'From your Statement of Purpose and Letters of Recommendation to transcripts, portfolios, and the dozens of small supporting documents universities ask for, we help you build a complete, error-free application — and flag the easy-to-miss requirements that trip up most first-time applicants.',
    tint: { bg: 'bg-primary-400', glow: 'bg-primary-100' },
  },
  {
    icon: Stamp,
    image: '/visa-and-ticket-3d-icon-png-download-8304615.webp',
    title: 'Visa Counseling',
    desc: 'We maintain a visa success rate of over 90% through rigorous document verification, financial proof audits, and mock interview sessions, so you walk into your actual interview prepared, not guessing.',
    detail: "Our visa counseling covers document verification, financial-proof audits, and mock interview sessions tailored to your destination country's actual process. We maintain a 90% visa success rate because preparation happens well before your real embassy appointment, not during it.",
    tint: { bg: 'bg-secondary-400', glow: 'bg-secondary-100' },
  },
  {
    icon: PlaneTakeoff,
    image: '/travel.webp',
    title: 'Pre-departure and Arrival Support',
    desc: 'Pre-departure briefings and post-arrival support so you land ready to thrive abroad.',
    detail: 'Before you fly, we walk you through flight booking, accommodation search, and foreign exchange so nothing is left to the last minute. After you land, our support continues — from settling into student life to adjusting to a new country — so the transition feels manageable, not overwhelming.',
    tint: { bg: 'bg-accent-600', glow: 'bg-accent-100' },
  },
];
