import { Compass } from 'lucide-react';
import PromoCard from './PromoCard';
import { PROMO_TINTS } from '../../constants/promoTints';

// Cross-sell to the "Which Country Fits You?" quiz — best shown on pages
// where a student hasn't committed to a destination yet (e.g. Destinations
// listing, homepage), not on a page already about one specific country.
const CountryMatchQuizPromoBanner = ({ size, orientation, className }) => (
  <PromoCard
    to="/study-abroad/tools/country-match-quiz"
    image="/hat-map-icon.webp"
    icon={Compass}
    title="Not sure where to study yet?"
    subtitle="Take our free quiz to find countries that fit your budget and goals"
    tint={PROMO_TINTS.coral}
    size={size}
    orientation={orientation}
    className={className ?? 'mb-8'}
  />
);

export default CountryMatchQuizPromoBanner;
