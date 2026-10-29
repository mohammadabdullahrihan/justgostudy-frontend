import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Star, ChevronRight } from 'lucide-react';
import { getTestimonials } from '../../services/studyService';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const getAvatarColor = (name) => {
  const colors = [
    { bg: 'bg-primary-100', text: 'text-primary-700' },
    { bg: 'bg-secondary-100', text: 'text-secondary-700' },
    { bg: 'bg-accent-100', text: 'text-accent-700' },
  ];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
};

const NameLine = ({ name }) => {
  const parts = (name || '').trim().split(' ');
  if (parts.length < 2) return name;
  const last = parts.pop();
  return (
    <>
      {parts.join(' ')} <span className="text-accent-600">{last}</span>
    </>
  );
};

const ReviewCard = ({ testimonial }) => (
  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-primary-700 to-primary-800 p-7 shadow-theme-md transition-shadow duration-300 hover:shadow-theme-lg">
    <div className="mb-4 flex gap-1">
      {Array.from({ length: testimonial.stars || 5 }, (_, i) => (
        <Star key={i} size={18} className="fill-accent-400 text-accent-400" />
      ))}
    </div>
    <p className="text-base leading-relaxed text-primary-100 line-clamp-5">
      &ldquo;{testimonial.quote}&rdquo;
    </p>
    <div className="mt-6 flex items-center gap-3 border-t border-dashed border-white/15 pt-5">
      {testimonial.image ? (
        <img loading="lazy" decoding="async"
          src={testimonial.image}
          alt={testimonial.name}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold ${getAvatarColor(testimonial.name).bg} ${getAvatarColor(testimonial.name).text}`}
        >
          {testimonial.name?.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
        <p className="text-sm text-primary-200">{testimonial.university}</p>
      </div>
    </div>
  </div>
);

const SpotlightCard = ({ testimonial }) => (
  <div className="flex h-full flex-col rounded-[28px] border-2 border-accent-400/60 bg-gradient-to-br from-primary-700 to-primary-800 p-3 shadow-theme-lg">
    <span className="mb-3 ml-1 mt-1 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-primary-200">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
      Student
    </span>
    <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-primary-900/40">
      {testimonial.image && (
        <img loading="lazy" decoding="async" src={testimonial.image} alt={testimonial.name} className="h-full w-full object-cover" />
      )}
    </div>
    <div className="px-2 py-4 text-center">
      <h4 className="font-outfit text-lg font-bold text-white">
        <NameLine name={testimonial.name} />
      </h4>
      <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-primary-200">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
        {testimonial.university}
      </p>
    </div>
  </div>
);

const ROTATE_INTERVAL = 5000;

const SATestimonialsSection = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const slotRefs = useRef([]);
  const hasMounted = useRef(false);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const response = await getTestimonials({ limit: 50, activeOnly: 'true' });
        const list = Array.isArray(response) ? response : response.testimonials || response.data || [];
        const normalized = list.map((t) => ({
          ...t,
          name: t.studentName || t.name,
          stars: t.stars || 5,
        }));
        // Keep the full fetched pool (up to the `limit: 12` above) — the
        // rotation below cycles a 5-slot window across all of them over
        // time. Truncating here to exactly 5 defeated that: with only 5
        // in state, every rotation just reshuffled the same 5 into
        // different slots, so no other testimonial ever got a turn.
        if (!ignore) setTestimonials(normalized);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
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
    { scope: sectionRef, dependencies: [testimonials.length] }
  );

  // Auto-rotate which testimonial holds the spotlight slot.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || testimonials.length < 5) return undefined;

    const timer = setInterval(() => {
      gsap.to(slotRefs.current, {
        opacity: 0,
        scale: 0.92,
        duration: 0.35,
        stagger: 0.05,
        ease: 'power2.in',
        onComplete: () => setRotation((r) => (r + 1) % testimonials.length),
      });
    }, ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  useGSAP(
    () => {
      if (!hasMounted.current) {
        hasMounted.current = true;
        return;
      }
      if (!slotRefs.current.length) return;

      gsap.fromTo(
        slotRefs.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out' }
      );

      const spotlightEl = slotRefs.current[2];
      if (spotlightEl) {
        gsap.fromTo(spotlightEl, { scale: 0.85 }, { scale: 1, duration: 0.7, ease: 'back.out(1.6)' });
      }
    },
    { scope: sectionRef, dependencies: [rotation] }
  );

  const order =
    testimonials.length >= 5
      ? Array.from({ length: 5 }, (_, i) => testimonials[(i + rotation) % testimonials.length])
      : testimonials;
  const [spotlight, ...rest] = order;
  const left = rest.slice(0, 2);
  const right = rest.slice(2, 4);

  return (
    <section ref={sectionRef} className="relative bg-cream-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <h2 className="font-outfit text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
            What our
            <br />
            students say
          </h2>

          <div className="flex flex-col items-start gap-4 sm:items-end">
            <p className="text-sm text-ink-500 sm:text-right">
              Read more student reviews and
              <br className="hidden sm:block" /> leave your own.
            </p>
            <Link
              to="/our-success"
              className="inline-flex shrink-0 items-center gap-3 rounded-full bg-accent-400 py-1.5 pl-5 pr-1.5 text-sm font-semibold text-ink-900 shadow-theme-sm transition-colors duration-200 hover:bg-accent-500"
            >
              See More Reviews
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-white">
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl bg-cream-200" />
            ))}
          </div>
        ) : !spotlight ? (
          <p className="text-center text-sm text-ink-500">No student reviews available yet.</p>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6">
              {left.map((t, i) => (
                <div key={t._id} ref={(el) => (slotRefs.current[i] = el)}>
                  <ReviewCard testimonial={t} />
                </div>
              ))}
            </div>

            <div ref={(el) => (slotRefs.current[2] = el)}>
              <SpotlightCard testimonial={spotlight} />
            </div>

            <div className="flex flex-col gap-6">
              {right.map((t, i) => (
                <div key={t._id} ref={(el) => (slotRefs.current[3 + i] = el)}>
                  <ReviewCard testimonial={t} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SATestimonialsSection;
