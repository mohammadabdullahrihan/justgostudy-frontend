// Real save timestamp (Mongoose's own `updatedAt`) formatted for display —
// never a made-up "verified" date. Used across the University/Destination
// detail pages so every tab can show the same honest freshness signal.
export const formatUpdatedAt = (isoDate) => {
  if (!isoDate) return null;
  try {
    return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return null;
  }
};
