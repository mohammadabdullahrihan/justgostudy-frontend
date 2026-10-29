import { motion, AnimatePresence } from 'framer-motion';
import Seo from '../components/common/Seo';
import AboutHero from '../components/about/AboutHero';
import AboutStorySection from './about/AboutStorySection';
import FeaturesSection from '../components/about/FeaturesSection';
import MessageFromMD from '../components/about/MessageFromMD';
import MeetTheTeam from '../components/about/MeetTheTeam';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

const AboutUs = () => {
  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen bg-cream-50"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <Seo
          title="Best Study Abroad & Immigration Consultancy in Bangladesh - Just Go Study"
          description="Learn about Just Go Study's mission, team, and track record helping Bangladeshi students study abroad through free, expert guidance and a wide university network."
        />
        <AboutHero />
        <AboutStorySection />
        <FeaturesSection />
        <MessageFromMD />
        <MeetTheTeam />
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutUs;
