import Seo from '../../components/common/Seo';
import SAHeroSection from './SAHeroSection';
import AboutIntroSection from '../../components/home/AboutIntroSection';
import SAUniversitiesSection from './SAUniversitiesSection';
import SATestimonialsSection from './SATestimonialsSection';
import SAProcessSection from './SAProcessSection';
import SAServicesSection from './SAServicesSection';
import LanguageClubPromo from '../../components/home/LanguageClubPromo';

const StudyAbroadHome = () => {
  return (
    <div className="w-full">
      <Seo
        title="Study Abroad Programs - Just Go Study"
        description="Discover study abroad programs, destinations, and universities with Just Go Study. Free counselling, application support, and visa guidance for Bangladeshi students."
      />
      <SAHeroSection />
      <AboutIntroSection />
      <SAUniversitiesSection />
      <SATestimonialsSection />
      <SAProcessSection />
      <LanguageClubPromo />
      <SAServicesSection />
    </div>
  );
};

export default StudyAbroadHome;
