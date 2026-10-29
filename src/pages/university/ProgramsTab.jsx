import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, GraduationCap, ExternalLink, MapPin, Clock,
  Calendar, Award, Trophy, Building2, ArrowRight,
} from 'lucide-react';
import { EmptyState } from '../../components/study/DetailsPageKit';
import { formatTuitionUSD, hasTuitionFee } from '../../utils/formatTuition';

// Solid brand-navy ring that fades in on card hover — mirrors the /courses grid.
const HOVER_RING = {
  background: 'linear-gradient(135deg, #0e1f6d, #3454e5)',
};

// Below this, the course list is real but known-incomplete (matches the
// 8-course research floor used when collecting this data) — worth telling
// the student rather than letting a short list look final.
const COURSE_COUNT_FLOOR = 8;

// `course.level` is free text scraped per-university (e.g. "Postgraduate
// (Master of Business Administration)", "Undergraduate/Diploma",
// "Certificate (pathway)"), not an enum — so tabs match by keyword rather
// than exact value, same approach the backend's /courses?level= filter uses
// (case-insensitive substring). A course can legitimately match more than
// one tab (e.g. "Undergraduate/Postgraduate" shows under both), which is
// correct, not a bug. Order mirrors the site-wide level taxonomy used on
// the /courses page (Foundation → Diploma → Undergraduate → Graduate).
const PROGRAM_LEVEL_TABS = [
  { id: 'All', label: 'All Programs', keywords: null },
  { id: 'Foundation', label: 'Foundation', keywords: ['foundation', 'pathway', 'preparat', 'pre-degree'] },
  { id: 'Diploma', label: 'Diploma', keywords: ['diploma', 'certificate'] },
  { id: 'Undergraduate', label: 'Undergraduate', keywords: ['undergraduate', 'bachelor'] },
  { id: 'Graduate', label: 'Graduate', keywords: ['postgraduate', 'master', 'doctoral', 'phd', 'professional'] },
];

const matchesLevelTab = (courseLevel, tab) => {
  if (!tab.keywords) return true; // "All Programs"
  const level = (courseLevel || '').toLowerCase();
  return tab.keywords.some((kw) => level.includes(kw));
};

const UniversityProgramsTab = ({ university, courses }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevelTab, setActiveLevelTab] = useState('All');

  const activeTab = PROGRAM_LEVEL_TABS.find((t) => t.id === activeLevelTab) || PROGRAM_LEVEL_TABS[0];
  const levelFilteredCourses = courses.filter((course) => matchesLevelTab(course.level, activeTab));
  const filteredCourses = levelFilteredCourses.filter((course) =>
    (course.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.level || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const websiteLink = university?.website ? (
    <a
      href={university.website}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-primary-600 font-bold hover:underline"
    >
      Visit {university.name}&apos;s official site <ExternalLink className="w-4 h-4" />
    </a>
  ) : null;

  if (courses.length === 0) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-ink-900 flex items-center gap-4">
          <div className="w-2 h-8 bg-primary-600 rounded-full" />
          Available Programs
        </h2>
        <EmptyState
          icon={GraduationCap}
          title="Course List Not Available Yet"
          message={`We haven't verified ${university?.name || 'this institute'}'s course catalogue yet. ${websiteLink ? "Check their official site for the latest programmes and fees, or " : ''}ask a consultant to look into it for you.`}
          ctaLabel="Ask a Consultant"
        />
        {websiteLink && <div className="text-center">{websiteLink}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-2xl font-bold text-ink-900 flex items-center gap-4">
          <div className="w-2 h-8 bg-primary-600 rounded-full" />
          Available Programs
        </h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-ink-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-primary-600 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PROGRAM_LEVEL_TABS.map((tab) => {
          const count = tab.keywords
            ? courses.filter((course) => matchesLevelTab(course.level, tab)).length
            : courses.length;
          const isActive = activeLevelTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveLevelTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-theme-sm'
                  : 'bg-white text-ink-600 border border-ink-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {tab.label}
              <span className={`text-xs font-extrabold ${isActive ? 'text-white/70' : 'text-ink-400'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {courses.length < COURSE_COUNT_FLOOR && (
        <div className="bg-cream-50 border border-cream-200 rounded-2xl px-6 py-4 text-sm font-medium text-ink-600">
          {university?.totalProgramsOffered > courses.length ? (
            <>
              Showing {courses.length} popular programme{courses.length === 1 ? '' : 's'} — {university.name} offers{' '}
              {university.totalProgramsOffered}+ programmes in total.{' '}
            </>
          ) : (
            <>
              Showing {courses.length} verified programme{courses.length === 1 ? '' : 's'} — this institute offers more than we&apos;ve listed here.{' '}
            </>
          )}
          {websiteLink || 'Ask a consultant for the full course list.'}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const uniLogo = university?.logo;
          const ranking = university?.ranking;
          const city = university?.location;
          const country = university?.country || 'Global';
          const location = city && country ? `${city}, ${country}` : country;
          const hasScholarships = university?.scholarshipsData?.length > 0;
          const intakes = course.intake?.filter(Boolean).slice(0, 2) || [];
          const requirements = course.requirements?.filter(Boolean).slice(0, 3) || [];

          return (
            <div
              key={course._id}
              className="group relative h-full transition-transform duration-300 hover:-translate-y-1.5 will-change-transform"
            >
              {/* solid brand-navy ring, fades in on hover */}
              <div
                className="pointer-events-none absolute -inset-[2px] rounded-[1.6rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={HOVER_RING}
              />

              <div className="relative flex h-full flex-col rounded-[1.5rem] border border-cream-100 bg-white p-3 shadow-theme-sm transition-shadow duration-300 group-hover:shadow-theme-lg">
                {/* Thumbnail */}
                <div className="relative">
                  <Link to={`/study-abroad/course/${course._id}`} className="block overflow-hidden rounded-[1.15rem]">
                    <div className="h-36 w-full overflow-hidden bg-white">
                      {uniLogo ? (
                        <img
                          src={uniLogo}
                          alt={`${university?.name || 'University'} logo`}
                          loading="lazy"
                          className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-400 transition-transform duration-700 group-hover:scale-105">
                          <GraduationCap className="h-9 w-9 text-white/70" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {ranking && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-ink-900 shadow-theme-md">
                      <Trophy className="h-3 w-3 fill-ink-900" />
                      QS #{ranking}
                    </span>
                  )}

                  <span className="absolute right-3 top-3 rounded-full bg-accent-100 px-3 py-1.5 text-xs font-bold text-accent-900 shadow-theme-sm">
                    {course.level}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                  {/* Location + Duration */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-200 bg-cream-50/70 px-3 py-1 text-xs font-bold text-ink-700">
                      <MapPin className="h-3.5 w-3.5 text-primary-500" />
                      <span className="line-clamp-1">{location}</span>
                    </span>
                    {course.duration && (
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-ink-500">
                        <Clock className="h-3.5 w-3.5" />
                        {course.duration}
                      </span>
                    )}
                  </div>

                  {/* Intake + Scholarship chips */}
                  {(intakes.length > 0 || hasScholarships) && (
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                      {intakes.map((it, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700">
                          <Calendar className="h-3 w-3" />
                          {it}
                        </span>
                      ))}
                      {hasScholarships && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <Award className="h-3 w-3" />
                          Funding
                        </span>
                      )}
                    </div>
                  )}

                  {/* Title */}
                  <Link to={`/study-abroad/course/${course._id}`} className="group/title block">
                    <h3 className="mb-1.5 line-clamp-2 text-lg font-extrabold leading-snug text-ink-900 transition-colors group-hover/title:text-primary-600">
                      {course.name}
                    </h3>
                  </Link>

                  {/* University */}
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-500">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-1">{university?.name || 'University'}</span>
                  </p>

                  {/* Short description — 2 lines max */}
                  {course.description?.trim() && (
                    <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-ink-500">
                      {course.description.trim()}
                    </p>
                  )}

                  {/* Entry requirements preview */}
                  {requirements.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {requirements.map((req, i) => (
                        <p key={i} className="flex items-start gap-1.5 text-[11px] text-ink-500">
                          <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-primary-400" />
                          <span className="line-clamp-1">{req}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Spacer so Tuition/IELTS always sit at bottom */}
                  <div className="mt-auto" />

                  <div className="my-3 border-t border-dashed border-cream-200" />

                  {/* Price + IELTS */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-ink-500">Tuition</p>
                      <p className={`font-extrabold leading-none text-ink-900 ${hasTuitionFee(course) ? 'text-2xl' : 'text-base'}`}>
                        {formatTuitionUSD(course)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-ink-500">IELTS</p>
                      <p className="text-xl font-extrabold leading-none text-primary-600">{course.ieltsRequirement || '6.5'}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/student/apply?courseId=${course._id}&universityId=${university?._id || ''}`}
                    className="relative mt-4 block rounded-full bg-primary-600 py-3 text-center text-sm font-bold uppercase tracking-widest text-white shadow-theme-md transition-all hover:bg-primary-500"
                  >
                    Enroll Course
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {filteredCourses.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-ink-200">
            <Search className="w-12 h-12 text-ink-200 mx-auto mb-4" />
            <p className="text-ink-500 font-bold">
              {searchQuery
                ? 'No courses found matching your search.'
                : `No ${activeTab.label.toLowerCase()} programmes listed for this university yet.`}
            </p>
          </div>
        )}
      </div>

      {university?._id && filteredCourses.length > 0 && (
        university.website ? (
          <a
            href={university.website}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border-2 border-dashed border-primary-200 bg-primary-50/40 px-8 py-10 text-center transition-all hover:border-primary-400 hover:bg-primary-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-theme-md transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6" />
            </div>
            <p className="font-outfit text-lg font-bold text-ink-900">
              Explore all programs on {university.name}&apos;s official site
            </p>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition-colors group-hover:bg-primary-500">
              See More
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        ) : (
          <Link
            to={`/study-abroad/courses?universityId=${university._id}`}
            className="group flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border-2 border-dashed border-primary-200 bg-primary-50/40 px-8 py-10 text-center transition-all hover:border-primary-400 hover:bg-primary-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-theme-md transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6" />
            </div>
            <p className="font-outfit text-lg font-bold text-ink-900">
              Explore all programs from {university.name}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition-colors group-hover:bg-primary-500">
              See More
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )
      )}
    </div>
  );
};

export default UniversityProgramsTab;
