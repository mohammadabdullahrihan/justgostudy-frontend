import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { teamData } from '../../constants/teamData';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const team = teamData.map(({ name, designation, image }) => ({ name, role: designation, image }));

const TeamSection = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useGSAP(
    () => {
      gsap.set(gridRef.current.children, { opacity: 0, y: 30 });

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
    { scope: sectionRef }
  );

  const scrollByCard = (direction) => {
    const row = gridRef.current;
    if (!row) return;
    const card = row.firstElementChild;
    const amount = card ? card.getBoundingClientRect().width + 20 : row.clientWidth * 0.8;
    row.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-cream-50 py-24">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-block rounded-full bg-primary-500 px-4 py-1.5 text-xs font-semibold text-primary-100">
          Our Team
        </span>
        <h2 className="mt-4 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
          Meet Our Expert Team
        </h2>
        <p className="mt-4 text-ink-600">
          Decades of combined experience in international education, student counselling, and visa
          consultancy, all under one roof.
        </p>
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Previous team member"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors duration-200 hover:border-accent-400 hover:bg-primary-600 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Next team member"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-white transition-colors duration-200 hover:bg-primary-400"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div
        ref={gridRef}
        className="mt-8 flex gap-5 overflow-x-auto scroll-smooth px-[max(1rem,calc((100vw-80rem)/2+1rem))] pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {team.map((member) => (
          <div
            key={member.name}
            className="w-64 shrink-0 rounded-[28px] border border-white/10 bg-primary-600 p-4 shadow-theme-sm transition-shadow duration-300 hover:shadow-theme-md sm:w-72"
          >
            <div className="h-72 w-full overflow-hidden rounded-2xl sm:h-80">
              <img loading="lazy" decoding="async"
                src={member.image}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="mt-4 px-1 font-outfit text-lg font-bold text-white">{member.name}</h3>
            <p className="mt-0.5 px-1 pb-1 font-semibold text-accent-400">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
