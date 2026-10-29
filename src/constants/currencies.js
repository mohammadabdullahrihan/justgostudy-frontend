// Symbols never change; `rate` here is only the offline fallback used until
// live rates load (or if the exchange-rate API is unreachable). Rates are
// 1 USD = X {code}, since all underlying cost data is stored in USD.
export const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'BDT', symbol: '৳', rate: 117 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'AUD', symbol: 'A$', rate: 1.53 },
  { code: 'CAD', symbol: 'C$', rate: 1.37 },
  { code: 'JPY', symbol: '¥', rate: 157 },
  { code: 'CNY', symbol: '¥', rate: 7.24 },
  { code: 'INR', symbol: '₹', rate: 83.5 },
  { code: 'AED', symbol: 'AED ', rate: 3.67 },
  { code: 'CHF', symbol: 'CHF ', rate: 0.88 },
  { code: 'NZD', symbol: 'NZ$', rate: 1.65 },
  { code: 'KRW', symbol: '₩', rate: 1380 },
  { code: 'MYR', symbol: 'RM', rate: 4.5 },
  { code: 'TRY', symbol: '₺', rate: 35 },
];

export const getCurrencyMeta = (code, liveRates) => {
  const fallback = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
  const liveRate = liveRates?.[code];
  return { ...fallback, rate: typeof liveRate === 'number' ? liveRate : fallback.rate };
};
