import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Calendar, Newspaper } from 'lucide-react';
import resourceService from '../../services/resourceService';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const NewsCard = ({ item }) => {
  const to = item.slug ? `/study-abroad/blog/${item.slug}` : '/study-abroad/blog';

  return (
    <Link
      to={to}
      className="group flex items-stretch gap-5 rounded-[28px] border border-white/10 bg-primary-600 p-5 shadow-theme-sm transition-shadow duration-300 hover:shadow-theme-md"
    >
      <div className="flex flex-1 flex-col justify-center py-1">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-primary-100">
            <Newspaper size={13} />
            News
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-primary-100">
            <Calendar size={13} />
            {formatDate(item.publishedAt)}
          </span>
        </div>
        <h3 className="font-outfit text-lg font-bold leading-snug text-white line-clamp-2 transition-colors group-hover:text-accent-400">
          {item.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-primary-100 line-clamp-2">{item.content}</p>
      </div>

      <div className="hidden w-40 shrink-0 overflow-hidden rounded-2xl bg-primary-500 sm:block">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Newspaper className="h-8 w-8 text-primary-200" />
          </div>
        )}
      </div>
    </Link>
  );
};

const NewsSection = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await resourceService.getResources({ type: 'news', limit: 4 });
        const list = Array.isArray(data) ? data : data.resources || [];
        if (!ignore) setNews(list);
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load news.');
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
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [news] }
  );

  if (!loading && !error && news.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
            Stay Updated
          </span>
          <h2 className="mt-3 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
            News and updates
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-[28px] border border-ink-100 bg-primary-600" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-400">{error}</p>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {news.map((item) => (
              <NewsCard key={item._id} item={item} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/study-abroad/blog"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-8 py-3.5 font-semibold text-ink-600 transition-colors hover:border-accent-500 hover:text-accent-600"
          >
            View All News
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
