import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { LayoutGrid, Video, Newspaper, X, Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import resourceService from '../services/resourceService';
import Seo from '../components/common/Seo';
import sanitizeHtml from '../utils/sanitizeHtml';

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

const StudentResources = () => {
  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [error, setError] = useState(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const type = activeTab === 'all' ? 'vlog,news' : activeTab;
      const resourceData = await resourceService.getResources({ type, page, limit: PAGE_SIZE });
      setResources(resourceData.resources || []);
      setTotalPages(resourceData.pages || 1);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources.');
      setResources([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  /* hero heading + intro reveal */
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

      const split = new SplitType(headingRef.current, { types: 'words', tagName: 'span' });
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from(split.words, { y: 50, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.1)
        .from('.hero-sub', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, 0.5)
        .from('.filter-bar', { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out' }, 0.65);

      return () => split.revert();
    },
    { scope: pageRef }
  );

  /* card grid, GSAP stagger reveal on every tab switch / data load,
     plus icon-spin + overlay slide-up on hover (delegated) */
  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return undefined;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cards = gsap.utils.toArray(grid.querySelectorAll('.resource-card'));
      if (cards.length && !reduceMotion) {
        gsap.set(cards, { opacity: 0, y: 50 });
        ScrollTrigger.batch(cards, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              // release the inline transform so the CSS hover lift works
              onComplete: () => gsap.set(batch, { clearProps: 'transform' }),
            }),
        });
      }

      if (reduceMotion) return undefined;

      const onOver = (e) => {
        const card = e.target.closest?.('.resource-card');
        if (!card || card.contains(e.relatedTarget)) return;
        const icon = card.querySelector('.card-spin');
        const overlay = card.querySelector('.card-overlay');
        if (icon) gsap.to(icon, { rotation: '+=360', duration: 0.8, ease: 'power2.inOut' });
        if (overlay) gsap.to(overlay, { yPercent: 0, duration: 0.45, ease: 'power3.out' });
      };
      const onOut = (e) => {
        const card = e.target.closest?.('.resource-card');
        if (!card || card.contains(e.relatedTarget)) return;
        const overlay = card.querySelector('.card-overlay');
        if (overlay) gsap.to(overlay, { yPercent: 100, duration: 0.4, ease: 'power3.in' });
      };
      grid.addEventListener('mouseover', onOver);
      grid.addEventListener('mouseout', onOut);
      return () => {
        grid.removeEventListener('mouseover', onOver);
        grid.removeEventListener('mouseout', onOut);
      };
    },
    { scope: pageRef, dependencies: [resources, loading] }
  );

  const tabs = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'vlog', label: 'Vlogs', icon: Video },
    { id: 'news', label: 'News', icon: Newspaper },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-cream-50 pb-20">
      <Seo
        title="Study Abroad Requirements & Resources - Just Go Study"
        description="Video guides, articles and news to help you prepare for studying abroad, visa tips, IELTS prep, scholarships, and life-abroad advice from Just Go Study."
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pb-8 pt-6 md:pb-12 md:pt-10">
        <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-100 opacity-50 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary-50 opacity-50 blur-3xl" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 ref={headingRef} className="mb-4 font-outfit text-4xl font-extrabold tracking-tight text-ink-900 md:text-6xl">
            News &amp; <span className="text-primary-600">Vlogs</span>
          </h1>
          <p className="hero-sub mx-auto max-w-2xl text-lg leading-relaxed text-ink-500">
            Video guides, news, and updates to help you prepare for studying abroad.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div className="container relative z-20 mx-auto -mt-8 px-4">
        <div className="filter-bar mb-12 flex justify-center">
          <div className="relative inline-flex rounded-full border border-primary-50 bg-white p-1.5 shadow-theme-lg">
            {/* decorative SVG frame for the filter bar */}
            <svg
              className="pointer-events-none absolute -left-8 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-primary-200 sm:block"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`relative z-10 flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold transition-colors duration-300 ${
                  activeTab === tab.id ? 'text-white' : 'text-ink-500 hover:text-primary-600'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 -z-10 rounded-full bg-primary-600 shadow-theme-md"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-3xl border border-primary-50 bg-white p-4">
                  <div className="mb-4 aspect-video rounded-2xl bg-cream-100" />
                  <div className="mb-3 h-6 w-3/4 rounded-lg bg-cream-100" />
                  <div className="mb-2 h-4 w-full rounded-lg bg-cream-100" />
                  <div className="mb-6 h-4 w-2/3 rounded-lg bg-cream-100" />
                  <div className="h-10 w-full rounded-xl bg-cream-100" />
                </div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center"
            >
              <div className="inline-block rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-red-600">
                {error}
              </div>
            </motion.div>
          ) : resources.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-primary-50 bg-white py-20 text-center shadow-theme-sm"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-400">
                {activeTab === 'vlog' ? <Video size={32} /> : activeTab === 'news' ? <Newspaper size={32} /> : <LayoutGrid size={32} />}
              </div>
              <h3 className="mb-2 text-xl font-bold text-ink-900">
                No {activeTab === 'vlog' ? 'vlogs' : activeTab === 'news' ? 'news' : 'resources'} found
              </h3>
              <p className="text-ink-500">We&apos;ll be adding new content very soon!</p>
            </motion.div>
          ) : (
            <motion.div
              key={`content-${activeTab}`}
              ref={gridRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {resources.map((item) => (
                <div
                  key={item._id}
                  className="resource-card group flex h-full flex-col overflow-hidden rounded-3xl border border-primary-50 bg-white shadow-theme-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-theme-lg will-change-transform"
                >
                  <div className="relative aspect-video overflow-hidden bg-cream-100">
                    {item.image ? (
                      <img loading="lazy" decoding="async"
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary-200">
                        {item.type === 'vlog' ? <Video size={48} /> : <Newspaper size={48} />}
                      </div>
                    )}
                    <div className="absolute left-4 top-4">
                      <span className="rounded-full border border-white bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-600 shadow-theme-sm backdrop-blur-md">
                        {item.type}
                      </span>
                    </div>
                    {/* spinning type icon */}
                    <div className="card-spin absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-theme-md">
                      {item.type === 'vlog' ? <Video size={16} /> : <Newspaper size={16} />}
                    </div>
                    {/* slide-up details overlay */}
                    <div
                      className="card-overlay absolute inset-x-0 bottom-0 bg-primary-600/95 p-4 text-white backdrop-blur-sm"
                      style={{ transform: 'translateY(100%)' }}
                    >
                      <p className="line-clamp-2 text-xs leading-relaxed text-primary-100">
                        {item.content.replace(/<[^>]*>?/gm, '').substring(0, 120)}…
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-grow flex-col p-6">
                    <div className="mb-3 flex items-center gap-4 text-xs text-ink-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(item.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={14} />
                        {item.author?.name || 'Admin'}
                      </span>
                    </div>

                    <h3 className="mb-3 line-clamp-2 font-outfit text-xl font-bold text-ink-900 transition-colors group-hover:text-primary-600">
                      {item.title}
                    </h3>

                    <p className="mb-6 line-clamp-3 flex-grow text-sm leading-relaxed text-ink-500">
                      {item.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                    </p>

                    <button
                      onClick={() => setSelectedResource(item)}
                      className="group/btn flex w-full items-center justify-center gap-2 rounded-full bg-primary-50 py-3.5 font-bold text-primary-600 transition-all duration-300 hover:bg-primary-600 hover:text-white"
                    >
                      Read More
                      <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResource(null)}
              className="absolute inset-0 bg-primary-900/40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-cream-100 bg-white shadow-theme-lg"
            >
              <button
                onClick={() => setSelectedResource(null)}
                className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-cream-100 bg-white/80 text-ink-900 shadow-theme-md backdrop-blur-md transition-all hover:bg-white"
              >
                <X size={20} />
              </button>

              <div data-lenis-prevent className="custom-scrollbar overflow-y-auto p-0">
                <div className="relative aspect-[21/9] bg-cream-100">
                  {selectedResource.image ? (
                    <img loading="lazy" decoding="async"
                      src={selectedResource.image}
                      alt={selectedResource.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary-100">
                      {selectedResource.type === 'vlog' ? <Video size={80} /> : <Newspaper size={80} />}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <span className="mb-3 inline-block rounded-full bg-primary-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {selectedResource.type}
                    </span>
                    <h2 className="font-outfit text-2xl font-extrabold leading-tight md:text-4xl">
                      {selectedResource.title}
                    </h2>
                  </div>
                </div>

                <div className="p-8 md:p-12">
                  <div className="mb-8 flex flex-wrap items-center gap-6 border-b border-cream-100 pb-8 text-sm text-ink-500">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-ink-900">{selectedResource.author?.name || 'Admin'}</p>
                        <p className="text-xs">Published Author</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-ink-900">{new Date(selectedResource.publishedAt).toLocaleDateString()}</p>
                        <p className="text-xs">Published Date</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="prose prose-blue max-w-none text-lg leading-relaxed text-ink-600"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedResource.content) }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentResources;
