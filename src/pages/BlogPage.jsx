import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { Search, Calendar, ArrowRight, Globe, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import resourceService from '../services/resourceService';
import Seo from '../components/common/Seo';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const categories = ['All', 'Guide', 'News', 'Scholarship', 'Visa', 'Success Story', 'STEM'];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800';

// Page 1 peels off a featured hero card, so it holds one fewer grid card
// than later pages, every page still totals PAGE_SIZE items fetched.
const PAGE_SIZE = 10;

const scrollToTop = () => {
  if (window.lenis) {
    window.lenis.scrollTo(0);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Compact page list: always show first & last, the current page ±1, and use
// '…' gaps elsewhere so long paginations never overflow.
const getPageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push('start-gap');
  for (let p = left; p <= right; p += 1) pages.push(p);
  if (right < total - 1) pages.push('end-gap');
  pages.push(total);
  return pages;
};

const calculateReadTime = (content = '') => {
  const cleanContent = content.replace(/<[^>]*>/g, '');
  const words = cleanContent.split(/\s+/).length;
  return Math.ceil(words / 200);
};

const stripHtml = (html = '') => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Matches a URL ?category= value (e.g. "scholarships", "visa") to a pill in
// `categories` regardless of case or trailing plural "s".
const matchCategoryParam = (raw) => {
  if (!raw) return null;
  const normalize = (s) => s.toLowerCase().replace(/s$/, '');
  const target = normalize(raw);
  return categories.find((c) => normalize(c) === target || normalize(c).startsWith(target)) || null;
};

const BlogPage = () => {
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(() => matchCategoryParam(searchParams.get('category')) || 'All');
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);

  // Typing shouldn't fire a request per keystroke, wait for a short pause.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // A new search term or category makes the old page number meaningless.
  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch]);

  useEffect(() => {
    let ignore = false;
    const fetchResources = async () => {
      setLoading(true);
      try {
        const params = { page, limit: PAGE_SIZE };
        if (category !== 'All') params.type = category.toLowerCase();
        if (debouncedSearch) params.search = debouncedSearch;
        const resourcesRes = await resourceService.getResources(params);
        if (ignore) return;
        setResources(resourcesRes.resources || []);
        setTotalPages(resourcesRes.pages || 1);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        if (!ignore) setTotalPages(1);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchResources();
    return () => { ignore = true; };
  }, [category, debouncedSearch, page]);

  // Featured hero only makes sense as "the top story", so it's peeled off
  // page 1 only, later pages render every fetched item in the grid.
  const featured = page === 1 ? resources[0] : null;
  const rest = page === 1 ? resources.slice(1) : resources;

  // Heading reveal (runs once).
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });
      gsap.from(split.words, { opacity: 0, y: 24, stagger: 0.06, duration: 0.6, ease: 'power3.out' });
    },
    { scope: pageRef, dependencies: [] }
  );

  // Card stagger reveal, re-run when the result set changes.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const cards = gsap.utils.toArray('.blog-card', gridRef.current);
      if (!cards.length) return;
      gsap.set(cards, { opacity: 0, y: 50 });
      ScrollTrigger.batch(cards, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }),
      });
    },
    { scope: pageRef, dependencies: [resources.length, loading] }
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-white pb-20 pt-8 font-sans">
      <Seo
        title="Study Abroad Blog & Tips - Just Go Study"
        description="Guides, news, scholarships and visa tips for students planning to study abroad, read the latest articles from Just Go Study's education consultants."
      />
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        {/* Hero */}
        <div className="mb-12">
          <h1 ref={headingRef} className="mb-4 font-outfit text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl">
            Study Abroad <span className="text-primary-600">Blog</span>
          </h1>
          <p className="max-w-2xl text-base text-ink-500 sm:text-xl">
            Stay updated with the latest news, country guides, and scholarship opportunities.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="mb-12 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-cream-200 bg-cream-50 py-4 pl-12 pr-4 outline-none transition-all focus:border-primary-400 focus:shadow-focus-ring"
              />
            </div>
          </div>
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap rounded-full px-6 py-3 font-bold transition-all ${category === cat
                  ? 'bg-primary-600 text-white shadow-theme-md'
                  : 'bg-cream-50 text-ink-500 hover:bg-cream-100'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured post */}
        {!loading && featured && (
          <Link
            to={`/study-abroad/blog/${featured.slug || featured._id}`}
            className="group mb-14 grid overflow-hidden rounded-[2.5rem] border border-cream-100 bg-white shadow-theme-md transition-all hover:shadow-theme-lg lg:grid-cols-2"
          >
            <div className="relative h-72 overflow-hidden lg:h-auto">
              <img loading="lazy" decoding="async"
                src={featured.image || FALLBACK_IMG}
                alt={featured.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-5 top-5 rounded-full bg-accent-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-theme-md">
                Featured
              </span>
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="mb-4 flex items-center gap-4 text-sm font-bold text-ink-500">
                <span className="rounded-full bg-primary-50 px-3 py-1 uppercase tracking-wider text-primary-600">{featured.type}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{calculateReadTime(featured.content)} min read</span>
              </div>
              <h2 className="mb-4 font-outfit text-3xl font-bold leading-tight text-ink-900 transition-colors group-hover:text-primary-600">
                {featured.title}
              </h2>
              <p className="mb-6 line-clamp-3 leading-relaxed text-ink-600">
                {stripHtml(featured.summary || featured.content).substring(0, 220)}...
              </p>
              <div className="flex items-center gap-2 font-bold text-primary-600">
                Read Article
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </div>
            </div>
          </Link>
        )}

        {/* Blog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[450px] animate-pulse rounded-3xl bg-cream-50" />
            ))}
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((blog) => (
              <article
                key={blog._id}
                className="blog-card group overflow-hidden rounded-3xl border border-cream-100 bg-white transition-all hover:-translate-y-1.5 hover:shadow-theme-lg will-change-transform"
              >
                <Link to={`/study-abroad/blog/${blog.slug || blog._id}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img loading="lazy" decoding="async"
                      src={blog.image || FALLBACK_IMG}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute left-4 top-4">
                      <span className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                        {blog.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="mb-4 flex items-center gap-4 text-sm text-ink-500">
                      <div className="flex items-center gap-1 font-bold">
                        <Calendar className="h-4 w-4" />
                        {new Date(blog.createdAt).toLocaleDateString('en-GB')}
                      </div>
                      <div className="flex items-center gap-1 font-bold">
                        <Clock className="h-4 w-4" />
                        {calculateReadTime(blog.content)} min read
                      </div>
                    </div>
                    <h3 className="mb-4 line-clamp-2 text-xl font-bold leading-tight text-ink-900 transition-colors group-hover:text-primary-600">
                      {blog.title}
                    </h3>
                    <p className="mb-6 line-clamp-3 text-sm font-medium leading-relaxed text-ink-500">
                      {stripHtml(blog.summary || blog.content).substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-primary-600">
                      Read More
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {!loading && resources.length === 0 && (
          <div className="py-24 text-center">
            <Globe className="mx-auto mb-4 h-16 w-16 text-cream-200" />
            <h3 className="text-2xl font-bold text-ink-500">No articles found</h3>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-16 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); scrollToTop(); }}
              disabled={page === 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-100 bg-white text-ink-500 shadow-theme-sm transition-all hover:text-primary-600 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {getPageList(page, totalPages).map((p) =>
              typeof p === 'string' ? (
                <span key={p} className="flex h-11 w-8 items-end justify-center pb-3 text-ink-500">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => { setPage(p); scrollToTop(); }}
                  aria-current={p === page ? 'page' : undefined}
                  className={`h-11 w-11 rounded-full text-sm font-bold transition-all ${
                    p === page
                      ? 'bg-primary-600 text-white shadow-theme-md'
                      : 'border border-cream-100 bg-white text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); scrollToTop(); }}
              disabled={page === totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-100 bg-white text-ink-500 shadow-theme-sm transition-all hover:text-primary-600 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
