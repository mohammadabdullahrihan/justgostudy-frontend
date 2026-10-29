// ISO 3166-1 alpha-2 codes, used to build flagcdn.com image URLs
// (`https://flagcdn.com/w80/{code}.png`) across every tool that shows a
// country flag (Cost Calculator, ROI Estimator, Visa Tracker, Comparison
// Tool). Kept as the single source of truth so a country only needs its
// code added here once, not separately in every tool.
export const countryFlagMap = {
  'UK': 'gb',
  'United Kingdom': 'gb',
  'England': 'gb',
  'USA': 'us',
  'United States': 'us',
  'Canada': 'ca',
  'Australia': 'au',
  'Germany': 'de',
  'France': 'fr',
  'Ireland': 'ie',
  'Sweden': 'se',
  'Finland': 'fi',
  'Malaysia': 'my',
  'Turkey': 'tr',
  'Netherlands': 'nl',
  'Japan': 'jp',
  'Singapore': 'sg',
  'Spain': 'es',
  'Italy': 'it',
  'Switzerland': 'ch',
  'Denmark': 'dk',
  'Norway': 'no',
  'New Zealand': 'nz',
  'UAE': 'ae',
  'Poland': 'pl',
  'Hungary': 'hu',
  'Portugal': 'pt',
  'Albania': 'al',
  'Argentina': 'ar',
  'Austria': 'at',
  'Bahrain': 'bh',
  'Belgium': 'be',
  'Bosnia and Herzegovina': 'ba',
  'Brazil': 'br',
  'Bulgaria': 'bg',
  'Chile': 'cl',
  'China': 'cn',
  'Croatia': 'hr',
  'Cyprus': 'cy',
  'Czech Republic': 'cz',
  'Egypt': 'eg',
  'Estonia': 'ee',
  'Fiji': 'fj',
  'Greece': 'gr',
  'Hong Kong': 'hk',
  'Iceland': 'is',
  'India': 'in',
  'Indonesia': 'id',
  'Jordan': 'jo',
  'Kuwait': 'kw',
  'Latvia': 'lv',
  'Lebanon': 'lb',
  'Lithuania': 'lt',
  'Luxembourg': 'lu',
  'Malta': 'mt',
  'Mauritius': 'mu',
  'Mexico': 'mx',
  'Montenegro': 'me',
  'Nepal': 'np',
  'North Macedonia': 'mk',
  'Oman': 'om',
  'Philippines': 'ph',
  'Qatar': 'qa',
  'Romania': 'ro',
  'Saudi Arabia': 'sa',
  'Serbia': 'rs',
  'Slovakia': 'sk',
  'Slovenia': 'si',
  'South Africa': 'za',
  'South Korea': 'kr',
  'Sri Lanka': 'lk',
  'Taiwan': 'tw',
  'Thailand': 'th',
  'Vietnam': 'vn',
};

// Builds a flagcdn.com URL for a country name using the map above,
// falling back to the neutral "UN" flag for anything not yet listed.
export const flagUrlFor = (country, width = 80) =>
  `https://flagcdn.com/w${width}/${(countryFlagMap[country] || 'un').toLowerCase()}.png`;

// SVG variant — vector, so it stays sharp at any size/DPI instead of the
// raster PNG above softening on retina displays. Use wherever the flag is
// shown small (chips, tiles); keep flagUrlFor for spots that want a fixed
// raster width.
export const flagSvgUrlFor = (country) =>
  `https://flagcdn.com/${(countryFlagMap[country] || 'un').toLowerCase()}.svg`;

// De-duplicated country list derived from countryFlagMap above (keeps the
// first name seen per ISO code, e.g. "UK" over the "United Kingdom"/"England"
// aliases) — the single reusable ~70-country list for any multi-select that
// needs country names + flags (e.g. Register.jsx's "Source Country" field).
// Kept derived, not hand-duplicated, so adding a country only means adding
// one line above.
export const countryList = (() => {
  const seenCodes = new Set();
  const list = [];
  for (const [name, code] of Object.entries(countryFlagMap)) {
    if (seenCodes.has(code)) continue;
    seenCodes.add(code);
    list.push(name);
  }
  return list.sort((a, b) => a.localeCompare(b));
})();
