// Official IELTS Academic/General Training raw-score → band conversion.
// Listening and Reading are marked out of 40 questions; each has its own
// published conversion table (Reading Academic differs slightly from
// Listening, per IELTS's own scoring guidance).
// Source: IELTS official band score descriptors (ielts.org).

export const LISTENING_BAND_TABLE = [
  { min: 39, max: 40, band: 9 },
  { min: 37, max: 38, band: 8.5 },
  { min: 35, max: 36, band: 8 },
  { min: 32, max: 34, band: 7.5 },
  { min: 30, max: 31, band: 7 },
  { min: 26, max: 29, band: 6.5 },
  { min: 23, max: 25, band: 6 },
  { min: 18, max: 22, band: 5.5 },
  { min: 16, max: 17, band: 5 },
  { min: 13, max: 15, band: 4.5 },
  { min: 10, max: 12, band: 4 },
  { min: 7, max: 9, band: 3.5 },
  { min: 5, max: 6, band: 3 },
  { min: 3, max: 4, band: 2.5 },
  { min: 0, max: 2, band: 2 },
];

// Reading Academic conversion (slightly stricter at the top end than Listening).
export const READING_ACADEMIC_BAND_TABLE = [
  { min: 39, max: 40, band: 9 },
  { min: 37, max: 38, band: 8.5 },
  { min: 35, max: 36, band: 8 },
  { min: 33, max: 34, band: 7.5 },
  { min: 30, max: 32, band: 7 },
  { min: 27, max: 29, band: 6.5 },
  { min: 23, max: 26, band: 6 },
  { min: 19, max: 22, band: 5.5 },
  { min: 15, max: 18, band: 5 },
  { min: 13, max: 14, band: 4.5 },
  { min: 10, max: 12, band: 4 },
  { min: 8, max: 9, band: 3.5 },
  { min: 6, max: 7, band: 3 },
  { min: 4, max: 5, band: 2.5 },
  { min: 0, max: 3, band: 2 },
];

export const rawToBand = (raw, table) => {
  const clamped = Math.max(0, Math.min(40, Number(raw) || 0));
  const row = table.find((r) => clamped >= r.min && clamped <= r.max);
  return row ? row.band : 0;
};

// Official IELTS rounding: average rounds to the nearest whole or half band,
// with .25 rounding up to the next half and .75 rounding up to the next whole.
export const roundOverallBand = (average) => {
  const remainder = average % 1;
  const whole = Math.floor(average);
  if (remainder < 0.25) return whole;
  if (remainder < 0.75) return whole + 0.5;
  return whole + 1;
};
