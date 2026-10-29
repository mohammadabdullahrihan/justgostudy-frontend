import { companyData } from '../constants/companyData';

// JSON-LD builders for page-specific structured data. Seo.jsx always injects
// the site-wide EducationalOrganization + WebSite schema; pages pass one or
// more of these via <Seo schema={...} /> for their own content type.

export const buildBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${companyData.siteUrl}${item.path}`,
  })),
});

export const buildCourseSchema = (course, university) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.name,
  description: course.description || `${course.name} at ${university?.name || 'a university'}, offered through ${companyData.name}.`,
  provider: {
    '@type': 'EducationalOrganization',
    name: university?.name || companyData.name,
    sameAs: university?.website || companyData.siteUrl,
  },
});

export const buildEducationalOrgSchema = (university) => ({
  '@context': 'https://schema.org',
  '@type': 'CollegeOrUniversity',
  name: university.name,
  description: university.description,
  url: university.website,
  image: university.coverImage || university.logo,
  address: {
    '@type': 'PostalAddress',
    addressLocality: university.location,
    addressCountry: university.country,
  },
});

// FAQPage schema — makes the accordion FAQs already rendered on Home,
// Success, Join and Contact eligible for Google's expandable FAQ rich
// result. `faqs` is whatever the page already fetched via faqService
// (objects with `question`/`answer`, or `q`/`a` as Contact.jsx names them).
// Returns null when there's nothing to mark up, so callers can render
// conditionally without their own length check.
export const buildFaqSchema = (faqs) => {
  const items = (faqs || [])
    .map((f) => ({ question: f.question ?? f.q, answer: f.answer ?? f.a }))
    .filter((f) => f.question && f.answer);
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
};

export const buildArticleSchema = (blog) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: blog.title,
  description: blog.excerpt || blog.metaDescription,
  image: blog.image || companyData.defaultOgImage,
  datePublished: blog.createdAt,
  dateModified: blog.updatedAt || blog.createdAt,
  author: {
    '@type': 'Organization',
    name: companyData.name,
  },
  publisher: {
    '@type': 'Organization',
    name: companyData.name,
    logo: {
      '@type': 'ImageObject',
      url: companyData.logoUrl,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${companyData.siteUrl}/study-abroad/blog/${blog.slug}`,
  },
});
