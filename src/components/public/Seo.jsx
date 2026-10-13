import { Helmet } from 'react-helmet-async';
import { absoluteUrl } from '../../lib/seo';

/**
 * Per-route SEO metadata: title, description, canonical, Open Graph, Twitter
 * cards and optional JSON-LD structured data.
 */
export default function Seo({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  jsonLd = [],
  keywords,
}) {
  const fullTitle = title?.includes('IKGS') ? title : `${title} | IKGS Solution`;
  const canonical = absoluteUrl(path);
  const ogImage = image ? (image.startsWith('http') ? image : absoluteUrl(image)) : absoluteUrl('/og-image.svg');

  const schemas = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
