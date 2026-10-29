// Generates public sitemap.xml after the Vite build. Static routes are
// hardcoded (they mirror the public routes in src/App.jsx); dynamic routes
// are pulled from the live API. If the API is unreachable (e.g. building
// without a backend around), we still emit the static sitemap rather than
// failing the build — a partial sitemap beats none.
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://justgostudy.academy';
const API_URL = process.env.VITE_API_URL || 'https://just-trip-edu-backend.vercel.app/api';
const OUT_DIR = resolve(__dirname, '../dist');

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/about-us', priority: '0.7', changefreq: 'monthly' },
  // /courses and /universities intentionally omitted — same content as
  // /study-abroad/courses and /study-abroad/universities below, which are
  // the canonical versions (see Seo `canonical` prop in Courses.jsx /
  // Universities.jsx). Listing both here would reinforce the duplicate
  // content signal instead of resolving it.
  { path: '/join-us', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
  { path: '/events', priority: '0.6', changefreq: 'weekly' },
  { path: '/book-appointment', priority: '0.7', changefreq: 'monthly' },
  { path: '/student-resources', priority: '0.6', changefreq: 'weekly' },
  { path: '/our-success', priority: '0.6', changefreq: 'weekly' },
  { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/study-abroad', priority: '0.9', changefreq: 'daily' },
  { path: '/study-abroad/courses', priority: '0.9', changefreq: 'daily' },
  { path: '/study-abroad/universities', priority: '0.9', changefreq: 'daily' },
  { path: '/study-abroad/destinations', priority: '0.8', changefreq: 'weekly' },
  { path: '/study-abroad/cost-calculator', priority: '0.6', changefreq: 'monthly' },
  { path: '/study-abroad/tools', priority: '0.5', changefreq: 'monthly' },
  { path: '/study-abroad/tools/visa-tracker', priority: '0.4', changefreq: 'monthly' },
  { path: '/study-abroad/tools/roi-estimator', priority: '0.4', changefreq: 'monthly' },
  { path: '/study-abroad/tools/comparison', priority: '0.4', changefreq: 'monthly' },
  { path: '/study-abroad/tools/course-comparison', priority: '0.4', changefreq: 'monthly' },
  { path: '/study-abroad/tools/country-match-quiz', priority: '0.5', changefreq: 'monthly' },
  { path: '/study-abroad/tools/ielts-band-calculator', priority: '0.5', changefreq: 'monthly' },
  { path: '/study-abroad/blog', priority: '0.7', changefreq: 'daily' },
  { path: '/language-club', priority: '0.9', changefreq: 'daily' },
  { path: '/language-club/explore', priority: '0.8', changefreq: 'weekly' },
  { path: '/language-club/leaderboard', priority: '0.6', changefreq: 'daily' },
  { path: '/language-club/flashcards', priority: '0.6', changefreq: 'weekly' },
  { path: '/language-club/exam-prep', priority: '0.7', changefreq: 'weekly' },
  { path: '/language-club/exam-prep/ielts', priority: '0.6', changefreq: 'monthly' },
  { path: '/language-club/exam-prep/pte', priority: '0.6', changefreq: 'monthly' },
  { path: '/language-club/exam-prep/toefl', priority: '0.6', changefreq: 'monthly' },
  { path: '/language-club/exam-prep/gre-gmat', priority: '0.6', changefreq: 'monthly' },
  // /language-club/profile intentionally omitted — per-user page, noindex'd in Seo.
];

const fetchJson = async (path) => {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
};

const fetchDynamicRoutes = async () => {
  const routes = [];

  const [universities, courses, countryGuides, resources, languages] = await Promise.allSettled([
    fetchJson('/universities'),
    fetchJson('/courses'),
    fetchJson('/country-guides'),
    fetchJson('/resources'),
    fetchJson('/languages'),
  ]);

  if (universities.status === 'fulfilled') {
    const list = universities.value.universities || universities.value.data || universities.value || [];
    list.forEach((u) => u._id && routes.push({ path: `/study-abroad/university/${u._id}`, priority: '0.7', changefreq: 'weekly' }));
  }

  if (courses.status === 'fulfilled') {
    const list = courses.value.courses || courses.value.data || courses.value || [];
    list.forEach((c) => c._id && routes.push({ path: `/study-abroad/course/${c._id}`, priority: '0.7', changefreq: 'weekly' }));
  }

  if (countryGuides.status === 'fulfilled') {
    const list = countryGuides.value.countryGuides || countryGuides.value.data || countryGuides.value || [];
    list.forEach((g) => g.country && routes.push({ path: `/study-abroad/destination/${g.country}`, priority: '0.7', changefreq: 'weekly' }));
  }

  if (resources.status === 'fulfilled') {
    const list = resources.value.resources || resources.value.data || resources.value || [];
    list.forEach((r) => (r.slug || r._id) && routes.push({ path: `/study-abroad/blog/${r.slug || r._id}`, priority: '0.6', changefreq: 'monthly' }));
  }

  if (languages.status === 'fulfilled') {
    const list = languages.value.languages || languages.value.data || languages.value || [];
    list.forEach((l) => {
      if (!l.languageId) return;
      routes.push({ path: `/language-club/language/${l.languageId}`, priority: '0.7', changefreq: 'weekly' });
      routes.push({ path: `/language-club/learn/${l.languageId}`, priority: '0.6', changefreq: 'weekly' });
      routes.push({ path: `/language-club/flashcards/${l.languageId}`, priority: '0.5', changefreq: 'weekly' });
    });
  }

  return routes;
};

const buildXml = (routes) => {
  const today = new Date().toISOString().split('T')[0];
  const urls = routes
    .map(
      (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

const run = async () => {
  let dynamicRoutes = [];
  try {
    dynamicRoutes = await fetchDynamicRoutes();
  } catch (err) {
    console.warn('[sitemap] Could not fetch dynamic routes, emitting static-only sitemap:', err.message);
  }

  const xml = buildXml([...STATIC_ROUTES, ...dynamicRoutes]);

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(resolve(OUT_DIR, 'sitemap.xml'), xml);
  console.log(`[sitemap] Wrote ${STATIC_ROUTES.length + dynamicRoutes.length} URLs to dist/sitemap.xml`);
};

run();
