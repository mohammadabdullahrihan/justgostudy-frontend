import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plane, XCircle } from 'lucide-react';
import applicationService from '../../../services/applicationService';
import EmptyState from '../EmptyState';
import { APPLICATION_JOURNEY_STAGES } from '../../../constants/applicationStatusColors';

/**
 * Visual progress for the student's furthest-along application, driven by
 * the application's real `status` (see APPLICATION_JOURNEY_STAGES), not a
 * fabricated progress bar. Rejected is shown as its own terminal state
 * rather than forced into the linear pipeline.
 */
const JourneyTimeline = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    applicationService.getMyApplications()
      .then((res) => {
        if (cancelled) return;
        const apps = Array.isArray(res?.data || res) ? (res?.data || res) : [];
        setApplications(apps);
      })
      .catch((error) => console.error('Error loading applications for journey timeline:', error))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const featured = useMemo(() => {
    if (applications.length === 0) return null;
    const stageIndex = (status) => APPLICATION_JOURNEY_STAGES.findIndex((s) => s.key === status);
    return [...applications].sort((a, b) => {
      const aIdx = a.status === 'rejected' ? -1 : stageIndex(a.status);
      const bIdx = b.status === 'rejected' ? -1 : stageIndex(b.status);
      if (aIdx !== bIdx) return bIdx - aIdx;
      return new Date(b.appliedAt || b.createdAt) - new Date(a.appliedAt || a.createdAt);
    })[0];
  }, [applications]);

  const currentStageIndex = featured && featured.status !== 'rejected'
    ? APPLICATION_JOURNEY_STAGES.findIndex((s) => s.key === featured.status)
    : -1;

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-900">Your Journey</h3>
      <div className="rounded-2xl border border-ink-100/70 bg-white p-6 shadow-theme-sm hover:shadow-theme-md transition-all duration-200">
        {loading ? (
          <div className="h-16 skeleton rounded-xl" />
        ) : !featured ? (
          <EmptyState icon={Plane} message="Your journey timeline will appear here once you submit an application.">
            <Link to="/student/apply" className="mt-3 inline-block text-xs font-semibold text-coral-500 hover:underline">
              Start an application →
            </Link>
          </EmptyState>
        ) : featured.status === 'rejected' ? (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-semibold text-rose-700">This application wasn&apos;t accepted</p>
              {featured.rejectionReason && <p className="mt-0.5 text-xs text-rose-500">{featured.rejectionReason}</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center overflow-x-auto pb-1">
            {APPLICATION_JOURNEY_STAGES.map((stage, idx) => {
              const isDone = idx <= currentStageIndex;
              const isLast = idx === APPLICATION_JOURNEY_STAGES.length - 1;
              return (
                <div key={stage.key} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      isDone ? 'border-primary-600 bg-primary-600 text-white' : 'border-cream-200 bg-white text-ink-600'
                    }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span className={`whitespace-nowrap text-[12px] font-semibold ${isDone ? 'text-ink-900' : 'text-ink-500'}`}>
                      {stage.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`mx-2 h-0.5 flex-1 rounded-full ${idx < currentStageIndex ? 'bg-primary-600' : 'bg-cream-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyTimeline;
