/**
 * Static prerender pass.
 *
 * A Vite SPA renders its metadata with JavaScript, which some crawlers do not
 * execute. This script produces a real HTML file for every public route with
 * route-specific <title>, description, canonical, Open Graph tags, JSON-LD
 * structured data and semantic fallback content in the body.
 *
 * The React app still takes over when JavaScript runs, so behaviour is
 * unchanged for users. Routes are read from the API at build time with a
 * static fallback when the API is unavailable.
 */
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SITE_URL = (process.env.VITE_SITE_URL || 'https://ikgssolution.com').replace(/\/$/, '');
const API_BASE = process.env.VITE_API_URL || process.env.VITE_PROXY_TARGET || 'http://localhost:5000';
const API_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE.replace(/\/$/, '')}/api`;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

async function fetchJson(path) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_URL}${path}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn(`! Prerender: could not fetch ${path} (${error.message}).`);
    return null;
  }
}

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/book-now', label: 'Book Now' },
  { href: '/contact', label: 'Contact Us' },
];

function navHtml() {
  return `<nav>${NAV.map((l) => `<a href="${l.href}">${escapeHtml(l.label)}</a>`).join(' | ')}</nav>`;
}

function renderHead({ title, description, path, jsonLd }) {
  const canonical = `${SITE_URL}${path}`;
  const meta = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...jsonLd.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`),
  ].join('\n    ');
  return meta;
}

async function buildRoute(template, route) {
  let html = template;

  // Replace the <title> and the default description meta.
  html = html.replace(/<title>[\s\S]*?<\/title>/, renderHead(route).split('\n')[0]);
  html = html.replace(
    /<meta\s+name="description"[\s\S]*?\/>/,
    renderHead(route).split('\n')[1].trim()
  );
  // Remove the default canonical + robots (re-added below).
  html = html.replace(/\s*<link rel="canonical"[^>]*\/>/, '');
  html = html.replace(/\s*<meta name="robots"[^>]*\/>/, '');

  // Replace default Open Graph / Twitter tags (may span multiple lines).
  html = html.replace(/[ \t]*<meta\s+property="og:[^"]*"[\s\S]*?\/>/g, '');
  html = html.replace(/[ \t]*<meta\s+name="twitter:card"[\s\S]*?\/>/, '');

  const extraHead = [
    renderHead(route).split('\n').slice(2).join('\n    '),
  ].join('\n    ');

  html = html.replace('</head>', `    ${extraHead}\n  </head>`);

  // Replace the static fallback body content with route-specific content.
  const bodyContent = `<main>${route.body}</main>`;
  html = html.replace(/<main>[\s\S]*?<\/main>/, bodyContent);

  const outPath = route.path === '/' ? 'index.html' : `${route.path.replace(/^\//, '')}/index.html`;
  const target = resolve(root, 'dist', outPath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, 'utf8');
}

async function main() {
  const template = await readFile(resolve(root, 'dist', 'index.html'), 'utf8');

  const settingsJson = await fetchJson('/public/settings');
  const settings = settingsJson?.data?.settings || {};
  const businessName = settings.businessName || 'IKGS Solution';
  const areas = settings.serviceAreas || [];

  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessName,
    url: SITE_URL,
    description: settings.description || undefined,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    areaServed: areas.length ? areas : undefined,
  };

  const routes = [
    {
      path: '/',
      title: `${businessName} | Pest Control & Hygiene Services in West Bengal`,
      description:
        settings.description ||
        'Professional pest control and hygiene services across West Bengal - cockroach, termite, rodent, mosquito and commercial pest management.',
      jsonLd: [orgLd],
      body: `<h1>${escapeHtml(businessName)} - Pest Control &amp; Hygiene Services</h1>
        <p>Professional pest control for cockroaches, termites, rodents, mosquitoes and bed bugs, plus commercial pest management and sanitization across West Bengal.</p>
        ${navHtml()}`,
    },
    {
      path: '/about',
      title: `About Us | ${businessName}`,
      description: `Learn about ${businessName}, a West Bengal pest control and hygiene services company serving homes, offices and commercial premises.`,
      jsonLd: [orgLd],
      body: `<h1>About ${escapeHtml(businessName)}</h1>
        <p>A pest control and hygiene services company built around trained technicians and a documented treatment process.</p>
        ${navHtml()}`,
    },
    {
      path: '/services',
      title: `Pest Control Services in West Bengal | ${businessName}`,
      description:
        'Explore our pest control and hygiene services - cockroach, termite, rodent, mosquito and bed bug control, commercial pest management and sanitization.',
      jsonLd: [orgLd],
      body: `<h1>Pest Control Services</h1>
        <p>Targeted pest control and hygiene treatments for homes, offices and commercial premises.</p>
        ${navHtml()}`,
    },
    {
      path: '/gallery',
      title: `Gallery | ${businessName}`,
      description: `Photographs from ${businessName} field work - pest control, hygiene and sanitization services across West Bengal.`,
      jsonLd: [orgLd],
      body: `<h1>Gallery</h1>
        <p>Photographs from our field team, published from the admin panel.</p>
        ${navHtml()}`,
    },
    {
      path: '/book-now',
      title: `Book a Free Demo | ${businessName}`,
      description: 'Book a free pest control inspection and demo. Share your requirement and our team will confirm a convenient appointment.',
      jsonLd: [orgLd],
      body: `<h1>Book a Free Demo</h1>
        <p>Fill in your details and we will contact you to confirm a convenient appointment.</p>
        ${navHtml()}`,
    },
    {
      path: '/contact',
      title: `Contact Us | ${businessName}`,
      description: 'Get in touch with us for pest control and hygiene services in West Bengal. Call, email or send an enquiry online.',
      jsonLd: [orgLd],
      body: `<h1>Contact Us</h1>
        <p>Have a question or need a quote? Our team is ready to help.</p>
        ${navHtml()}`,
    },
  ];

  // Service detail routes from the live catalogue.
  const servicesJson = await fetchJson('/public/services');
  const services = servicesJson?.data?.services || [];
  services.forEach((service) => {
    if (!service.slug) return;
    routes.push({
      path: `/services/${service.slug}`,
      title: service.seoTitle || `${service.title} in West Bengal | ${businessName}`,
      description: service.seoDescription || service.shortDescription || `${service.title} service by ${businessName}.`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.shortDescription || undefined,
          provider: { '@type': 'LocalBusiness', name: businessName, url: SITE_URL },
          areaServed: areas.length ? areas : undefined,
          url: `${SITE_URL}/services/${service.slug}`,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
            { '@type': 'ListItem', position: 3, name: service.title, item: `${SITE_URL}/services/${service.slug}` },
          ],
        },
      ],
      body: `<h1>${escapeHtml(service.title)}</h1>
        <p>${escapeHtml(service.shortDescription || service.description || '')}</p>
        ${navHtml()}`,
    });
  });

  for (const route of routes) {
    // eslint-disable-next-line no-await-in-loop
    await buildRoute(template, route);
  }

  console.log(`+ Prerendered ${routes.length} public route(s)`);
}

main().catch((error) => {
  console.error('Prerender failed:', error);
  process.exit(1);
});
