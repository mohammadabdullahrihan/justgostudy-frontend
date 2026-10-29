import { TrendingUp } from 'lucide-react';
import PromoCard from './PromoCard';
import { PROMO_TINTS } from '../../constants/promoTints';

// Cross-sell to the ROI Estimator tool.
const ROIEstimatorPromoBanner = ({ size, orientation, className }) => (
  <PromoCard
    to="/study-abroad/tools/roi-estimator"
    image="/books-and-cup-3d-illustration.webp"
    icon={TrendingUp}
    title="Is this degree worth the cost?"
    subtitle="Estimate your return on investment before you commit"
    tint={PROMO_TINTS.ink}
    size={size}
    orientation={orientation}
    className={className ?? 'mb-8'}
  />
);

export default ROIEstimatorPromoBanner;
