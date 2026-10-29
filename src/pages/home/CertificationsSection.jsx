import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const certifications = [
  {
    name: 'ICEF Certified',
    desc: 'International education network',
    logo: 'https://qahighereducation.com/wp-content/uploads/2024/06/600x600-ICEF-IAS-badge.jpg',
    wide: false,
  },
  {
    name: 'AAIE Member',
    desc: 'Association of Accredited Intl Education',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBaMrUd5zM32XTM1IR7rRZNHgb5WZblpg4PA&s',
    wide: true,
  },
  {
    name: 'NAFSA Partner',
    desc: 'Global student exchange network',
    logo: 'https://thepienews.com/wp-content/uploads/2017/02/New_NAFSA_Logo_tagline_color.jpg',
    wide: true,
  },
  {
    name: 'PIER Certified',
    desc: 'Pathway to International Education',
    logo: 'https://www.globalstudyplan.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcertificate1.b29c329a.png&w=384&q=75&dpl=dpl_Hj5mYHiajx3iCN42nsn8X6tAbuJY',
    wide: false,
  },
  {
    name: 'British Council',
    desc: 'UK official education partner',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/BritishCouncil_Logo.png',
    wide: true,
  },
];

const CertificationCard = ({ logo, name, wide }) => (
  <div
    className={`group flex min-h-[128px] grow flex-col items-center justify-center gap-2 rounded-3xl bg-white p-6 shadow-theme-sm ring-1 ring-ink-100/70 transition-all duration-300 will-change-transform hover:-translate-y-1 hover:shadow-theme-lg hover:ring-primary-100 sm:min-h-[150px] sm:p-8 ${
      wide ? 'basis-[260px] sm:basis-[300px]' : 'basis-[150px] sm:basis-[170px]'
    }`}
  >
    <img
      src={logo}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
      className="max-h-14 w-auto max-w-full object-contain sm:max-h-16"
    />
    <span className="text-center text-sm font-semibold text-ink-700">{name}</span>
  </div>
);

const CertificationsSection = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useGSAP(
    () => {
      gsap.set(gridRef.current.children, { opacity: 0, y: 24, scale: 0.95 });
      gsap.to(gridRef.current.children, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power3.out',
        onComplete: () => gsap.set(gridRef.current.children, { clearProps: 'transform' }),
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-ink-50 p-6 shadow-theme-sm ring-1 ring-ink-100/60 sm:p-10 lg:p-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-ink-600 shadow-sm">
              Accreditations
            </span>
            <h2 className="mt-5 font-outfit text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
              Our Trusted <span className="text-primary-600">Accreditations</span>
            </h2>
            <p className="mt-4 text-ink-500">
              We are certified and recognized by leading international education bodies, so you can
              apply with confidence.
            </p>
          </div>

          <div ref={gridRef} className="flex flex-wrap justify-center gap-4 sm:gap-5">
            {certifications.map((cert) => (
              <CertificationCard key={cert.name} {...cert} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
