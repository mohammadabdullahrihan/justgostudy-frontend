import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import * as statsService from '../../services/statsService';

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
};

// Real data only — an empty response means nothing renders, no placeholder
// or fabricated entries (see statsController.getRecentPlacements).
const RecentPlacementsTicker = () => {
  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    let ignore = false;
    statsService.getRecentPlacements()
      .then((data) => { if (!ignore && Array.isArray(data)) setPlacements(data); })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  if (placements.length === 0) return null;

  const track = [...placements, ...placements];

  return (
    <div className="bg-primary-50 border-y border-primary-100 py-3 overflow-hidden">
      <div className="flex animate-[scroll_30s_linear_infinite] gap-10 whitespace-nowrap w-max">
        {track.map((p, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
            <Sparkles className="w-4 h-4 text-accent-500 shrink-0" />
            {p.firstName} got into <strong>{p.university}</strong> ({p.country}) &middot; {timeAgo(p.when)}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default RecentPlacementsTicker;
