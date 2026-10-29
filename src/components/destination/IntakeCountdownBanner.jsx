import { Clock } from 'lucide-react';

/**
 * Only renders when a genuine future `deadline` Date exists on the program
 * (see StudyProgram.intakeDeadlines, admin-entered). No fabricated dates or
 * always-on urgency, if nothing's set, this renders nothing.
 */
const IntakeCountdownBanner = ({ intakeDeadlines, className = '' }) => {
  const now = Date.now();
  const upcoming = (intakeDeadlines || [])
    .map((d) => ({ ...d, time: new Date(d.deadline).getTime() }))
    .filter((d) => !Number.isNaN(d.time) && d.time > now)
    .sort((a, b) => a.time - b.time)[0];

  if (!upcoming) return null;

  const daysLeft = Math.ceil((upcoming.time - now) / (1000 * 60 * 60 * 24));

  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-accent-200 bg-accent-50 px-5 py-3.5 ${className}`}>
      <Clock className="h-5 w-5 shrink-0 text-accent-600" />
      <p className="text-sm font-semibold text-ink-800">
        {upcoming.season} intake closes in <span className="font-bold text-accent-700">{daysLeft} day{daysLeft === 1 ? '' : 's'}</span>
        <span className="ml-1 font-normal text-ink-500">({new Date(upcoming.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</span>
      </p>
    </div>
  );
};

export default IntakeCountdownBanner;
