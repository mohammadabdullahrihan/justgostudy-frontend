import { useState } from 'react';
import { CheckCircle2, ChevronDown, Circle, Sparkles } from 'lucide-react';

// Shared across Student/Agent/University profile pages — takes the
// { percent, missing } shape from src/utils/profileCompletion.js so the
// scoring logic lives in one place and this stays purely presentational.
const ProfileCompletionBar = ({ percent, missing }) => {
  const [expanded, setExpanded] = useState(false);
  const isComplete = percent >= 100;

  return (
    <div className="bg-white rounded-2xl border border-ink-100/70 shadow-theme-sm p-5 mb-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-secondary-600 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-accent-500 shrink-0" />
          )}
          <p className="font-bold text-ink-900 text-sm">
            {isComplete ? 'Your profile is complete' : 'Complete your profile'}
          </p>
        </div>
        <span className={`text-sm font-extrabold ${isComplete ? 'text-secondary-600' : 'text-primary-600'}`}>
          {percent}%
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-cream-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-secondary-500' : 'bg-primary-600'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {!isComplete && missing.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            {missing.length} field{missing.length === 1 ? '' : 's'} left
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          {expanded && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {missing.map((label) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cream-50 border border-cream-200 px-3 py-1 text-xs font-semibold text-ink-600"
                >
                  <Circle className="w-2.5 h-2.5 text-ink-400" />
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionBar;
