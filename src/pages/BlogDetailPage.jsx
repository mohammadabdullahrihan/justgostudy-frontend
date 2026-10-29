import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Share2, Link as LinkIcon, ChevronLeft, Globe, BookOpen, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import resourceService from '../services/resourceService';
import Seo from '../components/common/Seo';
import { buildArticleSchema, buildBreadcrumbSchema } from '../utils/seoSchemas';
import sanitizeHtml from '../utils/sanitizeHtml';
import ReadingProgressBar from '../components/study/ReadingProgressBar';
import { FacebookIcon, XIcon } from '../components/common/BrandIcons';
import LeadMagnetWidget from '../components/blog/LeadMagnetWidget';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState('');

  const stripHtml = (html = '') => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
  };

  const calculateReadTime = (content) => {
    if (!content) return 0;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  useEffect(() => {
    const fetchBlogDetail = async () => {
      setLoading(true);
      try {
        let blogData;
        try {
          // Try fetching by slug first
          blogData = await resourceService.getResourceBySlug(slug);
        } catch (err) {
          // If slug fails, try fetching by ID as fallback
          blogData = await resourceService.getResourceById(slug);
        }

        const allRes = await resourceService.getResources();
        setBlog(blogData);
        setRelated((allRes.resources || []).filter(r => r.slug !== slug && r._id !== slug).slice(0, 3));
      } catch (error) {
        console.error('Error loading article:', error);
        toast.error('Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const shareToX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleSidebarSearch = (e) => {
    e.preventDefault();
    if (!sidebarSearch.trim()) return;
    navigate(`/study-abroad/blog?search=${encodeURIComponent(sidebarSearch.trim())}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-ink-500 font-bold animate-pulse">Loading article...</p>
      </div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-20">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-ink-900 mb-4">Article Not Found</h2>
        <p className="text-ink-500 mb-8 font-medium">
          The blog post you&apos;re looking for might have been moved, deleted, or hasn&apos;t been published yet.
        </p>
        <Link
          to="/study-abroad/blog"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Blog
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <ReadingProgressBar />
      <div className="min-h-screen bg-white pt-8 pb-12">
        <Seo
          title={`${blog.title} - Just Go Study`}
          description={(blog.excerpt || stripHtml(blog.content)).slice(0, 160)}
          image={blog.image}
          type="article"
          schema={[
            buildArticleSchema(blog),
            buildBreadcrumbSchema([
              { name: 'Home', path: '/study-abroad' },
              { name: 'Blog', path: '/study-abroad/blog' },
              { name: blog.title, path: `/study-abroad/blog/${blog.slug}` },
            ]),
          ]}
        />
        <div className="max-w-7xl mx-auto px-4">
          {/* Back Button */}
          <Link
            to="/study-abroad/blog"
            className="group mb-8 inline-flex items-center gap-2 rounded-full bg-primary-50 py-2.5 pl-4 pr-5 text-sm font-bold text-primary-700 shadow-theme-sm transition-all duration-300 hover:bg-primary-100 hover:shadow-theme-md"
          >
            <ChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Blog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative h-[450px] rounded-3xl overflow-hidden mb-12 shadow-2xl">
                  <img
                    src={blog.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200'}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-6 py-2 bg-primary-600 text-white font-bold rounded-xl shadow-lg">
                      {blog.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 text-ink-500">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="font-bold">By Admin</span>
                  </div>
                  <div className="flex items-center gap-2 sm:border-l border-ink-200 sm:pl-6">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:border-l border-ink-200 sm:pl-6">
                    <Clock className="w-5 h-5" />
                    <span>{calculateReadTime(blog.content)} min read</span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ink-900 mb-8 leading-tight">
                  {blog.title}
                </h1>

                {/* Share Buttons */}
                <div className="flex flex-wrap gap-4 mb-12 py-6 border-y border-ink-100">
                  <span className="text-ink-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </span>
                  <button
                    onClick={shareToFacebook}
                    aria-label="Share on Facebook"
                    className="p-2.5 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all"
                  >
                    <FacebookIcon className="w-[18px] h-[18px]" />
                  </button>
                  <button
                    onClick={shareToX}
                    aria-label="Share on X"
                    className="p-2.5 bg-primary-50 text-primary-400 rounded-xl hover:bg-primary-400 hover:text-white transition-all"
                  >
                    <XIcon className="w-[18px] h-[18px]" />
                  </button>
                  <button
                    onClick={copyLink}
                    className="p-2.5 bg-ink-50 text-ink-600 rounded-xl hover:bg-ink-900 hover:text-white transition-all"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div
                  className="prose prose-lg max-w-none text-ink-600 leading-relaxed blog-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content) }}
                />
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-12">
              <div className="sticky top-32 space-y-12">
                {/* Free Guide (Lead Magnet) */}
                <LeadMagnetWidget />

                {/* Search */}
                <div className="bg-ink-50 p-8 rounded-3xl">
                  <h3 className="text-xl font-bold text-ink-900 mb-6">Search Articles</h3>
                  <form onSubmit={handleSidebarSearch} className="relative">
                    <input
                      type="text"
                      value={sidebarSearch}
                      onChange={(e) => setSidebarSearch(e.target.value)}
                      placeholder="Type keyword and press Enter..."
                      aria-label="Search articles"
                      className="w-full px-6 py-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                    />
                  </form>
                </div>

                {/* Related Posts */}
                <div>
                  <h3 className="text-2xl font-bold text-ink-900 mb-8 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary-600" />
                    Related Articles
                  </h3>
                  <div className="space-y-8">
                    {related.map(post => (
                      <Link
                        key={post._id}
                        to={`/study-abroad/blog/${post.slug}`}
                        className="flex gap-4 group"
                      >
                        <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm">
                          <img
                            src={post.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=200'}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            alt={post.title}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-ink-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
                            {post.title}
                          </h4>
                          <span className="text-xs font-bold text-primary-600 uppercase">{post.type}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-primary-600 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-primary-200">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4 leading-tight">Need Expert Advice?</h3>
                    <p className="text-primary-100 mb-8">Get free consultation from our study abroad experts.</p>
                    <Link
                      to="/study-abroad"
                      className="block w-full py-4 bg-white text-primary-600 text-center font-bold rounded-2xl hover:bg-primary-50 transition-all"
                    >
                      Contact Us
                    </Link>
                  </div>
                  <Globe className="absolute -bottom-8 -right-8 w-48 h-48 text-primary-500 opacity-20 rotate-12" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;
