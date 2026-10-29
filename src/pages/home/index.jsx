import { useState, useEffect, useCallback } from 'react';
import { getTestimonials } from '../../services/studyService';
import { countryFlagMap } from '../../constants/countries';
import Seo from '../../components/common/Seo';

import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import WhyChooseSection from './WhyChooseSection';
import WhatMakesUsDifferent from '../../components/about/WhatMakesUsDifferent';
import WhyTrustUsSection from './WhyTrustUsSection';
import StudyAbroadCTA from './StudyAbroadCTA';
import ToolsTeaserSection from './ToolsTeaserSection';
import ScholarshipSection from './ScholarshipSection';
import LanguageClubPromo from '../../components/home/LanguageClubPromo';
import RecentPlacementsTicker from '../../components/home/RecentPlacementsTicker';
import AboutIntroSection from '../../components/home/AboutIntroSection';
import UniversitySection from './UniversitySection';
import DestinationsSection from './DestinationsSection';
import HowWeHelpSection from './HowWeHelpSection';
import TestimonialsSection from './TestimonialsSection';
import TeamSection from './TeamSection';
import CertificationsSection from './CertificationsSection';
import SuccessSection from './SuccessSection';
import FAQSection from './FAQSection';
import NewsSection from './NewsSection';
import FreeCounsellingSection from './FreeCounsellingSection';
import PartnersSection from './PartnersSection';

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestimonials = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTestimonials(params);
      const normalized = Array.isArray(response) ? response.map(t => ({
        ...t,
        name: t.studentName || t.name,
        stars: t.stars || 5,
        flagCode: t.flagCode || countryFlagMap[t.country] || '',
      })) : [];
      setTestimonials(normalized);
    } catch (err) {
      setError(err.message || 'Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials({ limit: 50, activeOnly: 'true' });
  }, [fetchTestimonials]);

  return (
    <div className="w-full">
      <Seo
        title="Just Go Study: Best Education Consultancy in Bangladesh"
        description="Just Go Study is Bangladesh's trusted study abroad consultancy, helping students get admitted to top universities in the UK, USA, Canada, Australia and more with free expert counselling."
      />
      <HeroSection testimonials={testimonials} />
      <AboutIntroSection />
      <RecentPlacementsTicker />
      <StatsSection />

      <HowWeHelpSection />

      <DestinationsSection />

      <UniversitySection />

      <WhyChooseSection />

      <WhatMakesUsDifferent />

      <WhyTrustUsSection />

      <StudyAbroadCTA />

      <ToolsTeaserSection />

      <ScholarshipSection />

      <LanguageClubPromo />

      <SuccessSection />

      <TeamSection />

      {/* Disabled pending real, owned accreditation-body logos, the previous
          images were hotlinked from third-party sites (including a Google
          Images thumbnail cache URL) and asserted specific certifications
          (ICEF/AAIE/NAFSA/PIER/British Council) that could not be verified
          here. See CertificationsSection.jsx. */}
      {/* <CertificationsSection /> */}

      <TestimonialsSection
        testimonials={testimonials}
        loading={loading}
        error={error}
      />

      <FAQSection />

      <NewsSection />

      <FreeCounsellingSection />

      <PartnersSection />
    </div>
  );
};

export default Home;
