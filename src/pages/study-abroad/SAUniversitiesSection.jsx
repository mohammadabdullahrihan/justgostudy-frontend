import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronRight, Building2 } from 'lucide-react';
import { getUniversities } from '../../services/universityService';
import { formatLocation } from '../../utils/formatLocation';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const glowTints = ['bg-accent-200', 'bg-primary-200', 'bg-secondary-200', 'bg-coral-200'];

const UniversityCard = ({ uni, index }) => (
  <Link
    to={`/study-abroad/university/${uni._id}`}
    className="flex flex-col items-center rounded-[28px] border border-white/10 bg-gradient-to-br from-primary-700 to-primary-800 px-6 py-10 text-center shadow-theme-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-theme-lg"
  >
    <div className="relative flex h-28 w-28 items-center justify-center">
      <div className={`absolute inset-0 rounded-full opacity-50 blur-lg ${glowTints[index % glowTints.length]}`} />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-theme-sm ring-1 ring-white/20">
        {uni.logo ? (
          <img loading="lazy" decoding="async" src={uni.logo} alt={uni.name} className="h-16 w-16 object-contain" />
        ) : (
          <Building2 className="h-9 w-9 text-ink-500" />
        )}
      </div>
    </div>

    <h3 className="mt-6 font-outfit text-xl font-bold leading-snug text-white line-clamp-2">
      {uni.name}
    </h3>

    <span className="mt-4 inline-flex items-center rounded-full bg-accent-500/15 px-3.5 py-1.5 text-xs font-medium text-accent-200 ring-1 ring-accent-400/20">
      {formatLocation(uni.location, uni.country)}
    </span>
  </Link>
);

const SAUniversitiesSection = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        // Same fix as the homepage's UniversitySection: only the listing
        // fields the card renders, not the full ~7.4MB/546-doc default
        // response (most of that weight is deep-profile text this grid
        // never touches).
        const data = await getUniversities({ select: 'name,country,location,logo' });
        const list = Array.isArray(data) ? data : data.universities || data.data || [];
        if (!ignore) setUniversities(list.slice(0, 12));
      } catch (error) {
        console.error('Error fetching universities:', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useGSAP(
    () => {
      if (!gridRef.current?.children.length) return;
      gsap.set(gridRef.current.children, { opacity: 0, y: 24 });
      gsap.to(gridRef.current.children, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [universities.length] }
  );

  return (
    <section ref={sectionRef} className="relative bg-cream-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-outfit text-4xl font-bold text-ink-900 sm:text-5xl">
              Discover top-rated universities
            </h2>
            <p className="mt-3 text-ink-500">
              Start your success story at a renowned university with our guidance.
            </p>
          </div>

          <Link
            to="/study-abroad/universities"
            className="inline-flex shrink-0 items-center gap-3 rounded-full border border-ink-200 bg-white py-1.5 pl-5 pr-1.5 text-sm font-semibold text-ink-900 shadow-theme-sm transition-colors duration-200 hover:border-primary-300"
          >
            View All
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
              <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-[28px] bg-cream-200" />
            ))}
          </div>
        ) : universities.length === 0 ? (
          <p className="text-center text-sm text-ink-500">No universities available yet.</p>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {universities.map((uni, index) => (
              <UniversityCard key={uni._id} uni={uni} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SAUniversitiesSection;
