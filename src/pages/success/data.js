import {
  Search, PenLine, IdCard, PlaneLanding,
  Compass, FileCheck, Building2, HeartHandshake,
  ShieldCheck, GraduationCap, Clock,
} from 'lucide-react';
import {
  FALLBACK_STUDENTS_PLACED,
  FALLBACK_PARTNER_UNIVERSITIES,
  FALLBACK_SUCCESS_RATE,
  FALLBACK_COUNTRIES_COVERED,
} from '../../constants/successStats';

// Vertical timeline steps (JourneySection), evergreen, never fetched.
export const journeySteps = [
  { step: '01', title: 'Deep Discovery', desc: 'We look at your profile, goals, and budget to find universities that fit.', align: 'left', icon: Search },
  { step: '02', title: 'Expert Curation', desc: 'We submit your application with carefully prepared SOPs and documents.', align: 'right', icon: PenLine },
  { step: '03', title: 'Visa Mastery', desc: 'Mock interviews and file preparation with our senior visa experts.', align: 'left', icon: IdCard },
  { step: '04', title: 'Global Landing', desc: 'Pre-departure briefings and airport pickup coordination.', align: 'right', icon: PlaneLanding },
];

// Qualitative "why choose us" pillars (WhySection), distinct from the
// numeric KPI bar in StatsSection, not a re-slice of the same stats.
export const whyPillars = [
  { icon: Compass, title: 'Personalized Roadmaps', description: 'Plans based on your own profile, goals, and budget, not a generic template.' },
  { icon: FileCheck, title: 'Visa-Ready Documentation', description: 'Every file prepped and reviewed by senior visa experts before submission.' },
  { icon: Building2, title: '500+ University Network', description: 'Access to top-ranked institutions across 70+ countries.' },
  { icon: HeartHandshake, title: 'Post-Landing Support', description: 'We stay with you after you land, helping with housing and part-time work.' },
];

export const yearsExperience = '2024';

// FAQSection content, evergreen, never fetched.
export const faqs = [
  { q: 'How do I start my application process?', a: 'You can start by booking a free counseling session through our website. Our experts will guide you through the initial assessment of your academic background and goals.', icon: Compass },
  { q: 'What is the success rate for visa approvals?', a: 'We have a 90% success rate for student visas across major destinations like the UK, USA, Canada, and Australia, because we are careful with documentation.', icon: ShieldCheck },
  { q: 'Do you provide scholarship assistance?', a: 'Yes, we help students identify and apply for various merit-based and need-based scholarships offered by universities, which can cover up to 100% of tuition fees.', icon: GraduationCap },
  { q: 'How long does the whole process take?', a: 'The timeline varies by country, but generally, it takes 3-6 months from university application to visa approval. We recommend starting early.', icon: Clock },
];

// Maps a Destination's country name to the languageId key FlagIcon
// (src/components/FlagIcon.jsx) understands — the same hand-drawn circular
// flag set already used across the Language Club. Countries with no match
// are left out on purpose; FlagIcon falls back to a neutral globe icon
// rather than showing a wrong flag.
export const countryFlagIconId = {
  'United Kingdom': 'uk', 'UK': 'uk',
  'USA': 'usa', 'United States': 'usa',
  'Canada': 'canada', 'Australia': 'australia',
  'Germany': 'german', 'Finland': 'finland',
  'Malaysia': 'malay', 'Turkey': 'turkish',
  'France': 'french', 'Netherlands': 'dutch',
  'Japan': 'japanese', 'Italy': 'italian',
  'Spain': 'spanish', 'Switzerland': 'switzerland',
  'Ireland': 'ireland', 'New Zealand': 'newzealand',
  'South Korea': 'korean', 'China': 'chinese',
  'Poland': 'poland', 'Portugal': 'portuguese',
  'Hungary': 'hungary', 'Thailand': 'thai',
  'India': 'hindi', 'UAE': 'uae',
  'Saudi Arabia': 'arabic',
};

// Network-call fallbacks (index.jsx), used only when the live API is
// empty/unreachable, so these mirror real response shapes exactly.
export const fallbackStats = [
  { title: 'Students Placed', value: FALLBACK_STUDENTS_PLACED, icon: 'fa-solid fa-user-graduate', description: 'Students placed in top universities around the world.' },
  { title: 'Universities We Work With', value: FALLBACK_PARTNER_UNIVERSITIES, icon: 'fa-solid fa-university', description: 'Institutions we help students apply to.' },
  { title: 'Success Rate', value: FALLBACK_SUCCESS_RATE, icon: 'fa-solid fa-trophy', description: 'A strong track record of visa and admission approvals.' },
  { title: 'Countries Covered', value: FALLBACK_COUNTRIES_COVERED, icon: 'fa-solid fa-earth-americas', description: 'Helping students reach major study destinations.' },
];

export const fallbackTestimonials = [
  { studentName: 'Rahat Ahmed', quote: '"Just Go Study didn\'t just help with my visa; they helped me find my career path in Data Science in the UK. Truly life-changing experience."', university: 'University of Manchester', country: 'UK', image: '' },
  { studentName: 'Sultana Razia', quote: '"The Canada visa process was effortless with their team."', university: 'Toronto Metropolitan University', country: 'Canada', image: '' },
  { studentName: 'Asif Kabir', quote: '"Professionalism at its best. Got my Swedish visa in record time."', university: 'KTH Royal Institute of Technology', country: 'Sweden', image: '' },
];

export const fallbackDestinations = [
  { country: 'United Kingdom', continent: 'Europe', currency: 'GBP', avgTuition: 20000, avgLivingCost: 14000, description: 'Home to centuries-old universities with degrees recognized worldwide.', image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800' },
  { country: 'USA', continent: 'North America', currency: 'USD', avgTuition: 35000, avgLivingCost: 15000, description: 'The largest and most diverse higher-education system in the world.', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' },
  { country: 'Canada', continent: 'North America', currency: 'CAD', avgTuition: 22000, avgLivingCost: 15000, description: 'Affordable tuition with strong post-study work and PR pathways.', image: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800' },
  { country: 'Australia', continent: 'Oceania', currency: 'AUD', avgTuition: 28000, avgLivingCost: 15000, description: 'Respected research universities and flexible work rights for students.', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800' },
  { country: 'Germany', continent: 'Europe', currency: 'EUR', avgTuition: 1500, avgLivingCost: 12000, description: 'Little to no tuition fees at public universities, even for internationals.', image: 'https://images.unsplash.com/photo-1560930950-5cc20e80e392?w=800' },
  { country: 'France', continent: 'Europe', currency: 'EUR', avgTuition: 3000, avgLivingCost: 12000, description: 'Low-cost public tuition and a long academic history.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
  { country: 'Sweden', continent: 'Europe', currency: 'SEK', avgTuition: 130000, avgLivingCost: 120000, description: 'Research-focused programs with an emphasis on sustainability.', image: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800' },
  { country: 'Malaysia', continent: 'Asia', currency: 'MYR', avgTuition: 25000, avgLivingCost: 18000, description: 'Affordable, English-taught degrees with branch campuses of top universities.', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800' },
  { country: 'Japan', continent: 'Asia', currency: 'JPY', avgTuition: 900000, avgLivingCost: 1200000, description: 'Advanced technology programs in a safe, orderly society.', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
  { country: 'Netherlands', continent: 'Europe', currency: 'EUR', avgTuition: 12000, avgLivingCost: 13000, description: 'One of the highest concentrations of English-taught degree programs.', image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800' },
  { country: 'Italy', continent: 'Europe', currency: 'EUR', avgTuition: 4000, avgLivingCost: 11000, description: 'Historic universities and income-scaled tuition fees.', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
  { country: 'Spain', continent: 'Europe', currency: 'EUR', avgTuition: 6000, avgLivingCost: 11000, description: 'Affordable living and a student-friendly culture.', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800' },
  { country: 'Switzerland', continent: 'Europe', currency: 'CHF', avgTuition: 1500, avgLivingCost: 24000, description: 'Well-known hospitality and technical programs.', image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=800' },
  { country: 'New Zealand', continent: 'Oceania', currency: 'NZD', avgTuition: 25000, avgLivingCost: 15000, description: 'Small class sizes and a relaxed, outdoor-friendly student life.', image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800' },
  { country: 'South Korea', continent: 'Asia', currency: 'KRW', avgTuition: 8000000, avgLivingCost: 9000000, description: 'A growing study destination with both traditional and modern universities.', image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800' },
];
