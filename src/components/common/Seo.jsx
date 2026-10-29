import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { companyData } from '../../constants/companyData';
import * as seoMetaService from '../../services/seoMetaService';
import { getCookieConsent, onCookieConsentChange } from '../../utils/privacyBanner';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION;

// Site-wide schema, included on every page so any URL Google crawls first
// carries organization/search identity, cheap, and required for the
// Knowledge Panel + sitelinks search box to be eligible at all.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: companyData.name,
  legalName: companyData.legalName,
  url: companyData.siteUrl,
  logo: companyData.logoUrl,
  image: companyData.defaultOgImage,
  telephone: companyData.phoneIntl,
  email: companyData.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: companyData.address,
    addressLocality: companyData.addressLocality,
    addressRegion: companyData.addressRegion,
    postalCode: companyData.postalCode,
    addressCountry: companyData.addressCountry,
  },
  sameAs: Object.values(companyData.socialLinks),
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: companyData.name,
  url: companyData.siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${companyData.siteUrl}/study-abroad/blog?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

/**
 * Drop this at the top of any public page. `title`/`description` are
 * required for it to be worth anything in search results; everything else
 * has a sane fallback. `schema` accepts one JSON-LD object or an array
 * (see src/utils/seoSchemas.js for builders) and is merged with the
 * site-wide Organization/WebSite schema.
 */
const Seo = ({
  title,
  description,
  image,
  canonical,
  type = 'website',
  noindex = false,
  schema,
}) => {
  const location = useLocation();
  const [override, setOverride] = useState(null);
  const [cookieConsent, setCookieConsentState] = useState(() => getCookieConsent());

  // The PrivacyBanner dispatches this on Accept/Decline so GA starts
  // loading immediately for whichever page happens to be mounted, no reload needed.
  useEffect(() => onCookieConsentChange(setCookieConsentState), []);

  // Admin-managed per-page overrides (SEO Meta admin tool) win over whatever
  // props this page passed in, when a match exists for the current path —
  // lets marketing tune title/description/OG image without a code change.
  useEffect(() => {
    let ignore = false;
    setOverride(null);
    seoMetaService.getSeoMetaByPage(location.pathname)
      .then((data) => { if (!ignore && data) setOverride(data); })
      .catch(() => {});
    return () => { ignore = true; };
  }, [location.pathname]);

  const url = canonical || override?.canonicalUrl || `${companyData.siteUrl}${location.pathname}`;
  const ogImage = image || override?.ogImage || companyData.defaultOgImage;
  const fullTitle = override?.title || title || `${companyData.name} - Premium Higher Education Consultancy`;
  const fullDescription = override?.description || description;

  const schemas = [
    organizationSchema,
    websiteSchema,
    ...(schema ? (Array.isArray(schema) ? schema : [schema]) : []),
  ];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {fullDescription && <meta name="description" content={fullDescription} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {fullDescription && <meta property="og:description" content={fullDescription} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={companyData.name} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {fullDescription && <meta name="twitter:description" content={fullDescription} />}
      <meta name="twitter:image" content={ogImage} />

      {GSC_VERIFICATION && <meta name="google-site-verification" content={GSC_VERIFICATION} />}

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}

      {GA_MEASUREMENT_ID && cookieConsent === 'accepted' && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
          <script>
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}');`}
          </script>
        </>
      )}
    </Helmet>
  );
};

export default Seo;
