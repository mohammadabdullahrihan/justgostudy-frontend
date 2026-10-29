import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Fixed, left-edge back affordance for exam detail pages (IELTS/PTE/TOEFL/
 * GRE-GMAT). Kept out of the hero's document flow on purpose — as an inline
 * element it collided with each page's differently-shaped hero layout
 * (centered on GRE/GMAT, two-column elsewhere).
 */
const ExamPrepBackLink = () => (
  <Link
    to="/language-club/exam-prep"
    title="Back to Exam Prep"
    className="fixed left-3 sm:left-5 top-24 lg:top-28 z-30 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-white/90 backdrop-blur-md border border-red-100 hover:border-red-300 hover:bg-red-50 rounded-full shadow-md shadow-red-900/5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-red-600 transition-all duration-200"
  >
    <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
    <span className="hidden sm:inline">All Exam Prep Guides</span>
  </Link>
);

export default ExamPrepBackLink;
