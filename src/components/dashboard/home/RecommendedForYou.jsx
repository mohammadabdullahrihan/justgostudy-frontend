import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, GraduationCap, ArrowRight } from 'lucide-react';
import studentService from '../../../services/studentService';
import * as studyService from '../../../services/studyService';
import EmptyState from '../EmptyState';

const formatMoney = (amount, currency) => {
  if (amount == null || Number.isNaN(amount)) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
};

/**
 * Matches the student's own saved preferences (desiredCountry, budget,
 * degreeLevels from /profile/study-preferences) against real StudyProgram
 * data, no fabricated suggestions, and an honest empty state pointing to the
 * preferences page when nothing has been saved yet.
 */
const RecommendedForYou = () => {
  const [profile, setProfile] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const profileData = await studentService.getMyStudentProfile();
        if (cancelled) return;
        setProfile(profileData);

        const hasPreferences = (profileData?.desiredCountry?.length > 0) || (profileData?.studyPreferences?.degreeLevels?.length > 0);
        if (hasPreferences) {
          const res = await studyService.getStudyPrograms();
          if (!cancelled) setPrograms(Array.isArray(res?.data) ? res.data : []);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const matches = useMemo(() => {
    if (!profile) return [];
    const desiredCountries = (profile.desiredCountry || []).map((c) => c.toLowerCase());
    const desiredLevels = (profile.studyPreferences?.degreeLevels || []).map((l) => l.toLowerCase());
    const budget = profile.studyPreferences?.budget;

    return programs
      .filter((p) => {
        const countryOk = desiredCountries.length === 0 || desiredCountries.includes((p.country || '').toLowerCase());
        const levelOk = desiredLevels.length === 0 || desiredLevels.includes((p.level || '').toLowerCase());
        const budgetOk = !budget || !p.tuitionFee || p.tuitionFee <= budget * 1.4;
        return countryOk && levelOk && budgetOk;
      })
      .slice(0, 4);
  }, [profile, programs]);

  const hasPreferences = (profile?.desiredCountry?.length > 0) || (profile?.studyPreferences?.degreeLevels?.length > 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-ink-900">
          <Sparkles size={14} className="text-primary-500" /> Recommended for You
        </h3>
        <Link to="/profile/study-preferences" className="text-xs font-semibold text-coral-600 hover:underline">
          Edit preferences
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-ink-100/70 bg-white shadow-theme-sm hover:shadow-theme-md transition-all duration-200">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : !hasPreferences ? (
          <EmptyState icon={GraduationCap} message="Set your study preferences to get personalized recommendations.">
            <Link to="/profile/study-preferences" className="mt-3 inline-block text-xs font-semibold text-coral-600 hover:underline">
              Set my preferences →
            </Link>
          </EmptyState>
        ) : matches.length === 0 ? (
          <EmptyState icon={GraduationCap} message="No programs match your preferences yet. Try widening your budget or countries." />
        ) : (
          <div className="divide-y divide-ink-100">
            {matches.map((program, idx) => (
              <Link
                key={program._id}
                to={`/study-abroad/destination/${encodeURIComponent(program.country)}`}
                className={`flex items-center justify-between gap-3 p-4 transition-colors hover:bg-primary-50/40 ${idx % 2 === 1 ? 'bg-cream-50/60' : ''}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{program.title}</p>
                  <p className="mt-0.5 text-sm text-ink-600">
                    {program.university?.name || program.country} · {formatMoney(program.tuitionFee, program.currency)}/yr
                  </p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-primary-500" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedForYou;
