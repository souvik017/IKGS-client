export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://ikgssolution.com').replace(/\/$/, '');

export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Organization / LocalBusiness structured data. Only accurate, provided
 * information is emitted - empty fields are omitted rather than invented.
 */
export function buildOrganizationSchema(settings = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.businessName || 'IKGS Solution',
    description: settings.description || settings.tagline,
    url: settings.siteUrl || SITE_URL,
    areaServed: settings.serviceAreas?.length
      ? settings.serviceAreas.map((area) => ({ '@type': 'AdministrativeArea', name: area }))
      : undefined,
    address: settings.address
      ? { '@type': 'PostalAddress', streetAddress: settings.address, addressRegion: 'West Bengal', addressCountry: 'IN' }
      : undefined,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    sameAs: [settings.facebook, settings.instagram, settings.linkedin, settings.youtube].filter(Boolean),
    image: settings.logo ? [settings.logo] : undefined,
  };
  Object.keys(schema).forEach((key) => schema[key] === undefined && delete schema[key]);
  return schema;
}

export function buildServiceSchema(service, settings = {}) {
  if (!service) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.seoDescription || service.shortDescription || undefined,
    serviceType: service.title,
    provider: {
      '@type': 'LocalBusiness',
      name: settings.businessName || 'IKGS Solution',
      url: settings.siteUrl || SITE_URL,
    },
    areaServed: settings.serviceAreas?.length ? settings.serviceAreas : undefined,
    url: absoluteUrl(`/services/${service.slug}`),
  };
}

export function buildBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
