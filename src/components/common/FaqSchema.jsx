import { Helmet } from 'react-helmet-async';
import { buildFaqSchema } from '../../utils/seoSchemas';

/**
 * Drop inside any FAQ accordion section to make it eligible for Google's
 * expandable FAQ rich result. Lives separately from <Seo> because the FAQ
 * sections (Home/Success/Join/Contact) fetch their own `faqs` client-side,
 * independent of the page-level <Seo> call — react-helmet-async merges
 * multiple <Helmet> instances in the tree, so this just adds its
 * <script type="application/ld+json"> alongside whatever Seo.jsx already
 * rendered. Renders nothing while faqs haven't loaded yet.
 */
const FaqSchema = ({ faqs }) => {
  const schema = buildFaqSchema(faqs);
  if (!schema) return null;
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default FaqSchema;
