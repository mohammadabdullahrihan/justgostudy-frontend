/* Rewrites a remote image URL to ask the CDN for a width-capped, auto-format
   copy. Unknown hosts (and admin uploads already sized on the way in) are
   returned untouched, so it is always safe to pass an arbitrary URL through.

   Callers must request the SAME width for the same image if they want a cache
   hit, the width is part of the URL, so w_400 and w_800 are two downloads. */
export const getOptimizedUrl = (url, width = 600) => {
  if (!url) return url;
  if (url.includes('images.pexels.com')) {
    /* Params get REPLACED, not appended. Pexels honours the first `w` it sees,
       so appending to a URL that already carries one (seeded URLs used to ship
       `h=650&w=940`) silently pinned every image to 940px however much we
       asked for. `h` has to go too, or it caps the height and the width never
       lands. */
    try {
      const u = new URL(url);
      u.searchParams.delete('h');
      u.searchParams.set('auto', 'compress');
      u.searchParams.set('cs', 'tinysrgb');
      u.searchParams.set('w', String(width));
      return u.toString();
    } catch {
      return url;
    }
  }
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?w=${width}&q=80&auto=format&fit=crop`;
  }
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
  }
  return url;
};

// Gallery images arrive either as bare URL strings or as { url, caption }.
export const srcOf = (img) => (typeof img === 'string' ? img : img?.url);
