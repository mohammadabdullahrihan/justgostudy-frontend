import { useState, useEffect } from 'react';
import successService from '../../services/successService';
import { getTestimonials } from '../../services/studyService';
import { fallbackStats, fallbackTestimonials } from './data';
import Seo from '../../components/common/Seo';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import WhySection from './WhySection';
import JourneySection from './JourneySection';
import DestinationsSection from '../home/DestinationsSection';
import StoriesSection from './StoriesSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';

const OurSuccess = () => {
  const [stats, setStats] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchSuccessStories = async () => {
      try {
        const [successRes, testimonialRes] = await Promise.allSettled([
          successService.getAllSuccess(),
          getTestimonials({ activeOnly: 'true', limit: 50 }),
        ]);

        if (successRes.status === 'fulfilled' && successRes.value.data?.length > 0) {
          setStats(successRes.value.data);
        } else {
          setStats(fallbackStats);
        }

        if (testimonialRes.status === 'fulfilled' && Array.isArray(testimonialRes.value) && testimonialRes.value.length > 0) {
          setTestimonials(testimonialRes.value);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchSuccessStories();
  }, []);

  return (
    <div className="bg-cream-50 font-sans text-ink-900 selection:bg-primary-100 selection:text-primary-700">
      <Seo
        title="Student Success Stories - Just Go Study"
        description="Real success stories from Bangladeshi students who studied abroad with Just Go Study. See the destinations and universities they chose."
      />
      <HeroSection stats={stats} />
      <StatsSection stats={stats} />
      <WhySection />
      <JourneySection />
      <DestinationsSection />
      <StoriesSection testimonials={testimonials} />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default OurSuccess;
