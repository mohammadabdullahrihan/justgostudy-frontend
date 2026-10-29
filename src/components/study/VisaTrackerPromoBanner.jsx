import { Stamp } from 'lucide-react';
import PromoCard from './PromoCard';
import { PROMO_TINTS } from '../../constants/promoTints';

// Cross-sell to the Visa Timeline Tracker tool.
const VisaTrackerPromoBanner = ({ size, orientation, className }) => (
  <PromoCard
    to="/study-abroad/tools/visa-tracker"
    image="/visa-and-ticket-3d-icon-png-download-8304615.webp"
    icon={Stamp}
    title="Track your visa application timeline"
    subtitle="Know exactly what's next and when, step by step"
    tint={PROMO_TINTS.secondary}
    size={size}
    orientation={orientation}
    className={className ?? 'mb-8'}
  />
);

export default VisaTrackerPromoBanner;
