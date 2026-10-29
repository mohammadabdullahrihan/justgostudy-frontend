// Formats a course's tuition fee for display, in the course's own native
// currency (not the USD-normalized tuitionFeeUSD, which exists purely so the
// backend budget filter — feeMin/feeMax in courseController.js — can compare
// fees across the ~19 source currencies (GBP, MYR, AUD, PLN, ...) courses are
// published in). Students should see the real figure the university quotes.
//
// Some courses (mostly executive/PhD programmes whose source research says
// "Varies" or "not published") genuinely have no fee and are stored as 0.
// Showing "0" for those reads as broken data, so they fall back to
// "Fee on request" instead of a fabricated number.
export function formatTuitionUSD(course) {
  const amount = course?.tuitionFee;
  if (!amount) return 'Fee on request';
  const currency = course?.currency || 'USD';
  try {
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(amount) + '/yr'
    );
  } catch {
    // Unknown/invalid ISO currency code slipped into the data — fall back to
    // a plain "CODE amount" rendering rather than letting Intl throw.
    return `${currency} ${amount.toLocaleString()}/yr`;
  }
}

// For callers that render the fallback text at a smaller size than an
// actual dollar amount (e.g. a text-2xl price slot) — "Fee on request" is
// noticeably longer than "$15,000/yr" and reads better a size down.
export function hasTuitionFee(course) {
  return Boolean(course?.tuitionFeeUSD ?? course?.tuitionFee);
}
