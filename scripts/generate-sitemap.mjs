/**
 * Generate sitemap.xml for the public site.
 *
 * Static routes are always included. Service detail routes are read from the
 * API at build time so the sitemap stays in sync with the catalogue; if the API
 * is unreachable the build still succeeds with the static routes only.
 */
import { mkdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SITE_URL = (process.env.VITE_SITE_URL || 'https://ikgssolution.com').replace(/\/$/, '');
const API_BASE = process.env.VITE_API_URL || process.env.VITE_PROXY_TARGET || 'http://localhost:5000';
const API_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE.replace(/\/$/, '')}/api`;

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'weekly' },
  { path: '/gallery', priority: '0.7', changefreq: 'monthly' },
  { path: '/book-now', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
];

async function fetchServices() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_URL}/public/services`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json?.data?.services || [];
  } catch (error) {
    console.warn(`! Could not fetch services for sitemap (${error.message}). Using static routes only.`);
    return [];
  }
}

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildSitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${route.path}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

async function main() {
  const services = await fetchServices();
  const serviceRoutes = services
    .filter((service) => service.slug)
    .map((service) => ({
      path: `/services/${service.slug}`,
      priority: '0.8',
      changefreq: 'monthly',
    }));

  const xml = buildSitemap([...STATIC_ROUTES, ...serviceRoutes]);

  const targets = [resolve(root, 'public', 'sitemap.xml'), resolve(root, 'dist', 'sitemap.xml')];
  for (const target of targets) {
    // eslint-disable-next-line no-await-in-loop
    await mkdir(dirname(target), { recursive: true }).catch(() => {});
    // eslint-disable-next-line no-await-in-loop
    await writeFile(target, xml, 'utf8').catch(() => {});
  }

  console.log(`+ sitemap.xml generated with ${STATIC_ROUTES.length + serviceRoutes.length} URLs`);
}

main().catch((error) => {
  console.error('Sitemap generation failed:', error);
  process.exit(1);
});
