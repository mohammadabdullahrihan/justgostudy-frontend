import { DollarSign } from 'lucide-react';
import PromoCard from './PromoCard';
import { PROMO_TINTS } from '../../constants/promoTints';

// Cross-sell to the Cost Calculator tool — shown wherever a student is
// reading about a country/university/course and might want to see their
// real total cost next. `country` just personalises the copy; the tool
// itself is the same regardless of where this card is dropped.
const CostCalculatorPromoBanner = ({ country, size, orientation, className }) => (
  <PromoCard
    to="/study-abroad/cost-calculator"
    image="/statement.webp"
    icon={DollarSign}
    title={country ? `See your real cost of studying in ${country}` : 'See your real cost of studying abroad'}
    subtitle="Tuition, living costs, and scholarships — all in one estimate"
    tint={PROMO_TINTS.primary}
    size={size}
    orientation={orientation}
    className={className ?? 'mb-8'}
  />
);

export default CostCalculatorPromoBanner;
