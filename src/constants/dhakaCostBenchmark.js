// Real, sourced monthly cost-of-living benchmark for Dhaka, used to give
// Bangladeshi students a relatable "back home" reference point next to a
// destination's own avgLivingCost. Figures are estimates, not guarantees,
// actual spend varies by lifestyle, roommates, and neighborhood.
// Source: Numbeo (numbeo.com/cost-of-living/in/Dhaka), retrieved July 2026.

export const DHAKA_COST_BENCHMARK = {
  currency: 'BDT',
  asOf: '2026-07',
  source: 'Numbeo',
  sourceUrl: 'https://www.numbeo.com/cost-of-living/in/Dhaka',
  monthly: {
    rent: 18313, // 1-bedroom apartment, city centre
    food: 3250, // groceries for one person, modest budget
    transport: 3000, // monthly public transport pass
    utilities: 5566, // electricity, water, garbage for a standard apartment
  },
};

export const dhakaMonthlyTotal = () => {
  const { rent, food, transport, utilities } = DHAKA_COST_BENCHMARK.monthly;
  return rent + food + transport + utilities;
};
