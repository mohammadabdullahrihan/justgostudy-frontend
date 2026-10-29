import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import * as studyService from '../../services/studyService';
import PromoCard from './PromoCard';
import { PROMO_TINTS } from '../../constants/promoTints';

// Eye-catching cross-sell: shown on University/Course/Country detail pages
// so a student also notices that country's real, verified scholarships
// (same data as the Scholarships tab on that country's guide) — not a
// separate/invented scholarship of our own.
const ScholarshipPromoBanner = ({ country, size, className }) => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!country) return;
    let ignore = false;
    studyService
      .getScholarshipsByCountry(country)
      .then((data) => {
        if (!ignore) setCount(data?.scholarshipsData?.length || 0);
      })
      .catch(() => {
        if (!ignore) setCount(0);
      });
    return () => { ignore = true; };
  }, [country]);

  if (!count) return null;

  return (
    <PromoCard
      to={`/study-abroad/destination/${encodeURIComponent(country)}?tab=scholarships`}
      image="/trophy-3d-illustration_13391041.webp"
      icon={Award}
      title={`${count}+ scholarship${count > 1 ? 's' : ''} available for studying in ${country}`}
      subtitle="See the full list and check your eligibility"
      tint={PROMO_TINTS.accent}
      size={size}
      className={className ?? 'mb-8'}
    />
  );
};

export default ScholarshipPromoBanner;
