import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import FlagIcon from '../../components/FlagIcon';
import { fadeInUp, staggerContainer, scaleIn } from './animations';

// Helper: generate a consistent color from a name string
const getAvatarColor = (name) => {
  const colors = [
    { bg: 'bg-primary-400', text: 'text-white' },
    { bg: 'bg-secondary-600', text: 'text-white' },
    { bg: 'bg-accent-500', text: 'text-ink-900' },
    { bg: 'bg-primary-500', text: 'text-primary-100' },
  ];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
};

const fallbackTestimonials = [
  {
    _id: '1',
    name: 'Tasnim Akter',
    country: 'UK',
    flagCode: 'gb',
    university: 'University of Manchester',
    quote:
      'I was overwhelmed by the UK application process, but the team held my hand through every single step, from crafting my personal statement to preparing for the visa interview.',
    stars: 5,
  },
  {
    _id: '2',
    name: 'Rakibul Islam',
    country: 'Canada',
    flagCode: 'ca',
    university: 'University of Toronto',
    quote: 'Got my Canada study permit on the first attempt. Smooth, transparent process from day one.',
    stars: 5,
  },
  {
    _id: '3',
    name: 'Nusrat Jahan',
    country: 'Australia',
    flagCode: 'au',
    university: 'UNSW Sydney',
    quote:
      'Just Go Study helped me secure both a part-time job and a scholarship in Australia. What seemed impossible became my reality.',
    stars: 5,
  },
  {
    _id: '4',
    name: 'Imran Hossain',
    country: 'Germany',
    flagCode: 'de',
    university: 'TU Berlin',
    quote:
      'I always dreamed of tuition-free education in Germany. The team helped me with blocked accounts, APS certificates, and applications.',
    stars: 4,
  },
  {
    _id: '5',
    name: 'Sumaiya Rahman',
    country: 'USA',
    flagCode: 'us',
    university: 'Arizona State University',
    quote:
      'The counselors here helped me craft such a strong profile that I received a full ride. The entire experience was smooth and transparent.',
    stars: 5,
  },
  {
    _id: '6',
    name: 'Farhan Ahmed',
    country: 'Ireland',
    flagCode: 'ie',
    university: 'University College Dublin',
    quote: 'A straightforward process from start to finish. Highly recommend for anyone applying to Ireland.',
    stars: 4,
  },
];

const TestimonialsSection = ({ testimonials, loading, error }) => {
  const allTestimonials = testimonials?.length > 0 ? testimonials : fallbackTestimonials;
  const displayTestimonials = allTestimonials;

  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-primary-500 px-4 py-1.5 text-xs font-semibold text-primary-100">
            Our Feedbacks
          </span>
          <h2 className="mt-4 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
            What Our Students Are Saying
          </h2>
          <p className="mt-4 text-ink-600">
            Hear directly from our students about how we helped them reach their dream universities.
          </p>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-primary-600" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="py-12 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {displayTestimonials.map((testimonial) => (
              <motion.div key={testimonial._id} variants={scaleIn}>
                <Link
                  to={`/our-success?country=${encodeURIComponent(testimonial.country || '')}#stories`}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-primary-600 p-5 transition-shadow duration-300 hover:shadow-theme-md"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="relative shrink-0">
                      {testimonial.image && !testimonial.image.includes('placehold.co') ? (
                        <img loading="lazy" decoding="async"
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ${getAvatarColor(testimonial.name).bg} ${getAvatarColor(testimonial.name).text}`}
                        >
                          {testimonial.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {testimonial.flagCode && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 overflow-hidden rounded-full ring-2 ring-primary-600">
                          <FlagIcon languageId={testimonial.flagCode} className="h-full w-full" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-white">{testimonial.name}</h4>
                      <p className="truncate text-xs text-primary-100">{testimonial.university}</p>
                    </div>
                  </div>

                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: testimonial.stars || 5 }, (_, i) => (
                      <Star key={i} size={14} className="fill-accent-400 text-accent-400" />
                    ))}
                  </div>

                  <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-primary-100">
                    &ldquo;{testimonial.quote || testimonial.content}&rdquo;
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-400 transition-colors group-hover:text-accent-300">
                    Read More
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
