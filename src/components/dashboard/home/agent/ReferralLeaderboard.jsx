import { useState, useEffect } from 'react';
import { Trophy, Copy, Share2, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import agentService from '../../../../services/agentService';
import userService from '../../../../services/userService';
import { useAuth } from '../../../../context/AuthContext';

const RANK_STYLES = [
  'bg-accent-100 text-accent-700 border-accent-200',
  'bg-cream-200 text-ink-600 border-cream-300',
  'bg-primary-50 text-primary-600 border-primary-200',
];

/**
 * Real referredBy counts across approved agents (see
 * GET /api/agents/referral-leaderboard), same referral system the student
 * "refer a friend" card writes to. No fabricated ranks or rewards, an agent
 * with 0 referrals just shows 0.
 */
const ReferralLeaderboard = () => {
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [referrals, setReferrals] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    Promise.all([agentService.getReferralLeaderboard(), userService.getMyReferrals()])
      .then(([leaderboardData, referralData]) => {
        if (ignore) return;
        setBoard(leaderboardData);
        setReferrals(referralData);
      })
      .catch(() => {
        if (!ignore) setError(true);
      });
    return () => { ignore = true; };
  }, []);

  const referralLink = referrals?.referralCode
    ? `${window.location.origin}/register?ref=${referrals.referralCode}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Link copied!');
    } catch {
      toast.error('Could not copy link.');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Join Just Go Study through my link: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  if (error) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-ink-100/70 bg-white shadow-theme-lg shadow-primary-500/10 p-6 sm:p-8">
      <div className="inline-flex items-center gap-2 border border-secondary-200 bg-secondary-50 rounded-full px-3 py-1 mb-4">
        <Trophy size={10} className="text-secondary-600" />
        <span className="text-[12px] font-bold tracking-widest uppercase text-secondary-600">Referral Leaderboard</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
        {/* Your link */}
        <div>
          <p className="text-sm text-ink-600 leading-relaxed max-w-md">
            Invite students or partner agents with your link, referrals across the whole platform count toward this board.
          </p>

          {!referrals ? (
            <p className="text-xs text-ink-600 mt-4">Loading your referral link…</p>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 max-w-lg">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  onClick={(e) => e.target.select()}
                  className="flex-1 text-xs sm:text-sm font-mono bg-cream-100 border border-ink-200 rounded-xl px-4 py-3 text-ink-700 truncate outline-none"
                />
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-all"
                  >
                    <Copy size={14} /> Copy Link
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl border border-ink-300 text-ink-700 hover:border-secondary-400 hover:text-secondary-600 transition-all"
                  >
                    <Share2 size={14} /> WhatsApp
                  </button>
                </div>
              </div>
              {board && (
                <p className="text-xs text-ink-600 mt-3">
                  {board.myRank
                    ? `You're ranked #${board.myRank} of ${board.totalAgents} approved agents, with ${board.myReferredCount} referral${board.myReferredCount === 1 ? '' : 's'}.`
                    : `You have ${board.myReferredCount} referral${board.myReferredCount === 1 ? '' : 's'} so far.`}
                </p>
              )}
            </>
          )}
        </div>

        {/* Rank card */}
        <div className="lg:w-48 flex flex-col items-center justify-center gap-2 rounded-xl p-5 border border-primary-200 bg-primary-50 shrink-0">
          <Users size={20} className="text-primary-500" />
          <p className="text-2xl font-extrabold text-ink-900">{board ? board.myReferredCount : '—'}</p>
          <p className="text-[12px] font-bold uppercase tracking-widest text-ink-600 text-center">Your Referrals</p>
        </div>
      </div>

      {/* Top agents */}
      {board?.leaderboard?.length > 0 && (
        <div className="mt-6 divide-y divide-ink-100 border-t border-ink-100/70">
          {board.leaderboard.map((entry, i) => (
            <div
              key={entry.agentId}
              className={`flex items-center gap-3 py-3 ${entry.agentId === user?._id ? 'bg-primary-50/40 -mx-2 px-2 rounded-lg' : ''}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  i < 3 ? RANK_STYLES[i] : 'border-ink-200 bg-cream-100 text-ink-600'
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {entry.name}
                  {entry.agentId === user?._id && <span className="ml-1.5 text-xs font-normal text-primary-500">(You)</span>}
                </p>
                {entry.companyName && <p className="truncate text-xs text-ink-600">{entry.companyName}</p>}
              </div>
              <span className="shrink-0 text-sm font-bold text-ink-700">{entry.referredCount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferralLeaderboard;
