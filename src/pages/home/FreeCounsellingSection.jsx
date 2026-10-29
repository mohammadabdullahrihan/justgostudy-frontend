import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';
import { fadeInUp, scaleIn } from './animations';

const MagneticButton = ({ to, className, children, strength = 0.35 }) => {
  const ref = useRef(null);
  const quickX = useRef(null);
  const quickY = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    if (!quickX.current) {
      quickX.current = gsap.quickTo(ref.current, 'x', { duration: 0.45, ease: 'power3.out' });
      quickY.current = gsap.quickTo(ref.current, 'y', { duration: 0.45, ease: 'power3.out' });
    }
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    quickX.current(relX * strength);
    quickY.current(relY * strength);
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <Link
      ref={ref}
      to={to}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </Link>
  );
};

const FreeCounsellingSection = () => {
  return (
    <section className="relative mx-3 rounded-[2rem] bg-gradient-to-b from-primary-700 via-primary-700 to-primary-600 pt-20 pb-16 sm:mx-4 sm:rounded-[2.5rem] sm:pt-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={scaleIn}
        >
          <h2 className="font-outfit text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Get a <span className="text-accent-400">Free Counselling</span>
          </h2>
          <motion.p variants={fadeInUp} className="mx-auto mt-5 max-w-xl text-lg text-primary-100">
            Find your ideal study abroad destination, apply, and connect with our expert guidance
            counselors.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10 flex justify-center">
            <MagneticButton
              to="/book-appointment"
              className="inline-flex items-center gap-3 rounded-full bg-primary-500 py-3 pl-8 pr-3 font-bold text-white shadow-theme-md transition-colors duration-200 hover:bg-primary-400"
            >
              Apply Now
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-600">
                <ArrowRight size={18} />
              </span>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FreeCounsellingSection;
