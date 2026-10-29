import { useState, useEffect, useMemo } from 'react';
import { Home, Info } from 'lucide-react';
import { getExchangeRates } from '../../services/exchangeRateService';
import { getCurrencyMeta } from '../../constants/currencies';
import { DHAKA_COST_BENCHMARK, dhakaMonthlyTotal } from '../../constants/dhakaCostBenchmark';

const convertAmount = (amount, fromCode, toCode, liveRates) => {
  if (fromCode === toCode) return amount;
  const from = getCurrencyMeta(fromCode, liveRates).rate;
  const to = getCurrencyMeta(toCode, liveRates).rate;
  return amount * (to / from);
};

const formatMoney = (amount, currency) => {
  if (amount == null || Number.isNaN(amount)) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency || ''}`.trim();
  }
};

/**
 * Compares Dhaka's real, sourced monthly living cost (see
 * constants/dhakaCostBenchmark.js) against a destination's own
 * avgLivingCost/12, in the destination's currency, so it reads as a single
 * relatable "back home vs. there" number for Bangladeshi students.
 */
const CostComparisonWidget = ({ country, avgLivingCost, currency }) => {
  const [liveRates, setLiveRates] = useState(null);

  useEffect(() => {
    getExchangeRates()
      .then((rates) => setLiveRates(rates.rates))
      .catch((error) => console.error('Error fetching live exchange rates, using offline rates:', error));
  }, []);

  const destinationCurrency = currency || 'USD';

  const { dhakaMonthly, destinationMonthly, maxValue } = useMemo(() => {
    const dhakaConverted = convertAmount(dhakaMonthlyTotal(), DHAKA_COST_BENCHMARK.currency, destinationCurrency, liveRates);
    const destMonthly = (avgLivingCost || 0) / 12;
    return {
      dhakaMonthly: dhakaConverted,
      destinationMonthly: destMonthly,
      maxValue: Math.max(dhakaConverted, destMonthly, 1),
    };
  }, [liveRates, destinationCurrency, avgLivingCost]);

  if (!avgLivingCost) return null;

  return (
    <div className="rounded-[2rem] border border-cream-100 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-ink-900">
        <Home className="h-5 w-5 text-primary-600" />
        Dhaka vs. {country || 'This Destination'}
      </h3>
      <p className="mb-6 text-sm text-ink-500">Estimated monthly living cost, side by side.</p>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-ink-700">Dhaka</span>
            <span className="font-bold text-ink-900">{formatMoney(dhakaMonthly, destinationCurrency)}/mo</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-cream-100">
            <div className="h-full rounded-full bg-secondary-500" style={{ width: `${Math.max(4, (dhakaMonthly / maxValue) * 100)}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-ink-700">{country || 'Destination'}</span>
            <span className="font-bold text-ink-900">{formatMoney(destinationMonthly, destinationCurrency)}/mo</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-cream-100">
            <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.max(4, (destinationMonthly / maxValue) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-cream-50 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
        <p className="text-xs leading-relaxed text-ink-500">
          Dhaka estimate covers rent, food, transport, and utilities ({DHAKA_COST_BENCHMARK.source}, {DHAKA_COST_BENCHMARK.asOf}). Destination figure is our own average living cost data. Actual costs vary by lifestyle and housing choice.
        </p>
      </div>
    </div>
  );
};

export default CostComparisonWidget;
